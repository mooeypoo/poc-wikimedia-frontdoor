import type { Ref } from 'vue'
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../config/languages'
import { contentCollectionForLocale } from '../../config/contentCollections'
import { resolveContentLocaleChain } from '../utils/contentLocalePaths'
import { CONTENT_LOCALES } from '#build/content-locales'

/**
 * Mirrors the shape of a Nuxt Content FTS5 search result.
 * SearchResult is not exported from @nuxt/content's public API (ADR §1),
 * so we define a local interface that matches the actual runtime shape.
 */
export interface ContentSearchResult {
	id: string
	title: string
	content: string
	snippets?: {
		content?: string
	}
}

/**
 * A set of search results belonging to a single locale.
 */
export interface LocaleResultGroup {
	locale: string
	dir: 'ltr' | 'rtl'
	results: ContentSearchResult[]
}

/** Minimum query length before a search is issued. */
const MIN_QUERY_LENGTH = 2

/**
 * Maps a Nuxt Content FTS result id to a navigable URL path.
 *
 * With @nuxtjs/i18n prefix_except_default strategy the default locale ('en')
 * has no URL prefix. All other locales keep their prefix.
 *
 * @param resultId      - FTS id such as '/en/about' or '/fr/about#section'.
 * @param defaultLocale - The locale whose URL has no prefix (default: 'en').
 * @returns URL path such as '/about' or '/fr/about#section'.
 */
export function contentIdToUrl( resultId: string, defaultLocale: string = 'en' ): string {
	const [ pathPart = '', hashPart ] = resultId.split( '#' )
	const hash = hashPart !== undefined ? `#${ hashPart }` : ''
	const cleanPath = pathPart.startsWith( '/' ) ? pathPart.slice( 1 ) : pathPart
	const slashIndex = cleanPath.indexOf( '/' )

	if ( slashIndex === -1 ) {
		// Root page for a locale, e.g. '/en' → '/' or '/fr' → '/fr'
		return cleanPath === defaultLocale ? `/${ hash }` : `/${ cleanPath }${ hash }`
	}

	const localeCode = cleanPath.slice( 0, slashIndex )
	const rest = cleanPath.slice( slashIndex ) // includes leading slash
	return localeCode === defaultLocale ? `${ rest }${ hash }` : `/${ localeCode }${ rest }${ hash }`
}

/**
 * Performs full-text search over per-locale Nuxt Content collections
 * (content.config.ts defines one per content/<locale> directory).
 *
 * One `useSearchCollection` instance is created per content locale, each
 * pinned to a constant collection name, rather than one shared instance whose
 * collection list grows as locales are searched. Two library behaviours rule
 * out the shared-growing-list design (both in
 * `node_modules/@nuxt/content/dist/runtime/`):
 *
 *   - `search()` (client.js) always queries every collection the instance has
 *     ever indexed (`indexedFor`), with no per-call way to narrow that back
 *     down. A shared, ever-growing list would mean that after a reader's
 *     second locale switch (or the "all locales" expansion), every subsequent
 *     search's `collection IN (...)` filter spans every locale touched so
 *     far, not just the current one — the FTS rank cutoff (`LIMIT 50`)
 *     reapplies across all of them, and the exact ranking-starvation bug this
 *     split exists to fix becomes reachable again.
 *   - `useSearchCollection` also registers its own
 *     `watch(() => toValue(collection), () => init(), { immediate })`
 *     (client.js). A mutated shared ref makes that watcher fire independently
 *     of any explicit `init()` call this composable makes, and the two race:
 *     `init()`'s own dedupe compares against `indexedFor`, which is only
 *     updated after a build finishes, so both calls proceed and insert every
 *     section twice.
 *
 * Pinning each instance to a constant collection name sidesteps both: nothing
 * ever changes, so the internal watcher never fires, and each instance's own
 * `indexedFor` never grows past its one locale, so a search against it is
 * always scoped to exactly that locale's own rank cutoff.
 *
 * Results are grouped by the active locale's fallback chain, in chain order,
 * using the language catalog (docs/guide/language-and-internationalization.md)
 * rather than a hardcoded hop to English, and filtered to locales that
 * actually have a content/<locale> directory — most of the catalog's several
 * hundred interface locales do not, and querying a collection name with no
 * backing directory throws rather than returning no results. "All locales"
 * mode searches every locale that has a collection and re-groups.
 *
 * @param query        - Reactive search query. Results clear when length < 2.
 * @param activeLocale - Reactive BCP 47 locale code of the current interface language.
 * @returns Search state, chain-grouped results, the all-locales activation action, and the index loader.
 */
export function useContentSearch(
	query: Ref<string>,
	activeLocale: Ref<string>
) {
	const searchByLocale = new Map(
		CONTENT_LOCALES.map( ( locale ) => [
			locale,
			// Build deferred off mount; ensureLocaleIndex() below owns it from there.
			useSearchCollection(
				// contentCollectionForLocale() returns keyof Collections; useSearchCollection
				// wants keyof PageCollections specifically. Every collection here is `type:
				// 'page'`, so this is a safe widening rather than an escape from the check.
				contentCollectionForLocale( locale ) as unknown as Parameters<typeof useSearchCollection>[ 0 ],
				{ immediate: false }
			)
		] )
	)

	const chainResultGroups = ref<LocaleResultGroup[]>( [] )
	const allLocaleResultGroups = ref<LocaleResultGroup[]>( [] )
	const isAllLocalesMode = ref( false )
	const isSearching = ref( false )
	const hasSearchError = ref( false )

	// One memoized index build per locale, the way useEndpointSearch memoizes
	// its own lazy index load.
	const indexBuildByLocale = new Map<string, Promise<void>>()

	// Search-as-you-type fires one async search() per keystroke/locale change,
	// and activateAllLocalesSearch() is a third kind of run competing for the
	// same result state. Responses can resolve out of order, so each run claims
	// a sequence number and only commits its results if it is still the most
	// recent run. This prevents a slow or superseded run from clobbering a
	// faster later one.
	let searchSequence = 0

	const hasQuery = computed( () => query.value.trim().length >= MIN_QUERY_LENGTH )

	/**
	 * Resolves which locales are worth searching for a given active locale.
	 *
	 * `resolveContentLocaleChain` is the same recipe page resolution runs
	 * (`server/api/content-page.get.ts`), which is what keeps search from
	 * offering a hit in a locale that page resolution would then 404 on.
	 *
	 * @param localeCode - BCP 47 locale code.
	 * @returns Locale codes worth searching, in chain order.
	 */
	function resolveSearchLocales( localeCode: string ): string[] {
		return resolveContentLocaleChain( localeCode, CONTENT_LOCALES )
	}

	/**
	 * Builds one locale's FTS index, once, and resolves only when it is
	 * actually queryable.
	 *
	 * `init()` cannot be trusted to dedupe concurrent callers: it returns its
	 * in-flight promise only once `indexedFor` is populated, and that happens
	 * after the build, so two calls inside one build window index every section
	 * twice. And `search()` only falls back to `init()` when its own db handle is
	 * unset, which it assigns before the build rather than after, so a query
	 * issued mid-build runs against an empty collection list and comes back
	 * empty. Every caller waits on this promise instead.
	 *
	 * @param locale - Locale to build the index for.
	 * @returns Resolves when that locale's index is queryable; rejects if the build failed.
	 */
	function ensureLocaleIndex( locale: string ): Promise<void> {
		const handle = searchByLocale.get( locale )
		if ( !handle ) {
			return Promise.resolve()
		}

		let build = indexBuildByLocale.get( locale )
		if ( !build ) {
			build = handle.init()
				.then( () => undefined )
				.catch( ( error: unknown ) => {
					// Drop the memo so the next query retries the build rather than
					// replaying the failure for the rest of the session.
					indexBuildByLocale.delete( locale )
					throw error
				} )
			indexBuildByLocale.set( locale, build )
		}

		return build
	}

	/**
	 * Searches each given locale independently — its own index, its own rank
	 * cutoff — and returns one group per locale that matched, in the given order.
	 *
	 * Each locale's build-and-query is caught on its own: independent
	 * collections mean one locale's dump fetch failing is no longer a reason to
	 * fail the whole search, the way it was when everything lived in a single
	 * collection. A locale that fails just contributes no results, logged
	 * rather than surfaced, unless every locale in the batch failed — that
	 * case still rejects, so the caller's `hasSearchError` fires for a search
	 * that genuinely found nothing rather than one locale of several.
	 *
	 * @param trimmedQuery - Search query, already trimmed.
	 * @param locales      - Locale codes to search, in display order.
	 * @returns Non-empty locale groups in `locales` order.
	 */
	async function searchLocales( trimmedQuery: string, locales: string[] ): Promise<LocaleResultGroup[]> {
		const perLocale = await Promise.all(
			locales.map( async ( locale ) => {
				try {
					await ensureLocaleIndex( locale )
					const handle = searchByLocale.get( locale )
					const results = handle
						? ( await handle.search( trimmedQuery, { snippet: {} } ) ) as ContentSearchResult[]
						: []
					return { locale, results, failed: false }
				} catch ( error ) {
					console.error( `[content-search] ${ locale } failed to build or search`, error )
					return { locale, results: [] as ContentSearchResult[], failed: true }
				}
			} )
		)

		if ( locales.length > 0 && perLocale.every( ( entry ) => entry.failed ) ) {
			throw new Error( 'content search unavailable: every locale failed to build or search' )
		}

		return perLocale
			.map( ( { locale, results } ) => ( {
				locale,
				dir: getLanguageByCode( locale )?.dir ?? 'ltr' as const,
				results
			} ) )
			.filter( ( group ) => group.results.length > 0 )
	}

	/**
	 * Starts the index build from the search field's focus so the first keystroke
	 * does not wait on the whole build. Only the active locale's fallback chain
	 * is loaded, not every locale. Failure is left to the search to report:
	 * there is no query here to report it against.
	 *
	 * @returns Nothing; the build runs in the background.
	 */
	function loadContentIndex(): void {
		for ( const locale of resolveSearchLocales( activeLocale.value ) ) {
			ensureLocaleIndex( locale ).catch( ( error ) => {
				console.error( '[content-search] failed to build the content index', error )
			} )
		}
	}

	/**
	 * Empties every result bucket. The too-short-query path and the failure path
	 * both need it, and writing it out twice is how the two drift apart.
	 *
	 * @returns Nothing.
	 */
	function clearResults(): void {
		chainResultGroups.value = []
		allLocaleResultGroups.value = []
		isAllLocalesMode.value = false
	}

	/**
	 * Expands the results view to every locale that has a collection.
	 *
	 * @returns Resolves once the all-locales results are populated.
	 */
	async function activateAllLocalesSearch(): Promise<void> {
		const sequence = ++searchSequence
		isAllLocalesMode.value = true
		// Clear synchronously: a re-expansion (a fresh query, then "search all
		// languages" again) would otherwise flash the previous query's results
		// under the progress bar until this run resolves, or sit behind the
		// error message if it fails.
		allLocaleResultGroups.value = []
		isSearching.value = true
		hasSearchError.value = false

		try {
			const localeOrder = SUPPORTED_LANGUAGES
				.map( ( language ) => language.code )
				.filter( ( code ) => CONTENT_LOCALES.includes( code ) )

			const groups = await searchLocales( query.value.trim(), localeOrder )

			// A newer run started while this one was in flight — discard these
			// stale results so they cannot overwrite the latest run.
			if ( sequence !== searchSequence ) {
				return
			}

			allLocaleResultGroups.value = groups
		} catch ( error ) {
			if ( sequence !== searchSequence ) {
				return
			}

			console.error( '[content-search] failed to search all languages', error )
			hasSearchError.value = true
		} finally {
			if ( sequence === searchSequence ) {
				isSearching.value = false
			}
		}
	}

	watch(
		[ query, activeLocale ],
		async ( [ nextQuery, nextLocale ] ) => {
			const trimmedQuery = nextQuery.trim()

			if ( trimmedQuery.length < MIN_QUERY_LENGTH ) {
				// Invalidate any in-flight search so a pending response cannot
				// repopulate results after the query was cleared.
				searchSequence++
				clearResults()
				isSearching.value = false
				hasSearchError.value = false
				return
			}

			// Any new query or locale change resets the all-locales view.
			isAllLocalesMode.value = false
			isSearching.value = true
			hasSearchError.value = false

			const sequence = ++searchSequence

			try {
				const groups = await searchLocales( trimmedQuery, resolveSearchLocales( nextLocale ) )

				// A newer query started while this one was in flight — discard
				// these stale results so they cannot overwrite the latest run.
				if ( sequence !== searchSequence ) {
					return
				}

				chainResultGroups.value = groups
			} catch ( error ) {
				// The index failed to build, so the query never ran. Say that instead
				// of "no results in French", which claims a search that did not happen.
				// A rejected FTS expression is not reachable here: `queryFTS()`
				// swallows its own SQL errors and returns an empty set.
				if ( sequence !== searchSequence ) {
					return
				}

				console.error( '[content-search] search failed', error )
				clearResults()
				hasSearchError.value = true
			} finally {
				// Only the most recent run owns the searching flag.
				if ( sequence === searchSequence ) {
					isSearching.value = false
				}
			}
		},
		{ immediate: false }
	)

	return {
		chainResultGroups,
		allLocaleResultGroups,
		isAllLocalesMode,
		activateAllLocalesSearch,
		loadContentIndex,
		isSearching,
		hasSearchError,
		hasQuery
	}
}
