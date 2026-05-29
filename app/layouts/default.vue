<script setup lang="ts">
import {
	CdxButton,
	CdxIcon,
	CdxSearchInput,
	CdxSelect
} from '@wikimedia/codex'
import { cdxIconConfigure, cdxIconLanguage, cdxIconSearch } from '@wikimedia/codex-icons'
import { useDirection } from '../composables/useDirection'

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
const localePath = useLocalePath()
const isExplorerRoute = computed( () => route.path.startsWith( '/explorer' ) )

interface PickerMenuItem {
	label: string
	value: string
}

const supportedInterfaceLocales = [ 'en', 'es', 'fr', 'he', 'fa' ] as const
const nonDefaultInterfaceLocales = supportedInterfaceLocales.filter( ( localeCode ) => localeCode !== 'en' )

const searchPlaceholderValue = ref( '' )

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

watch( isExplorerRoute, ( nextIsExplorerRoute ) => {
	if ( !nextIsExplorerRoute ) {
		return
	}

	if ( locale.value !== $interfaceLocale.value ) {
		locale.value = $interfaceLocale.value
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
const homeNavigationLabel = computed( () => $bananaI18n( 'nav-home' ) )
const aboutNavigationLabel = computed( () => $bananaI18n( 'nav-about' ) )
const apiNavigationLabel = computed( () => $bananaI18n( 'nav-api' ) )
const primaryNavigationLabel = computed( () => $bananaI18n( 'nav-primary-label' ) )
const footerLabel = computed( () => $bananaI18n( 'footer-title' ) )
const searchPlaceholderLabel = computed( () => $bananaI18n( 'header-search-placeholder' ) )
const searchButtonLabel = computed( () => $bananaI18n( 'header-search-button-label' ) )
const settingsButtonLabel = computed( () => $bananaI18n( 'header-settings-label' ) )
const loginLinkLabel = computed( () => $bananaI18n( 'header-login-label' ) )
const interfaceLanguageLabel = computed( () => $bananaI18n( 'interface-language-label' ) )
const interfaceLanguagePlaceholder = computed( () => $bananaI18n( 'interface-language-placeholder' ) )
const homePath = computed( () => localePath( '/', selectedInterfaceLocale.value ) )
const aboutPath = computed( () => localePath( '/about', selectedInterfaceLocale.value ) )

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
				<div class="frontdoor-shell__side-nav">
					<div class="frontdoor-shell__brand-area">
						<NuxtLink
							:to="homePath"
							class="frontdoor-shell__brand"
						>
							{{ applicationTitle }}
						</NuxtLink>
					</div>
				</div>
			</template>

			<div class="frontdoor-shell__content">
				<div class="frontdoor-shell__chrome">
					<header class="frontdoor-shell__header">
						<div class="frontdoor-shell__header-inner">
							<div class="frontdoor-shell__search-wrap">
								<CdxSearchInput
									v-model="searchPlaceholderValue"
									class="frontdoor-shell__search"
									:use-button="false"
									:placeholder="searchPlaceholderLabel"
									disabled
								/>
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
							<a
								href="#"
								class="frontdoor-shell__login-link"
								@click.prevent
							>
								{{ loginLinkLabel }}
							</a>
						</div>
					</header>
					<nav
						class="frontdoor-shell__main-nav"
						:aria-label="primaryNavigationLabel"
					>
						<NuxtLink :to="homePath">
							{{ homeNavigationLabel }}
						</NuxtLink>
						<NuxtLink :to="aboutPath">
							{{ aboutNavigationLabel }}
						</NuxtLink>
						<NuxtLink to="/explorer">
							{{ apiNavigationLabel }}
						</NuxtLink>
					</nav>
				</div>

				<main class="frontdoor-shell__main">
					<slot />
				</main>

				<footer class="frontdoor-shell__footer">
					<p class="frontdoor-shell__footer-text">
						{{ footerLabel }}
					</p>
				</footer>
			</div>

			<template
				v-if="isExplorerRoute"
				#end
			>
				<div
					id="explorer-end-panel"
					class="frontdoor-shell__explorer-end"
				/>
			</template>
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
@container frontdoor-header ( max-width: 39.999rem ) {
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
	color: var( --color-progressive );
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	white-space: nowrap;
}

.frontdoor-shell__login-link:hover {
	text-decoration: underline;
}

.frontdoor-shell__side-nav {
	padding-inline: var( --spacing-100 );
	min-block-size: 100%;
}

.frontdoor-shell__main-nav {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-100 ); /* 16px between nav items */
	padding-block: var( --spacing-100 );
}

.frontdoor-shell__main-nav a {
	color: var( --color-base );
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	text-decoration: none;
}

.frontdoor-shell__main-nav a:hover {
	text-decoration: underline;
}

.frontdoor-shell__main-nav a.router-link-active {
	color: var( --color-emphasized );
	font-weight: var( --font-weight-bold );
}

.frontdoor-shell__brand-area {
	block-size: 4rem;
	min-block-size: 4rem;
	max-block-size: 4rem;
	display: flex;
	align-items: center;
}

.frontdoor-shell__brand {
	font-family: var( --font-family-serif );
	font-size: var( --font-size-large );
	color: var( --color-emphasized );
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
	color: var( --color-subtle );
	font-size: var( --font-size-small );
}

.frontdoor-shell__footer-text {
	margin: 0;
	text-align: center;
}

/*
 * Keep the API modules rail behind Scalar overlays (request client, search, etc.).
 * Scalar modals use high z-index inside .scalar-app; the main column must sit above
 * the end column in the page grid stacking order.
 */
.frontdoor-shell--explorer .frontdoor-shell__page-grid :deep( .fd-page-grid__main ) {
	position: relative;
	z-index: 1;
}

.frontdoor-shell--explorer .frontdoor-shell__page-grid :deep( .fd-page-grid__end ) {
	position: relative;
	z-index: 0;
}

@media screen and ( min-width: 70rem ) {
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

	.frontdoor-shell--explorer .frontdoor-shell__page-grid :deep( .fd-page-grid__end ) {
		align-self: stretch;
		min-inline-size: 0;
	}

	.frontdoor-shell--explorer .frontdoor-shell__explorer-end {
		display: flex;
		flex-direction: column;
		min-block-size: 100%;
		min-inline-size: 0;
	}
}

@media screen and ( max-width: 69.999rem ) {
	.frontdoor-shell__page-grid :deep( .fd-page-grid__start ) {
		display: none;
	}

	.frontdoor-shell:not( .frontdoor-shell--explorer ) .frontdoor-shell__page-grid :deep( .fd-page-grid__end ) {
		display: none;
	}

	.frontdoor-shell--explorer .frontdoor-shell__explorer-end {
		padding-block-start: 0;
	}

}
</style>
