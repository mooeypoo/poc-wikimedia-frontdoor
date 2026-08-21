<script setup lang="ts">
/**
 * Landing page for the static API reference.
 *
 * This is the internal-linking hub: crawlers treat a set of pages reachable only
 * from a sitemap as orphans and rank them poorly, so every module page needs to
 * be reachable from a real page (docs/adr-static-module-documentation.md §10).
 *
 * It takes routing precedence over the `[...module]` catch-all for the exact
 * `/reference` path, which would otherwise match it with an empty module slug.
 */
import { REFERENCE_PATH_PREFIX } from '../../../config/referenceRoutes'

const { data: referenceIndex } = await useAsyncData(
	'reference-index',
	() => $fetch( '/api/reference-index' )
)

const { $bananaI18n } = useNuxtApp()
const localePath = useLocalePath()

const modules = computed( () => referenceIndex.value?.modules ?? [] )

const totalModules = computed( () => modules.value.length )

/**
 * Locale-aware route for a module's reference page.
 *
 * @param slug - Module URL slug.
 * @returns Locale-prefixed path.
 */
function modulePath( slug: string ): string {
	return localePath( `/${ REFERENCE_PATH_PREFIX }/${ slug }` )
}

useHead( {
	title: () => $bananaI18n( 'reference-index-title' )
} )
</script>

<template>
	<article class="fd-reference-index">
		<header class="fd-reference-index__header">
			<p class="fd-reference-index__eyebrow">
				{{ $bananaI18n( 'reference-eyebrow' ) }}
			</p>
			<h1>{{ $bananaI18n( 'reference-index-title' ) }}</h1>
			<p class="fd-reference-index__intro">
				{{ $bananaI18n( 'reference-index-intro', { $1: String( totalModules ) } ) }}
			</p>
		</header>

		<ul class="fd-reference-index__list">
			<li
				v-for="wikiModule in modules"
				:key="wikiModule.moduleName"
				class="fd-reference-index__item"
			>
				<NuxtLink
					class="fd-reference-index__link"
					:to="modulePath( wikiModule.slug )"
				>
					<bdi>{{ wikiModule.title }}</bdi>
				</NuxtLink>
				<p class="fd-reference-index__meta">
					<code><bdi>{{ wikiModule.moduleName }}</bdi></code>
					<span class="fd-reference-index__count">
						{{ $bananaI18n( 'reference-availability-count', {
							$1: String( wikiModule.instanceTotal )
						} ) }}
					</span>
				</p>
			</li>
		</ul>
	</article>
</template>

<style scoped>
/* Logical properties only — the shell flips direction per interface locale. */
.fd-reference-index {
	max-inline-size: 48rem;
	padding-block: var( --spacing-150 );
}

.fd-reference-index__eyebrow {
	margin-block: 0 var( --spacing-25 );
	color: var( --color-subtle );
	font-size: var( --font-size-small );
	text-transform: uppercase;
	letter-spacing: 0.06em;
}

.fd-reference-index__intro {
	color: var( --color-subtle );
}

.fd-reference-index__list {
	margin-block: var( --spacing-150 ) 0;
	padding-inline-start: 0;
	list-style: none;
}

.fd-reference-index__item {
	padding-block: var( --spacing-75 );
	border-block-start: 1px solid var( --border-color-subtle );
}

.fd-reference-index__link {
	font-weight: bold;
}

.fd-reference-index__meta {
	display: flex;
	flex-wrap: wrap;
	gap: var( --spacing-50 );
	align-items: baseline;
	margin-block: var( --spacing-25 ) 0;
	color: var( --color-subtle );
	font-size: var( --font-size-small );
}
</style>
