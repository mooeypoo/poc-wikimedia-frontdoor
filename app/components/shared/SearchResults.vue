<script setup lang="ts">
import { CdxButton, CdxMessage, CdxProgressBar } from '@wikimedia/codex'
import {
	contentIdToUrl,
	type LocaleResultGroup
} from '~/composables/useContentSearch'
import { endpointResultTitle } from '~/utils/endpointSearch'
import type { EndpointSearchResult } from '~/utils/endpointSearch'

/**
 * Renders FTS search results from useContentSearch in three modes:
 *  - all-locales: one section per locale in allLocaleResultGroups order
 *  - normal:      one section per locale in the active locale's fallback
 *                 chain, in chainResultGroups order
 *  - no-locale:   "no results in X for Y" message + expand CTA
 *
 * Normal and all-locales mode share the same per-group rendering — both are
 * "a list of locale-headed groups," differing only in which groups are
 * populated and whether the "expand to all languages" CTA applies.
 *
 * The no-results messaging waits for the content search to settle. A search
 * still in flight gets a progress bar and a failed one gets an error message,
 * so neither is reported as a search that found nothing.
 *
 * Above all of them, when the query matches any REST API operations, an
 * "API endpoints" group from useEndpointSearch — each result a deep link into
 * the community API Explorer at that exact operation. It leads because it is
 * capped and high-precision (every query token must match), so it never floods
 * the panel, and because a query that matches an endpoint is usually an explicit
 * API intent. Endpoint text is English-only and locale-independent, so it sits
 * outside the locale partitioning and renders once in every mode.
 *
 * Emits result-select when the user activates a result link so the parent can
 * close the search panel. Emits activate-all-locales from the no-locale CTA.
 */

const props = defineProps<{
	chainResultGroups: LocaleResultGroup[]
	allLocaleResultGroups: LocaleResultGroup[]
	endpointResults: EndpointSearchResult[]
	isSearching: boolean
	hasSearchError: boolean
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

const noResultsAnyLanguageMessage = computed( () =>
	$bananaI18n( 'search-no-results-any-language', { $1: props.searchQuery } )
)

const searchErrorMessage = computed( () => $bananaI18n( 'search-content-unavailable' ) )
const searchingLabel = computed( () => $bananaI18n( 'search-content-in-progress' ) )
const allLanguagesCta = computed( () => $bananaI18n( 'search-all-languages-cta' ) )
const endpointsHeading = computed( () => $bananaI18n( 'search-results-endpoints-heading' ) )
const deprecatedLabel = computed( () => $bananaI18n( 'search-results-endpoint-deprecated' ) )

// The active mode's groups. Normal and all-locales mode render the same way,
// just over a different data source.
const displayedGroups = computed( () =>
	props.isAllLocalesMode ? props.allLocaleResultGroups : props.chainResultGroups
)

// A heading only earns its place when the group it labels could otherwise be
// mistaken for something else. Two or more groups always need it. A single
// chain group needs it too, unless that group *is* the reader's own locale —
// a lone fallback group (e.g. a French reader whose only matches are English)
// is exactly the case the previous two-bucket design always labelled
// "Results in English", and an unlabelled list would drop that signal. All-
// locales mode always shows its heading: even a single matching locale there
// is worth naming, since the reader just asked for every language.
const showGroupHeadings = computed( () => {
	if ( props.isAllLocalesMode || displayedGroups.value.length > 1 ) {
		return true
	}
	const [ onlyGroup ] = displayedGroups.value
	return onlyGroup !== undefined && onlyGroup.locale !== props.activeLocale
} )

const hasEndpointResults = computed( () => props.endpointResults.length > 0 )

// The "no results in X" notices speak for the whole panel, so they are suppressed
// when endpoints matched — otherwise "No results…" would render directly above a
// list of results. Endpoints are not locale-partitioned, so they cannot be folded
// into the per-locale messaging instead.
//
// A search still in flight, or one that failed, suppresses them too: "no results
// in French" asserts something we never finished checking. The error notice does
// survive endpoint results, though, because those answer from their own index and
// matching there says nothing about page search.
const isContentSearchSettled = computed( () => !props.isSearching && !props.hasSearchError )

// Keyed on the active locale's own group, not on the whole chain: a French
// reader whose search only matched English pages still gets the "no results
// in French" CTA to expand further, even though the English fallback group
// renders right below it. Only the active locale's own miss should trigger
// this — the fallback groups already speak for themselves once they render.
const hasOwnLocaleResults = computed(
	() => props.chainResultGroups.some( ( group ) => group.locale === props.activeLocale )
)
const shouldShowNoLocaleResults = computed(
	() => !hasOwnLocaleResults.value && !hasEndpointResults.value && isContentSearchSettled.value
)
const shouldShowNoResultsAnyLanguage = computed(
	() => props.allLocaleResultGroups.length === 0 && !hasEndpointResults.value && isContentSearchSettled.value
)
</script>

<template>
	<!--
		API endpoints — locale-independent, so it renders identically in both modes
		and is hoisted above them. Paths and summaries come from upstream OpenAPI
		specs: external text, hence dir="ltr" on the list and <bdi> on every value.
	-->
	<section
		v-if="hasEndpointResults"
		class="fd-search-results__endpoints"
	>
		<h3 class="fd-search-results__locale-heading">
			{{ endpointsHeading }}
		</h3>
		<ul
			class="fd-search-results__list"
			dir="ltr"
		>
			<li
				v-for="endpointResult in endpointResults"
				:key="endpointResult.record.deepLink"
				class="fd-search-results__item"
			>
				<NuxtLink
					:to="endpointResult.record.deepLink"
					class="fd-search-results__link fd-search-results__link--endpoint"
					@click="emit( 'result-select', endpointResult.record.deepLink )"
				>
					<span class="fd-search-results__endpoint-heading">
						<bdi class="fd-search-results__endpoint-method">{{ endpointResult.record.method }}</bdi>
						<bdi class="fd-search-results__title">{{ endpointResultTitle( endpointResult.record ) }}</bdi>
						<span
							v-if="endpointResult.record.isDeprecated"
							class="fd-search-results__endpoint-deprecated"
						>{{ deprecatedLabel }}</span>
					</span>
					<bdi class="fd-search-results__endpoint-path">{{ endpointResult.record.path }}</bdi>
					<bdi class="fd-search-results__snippet">{{ endpointResult.record.moduleTitle }}</bdi>
				</NuxtLink>
			</li>
		</ul>
	</section>

	<!--
		The first search of a session waits on the whole index build, so without
		this the panel sits visibly empty for seconds.
	-->
	<div
		v-if="isSearching"
		class="fd-search-results__searching"
	>
		<CdxProgressBar :aria-label="searchingLabel" />
	</div>

	<!--
		Content search failed, so the panel says so rather than showing an empty
		result set it never got. Sits outside both modes: what failed is the index,
		which neither locale partitioning nor the all-languages view changes.
	-->
	<CdxMessage
		v-if="hasSearchError"
		class="fd-search-results__error"
		type="error"
		:inline="true"
	>
		{{ searchErrorMessage }}
	</CdxMessage>

	<div class="fd-search-results">
		<p
			v-if="isAllLocalesMode && shouldShowNoResultsAnyLanguage"
			class="fd-search-results__no-any-language"
		>
			{{ noResultsAnyLanguageMessage }}
		</p>

		<!--
			Ahead of the groups, not after them: when the active locale found
			nothing, the groups below are all fallbacks, and this is what explains
			why the reader is looking at another language.
		-->
		<div
			v-if="!isAllLocalesMode && shouldShowNoLocaleResults"
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

		<section
			v-for="group in displayedGroups"
			:key="group.locale"
			class="fd-search-results__locale-group"
		>
			<h3
				v-if="showGroupHeadings"
				class="fd-search-results__locale-heading"
			>
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

/*
 * The endpoints section is a sibling of the results wrapper (not inside it), so
 * it carries its own block padding and the separator that divides it from the
 * content results below.
 */
.fd-search-results__endpoints {
	padding-block-start: var( --spacing-75 );
	padding-block-end: var( --spacing-150 );
	border-block-end: 1px solid var( --border-color-subtle );
}

.fd-search-results__link--endpoint {
	gap: var( --spacing-12 );
}

.fd-search-results__endpoint-heading {
	display: flex;
	align-items: baseline;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.fd-search-results__endpoint-method {
	flex-shrink: 0;
	font-family: var( --font-family-monospace );
	font-size: var( --font-size-x-small );
	font-weight: var( --font-weight-bold );
	color: var( --color-subtle );
	letter-spacing: 0.05em;
}

.fd-search-results__endpoint-path {
	font-family: var( --font-family-monospace );
	font-size: var( --font-size-x-small );
	color: var( --color-subtle );
	overflow-wrap: anywhere;
}

.fd-search-results__endpoint-deprecated {
	flex-shrink: 0;
	padding-inline: var( --spacing-25 );
	border-radius: var( --border-radius-base );
	background-color: var( --background-color-warning-subtle );
	font-size: var( --font-size-x-small );
	color: var( --color-warning );
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

.fd-search-results__no-any-language {
	margin: 0;
	padding-inline: var( --spacing-75 );
	padding-block: var( --spacing-75 );
	font-size: var( --font-size-medium );
	color: var( --color-subtle );
}

/* Share the panel's text inset; Codex owns everything inside these two. */
.fd-search-results__error,
.fd-search-results__searching {
	padding-inline: var( --spacing-75 );
	padding-block: var( --spacing-75 );
}
</style>
