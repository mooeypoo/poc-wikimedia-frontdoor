import type { Ref } from 'vue'
import { useOverlayDismissal } from './useOverlayDismissal'

/**
 * Manages open state for the collapsed header search overlay.
 *
 * The collapsed utility row has room for a search icon but not the field, so the
 * icon opens a full-viewport overlay instead. Closes on route change, viewport
 * expand (utility row uncollapsed), Escape, or explicit
 * `closeCollapsedSearchOverlay`; the first three come from
 * `useOverlayDismissal`, shared with the collapsed nav overlay.
 *
 * Keyed to the utility row's own collapse signal, not the primary nav's: the two
 * rows observe their own widths and collapse independently.
 *
 * @param options - Reactive inputs that affect auto-close behaviour.
 * @param options.isUtilityCollapsed - When false, the overlay closes immediately.
 * @returns {{
 *   isCollapsedSearchOverlayOpen: import('vue').Ref<boolean>,
 *   openCollapsedSearchOverlay: () => void,
 *   closeCollapsedSearchOverlay: () => void
 * }} Overlay open flag and open / close actions.
 */
export function useShellCollapsedSearchOverlay( options: {
	isUtilityCollapsed: Ref<boolean>
} ) {
	const {
		isOpen: isCollapsedSearchOverlayOpen,
		open: openCollapsedSearchOverlay,
		close: closeCollapsedSearchOverlay
	} = useOverlayDismissal( { isCollapsed: options.isUtilityCollapsed } )

	return {
		isCollapsedSearchOverlayOpen,
		openCollapsedSearchOverlay,
		closeCollapsedSearchOverlay
	}
}
