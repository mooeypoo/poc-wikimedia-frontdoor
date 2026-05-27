interface ExplorerDiagnosticEntry {
	timestamp: string
	event: string
	details: Record<string, unknown>
}

/**
 * Provides lightweight diagnostics for explorer flows during experimentation.
 *
 * @returns Methods and state for appending and reading diagnostic entries.
 */
export function useExplorerDiagnostics() {
	const entries = useState<ExplorerDiagnosticEntry[]>( 'explorerDiagnosticsEntries', () => [] )

	/**
	 * Appends a new diagnostic event and mirrors it to the browser console.
	 *
	 * @param eventName - Short event identifier.
	 * @param details - Structured event details for debugging.
	 * @returns Nothing.
	 */
	function logEvent( eventName: string, details: Record<string, unknown> = {} ): void {
		const entry: ExplorerDiagnosticEntry = {
			timestamp: new Date().toISOString(),
			event: eventName,
			details
		}

		entries.value.push( entry )

		if ( import.meta.client ) {
			console.debug( '[frontdoor:explorer]', entry )
		}
	}

	return {
		entries,
		logEvent
	}
}
