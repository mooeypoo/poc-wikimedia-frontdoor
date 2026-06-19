import { computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { EXPLORER_MODULE_RAIL_INLINE_MAX_VISIBLE_ENDPOINTS } from '../../config/explorerModuleRail'

const CSS_VAR_INLINE_ENDPOINT_SCROLL_MAX_BLOCK_SIZE =
	'--explorer-module-rail-inline-endpoint-scroll-max-block-size'

const LAYOUT_SETTLE_MAX_ATTEMPTS = 8

/**
 * Caps the inline module rail endpoint scrollport to a fixed number of visible rows.
 *
 * When the endpoint count exceeds {@link EXPLORER_MODULE_RAIL_INLINE_MAX_VISIBLE_ENDPOINTS},
 * measures the block size of the first N rows and sets
 * `--explorer-module-rail-inline-endpoint-scroll-max-block-size` on the scrollport.
 *
 * @param scrollportElement - Endpoint list scroll container.
 * @param endpointListElement - `<nav>` wrapping endpoint `CdxMenuItem` rows.
 * @param isInlineLayout - Whether the rail is teleported below project controls.
 * @param isEndpointListExpanded - Whether the inline endpoint panel is open.
 * @param endpointCount - Number of endpoints in the selected module.
 * @returns `isInlineEndpointScrollCapped` — whether the inline endpoint scrollport is capped.
 */
export function useExplorerModuleRailInlineEndpointScrollCap(
	scrollportElement: Ref<HTMLElement | null>,
	endpointListElement: Ref<HTMLElement | null>,
	isInlineLayout: Ref<boolean>,
	isEndpointListExpanded: Ref<boolean>,
	endpointCount: Ref<number>
): {
	isInlineEndpointScrollCapped: ComputedRef<boolean>
} {
	let resizeObserver: ResizeObserver | null = null
	let layoutSettleAttemptId = 0
	let layoutSettleFrameId = 0

	const isInlineEndpointScrollCapped = computed( () => {
		return isInlineLayout.value
			&& isEndpointListExpanded.value
			&& endpointCount.value > EXPLORER_MODULE_RAIL_INLINE_MAX_VISIBLE_ENDPOINTS
	} )

	/**
	 * @returns Whether the inline endpoint list should be scroll-capped.
	 */
	function shouldCapInlineEndpointScroll(): boolean {
		return isInlineEndpointScrollCapped.value
	}

	/**
	 * Removes the inline endpoint scroll cap CSS custom property.
	 *
	 * @param scrollport - Endpoint scrollport element.
	 * @returns Nothing.
	 */
	function clearInlineEndpointScrollCap( scrollport: HTMLElement ): void {
		scrollport.style.removeProperty( CSS_VAR_INLINE_ENDPOINT_SCROLL_MAX_BLOCK_SIZE )
	}

	/**
	 * Measures the block size spanning the first N endpoint rows.
	 *
	 * @returns Measured cap in pixels, or `null` when capping does not apply.
	 */
	function measureInlineEndpointScrollCapPx(): number | null {
		const scrollport = scrollportElement.value
		const endpointList = endpointListElement.value

		if ( !scrollport || !endpointList || !shouldCapInlineEndpointScroll() ) {
			return null
		}

		const endpointRows = endpointList.querySelectorAll( '.cdx-menu-item' )

		if ( endpointRows.length <= EXPLORER_MODULE_RAIL_INLINE_MAX_VISIBLE_ENDPOINTS ) {
			return null
		}

		const firstRow = endpointRows[ 0 ] as HTMLElement
		const lastVisibleRow = endpointRows[
			EXPLORER_MODULE_RAIL_INLINE_MAX_VISIBLE_ENDPOINTS - 1
		] as HTMLElement
		const firstRowTopPx = firstRow.getBoundingClientRect().top
		const lastVisibleRowBottomPx = lastVisibleRow.getBoundingClientRect().bottom
		const capBlockSizePx = lastVisibleRowBottomPx - firstRowTopPx

		if ( capBlockSizePx <= 0 ) {
			return null
		}

		return Math.ceil( capBlockSizePx )
	}

	/**
	 * Writes or clears the scroll cap on the scrollport element.
	 *
	 * @returns Whether a cap was applied.
	 */
	function measureAndApplyInlineEndpointScrollCap(): boolean {
		const scrollport = scrollportElement.value

		if ( !scrollport ) {
			return false
		}

		const capBlockSizePx = measureInlineEndpointScrollCapPx()

		if ( capBlockSizePx === null ) {
			clearInlineEndpointScrollCap( scrollport )
			return false
		}

		scrollport.style.setProperty(
			CSS_VAR_INLINE_ENDPOINT_SCROLL_MAX_BLOCK_SIZE,
			`${ capBlockSizePx }px`
		)
		return true
	}

	/**
	 * Schedules a scroll cap measurement on the next animation frame.
	 *
	 * @returns Nothing.
	 */
	function refreshInlineEndpointScrollCap(): void {
		if ( typeof window === 'undefined' ) {
			return
		}

		requestAnimationFrame( () => {
			measureAndApplyInlineEndpointScrollCap()
		} )
	}

	/**
	 * Retries measurement until endpoint rows have finished layout.
	 *
	 * @param attempt - Current retry count.
	 * @returns Nothing.
	 */
	function runLayoutSettledRefreshAttempt( attempt: number ): void {
		const attemptId = layoutSettleAttemptId
		const didMeasure = measureAndApplyInlineEndpointScrollCap()

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
	 * Remeasures after DOM updates when the inline endpoint panel opens.
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

		window.addEventListener( 'resize', refreshInlineEndpointScrollCap, { passive: true } )

		resizeObserver = new ResizeObserver( () => {
			refreshInlineEndpointScrollCap()
		} )

		observeElement( scrollportElement.value )
		observeElement( endpointListElement.value )
		scheduleLayoutSettledRefresh()
	} )

	onUnmounted( () => {
		layoutSettleAttemptId += 1
		cancelAnimationFrame( layoutSettleFrameId )
		window.removeEventListener( 'resize', refreshInlineEndpointScrollCap )
		resizeObserver?.disconnect()

		if ( scrollportElement.value ) {
			clearInlineEndpointScrollCap( scrollportElement.value )
		}
	} )

	watch( scrollportElement, ( nextElement, previousElement ) => {
		unobserveElement( previousElement )
		observeElement( nextElement )
		scheduleLayoutSettledRefresh()
	} )

	watch( endpointListElement, ( nextElement, previousElement ) => {
		unobserveElement( previousElement )
		observeElement( nextElement )
		scheduleLayoutSettledRefresh()
	} )

	watch(
		[ isInlineLayout, isEndpointListExpanded, endpointCount ],
		() => {
			if ( shouldCapInlineEndpointScroll() ) {
				scheduleLayoutSettledRefresh()
				return
			}

			refreshInlineEndpointScrollCap()
		}
	)

	return {
		isInlineEndpointScrollCapped
	}
}
