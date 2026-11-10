import type { Ref } from 'vue'
import { HEADER_UTILITY_COLLAPSE_THRESHOLD_PX } from '../../config/headerChrome'

/**
 * Tracks whether the header utility row should render in compact mode.
 *
 * Observes the allocated inline size of the utility actions flex track (not content
 * width). When the track is narrower than {@link HEADER_UTILITY_COLLAPSE_THRESHOLD_PX},
 * search collapses to an icon button and settings / log in move into a menu; the
 * language select stays visible in compact form (icon + locale code).
 *
 * @param actionsRootRef - Root element of `ShellHeaderUtilityActions` (`.shell-header-utility-actions`).
 * @returns Reactive `isUtilityCollapsed` flag for template bindings.
 */
export function useHeaderUtilityCollapse( actionsRootRef: Ref<HTMLElement | null> ) {
	const isUtilityCollapsed = ref( false )

	let resizeObserver: ResizeObserver | null = null

	/**
	 * Updates collapse state from the observed element content box inline size.
	 *
	 * @param inlineSize - Measured inline size of the utility actions track (px).
	 */
	function updateCollapseState( inlineSize: number ): void {
		isUtilityCollapsed.value = inlineSize < HEADER_UTILITY_COLLAPSE_THRESHOLD_PX
	}

	onMounted( () => {
		const actionsElement = actionsRootRef.value
		if ( actionsElement === null || typeof ResizeObserver === 'undefined' ) {
			return
		}

		resizeObserver = new ResizeObserver( ( entries ) => {
			const entry = entries[ 0 ]
			if ( entry === undefined ) {
				return
			}

			updateCollapseState( entry.contentRect.width )
		} )

		resizeObserver.observe( actionsElement )
		updateCollapseState( actionsElement.getBoundingClientRect().width )
	} )

	onUnmounted( () => {
		resizeObserver?.disconnect()
		resizeObserver = null
	} )

	return {
		isUtilityCollapsed
	}
}
