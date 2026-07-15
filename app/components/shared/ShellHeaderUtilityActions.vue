<script setup lang="ts">
import {
	CdxButton,
	CdxIcon,
	CdxMenuButton,
	CdxSearchInput,
	CdxSelect,
	CdxToggleButtonGroup,
	type ButtonGroupItem
} from '@wikimedia/codex'
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
import { SUPPORTED_INTERFACE_LOCALES } from '../../../config/interfaceLocales'
import { useColorMode } from '../../composables/useColorMode'
import { useContentSearch } from '../../composables/useContentSearch'
import { useDirection } from '../../composables/useDirection'
import { useHeaderUtilityCollapse } from '../../composables/useHeaderUtilityCollapse'
import { useOAuthSession } from '../../composables/useOAuthSession'
import { useShellHeaderUtilityMenu } from '../../composables/useShellHeaderUtilityMenu'
import { isolateLabel } from '../../utils/bidiIsolation'

/**
 * Header utility row — search, settings, interface language, and log in.
 *
 * Compact mode when the allocated actions track is narrower than the expanded minimum
 * (256px search + siblings). Search becomes an icon button; settings and log in move
 * into a `CdxMenuButton`; language stays visible as icon + uppercase locale code.
 *
 * @see DESIGN_REQUIREMENTS.md → Header (utility row + primary navigation)
 */

interface PickerMenuItem {
	label: string
	value: string
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

/**
 * Resolved label for the active interface locale — never falls back to the select placeholder.
 *
 * @returns Isolated display label for `selectedInterfaceLocale`.
 */
const selectedLanguageDisplayLabel = computed( () => {
	return isolateLabel(
		$bananaI18n( `interface-language-${ selectedInterfaceLocale.value }` )
	)
} )

const languageMenuItems = computed<PickerMenuItem[]>( () => {
	return SUPPORTED_INTERFACE_LOCALES.map( ( localeCode ) => ( {
		value: localeCode,
		label: isolateLabel( $bananaI18n( `interface-language-${ localeCode }` ) )
	} ) )
} )

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

		<CdxSelect
			:key="direction"
			v-model:selected="selectedInterfaceLocale"
			class="shell-header-utility-actions__language-select"
			:class="{
				'shell-header-utility-actions__language-select--compact': isUtilityCollapsed
			}"
			:menu-items="languageMenuItems"
			:default-label="selectedLanguageDisplayLabel"
			:aria-label="interfaceLanguageLabel"
		>
			<template #label>
				<span
					class="shell-header-utility-actions__language-select-label"
					:class="{
						'shell-header-utility-actions__language-select-label--compact': isUtilityCollapsed
					}"
				>
					<CdxIcon :icon="cdxIconLanguage" />
					<span
						v-if="isUtilityCollapsed"
						class="shell-header-utility-actions__language-code"
					>
						<bdi>{{ selectedLanguageCodeLabel }}</bdi>
					</span>
					<span
						v-else
						class="shell-header-utility-actions__language-select-text"
					>
						{{ selectedLanguageDisplayLabel }}
					</span>
				</span>
			</template>
		</CdxSelect>

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

.shell-header-utility-actions__language-select {
	flex: 0 1 auto;
	min-inline-size: 8rem;
	max-inline-size: 11rem;
}

.shell-header-utility-actions__language-select--compact {
	flex: 0 0 auto;
	min-inline-size: 0;
	max-inline-size: none;
}

.shell-header-utility-actions__language-select:deep( .cdx-select-vue ) {
	max-inline-size: 100%;
	min-inline-size: 0;
}

.shell-header-utility-actions__language-select--compact:deep( .cdx-select-vue ) {
	max-inline-size: none;
}

.shell-header-utility-actions__language-select:deep( .cdx-select-vue__handle ) {
	max-inline-size: 100%;
	min-inline-size: 0;
	overflow: hidden;
}

.shell-header-utility-actions__language-select--compact:deep( .cdx-select-vue__handle ) {
	max-inline-size: none;
	overflow: visible;
}

.shell-header-utility-actions__language-select-label {
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-50 );
	min-inline-size: 0;
	max-inline-size: 100%;
	overflow: hidden;
}

.shell-header-utility-actions__language-select-label--compact {
	gap: var( --spacing-25 );
}

.shell-header-utility-actions__language-select-text {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.shell-header-utility-actions__language-code {
	font-size: var( --font-size-small );
	line-height: var( --line-height-small );
	color: var( --color-subtle );
	white-space: nowrap;
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
