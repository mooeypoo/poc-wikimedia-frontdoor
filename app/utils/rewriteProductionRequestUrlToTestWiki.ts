import { getWikiInstanceById } from '../../config/instances'
import { getTestWikiBaseUrlForWikiInstance } from '../../config/wikiInstanceTestWikis'
import { rewriteRequestOrigin } from './rewriteRequestOrigin'

/**
 * Rewrites a production wiki request URL to the mapped test wiki origin.
 *
 * Only the origin is replaced; path, query, and fragment are preserved.
 *
 * @param requestUrl - Absolute request URL from the Scalar API client.
 * @param wikiInstanceId - Active explorer wiki instance id.
 * @returns Rewritten URL when the request targets the production wiki; otherwise the original URL.
 */
export function rewriteProductionRequestUrlToTestWiki(
	requestUrl: string,
	wikiInstanceId: string
): string {
	const wikiInstance = getWikiInstanceById( wikiInstanceId )

	if ( !wikiInstance ) {
		return requestUrl
	}

	return rewriteRequestOrigin(
		requestUrl,
		new URL( wikiInstance.baseUrl ).origin,
		new URL( getTestWikiBaseUrlForWikiInstance( wikiInstanceId ) ).origin
	)
}
