<script setup lang="ts">
import {
	CdxButton,
	CdxIcon,
	CdxLookup,
	CdxMenuButton,
	CdxSearchInput,
	CdxToggleButtonGroup,
	type ButtonGroupItem
} from '@wikimedia/codex'
import type { MenuItemData } from '@wikimedia/codex'
import {
	cdxIconBright,
	cdxIconConfigure,
	cdxIconEllipsis,
	cdxIconHalfBright,
	cdxIconLanguage,
	cdxIconMoon,
	cdxIconSearch
} from '@wikimedia/codex-icons'
import type { ColorMode } from '../../../config/colorMode'
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../../config/languages'
import { useColorMode } from '../../composables/useColorMode'
import { useContentSearch } from '../../composables/useContentSearch'
import { useDirection } from '../../composables/useDirection'
import { useHeaderUtilityCollapse } from '../../composables/useHeaderUtilityCollapse'
import { useOAuthSession } from '../../composables/useOAuthSession'
import { useShellHeaderUtilityMenu } from '../../composables/useShellHeaderUtilityMenu'

/**
 * Header utility row — search, settings, interface language, and log in.
 *
 * Compact mode when the allocated actions track is narrower than the expanded minimum
 * (256px search + siblings). Search becomes an icon button; settings and log in move
 * into a `CdxMenuButton`; language stays visible as icon + uppercase locale code.
 *
 * @see DESIGN_REQUIREMENTS.md → Header (utility row + primary navigation)
 */

/** Cap on rendered language menu items — typing narrows the ~575-language list. */
const MAX_LANGUAGE_MENU_ITEMS = 50

const selectedInterfaceLocale = defineModel<string>( 'selectedInterfaceLocale', {
	required: true
} )

const actionsRootRef = useTemplateRef<HTMLElement>( 'actionsRootRef' )
const { isUtilityCollapsed } = useHeaderUtilityCollapse( actionsRootRef )
const { direction } = useDirection()
const { $bananaI18n, $interfaceLocale } = useNuxtApp()

const searchQuery = ref( '' )
const isSearchPanelOpen = ref( false )

const {
	localeResults,
	fallbackResults,
	allLocaleResultGroups,
	isAllLocalesMode,
	activateAllLocalesSearch,
	hasQuery
} = useContentSearch( searchQuery, $interfaceLocale )

watch( hasQuery, ( newHasQuery ) => {
	if ( newHasQuery ) {
		isSearchPanelOpen.value = true
	}
} )

const { menuSelection, menuItems, handleMenuSelection } = useShellHeaderUtilityMenu()
const { isLoggedIn, username, login, logout } = useOAuthSession()
const { mode: colorMode, setMode: setColorMode } = useColorMode()

const colorModeGroupLabel = computed( () => $bananaI18n( 'color-mode-group-label' ) )

// Light / Auto / Dark, in that order. Icon-only (label: null); the icons read as
// sun / half-sun / moon. `auto` follows the operating system preference.
const colorModeButtons = computed<ButtonGroupItem[]>( () => [
	{
		value: 'light',
		label: null,
		icon: cdxIconBright,
		ariaLabel: $bananaI18n( 'color-mode-light-label' )
	},
	{
		value: 'auto',
		label: null,
		icon: cdxIconHalfBright,
		ariaLabel: $bananaI18n( 'color-mode-auto-label' )
	},
	{
		value: 'dark',
		label: null,
		icon: cdxIconMoon,
		ariaLabel: $bananaI18n( 'color-mode-dark-label' )
	}
] )

/**
 * Applies a color-mode selection from the toggle group.
 *
 * The group is single-select, so it never emits an array; ignore a null value
 * so the active mode cannot be cleared.
 *
 * @param value - Selected color-mode value.
 */
function handleColorModeSelect( value: string | number | ( string | number )[] | null ): void {
	if ( typeof value !== 'string' ) {
		return
	}
	setColorMode( value as ColorMode )
}

const searchPlaceholderLabel = computed( () => $bananaI18n( 'header-search-placeholder' ) )
const searchButtonLabel = computed( () => $bananaI18n( 'header-search-button-label' ) )
const settingsButtonLabel = computed( () => $bananaI18n( 'header-settings-label' ) )
const loginLinkLabel = computed( () => $bananaI18n( 'header-login-label' ) )
const logoutLinkLabel = computed( () => $bananaI18n( 'header-logout-label' ) )
const loggedInAsLabel = computed(
	() => $bananaI18n( 'header-logged-in-as', { $1: username.value ?? '' } )
)
const interfaceLanguageLabel = computed( () => $bananaI18n( 'interface-language-label' ) )
const utilityMenuLabel = computed( () => $bananaI18n( 'header-utility-menu-label' ) )

const selectedLanguageCodeLabel = computed( () => {
	return selectedInterfaceLocale.value.toUpperCase()
} )

/** Active language's native name (autonym), shown in the picker input. */
const selectedLanguageAutonym = computed( () => {
	return getLanguageByCode( selectedInterfaceLocale.value )?.autonym
		?? selectedInterfaceLocale.value
} )

/**
 * Every language as a lookup menu item. `label` is the native autonym; the
 * English name rides along as supporting text (and both feed the filter). The
 * `language` field sets the correct `lang` attribute so each autonym renders in
 * its own script/direction.
 */
const allLanguageMenuItems: MenuItemData[] = SUPPORTED_LANGUAGES.map( ( language ) => ( {
	value: language.code,
	label: language.autonym,
	supportingText: language.name,
	language: { label: language.bcp47 }
} ) )

// Lookup state: the typed filter term, the selected value, and the input text.
const languageSearchTerm = ref( '' )
const languageSelection = ref<string | null>( selectedInterfaceLocale.value )
const languageInputValue = ref<string>( selectedLanguageAutonym.value )
const isLanguageLookupOpen = ref( false )
const languageLookupRef = useTemplateRef<{ $el: HTMLElement }>( 'languageLookupRef' )

/**
 * Menu items filtered by the typed term (native name, English name, or code),
 * capped for render performance. The active language is always kept present so
 * its selected state renders even when it falls outside the cap.
 */
const languageMenuItems = computed<MenuItemData[]>( () => {
	const term = languageSearchTerm.value.trim().toLowerCase()

	const matches = term
		? allLanguageMenuItems.filter( ( item ) =>
			( item.label ?? '' ).toLowerCase().includes( term ) ||
			( item.supportingText ?? '' ).toLowerCase().includes( term ) ||
			String( item.value ).toLowerCase().includes( term )
		)
		: allLanguageMenuItems

	const capped = matches.slice( 0, MAX_LANGUAGE_MENU_ITEMS )

	if ( !capped.some( ( item ) => item.value === languageSelection.value ) ) {
		const active = allLanguageMenuItems.find(
			( item ) => item.value === languageSelection.value
		)
		if ( active ) {
			capped.unshift( active )
		}
	}

	return capped
} )

// Keep the lookup in sync when the interface locale changes elsewhere
// (e.g. via locale-prefixed navigation).
watch( selectedInterfaceLocale, ( nextLocale ) => {
	languageSelection.value = nextLocale
	languageInputValue.value = getLanguageByCode( nextLocale )?.autonym ?? nextLocale
	languageSearchTerm.value = ''
} )

/**
 * Records the typed filter term as the user searches the language list.
 *
 * @param value - Current input value (null when cleared).
 */
function handleLanguageInput( value: string | number | null ): void {
	languageSearchTerm.value = value === null ? '' : String( value )
}

/**
 * Commits a language choice: updates the model (which drives locale routing),
 * resets the input to the chosen autonym, and closes the compact popover.
 *
 * @param value - Selected language code (null when the selection is cleared).
 */
function handleLanguageSelection( value: string | number | null ): void {
	if ( value === null || value === '' ) {
		return
	}

	const nextLocale = String( value )
	selectedInterfaceLocale.value = nextLocale
	languageInputValue.value =
		getLanguageByCode( nextLocale )?.autonym ?? nextLocale
	languageSearchTerm.value = ''
	isLanguageLookupOpen.value = false
}

/**
 * Resets the lookup input to the active language and clears the filter term.
 */
function resetLanguageLookupInput(): void {
	languageInputValue.value = selectedLanguageAutonym.value
	languageSearchTerm.value = ''
}

/**
 * Opens the language popover and focuses the lookup input so the user can type
 * immediately.
 */
function openLanguageLookup(): void {
	resetLanguageLookupInput()
	isLanguageLookupOpen.value = true
	nextTick( () => {
		languageLookupRef.value?.$el.querySelector( 'input' )?.focus()
	} )
}

/**
 * Closes the language popover and restores the input to the active language.
 */
function closeLanguageLookup(): void {
	isLanguageLookupOpen.value = false
	resetLanguageLookupInput()
}

/**
 * Toggles the language popover from the globe + code button.
 */
function toggleLanguageLookup(): void {
	if ( isLanguageLookupOpen.value ) {
		closeLanguageLookup()
	} else {
		openLanguageLookup()
	}
}

/**
 * Closes the language popover when focus leaves its container (an outside
 * click or tab-away); selecting a menu item keeps focus within and does not
 * trigger this.
 *
 * @param event - Focusout event from the language control wrapper.
 */
function handleLanguageAreaFocusOut( event: FocusEvent ): void {
	const container = event.currentTarget as HTMLElement
	if ( !container.contains( event.relatedTarget as Node ) ) {
		closeLanguageLookup()
	}
}

/**
 * Opens the search results panel when the field is focused and a query is present.
 */
function handleSearchFocusIn(): void {
	if ( hasQuery.value ) {
		isSearchPanelOpen.value = true
	}
}

/**
 * Closes the search results panel when focus leaves the search area.
 *
 * @param event - Focusout event from the search wrapper.
 */
function handleSearchAreaFocusOut( event: FocusEvent ): void {
	const container = event.currentTarget as HTMLElement
	if ( !container.contains( event.relatedTarget as Node ) ) {
		isSearchPanelOpen.value = false
	}
}

/**
 * Clears the query and closes the search panel after a result is chosen.
 *
 * @param _resultId - Selected search result id (navigation deferred in prototype).
 */
function handleResultSelect( _resultId: string ): void {
	searchQuery.value = ''
	isSearchPanelOpen.value = false
}

/**
 * Placeholder for collapsed search icon activation — behaviour deferred.
 *
 * @param event - Click event on the collapsed search button.
 */
function handleCollapsedSearchClick( event: MouseEvent ): void {
	event.preventDefault()
}
</script>

<template>
	<div
		ref="actionsRootRef"
		class="shell-header-utility-actions"
		:class="{
			'shell-header-utility-actions--collapsed': isUtilityCollapsed
		}"
	>
		<div
			v-show="!isUtilityCollapsed"
			class="shell-header-utility-actions__search-wrap"
			@focusout="handleSearchAreaFocusOut"
		>
			<CdxSearchInput
				v-model="searchQuery"
				class="shell-header-utility-actions__search"
				dir="auto"
				:use-button="false"
				:placeholder="searchPlaceholderLabel"
				@focusin="handleSearchFocusIn"
			/>
			<div
				v-if="isSearchPanelOpen && hasQuery"
				class="shell-header-utility-actions__search-panel"
				@mousedown.prevent
			>
				<SharedSearchResults
					:locale-results="localeResults"
					:fallback-results="fallbackResults"
					:all-locale-result-groups="allLocaleResultGroups"
					:is-all-locales-mode="isAllLocalesMode"
					:active-locale="$interfaceLocale"
					:search-query="searchQuery"
					@result-select="handleResultSelect"
					@activate-all-locales="activateAllLocalesSearch"
				/>
			</div>
		</div>

		<CdxButton
			v-show="isUtilityCollapsed"
			class="shell-header-utility-actions__search-toggle"
			weight="quiet"
			:aria-label="searchButtonLabel"
			@click="handleCollapsedSearchClick"
		>
			<CdxIcon :icon="cdxIconSearch" />
		</CdxButton>

		<CdxToggleButtonGroup
			class="shell-header-utility-actions__color-mode"
			:model-value="colorMode"
			:buttons="colorModeButtons"
			:aria-label="colorModeGroupLabel"
			@update:model-value="handleColorModeSelect"
		/>

		<CdxButton
			v-show="!isUtilityCollapsed"
			class="shell-header-utility-actions__settings-button"
			:aria-label="settingsButtonLabel"
			disabled
		>
			<CdxIcon :icon="cdxIconConfigure" />
		</CdxButton>

		<div
			class="shell-header-utility-actions__language"
			@focusout="handleLanguageAreaFocusOut"
			@keydown.escape="closeLanguageLookup"
		>
			<CdxButton
				class="shell-header-utility-actions__language-toggle"
				weight="quiet"
				:aria-label="interfaceLanguageLabel"
				:aria-expanded="isLanguageLookupOpen"
				@click="toggleLanguageLookup"
			>
				<CdxIcon :icon="cdxIconLanguage" />
				<bdi class="shell-header-utility-actions__language-code">
					{{ selectedLanguageCodeLabel }}
				</bdi>
			</CdxButton>

			<div
				v-show="isLanguageLookupOpen"
				class="shell-header-utility-actions__language-popover"
			>
				<CdxLookup
					ref="languageLookupRef"
					:key="direction"
					v-model:selected="languageSelection"
					v-model:input-value="languageInputValue"
					class="shell-header-utility-actions__language-lookup"
					:menu-items="languageMenuItems"
					:start-icon="cdxIconLanguage"
					:aria-label="interfaceLanguageLabel"
					:placeholder="interfaceLanguageLabel"
					@input="handleLanguageInput"
					@update:selected="handleLanguageSelection"
				/>
			</div>
		</div>

		<span
			v-show="!isUtilityCollapsed"
			class="shell-header-utility-actions__session"
		>
			<template v-if="isLoggedIn">
				<span class="shell-header-utility-actions__logged-in-as">
					{{ loggedInAsLabel }}
				</span>
				<a
					href="#"
					class="shell-header-utility-actions__login-link"
					@click.prevent="logout()"
				>
					{{ logoutLinkLabel }}
				</a>
			</template>
			<a
				v-else
				href="#"
				class="shell-header-utility-actions__login-link"
				@click.prevent="login()"
			>
				{{ loginLinkLabel }}
			</a>
		</span>

		<CdxMenuButton
			v-show="isUtilityCollapsed"
			v-model:selected="menuSelection"
			class="shell-header-utility-actions__utility-menu"
			weight="quiet"
			:menu-items="menuItems"
			:aria-label="utilityMenuLabel"
			@update:selected="handleMenuSelection"
		>
			<CdxIcon :icon="cdxIconEllipsis" />
		</CdxMenuButton>
	</div>
</template>

<style scoped>
.shell-header-utility-actions {
	display: flex;
	flex: 1 1 auto;
	flex-wrap: nowrap;
	align-items: center;
	justify-content: flex-end;
	gap: var( --spacing-100 );
	min-inline-size: 0;
}

.shell-header-utility-actions__search-wrap {
	position: relative;
	flex: 1 1 auto;
	min-inline-size: 0;
	max-inline-size: min( 40rem, 100% );
	display: flex;
	align-items: center;
}

.shell-header-utility-actions__search {
	flex: 1 1 auto;
	min-inline-size: 0;
	inline-size: 100%;
}

.shell-header-utility-actions__search:deep( .cdx-text-input ) {
	min-inline-size: var( --fd-header-search-input-min-inline-size );
	max-inline-size: 100%;
	inline-size: 100%;
}

.shell-header-utility-actions__search-panel {
	position: absolute;
	inset-block-start: 100%;
	inset-inline-start: 0;
	inset-inline-end: 0;
	z-index: 20;
	background-color: var( --background-color-base );
	border: 1px solid var( --border-color-base );
	border-radius: var( --border-radius-base );
	box-shadow: var( --box-shadow-drop-medium );
	max-block-size: min( 24rem, 80dvh );
	overflow-y: auto;
}

.shell-header-utility-actions__settings-button,
.shell-header-utility-actions__search-toggle,
.shell-header-utility-actions__utility-menu,
.shell-header-utility-actions__color-mode {
	flex: 0 0 auto;
}

/*
 * Language control: a compact globe + uppercase-code button at all widths,
 * opening the searchable lookup in a popover. Keeping it icon-sized (rather
 * than an always-open input) preserves top-bar room for the log-in link and
 * future utilities (e.g. a dark-mode toggle).
 */
.shell-header-utility-actions__language {
	position: relative;
	flex: 0 0 auto;
}

.shell-header-utility-actions__language-toggle {
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-25 );
}

.shell-header-utility-actions__language-code {
	font-size: var( --font-size-small );
	line-height: var( --line-height-small );
	color: var( --color-subtle );
	white-space: nowrap;
}

.shell-header-utility-actions__language-popover {
	position: absolute;
	inset-block-start: 100%;
	inset-inline-end: 0;
	z-index: 20;
	inline-size: 18rem;
	max-inline-size: min( 18rem, 90vw );
	margin-block-start: var( --spacing-25 );
	padding: var( --spacing-75 );
	background-color: var( --background-color-base );
	border: 1px solid var( --border-color-base );
	border-radius: var( --border-radius-base );
	box-shadow: var( --box-shadow-drop-medium );
}

.shell-header-utility-actions__language-lookup {
	inline-size: 100%;
}

.shell-header-utility-actions__session {
	flex: 0 0 auto;
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-50 );
	white-space: nowrap;
}

.shell-header-utility-actions__logged-in-as {
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	color: var( --color-subtle );
}

.shell-header-utility-actions__login-link {
	flex: 0 0 auto;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	color: var( --color-progressive );
	text-decoration: none;
	white-space: nowrap;
}

.shell-header-utility-actions__login-link:hover {
	text-decoration: underline;
}
</style>
