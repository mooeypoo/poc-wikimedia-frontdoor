/** Minimum bullet count when masking a short secret in the account token table. */
export const ACCOUNT_TOKEN_MASK_MIN_LENGTH = 12

/**
 * Returns a masked representation of a secret credential for display in the UI.
 *
 * @param secret - Full token or client secret value.
 * @returns Bullet characters matching the secret length (with a sensible minimum).
 */
export function maskSecretValue( secret: string ): string {
	const maskLength = Math.max( secret.length, ACCOUNT_TOKEN_MASK_MIN_LENGTH )
	return '•'.repeat( maskLength )
}

/**
 * Legacy clipboard write via a transient textarea + `document.execCommand( 'copy' )`.
 *
 * Used when the Async Clipboard API is missing or rejects (non-secure origins,
 * permission denial, or dialog focus edge cases). Must run in a user-gesture turn.
 *
 * The textarea is appended inside an open Codex dialog body when present so the
 * dialog focus trap / `inert` siblings do not block selection.
 *
 * @param text - Plain text to copy.
 * @returns Nothing.
 * @throws {Error} When the legacy copy command fails.
 */
function copyTextToClipboardWithExecCommand( text: string ): void {
	const textArea = document.createElement( 'textarea' )
	textArea.value = text
	textArea.setAttribute( 'readonly', '' )
	// Keep off-screen with logical insets; avoid display:none (selection can fail).
	textArea.style.position = 'fixed'
	textArea.style.inlineSize = '1px'
	textArea.style.blockSize = '1px'
	textArea.style.padding = '0'
	textArea.style.border = '0'
	textArea.style.insetBlockStart = '0'
	textArea.style.insetInlineStart = '-9999px'
	textArea.setAttribute( 'aria-hidden', 'true' )

	const openDialogBody = document.querySelector( '.cdx-dialog[aria-modal="true"] .cdx-dialog__body' )
	const mountParent = openDialogBody instanceof HTMLElement ? openDialogBody : document.body
	mountParent.appendChild( textArea )
	textArea.focus( { preventScroll: true } )
	textArea.select()
	textArea.setSelectionRange( 0, text.length )

	let didCopy = false
	try {
		didCopy = document.execCommand( 'copy' )
	} finally {
		mountParent.removeChild( textArea )
	}

	if ( !didCopy ) {
		throw new Error( 'Clipboard copy failed' )
	}
}

/**
 * Copies text to the system clipboard when running in the browser.
 *
 * Prefers `navigator.clipboard.writeText`, then falls back to `execCommand( 'copy' )`
 * so Reset-dialog quiet copy works when the Async Clipboard API is unavailable.
 *
 * @param text - Plain text to copy.
 * @returns Promise that resolves when the copy succeeds, or rejects on failure.
 */
export async function copyTextToClipboard( text: string ): Promise<void> {
	if ( !import.meta.client ) {
		throw new Error( 'Clipboard is not available' )
	}

	if ( navigator.clipboard?.writeText ) {
		try {
			await navigator.clipboard.writeText( text )
			return
		} catch {
			// Fall through to the legacy path (common when permission is denied).
		}
	}

	copyTextToClipboardWithExecCommand( text )
}
