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
 * Copies text to the system clipboard when running in the browser.
 *
 * @param text - Plain text to copy.
 * @returns Promise that resolves when the copy succeeds, or rejects on failure.
 */
export async function copyTextToClipboard( text: string ): Promise<void> {
	if ( !import.meta.client || !navigator.clipboard?.writeText ) {
		throw new Error( 'Clipboard is not available' )
	}

	await navigator.clipboard.writeText( text )
}
