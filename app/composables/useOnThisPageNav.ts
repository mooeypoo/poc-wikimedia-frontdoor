import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
	type ComputedRef,
	type Ref
} from 'vue'
import {
	ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX,
	ON_THIS_PAGE_NAV_MIN_H2_COUNT
} from '../../config/onThisPageNav'
import {
	collectOnThisPageHeadings,
	flattenOnThisPageHeadings,
	type OnThisPageHeading
} from '../utils/collectOnThisPageHeadings'
import { isOnThisPageNavRoute } from '../utils/isOnThisPageNavRoute'

/** Content-root binding accepted by {@link useOnThisPageNav}. */
type OnThisPageContentRoot = Ref<HTMLElement | null> | ComputedRef<HTMLElement | null>

/**
 * Builds on-this-page TOC state from rendered content headings + scroll position.
 *
 * Collects `h2` / nested `h3` from {@link contentRootElement}, shows the TOC when
 * the route is eligible and there are ≥ {@link ON_THIS_PAGE_NAV_MIN_H2_COUNT} `h2`s,
 * tracks the heading in view for progressive highlight, and exposes end-panel vs
 * header MenuButton layout from {@link ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX}.
 *
 * Side effects: MutationObserver on the content root; scroll listener on the body
 * scrollport; `matchMedia` listener for the layout breakpoint; `jumpToHeading`
 * temporarily suspends scrollspy (until `scrollend` or a timeout) and may call
 * `history.replaceState` for the hash. All listeners/timers cleaned up on unmount.
 *
 * @param contentRootElement - Rendered content root (`.fd-content-page` / page slot).
 * @param bodyScrollElement - Shell body scrollport (`.frontdoor-shell__body-scroll`).
 * @returns TOC visibility, tree, active id, layout flags, and jump helper.
 */
export function useOnThisPageNav(
	contentRootElement: OnThisPageContentRoot,
	bodyScrollElement: Ref<HTMLElement | null>
): {
	isOnThisPageNavVisible: ComputedRef<boolean>
	isEndPanelLayout: Ref<boolean>
	isHeaderMenuLayout: ComputedRef<boolean>
	onThisPageSections: Ref<OnThisPageHeading[]>
	activeHeadingId: Ref<string | null>
	jumpToHeading: ( headingId: string ) => void
	refreshOnThisPageHeadings: () => void
} {
	const route = useRoute()
	const onThisPageSections = ref<OnThisPageHeading[]>( [] )
	const activeHeadingId = ref<string | null>( null )
	const isEndPanelLayout = ref( false )

	let mutationObserver: MutationObserver | null = null
	let mediaQueryList: MediaQueryList | null = null
	let observedContentRoot: HTMLElement | null = null
	/** When set, scrollspy ignores scroll events until this timestamp (programmatic jump). */
	let scrollSpyResumeAtMs = 0
	let jumpScrollEndHandler: ( ( event: Event ) => void ) | null = null
	let jumpScrollResumeTimerId: ReturnType<typeof setTimeout> | null = null

	const isEligibleRoute = computed( () => isOnThisPageNavRoute( route.path ) )

	const isOnThisPageNavVisible = computed( () => {
		if ( !isEligibleRoute.value ) {
			return false
		}

		return onThisPageSections.value.length >= ON_THIS_PAGE_NAV_MIN_H2_COUNT
	} )

	const isHeaderMenuLayout = computed( () => {
		return isOnThisPageNavVisible.value && !isEndPanelLayout.value
	} )

	/**
	 * Re-scans the content root for `h2` / `h3` headings.
	 *
	 * @returns Nothing.
	 */
	function refreshOnThisPageHeadings(): void {
		if ( !isEligibleRoute.value ) {
			onThisPageSections.value = []
			activeHeadingId.value = null
			return
		}

		onThisPageSections.value = collectOnThisPageHeadings( contentRootElement.value )
		updateActiveHeadingFromScroll()
	}

	/**
	 * Clears programmatic-jump scrollspy suspension and related listeners.
	 *
	 * @returns Nothing.
	 */
	function clearJumpScrollSpySuspension(): void {
		const scrollRoot = bodyScrollElement.value

		if ( jumpScrollEndHandler && scrollRoot ) {
			scrollRoot.removeEventListener( 'scrollend', jumpScrollEndHandler )
		}

		jumpScrollEndHandler = null

		if ( jumpScrollResumeTimerId !== null ) {
			clearTimeout( jumpScrollResumeTimerId )
			jumpScrollResumeTimerId = null
		}

		scrollSpyResumeAtMs = 0
	}

	/**
	 * Updates {@link activeHeadingId} from the body scrollport position.
	 *
	 * @returns Nothing.
	 */
	function updateActiveHeadingFromScroll(): void {
		if ( Date.now() < scrollSpyResumeAtMs ) {
			return
		}

		const flatHeadings = flattenOnThisPageHeadings( onThisPageSections.value )

		if ( flatHeadings.length === 0 ) {
			activeHeadingId.value = null
			return
		}

		const scrollRoot = bodyScrollElement.value
		const contentRoot = contentRootElement.value

		if ( !scrollRoot || !contentRoot ) {
			activeHeadingId.value = flatHeadings[ 0 ]?.id ?? null
			return
		}

		const scrollRootTop = scrollRoot.getBoundingClientRect().top
		// Activate a heading once its top crosses a band below the scrollport top.
		const activationOffsetPx = 96
		let activeId = flatHeadings[ 0 ]?.id ?? null

		for ( const heading of flatHeadings ) {
			const headingElement = contentRoot.querySelector<HTMLElement>(
				`#${ CSS.escape( heading.id ) }`
			)

			if ( !headingElement ) {
				continue
			}

			const headingTop = headingElement.getBoundingClientRect().top - scrollRootTop

			if ( headingTop <= activationOffsetPx ) {
				activeId = heading.id
			} else {
				break
			}
		}

		// Near the scroll end, last sections often cannot reach the activation band —
		// still highlight the final heading so TOC selection matches the visible bottom.
		const distanceFromBottomPx =
			scrollRoot.scrollHeight - scrollRoot.scrollTop - scrollRoot.clientHeight

		if ( distanceFromBottomPx <= 8 ) {
			activeId = flatHeadings[ flatHeadings.length - 1 ]?.id ?? activeId
		}

		activeHeadingId.value = activeId
	}

	/**
	 * Scrolls the body scrollport so the target heading is in view and updates the hash.
	 *
	 * Suspends scrollspy until the smooth scroll settles so the clicked item stays
	 * active (and near-bottom targets are not overwritten mid-animation).
	 *
	 * @param headingId - Heading `id` to jump to.
	 * @returns Nothing.
	 */
	function jumpToHeading( headingId: string ): void {
		const contentRoot = contentRootElement.value
		const scrollRoot = bodyScrollElement.value
		const headingElement = contentRoot?.querySelector<HTMLElement>(
			`#${ CSS.escape( headingId ) }`
		)

		if ( !headingElement || !scrollRoot ) {
			return
		}

		const scrollDelta =
			headingElement.getBoundingClientRect().top -
			scrollRoot.getBoundingClientRect().top -
			16
		const nextScrollTop = Math.max( 0, scrollRoot.scrollTop + scrollDelta )

		clearJumpScrollSpySuspension()
		activeHeadingId.value = headingId
		// Keep the clicked item highlighted through the smooth-scroll animation.
		scrollSpyResumeAtMs = Date.now() + 1200

		jumpScrollEndHandler = () => {
			clearJumpScrollSpySuspension()
			updateActiveHeadingFromScroll()
		}
		scrollRoot.addEventListener( 'scrollend', jumpScrollEndHandler, { once: true } )
		// Fallback when `scrollend` is unavailable or does not fire.
		jumpScrollResumeTimerId = setTimeout( () => {
			if ( scrollSpyResumeAtMs === 0 ) {
				return
			}

			clearJumpScrollSpySuspension()
			updateActiveHeadingFromScroll()
		}, 1200 )

		scrollRoot.scrollTo( { top: nextScrollTop, behavior: 'smooth' } )

		if ( typeof history !== 'undefined' ) {
			history.replaceState( null, '', `#${ headingId }` )
		}
	}

	/**
	 * Syncs end-panel vs header layout from the 1280px breakpoint.
	 *
	 * @returns Nothing.
	 */
	function syncLayoutBreakpoint(): void {
		if ( typeof window === 'undefined' ) {
			isEndPanelLayout.value = false
			return
		}

		isEndPanelLayout.value = window.matchMedia(
			`(min-width: ${ ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX }px)`
		).matches
	}

	/**
	 * Attaches a MutationObserver to the current content root.
	 *
	 * @returns Nothing.
	 */
	function observeContentRoot(): void {
		mutationObserver?.disconnect()
		mutationObserver = null
		observedContentRoot = contentRootElement.value

		if ( !observedContentRoot || typeof MutationObserver === 'undefined' ) {
			return
		}

		mutationObserver = new MutationObserver( () => {
			refreshOnThisPageHeadings()
		} )
		mutationObserver.observe( observedContentRoot, {
			childList: true,
			subtree: true,
			characterData: true
		} )
	}

	/**
	 * Scroll listener bound to the body scrollport.
	 *
	 * @returns Nothing.
	 */
	function onBodyScroll(): void {
		updateActiveHeadingFromScroll()
	}

	watch(
		() => route.path,
		async () => {
			await nextTick()
			observeContentRoot()
			refreshOnThisPageHeadings()
		}
	)

	watch( contentRootElement, async () => {
		await nextTick()
		observeContentRoot()
		refreshOnThisPageHeadings()
	} )

	watch( bodyScrollElement, ( nextScrollRoot, previousScrollRoot ) => {
		previousScrollRoot?.removeEventListener( 'scroll', onBodyScroll )
		nextScrollRoot?.addEventListener( 'scroll', onBodyScroll, { passive: true } )
		updateActiveHeadingFromScroll()
	} )

	onMounted( () => {
		syncLayoutBreakpoint()

		if ( typeof window !== 'undefined' ) {
			mediaQueryList = window.matchMedia(
				`(min-width: ${ ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX }px)`
			)
			mediaQueryList.addEventListener( 'change', syncLayoutBreakpoint )
		}

		void nextTick( () => {
			observeContentRoot()
			refreshOnThisPageHeadings()
			bodyScrollElement.value?.addEventListener( 'scroll', onBodyScroll, {
				passive: true
			} )
		} )
	} )

	onBeforeUnmount( () => {
		mutationObserver?.disconnect()
		mutationObserver = null
		clearJumpScrollSpySuspension()
		bodyScrollElement.value?.removeEventListener( 'scroll', onBodyScroll )
		mediaQueryList?.removeEventListener( 'change', syncLayoutBreakpoint )
		mediaQueryList = null
	} )

	return {
		isOnThisPageNavVisible,
		isEndPanelLayout,
		isHeaderMenuLayout,
		onThisPageSections,
		activeHeadingId,
		jumpToHeading,
		refreshOnThisPageHeadings
	}
}
