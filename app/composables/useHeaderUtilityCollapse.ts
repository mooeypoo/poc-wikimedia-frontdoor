import type { Ref } from 'vue'
import { HEADER_SEARCH_INPUT_MIN_INLINE_SIZE_PX } from '../../config/headerChrome'

interface HeaderUtilityCollapseElements {
	actionsRootRef: Ref<HTMLElement | null>
	searchWrapperRef: Ref<HTMLElement | null>
	settingsControlRef: Ref<HTMLElement | null>
	languageControlRef: Ref<HTMLElement | null>
	sessionControlRef: Ref<HTMLElement | null>
}

/**
 * Tracks whether the header utility row should render in compact mode.
 *
 * Observes the allocated inline size of the utility actions flex track and the
 * intrinsic widths of its non-search controls. The expanded minimum is measured
 * from those controls, their computed gaps, and the configured 256px search
 * minimum. This keeps translated labels and authenticated usernames from making a
 * fixed estimate stale. Once that minimum no longer fits, search collapses to an
 * icon button and settings / session actions move into a menu.
 *
 * The last expanded measurement is retained while compact controls are shown,
 * because `v-show` removes the expanded settings and session controls from layout.
 * Resize observers are disconnected when the consuming component unmounts.
 *
 * @param elements - Template refs for the utility root and expanded controls.
 * @returns An object containing the reactive `isUtilityCollapsed` template flag.
 */
export function useHeaderUtilityCollapse( elements: HeaderUtilityCollapseElements ) {
	const isUtilityCollapsed = ref( false )

	let resizeObserver: ResizeObserver | null = null
	let expandedMinimumInlineSize = HEADER_SEARCH_INPUT_MIN_INLINE_SIZE_PX

	/**
	 * Parses a computed CSS pixel value, falling back to zero for non-pixel values.
	 *
	 * @param value - Computed CSS value.
	 * @returns Numeric pixel value or zero.
	 */
	function parsePixelValue( value: string ): number {
		const parsedValue = Number.parseFloat( value )
		return Number.isFinite( parsedValue ) ? parsedValue : 0
	}

	/**
	 * Measures the minimum inline size of the expanded utility controls.
	 *
	 * @returns Minimum expanded width in pixels, or null while controls are hidden.
	 */
	function measureExpandedMinimumInlineSize(): number | null {
		const actionsElement = elements.actionsRootRef.value
		const searchWrapperElement = elements.searchWrapperRef.value
		const settingsControlElement = elements.settingsControlRef.value
		const languageControlElement = elements.languageControlRef.value
		const sessionControlElement = elements.sessionControlRef.value

		if (
			actionsElement === null
			|| searchWrapperElement === null
			|| settingsControlElement === null
			|| languageControlElement === null
			|| sessionControlElement === null
		) {
			return null
		}

		const settingsInlineSize = settingsControlElement.getBoundingClientRect().width
		const languageInlineSize = languageControlElement.getBoundingClientRect().width
		const sessionInlineSize = sessionControlElement.getBoundingClientRect().width

		// `v-show` makes expanded-only controls zero-width while compact mode is active.
		if ( settingsInlineSize === 0 || sessionInlineSize === 0 ) {
			return null
		}

		const actionsStyle = getComputedStyle( actionsElement )
		const searchWrapperStyle = getComputedStyle( searchWrapperElement )
		const optionGap = parsePixelValue( actionsStyle.columnGap )
		const searchEndMargin = parsePixelValue( searchWrapperStyle.marginInlineEnd )

		return HEADER_SEARCH_INPUT_MIN_INLINE_SIZE_PX
			+ settingsInlineSize
			+ languageInlineSize
			+ sessionInlineSize
			+ searchEndMargin
			+ ( optionGap * 3 )
	}

	/**
	 * Updates collapse state from the allocated track and latest expanded measurement.
	 */
	function updateCollapseState(): void {
		const actionsElement = elements.actionsRootRef.value
		if ( actionsElement === null ) {
			return
		}

		const measuredMinimumInlineSize = measureExpandedMinimumInlineSize()
		if ( measuredMinimumInlineSize !== null ) {
			expandedMinimumInlineSize = measuredMinimumInlineSize
		}

		isUtilityCollapsed.value =
			actionsElement.getBoundingClientRect().width < expandedMinimumInlineSize
	}

	onMounted( () => {
		const actionsElement = elements.actionsRootRef.value
		if ( actionsElement === null || typeof ResizeObserver === 'undefined' ) {
			return
		}

		resizeObserver = new ResizeObserver( updateCollapseState )

		resizeObserver.observe( actionsElement )
		for ( const controlElement of [
			elements.settingsControlRef.value,
			elements.languageControlRef.value,
			elements.sessionControlRef.value
		] ) {
			if ( controlElement !== null ) {
				resizeObserver.observe( controlElement )
			}
		}
		updateCollapseState()
	} )

	onUnmounted( () => {
		resizeObserver?.disconnect()
		resizeObserver = null
	} )

	return {
		isUtilityCollapsed
	}
}
