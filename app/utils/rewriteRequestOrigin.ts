/**
 * Rewrites a request URL by replacing one origin with another.
 *
 * @param requestUrl - Absolute request URL.
 * @param sourceOrigin - Origin to replace.
 * @param targetOrigin - Origin to use instead.
 * @returns Rewritten URL when the request matches the source origin; otherwise the original URL.
 */
export function rewriteRequestOrigin(
	requestUrl: string,
	sourceOrigin: string,
	targetOrigin: string
): string {
	let parsedRequestUrl: URL

	try {
		parsedRequestUrl = new URL( requestUrl )
	} catch {
		return requestUrl
	}

	if ( parsedRequestUrl.origin !== sourceOrigin ) {
		return requestUrl
	}

	const parsedTargetOrigin = new URL( targetOrigin )
	parsedRequestUrl.protocol = parsedTargetOrigin.protocol
	parsedRequestUrl.host = parsedTargetOrigin.host

	return parsedRequestUrl.toString()
}
