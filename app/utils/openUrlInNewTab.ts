/**
 * Opens a URL in a new browser tab with safe `rel` defaults (client-only).
 *
 * @param url - Absolute HTTPS URL from project config (e.g. Meta-Wiki OAuth pages).
 * @returns Nothing when not in the browser or when `url` is empty.
 */
export function openUrlInNewTab( url: string ): void {
	if ( !import.meta.client || !url ) {
		return
	}

	window.open( url, '_blank', 'noopener,noreferrer' )
}
