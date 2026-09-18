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
	// Truthiness, not `??`: split yields an empty string for an empty segment,
	// so `'/'` reaches here as `''` rather than as undefined.
	return localeSegment || fallbackLocaleCode
}

/**
 * Locale-independent identity of a content search result.
 *
 * Nuxt Content's FTS ids are locale-prefixed paths (`/en/about`,
 * `/fr/about#history`), so dropping the locale segment and the section hash
 * leaves what every translation of one page has in common. A locale's root
 * page (`/en`, `/fr`) is one document by the same rule.
 *
 * @param resultId - FTS result id.
 * @returns Path shared by every translation of that page.
 */
export function contentDocumentIdentity( resultId: string ): string {
	const [ pathPart = '' ] = resultId.split( '#' )
	const withoutLocalePrefix = pathPart.replace( /^\/+/, '' )
	const slashIndex = withoutLocalePrefix.indexOf( '/' )

	return slashIndex === -1 ? '/' : withoutLocalePrefix.slice( slashIndex )
}

/** A locale's search results: as much of the group shape as the dedupe reads. */
interface LocaleGroupWithResults<TResult extends { id: string }> {
	locale: string
	results: TResult[]
}

/**
 * Drops fallback-locale hits for documents an earlier chain locale matched.
 *
 * The fallback chain fills gaps: a Brazilian Portuguese reader falls through
 * `pt`, then `en`, for pages `pt-br` does not have. When a page *is*
 * translated and matched, the later locales' copies are the same document
 * said again, so a query whose term appears in every translation would list
 * one page three times under three headings.
 *
 * Identity is per page rather than per section, so having found the page in
 * their own language a reader does not then get three more sections of it in
 * other languages. Within one group nothing is dropped: two matching sections
 * of the same page are two real hits there, and they link to different
 * anchors.
 *
 * Groups are taken in chain order, most preferred first, and a group left with
 * nothing is dropped so no empty heading renders. All-locales mode
 * deliberately does not run this: there the reader asked for every language.
 *
 * @param groups - Locale groups in chain order.
 * @returns The same groups, minus later duplicates and minus emptied groups.
 */
export function dropDuplicateChainDocuments<
	TResult extends { id: string },
	TGroup extends LocaleGroupWithResults<TResult>
>( groups: TGroup[] ): TGroup[] {
	const seenDocuments = new Set<string>()
	const deduped: TGroup[] = []

	for ( const group of groups ) {
		const results = group.results.filter(
			( result ) => !seenDocuments.has( contentDocumentIdentity( result.id ) )
		)

		if ( results.length > 0 ) {
			deduped.push( { ...group, results } )
		}

		// Recorded after the filter above, not during it, so a page matching in
		// several of its own sections keeps all of them in the group that owns it.
		for ( const result of group.results ) {
			seenDocuments.add( contentDocumentIdentity( result.id ) )
		}
	}

	return deduped
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
