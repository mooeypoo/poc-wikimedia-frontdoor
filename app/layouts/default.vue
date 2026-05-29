<script setup lang="ts">
import { CdxField, CdxSelect } from '@wikimedia/codex'
import { useDirection } from '../composables/useDirection'

/**
 * Default layout — the Front Door application shell.
 *
 * Sets the <html> dir attribute and provides the shared header, main
 * content slot, and footer inside the site-wide 24-column grid. The outer
 * 4-column areas are reserved for side navigation; the site brand lives
 * at the top of the left column on wide viewports.
 */

const { direction } = useDirection()
const { $i18n, $setInterfaceLocale, $interfaceLocale } = useNuxtApp()

interface PickerMenuItem {
	label: string
	value: string
}

const supportedInterfaceLocales = [ 'en', 'es', 'fr', 'he' ] as const

// <option>-like rendering targets cannot include HTML tags, so FSI/PDI
// markers isolate labels and keep mixed-direction names stable.
function isolateLabel( label: string ): string {
	return `\u2068${ label }\u2069`
}

const selectedInterfaceLocale = computed<string>( {
	get: () => $interfaceLocale.value,
	set: ( nextLocaleCode ) => {
		$setInterfaceLocale( nextLocaleCode )
	}
} )

const languageMenuItems = computed<PickerMenuItem[]>( () => {
	return supportedInterfaceLocales.map( ( localeCode ) => ( {
		value: localeCode,
		label: isolateLabel( $i18n( `interface-language-${ localeCode }` ) )
	} ) )
} )

const applicationTitle = computed( () => $i18n( 'app-title' ) )
const homeNavigationLabel = computed( () => $i18n( 'nav-home' ) )
const aboutNavigationLabel = computed( () => $i18n( 'nav-about' ) )
const apiNavigationLabel = computed( () => $i18n( 'nav-api' ) )
const primaryNavigationLabel = computed( () => $i18n( 'nav-primary-label' ) )
const footerLabel = computed( () => $i18n( 'footer-title' ) )
const interfaceLanguageLabel = computed( () => $i18n( 'interface-language-label' ) )
const interfaceLanguagePlaceholder = computed( () => $i18n( 'interface-language-placeholder' ) )

useHead( {
	htmlAttrs: {
		dir: direction,
		lang: selectedInterfaceLocale
	},
	title: applicationTitle
} )
</script>

<template>
	<div class="frontdoor-shell">
		<SharedPageGrid class="frontdoor-shell__page-grid">
			<template #start>
				<div class="frontdoor-shell__side-nav">
					<NuxtLink
						to="/"
						class="frontdoor-shell__brand frontdoor-shell__brand--sidebar"
					>
						{{ applicationTitle }}
					</NuxtLink>
				</div>
			</template>

			<div class="frontdoor-shell__content">
				<header class="frontdoor-shell__header">
					<div class="frontdoor-shell__header-inner">
						<NuxtLink
							to="/"
							class="frontdoor-shell__brand frontdoor-shell__brand--header"
						>
							{{ applicationTitle }}
						</NuxtLink>
						<nav
							class="frontdoor-shell__nav"
							:aria-label="primaryNavigationLabel"
						>
							<NuxtLink to="/">
								{{ homeNavigationLabel }}
							</NuxtLink>
							<NuxtLink to="/about">
								{{ aboutNavigationLabel }}
							</NuxtLink>
							<NuxtLink to="/explorer">
								{{ apiNavigationLabel }}
							</NuxtLink>
						</nav>
						<CdxField class="frontdoor-shell__language-field">
							<template #label>
								{{ interfaceLanguageLabel }}
							</template>
							<CdxSelect
								v-model:selected="selectedInterfaceLocale"
								:menu-items="languageMenuItems"
								:default-label="interfaceLanguagePlaceholder"
							/>
						</CdxField>
					</div>
				</header>

				<main class="frontdoor-shell__main">
					<slot />
				</main>

				<footer class="frontdoor-shell__footer">
					<p class="frontdoor-shell__footer-text">
						{{ footerLabel }}
					</p>
				</footer>
			</div>

			<template #end>
				<!-- Reserved for future secondary side navigation. -->
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

.frontdoor-shell__header {
	background-color: var( --background-color-base );
	border-block-end: 1px solid var( --border-color-subtle );
}

.frontdoor-shell__header-inner {
	display: flex;
	align-items: flex-end;
	flex-wrap: wrap;
	gap: var( --spacing-200 );
	padding-block: var( --spacing-75 );
}

.frontdoor-shell__side-nav {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-100 );
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-100 );
	min-block-size: 100%;
}

.frontdoor-shell__brand {
	font-family: var( --font-family-serif );
	font-size: var( --font-size-large );
	color: var( --color-emphasized );
	font-weight: var( --font-weight-bold );
	max-block-size: 4rem;
	display: inline-flex;
	align-items: center;
	line-height: var( --line-height-xx-small );
}

.frontdoor-shell__brand--sidebar {
	display: none;
}

.frontdoor-shell__nav {
	display: flex;
	gap: var( --spacing-100 );
	margin-inline-start: auto;
}

.frontdoor-shell__language-field {
	inline-size: min( 14rem, 100% );
}

.frontdoor-shell__main {
	flex: 1;
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

@media screen and ( min-width: 70rem ) {
	.frontdoor-shell__page-grid {
		align-items: stretch;
	}

	.frontdoor-shell__page-grid :deep( .fd-page-grid__start ) {
		background-color: var( --background-color-neutral-subtle );
		align-self: stretch;
	}

	.frontdoor-shell__brand--header {
		display: none;
	}

	.frontdoor-shell__brand--sidebar {
		display: inline-flex;
	}

	.frontdoor-shell__page-grid :deep( .fd-page-grid__start ),
	.frontdoor-shell__page-grid :deep( .fd-page-grid__end ) {
		min-block-size: 100%;
	}
}

@media screen and ( max-width: 69.999rem ) {
	.frontdoor-shell__page-grid :deep( .fd-page-grid__start ),
	.frontdoor-shell__page-grid :deep( .fd-page-grid__end ) {
		display: none;
	}
}
</style>
