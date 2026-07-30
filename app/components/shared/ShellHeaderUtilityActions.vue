<script setup lang="ts">
import {
	CdxButton,
	CdxField,
	CdxIcon,
	CdxLookup,
	CdxMenuButton,
	CdxPopover,
	CdxRadio,
	CdxSearchInput,
	type MenuConfig
} from '@wikimedia/codex'
import type { MenuItemData, MenuItemValue } from '@wikimedia/codex'
import {
	cdxIconConfigure,
	cdxIconEllipsis,
	cdxIconLanguage,
	cdxIconSearch
} from '@wikimedia/codex-icons'
import type { ColorMode } from '../../../config/colorMode'
import { COLOR_THEME_PREFERENCE_OPTIONS } from '../../../config/colorMode'
import {
	HEADER_LANGUAGE_MENU_ITEM_RENDER_CAP,
	HEADER_LANGUAGE_MENU_VISIBLE_ITEM_LIMIT
} from '../../../config/headerChrome'
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../../config/languages'
import { useColorMode } from '../../composables/useColorMode'
import { useContentSearch } from '../../composables/useContentSearch'
import { useDirection } from '../../composables/useDirection'
import { useHeaderUtilityCollapse } from '../../composables/useHeaderUtilityCollapse'
import { useShellAuthNavigation } from '../../composables/useShellAuthNavigation'
import {
	SHELL_HEADER_UTILITY_MENU_VALUE,
	useShellHeaderUtilityMenu
} from '../../composables/useShellHeaderUtilityMenu'

/**
 * Header utility row — search, settings (color theme), interface language, and session control.
 *
 * Compact mode when the allocated actions track is narrower than the expanded minimum
 * (256px search + siblings). Search becomes an icon button; settings and log in move
 * into a `CdxMenuButton`; language stays visible as icon + uppercase locale code.
 * When logged in, the expanded row shows only the Meta username as a progressive
 * link to `/account` (Codex link pattern — `NuxtLink`, not `CdxButton`).
 *
 * Color theme uses `useColorMode` via a settings `CdxPopover` with `CdxField` +
 * `CdxRadio` options from `COLOR_THEME_PREFERENCE_OPTIONS` (Light / Dark /
 * System default). Figma:
 * [Preferences popover 49:2029](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=49-2029).
 *
 * @see DESIGN_REQUIREMENTS.md → Header (utility row + primary navigation)
 * @see ARCHITECTURE.md → Color theme preferences (shell)
 */

/**
 * Codex menu config for the interface-language lookup.
 *
 * - `visibleItemLimit` — at most seven rows before the native menu scrolls (Codex 5–7).
 * - `renderInPlace` — keep the menu in the Lookup DOM so the header popover can wrap
 *   the whole Lookup (input + menu). Lookup always calls Floating UI, which would
 *   otherwise teleport-position the menu outside the popover and set a viewport-based
 *   `maxHeight` that fights `visibleItemLimit` (showing “as many as fit the screen”).
 *   First-party CSS below cancels that absolute positioning / viewport max-height while
 *   leaving native Codex menu chrome intact.
 */
const LANGUAGE_LOOKUP_MENU_CONFIG: MenuConfig = {
	visibleItemLimit: HEADER_LANGUAGE_MENU_VISIBLE_ITEM_LIMIT,
	renderInPlace: true
}

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

const { menuSelection, menuItems, handleMenuSelection: handleUtilityMenuSelection } =
	useShellHeaderUtilityMenu()
const {
	isLoggedIn,
	username,
	accountPath,
	headerAuthLinkAccessibleLabel,
	login
} = useShellAuthNavigation()
const { mode: colorMode, setMode: setColorMode } = useColorMode()

const isPreferencesPopoverOpen = ref( false )
const settingsButtonRef = ref<InstanceType<typeof CdxButton> | undefined>()
const utilityMenuButtonRef = ref<InstanceType<typeof CdxMenuButton> | undefined>()

/**
 * Popover anchor: settings gear when expanded; overflow menu when collapsed.
 */
const preferencesPopoverAnchor = computed( () => {
	return isUtilityCollapsed.value ? utilityMenuButtonRef.value : settingsButtonRef.value
} )

const colorThemeFieldLabel = computed( () => $bananaI18n( 'color-mode-group-label' ) )

/**
 * Color theme radios in Figma preferences order (`COLOR_THEME_PREFERENCE_OPTIONS`).
 */
const colorThemePreferenceOptions = computed( () => {
	return COLOR_THEME_PREFERENCE_OPTIONS.map( ( option ) => ( {
		mode: option.mode,
		label: $bananaI18n( option.labelMessageKey )
	} ) )
} )

/**
 * Bridges radio `v-model` to `useColorMode` without changing persistence / class logic.
 */
const colorModeSelection = computed<ColorMode>( {
	get() {
		return colorMode.value
	},
	set( nextMode ) {
		setColorMode( nextMode )
	}
} )

/**
 * Opens or closes the preferences (color theme) popover.
 */
function togglePreferencesPopover(): void {
	isPreferencesPopoverOpen.value = !isPreferencesPopoverOpen.value
}

/**
 * Handles collapsed utility menu selection, including opening preferences.
 *
 * @param selectedValue - Newly selected menu item value, or null.
 */
function handleMenuSelection(
	selectedValue: MenuItemValue | null
): void {
	if ( selectedValue === SHELL_HEADER_UTILITY_MENU_VALUE.settings ) {
		isPreferencesPopoverOpen.value = true
		menuSelection.value = null
		return
	}
	handleUtilityMenuSelection( selectedValue )
}

const searchPlaceholderLabel = computed( () => $bananaI18n( 'header-search-placeholder' ) )
const searchButtonLabel = computed( () => $bananaI18n( 'header-search-button-label' ) )
const settingsButtonLabel = computed( () => $bananaI18n( 'header-settings-label' ) )
const loginLinkLabel = computed( () => $bananaI18n( 'header-login-label' ) )
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

	const capped = matches.slice( 0, HEADER_LANGUAGE_MENU_ITEM_RENDER_CAP )

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
 *
 * Also restores `languageSelection` to the committed interface locale: clearing the
 * input (Codex `clearable`) nulls Lookup’s selection without changing locale, so we
 * re-sync when closing or reopening.
 */
function resetLanguageLookupInput(): void {
	languageSelection.value = selectedInterfaceLocale.value
	languageInputValue.value = selectedLanguageAutonym.value
	languageSearchTerm.value = ''
}

/**
 * Opens the language popover and focuses the lookup input so the user can type
 * immediately.
 *
 * Waits for the popover to be laid out before focusing: if the Lookup expands its
 * menu while a freshly shown ancestor is still unmeasured, Codex’s
 * `visibleItemLimit` height math can fail and Floating UI’s viewport `maxHeight`
 * takes over (menu grows to fill the screen).
 */
async function openLanguageLookup(): Promise<void> {
	resetLanguageLookupInput()
	isLanguageLookupOpen.value = true
	await nextTick()
	await new Promise<void>( ( resolve ) => {
		requestAnimationFrame( () => {
			requestAnimationFrame( () => {
				resolve()
			} )
		} )
	} )
	languageLookupRef.value?.$el.querySelector( 'input' )?.focus()
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

		<span
			v-show="!isUtilityCollapsed"
			class="shell-header-utility-actions__settings"
		>
			<CdxButton
				ref="settingsButtonRef"
				class="shell-header-utility-actions__settings-button"
				:aria-label="settingsButtonLabel"
				:aria-expanded="isPreferencesPopoverOpen"
				@click="togglePreferencesPopover"
			>
				<CdxIcon :icon="cdxIconConfigure" />
			</CdxButton>
		</span>

		<CdxPopover
			v-model:open="isPreferencesPopoverOpen"
			class="shell-header-utility-actions__preferences-popover"
			:anchor="preferencesPopoverAnchor"
			placement="bottom-end"
		>
			<CdxField
				class="shell-header-utility-actions__color-theme-field"
				is-fieldset
			>
				<template #label>
					{{ colorThemeFieldLabel }}
				</template>
				<CdxRadio
					v-for="option in colorThemePreferenceOptions"
					:key="option.mode"
					v-model="colorModeSelection"
					:input-value="option.mode"
				>
					{{ option.label }}
				</CdxRadio>
			</CdxField>
		</CdxPopover>

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
				v-if="isLanguageLookupOpen"
				class="shell-header-utility-actions__language-popover"
			>
				<CdxLookup
					ref="languageLookupRef"
					:key="direction"
					v-model:selected="languageSelection"
					v-model:input-value="languageInputValue"
					class="shell-header-utility-actions__language-lookup"
					:menu-items="languageMenuItems"
					:menu-config="LANGUAGE_LOOKUP_MENU_CONFIG"
					:start-icon="cdxIconLanguage"
					clearable
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
			<NuxtLink
				v-if="isLoggedIn && username"
				:to="accountPath"
				class="shell-header-utility-actions__account-link"
				:aria-label="headerAuthLinkAccessibleLabel"
			>
				<bdi>{{ username }}</bdi>
			</NuxtLink>
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
			ref="utilityMenuButtonRef"
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

.shell-header-utility-actions__settings,
.shell-header-utility-actions__settings-button,
.shell-header-utility-actions__search-toggle,
.shell-header-utility-actions__utility-menu {
	flex: 0 0 auto;
}

.shell-header-utility-actions__preferences-popover :deep( .cdx-popover__body ) {
	padding: var( --spacing-100 );
}

.shell-header-utility-actions__color-theme-field {
	margin-block-start: 0;
	min-inline-size: 12rem;
}

.shell-header-utility-actions__color-theme-field :deep( .cdx-field__label ) {
	margin-block-end: var( --spacing-25 );
}

/*
 * Language control: a compact globe + uppercase-code button at all widths,
 * opening the searchable lookup in a popover. Keeping it icon-sized (rather
 * than an always-open input) preserves top-bar room for the log-in link and
 * the settings (color theme) control.
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
	display: flex;
	flex-direction: column;
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
	position: relative;
	inline-size: 100%;
}

/*
 * Lookup always runs Floating UI, which absolutely positions the menu and sets a
 * viewport-based maxHeight on `.cdx-menu`. That pulls the menu out of the popover
 * box and, when Codex’s visibleItemLimit measure races, lets the list grow to
 * “however many rows fit the screen”. Keep the native Codex menu chrome, but put
 * the menu back in normal flow inside the popover and clear the viewport cap so
 * `visibleItemLimit: 7` owns the scroll height.
 */
.shell-header-utility-actions__language-lookup:deep( .cdx-menu ) {
	/*
	 * Cancel Floating UI placement only — do not add spacing; Codex menu sits flush
	 * under the input. `max-height` (physical) clears Floating UI’s inline style
	 * (also physical); see AGENTS.md / ARCHITECTURE.md Codex exception #8.
	 */
	position: static !important;
	inset: auto !important;
	transform: none !important;
	visibility: visible !important;
	inline-size: 100% !important;
	max-block-size: none !important;
	max-height: none !important;
}

/*
 * Fallback list cap if Codex’s pixel measure has not run yet. Inline max-height
 * from visibleItemLimit still wins when present. ~7 supportingText rows
 * (HEADER_LANGUAGE_MENU_VISIBLE_ITEM_LIMIT).
 */
.shell-header-utility-actions__language-lookup:deep( .cdx-menu__listbox ) {
	max-block-size: 22.75rem;
	overflow-block: auto;
}

.shell-header-utility-actions__session {
	flex: 0 0 auto;
	display: inline-flex;
	align-items: center;
	white-space: nowrap;
}

/* Codex progressive link pattern — navigation uses NuxtLink, not CdxButton. */
.shell-header-utility-actions__login-link,
.shell-header-utility-actions__account-link {
	flex: 0 0 auto;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	color: var( --color-progressive );
	text-decoration: none;
	white-space: nowrap;
}

.shell-header-utility-actions__login-link:hover,
.shell-header-utility-actions__account-link:hover {
	text-decoration: underline;
}
</style>
