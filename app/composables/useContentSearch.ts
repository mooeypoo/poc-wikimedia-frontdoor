import type { Ref } from 'vue'
import { SUPPORTED_LANGUAGES } from '../../config/languages'

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
 * Returns true when a FTS result ID belongs to the given locale.
 *
 * Nuxt Content sets each section's id to its content path, so results are
 * reliably locale-prefixed (e.g. '/fr/about', '/fr/about#section').
 * Three forms are handled per ADR §3:
 *   /locale          — root page for that locale
 *   /locale/…        — any sub-page
 *   /locale#…        — root-page section anchor
 *
 * @param resultId   - FTS result id as returned by useSearchCollection.
 * @param localeCode - BCP 47 locale code (e.g. 'fr').
 * @returns True if the result belongs to this locale.
 */
function resultMatchesLocale( resultId: string, localeCode: string ): boolean {
	return (
		resultId === `/${ localeCode }` ||
		resultId.startsWith( `/${ localeCode }/` ) ||
		resultId.startsWith( `/${ localeCode }#` )
	)
}

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
	const [ pathPart, hashPart ] = resultId.split( '#' )
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
 * Performs full-text search over the Nuxt Content markdown collection,
 * partitioned by locale prefix using Nuxt Content's built-in FTS5 engine.
 *
 * Results are split into a locale-specific bucket and an English fallback
 * bucket for the normal display mode. An "all locales" mode re-partitions
 * the retained raw results across every supported language without any
 * additional network request.
 *
 * FTS5 is language-agnostic so no stemmer configuration is needed, unlike
 * the Lunr approach previously recorded in TECH_DECISIONS.md (superseded — ADR §1).
 *
 * @param query        - Reactive search query. Results clear when length < 2.
 * @param activeLocale - Reactive BCP 47 locale code of the current interface language.
 * @returns Search state, partitioned results, and the all-locales activation action.
 */
export function useContentSearch(
	query: Ref<string>,
	activeLocale: Ref<string>
) {
	const { search } = useSearchCollection( 'content' )

	const localeResults = ref<ContentSearchResult[]>( [] )
	const fallbackResults = ref<ContentSearchResult[]>( [] )
	const allLocaleResultGroups = ref<LocaleResultGroup[]>( [] )
	const isAllLocalesMode = ref( false )
	const isSearching = ref( false )

	// Retained so activateAllLocalesSearch() can re-partition without a new fetch.
	const lastRawResults = ref<ContentSearchResult[]>( [] )

	// Search-as-you-type fires one async search() per keystroke/locale change.
	// Responses can resolve out of order, so each run claims a sequence number
	// and only commits its results if it is still the most recent run. This
	// prevents a slow earlier query from clobbering a faster later one.
	let searchSequence = 0

	const hasQuery = computed( () => query.value.trim().length >= MIN_QUERY_LENGTH )

	/**
	 * Partitions raw FTS results across all supported languages.
	 * Only groups with at least one result are included, ordered by SUPPORTED_LANGUAGES.
	 *
	 * @param rawResults - Unfiltered FTS result set.
	 * @returns Non-empty locale groups in SUPPORTED_LANGUAGES order.
	 */
	function buildAllLocaleGroups( rawResults: ContentSearchResult[] ): LocaleResultGroup[] {
		return SUPPORTED_LANGUAGES
			.map( ( lang ) => ( {
				locale: lang.code,
				dir: lang.dir,
				results: rawResults.filter( ( result ) => resultMatchesLocale( result.id, lang.code ) )
			} ) )
			.filter( ( group ) => group.results.length > 0 )
	}

	/**
	 * Expands the results view to all supported locales, using the retained raw
	 * result set from the last search. No additional network request is made.
	 *
	 * @returns Nothing.
	 */
	function activateAllLocalesSearch(): void {
		isAllLocalesMode.value = true
		allLocaleResultGroups.value = buildAllLocaleGroups( lastRawResults.value )
	}

	watch(
		[ query, activeLocale ],
		async ( [ nextQuery, nextLocale ] ) => {
			const trimmedQuery = nextQuery.trim()

			if ( trimmedQuery.length < MIN_QUERY_LENGTH ) {
				// Invalidate any in-flight search so a pending response cannot
				// repopulate results after the query was cleared.
				searchSequence++
				localeResults.value = []
				fallbackResults.value = []
				lastRawResults.value = []
				allLocaleResultGroups.value = []
				isAllLocalesMode.value = false
				isSearching.value = false
				return
			}

			// Any new query or locale change resets the all-locales view.
			isAllLocalesMode.value = false
			isSearching.value = true

			const sequence = ++searchSequence

			try {
				// useSearchCollection searches all content regardless of locale;
				// client-side path-prefix partitioning is used per ADR §3.
				// snippet option is passed to search(), not to useSearchCollection() — ADR §1.
				const rawResults = ( await search( trimmedQuery, { snippet: true } ) ) as ContentSearchResult[]

				// A newer query started while this one was in flight — discard
				// these stale results so they cannot overwrite the latest run.
				if ( sequence !== searchSequence ) {
					return
				}

				lastRawResults.value = rawResults

				localeResults.value = rawResults.filter(
					( result ) => resultMatchesLocale( result.id, nextLocale )
				)

				// English fallback populated for non-English locales only.
				// When activeLocale is 'en', localeResults already covers English content.
				fallbackResults.value = nextLocale !== 'en'
					? rawResults.filter( ( result ) => resultMatchesLocale( result.id, 'en' ) )
					: []
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
		localeResults,
		fallbackResults,
		allLocaleResultGroups,
		isAllLocalesMode,
		activateAllLocalesSearch,
		isSearching,
		hasQuery
	}
}
