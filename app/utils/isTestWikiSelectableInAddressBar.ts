import { getWikiInstanceById } from '../../config/instances'
import { getTestWikiBaseUrlForWikiInstance } from '../../config/wikiInstanceTestWikis'
import {
	collectScalarAddressBarServerUrls,
	collectScalarDocumentServerUrls,
	getHostnameFromServerUrl,
	hasNonProductionServerUrl,
	isTestWikiHostAmongServerUrls,
	type ScalarWorkspaceStoreWithServers
} from './collectScalarDocumentServerUrls'
import { resolveScalarClientModalServerUrl } from './scalarClientModalServerUrl'

/**
 * Collects server URLs from the OpenAPI document and the live address-bar UI.
 *
 * @param workspaceStore - ApiReference workspace store with document `servers`.
 * @param modalRoot - Open Test Request modal root, when available.
 * @returns Deduplicated server URL strings.
 */
function collectSelectableServerUrls(
	workspaceStore: ScalarWorkspaceStoreWithServers | null | undefined,
	modalRoot?: Element | null
): string[] {
	const documentServerUrls = collectScalarDocumentServerUrls( workspaceStore )
	const addressBarServerUrls = collectScalarAddressBarServerUrls( modalRoot )
	const activeModalServerUrl = resolveScalarClientModalServerUrl( modalRoot )
	const seenServerUrls = new Set<string>()
	const selectableServerUrls: string[] = []

	for ( const serverUrl of [
		...documentServerUrls,
		...addressBarServerUrls,
		...( activeModalServerUrl ? [ activeModalServerUrl ] : [] )
	] ) {
		if ( seenServerUrls.has( serverUrl ) ) {
			continue
		}

		seenServerUrls.add( serverUrl )
		selectableServerUrls.push( serverUrl )
	}

	return selectableServerUrls
}

/**
 * Returns whether a non-production (test) server is selectable in Test Request.
 *
 * True when the address bar / OpenAPI `servers` list includes a host other than the
 * production wiki host from {@link config/instances.ts}, or (fallback) the mapped
 * test-wiki host from config. Config mapping alone is not enough.
 *
 * @param wikiInstanceId - Active explorer wiki instance id.
 * @param workspaceStore - ApiReference workspace store with document `servers`.
 * @param modalRoot - Open Test Request modal root, when available.
 * @returns True when the user can select a test server from the address bar.
 */
export function isTestWikiSelectableInAddressBar(
	wikiInstanceId: string,
	workspaceStore: ScalarWorkspaceStoreWithServers | null | undefined,
	modalRoot?: Element | null
): boolean {
	const productionWikiInstance = getWikiInstanceById( wikiInstanceId )
	const selectableServerUrls = collectSelectableServerUrls( workspaceStore, modalRoot )

	if ( productionWikiInstance?.baseUrl ) {
		if ( hasNonProductionServerUrl( selectableServerUrls, productionWikiInstance.baseUrl ) ) {
			return true
		}
	}

	// Fallback: exact mapped test host (e.g. test.wikidata.org) when production
	// metadata is missing but config still names a sandbox.
	const testWikiBaseUrl = getTestWikiBaseUrlForWikiInstance( wikiInstanceId )

	if ( !testWikiBaseUrl ) {
		return false
	}

	return isTestWikiHostAmongServerUrls( selectableServerUrls, testWikiBaseUrl )
}

/**
 * Returns whether the address bar’s currently selected server is a non-production host.
 *
 * When true, the write-request production warning is hidden and the confirm-before-Send
 * dialog is skipped — the user is already targeting a sandbox (e.g. `test.wikimedia.org`).
 * Selecting the production host again clears this and restores both.
 *
 * @param wikiInstanceId - Active explorer wiki instance id.
 * @param modalRoot - Open Test Request modal root, when available.
 * @returns True when the active address-bar server is not the production wiki host.
 */
export function isActiveAddressBarServerTestWiki(
	wikiInstanceId: string,
	modalRoot?: Element | null
): boolean {
	const activeModalServerUrl = resolveScalarClientModalServerUrl( modalRoot )

	if ( !activeModalServerUrl ) {
		return false
	}

	const activeHostname = getHostnameFromServerUrl( activeModalServerUrl )

	if ( !activeHostname ) {
		return false
	}

	const productionWikiInstance = getWikiInstanceById( wikiInstanceId )

	if ( productionWikiInstance?.baseUrl ) {
		const productionHostname = getHostnameFromServerUrl( productionWikiInstance.baseUrl )

		if ( productionHostname && activeHostname !== productionHostname ) {
			return true
		}

		if ( productionHostname && activeHostname === productionHostname ) {
			return false
		}
	}

	// Fallback when production instance metadata is unavailable.
	const testWikiBaseUrl = getTestWikiBaseUrlForWikiInstance( wikiInstanceId )

	if ( !testWikiBaseUrl ) {
		return false
	}

	return isTestWikiHostAmongServerUrls( [ activeModalServerUrl ], testWikiBaseUrl )
}
