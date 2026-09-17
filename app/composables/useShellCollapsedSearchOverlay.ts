import type { Ref } from 'vue'

/**
 * Manages open state for the collapsed header search overlay.
 *
 * The collapsed utility row has room for a search icon but not the field, so the
 * icon opens a full-viewport overlay instead. Closes on route change, viewport
 * expand (utility row uncollapsed), Escape, or explicit
 * `closeCollapsedSearchOverlay`.
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
	const isCollapsedSearchOverlayOpen = ref( false )

	const route = useRoute()

	/**
	 * Opens the search overlay.
	 */
	function openCollapsedSearchOverlay(): void {
		isCollapsedSearchOverlayOpen.value = true
	}

	/**
	 * Closes the search overlay.
	 */
	function closeCollapsedSearchOverlay(): void {
		isCollapsedSearchOverlayOpen.value = false
	}

	/**
	 * Closes the overlay when the Escape key is pressed while it is open.
	 *
	 * @param keyboardEvent - Keydown event from the document listener.
	 */
	function handleCollapsedSearchOverlayKeydown( keyboardEvent: KeyboardEvent ): void {
		if ( keyboardEvent.key !== 'Escape' || !isCollapsedSearchOverlayOpen.value ) {
			return
		}

		keyboardEvent.preventDefault()
		closeCollapsedSearchOverlay()
	}

	watch( () => route.fullPath, () => {
		closeCollapsedSearchOverlay()
	} )

	watch( options.isUtilityCollapsed, ( isCollapsed ) => {
		if ( !isCollapsed ) {
			closeCollapsedSearchOverlay()
		}
	} )

	onMounted( () => {
		document.addEventListener( 'keydown', handleCollapsedSearchOverlayKeydown )
	} )

	onUnmounted( () => {
		document.removeEventListener( 'keydown', handleCollapsedSearchOverlayKeydown )
	} )

	return {
		isCollapsedSearchOverlayOpen,
		openCollapsedSearchOverlay,
		closeCollapsedSearchOverlay
	}
}
