// Explicit .ts extensions: this module and everything it reaches are loaded by
// tests/contentSidebarMap.test.mjs under plain Node, whose ESM resolver cannot
// resolve an extensionless relative import. Vite resolves them unchanged.
import { buildLocaleCandidates, buildLocaleContentPaths } from './contentLocalePaths.ts'
import { getLanguageByCode } from '../../config/languages.ts'

/** Route path → `sidebar` frontmatter; null when the page declares none. */
export type ContentSidebarMap = Record<string, boolean | string | null>

/**
 * Resolves a route's `sidebar` frontmatter from the generated map.
 *
 * Walks the same locale candidates in the same order as
 * `useLocalizedContentPage` walks them against the content database. The walk
 * stops at the first locale that *has* the page, preference or not — otherwise
 * a translation that says nothing would inherit English's layout.
 *
 * Parity with the page component holds only as far as the caller's locale does:
 * `contentLocaleFromPath` recognizes the four prefixed locales
 * (`app/utils/contentRoute.ts`), while the page reads i18n's full locale set, so
 * a route under any other prefix resolves here as an English slug and misses.
 * That predates the map — the database lookup missed on the same input — and
 * fixing it means widening the prefix list, not this walk.
 *
 * Takes the map rather than importing it so it can be exercised against the
 * real content tree in a plain Node test, where `#build/` does not resolve.
 *
 * @param map - The generated sidebar map.
 * @param localeCode - Locale the route is being served in.
 * @param slugPath - Route path below the locale prefix; leading slash optional.
 * @returns The declared value, or `undefined` for automatic path-based
 *   resolution — which is also what a route with no content page resolves to.
 */
export function lookupContentPageSidebar(
	map: ContentSidebarMap,
	localeCode: string,
	slugPath: string
): boolean | string | undefined {
	const fallbackChain = getLanguageByCode( localeCode )?.fallbackChain ?? [ 'en' ]
	const candidatePaths = buildLocaleCandidates( localeCode, fallbackChain )
		.flatMap( ( localeCandidate ) => buildLocaleContentPaths( localeCandidate, slugPath ) )

	for ( const candidatePath of candidatePaths ) {
		if ( Object.hasOwn( map, candidatePath ) ) {
			return map[ candidatePath ] ?? undefined
		}
	}

	return undefined
}
