import { computed, ref, type ComputedRef, type Ref, type WritableComputedRef } from 'vue'
import {
	API_CATALOG_PROJECT_FILTER_DEFAULT,
	API_CATALOG_PROJECT_FILTER_OPTIONS,
	API_CATALOG_WIKIMEDIA_CARDS,
	isApiCatalogCardVisibleForProjectFilter,
	type ApiCatalogProjectFilterId,
	type ApiCatalogWikimediaCard
} from '../../config/apiCatalogWikimedia'
import { isolatePickerLabel } from '../utils/bidiLabel'

/**
 * Codex Combobox menu item for the API catalog project filter.
 *
 * @property label - Display label with BiDi isolation ({@link isolatePickerLabel}).
 * @property value - Combobox value (translated label without isolation markers).
 */
export interface ApiCatalogProjectFilterMenuItem {
	label: string
	value: string
}

/**
 * Client-side project filter state for the Wikimedia APIs catalog section.
 *
 * Keeps `/apis` static (SSG Markdown); filtering only shows/hides cards in the
 * hydrated Vue island (not a `<ClientOnly>` route — the page stays pre-rendered
 * with the default “Any” selection). Combobox option labels come from
 * banana-i18n; card copy stays in {@link API_CATALOG_WIKIMEDIA_CARDS}. Combobox
 * `selected` uses translated labels (same bridge pattern as
 * {@link useExplorerProjectLanguagePicker}).
 *
 * @returns Filter chrome strings, menu items, selection bridge, and visible cards.
 */
export function useApiCatalogProjectFilter(): {
	/** banana-i18n “Filter by project” field label. */
	filterLabel: ComputedRef<string>
	/** Combobox menu items (isolated labels, plain values). */
	projectFilterMenuItems: ComputedRef<ApiCatalogProjectFilterMenuItem[]>
	/** Stable filter id (`any` | project ids). */
	selectedProjectFilterId: Ref<ApiCatalogProjectFilterId>
	/** Codex Combobox `selected` bridge (translated label ↔ filter id). */
	projectFilterComboboxSelected: WritableComputedRef<string>
	/** Cards visible for the current filter (universal + matching). */
	visibleCards: ComputedRef<ApiCatalogWikimediaCard[]>
	/** banana-i18n empty-state copy when no cards match. */
	emptyFilterLabel: ComputedRef<string>
} {
	const { $bananaI18n } = useNuxtApp()

	const selectedProjectFilterId = ref<ApiCatalogProjectFilterId>(
		API_CATALOG_PROJECT_FILTER_DEFAULT
	)

	const filterLabel = computed( () => $bananaI18n( 'api-catalog-filter-by-project-label' ) )
	const emptyFilterLabel = computed( () => $bananaI18n( 'api-catalog-filter-empty' ) )

	/**
	 * Resolves the banana label for a filter option id.
	 *
	 * @param filterId - Stable project filter id.
	 * @returns Translated option label (without BiDi isolation markers).
	 */
	function labelForFilterId( filterId: ApiCatalogProjectFilterId ): string {
		const option = API_CATALOG_PROJECT_FILTER_OPTIONS.find(
			( filterOption ) => filterOption.id === filterId
		)
		return option ? $bananaI18n( option.messageKey ) : $bananaI18n(
			API_CATALOG_PROJECT_FILTER_OPTIONS[ 0 ].messageKey
		)
	}

	/**
	 * Maps a combobox selected label back to a filter id.
	 *
	 * @param selectedLabel - Combobox selected string (translated label).
	 * @returns Matching filter id, or the default “Any” id.
	 */
	function filterIdForLabel( selectedLabel: string ): ApiCatalogProjectFilterId {
		const matchedOption = API_CATALOG_PROJECT_FILTER_OPTIONS.find(
			( option ) => $bananaI18n( option.messageKey ) === selectedLabel
		)
		return matchedOption?.id ?? API_CATALOG_PROJECT_FILTER_DEFAULT
	}

	const projectFilterMenuItems = computed<ApiCatalogProjectFilterMenuItem[]>( () => {
		return API_CATALOG_PROJECT_FILTER_OPTIONS.map( ( option ) => {
			const label = $bananaI18n( option.messageKey )
			return {
				value: label,
				label: isolatePickerLabel( label )
			}
		} )
	} )

	/**
	 * Bridges Codex Combobox `selected` (translated label) to the reactive
	 * filter id. Unknown labels fall back to “Any”.
	 */
	const projectFilterComboboxSelected = computed<string>( {
		get() {
			return labelForFilterId( selectedProjectFilterId.value )
		},
		set( nextSelectedLabel: string ) {
			selectedProjectFilterId.value = filterIdForLabel( nextSelectedLabel )
		}
	} )

	const visibleCards = computed( () => {
		return API_CATALOG_WIKIMEDIA_CARDS.filter( ( card ) =>
			isApiCatalogCardVisibleForProjectFilter( card, selectedProjectFilterId.value )
		)
	} )

	return {
		filterLabel,
		projectFilterMenuItems,
		selectedProjectFilterId,
		projectFilterComboboxSelected,
		visibleCards,
		emptyFilterLabel
	}
}
