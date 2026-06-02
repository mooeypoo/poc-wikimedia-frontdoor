<script setup lang="ts">
import { CdxButton } from '@wikimedia/codex'
import {
	contentIdToUrl,
	type ContentSearchResult,
	type LocaleResultGroup
} from '~/composables/useContentSearch'

/**
 * Renders FTS search results from useContentSearch in three modes:
 *  - all-locales: one section per locale in allLocaleResultGroups order
 *  - normal:      locale section + optional English fallback section
 *  - no-locale:   "no results in X for Y" message + expand CTA
 *
 * Emits result-select when the user activates a result link so the parent can
 * close the search panel. Emits activate-all-locales from the no-locale CTA.
 */

const props = defineProps<{
	localeResults: ContentSearchResult[]
	fallbackResults: ContentSearchResult[]
	allLocaleResultGroups: LocaleResultGroup[]
	isAllLocalesMode: boolean
	activeLocale: string
	searchQuery: string
}>()

const emit = defineEmits<{
	'result-select': [ resultId: string ]
	'activate-all-locales': []
}>()

const { $bananaI18n } = useNuxtApp()

/**
 * Returns the "Results in [language]" heading for a given locale code.
 *
 * @param localeCode - BCP 47 locale code.
 * @returns Translated heading string with FSI/PDI isolation around the language name.
 */
function localeHeading( localeCode: string ): string {
	const langName = $bananaI18n( `interface-language-${ localeCode }` )
	return $bananaI18n( 'search-results-locale-heading', { $1: langName } )
}

const noLocaleResultsMessage = computed( () => {
	const langName = $bananaI18n( `interface-language-${ props.activeLocale }` )
	return $bananaI18n( 'search-no-locale-results', { $1: langName, $2: props.searchQuery } )
} )

const allLanguagesCta = computed( () => $bananaI18n( 'search-all-languages-cta' ) )

const hasLocaleResults = computed( () => props.localeResults.length > 0 )
const hasFallbackResults = computed( () => props.fallbackResults.length > 0 )
</script>

<template>
	<!-- All-locales mode: every locale that returned results gets its own section -->
	<div
		v-if="isAllLocalesMode"
		class="fd-search-results fd-search-results--all-locales"
	>
		<section
			v-for="group in allLocaleResultGroups"
			:key="group.locale"
			class="fd-search-results__locale-group"
		>
			<h3 class="fd-search-results__locale-heading">
				{{ localeHeading( group.locale ) }}
			</h3>
			<ul
				class="fd-search-results__list"
				:dir="group.dir"
			>
				<li
					v-for="result in group.results"
					:key="result.id"
					class="fd-search-results__item"
				>
					<NuxtLink
						:to="contentIdToUrl( result.id )"
						class="fd-search-results__link"
						@click="emit( 'result-select', result.id )"
					>
						<bdi class="fd-search-results__title">{{ result.title }}</bdi>
						<!-- eslint-disable-next-line vue/no-v-html -->
						<bdi
							v-if="result.snippets?.content"
							class="fd-search-results__snippet"
							v-html="result.snippets.content"
						/>
					</NuxtLink>
				</li>
			</ul>
		</section>
	</div>

	<!-- Normal mode -->
	<div
		v-else
		class="fd-search-results"
	>
		<!-- Results for the active locale -->
		<section
			v-if="hasLocaleResults"
			class="fd-search-results__locale-group"
		>
			<h3 class="fd-search-results__locale-heading">
				{{ localeHeading( activeLocale ) }}
			</h3>
			<ul
				class="fd-search-results__list"
				dir="auto"
			>
				<li
					v-for="result in localeResults"
					:key="result.id"
					class="fd-search-results__item"
				>
					<NuxtLink
						:to="contentIdToUrl( result.id )"
						class="fd-search-results__link"
						@click="emit( 'result-select', result.id )"
					>
						<bdi class="fd-search-results__title">{{ result.title }}</bdi>
						<!-- eslint-disable-next-line vue/no-v-html -->
						<bdi
							v-if="result.snippets?.content"
							class="fd-search-results__snippet"
							v-html="result.snippets.content"
						/>
					</NuxtLink>
				</li>
			</ul>
		</section>

		<!-- No locale results: message + CTA to expand to all languages -->
		<div
			v-if="!hasLocaleResults"
			class="fd-search-results__no-locale"
		>
			<p class="fd-search-results__no-locale-message">
				{{ noLocaleResultsMessage }}
			</p>
			<CdxButton
				class="fd-search-results__cta"
				weight="quiet"
				@click="emit( 'activate-all-locales' )"
			>
				{{ allLanguagesCta }}
			</CdxButton>
		</div>

		<!-- English fallback (only present when activeLocale is not 'en') -->
		<section
			v-if="hasFallbackResults"
			class="fd-search-results__locale-group"
		>
			<h3 class="fd-search-results__locale-heading">
				{{ localeHeading( 'en' ) }}
			</h3>
			<ul
				class="fd-search-results__list"
				dir="ltr"
			>
				<li
					v-for="result in fallbackResults"
					:key="result.id"
					class="fd-search-results__item"
				>
					<NuxtLink
						:to="contentIdToUrl( result.id )"
						class="fd-search-results__link"
						@click="emit( 'result-select', result.id )"
					>
						<bdi class="fd-search-results__title">{{ result.title }}</bdi>
						<!-- eslint-disable-next-line vue/no-v-html -->
						<bdi
							v-if="result.snippets?.content"
							class="fd-search-results__snippet"
							v-html="result.snippets.content"
						/>
					</NuxtLink>
				</li>
			</ul>
		</section>
	</div>
</template>

<style scoped>
.fd-search-results {
	padding-block: var( --spacing-75 );
}

.fd-search-results__locale-group + .fd-search-results__locale-group,
.fd-search-results__no-locale + .fd-search-results__locale-group {
	margin-block-start: var( --spacing-150 );
	padding-block-start: var( --spacing-150 );
	border-block-start: 1px solid var( --border-color-subtle );
}

.fd-search-results__locale-heading {
	margin-block: 0 var( --spacing-50 );
	padding-inline: var( --spacing-75 );
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-bold );
	color: var( --color-subtle );
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.fd-search-results__list {
	list-style: none;
	margin: 0;
	padding: 0;
}

.fd-search-results__item + .fd-search-results__item {
	margin-block-start: var( --spacing-25 );
}

.fd-search-results__link {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-25 );
	padding-block: var( --spacing-50 );
	padding-inline: var( --spacing-75 );
	border-radius: var( --border-radius-base );
	text-decoration: none;
	color: inherit;
}

.fd-search-results__link:hover,
.fd-search-results__link:focus-visible {
	background-color: var( --background-color-interactive-subtle );
	outline: none;
}

.fd-search-results__title {
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	color: var( --color-progressive );
}

.fd-search-results__snippet {
	font-size: var( --font-size-small );
	color: var( --color-subtle );
}

/* Highlight marks from FTS5 snippets — bold text, inheriting color. */
.fd-search-results__snippet :deep( mark ) {
	background-color: transparent;
	font-weight: var( --font-weight-bold );
	color: inherit;
}

.fd-search-results__no-locale {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-75 );
	align-items: flex-start;
	padding-inline: var( --spacing-75 );
	padding-block: var( --spacing-75 );
}

.fd-search-results__no-locale-message {
	margin: 0;
	font-size: var( --font-size-medium );
	color: var( --color-subtle );
}
</style>
