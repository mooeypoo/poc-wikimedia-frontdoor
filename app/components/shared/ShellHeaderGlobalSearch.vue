<script setup lang="ts">
import {
	CdxButton,
	CdxMenu,
	CdxMessage,
	CdxSearchInput,
	type MenuItemData,
	type MenuItemValue
} from '@wikimedia/codex'
import { SEARCH_PROTOTYPE_VISIBLE_ITEM_LIMIT } from '../../../config/searchPrototype'
import { useGlobalSearchPanel } from '../../composables/useGlobalSearchPanel'
import {
	toCodexMenuEntries,
	type GlobalSearchPanelItem
} from '../../utils/globalSearchPanel'
import {
	getInterfaceMessageTemplate,
	splitMessageAtFirstPositionalParameter,
	splitMessageAtTwoPositionalParameters
} from '../../utils/getInterfaceMessageTemplate'
import { getLanguageByCode } from '../../../config/languages'

/**
 * Global search prototype — `CdxSearchInput` + category chips + `CdxMenu`.
 *
 * Codex `CdxTypeaheadSearch` has no menu header slot for chips (UI-01 / OQ23).
 * This composes SearchInput with a panel that places chips **above** an in-place
 * `CdxMenu`, and delegates ArrowUp/Down/Enter/Escape to
 * `menu.delegateKeyNavigation()` so keyboard behaviour matches Codex Lookup /
 * TypeaheadSearch. Chips stay outside the listbox (sibling, not a Menu slot).
 *
 * Data path: `useContentSearch` + `useEndpointSearch` via `useGlobalSearchPanel`.
 */

/**
 * Minimal Menu instance surface used for keyboard delegation and highlight id.
 */
interface GlobalSearchCodexMenu {
	delegateKeyNavigation: (
		event: KeyboardEvent,
		options?: { prevent?: boolean, characterNavigation?: boolean }
	) => boolean
	getHighlightedMenuItem: () => { id: string } | null
}

const props = withDefaults( defineProps<{
	/** When true, stretch to fill a collapsed overlay instead of a dropdown. */
	variant?: 'dropdown' | 'overlay'
}>(), {
	variant: 'dropdown'
} )

const searchQuery = defineModel<string>( 'searchQuery', { required: true } )

const emit = defineEmits<{
	'result-select': [ item: GlobalSearchPanelItem ]
	close: []
}>()

const { $bananaI18n, $interfaceLocale } = useNuxtApp()

const {
	hasQuery,
	hasSearchError,
	isPendingVisible,
	loadContentIndex,
	selectedCategory,
	selectCategory,
	endpointCount,
	documentationCount,
	allCount,
	visiblePrimaryItems,
	visibleEnglishFallbackItems,
	showEnglishFallbackDivider,
	showNoResults,
	hasMoreResults,
	loadMoreResults,
	resetPanelChrome,
	flatOrderedItems
} = useGlobalSearchPanel( searchQuery, $interfaceLocale )

const isMenuOpen = ref( false )
const isResultsScrolled = ref( false )
const menuSelected = ref<MenuItemValue | null>( null )
const menuId = useId()
const rootRef = useTemplateRef<HTMLElement>( 'rootRef' )
const menuRef = useTemplateRef<GlobalSearchCodexMenu>( 'menuRef' )
const panelBodyRef = useTemplateRef<HTMLElement>( 'panelBodyRef' )

/*
 * One string for both placeholder and accessible name — VoiceOver concatenates
 * aria-label + placeholder when they differ.
 */
const searchFieldLabel = computed( () =>
	$bananaI18n( 'header-search-placeholder' )
)
const resultsPanelLabel = computed( () =>
	$bananaI18n( 'search-results-panel-label' )
)
const searchErrorMessage = computed( () =>
	$bananaI18n( 'search-content-unavailable' )
)
const retryLabel = computed( () => $bananaI18n( 'search-retry-label' ) )
const searchingLabel = computed( () =>
	$bananaI18n( 'search-content-in-progress' )
)

/**
 * Resolves a language display name for headings / empty states (banana, else autonym).
 *
 * @param localeCode - BCP 47 interface or result locale.
 * @returns Translated or catalog language name.
 */
function interfaceLanguageDisplayName( localeCode: string ): string {
	const messageKey = `interface-language-${ localeCode }`
	const translated = $bananaI18n( messageKey )
	if ( translated !== messageKey ) {
		return translated
	}
	return getLanguageByCode( localeCode )?.autonym ?? localeCode
}

/**
 * "Results in English" — used as a Codex Menu group label.
 */
const englishFallbackHeading = computed( () =>
	$bananaI18n( 'search-results-locale-heading', {
		$1: interfaceLanguageDisplayName( 'en' )
	} )
)

/**
 * Category-aware empty copy (Figma): includes interface language for All /
 * Documentation; endpoints omit language (English-only index). Query is split
 * out so the template can bold + `<bdi>` it without `v-html`.
 */
const noResultsCopy = computed( () => {
	const query = searchQuery.value.trim()
	const languageName = interfaceLanguageDisplayName( $interfaceLocale.value )

	if ( selectedCategory.value === 'endpoints' ) {
		const segments = splitMessageAtFirstPositionalParameter(
			getInterfaceMessageTemplate(
				'search-no-results-endpoints',
				$interfaceLocale.value
			)
		)
		return {
			kind: 'query-only' as const,
			before: segments.beforeParameter,
			after: segments.afterParameter,
			query,
			languageName: null as string | null
		}
	}

	const messageKey = selectedCategory.value === 'documentation'
		? 'search-no-results-documentation'
		: 'search-no-results-all'
	const segments = splitMessageAtTwoPositionalParameters(
		getInterfaceMessageTemplate( messageKey, $interfaceLocale.value )
	)
	return {
		kind: 'query-and-language' as const,
		before: segments.beforeFirstParameter,
		between: segments.betweenParameters,
		after: segments.afterSecondParameter,
		query,
		languageName
	}
} )

const showMenu = computed( () => {
	if ( props.variant === 'overlay' ) {
		return hasQuery.value
	}
	return isMenuOpen.value && hasQuery.value
} )

const menuEntries = computed( () =>
	toCodexMenuEntries(
		visiblePrimaryItems.value,
		visibleEnglishFallbackItems.value,
		englishFallbackHeading.value,
		showEnglishFallbackDivider.value
	)
)

/**
 * Codex only wires `load-more` when item count exceeds `visibleItemLimit`.
 * When more results exist beyond the disclosure window, keep limit one below
 * the current slice so the list scrolls and load-more can fire.
 */
const menuVisibleItemLimit = computed( (): number | null => {
	const itemCount = visiblePrimaryItems.value.length +
		visibleEnglishFallbackItems.value.length
	if ( itemCount === 0 ) {
		return SEARCH_PROTOTYPE_VISIBLE_ITEM_LIMIT
	}
	if ( hasMoreResults.value && itemCount > 1 ) {
		return Math.min( SEARCH_PROTOTYPE_VISIBLE_ITEM_LIMIT, itemCount - 1 )
	}
	return SEARCH_PROTOTYPE_VISIBLE_ITEM_LIMIT
} )

const highlightedOptionId = computed( () => {
	const highlighted = menuRef.value?.getHighlightedMenuItem() ?? null
	return highlighted?.id
} )

const itemById = computed( () => {
	const map = new Map<string, GlobalSearchPanelItem>()
	for ( const item of flatOrderedItems.value ) {
		map.set( item.id, item )
	}
	return map
} )

watch( hasQuery, ( nextHasQuery ) => {
	if ( nextHasQuery ) {
		isMenuOpen.value = true
	}
} )

/**
 * Codex Menu scrolls its `.cdx-menu__listbox` when `visibleItemLimit` is set —
 * not our panel body — so the chips divider must listen there. Scroll does not
 * bubble, so a body `@scroll` never sees it.
 */
let listboxScrollport: HTMLElement | null = null

/**
 * Updates the chips bottom-edge from a scrollport's scroll offset.
 *
 * @param event - Scroll event from the Menu listbox or panel body.
 */
function handlePanelScroll( event: Event ): void {
	const scrollport = event.currentTarget
	if ( !( scrollport instanceof HTMLElement ) ) {
		return
	}
	isResultsScrolled.value = scrollport.scrollTop > 0
}

/**
 * Detaches the listbox scroll listener if one is bound.
 */
function unbindListboxScroll(): void {
	if ( listboxScrollport ) {
		listboxScrollport.removeEventListener( 'scroll', handlePanelScroll )
		listboxScrollport = null
	}
}

/**
 * Binds scroll tracking to Codex Menu's listbox (the real overflow scrollport).
 */
function bindListboxScroll(): void {
	unbindListboxScroll()
	const listbox = panelBodyRef.value?.querySelector( '.cdx-menu__listbox' )
	if ( !( listbox instanceof HTMLElement ) ) {
		return
	}
	listboxScrollport = listbox
	listbox.addEventListener( 'scroll', handlePanelScroll, { passive: true } )
	isResultsScrolled.value = listbox.scrollTop > 0
}

/**
 * Resets result scrollports to the top and clears the chips divider.
 */
function resetResultsScroll(): void {
	isResultsScrolled.value = false
	if ( panelBodyRef.value ) {
		panelBodyRef.value.scrollTop = 0
	}
	if ( listboxScrollport ) {
		listboxScrollport.scrollTop = 0
	}
}

watch( showMenu, ( isOpen ) => {
	if ( !isOpen ) {
		unbindListboxScroll()
		isResultsScrolled.value = false
		menuSelected.value = null
		return
	}
	nextTick( () => {
		bindListboxScroll()
	} )
} )

watch( [ searchQuery, selectedCategory ], () => {
	menuSelected.value = null
	nextTick( () => {
		bindListboxScroll()
		resetResultsScroll()
	} )
} )

// Listbox can remount when pending / no-results / items swap — rebind.
watch( [ menuEntries, isPendingVisible, showNoResults ], () => {
	if ( !showMenu.value ) {
		return
	}
	nextTick( () => {
		bindListboxScroll()
	} )
} )

onBeforeUnmount( () => {
	unbindListboxScroll()
} )

/**
 * Opens the menu on focus when a query is already present.
 */
function handleFocusIn(): void {
	void loadContentIndex()
	if ( hasQuery.value ) {
		isMenuOpen.value = true
	}
}

/**
 * Closes the dropdown when focus leaves the control (dropdown variant only).
 *
 * @param event - FocusOut event.
 */
function handleFocusOut( event: FocusEvent ): void {
	if ( props.variant === 'overlay' ) {
		return
	}
	const nextTarget = event.relatedTarget
	if ( nextTarget instanceof Node && rootRef.value?.contains( nextTarget ) ) {
		return
	}
	isMenuOpen.value = false
}

/**
 * Delegates navigation keys to `CdxMenu`; keeps Space for typing.
 *
 * @param event - Keyboard event from the search input.
 */
function handleInputKeydown( event: KeyboardEvent ): void {
	// Space must insert a character in the query (Codex input-with-menu pattern).
	if ( event.key === ' ' ) {
		return
	}

	if ( event.key === 'Escape' && isMenuOpen.value ) {
		event.stopPropagation()
		isMenuOpen.value = false
		resetPanelChrome()
		return
	}

	if ( !showMenu.value || !menuRef.value ) {
		return
	}

	menuRef.value.delegateKeyNavigation( event, {
		prevent: true,
		characterNavigation: false
	} )
}

// Click path emits both `menu-item-click` and `update:selected` — guard so we
// only navigate once.
let isActivatingResult = false

/**
 * Activates a panel item: navigate, clear chrome, notify parent.
 *
 * @param item - Selected panel item.
 */
function activateItem( item: GlobalSearchPanelItem ): void {
	if ( isActivatingResult ) {
		return
	}
	isActivatingResult = true
	isMenuOpen.value = false
	menuSelected.value = null
	resetPanelChrome()
	emit( 'result-select', item )
	void navigateTo( item.url )
	if ( props.variant === 'overlay' ) {
		emit( 'close' )
	}
	nextTick( () => {
		isActivatingResult = false
	} )
}

/**
 * Resolves a Codex menu value to a panel item and activates it.
 *
 * @param value - Menu item value (panel id), or null when cleared.
 */
function handleMenuSelected( value: MenuItemValue | MenuItemValue[] | null ): void {
	if ( value === null || Array.isArray( value ) ) {
		menuSelected.value = null
		return
	}
	menuSelected.value = value
	const item = itemById.value.get( String( value ) )
	if ( item ) {
		activateItem( item )
	}
}

/**
 * Handles pointer activation from `CdxMenu`.
 *
 * @param menuItem - Codex menu item payload.
 */
function handleMenuItemClick( menuItem: MenuItemData ): void {
	const item = itemById.value.get( String( menuItem.value ) )
	if ( item ) {
		activateItem( item )
	}
}

/**
 * Collapses the panel when Menu requests it (e.g. Escape via delegation).
 *
 * @param nextExpanded - Next expanded state from CdxMenu.
 */
function handleMenuExpanded( nextExpanded: boolean ): void {
	if ( !nextExpanded ) {
		isMenuOpen.value = false
	}
}

/**
 * Retries content index load after an error.
 */
function handleRetry(): void {
	void loadContentIndex()
}

/**
 * Appends the next disclosure chunk when Menu signals load-more.
 */
function handleLoadMore(): void {
	if ( hasMoreResults.value ) {
		loadMoreResults()
	}
}

</script>

<template>
	<div
		ref="rootRef"
		class="shell-header-global-search"
		:class="{
			'shell-header-global-search--overlay': variant === 'overlay',
			'shell-header-global-search--menu-open': showMenu
		}"
		@focusout="handleFocusOut"
	>
		<CdxSearchInput
			v-model="searchQuery"
			class="shell-header-global-search__input"
			dir="auto"
			:use-button="false"
			:clearable="true"
			:placeholder="searchFieldLabel"
			:aria-label="searchFieldLabel"
			role="combobox"
			autocomplete="off"
			aria-autocomplete="list"
			:aria-controls="menuId"
			:aria-expanded="showMenu"
			:aria-activedescendant="highlightedOptionId"
			@focusin="handleFocusIn"
			@keydown="handleInputKeydown"
		/>

		<!--
			Chips sibling above CdxMenu (Menu has no header slot). Region — not
			dialog — so SRs announce “Results” rather than “Dialog with N items”.
		-->
		<div
			v-show="showMenu"
			class="shell-header-global-search__panel"
			role="region"
			:aria-label="resultsPanelLabel"
			@mousedown.prevent
		>
			<div
				class="shell-header-global-search__chips"
				:class="{
					'shell-header-global-search__chips--scrolled': isResultsScrolled
				}"
			>
				<SharedGlobalSearchCategoryChips
					:selected-category="selectedCategory"
					:all-count="allCount"
					:endpoint-count="endpointCount"
					:documentation-count="documentationCount"
					@select="selectCategory"
				/>
			</div>

			<div
				ref="panelBodyRef"
				class="shell-header-global-search__body"
				@scroll.passive="handlePanelScroll"
			>
				<CdxMessage
					v-if="hasSearchError"
					class="shell-header-global-search__error"
					type="error"
					:inline="true"
				>
					{{ searchErrorMessage }}
					<CdxButton
						class="shell-header-global-search__retry"
						weight="quiet"
						@click="handleRetry"
					>
						{{ retryLabel }}
					</CdxButton>
				</CdxMessage>

				<!--
					In-place Menu: strip floating chrome so the panel owns border /
					shadow; keyboard nav via delegateKeyNavigation on the input.
					Default slot puts HTTP method before the title (Figma); Codex
					stock supportingText would render after the label.
				-->
				<CdxMenu
					:id="menuId"
					ref="menuRef"
					class="shell-header-global-search__cdx-menu"
					:selected="menuSelected"
					:expanded="showMenu && !hasSearchError"
					:menu-items="menuEntries"
					:render-in-place="true"
					:show-pending="isPendingVisible"
					:visible-item-limit="menuVisibleItemLimit"
					:bold-label="true"
					:hide-description-overflow="true"
					:show-no-results-slot="showNoResults"
					:aria-label="resultsPanelLabel"
					@update:selected="handleMenuSelected"
					@update:expanded="handleMenuExpanded"
					@menu-item-click="handleMenuItemClick"
					@load-more="handleLoadMore"
				>
					<template #pending>
						<span>{{ searchingLabel }}</span>
					</template>
					<template #no-results>
						<span class="shell-header-global-search__no-results">
							<template v-if="noResultsCopy.kind === 'query-only'">
								{{ noResultsCopy.before }}<bdi
									class="shell-header-global-search__no-results-query"
								>{{ noResultsCopy.query }}</bdi>{{ noResultsCopy.after }}
							</template>
							<template v-else>
								{{ noResultsCopy.before }}<bdi
									class="shell-header-global-search__no-results-query"
								>{{ noResultsCopy.query }}</bdi>{{ noResultsCopy.between }}<bdi>{{
									noResultsCopy.languageName
								}}</bdi>{{ noResultsCopy.after }}
							</template>
						</span>
					</template>
					<!--
						Codex puts supportingText after the label; Figma wants the
						HTTP method before the title — custom row for endpoints only.
					-->
					<template #default="{ menuItem }">
						<span class="cdx-menu-item__content">
							<span class="cdx-menu-item__text">
								<span
									v-if="menuItem.supportingText"
									class="shell-header-global-search__endpoint-row"
								>
									<bdi
										class="shell-header-global-search__method"
										dir="ltr"
									>{{ menuItem.supportingText }}</bdi>
									<bdi class="cdx-menu-item__text__label">{{
										menuItem.label ?? menuItem.value
									}}</bdi>
								</span>
								<span
									v-else
									class="cdx-menu-item__text__label"
								>
									<bdi>{{ menuItem.label ?? menuItem.value }}</bdi>
								</span>
								<span
									v-if="menuItem.description"
									class="cdx-menu-item__text__description"
								>
									<bdi>{{ menuItem.description }}</bdi>
								</span>
							</span>
						</span>
					</template>
				</CdxMenu>
			</div>
		</div>
	</div>
</template>

<style scoped>
.shell-header-global-search {
	position: relative;
	flex: 1 1 auto;
	min-inline-size: 0;
}

.shell-header-global-search__input {
	inline-size: 100%;
}

.shell-header-global-search__input:deep( .cdx-text-input ) {
	min-inline-size: var( --fd-header-search-input-min-inline-size );
}

/* Collapsed overlay must shrink below Codex’s 256px default between mobile margins. */
.shell-header-global-search--overlay .shell-header-global-search__input:deep( .cdx-text-input ) {
	min-inline-size: 0;
}

/*
 * Open menu sits flush under the field (no gap), matching Codex TypeaheadSearch:
 * join corners use --border-radius-sharp so input + panel read as one surface.
 */
.shell-header-global-search--menu-open .shell-header-global-search__input:deep( .cdx-text-input ) {
	border-end-start-radius: var( --border-radius-sharp );
	border-end-end-radius: var( --border-radius-sharp );
}

.shell-header-global-search__panel {
	position: absolute;
	inset-block-start: 100%;
	inset-inline: 0;
	z-index: 5;
	display: flex;
	flex-direction: column;
	max-block-size: min( 70vh, 32rem );
	margin-block-start: 0;
	border: 1px solid var( --border-color-base );
	border-radius: var( --border-radius-base );
	background-color: var( --background-color-base );
	box-shadow: var( --box-shadow-drop-medium );
	overflow: hidden;
}

.shell-header-global-search--menu-open .shell-header-global-search__panel {
	border-start-start-radius: var( --border-radius-sharp );
	border-start-end-radius: var( --border-radius-sharp );
}

.shell-header-global-search--overlay .shell-header-global-search__panel {
	position: relative;
	inset: auto;
	max-block-size: none;
	flex: 1 1 auto;
	box-shadow: none;
}

.shell-header-global-search__chips {
	flex: 0 0 auto;
	border-block-end: 1px solid transparent;
	background-color: var( --background-color-base );
	transition: border-block-end-color var( --transition-duration-base ) var( --transition-timing-function-system );
}

.shell-header-global-search__chips--scrolled {
	border-block-end-color: var( --border-color-subtle );
}

.shell-header-global-search__body {
	flex: 1 1 auto;
	min-block-size: 0;
	overflow-block: auto;
	overscroll-behavior: contain;
}

/*
 * CdxMenu root defaults to `position: absolute` (Codex). Our BEM class is on
 * that same root via attr fallthrough — use `:deep` so scoped CSS reaches it,
 * and target the class itself (not a nested `.cdx-menu`; that never matched,
 * so the list stayed absolute, the panel body collapsed to 0, and the panel’s
 * `overflow: hidden` clipped the results).
 */
:deep( .shell-header-global-search__cdx-menu ) {
	position: static;
	inset: auto;
	z-index: auto;
	inline-size: 100%;
	border: none;
	border-radius: 0;
	box-shadow: none;
}

/*
 * English-fallback group label — match Figma / legacy SearchResults locale
 * heading (uppercase). Banana source must keep diacritics (e.g. Inglés).
 */
:deep( .shell-header-global-search__cdx-menu .cdx-menu__group__label ) {
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-bold );
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var( --color-subtle );
}

.shell-header-global-search__error {
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-75 );
}

.shell-header-global-search__retry {
	margin-block-start: var( --spacing-50 );
}

.shell-header-global-search__endpoint-row {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.shell-header-global-search__method {
	flex-shrink: 0;
	font-family: var( --font-family-monospace );
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	color: var( --color-progressive );
}

.shell-header-global-search__no-results {
	display: block;
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-75 );
	color: var( --color-subtle );
}

.shell-header-global-search__no-results-query {
	font-weight: var( --font-weight-bold );
	color: var( --color-base );
}
</style>
