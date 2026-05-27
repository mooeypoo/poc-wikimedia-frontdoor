<script setup lang="ts">
import { useDirection } from '../composables/useDirection'

/**
 * Default layout — the Front Door application shell.
 *
 * Sets the <html> dir attribute and provides the shared header, main
 * content slot, and footer. Direction will later come from the active
 * interface language via useDirection(); for now it is hardcoded to 'ltr'
 * as a placeholder until that composable lands. This is intentional
 * scaffolding for Experiment 1, not a permanent choice.
 */

const { direction } = useDirection()
const { $i18n } = useNuxtApp()

const applicationTitle = computed( () => $i18n( 'app-title' ) )
const homeNavigationLabel = computed( () => $i18n( 'nav-home' ) )
const aboutNavigationLabel = computed( () => $i18n( 'nav-about' ) )
const apiNavigationLabel = computed( () => $i18n( 'nav-api' ) )
const footerLabel = computed( () => $i18n( 'footer-title' ) )

useHead( {
	htmlAttrs: {
		dir: direction,
		lang: 'en'
	},
	title: applicationTitle
} )
</script>

<template>
	<div class="frontdoor-shell">
		<header class="frontdoor-shell__header">
			<div class="frontdoor-shell__header-inner">
				<NuxtLink
					to="/"
					class="frontdoor-shell__brand"
				>
					{{ applicationTitle }}
				</NuxtLink>
				<nav class="frontdoor-shell__nav">
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
			</div>
		</header>
		<main class="frontdoor-shell__main">
			<slot />
		</main>
		<footer class="frontdoor-shell__footer">
			{{ footerLabel }}
		</footer>
	</div>
</template>

<style scoped>
.frontdoor-shell {
	display: flex;
	flex-direction: column;
	min-block-size: 100vh;
}

.frontdoor-shell__header {
	background-color: var( --background-color-base );
	border-block-end: 1px solid var( --border-color-subtle );
}

.frontdoor-shell__header-inner {
	max-inline-size: 64rem;
	margin-inline: auto;
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-100 );
	display: flex;
	align-items: center;
	gap: var( --spacing-200 );
}

.frontdoor-shell__brand {
	font-family: var( --font-family-serif );
	font-size: var( --font-size-large );
	color: var( --color-emphasized );
	font-weight: var( --font-weight-bold );
}

.frontdoor-shell__nav {
	display: flex;
	gap: var( --spacing-100 );
	margin-inline-start: auto;
}

.frontdoor-shell__main {
	flex: 1;
	inline-size: 100%;
	max-inline-size: 64rem;
	margin-inline: auto;
	padding-block: var( --spacing-200 );
	padding-inline: var( --spacing-100 );
}

.frontdoor-shell__footer {
	background-color: var( --background-color-neutral-subtle );
	border-block-start: 1px solid var( --border-color-subtle );
	color: var( --color-subtle );
	font-size: var( --font-size-small );
	padding-block: var( --spacing-100 );
	padding-inline: var( --spacing-100 );
	text-align: center;
}
</style>
