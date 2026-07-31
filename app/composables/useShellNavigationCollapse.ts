import type { Ref } from 'vue'
import {
	SHELL_NAV_COLLAPSE_PADDING_PX,
	SHELL_NAV_DRAWER_EXPAND_DURATION_MS,
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
 * Also exposes `isNavDrawerExpanding`: true only while the start drawer
 * animates open after a **viewport** expand (hamburger → tabs). Landing /
 * `sidebar: false` route changes must stay instant — they share the same
 * 0 ↔ 281px grid track but must not reuse the drawer transition.
 *
 * @param navRowRef - Root of `.frontdoor-shell__primary-nav-row`.
 * @param expandedNavContentRef - Intrinsic-width measure target (`.frontdoor-shell__primary-nav-expanded__content`).
 * @returns Reactive collapse + drawer-expanding flags for template bindings.
 */
export function useShellNavigationCollapse(
	navRowRef: Ref<HTMLElement | null>,
	expandedNavContentRef: Ref<HTMLElement | null>
) {
	const isNavigationCollapsed = ref( false )
	const isNavDrawerExpanding = ref( false )

	let resizeObserver: ResizeObserver | null = null
	let navDrawerExpandTimeoutId: ReturnType<typeof setTimeout> | null = null

	/**
	 * Clears any pending drawer-expand class timeout.
	 */
	function clearNavDrawerExpandTimeout(): void {
		if ( navDrawerExpandTimeoutId === null ) {
			return
		}

		clearTimeout( navDrawerExpandTimeoutId )
		navDrawerExpandTimeoutId = null
	}

	/**
	 * Returns the inline size the expanded nav row needs including trailing padding.
	 *
	 * @param trailingPaddingPx - Required trailing space after the expanded tab list (px).
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

	/*
	 * Enable drawer CSS transitions only for collapsed → expanded (viewport
	 * widen / hamburger dismiss). Leaving landing (`sidebar: false`) also
	 * grows the start track 0 → 281px but must not animate — see
	 * shell-start-nav-reveal.css.
	 */
	watch( isNavigationCollapsed, ( isCollapsed, wasCollapsed ) => {
		clearNavDrawerExpandTimeout()

		if ( wasCollapsed === true && isCollapsed === false ) {
			isNavDrawerExpanding.value = true
			navDrawerExpandTimeoutId = setTimeout( () => {
				isNavDrawerExpanding.value = false
				navDrawerExpandTimeoutId = null
			}, SHELL_NAV_DRAWER_EXPAND_DURATION_MS )
			return
		}

		isNavDrawerExpanding.value = false
	} )

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
		clearNavDrawerExpandTimeout()
	} )

	return {
		isNavigationCollapsed,
		isNavDrawerExpanding
	}
}
