<script setup lang="ts">
import {
	CdxButton,
	CdxIcon,
	CdxSearchInput,
	CdxSelect
} from '@wikimedia/codex'
import { cdxIconConfigure, cdxIconLanguage, cdxIconSearch } from '@wikimedia/codex-icons'
import { useDirection } from '../composables/useDirection'
import { usePageSectionNav } from '../composables/usePageSectionNav'
import { usePrimaryNavigationTab } from '../composables/usePrimaryNavigationTab'
import { useContentSearch } from '../composables/useContentSearch'
import { isExplorerRoutePath } from '../utils/explorerRoute'

/**
 * Default layout — the Front Door application shell.
 *
 * Sets the <html> dir attribute and provides the shared header, main
 * content slot, and footer inside the site-wide grid. The start column
 * hosts the brand logo and route-aware section navigation (`usePageSectionNav`);
 * the header holds search and utility controls with primary navigation below.
 *
 * **Shell chrome layout:** At tablet+, `.fd-page-grid__main` and
 * `.frontdoor-shell__content` use `display: contents` so header chrome spans
 * the full content band (main + end columns on desktop). Header width locks
 * at ≥ 1440px viewport; page grid caps at Codex desktop-wide (1680px).
 * See `ARCHITECTURE.md` → Shell layout and chrome, `DESIGN_REQUIREMENTS.md`.
 */

const { direction } = useDirection()
const { $bananaI18n, $setInterfaceLocale, $interfaceLocale } = useNuxtApp()
const { locale } = useI18n()
const route = useRoute()
const switchLocalePath = useSwitchLocalePath()
const isExplorerRoute = computed( () => isExplorerRoutePath( route.path ) )
const { mainNavigationLinks, activeNavigationId } = usePrimaryNavigationTab()
const {
	hasPageSectionNavigation,
	navigationLabel: pageSectionNavigationLabel,
	navigationSections: pageSectionNavigationSections
} = usePageSectionNav()

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

// Codex Select / Combobox menu labels cannot use <bdi>; FSI/PDI isolate mixed-direction names.
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

/**
 * Interface locale menu entries for the header CdxSelect (labels only — no icons).
 * Icon display is handled by the Select `#label` slot; see DESIGN_REQUIREMENTS.md.
 */
const languageMenuItems = computed<PickerMenuItem[]>( () => {
	return supportedInterfaceLocales.map( ( localeCode ) => ( {
		value: localeCode,
		label: isolateLabel( $bananaI18n( `interface-language-${ localeCode }` ) )
	} ) )
} )

const applicationTitle = computed( () => $bananaI18n( 'app-title' ) )
const primaryNavigationLabel = computed( () => $bananaI18n( 'nav-primary-label' ) )
const footerLabel = computed( () => $bananaI18n( 'footer-title' ) )
const searchPlaceholderLabel = computed( () => $bananaI18n( 'header-search-placeholder' ) )
const searchButtonLabel = computed( () => $bananaI18n( 'header-search-button-label' ) )
const settingsButtonLabel = computed( () => $bananaI18n( 'header-settings-label' ) )
const loginLinkLabel = computed( () => $bananaI18n( 'header-login-label' ) )
const interfaceLanguageLabel = computed( () => $bananaI18n( 'interface-language-label' ) )
const interfaceLanguagePlaceholder = computed( () => $bananaI18n( 'interface-language-placeholder' ) )

/**
 * Navigates to the primary nav destination when a header tab is selected.
 *
 * @param navigationId - Main navigation entry id from `config/mainNavigation.ts`.
 */
function handlePrimaryNavigationSelect( navigationId: string ): void {
	const navigationLink = mainNavigationLinks.value.find(
		( link ) => link.id === navigationId
	)

	if ( navigationLink ) {
		navigateTo( navigationLink.to )
	}
}

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
		:class="{
			'frontdoor-shell--explorer': isExplorerRoute,
			'frontdoor-shell--has-section-nav': hasPageSectionNavigation
		}"
	>
		<SharedPageGrid class="frontdoor-shell__page-grid">
			<template #start>
				<div class="frontdoor-shell__side-panel frontdoor-shell__side-panel--start shell-side-panel">
					<SharedShellBrandLogo />
					<hr
						v-if="hasPageSectionNavigation"
						class="shell-side-panel__divider"
					>
					<SharedShellSidePanelNav
						v-if="hasPageSectionNavigation"
						:aria-label="pageSectionNavigationLabel"
						:sections="pageSectionNavigationSections"
					/>
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
							<div class="frontdoor-shell__header-actions">
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
									:key="direction"
									v-model:selected="selectedInterfaceLocale"
									class="frontdoor-shell__language-select"
									:menu-items="languageMenuItems"
									:default-label="interfaceLanguagePlaceholder"
									:aria-label="interfaceLanguageLabel"
								>
									<template #label="{ selectedMenuItem, defaultLabel }">
										<span class="frontdoor-shell__language-select-label">
											<CdxIcon :icon="cdxIconLanguage" />
											<span class="frontdoor-shell__language-select-text">
												{{ selectedMenuItem?.label ?? defaultLabel }}
											</span>
										</span>
									</template>
								</CdxSelect>
								<a
									href="#"
									class="frontdoor-shell__login-link"
									@click.prevent
								>
									{{ loginLinkLabel }}
								</a>
							</div>
						</div>
					</header>
					<SharedShellPrimaryNav
						class="frontdoor-shell__primary-nav"
						:aria-label="primaryNavigationLabel"
						:navigation-links="mainNavigationLinks"
						:active-navigation-id="activeNavigationId"
						@navigation-select="handlePrimaryNavigationSelect"
					/>
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

/*
 * Tablet+: hoist chrome, main, and footer onto the page grid so the header spans
 * the full content band (main + end columns on desktop) within Codex page margins.
 */
@media screen and ( min-width: 640px ) {
	.frontdoor-shell__page-grid {
		grid-template-rows: auto 1fr auto;
	}

	.frontdoor-shell__page-grid :deep( .fd-page-grid__main ),
	.frontdoor-shell__content {
		display: contents;
	}

	.frontdoor-shell__page-grid :deep( .fd-page-grid__start ) {
		grid-row: 1 / -1;
	}

	.frontdoor-shell__chrome {
		grid-column: 2;
		grid-row: 1;
	}

	.frontdoor-shell__main {
		grid-column: 2;
		grid-row: 2;
	}

	.frontdoor-shell__footer {
		grid-column: 2;
		grid-row: 3;
	}
}

@media screen and ( min-width: 1120px ) {
	.frontdoor-shell__page-grid :deep( .fd-page-grid__end ) {
		grid-row: 1 / -1;
	}

	.frontdoor-shell__chrome {
		grid-column: 2 / -1;
	}
}

/*
 * At ≥ 1440px viewport, chrome width locks; only outer page margins grow wider.
 */
@media screen and ( min-width: 1440px ) {
	.frontdoor-shell__chrome {
		max-inline-size: var( --fd-layout-chrome-max-inline-size );
	}
}

.frontdoor-shell__chrome {
	position: relative;
	z-index: 10;
	display: flex;
	flex-direction: column;
	gap: var( --spacing-150 );
	background-color: var( --background-color-base );
	border-block-end: 1px solid var( --border-color-subtle );
	padding-block-start: var( --spacing-150 );
	padding-block-end: 0;
	padding-inline-end: var( --spacing-200 );
}

/*
 * Side-by-side grid: pull chrome into the gutter so its bottom border meets the
 * start panel; inset header content by the gutter width to align with main below.
 */
@media screen and ( min-width: 640px ) {
	.frontdoor-shell__chrome {
		margin-inline-start: calc( -1 * var( --fd-layout-grid-gutter ) );
		padding-inline-start: var( --fd-layout-grid-gutter );
	}
}

.frontdoor-shell__header {
	min-inline-size: 0;
}

.frontdoor-shell__header-inner {
	container-type: inline-size;
	container-name: frontdoor-header;
	min-inline-size: 0;
}

/*
 * Figma Header/Default: one end-aligned row — search (max 640px), settings,
 * language select, log in — with spacing-100 gaps. Search shrinks first.
 */
.frontdoor-shell__header-actions {
	display: flex;
	flex: 1 1 auto;
	flex-wrap: nowrap;
	align-items: center;
	justify-content: flex-end;
	gap: var( --spacing-100 );
	min-inline-size: 0;
	inline-size: 100%;
}

.frontdoor-shell__search-wrap {
	position: relative;
	flex: 0 1 40rem;
	min-inline-size: 0;
	max-inline-size: 40rem;
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
	flex: 0 0 auto;
}

.frontdoor-shell__settings-button {
	flex: 0 0 auto;
}

.frontdoor-shell__primary-nav {
	min-inline-size: 0;
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
	flex: 0 1 auto;
	min-inline-size: 0;
	max-inline-size: 11rem;
}

/* Keep the closed select within its flex track; long locale names ellipsize. */
.frontdoor-shell__language-select:deep( .cdx-select-vue ) {
	max-inline-size: 100%;
	min-inline-size: 0;
}

.frontdoor-shell__language-select:deep( .cdx-select-vue__handle ) {
	max-inline-size: 100%;
	min-inline-size: 0;
	overflow: hidden;
}

.frontdoor-shell__language-select-label {
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-50 );
	min-inline-size: 0;
	max-inline-size: 100%;
	overflow: hidden;
}

.frontdoor-shell__language-select-text {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	min-inline-size: 0;
}

.frontdoor-shell__login-link {
	flex: 0 0 auto;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	white-space: nowrap;
	color: var( --color-progressive );
	text-decoration: none;
}

.frontdoor-shell__login-link:hover {
	text-decoration: underline;
}

.frontdoor-shell__side-nav,
.shell-side-panel {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-50 );
	min-block-size: 100%;
	min-inline-size: 0;
}

.shell-side-panel {
	background-color: var( --background-color-neutral-subtle );
	padding-block-start: var( --spacing-150 );
	padding-block-end: var( --spacing-100 );
	padding-inline-start: var( --spacing-200 );
	padding-inline-end: var( --spacing-75 );
	inline-size: 100%;
	max-inline-size: 100%;
	box-sizing: border-box;
}

.shell-side-panel__divider {
	border: none;
	border-block-start: 1px solid var( --border-color-subtle );
	margin: 0;
	inline-size: 100%;
}

.frontdoor-shell--explorer .shell-side-panel,
.frontdoor-shell--has-section-nav .shell-side-panel {
	gap: var( --spacing-50 );
}

.frontdoor-shell__main {
	flex: 1;
	min-inline-size: 0;
	padding-block: var( --spacing-200 );
}

.frontdoor-shell__footer {
	padding-block: var( --spacing-100 );
	background-color: var( --background-color-neutral-subtle );
	font-size: var( --font-size-small );
}

@media screen and ( max-width: 639px ) {
	.frontdoor-shell__footer {
		margin-block-start: auto;
	}
}

@media screen and ( min-width: 640px ) {
	.frontdoor-shell__main {
		flex: unset;
	}

	.frontdoor-shell__footer {
		align-self: end;
	}
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
</style>
