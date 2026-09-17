import { defineEventHandler, getQuery } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { CONTENT_LOCALES } from '#content-locales'
import { buildLocaleContentPaths, resolveContentLocaleChain } from '../../app/utils/contentLocalePaths'
import { contentCollectionForLocale } from '../../config/contentCollections'

/** The resolved page, or null when no locale in the reader's chain has one. */
export interface LocalizedContentPageResponse {
	page: Record<string, unknown> | null
}

/*
 * @nuxt/content rejects its own generated SQL as commented when the slug
 * carries either sequence, because its scanner never notices it is inside a
 * quoted literal (internal/security.js:58-77). Such a slug is unqueryable, so
 * we answer it as a miss rather than as a 500 out of a public endpoint.
 */
const UNQUERYABLE_SLUG_PATTERN = /--|\/\*/

/**
 * Resolves a content page from locale-qualified markdown paths, walking the
 * reader's fallback chain.
 *
 * This walk used to run wherever the page component ran, which on a
 * client-side navigation meant the browser: `executeContentQuery`
 * (`@nuxt/content/dist/runtime/client.js`) takes its WASM branch whenever
 * `window.WebAssembly` exists, with no option behind it, so reading one page
 * fetched the SQLite engine and the whole locale dump. Answering here keeps
 * both on the server, and keeps a navigation to one request however deep the
 * chain runs.
 */
export default defineEventHandler( async ( event ): Promise<LocalizedContentPageResponse> => {
	const query = getQuery( event )
	const requestedLocaleCode = typeof query.locale === 'string' ? query.locale : ''
	const slugPath = typeof query.slug === 'string' ? query.slug : ''

	if ( UNQUERYABLE_SLUG_PATTERN.test( slugPath ) ) {
		return { page: null }
	}

	/*
	 * An empty or unknown locale narrows to English rather than erroring, which
	 * is what the composable did when it owned this walk. The narrowing is also
	 * what keeps a catalog-only locale a miss instead of a throw; it is not a
	 * guard on the collection name, which never reaches the SQL as text
	 * (`buildQuery` looks it up in the build-time manifest,
	 * internal/query.js:130, and the library re-checks the resulting FROM).
	 */
	const localeCandidates = resolveContentLocaleChain( requestedLocaleCode, CONTENT_LOCALES )

	for ( const localeCandidate of localeCandidates ) {
		for ( const pathCandidate of buildLocaleContentPaths( localeCandidate, slugPath ) ) {
			const page = await queryCollection( event, contentCollectionForLocale( localeCandidate ) )
				.path( pathCandidate )
				.first()

			if ( page ) {
				return { page: page as unknown as Record<string, unknown> }
			}
		}
	}

	return { page: null }
} )
