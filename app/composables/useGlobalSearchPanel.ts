import type { Ref } from 'vue'
import {
	SEARCH_PROTOTYPE_ENDPOINT_RESULT_POOL,
	SEARCH_PROTOTYPE_LOAD_MORE_CHUNK_SIZE,
	SEARCH_PROTOTYPE_PENDING_DELAY_MS,
	SEARCH_PROTOTYPE_VISIBLE_ITEM_LIMIT,
	type SearchPrototypeCategory
} from '../../config/searchPrototype'
import { useContentSearch } from './useContentSearch'
import { useEndpointSearch } from './useEndpointSearch'
import {
	mapDocumentationSearchItems,
	mapEndpointSearchItems,
	orderGlobalSearchPanelItems,
	sliceVisibleSearchTiers,
	splitEnglishFallbackTier
} from '../utils/globalSearchPanel'

/**
 * Presentation state for the global-search prototype panel.
 *
 * Owns category chips, pending delay, visible-window / load-more disclosure,
 * and mapping of PR #66 search hits into panel rows. Does not re-rank.
 *
 * @param query - Reactive search query (shared with the header input).
 * @param activeLocale - Reactive interface locale from banana / shell.
 * @returns Panel model for `ShellHeaderGlobalSearch`.
 */
export function useGlobalSearchPanel(
	query: Ref<string>,
	activeLocale: Ref<string> | string
) {
	// Prefer the shell's interface-locale state so English-fallback flagging
	// tracks the language picker even if a caller passes a non-ref snapshot.
	const interfaceLocaleState = useState<string>( 'interfaceLocale', () => 'en' )
	const resolvedActiveLocale = computed( () => {
		const fromArg = toValue( activeLocale )
		if ( typeof fromArg === 'string' && fromArg.length > 0 ) {
			return fromArg
		}
		return interfaceLocaleState.value
	} )

	const {
		chainResultGroups,
		isSearching,
		hasSearchError,
		hasQuery,
		loadContentIndex
	} = useContentSearch( query, resolvedActiveLocale )

	const { endpointResults, isEndpointIndexLoading } = useEndpointSearch(
		query,
		SEARCH_PROTOTYPE_ENDPOINT_RESULT_POOL
	)

	const selectedCategory = ref<SearchPrototypeCategory>( 'all' )
	const visibleCount = ref( SEARCH_PROTOTYPE_VISIBLE_ITEM_LIMIT )
	const isPendingVisible = ref( false )

	let pendingTimer: ReturnType<typeof setTimeout> | undefined

	const isSearchInFlight = computed(
		() => isSearching.value || isEndpointIndexLoading.value
	)

	// RES-12: show pending only after the Codex-default 500 ms delay.
	watch( isSearchInFlight, ( inFlight ) => {
		if ( pendingTimer !== undefined ) {
			clearTimeout( pendingTimer )
			pendingTimer = undefined
		}
		if ( !inFlight ) {
			isPendingVisible.value = false
			return
		}
		pendingTimer = setTimeout( () => {
			if ( isSearchInFlight.value ) {
				isPendingVisible.value = true
			}
		}, SEARCH_PROTOTYPE_PENDING_DELAY_MS )
	} )

	const documentationItems = computed( () =>
		mapDocumentationSearchItems(
			chainResultGroups.value,
			resolvedActiveLocale.value
		)
	)

	const endpointItems = computed( () =>
		mapEndpointSearchItems( endpointResults.value )
	)

	const endpointCount = computed( () => endpointItems.value.length )
	const documentationCount = computed( () => documentationItems.value.length )
	const allCount = computed( () => endpointCount.value + documentationCount.value )

	const orderedItems = computed( () =>
		orderGlobalSearchPanelItems(
			documentationItems.value,
			endpointItems.value,
			selectedCategory.value
		)
	)

	const categoryCount = computed( () => {
		if ( selectedCategory.value === 'endpoints' ) {
			return endpointCount.value
		}
		if ( selectedCategory.value === 'documentation' ) {
			return documentationCount.value
		}
		return allCount.value
	} )

	const tieredItems = computed( () => splitEnglishFallbackTier( orderedItems.value ) )

	const flatOrderedItems = computed( () => [
		...tieredItems.value.primaryItems,
		...tieredItems.value.englishFallbackItems
	] )

	const visibleTiers = computed( () =>
		sliceVisibleSearchTiers(
			tieredItems.value.primaryItems,
			tieredItems.value.englishFallbackItems,
			visibleCount.value
		)
	)

	const visiblePrimaryItems = computed( () => visibleTiers.value.visiblePrimaryItems )
	const visibleEnglishFallbackItems = computed(
		() => visibleTiers.value.visibleEnglishFallbackItems
	)
	const showEnglishFallbackDivider = computed(
		() => visibleTiers.value.showEnglishFallbackDivider
	)

	const hasMoreResults = computed(
		() => visibleCount.value < flatOrderedItems.value.length
	)

	const showNoResults = computed( () =>
		hasQuery.value &&
		!isSearchInFlight.value &&
		!hasSearchError.value &&
		categoryCount.value === 0
	)

	// Reset disclosure window when the query or chip changes (RES-15).
	watch( [ query, selectedCategory ], () => {
		visibleCount.value = SEARCH_PROTOTYPE_VISIBLE_ITEM_LIMIT
	} )

	/**
	 * Selects a category chip and resets the scroll window.
	 *
	 * @param category - Chip to select.
	 */
	function selectCategory( category: SearchPrototypeCategory ): void {
		selectedCategory.value = category
	}

	/**
	 * Appends the next disclosure chunk (UI-03 / load-more).
	 */
	function loadMoreResults(): void {
		if ( !hasMoreResults.value ) {
			return
		}
		visibleCount.value = Math.min(
			flatOrderedItems.value.length,
			visibleCount.value + SEARCH_PROTOTYPE_LOAD_MORE_CHUNK_SIZE
		)
	}

	/**
	 * Clears the query-driven panel state when the menu closes.
	 */
	function resetPanelChrome(): void {
		selectedCategory.value = 'all'
		visibleCount.value = SEARCH_PROTOTYPE_VISIBLE_ITEM_LIMIT
	}

	return {
		hasQuery,
		hasSearchError,
		isPendingVisible,
		isSearchInFlight,
		loadContentIndex,
		selectedCategory,
		selectCategory,
		endpointCount,
		documentationCount,
		allCount,
		categoryCount,
		visiblePrimaryItems,
		visibleEnglishFallbackItems,
		showEnglishFallbackDivider,
		showNoResults,
		hasMoreResults,
		loadMoreResults,
		resetPanelChrome,
		flatOrderedItems
	}
}
