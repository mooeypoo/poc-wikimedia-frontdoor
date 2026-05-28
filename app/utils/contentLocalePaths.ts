/**
 * Builds locale-qualified Nuxt Content paths for a route slug.
 *
 * @param localeCode - Requested locale code.
 * @param slugPath - Route slug path without a leading slash.
 * @returns Ordered candidate paths for that locale.
 */
export function buildLocaleContentPaths( localeCode: string, slugPath: string ): string[] {
	const normalizedSlugPath = slugPath.replace( /^\/+/, '' ).replace( /\/+$/, '' )
	if ( normalizedSlugPath.length === 0 ) {
		return [ `/${ localeCode }`, `/${ localeCode }/index` ]
	}

	return [ `/${ localeCode }/${ normalizedSlugPath }` ]
}

/**
 * Builds ordered locale candidates based on configured fallback chain.
 *
 * @param requestedLocaleCode - Requested locale code.
 * @param languageFallbackChain - Fallback chain for the requested locale.
 * @returns Unique candidate locale codes in priority order.
 */
export function buildLocaleCandidates(
	requestedLocaleCode: string,
	languageFallbackChain: string[]
): string[] {
	const orderedCandidates = [ requestedLocaleCode, ...languageFallbackChain ]
	const uniqueCandidates: string[] = []

	for ( const localeCode of orderedCandidates ) {
		if ( uniqueCandidates.includes( localeCode ) ) {
			continue
		}
		uniqueCandidates.push( localeCode )
	}

	if ( !uniqueCandidates.includes( 'en' ) ) {
		uniqueCandidates.push( 'en' )
	}

	return uniqueCandidates
}
