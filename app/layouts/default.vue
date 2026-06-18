<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconArrowNext } from '@wikimedia/codex-icons'
import { API_EXPLORER_NAVIGATION_PATH } from '../../config/mainNavigation'
import { SUPPORTED_INTERFACE_LOCALES } from '../../config/interfaceLocales'
import { useDirection } from '../composables/useDirection'
import { usePageSectionNav } from '../composables/usePageSectionNav'
import { usePrimaryNavigationTab } from '../composables/usePrimaryNavigationTab'
import { useShellNavigationBreadcrumbs } from '../composables/useShellNavigationBreadcrumbs'
import { useShellNavigationCollapse } from '../composables/useShellNavigationCollapse'
import { useShellCollapsedNavMenu } from '../composables/useShellCollapsedNavMenu'
import { isExplorerRoutePath } from '../utils/explorerRoute'

/**
 * Default layout — the Front Door application shell.
 *
 * Sets the <html> dir attribute and provides a full-viewport-width header band
 * plus the two-panel page grid below. The shell locks to the viewport; the start
 * column and main content band each scroll independently when content overflows.
 * The start column panel is always mounted (empty when a route has no section links).
 *
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
	navigationLabel: pageSectionNavigationLabel,
	navigationSections: pageSectionNavigationSections
} = usePageSectionNav()

const supportedInterfaceLocales = SUPPORTED_INTERFACE_LOCALES
const nonDefaultInterfaceLocales = supportedInterfaceLocales.filter( ( localeCode ) => localeCode !== 'en' )

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

const applicationTitle = computed( () => $bananaI18n( 'app-title' ) )
const primaryNavigationLabel = computed( () => $bananaI18n( 'nav-primary-label' ) )
const apiExplorerLinkLabel = computed( () => $bananaI18n( 'nav-api' ) )
const collapsedNavigationRegionLabel = computed( () => $bananaI18n( 'shell-collapsed-nav-label' ) )
const collapsedNavigationMenuButtonLabel = computed( () => $bananaI18n( 'shell-collapsed-nav-menu-button-label' ) )
const collapsedNavMenuOverlayLabel = computed( () => $bananaI18n( 'shell-collapsed-nav-menu-overlay-label' ) )
const collapsedNavMenuBackButtonLabel = computed( () => $bananaI18n( 'shell-collapsed-nav-menu-back-button-label' ) )

const primaryNavRowRef = useTemplateRef<HTMLElement>( 'primaryNavRowRef' )
const expandedNavContentRef = useTemplateRef<HTMLElement>( 'expandedNavContentRef' )

const { isNavigationCollapsed } = useShellNavigationCollapse(
	primaryNavRowRef,
	expandedNavContentRef
)

const hasSectionNavigation = computed( () => pageSectionNavigationSections.value.length > 0 )

const {
	isCollapsedNavMenuOpen,
	collapsedNavMenuView,
	closeCollapsedNavMenu,
	toggleCollapsedNavMenu,
	showCollapsedNavMenuPrimaryView
} = useShellCollapsedNavMenu( {
	isNavigationCollapsed,
	hasSectionNavigation
} )

const {
	primaryNavigationBreadcrumbLabel,
	sectionNavigationBreadcrumbLabel,
	hasSectionNavigationBreadcrumb
} = useShellNavigationBreadcrumbs()

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

/**
 * Navigates from the collapsed overlay primary list and closes the overlay.
 *
 * @param navigationId - Main navigation entry id from `config/mainNavigation.ts`.
 */
function handleCollapsedNavMenuPrimaryNavigationSelect( navigationId: string ): void {
	handlePrimaryNavigationSelect( navigationId )
	closeCollapsedNavMenu()
}

/**
 * Navigates to the API Explorer from the collapsed overlay and closes it.
 */
function handleCollapsedNavMenuApiExplorerSelect(): void {
	navigateTo( API_EXPLORER_NAVIGATION_PATH )
	closeCollapsedNavMenu()
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
			'frontdoor-shell--nav-collapsed': isNavigationCollapsed
		}"
	>
		<div class="frontdoor-shell__chrome-band">
			<div class="frontdoor-shell__chrome-inner">
				<div class="frontdoor-shell__chrome">
					<div class="frontdoor-shell__chrome-utility-band">
						<div class="frontdoor-shell__chrome-start frontdoor-shell__chrome-start--brand">
							<header class="frontdoor-shell__header">
								<SharedShellHeaderBrand />
							</header>
						</div>
						<div class="frontdoor-shell__chrome-main">
							<SharedShellHeaderUtilityActions
								v-model:selected-interface-locale="selectedInterfaceLocale"
							/>
						</div>
					</div>
					<div class="frontdoor-shell__chrome-start frontdoor-shell__chrome-start--nav">
						<div
							ref="primaryNavRowRef"
							class="frontdoor-shell__primary-nav-row"
						>
							<div
								class="frontdoor-shell__primary-nav-expanded"
								:class="{
									'frontdoor-shell__primary-nav-expanded--measure-only': isNavigationCollapsed
								}"
							>
								<div
									ref="expandedNavContentRef"
									class="frontdoor-shell__primary-nav-expanded__content"
								>
									<SharedShellPrimaryNav
										class="frontdoor-shell__primary-nav"
										:aria-label="primaryNavigationLabel"
										:navigation-links="mainNavigationLinks"
										:active-navigation-id="activeNavigationId"
										@navigation-select="handlePrimaryNavigationSelect"
									/>
									<span class="frontdoor-shell__api-explorer-link-wrap">
										<NuxtLink
											:to="API_EXPLORER_NAVIGATION_PATH"
											class="frontdoor-shell__api-explorer-link"
											:class="{ 'frontdoor-shell__api-explorer-link--active': isExplorerRoute }"
										>
											{{ apiExplorerLinkLabel }}
											<CdxIcon
												:icon="cdxIconArrowNext"
												:flip-for-rtl="true"
												class="frontdoor-shell__api-explorer-link-icon"
											/>
										</NuxtLink>
									</span>
								</div>
							</div>
							<SharedShellCollapsedNavigation
								v-if="isNavigationCollapsed"
								:region-label="collapsedNavigationRegionLabel"
								:menu-button-label="collapsedNavigationMenuButtonLabel"
								:primary-navigation-label="primaryNavigationBreadcrumbLabel"
								:section-navigation-label="sectionNavigationBreadcrumbLabel"
								:has-section-navigation-breadcrumb="hasSectionNavigationBreadcrumb"
								:is-menu-open="isCollapsedNavMenuOpen"
								@menu-toggle="toggleCollapsedNavMenu"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<SharedShellCollapsedNavMenuOverlay
			v-if="isNavigationCollapsed && isCollapsedNavMenuOpen"
			:overlay-label="collapsedNavMenuOverlayLabel"
			:back-button-label="collapsedNavMenuBackButtonLabel"
			:primary-navigation-label="primaryNavigationBreadcrumbLabel"
			:primary-navigation-list-label="primaryNavigationLabel"
			:api-explorer-link-label="apiExplorerLinkLabel"
			:menu-view="collapsedNavMenuView"
			:main-navigation-links="mainNavigationLinks"
			:active-navigation-id="activeNavigationId"
			:is-explorer-route="isExplorerRoute"
			:section-navigation-label="pageSectionNavigationLabel"
			:section-navigation-sections="pageSectionNavigationSections"
			@close="closeCollapsedNavMenu"
			@back="showCollapsedNavMenuPrimaryView"
			@primary-navigation-select="handleCollapsedNavMenuPrimaryNavigationSelect"
			@api-explorer-select="handleCollapsedNavMenuApiExplorerSelect"
		/>

		<SharedPageGrid class="frontdoor-shell__page-grid">
			<template #start>
				<div
					class="frontdoor-shell__side-panel frontdoor-shell__side-panel--start shell-side-panel shell-side-panel--start"
					:aria-hidden="isNavigationCollapsed || undefined"
					:inert="isNavigationCollapsed || undefined"
				>
					<SharedShellSidePanelNav
						v-if="pageSectionNavigationSections.length > 0"
						:aria-label="pageSectionNavigationLabel"
						:sections="pageSectionNavigationSections"
					/>
				</div>
			</template>

			<div class="frontdoor-shell__body-scroll">
				<div class="frontdoor-shell__body-columns">
					<div class="frontdoor-shell__content">
						<main class="frontdoor-shell__main">
							<div
								:key="route.path"
								class="frontdoor-shell__page-slot"
							>
								<slot />
							</div>
						</main>
						<SharedShellSiteFooter />
					</div>
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
				</div>
			</div>
		</SharedPageGrid>
	</div>
</template>

<style scoped>
.frontdoor-shell {
	display: flex;
	flex-direction: column;
	block-size: 100vh;
	block-size: 100dvh;
	overflow: hidden;
}

.frontdoor-shell__page-grid {
	flex: 1 1 auto;
	min-block-size: 0;
}

/*
 * Start column edge: subtle inline-end border on the grid track (transparent panel).
 * See DESIGN_REQUIREMENTS.md → Start column chrome; ARCHITECTURE.md → Shell section navigation.
 */
.frontdoor-shell__page-grid :deep( .fd-page-grid__start ) {
	border-inline-end: 1px solid var( --border-color-subtle );
	box-sizing: border-box;
}

/* Zero-width collapsed track must not paint a 1px edge (scoped rule beats page-grid.css). */
.frontdoor-shell--nav-collapsed .frontdoor-shell__page-grid :deep( .fd-page-grid__start ) {
	border-inline-end-width: 0;
}

@media screen and ( min-width: 640px ) {
	.frontdoor-shell__page-grid {
		flex: 1 1 auto;
		min-block-size: 0;
		align-items: stretch;
	}

	.frontdoor-shell__page-grid :deep( .fd-page-grid__start ) {
		display: flex;
		flex-direction: column;
		align-self: stretch;
	}

	.frontdoor-shell:not( .frontdoor-shell--nav-collapsed ) .frontdoor-shell__page-grid :deep( .fd-page-grid__start ) {
		transition: border-inline-end-width var( --transition-duration-medium ) var( --transition-timing-function-user );
	}

	/*
	 * Start column scrollport: section nav scrolls independently when taller than
	 * the viewport body (Discord-style docs sidebar). Browser default scrollbar only.
	 */
	.frontdoor-shell__side-panel--start {
		flex: 1 1 auto;
		min-block-size: 0;
		/* Fixed drawer width — track clips during open; do not use 100% of the track. */
		inline-size: var( --fd-layout-start-panel-inline-size );
		min-inline-size: var( --fd-layout-start-panel-inline-size );
		max-inline-size: var( --fd-layout-start-panel-inline-size );
		/*
		 * Block-axis shrink must stay enabled so this element becomes the scrollport
		 * when section nav exceeds the viewport body. Width is fixed above — not via flex-shrink.
		 */
		flex-shrink: 1;
		/*
		 * Vertical scroll lives on the drawer panel; horizontal overflow is
		 * clipped by `.fd-page-grid__start` during the open transition.
		 */
		overflow-block: auto;
		overflow-inline: hidden;
		overscroll-behavior: contain;
	}
}

/*
 * Full-viewport header band. Horizontal inset matches `PageGrid` via
 * `--fd-layout-page-margin-inline-start`; brand/tabs use the same column grid
 * as the start panel (tablet+). Figma Navigation 225:4548.
 */
.frontdoor-shell__chrome-band {
	position: relative;
	z-index: 10;
	flex: 0 0 auto;
	inline-size: 100vw;
	margin-inline-start: calc( 50% - 50vw );
	background-color: var( --background-color-base );
	border-block-end: 1px solid var( --border-color-subtle );
}

.frontdoor-shell__chrome-inner {
	box-sizing: border-box;
	inline-size: 100%;
	margin-inline: 0;
	/*
	 * Symmetric viewport insets — utilities align with the brand column inset.
	 * (Body band below still bleeds inline-end via `.frontdoor-shell__body-scroll`.)
	 */
	padding-inline-start: var( --fd-layout-page-margin-inline-start );
	padding-inline-end: var( --fd-layout-page-margin-inline-start );
}

.frontdoor-shell__chrome {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-150 );
	padding-block-start: var( --spacing-150 );
	padding-block-end: 0;
	min-inline-size: 0;
}

/*
 * Row 1 (mobile): brand and utility actions on one flex row. Tablet+: `display: contents`
 * so brand and utilities land in the same grid columns as start panel / body band.
 */
.frontdoor-shell__chrome-utility-band {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var( --spacing-150 );
	min-inline-size: 0;
}

.frontdoor-shell__chrome-start {
	min-inline-size: 0;
}

.frontdoor-shell__chrome-start--brand {
	padding-inline-start: var( --spacing-75 );
}

/* Logo aligns with collapsed hamburger row — no extra inset on the start column track. */
.frontdoor-shell--nav-collapsed .frontdoor-shell__chrome-start--brand {
	padding-inline-start: 0;
}

.frontdoor-shell__chrome-start--nav {
	padding-inline-start: 0;
}

.frontdoor-shell__chrome-main {
	display: flex;
	flex: 1 1 auto;
	align-items: center;
	justify-content: flex-end;
	min-inline-size: 0;
}

@media screen and ( min-width: 640px ) {
	.frontdoor-shell__chrome {
		display: grid;
		grid-template-columns: var( --fd-layout-start-panel-inline-size ) minmax( 0, 1fr );
		column-gap: var( --fd-layout-grid-gutter );
		grid-template-rows: auto auto;
	}

	.frontdoor-shell__chrome-utility-band {
		display: contents;
	}

	.frontdoor-shell__chrome-start--brand {
		grid-column: 1;
		grid-row: 1;
	}

	.frontdoor-shell__chrome-main {
		grid-column: 2;
		grid-row: 1;
	}

	.frontdoor-shell__chrome-start--nav {
		/* Full header width — tabs need more than the start column track (281px). */
		grid-column: 1 / -1;
		grid-row: 2;
	}
}

.frontdoor-shell__content {
	display: flex;
	flex-direction: column;
	flex: 1 1 auto;
	min-inline-size: 0;
	min-block-size: 0;
	/* Footer pin on short pages — scroll lives on `.frontdoor-shell__body-scroll`. */
	min-block-size: 100%;
}

/*
 * Main + end body scrollport: extends to the viewport inline-end; scrollbar sits on
 * the browser edge (Discord-style). Content inset keeps readable margins on narrow viewports.
 */
.frontdoor-shell__body-scroll {
	flex: 1 1 auto;
	min-block-size: 0;
	min-block-size: 100%;
	overflow-y: auto;
	overscroll-behavior: contain;
	padding-inline-end: var( --fd-layout-page-margin );
}

.frontdoor-shell__body-columns {
	display: grid;
	grid-template-columns: minmax( 0, 1fr );
	align-items: start;
	min-block-size: 100%;
	min-inline-size: 0;
}

.frontdoor-shell__side-panel--end {
	display: none;
}

@media screen and ( min-width: 1120px ) {
	.frontdoor-shell__body-columns {
		grid-template-columns: minmax( 0, 4fr ) minmax( 0, 1fr );
		column-gap: var( --fd-layout-grid-gutter );
	}

	.frontdoor-shell__side-panel--end {
		display: flex;
	}
}

@media screen and ( min-width: 1680px ) {
	/*
	 * Lock main:end content width at desktop wide; the scrollport still extends to
	 * the viewport inline-end so the gutter/margin zone scrolls central content too.
	 */
	.frontdoor-shell__body-columns {
		max-inline-size: var( --fd-layout-body-columns-max-inline-size );
		transition: none;
	}

	.frontdoor-shell:not( .frontdoor-shell--nav-collapsed ) .frontdoor-shell__body-columns {
		transition: max-inline-size var( --transition-duration-medium ) var( --transition-timing-function-user );
	}

	/* Collapsed start nav: body band grows into the former start-panel + gutter space. */
	.frontdoor-shell--nav-collapsed .frontdoor-shell__body-columns {
		max-inline-size: var( --fd-layout-body-columns-collapsed-max-inline-size );
	}
}

.frontdoor-shell__header {
	min-inline-size: 0;
}

/*
 * Figma Header/MainNav row: quiet tabs plus a separate API Explorer link with
 * arrow icon (not a tab). Link sits immediately after the last tab with 24px gap.
 */
.frontdoor-shell__primary-nav-row {
	position: relative;
	display: flex;
	align-items: flex-end;
	flex-wrap: nowrap;
	min-inline-size: 0;
}

.frontdoor-shell__primary-nav-expanded {
	min-inline-size: 0;
}

.frontdoor-shell__primary-nav-expanded__content {
	display: inline-flex;
	align-items: flex-end;
	flex-wrap: nowrap;
	gap: var( --spacing-150 );
	inline-size: max-content;
	max-inline-size: none;
}

.frontdoor-shell__primary-nav-expanded--measure-only {
	position: absolute;
	inset-block-start: 0;
	inset-inline-start: 0;
	visibility: hidden;
	pointer-events: none;
}

.frontdoor-shell__primary-nav {
	flex: 0 0 auto;
	min-inline-size: 0;
	inline-size: auto;
	max-inline-size: 100%;
}

.frontdoor-shell__primary-nav:deep( .shell-primary-nav ),
.frontdoor-shell__primary-nav:deep( .shell-primary-nav__tabs ) {
	inline-size: auto;
}

.frontdoor-shell__api-explorer-link-wrap {
	display: inline-flex;
	flex: 0 0 auto;
}

.frontdoor-shell__api-explorer-link {
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-25 );
	padding-block-end: calc( var( --spacing-25 ) + var( --spacing-75 ) );
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	white-space: nowrap;
	color: var( --color-progressive );
	text-decoration: none;
}

.frontdoor-shell__api-explorer-link:hover {
	text-decoration: underline;
}

.frontdoor-shell__api-explorer-link--active {
	font-weight: var( --font-weight-bold );
}

.frontdoor-shell__api-explorer-link-icon {
	color: var( --color-progressive );
}

.frontdoor-shell__side-nav,
.shell-side-panel {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.shell-side-panel {
	padding-block-start: var( --spacing-150 );
	/* Inline-start inset is `--fd-layout-page-margin` on `.fd-page-grid` — not duplicated here. */
	padding-inline-end: var( --spacing-75 );
	inline-size: 100%;
	max-inline-size: 100%;
	box-sizing: border-box;
}

.frontdoor-shell__side-panel--start,
.shell-side-panel--start {
	/* Symmetric 32px scroll-end inset with site footer (`ShellSiteFooter`). */
	padding-block-end: var( --spacing-200 );
}

.frontdoor-shell--explorer .shell-side-panel {
	gap: var( --spacing-50 );
}

.frontdoor-shell__main {
	flex: 1 1 auto;
	min-inline-size: 0;
	padding-block: var( --spacing-200 );
}

.frontdoor-shell__page-grid :deep( .fd-page-grid__body ) {
	display: flex;
	flex-direction: column;
	min-block-size: 0;
	overflow: hidden;
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
		min-block-size: 0;
	}

	.frontdoor-shell__page-grid :deep( .fd-page-grid__body ) {
		min-block-size: 0;
	}

	.frontdoor-shell__side-panel {
		min-inline-size: 0;
	}

	.frontdoor-shell__side-panel--end:not( .frontdoor-shell__side-panel--active ) {
		/* Reserved end column — empty area still participates in body scroll hit target. */
		background-color: var( --background-color-base );
		min-block-size: 100%;
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
