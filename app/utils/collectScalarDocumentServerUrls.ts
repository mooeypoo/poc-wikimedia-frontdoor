/**
 * Minimal workspace-store shape for reading OpenAPI `servers` from the active document.
 */
export interface ScalarWorkspaceStoreWithServers {
	workspace?: {
		'x-scalar-active-document'?: string
		documents?: Record<string, {
			servers?: Array<{ url?: string } | string>
		}>
	}
}

/**
 * Extracts the hostname from an absolute or host-relative HTTP(S) URL.
 *
 * @param serverUrl - Server URL string from OpenAPI or the address bar.
 * @returns Lowercase hostname, or null when the URL cannot be parsed.
 */
export function getHostnameFromServerUrl( serverUrl: string ): string | null {
	const trimmedServerUrl = serverUrl.trim()

	if ( !trimmedServerUrl ) {
		return null
	}

	try {
		if ( trimmedServerUrl.includes( '://' ) ) {
			return new URL( trimmedServerUrl ).hostname.toLowerCase() || null
		}

		// Protocol-relative URLs (//example.org/...).
		if ( trimmedServerUrl.startsWith( '//' ) ) {
			return new URL( `https:${ trimmedServerUrl }` ).hostname.toLowerCase() || null
		}
	} catch {
		return null
	}

	return null
}

/**
 * Collects absolute or relative server URLs from the active Scalar OpenAPI document.
 *
 * These are the servers Scalar imports into the Test Request address-bar picker.
 *
 * @param workspaceStore - ApiReference workspace store handle, if ready.
 * @returns Server URL strings from the active document (may be empty).
 */
export function collectScalarDocumentServerUrls(
	workspaceStore: ScalarWorkspaceStoreWithServers | null | undefined
): string[] {
	const workspace = workspaceStore?.workspace
	const documents = workspace?.documents

	if ( !documents ) {
		return []
	}

	const activeDocumentSlug =
		workspace?.[ 'x-scalar-active-document' ]
		?? Object.keys( documents )[ 0 ]

	if ( !activeDocumentSlug ) {
		return []
	}

	const documentServers = documents[ activeDocumentSlug ]?.servers

	if ( !Array.isArray( documentServers ) ) {
		return []
	}

	const serverUrls: string[] = []

	for ( const serverEntry of documentServers ) {
		if ( typeof serverEntry === 'string' && serverEntry.trim() ) {
			serverUrls.push( serverEntry.trim() )
			continue
		}

		if (
			serverEntry
			&& typeof serverEntry === 'object'
			&& typeof serverEntry.url === 'string'
			&& serverEntry.url.trim()
		) {
			serverUrls.push( serverEntry.url.trim() )
		}
	}

	return serverUrls
}

/**
 * Collects absolute HTTP(S) server URLs visible in the Test Request address-bar UI.
 *
 * Includes the active server button and any open server-picker option labels (Scalar
 * teleports the popover). Used when the workspace document’s `servers` array is empty
 * or incomplete relative to what the modal actually offers.
 *
 * @param modalRoot - Open Test Request modal root, when available.
 * @returns Deduplicated server URL strings.
 */
export function collectScalarAddressBarServerUrls(
	modalRoot: Element | null | undefined
): string[] {
	if ( !modalRoot || typeof document === 'undefined' ) {
		return []
	}

	const candidateElements: Element[] = []
	const addressBar = modalRoot.querySelector( '.scalar-address-bar' )

	if ( addressBar ) {
		candidateElements.push( ...addressBar.querySelectorAll( 'button.font-code' ) )
	}

	// Server dropdown options are often teleported outside the dialog.
	candidateElements.push(
		...document.querySelectorAll(
			'[data-radix-popper-content-wrapper] button, [data-radix-popper-content-wrapper] [role="option"], .scalar-popover button'
		)
	)

	const serverUrls: string[] = []
	const seenServerUrls = new Set<string>()

	for ( const candidateElement of candidateElements ) {
		const candidateText = candidateElement.textContent?.trim() ?? ''
		const urlMatch = candidateText.match( /https?:\/\/[^\s]+/ )
		const serverUrl = urlMatch?.[ 0 ]

		if ( !serverUrl || seenServerUrls.has( serverUrl ) ) {
			continue
		}

		seenServerUrls.add( serverUrl )
		serverUrls.push( serverUrl )
	}

	return serverUrls
}

/**
 * Returns whether any server URL targets the same host as the reference base URL.
 *
 * @param serverUrls - Server URLs from the OpenAPI document / address-bar options.
 * @param referenceBaseUrl - Absolute base URL whose hostname should be matched.
 * @returns True when the reference host appears among the server URLs.
 */
export function isTestWikiHostAmongServerUrls(
	serverUrls: readonly string[],
	referenceBaseUrl: string
): boolean {
	const referenceHostname = getHostnameFromServerUrl( referenceBaseUrl )

	if ( !referenceHostname ) {
		return false
	}

	for ( const serverUrl of serverUrls ) {
		const serverHostname = getHostnameFromServerUrl( serverUrl )

		if ( serverHostname === referenceHostname ) {
			return true
		}
	}

	return false
}

/**
 * Returns whether any server URL targets a host other than the production wiki.
 *
 * @param serverUrls - Server URLs from the OpenAPI document / address-bar options.
 * @param productionBaseUrl - Production wiki base URL from {@link config/instances.ts}.
 * @returns True when at least one selectable server is not the production host.
 */
export function hasNonProductionServerUrl(
	serverUrls: readonly string[],
	productionBaseUrl: string
): boolean {
	const productionHostname = getHostnameFromServerUrl( productionBaseUrl )

	if ( !productionHostname ) {
		return false
	}

	for ( const serverUrl of serverUrls ) {
		const serverHostname = getHostnameFromServerUrl( serverUrl )

		if ( serverHostname && serverHostname !== productionHostname ) {
			return true
		}
	}

	return false
}
