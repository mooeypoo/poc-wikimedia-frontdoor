import { rewriteProductionRequestUrlToTestWiki } from './rewriteProductionRequestUrlToTestWiki'
import { rewriteTestRequestUrlToProduction } from './rewriteTestRequestUrlToProduction'

/**
 * Applies the write-request test-wiki checkbox state to a Scalar server URL.
 *
 * @param serverUrl - Production server URL from the open API client modal.
 * @param wikiInstanceId - Active explorer wiki instance id.
 * @param useTestWiki - Whether the test-wiki checkbox is checked.
 * @returns Server URL for the current checkbox state.
 */
export function applyTestWikiToggleToServerUrl(
	serverUrl: string,
	wikiInstanceId: string,
	useTestWiki: boolean
): string {
	if ( useTestWiki ) {
		return rewriteProductionRequestUrlToTestWiki( serverUrl, wikiInstanceId )
	}

	return rewriteTestRequestUrlToProduction( serverUrl, wikiInstanceId )
}

/**
 * Normalizes a server URL to its production origin for the active wiki instance.
 *
 * @param serverUrl - Server URL shown in the Scalar address bar.
 * @param wikiInstanceId - Active explorer wiki instance id.
 * @returns Production server URL.
 */
export function normalizeServerUrlToProduction(
	serverUrl: string,
	wikiInstanceId: string
): string {
	return rewriteTestRequestUrlToProduction( serverUrl, wikiInstanceId )
}
