<script setup lang="ts">
import {
	CdxButton,
	CdxMenu,
	CdxMessage,
	CdxSearchInput,
	type MenuItemData,
	type MenuItemValue
} from '@wikimedia/codex'
import {
	SEARCH_PROTOTYPE_SLOW_SEARCH_ANNOUNCE_MS,
	SEARCH_PROTOTYPE_STATUS_ANNOUNCE_DELAY_MS,
	SEARCH_PROTOTYPE_VISIBLE_ITEM_LIMIT
} from '../../../config/searchPrototype'
import { useDirection } from '../../composables/useDirection'
import { useGlobalSearchPanel } from '../../composables/useGlobalSearchPanel'
import {
	computeGlobalSearchOptionPosition,
	globalSearchOptionTypeMessageKey,
	resolveGlobalSearchAnnouncement,
	resolveGlobalSearchInputKeyAction
} from '../../utils/globalSearchAccessibility'
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
 * TypeaheadSearch — except Tab, which must never select (WCAG).
 *
 * Data path: `useContentSearch` + `useEndpointSearch` via `useGlobalSearchPanel`.
 */

/**
 * Minimal Menu instance surface used for keyboard delegation and highlight id.
 *
 * Codex’s public `clearActive()` only clears the mousedown “active” state, not
 * the keyboard highlight. With `expose` disabled upstream, setup also surfaces
 * `handleMenuItemChange`, which we use to clear highlight on Tab / Esc.
 */
interface GlobalSearchCodexMenu {
	delegateKeyNavigation: (
		event: KeyboardEvent,
		options?: { prevent?: boolean, characterNavigation?: boolean }
	) => boolean
	getHighlightedMenuItem: () => { id: string, value?: string | number } | null
	clearActive: () => void
	handleMenuItemChange?: (
		menuState: string,
		menuItem: { id: string } | null
	) => void
}

const props = withDefaults( defineProps<{
	/**
	 * `dropdown` — header utility field + floating panel (7-row window).
	 * `overlay` — full-viewport Dialog body (no 7-row cap; chips wrap).
	 */
	variant?: 'dropdown' | 'overlay'
}>(), {
	variant: 'dropdown'
} )

const searchQuery = defineModel<string>( 'searchQuery', { required: true } )

const emit = defineEmits<{
	'result-select': [ item: GlobalSearchPanelItem ]
	close: []
}>()

/**
 * Optional leading control in overlay mode (quiet Back beside the field).
 * Unused in dropdown mode.
 */
defineSlots<{
	leading?: () => unknown
}>()

const { $bananaI18n, $interfaceLocale } = useNuxtApp()
const { direction } = useDirection()
const isRtl = computed( () => direction.value === 'rtl' )

const isOverlayVariant = computed( () => props.variant === 'overlay' )

const {
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
	visiblePrimaryItems,
	visibleEnglishFallbackItems,
	showEnglishFallbackDivider,
	showNoResults,
	hasMoreResults,
	loadMoreResults,
	resetPanelChrome,
	flatOrderedItems
} = useGlobalSearchPanel( searchQuery, $interfaceLocale, {
	unboundedDisclosure: isOverlayVariant
} )

const isMenuOpen = ref( false )
const isResultsScrolled = ref( false )
const menuSelected = ref<MenuItemValue | null>( null )
const menuId = useId()
const rootRef = useTemplateRef<HTMLElement>( 'rootRef' )
const menuRef = useTemplateRef<GlobalSearchCodexMenu>( 'menuRef' )
const panelBodyRef = useTemplateRef<HTMLElement>( 'panelBodyRef' )
const searchInputHostRef = useTemplateRef<HTMLElement>( 'searchInputHostRef' )

/** Keyboard-highlight option id for `aria-activedescendant` (reactive). */
const highlightedOptionId = ref<string | undefined>( undefined )

/** Live status / alert text — always mounted; cleared between announcements. */
const statusAnnouncementText = ref( '' )
const statusAnnouncementRole = ref<'status' | 'alert'>( 'status' )

let statusAnnounceTimer: ReturnType<typeof setTimeout> | undefined
let slowSearchAnnounceTimer: ReturnType<typeof setTimeout> | undefined

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
 *
 * Overlay / Dialog mode (§5.1.7.3) does not use the 7-row window — `null` lets
 * the Dialog body scroll the full list.
 */
const menuVisibleItemLimit = computed( (): number | null => {
	if ( isOverlayVariant.value ) {
		return null
	}
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

/** Single-line ellipsis on desktop menu; unrestricted wrap in the Dialog (OQ4 / mobile). */
const hideDescriptionOverflow = computed( () => !isOverlayVariant.value )

const itemById = computed( () => {
	const map = new Map<string, GlobalSearchPanelItem>()
	for ( const item of flatOrderedItems.value ) {
		map.set( item.id, item )
	}
	return map
} )

const orderedItemIds = computed( () => flatOrderedItems.value.map( ( item ) => item.id ) )

watch( hasQuery, ( nextHasQuery ) => {
	if ( nextHasQuery ) {
		isMenuOpen.value = true
	}
} )

/**
 * Clears Codex keyboard highlight. `clearActive()` alone is insufficient —
 * it only clears the pressed “active” state.
 */
function clearMenuHighlight(): void {
	menuRef.value?.handleMenuItemChange?.( 'highlighted', null )
	menuRef.value?.clearActive?.()
	highlightedOptionId.value = undefined
}

/**
 * Focuses the search field input (after chip Esc / Shift+Tab / type-back).
 */
function focusSearchInput(): void {
	searchInputHostRef.value?.querySelector<HTMLInputElement>( 'input' )?.focus()
}

/**
 * Publishes a live-region announcement after a short clear delay so identical
 * text is spoken again.
 *
 * @param announcement - Resolved announcement, or `null` to clear.
 */
function publishStatusAnnouncement(
	announcement: ReturnType<typeof resolveGlobalSearchAnnouncement>
): void {
	if ( statusAnnounceTimer !== undefined ) {
		clearTimeout( statusAnnounceTimer )
		statusAnnounceTimer = undefined
	}
	statusAnnouncementText.value = ''
	if ( !announcement ) {
		return
	}
	statusAnnounceTimer = setTimeout( () => {
		statusAnnouncementRole.value = announcement.role
		statusAnnouncementText.value = $bananaI18n(
			announcement.key,
			announcement.params
		)
	}, SEARCH_PROTOTYPE_STATUS_ANNOUNCE_DELAY_MS )
}

/**
 * Rebuilds the settled-search announcement from current panel counters.
 *
 * @param overrides - Optional one-shot flags (more-loaded / searching).
 */
function announceSettledSearch( overrides: {
	moreResultsLoaded?: boolean
	announceSearching?: boolean
} = {} ): void {
	publishStatusAnnouncement(
		resolveGlobalSearchAnnouncement( {
			hasActiveQuery: hasQuery.value,
			isSearchInFlight: isSearchInFlight.value,
			hasSearchError: hasSearchError.value,
			selectedCategory: selectedCategory.value,
			allCount: allCount.value,
			endpointCount: endpointCount.value,
			documentationCount: documentationCount.value,
			query: searchQuery.value.trim(),
			languageName: interfaceLanguageDisplayName( $interfaceLocale.value ),
			moreResultsLoaded: overrides.moreResultsLoaded,
			announceSearching: overrides.announceSearching
		} )
	)
}

// Announce when results settle or the chip changes (never per keystroke).
watch(
	[
		hasQuery,
		isSearchInFlight,
		hasSearchError,
		selectedCategory,
		allCount,
		endpointCount,
		documentationCount
	],
	() => {
		if ( isSearchInFlight.value ) {
			return
		}
		announceSettledSearch()
	}
)

// Slow-search “Searching…” after 1s in flight.
watch( isSearchInFlight, ( inFlight ) => {
	if ( slowSearchAnnounceTimer !== undefined ) {
		clearTimeout( slowSearchAnnounceTimer )
		slowSearchAnnounceTimer = undefined
	}
	if ( !inFlight || !hasQuery.value ) {
		return
	}
	slowSearchAnnounceTimer = setTimeout( () => {
		if ( isSearchInFlight.value && hasQuery.value ) {
			announceSettledSearch( { announceSearching: true } )
		}
	}, SEARCH_PROTOTYPE_SLOW_SEARCH_ANNOUNCE_MS )
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
 * Binds scroll tracking to the active results scrollport.
 *
 * Dropdown mode: Codex Menu's listbox (visibleItemLimit window).
 * Overlay Dialog: the panel body (full list; no 7-row Menu window).
 */
function bindListboxScroll(): void {
	unbindListboxScroll()
	const scrollport = isOverlayVariant.value ?
		panelBodyRef.value :
		panelBodyRef.value?.querySelector( '.cdx-menu__listbox' )
	if ( !( scrollport instanceof HTMLElement ) ) {
		return
	}
	listboxScrollport = scrollport
	listboxScrollport.addEventListener( 'scroll', handlePanelScroll, { passive: true } )
	isResultsScrolled.value = listboxScrollport.scrollTop > 0
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

/**
 * Applies `aria-posinset` / `aria-setsize` on Codex option nodes and `lang` on
 * the English-fallback group heading (Codex does not expose these as props).
 */
function annotateOptionSemantics(): void {
	const listbox = panelBodyRef.value?.querySelector( '.cdx-menu__listbox' )
	if ( !( listbox instanceof HTMLElement ) ) {
		return
	}

	const visibleIds = [
		...visiblePrimaryItems.value,
		...visibleEnglishFallbackItems.value
	].map( ( item ) => item.id )

	const optionElements = listbox.querySelectorAll<HTMLElement>( '[role="option"]' )
	let visibleIndex = 0
	optionElements.forEach( ( optionElement ) => {
		// Skip Codex no-results / pending rows (no matching panel id).
		if ( optionElement.classList.contains( 'cdx-menu__no-results' ) ||
			optionElement.classList.contains( 'cdx-menu__pending' ) ) {
			optionElement.removeAttribute( 'aria-posinset' )
			optionElement.removeAttribute( 'aria-setsize' )
			return
		}
		const itemId = visibleIds[ visibleIndex ]
		visibleIndex += 1
		if ( !itemId ) {
			return
		}
		const position = computeGlobalSearchOptionPosition( itemId, orderedItemIds.value )
		if ( !position ) {
			return
		}
		optionElement.setAttribute( 'aria-posinset', String( position.posinset ) )
		optionElement.setAttribute( 'aria-setsize', String( position.setsize ) )
	} )

	const groupLabel = listbox.querySelector( '.cdx-menu__group__label' )
	if ( groupLabel instanceof HTMLElement ) {
		// UI-language heading so `text-transform: uppercase` respects locale (e.g. Turkish).
		groupLabel.setAttribute( 'lang', $interfaceLocale.value )
	}
}

watch( showMenu, ( isOpen ) => {
	if ( !isOpen ) {
		unbindListboxScroll()
		isResultsScrolled.value = false
		menuSelected.value = null
		clearMenuHighlight()
		return
	}
	nextTick( () => {
		bindListboxScroll()
		annotateOptionSemantics()
	} )
} )

watch( [ searchQuery, selectedCategory ], () => {
	menuSelected.value = null
	clearMenuHighlight()
	nextTick( () => {
		bindListboxScroll()
		resetResultsScroll()
		annotateOptionSemantics()
	} )
} )

// Listbox can remount when pending / no-results / items swap — rebind + annotate.
watch( [ menuEntries, isPendingVisible, showNoResults ], () => {
	if ( !showMenu.value ) {
		return
	}
	nextTick( () => {
		bindListboxScroll()
		annotateOptionSemantics()
	} )
} )

onBeforeUnmount( () => {
	unbindListboxScroll()
	if ( statusAnnounceTimer !== undefined ) {
		clearTimeout( statusAnnounceTimer )
	}
	if ( slowSearchAnnounceTimer !== undefined ) {
		clearTimeout( slowSearchAnnounceTimer )
	}
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
 * Closes the dropdown when focus leaves the widget (dropdown variant only).
 *
 * Overlay relies on `CdxDialog` focus trap + inert; do not close on internal
 * focus moves (Back ↔ field ↔ chips).
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
	clearMenuHighlight()
}

/**
 * Routes field keydown: Tab never selects; Enter without highlight is a no-op;
 * Down when closed reopens; otherwise delegate to Codex Menu.
 *
 * @param event - Keyboard event from the search input.
 */
function handleInputKeydown( event: KeyboardEvent ): void {
	const hasHighlight = Boolean(
		highlightedOptionId.value ?? menuRef.value?.getHighlightedMenuItem()
	)
	const action = resolveGlobalSearchInputKeyAction( {
		key: event.key,
		altKey: event.altKey,
		isPanelOpen: showMenu.value,
		hasHighlight,
		hasActiveQuery: hasQuery.value
	} )

	if ( action.type === 'pass' ) {
		return
	}

	if ( action.type === 'tab' ) {
		clearMenuHighlight()
		// Do not preventDefault — browser moves focus (clear button or chips).
		return
	}

	if ( action.type === 'enter-noop' ) {
		event.preventDefault()
		return
	}

	if ( action.type === 'reopen-panel' ) {
		event.preventDefault()
		isMenuOpen.value = true
		clearMenuHighlight()
		return
	}

	if ( action.type === 'escape-close' ) {
		event.preventDefault()
		clearMenuHighlight()
		if ( props.variant === 'overlay' ) {
			// Dismiss the Dialog; do not stopPropagation so CdxDialog can close too.
			resetPanelChrome()
			emit( 'close' )
			return
		}
		event.stopPropagation()
		isMenuOpen.value = false
		resetPanelChrome()
		// Keep focus in the field; stop browsers clearing type=search on Esc.
		focusSearchInput()
		return
	}

	if ( action.type === 'delegate' && menuRef.value ) {
		menuRef.value.delegateKeyNavigation( event, {
			prevent: true,
			characterNavigation: false
		} )
		nextTick( () => {
			highlightedOptionId.value =
				menuRef.value?.getHighlightedMenuItem()?.id ?? undefined
		} )
	}
}

/**
 * Tracks keyboard highlight for `aria-activedescendant`.
 *
 * @param menuItem - Highlighted Codex menu item, or null.
 */
function handleMenuKeyboardNavigation(
	menuItem: { id: string } | null
): void {
	highlightedOptionId.value = menuItem?.id
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
	clearMenuHighlight()
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
		clearMenuHighlight()
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
		announceSettledSearch( { moreResultsLoaded: true } )
	}
}

/**
 * Selects a category chip, clears highlight, scrolls to top, announces.
 *
 * @param category - Chip id.
 */
function handleCategorySelect( category: typeof selectedCategory.value ): void {
	selectCategory( category )
	clearMenuHighlight()
	nextTick( () => {
		resetResultsScroll()
	} )
}

/**
 * Esc from a chip — close the dropdown panel, or dismiss the overlay Dialog.
 */
function handleChipEscape(): void {
	clearMenuHighlight()
	resetPanelChrome()
	if ( props.variant === 'overlay' ) {
		emit( 'close' )
		return
	}
	isMenuOpen.value = false
	focusSearchInput()
}

/**
 * Returns focus to the search field without closing the panel.
 */
function handleChipFocusInput(): void {
	focusSearchInput()
}

/**
 * Moves focus to the field and inserts a character typed on a chip.
 *
 * @param character - Single printable character.
 */
function handleChipTypeCharacter( character: string ): void {
	focusSearchInput()
	searchQuery.value = `${ searchQuery.value }${ character }`
}

/**
 * Resolves `lang` / `dir` when option text is not in the UI language.
 *
 * @param item - Panel row, or undefined when unknown.
 * @returns Language attributes for the text wrapper.
 */
function optionLanguageAttrs( item: GlobalSearchPanelItem | undefined ): {
	lang?: string
	dir?: 'ltr' | 'rtl'
} {
	if ( !item ) {
		return {}
	}
	const uiLocale = $interfaceLocale.value
	if ( item.kind === 'endpoint' ) {
		if ( uiLocale !== 'en' ) {
			return { lang: 'en', dir: 'ltr' }
		}
		return {}
	}
	if ( item.resultLocale && item.resultLocale !== uiLocale ) {
		return {
			lang: item.resultLocale,
			...( item.resultDir ? { dir: item.resultDir } : {} )
		}
	}
	return {}
}

/**
 * Visually hidden type prefix for All-view options.
 *
 * @param item - Panel row.
 * @returns Translated type label, or empty when filtered view / unknown.
 */
function optionTypeLabel( item: GlobalSearchPanelItem | undefined ): string {
	if ( !item || selectedCategory.value !== 'all' ) {
		return ''
	}
	return $bananaI18n( globalSearchOptionTypeMessageKey( item.kind ) )
}

/**
 * Looks up the panel item for a Codex menu row.
 *
 * @param menuItem - Codex default-slot payload.
 * @returns Panel item, or undefined.
 */
function panelItemForMenuItem(
	menuItem: MenuItemData
): GlobalSearchPanelItem | undefined {
	return itemById.value.get( String( menuItem.value ) )
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
		<!--
			Dedicated search live region — always present (not the route announcer).
			Visually hidden; rewritten after searches settle.
		-->
		<div
			class="shell-header-global-search__status"
			:role="statusAnnouncementRole"
			aria-atomic="true"
		>
			{{ statusAnnouncementText }}
		</div>

		<div class="shell-header-global-search__toolbar">
			<slot name="leading" />
			<div
				ref="searchInputHostRef"
				class="shell-header-global-search__input-host"
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
			</div>
		</div>

		<!--
			Chips sibling above CdxMenu (Menu has no header slot). Region — not
			dialog — so SRs announce “Results” rather than “Dialog with N items”.
			`v-if` (not `v-show`) so closed / SSR markup has no radiogroup.
		-->
		<div
			v-if="showMenu"
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
					:is-rtl="isRtl"
					@select="handleCategorySelect"
					@escape="handleChipEscape"
					@focus-input="handleChipFocusInput"
					@type-character="handleChipTypeCharacter"
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
					:hide-description-overflow="hideDescriptionOverflow"
					:show-no-results-slot="showNoResults"
					:aria-label="resultsPanelLabel"
					@update:selected="handleMenuSelected"
					@update:expanded="handleMenuExpanded"
					@menu-item-click="handleMenuItemClick"
					@menu-item-keyboard-navigation="handleMenuKeyboardNavigation"
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
						Whitespace between method / title / description is required
						for an honest accessible name.
					-->
					<template #default="{ menuItem }">
						<span class="cdx-menu-item__content">
							<span class="cdx-menu-item__text">
								<span
									v-if="optionTypeLabel( panelItemForMenuItem( menuItem ) )"
									class="shell-header-global-search__option-type"
								>{{ optionTypeLabel( panelItemForMenuItem( menuItem ) ) }}, </span>
								<span
									v-if="menuItem.supportingText"
									class="shell-header-global-search__endpoint-row"
								>
									<bdi
										class="shell-header-global-search__method"
										dir="ltr"
									>{{ menuItem.supportingText }}</bdi>
									<!--
										Flex `gap` is visual only — insert real whitespace for the
										accessible name so “GET” and the title do not concatenate.
									-->
									<span class="shell-header-global-search__name-sep"> </span>
									<bdi
										class="cdx-menu-item__text__label"
										v-bind="optionLanguageAttrs( panelItemForMenuItem( menuItem ) )"
									>{{
										menuItem.label ?? menuItem.value
									}}</bdi>
								</span>
								<span
									v-else
									class="cdx-menu-item__text__label"
								>
									<bdi
										v-bind="optionLanguageAttrs( panelItemForMenuItem( menuItem ) )"
									>{{ menuItem.label ?? menuItem.value }}</bdi>
								</span>
								<template v-if="menuItem.description">
									<span class="shell-header-global-search__name-sep"> </span>
									<span
										class="cdx-menu-item__text__description"
									>
										<bdi
											v-bind="optionLanguageAttrs( panelItemForMenuItem( menuItem ) )"
										>{{ menuItem.description }}</bdi>
									</span>
								</template>
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
	display: flex;
	flex-direction: column;
	flex: 1 1 auto;
	min-inline-size: 0;
}

.shell-header-global-search__status {
	position: absolute;
	inline-size: 1px;
	block-size: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect( 0, 0, 0, 0 );
	white-space: nowrap;
	border: 0;
}

.shell-header-global-search__toolbar {
	display: flex;
	flex: 0 0 auto;
	align-items: center;
	column-gap: var( --spacing-50 );
	min-inline-size: 0;
}

.shell-header-global-search__input-host {
	flex: 1 1 auto;
	min-inline-size: 0;
}

.shell-header-global-search__input {
	flex: 1 1 auto;
	inline-size: 100%;
	min-inline-size: 0;
}

.shell-header-global-search__input:deep( .cdx-text-input ) {
	min-inline-size: var( --fd-header-search-input-min-inline-size );
}

/* Dialog overlay must shrink below Codex’s 256px default between mobile margins. */
.shell-header-global-search--overlay .shell-header-global-search__input:deep( .cdx-text-input ) {
	min-inline-size: 0;
}

/*
 * Open menu sits flush under the field (no gap), matching Codex TypeaheadSearch:
 * join corners use --border-radius-sharp so input + panel read as one surface.
 * Overlay / Dialog mode keeps squared corners — the Dialog is the surface.
 */
.shell-header-global-search--menu-open:not( .shell-header-global-search--overlay )
.shell-header-global-search__input:deep( .cdx-text-input ) {
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

.shell-header-global-search--menu-open:not( .shell-header-global-search--overlay )
.shell-header-global-search__panel {
	border-start-start-radius: var( --border-radius-sharp );
	border-start-end-radius: var( --border-radius-sharp );
}

/*
 * Overlay fills the Dialog body: toolbar (Back + field) then chips + list as the
 * scrollport. No 7-row Menu window; chips wrap (already flex-wrap on chips).
 */
.shell-header-global-search--overlay {
	block-size: 100%;
	min-block-size: 0;
}

.shell-header-global-search--overlay .shell-header-global-search__toolbar {
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-75 );
}

.shell-header-global-search--overlay .shell-header-global-search__panel {
	position: relative;
	inset: auto;
	flex: 1 1 auto;
	max-block-size: none;
	min-block-size: 0;
	border-width: 0;
	border-block-start: var( --border-width-base ) solid var( --border-color-base );
	border-radius: 0;
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

.shell-header-global-search__option-type,
.shell-header-global-search__name-sep {
	position: absolute;
	inline-size: 1px;
	block-size: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect( 0, 0, 0, 0 );
	white-space: nowrap;
	border: 0;
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
