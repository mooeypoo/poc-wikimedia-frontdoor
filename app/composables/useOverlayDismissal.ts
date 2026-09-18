import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'

/**
 * A route reference for the close-on-navigation watch. Must be reactive
 * (Nuxt's `useRoute()` return value, or `reactive()` in a test) — a plain
 * object's `fullPath` never changes as far as the watcher can tell, so the
 * overlay would stop closing on navigation.
 */
export interface OverlayDismissalRoute {
	fullPath: string
}

/**
 * Open state and the dismissal rules both collapsed-shell overlays share:
 * close on route change, close once the row that spawned the overlay stops
 * being collapsed, and close on Escape.
 *
 * We own `isOpen` rather than taking it so the deferred focus work has one
 * place to live: a focus trap captures on open and restores on close, and both
 * halves belong wherever the pair does. See Accessibility (AA) in
 * `DESIGN_REQUIREMENTS.md`.
 *
 * @param options - Reactive inputs and per-overlay teardown.
 * @param options.isCollapsed - When false, the overlay closes immediately.
 * @param options.onClose - Extra teardown to run once the overlay has closed.
 * @param options.route - Defaults to `useRoute()`; overridable so the watch
 * logic is testable without a Nuxt router context. See {@link OverlayDismissalRoute}.
 * @returns {{
 *   isOpen: import('vue').Ref<boolean>,
 *   open: () => void,
 *   close: () => void
 * }} Overlay open flag and open / close actions.
 */
export function useOverlayDismissal( options: {
	isCollapsed: Ref<boolean>
	onClose?: () => void
	route?: OverlayDismissalRoute
} ) {
	const isOpen = ref( false )

	const route = options.route ?? useRoute()

	/**
	 * Opens the overlay.
	 */
	function open(): void {
		isOpen.value = true
	}

	/**
	 * Closes the overlay, then runs the caller's own teardown.
	 */
	function close(): void {
		isOpen.value = false
		options.onClose?.()
	}

	/**
	 * Closes the overlay when the Escape key is pressed while it is open.
	 *
	 * @param keyboardEvent - Keydown event from the document listener.
	 */
	function handleKeydown( keyboardEvent: KeyboardEvent ): void {
		if ( keyboardEvent.key !== 'Escape' || !isOpen.value ) {
			return
		}

		keyboardEvent.preventDefault()
		close()
	}

	watch( () => route.fullPath, () => {
		close()
	} )

	watch( options.isCollapsed, ( isCollapsed ) => {
		if ( !isCollapsed ) {
			close()
		}
	} )

	onMounted( () => {
		document.addEventListener( 'keydown', handleKeydown )
	} )

	onUnmounted( () => {
		document.removeEventListener( 'keydown', handleKeydown )
	} )

	return {
		isOpen,
		open,
		close
	}
}
