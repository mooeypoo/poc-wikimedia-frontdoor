import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { getMinWidthMediaQuery } from '../utils/codexBreakpointMediaQuery'

/** CSS custom properties applied to end-column page navigation (module rail, future section nav). */
export interface EndPanelNavAlignStyle {
	'--frontdoor-end-panel-nav-flow-offset': string
	'--frontdoor-end-panel-nav-sticky-inset': string
	'--frontdoor-end-panel-nav-max-block-size'?: string
}

const CSS_VAR_FLOW_OFFSET = '--frontdoor-end-panel-nav-flow-offset'
const CSS_VAR_STICKY_INSET = '--frontdoor-end-panel-nav-sticky-inset'
const CSS_VAR_MAX_BLOCK_SIZE = '--frontdoor-end-panel-nav-max-block-size'

const LAYOUT_SETTLE_MAX_ATTEMPTS = 12

/**
 * Aligns end-column page navigation with a main-column anchor (e.g. explorer Scalar shell).
 *
 * Sets CSS custom properties on the end-panel mount node so teleported children inherit
 * alignment tokens. Remeasures after breakpoint transitions once the end column is visible.
 *
 * @param alignAnchorElement - Main-column element to align with (top edge).
 * @param endPanelElement - Mount node in the grid end column (e.g. `#explorer-end-panel`).
 * @param scrollClampElement - Optional element whose top edge caps the sticky inset while scrolling.
 * @param heightMatchElement - Optional element whose block size sets `--frontdoor-end-panel-nav-max-block-size`.
 * @returns Manual refresh hooks for layout changes and Teleport moves.
 */
export function useEndPanelNavAlign(
	alignAnchorElement: Ref<HTMLElement | null>,
	endPanelElement: Ref<HTMLElement | null>,
	scrollClampElement?: Ref<HTMLElement | null>,
	heightMatchElement?: Ref<HTMLElement | null>
): {
	refreshEndPanelNavAlign: () => void
	scheduleLayoutSettledRefresh: () => void
} {
	const flowOffsetPx = ref( 0 )
	const stickyInsetPx = ref( 0 )
	const matchBlockSizePx = ref( 0 )

	let mediaQueryList: MediaQueryList | null = null
	let bodyScrollElement: HTMLElement | null = null
	let layoutSettleAttemptId = 0
	let layoutSettleFrameId = 0

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
	 * @param element - Element to test for layout participation.
	 * @returns Whether the element is painted and has a box (not `display: none`).
	 */
	function isElementLayoutVisible( element: HTMLElement ): boolean {
		return element.getClientRects().length > 0
	}

	/**
	 * Removes alignment CSS custom properties from the end-panel mount node.
	 *
	 * @param endPanel - End-column mount element.
	 * @returns Nothing.
	 */
	function clearEndPanelNavStyle( endPanel: HTMLElement ): void {
		endPanel.style.removeProperty( CSS_VAR_FLOW_OFFSET )
		endPanel.style.removeProperty( CSS_VAR_STICKY_INSET )
		endPanel.style.removeProperty( CSS_VAR_MAX_BLOCK_SIZE )
	}

	/**
	 * Writes measured alignment tokens to the end-panel mount for child inheritance.
	 *
	 * @param endPanel - End-column mount element.
	 * @returns Nothing.
	 */
	function applyEndPanelNavStyle( endPanel: HTMLElement ): void {
		if ( !isDesktopEndPanelLayout() ) {
			clearEndPanelNavStyle( endPanel )
			return
		}

		endPanel.style.setProperty( CSS_VAR_FLOW_OFFSET, `${ flowOffsetPx.value }px` )
		endPanel.style.setProperty( CSS_VAR_STICKY_INSET, `${ stickyInsetPx.value }px` )

		if ( matchBlockSizePx.value > 0 ) {
			endPanel.style.setProperty( CSS_VAR_MAX_BLOCK_SIZE, `${ matchBlockSizePx.value }px` )
		} else {
			endPanel.style.removeProperty( CSS_VAR_MAX_BLOCK_SIZE )
		}
	}

	/**
	 * Measures margin offset: anchor top minus end-panel mount top (same row, different columns).
	 *
	 * @returns Whether a flow offset was measured.
	 */
	function measureFlowOffset(): boolean {
		const alignAnchor = alignAnchorElement.value
		const endPanel = endPanelElement.value

		if ( !alignAnchor || !endPanel || !isElementLayoutVisible( endPanel ) ) {
			return false
		}

		const anchorTopPx = alignAnchor.getBoundingClientRect().top
		const endPanelTopPx = endPanel.getBoundingClientRect().top
		flowOffsetPx.value = Math.max( 0, anchorTopPx - endPanelTopPx )
		return true
	}

	/**
	 * Caches viewport sticky inset from the anchor top.
	 *
	 * @returns Whether a sticky inset was measured.
	 */
	function measureDefaultStickyInset(): boolean {
		const alignAnchor = alignAnchorElement.value

		if ( !alignAnchor || !isElementLayoutVisible( alignAnchor ) ) {
			return false
		}

		stickyInsetPx.value = alignAnchor.getBoundingClientRect().top
		return stickyInsetPx.value > 0
	}

	/**
	 * Measures block size from the optional height-match element (e.g. Scalar shell).
	 *
	 * @returns Nothing.
	 */
	function measureMatchBlockSize(): void {
		const heightMatch = heightMatchElement?.value

		if ( !heightMatch || !isElementLayoutVisible( heightMatch ) ) {
			matchBlockSizePx.value = 0
			return
		}

		matchBlockSizePx.value = heightMatch.getBoundingClientRect().height
	}

	/**
	 * Recomputes sticky inset from the anchor position and optional scroll clamp.
	 *
	 * @returns Nothing.
	 */
	function updateStickyInsetFromAnchor(): void {
		const alignAnchor = alignAnchorElement.value

		if ( !alignAnchor ) {
			stickyInsetPx.value = 0
			return
		}

		const defaultTopPx = alignAnchor.getBoundingClientRect().top
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
	 * Runs a full alignment measurement pass and applies tokens to the end-panel mount.
	 *
	 * @returns Whether all required measurements succeeded.
	 */
	function updateEndPanelNavAlign(): boolean {
		const endPanel = endPanelElement.value

		if ( !isDesktopEndPanelLayout() ) {
			flowOffsetPx.value = 0
			stickyInsetPx.value = 0
			matchBlockSizePx.value = 0

			if ( endPanel ) {
				clearEndPanelNavStyle( endPanel )
			}

			return false
		}

		if ( !endPanel || !isElementLayoutVisible( endPanel ) ) {
			return false
		}

		const hasFlowOffset = measureFlowOffset()
		measureMatchBlockSize()
		const hasStickyInset = measureDefaultStickyInset()

		if ( hasStickyInset ) {
			updateStickyInsetFromAnchor()
		}

		if ( !hasFlowOffset && !hasStickyInset && matchBlockSizePx.value <= 0 ) {
			return false
		}

		applyEndPanelNavStyle( endPanel )
		return hasFlowOffset
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

		requestAnimationFrame( () => {
			updateEndPanelNavAlign()
		} )
	}

	/**
	 * Retries alignment until the end column is visible and anchor positions have settled.
	 *
	 * @param attempt - Current retry count.
	 * @returns Nothing.
	 */
	function runLayoutSettledRefreshAttempt( attempt: number ): void {
		const attemptId = layoutSettleAttemptId
		const didMeasure = updateEndPanelNavAlign()

		if ( didMeasure || attempt >= LAYOUT_SETTLE_MAX_ATTEMPTS ) {
			return
		}

		if ( attemptId !== layoutSettleAttemptId ) {
			return
		}

		layoutSettleFrameId = requestAnimationFrame( () => {
			runLayoutSettledRefreshAttempt( attempt + 1 )
		} )
	}

	/**
	 * Remeasures after the end column and Teleport target have finished reflowing.
	 *
	 * @returns Nothing.
	 */
	function scheduleLayoutSettledRefresh(): void {
		if ( typeof window === 'undefined' ) {
			return
		}

		layoutSettleAttemptId += 1
		cancelAnimationFrame( layoutSettleFrameId )

		void nextTick( () => {
			requestAnimationFrame( () => {
				runLayoutSettledRefreshAttempt( 0 )
			} )
		} )
	}

	let resizeObserver: ResizeObserver | null = null

	/**
	 * Handles desktop breakpoint entry and exit for end-column alignment.
	 *
	 * @param mediaQueryChangeEvent - Media query change event from `matchMedia`.
	 * @returns Nothing.
	 */
	function onDesktopLayoutMediaQueryChange( mediaQueryChangeEvent: MediaQueryListEvent ): void {
		if ( mediaQueryChangeEvent.matches ) {
			scheduleLayoutSettledRefresh()
			return
		}

		updateEndPanelNavAlign()
	}

	/**
	 * Realigns when the shell body scrollport or viewport size changes.
	 *
	 * @returns Nothing.
	 */
	function onShellViewportResize(): void {
		if ( isDesktopEndPanelLayout() ) {
			scheduleLayoutSettledRefresh()
			return
		}

		updateEndPanelNavAlign()
	}

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

		bodyScrollElement = document.querySelector( '.frontdoor-shell__body-scroll' )

		mediaQueryList = window.matchMedia( getMinWidthMediaQuery( 'desktop' ) )
		mediaQueryList.addEventListener( 'change', onDesktopLayoutMediaQueryChange )

		bodyScrollElement?.addEventListener( 'scroll', refreshEndPanelNavAlign, { passive: true } )
		window.addEventListener( 'resize', onShellViewportResize, { passive: true } )

		resizeObserver = new ResizeObserver( () => {
			if ( isDesktopEndPanelLayout() ) {
				scheduleLayoutSettledRefresh()
				return
			}

			updateEndPanelNavAlign()
		} )

		observeElement( alignAnchorElement.value )
		observeElement( endPanelElement.value )
		observeElement( scrollClampElement?.value ?? null )
		observeElement( heightMatchElement?.value ?? null )

		scheduleLayoutSettledRefresh()
	} )

	onUnmounted( () => {
		layoutSettleAttemptId += 1
		cancelAnimationFrame( layoutSettleFrameId )
		mediaQueryList?.removeEventListener( 'change', onDesktopLayoutMediaQueryChange )
		bodyScrollElement?.removeEventListener( 'scroll', refreshEndPanelNavAlign )
		window.removeEventListener( 'resize', onShellViewportResize )
		resizeObserver?.disconnect()

		if ( endPanelElement.value ) {
			clearEndPanelNavStyle( endPanelElement.value )
		}
	} )

	watch( alignAnchorElement, ( nextElement, previousElement ) => {
		unobserveElement( previousElement )
		observeElement( nextElement )
		scheduleLayoutSettledRefresh()
	} )

	watch( endPanelElement, ( nextElement, previousElement ) => {
		unobserveElement( previousElement )
		observeElement( nextElement )
		scheduleLayoutSettledRefresh()
	} )

	watch( () => scrollClampElement?.value ?? null, ( nextElement, previousElement ) => {
		unobserveElement( previousElement )
		observeElement( nextElement )
		refreshEndPanelNavAlign()
	} )

	watch( () => heightMatchElement?.value ?? null, ( nextElement, previousElement ) => {
		unobserveElement( previousElement )
		observeElement( nextElement )
		scheduleLayoutSettledRefresh()
	} )

	return {
		refreshEndPanelNavAlign,
		scheduleLayoutSettledRefresh
	}
}
