<script setup lang="ts">
import {
	CdxButton,
	CdxIcon,
	CdxSearchInput,
	CdxSelect
} from '@wikimedia/codex'
import { cdxIconConfigure, cdxIconLanguage, cdxIconSearch } from '@wikimedia/codex-icons'
import { useDirection } from '../composables/useDirection'
import { useShellAuthNavigation } from '../composables/useShellAuthNavigation'
import { useMainNavigationLinks } from '../composables/useMainNavigationLinks'
import { useContentSearch } from '../composables/useContentSearch'
import { isExplorerRoutePath } from '../utils/explorerRoute'

/**
 * Default layout — the Front Door application shell.
 *
 * Sets the <html> dir attribute and provides the shared header, main
 * content slot, and footer inside the site-wide 24-column grid. The site
 * brand lives in the left column; the header holds search and utility
 * controls with primary navigation directly below.
 */

const { direction } = useDirection()
const { $bananaI18n, $setInterfaceLocale, $interfaceLocale } = useNuxtApp()
const { locale } = useI18n()
const route = useRoute()
const switchLocalePath = useSwitchLocalePath()
const isExplorerRoute = computed( () => isExplorerRoutePath( route.path ) )
const { mainNavigationLinks, getStartedPath } = useMainNavigationLinks()
const {
	headerAuthLinkPath,
	headerLoginLabel,
	headerAuthLinkAccessibleLabel,
	isAuthenticated: isHeaderAuthAuthenticated,
	username: headerAuthUsername
} = useShellAuthNavigation()

interface PickerMenuItem {
	label: string
	value: string
}

const supportedInterfaceLocales = [ 'en', 'es', 'fr', 'he', 'fa' ] as const
const nonDefaultInterfaceLocales = supportedInterfaceLocales.filter( ( localeCode ) => localeCode !== 'en' )

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

function handleSearchFocusIn(): void {
	if ( hasQuery.value ) {
		isSearchPanelOpen.value = true
	}
}

function handleSearchAreaFocusOut( event: FocusEvent ): void {
	const container = event.currentTarget as HTMLElement
	if ( !container.contains( event.relatedTarget as Node ) ) {
		isSearchPanelOpen.value = false
	}
}

function handleResultSelect( _resultId: string ): void {
	searchQuery.value = ''
	isSearchPanelOpen.value = false
}

// <option>-like rendering targets cannot include HTML tags, so FSI/PDI
// markers isolate labels and keep mixed-direction names stable.
function isolateLabel( label: string ): string {
	return `\u2068${ label }\u2069`
}

const selectedInterfaceLocale = computed<string>( {
	get: () => $interfaceLocale.value,
	set: async ( nextLocaleCode ) => {
		const nextLocalizedPath = isExplorerRoute.value ? null : switchLocalePath( nextLocaleCode )
		$setInterfaceLocale( nextLocaleCode )
		locale.value = nextLocaleCode

		if ( nextLocalizedPath && nextLocalizedPath !== route.fullPath ) {
			await navigateTo( nextLocalizedPath )
		}
	}
} )

watch( locale, ( nextLocaleCode ) => {
	if ( isExplorerRoute.value ) {
		return
	}

	const pathHasNonDefaultLocalePrefix = nonDefaultInterfaceLocales.some( ( localeCode ) => {
		return route.path === `/${ localeCode }` || route.path.startsWith( `/${ localeCode }/` )
	} )

	const routeMatchesLocale = nextLocaleCode === 'en'
		? !pathHasNonDefaultLocalePrefix
		: route.path === `/${ nextLocaleCode }` || route.path.startsWith( `/${ nextLocaleCode }/` )

	if ( !routeMatchesLocale ) {
		return
	}

	$setInterfaceLocale( nextLocaleCode )
}, { immediate: true } )

watch( isExplorerRoute, ( nextIsExplorerRoute, wasExplorerRoute ) => {
	if ( nextIsExplorerRoute ) {
		if ( locale.value !== $interfaceLocale.value ) {
			locale.value = $interfaceLocale.value
		}
		return
	}

	if ( wasExplorerRoute ) {
		const pathLocale = nonDefaultInterfaceLocales.find( ( localeCode ) => {
			return route.path === `/${ localeCode }` || route.path.startsWith( `/${ localeCode }/` )
		} ) ?? 'en'

		if ( locale.value !== pathLocale ) {
			locale.value = pathLocale
		}
	}
}, { immediate: true } )

const languageMenuItems = computed<PickerMenuItem[]>( () => {
	return supportedInterfaceLocales.map( ( localeCode ) => ( {
		value: localeCode,
		label: isolateLabel( $bananaI18n( `interface-language-${ localeCode }` ) ),
		icon: cdxIconLanguage
	} ) )
} )

const applicationTitle = computed( () => $bananaI18n( 'app-title' ) )
const primaryNavigationLabel = computed( () => $bananaI18n( 'nav-primary-label' ) )
const footerLabel = computed( () => $bananaI18n( 'footer-title' ) )
const searchPlaceholderLabel = computed( () => $bananaI18n( 'header-search-placeholder' ) )
const searchButtonLabel = computed( () => $bananaI18n( 'header-search-button-label' ) )
const settingsButtonLabel = computed( () => $bananaI18n( 'header-settings-label' ) )
const interfaceLanguageLabel = computed( () => $bananaI18n( 'interface-language-label' ) )
const interfaceLanguagePlaceholder = computed( () => $bananaI18n( 'interface-language-placeholder' ) )
useHead( {
	htmlAttrs: {
		dir: direction,
		lang: selectedInterfaceLocale
	},
	title: applicationTitle
} )
</script>

<template>
	<div
		class="frontdoor-shell"
		:class="{ 'frontdoor-shell--explorer': isExplorerRoute }"
	>
		<SharedPageGrid class="frontdoor-shell__page-grid">
			<template #start>
				<div class="frontdoor-shell__side-panel frontdoor-shell__side-panel--start frontdoor-shell__side-nav">
					<div class="frontdoor-shell__brand-area">
						<NuxtLink
							:to="getStartedPath"
							class="frontdoor-shell__brand"
						>
							{{ applicationTitle }}
						</NuxtLink>
					</div>
					<ExplorerSideNav v-if="isExplorerRoute" />
				</div>
			</template>

			<template #end>
				<div
					class="frontdoor-shell__side-panel frontdoor-shell__side-panel--end"
					:class="{ 'frontdoor-shell__side-panel--active': isExplorerRoute }"
				>
					<div
						v-if="isExplorerRoute"
						id="explorer-end-panel"
						class="frontdoor-shell__explorer-end"
					/>
				</div>
			</template>

			<div class="frontdoor-shell__content">
				<div class="frontdoor-shell__chrome">
					<header class="frontdoor-shell__header">
						<div class="frontdoor-shell__header-inner">
							<div
								class="frontdoor-shell__search-wrap"
								@focusout="handleSearchAreaFocusOut"
							>
								<CdxSearchInput
									v-model="searchQuery"
									class="frontdoor-shell__search"
									dir="auto"
									:use-button="false"
									:placeholder="searchPlaceholderLabel"
									@focusin="handleSearchFocusIn"
								/>
								<div
									v-if="isSearchPanelOpen && hasQuery"
									class="frontdoor-shell__search-panel"
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
							<div class="frontdoor-shell__utilities">
								<CdxButton
									class="frontdoor-shell__search-toggle"
									:aria-label="searchButtonLabel"
									disabled
								>
									<CdxIcon :icon="cdxIconSearch" />
								</CdxButton>
								<CdxButton
									class="frontdoor-shell__settings-button"
									:aria-label="settingsButtonLabel"
									disabled
								>
									<CdxIcon :icon="cdxIconConfigure" />
								</CdxButton>
								<CdxSelect
									v-model:selected="selectedInterfaceLocale"
									class="frontdoor-shell__language-select"
									:menu-items="languageMenuItems"
									:default-icon="cdxIconLanguage"
									:default-label="interfaceLanguagePlaceholder"
									:aria-label="interfaceLanguageLabel"
								/>
							</div>
							<NuxtLink
								:to="headerAuthLinkPath"
								class="frontdoor-shell__login-link"
								:aria-label="isHeaderAuthAuthenticated ? headerAuthLinkAccessibleLabel : undefined"
							>
								<bdi v-if="isHeaderAuthAuthenticated">{{ headerAuthUsername }}</bdi>
								<template v-else>{{ headerLoginLabel }}</template>
							</NuxtLink>
						</div>
					</header>
					<nav
						class="frontdoor-shell__main-nav"
						:aria-label="primaryNavigationLabel"
					>
						<NuxtLink
							v-for="navigationLink in mainNavigationLinks"
							:key="navigationLink.id"
							:to="navigationLink.to"
						>
							{{ navigationLink.label }}
						</NuxtLink>
					</nav>
				</div>

				<main class="frontdoor-shell__main">
					<div
						:key="route.path"
						class="frontdoor-shell__page-slot"
					>
						<slot />
					</div>
				</main>

				<footer class="frontdoor-shell__footer">
					<p class="frontdoor-shell__footer-text">
						{{ footerLabel }}
					</p>
				</footer>
			</div>
		</SharedPageGrid>
	</div>
</template>

<style scoped>
.frontdoor-shell {
	min-block-size: 100vh;
}

.frontdoor-shell__page-grid {
	min-block-size: 100vh;
}

.frontdoor-shell__content {
	display: flex;
	flex-direction: column;
	min-block-size: 100vh;
	min-inline-size: 0;
}

.frontdoor-shell__chrome {
	position: relative;
	z-index: 10;
	background-color: var( --background-color-base );
}

.frontdoor-shell__header {
	block-size: 4rem;
	min-block-size: 4rem;
	max-block-size: 4rem;
}

.frontdoor-shell__header-inner {
	container-type: inline-size;
	container-name: frontdoor-header;
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	gap: var( --spacing-100 );
	block-size: 100%;
	min-inline-size: 0;
}

.frontdoor-shell__search-wrap {
	position: relative;
	flex: 1 1 0;
	min-inline-size: 0;
	max-inline-size: 36rem;
	display: flex;
	align-items: center;
}

.frontdoor-shell__search {
	flex: 1 1 auto;
	min-inline-size: 0;
	inline-size: 100%;
}

/* Codex sets min-width: 256px on .cdx-text-input; override so the field can shrink
   and the container query can switch to the icon-only control instead of wrapping. */
.frontdoor-shell__search:deep( .cdx-text-input ) {
	min-inline-size: 0;
	inline-size: 100%;
}

.frontdoor-shell__search-panel {
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

.frontdoor-shell__search-toggle {
	display: none;
	flex-shrink: 0;
}

.frontdoor-shell__utilities {
	display: flex;
	align-items: center;
	gap: var( --spacing-100 ); /* 16px between search, settings, and language controls */
	flex-shrink: 0;
	margin-inline-start: auto;
}

/* Collapse when the header cannot fit the search field (Codex minimum 256px). */
@container frontdoor-header ( max-width: var( --max-width-breakpoint-mobile ) ) {
	.frontdoor-shell__search-wrap {
		display: none;
	}

	.frontdoor-shell__search-toggle {
		display: inline-flex;
	}
}

.frontdoor-shell__language-select {
	inline-size: min( 12rem, 100% );
	flex-shrink: 0;
}

.frontdoor-shell__login-link {
	flex-shrink: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	white-space: nowrap;
}

.frontdoor-shell__side-nav {
	display: flex;
	flex-direction: column;
	padding-inline: var( --spacing-100 );
	min-block-size: 100%;
	min-inline-size: 0;
}

/* Align the side nav first row with .frontdoor-shell__main-nav (no extra gap below the brand). */
.frontdoor-shell--explorer .frontdoor-shell__side-nav {
	gap: 0;
}

.frontdoor-shell__main-nav {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-100 ); /* 16px between nav items */
	padding-block: var( --spacing-100 );
}

.frontdoor-shell__main-nav a {
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
}

.frontdoor-shell__brand-area {
	block-size: 4rem;
	min-block-size: 4rem;
	max-block-size: 4rem;
	display: flex;
	align-items: center;
}

.frontdoor-shell__brand {
	font-size: var( --font-size-large );
	font-weight: var( --font-weight-bold );
	display: inline-flex;
	align-items: center;
	line-height: var( --line-height-xx-small );
	max-block-size: 100%;
	overflow: hidden;
}

.frontdoor-shell__main {
	flex: 1;
	min-inline-size: 0;
	padding-block: var( --spacing-200 );
}

.frontdoor-shell__footer {
	margin-block-start: auto;
	padding-block: var( --spacing-100 );
	background-color: var( --background-color-neutral-subtle );
	font-size: var( --font-size-small );
}

.frontdoor-shell__footer-text {
	margin: 0;
	text-align: center;
}

/*
 * Scalar overlays must stack above the API modules rail when modals span the viewport.
 * Raise only the explorer reference shell — not the whole main grid column — so the
 * end column rail stays visible beside the spec panel.
 */
.frontdoor-shell--explorer .explorer-page__scalar-shell {
	position: relative;
	z-index: 2;
}

.frontdoor-shell--explorer .explorer-module-rail {
	position: relative;
	z-index: 1;
}

@media screen and ( min-width: 1120px ) {
	.frontdoor-shell__page-grid {
		align-items: stretch;
	}

	.frontdoor-shell__page-grid :deep( .fd-page-grid__start ) {
		border-inline-end: 1px solid var( --border-color-subtle );
		align-self: stretch;
	}

	.frontdoor-shell__page-grid :deep( .fd-page-grid__start ),
	.frontdoor-shell__page-grid :deep( .fd-page-grid__end ) {
		min-block-size: 100%;
	}

	.frontdoor-shell__page-grid :deep( .fd-page-grid__end ) {
		align-self: stretch;
		min-inline-size: 0;
	}

	.frontdoor-shell__side-panel {
		min-block-size: 100%;
		min-inline-size: 0;
	}

	.frontdoor-shell__side-panel--end:not( .frontdoor-shell__side-panel--active ) {
		/* Reserved 4-column panel for future page-level navigation. */
		background-color: var( --background-color-base );
	}

	.frontdoor-shell--explorer .frontdoor-shell__explorer-end {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		align-self: start;
		min-inline-size: 0;
	}
}

@media screen and ( min-width: 640px ) and ( max-width: 1119px ) {
	.frontdoor-shell__page-grid :deep( .fd-page-grid__start ) {
		border-inline-end: 1px solid var( --border-color-subtle );
	}
}
</style>
