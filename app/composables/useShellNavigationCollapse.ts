import type { Ref } from 'vue'
import {
	SHELL_NAV_COLLAPSE_PADDING_PX,
	SHELL_NAV_EXPAND_PADDING_PX
} from '../../config/shellNavigation'

/**
 * Tracks whether primary tabs and the start-column section menu should collapse
 * into the header hamburger + breadcrumb row.
 *
 * Uses one intrinsic-width measurement (`expandedNavContent.scrollWidth` on a
 * `max-content` inner wrapper) compared to the nav row `clientWidth`, with
 * hysteresis so collapse and expand do not share the same threshold:
 *
 * - **Collapse** (expanded): `scrollWidth + COLLAPSE_PADDING > clientWidth`
 * - **Expand** (collapsed): `scrollWidth + EXPAND_PADDING <= clientWidth`
 *
 * @param navRowRef - Root of `.frontdoor-shell__primary-nav-row`.
 * @param expandedNavContentRef - Intrinsic-width measure target (`.frontdoor-shell__primary-nav-expanded__content`).
 * @returns Reactive `isNavigationCollapsed` flag for template bindings.
 */
export function useShellNavigationCollapse(
	navRowRef: Ref<HTMLElement | null>,
	expandedNavContentRef: Ref<HTMLElement | null>
) {
	const isNavigationCollapsed = ref( false )

	let resizeObserver: ResizeObserver | null = null

	/**
	 * Returns the inline size the expanded nav row needs including trailing padding.
	 *
	 * @param trailingPaddingPx - Required space after the API Explorer link (px).
	 * @returns Required inline size in pixels, or `0` when elements are not mounted.
	 */
	function measureRequiredExpandedInlineSize( trailingPaddingPx: number ): number {
		const expandedNavContentElement = expandedNavContentRef.value

		if ( expandedNavContentElement === null ) {
			return 0
		}

		return expandedNavContentElement.scrollWidth + trailingPaddingPx
	}

	/**
	 * Returns the available inline size of the primary nav row track.
	 *
	 * @returns Nav row `clientWidth` in pixels, or `0` when not mounted.
	 */
	function measureNavRowInlineSize(): number {
		return navRowRef.value?.clientWidth ?? 0
	}

	/**
	 * Updates collapse state from the latest layout measurements.
	 */
	function updateCollapseState(): void {
		const navRowInlineSize = measureNavRowInlineSize()
		const expandedNavContentElement = expandedNavContentRef.value

		if ( navRowInlineSize === 0 || expandedNavContentElement === null ) {
			return
		}

		if ( isNavigationCollapsed.value ) {
			const requiredInlineSizeToExpand = measureRequiredExpandedInlineSize(
				SHELL_NAV_EXPAND_PADDING_PX
			)

			if ( requiredInlineSizeToExpand <= navRowInlineSize ) {
				isNavigationCollapsed.value = false
			}

			return
		}

		const requiredInlineSizeToRemainExpanded = measureRequiredExpandedInlineSize(
			SHELL_NAV_COLLAPSE_PADDING_PX
		)

		if ( requiredInlineSizeToRemainExpanded > navRowInlineSize ) {
			isNavigationCollapsed.value = true
		}
	}

	onMounted( () => {
		const navRowElement = navRowRef.value

		if ( navRowElement === null || typeof ResizeObserver === 'undefined' ) {
			return
		}

		resizeObserver = new ResizeObserver( () => {
			updateCollapseState()
		} )

		resizeObserver.observe( navRowElement )

		const expandedNavContentElement = expandedNavContentRef.value
		if ( expandedNavContentElement !== null ) {
			resizeObserver.observe( expandedNavContentElement )
		}

		updateCollapseState()
	} )

	onUnmounted( () => {
		resizeObserver?.disconnect()
		resizeObserver = null
	} )

	return {
		isNavigationCollapsed
	}
}
