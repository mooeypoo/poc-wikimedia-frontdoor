import { ref } from 'vue'

/**
 * Controls the visibility of Scalar's built-in Authentication panel and the
 * confirmation dialog that gates its first reveal
 * (docs/adr-wikimedia-oauth-authentication.md §5.9).
 *
 * Two persistence scopes deliberately differ:
 *
 * - **Panel visibility** is session-scoped: it lives in a module-scoped ref,
 *   defaults to hidden, and resets to hidden on reload. This mirrors the
 *   "reload = logged out" precedent from §8.6 — safer defaults each fresh
 *   session, explicit opt-in each time.
 * - **Acknowledgement of the warning** is persisted in localStorage (same
 *   storage class Scalar itself uses for auth values). After the user reads
 *   the warning once and ticks "Don't show this again," we skip the dialog
 *   on subsequent enables. This respects user autonomy without repeated
 *   friction.
 */

const ACKNOWLEDGEMENT_STORAGE_KEY = 'explorer-auth-panel-acknowledged'

const isPanelVisible = ref( false )
const isDialogOpen = ref( false )

/**
 * Reads the persistent acknowledgement flag. `localStorage` access can throw
 * in sandboxed contexts (private mode, disabled cookies); we treat any error
 * as "not acknowledged" and re-show the dialog rather than fail silently.
 *
 * @returns True when the user previously ticked "Don't show this again".
 */
function hasAcknowledgedWarning(): boolean {
	try {
		return localStorage.getItem( ACKNOWLEDGEMENT_STORAGE_KEY ) === 'true'
	} catch {
		return false
	}
}

/**
 * Persists the acknowledgement flag. Failure is swallowed for the same
 * reasons as {@link hasAcknowledgedWarning}.
 */
function persistAcknowledgement(): void {
	try {
		localStorage.setItem( ACKNOWLEDGEMENT_STORAGE_KEY, 'true' )
	} catch {
		// Ignore: user will simply see the dialog again on the next reveal.
	}
}

/**
 * Advanced auth panel visibility state and lifecycle
 * (docs/adr-wikimedia-oauth-authentication.md §5.9).
 *
 * @returns Reactive state plus the actions used by the toggle and dialog.
 */
export function useAdvancedAuthPanel() {
	/**
	 * Requests that the panel become visible. If the user has previously
	 * acknowledged the warning, this reveals immediately; otherwise it opens
	 * the confirmation dialog and defers the reveal until the user confirms.
	 */
	function requestReveal(): void {
		if ( hasAcknowledgedWarning() ) {
			isPanelVisible.value = true
			return
		}

		isDialogOpen.value = true
	}

	/**
	 * Confirms the reveal from the dialog.
	 *
	 * @param acknowledgeForFuture - Whether to persist the acknowledgement so
	 *                               subsequent reveals skip the dialog.
	 */
	function confirmReveal( acknowledgeForFuture: boolean ): void {
		if ( acknowledgeForFuture ) {
			persistAcknowledgement()
		}

		isPanelVisible.value = true
		isDialogOpen.value = false
	}

	/**
	 * Dismisses the dialog without revealing the panel.
	 */
	function cancelReveal(): void {
		isDialogOpen.value = false
	}

	/**
	 * Hides the panel unconditionally. Turning the toggle off never prompts,
	 * because reducing exposure never needs acknowledgement.
	 */
	function hidePanel(): void {
		isPanelVisible.value = false
	}

	return {
		isPanelVisible,
		isDialogOpen,
		requestReveal,
		confirmReveal,
		cancelReveal,
		hidePanel
	}
}
