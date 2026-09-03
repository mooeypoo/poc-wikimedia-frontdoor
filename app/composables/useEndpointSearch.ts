import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { buildEndpointSearchEntries, searchEndpointIndex } from '../utils/endpointSearch'
import type { EndpointSearchResult } from '../utils/endpointSearch'
import { ENDPOINT_SEARCH_MIN_QUERY_LENGTH } from '../../config/endpointSearch'

/**
 * Keyword search over the Wikimedia REST API endpoints, for the site-wide
 * search panel. Each result carries a deep link that opens the community API
 * Explorer on that exact operation (docs/adr-explorer-deep-linking.md §10).
 *
 * Runs alongside — not inside — `useContentSearch`: the two answer the same
 * query from independent indexes with incomparable scores, and endpoint text is
 * English-only (it comes from upstream OpenAPI specs), so it is deliberately not
 * locale-partitioned the way content results are. The caller renders them as a
 * separate labelled group.
 *
 * The generated index is ~16 KB gzipped, which is dead weight on every page for
 * a feature only used when someone actually searches — so it is loaded with a
 * dynamic `import()` on the first eligible query and cached for the session. A
 * failed load degrades to "no endpoint results" rather than breaking the panel.
 *
 * @param query - Reactive search query. Results clear when it is shorter than the minimum length.
 * @returns Endpoint results for the current query, and whether the index is currently loading.
 */
export function useEndpointSearch( query: Ref<string> ) {
	const endpointResults = ref<EndpointSearchResult[]>( [] )
	const isEndpointIndexLoading = ref( false )

	// Built once from the lazily imported index, then reused for every keystroke.
	let searchEntries: ReturnType<typeof buildEndpointSearchEntries> | null = null
	let indexLoad: Promise<void> | null = null

	// Search-as-you-type: the same out-of-order guard the content search uses.
	// The first query also awaits a dynamic import, so a slow chunk load must not
	// be able to overwrite the results of a later, already-resolved query.
	let searchSequence = 0

	/**
	 * Loads and prepares the generated endpoint index, at most once per session.
	 *
	 * @returns Resolves when the index is ready, or when loading has failed.
	 */
	function loadEndpointIndex(): Promise<void> {
		if ( !indexLoad ) {
			isEndpointIndexLoading.value = true
			indexLoad = import( '../../config/generated/endpointSearchIndex.generated' )
				.then( ( indexModule ) => {
					searchEntries = buildEndpointSearchEntries( indexModule.GENERATED_ENDPOINT_SEARCH_INDEX )
				} )
				.catch( ( error ) => {
					// Non-fatal: the panel still shows content results. Surfaced in the
					// console because a persistent chunk failure is worth noticing.
					console.error( '[endpoint-search] failed to load the endpoint index', error )
					searchEntries = []
				} )
				.finally( () => {
					isEndpointIndexLoading.value = false
				} )
		}
		return indexLoad
	}

	watch( query, async ( nextQuery ) => {
		const trimmedQuery = nextQuery.trim()

		if ( trimmedQuery.length < ENDPOINT_SEARCH_MIN_QUERY_LENGTH ) {
			// Invalidate any in-flight run so it cannot repopulate after clearing.
			searchSequence++
			endpointResults.value = []
			return
		}

		const sequence = ++searchSequence

		if ( !searchEntries ) {
			await loadEndpointIndex()
			// A newer query started while the index was loading — that run owns the results.
			if ( sequence !== searchSequence ) {
				return
			}
		}

		endpointResults.value = searchEndpointIndex( searchEntries ?? [], trimmedQuery )
	} )

	return {
		endpointResults,
		isEndpointIndexLoading
	}
}
