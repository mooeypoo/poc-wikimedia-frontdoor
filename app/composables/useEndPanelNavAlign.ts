import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { getMinWidthMediaQuery } from '../utils/codexBreakpointMediaQuery'

/** CSS custom properties applied to end-column page navigation (module rail, future section nav). */
export interface EndPanelNavAlignStyle {
	'--frontdoor-end-panel-nav-flow-offset': string
	'--frontdoor-end-panel-nav-sticky-inset': string
	'--frontdoor-end-panel-nav-max-block-size'?: string
}

/**
 * Aligns end-column page navigation with a main-column anchor (e.g. explorer Scalar shell).
 *
 * Sets document-flow and sticky offsets so the nav aligns with the anchor top edge, and
 * optionally caps block size from a height-match element (`--frontdoor-end-panel-nav-max-block-size`).
 *
 * @param alignAnchorElement - Main-column element to align with (top edge).
 * @param endPanelElement - Mount node in the grid end column (e.g. `#explorer-end-panel`).
 * @param scrollClampElement - Optional element whose top edge caps the sticky inset while scrolling.
 * @param heightMatchElement - Optional element whose block size sets `--frontdoor-end-panel-nav-max-block-size`.
 * @returns Reactive inline styles and a manual refresh hook.
 */
export function useEndPanelNavAlign(
	alignAnchorElement: Ref<HTMLElement | null>,
	endPanelElement: Ref<HTMLElement | null>,
	scrollClampElement?: Ref<HTMLElement | null>,
	heightMatchElement?: Ref<HTMLElement | null>
): {
	endPanelNavStyle: ComputedRef<EndPanelNavAlignStyle | undefined>
	refreshEndPanelNavAlign: () => void
} {
	const flowOffsetPx = ref( 0 )
	const stickyInsetPx = ref( 0 )
	const defaultStickyInsetPx = ref( 0 )
	const matchBlockSizePx = ref( 0 )

	let animationFrameId = 0
	let mediaQueryList: MediaQueryList | null = null
	let resizeObserver: ResizeObserver | null = null

	/**
	 * @returns Whether the desktop end-column layout is active.
	 */
	function isDesktopEndPanelLayout(): boolean {
		if ( typeof window === 'undefined' ) {
			return false
		}

		return window.matchMedia( getMinWidthMediaQuery( 'desktop' ) ).matches
	}

	/**
	 * Measures margin offset: anchor top minus end-panel mount top (same row, different columns).
	 *
	 * @returns Nothing.
	 */
	function measureFlowOffset(): void {
		const alignAnchor = alignAnchorElement.value
		const endPanel = endPanelElement.value

		if ( !alignAnchor || !endPanel ) {
			flowOffsetPx.value = 0
			return
		}

		const anchorTopPx = alignAnchor.getBoundingClientRect().top
		const endPanelTopPx = endPanel.getBoundingClientRect().top
		flowOffsetPx.value = Math.max( 0, anchorTopPx - endPanelTopPx )
	}

	/**
	 * Caches viewport sticky inset from the anchor top (scroll position near top only).
	 *
	 * @returns Nothing.
	 */
	function measureDefaultStickyInset(): void {
		const alignAnchor = alignAnchorElement.value

		if ( !alignAnchor ) {
			defaultStickyInsetPx.value = 0
			return
		}

		if ( typeof window !== 'undefined' && window.scrollY > 64 ) {
			return
		}

		defaultStickyInsetPx.value = alignAnchor.getBoundingClientRect().top
	}

	/**
	 * Measures block size from the optional height-match element (e.g. Scalar shell).
	 *
	 * @returns Nothing.
	 */
	function measureMatchBlockSize(): void {
		const heightMatch = heightMatchElement?.value

		if ( !heightMatch ) {
			matchBlockSizePx.value = 0
			return
		}

		matchBlockSizePx.value = heightMatch.getBoundingClientRect().height
	}

	/**
	 * Recomputes sticky inset from cached anchor position and optional scroll clamp.
	 *
	 * @returns Nothing.
	 */
	function updateStickyInset(): void {
		if ( !isDesktopEndPanelLayout() ) {
			stickyInsetPx.value = 0
			flowOffsetPx.value = 0
			matchBlockSizePx.value = 0
			return
		}

		measureFlowOffset()
		measureMatchBlockSize()

		if ( defaultStickyInsetPx.value <= 0 ) {
			measureDefaultStickyInset()
		}

		const defaultTopPx = defaultStickyInsetPx.value
		if ( defaultTopPx <= 0 ) {
			stickyInsetPx.value = 0
			return
		}

		const clampTopPx = scrollClampElement?.value?.getBoundingClientRect().top
		const nextInsetPx = typeof clampTopPx === 'number' && !Number.isNaN( clampTopPx )
			? Math.min( defaultTopPx, clampTopPx )
			: defaultTopPx

		stickyInsetPx.value = Math.max( 0, nextInsetPx )
	}

	/**
	 * Schedules alignment measurements on the next animation frame.
	 *
	 * @returns Nothing.
	 */
	function refreshEndPanelNavAlign(): void {
		if ( typeof window === 'undefined' ) {
			return
		}

		cancelAnimationFrame( animationFrameId )
		animationFrameId = requestAnimationFrame( () => {
			updateStickyInset()
		} )
	}

	const endPanelNavStyle = computed( () => {
		if ( !isDesktopEndPanelLayout() ) {
			return undefined
		}

		if ( flowOffsetPx.value <= 0 && stickyInsetPx.value <= 0 && matchBlockSizePx.value <= 0 ) {
			return undefined
		}

		const style: EndPanelNavAlignStyle = {
			'--frontdoor-end-panel-nav-flow-offset': `${ flowOffsetPx.value }px`,
			'--frontdoor-end-panel-nav-sticky-inset': `${ stickyInsetPx.value }px`
		}

		if ( matchBlockSizePx.value > 0 ) {
			style[ '--frontdoor-end-panel-nav-max-block-size' ] = `${ matchBlockSizePx.value }px`
		}

		return style
	} )

	/**
	 * @param observedElement - Element to watch for size changes.
	 * @returns Nothing.
	 */
	function observeElement( observedElement: HTMLElement | null ): void {
		if ( observedElement && resizeObserver ) {
			resizeObserver.observe( observedElement )
		}
	}

	/**
	 * @param observedElement - Element to stop watching.
	 * @returns Nothing.
	 */
	function unobserveElement( observedElement: HTMLElement | null ): void {
		if ( observedElement && resizeObserver ) {
			resizeObserver.unobserve( observedElement )
		}
	}

	onMounted( () => {
		if ( typeof window === 'undefined' ) {
			return
		}

		mediaQueryList = window.matchMedia( getMinWidthMediaQuery( 'desktop' ) )
		mediaQueryList.addEventListener( 'change', refreshEndPanelNavAlign )
		window.addEventListener( 'scroll', refreshEndPanelNavAlign, { passive: true } )
		window.addEventListener( 'resize', refreshEndPanelNavAlign, { passive: true } )

		resizeObserver = new ResizeObserver( () => {
			defaultStickyInsetPx.value = 0
			measureDefaultStickyInset()
			refreshEndPanelNavAlign()
		} )

		observeElement( alignAnchorElement.value )
		observeElement( endPanelElement.value )
		observeElement( scrollClampElement?.value ?? null )
		observeElement( heightMatchElement?.value ?? null )

		requestAnimationFrame( () => {
			measureFlowOffset()
			measureDefaultStickyInset()
			refreshEndPanelNavAlign()
		} )
	} )

	onUnmounted( () => {
		cancelAnimationFrame( animationFrameId )
		mediaQueryList?.removeEventListener( 'change', refreshEndPanelNavAlign )
		window.removeEventListener( 'scroll', refreshEndPanelNavAlign )
		window.removeEventListener( 'resize', refreshEndPanelNavAlign )
		resizeObserver?.disconnect()
	} )

	watch( alignAnchorElement, ( nextElement, previousElement ) => {
		unobserveElement( previousElement )
		observeElement( nextElement )
		defaultStickyInsetPx.value = 0
		measureDefaultStickyInset()
		refreshEndPanelNavAlign()
	} )

	watch( endPanelElement, ( nextElement, previousElement ) => {
		unobserveElement( previousElement )
		observeElement( nextElement )
		refreshEndPanelNavAlign()
	} )

	watch( () => scrollClampElement?.value ?? null, ( nextElement, previousElement ) => {
		unobserveElement( previousElement )
		observeElement( nextElement )
		refreshEndPanelNavAlign()
	} )

	watch( () => heightMatchElement?.value ?? null, ( nextElement, previousElement ) => {
		unobserveElement( previousElement )
		observeElement( nextElement )
		refreshEndPanelNavAlign()
	} )

	return {
		endPanelNavStyle,
		refreshEndPanelNavAlign
	}
}
