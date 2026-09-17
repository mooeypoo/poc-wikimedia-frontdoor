import { getLanguageByCode } from '../../config/languages.ts'

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

/**
 * Locale segment of a content path built by `buildLocaleContentPaths`
 * (e.g. `/fr/learn` → `fr`), or `fallbackLocaleCode` when the path has none
 * (e.g. an absolute path into `_partials/shared/`, which `::partial` owns
 * instead and isn't under any locale directory).
 *
 * @param contentPath - Locale-qualified content path, or an absolute one with no locale segment.
 * @param fallbackLocaleCode - Locale to use when `contentPath` has no locale segment.
 * @returns The path's locale segment, or `fallbackLocaleCode`.
 */
export function localeFromContentPath( contentPath: string, fallbackLocaleCode: string ): string {
	const [ , localeSegment ] = contentPath.split( '/' )
	return localeSegment ?? fallbackLocaleCode
}

/**
 * Resolves which locales are worth querying for a reader: the catalog's
 * fallback chain, narrowed to locales that have a content/<locale> directory.
 * Querying a collection name with no backing directory throws rather than
 * returning no match, and English is always present, so this is never empty.
 *
 * The list is a parameter because the two callers read it from different
 * generated modules: the app gets `#build/content-locales`, Nitro gets
 * `#content-locales`.
 *
 * @param localeCode - Requested locale code.
 * @param contentLocales - Locale codes that have a collection.
 * @returns Locale codes worth querying, in chain order.
 */
export function resolveContentLocaleChain(
	localeCode: string,
	contentLocales: string[]
): string[] {
	const fallbackChain = getLanguageByCode( localeCode )?.fallbackChain ?? [ 'en' ]
	return buildLocaleCandidates( localeCode, fallbackChain )
		.filter( ( candidate ) => contentLocales.includes( candidate ) )
}
