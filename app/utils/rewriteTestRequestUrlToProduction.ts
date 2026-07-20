import { getWikiInstanceById } from '../../config/instances'
import { getTestWikiBaseUrlForWikiInstance } from '../../config/wikiInstanceTestWikis'
import { rewriteRequestOrigin } from './rewriteRequestOrigin'

/**
 * Rewrites a test wiki request URL back to the production wiki origin.
 *
 * @param requestUrl - Absolute request or server URL from the Scalar API client.
 * @param wikiInstanceId - Active explorer wiki instance id.
 * @returns Production URL when the request targets the mapped test wiki; otherwise the original URL.
 */
export function rewriteTestRequestUrlToProduction(
	requestUrl: string,
	wikiInstanceId: string
): string {
	const wikiInstance = getWikiInstanceById( wikiInstanceId )

	if ( !wikiInstance ) {
		return requestUrl
	}

	return rewriteRequestOrigin(
		requestUrl,
		new URL( getTestWikiBaseUrlForWikiInstance( wikiInstanceId ) ).origin,
		new URL( wikiInstance.baseUrl ).origin
	)
}
