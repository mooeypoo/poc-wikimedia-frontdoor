<script setup lang="ts">
import { CdxButton, CdxIcon, CdxSearchInput } from '@wikimedia/codex'
import { cdxIconClose } from '@wikimedia/codex-icons'
import type { LocaleResultGroup } from '../../composables/useContentSearch'
import type { EndpointSearchResult } from '../../utils/endpointSearch'

/**
 * Full-viewport collapsed header search overlay — backdrop-light mask with a
 * block-start-anchored panel.
 *
 * The collapsed utility row swaps the search field for an icon button
 * (`ShellHeaderUtilityActions`), so this overlay is the icon's only route to
 * search on phone-width viewports. Unlike `ShellCollapsedNavMenuOverlay`, it
 * carries an explicit close button and autofocuses its own field: there is no
 * surrounding chrome to dismiss into or refocus once the icon button is gone
 * behind the teleport.
 */
defineProps<{
	/** Accessible name for the dialog region. */
	overlayLabel: string
	/** Accessible label for the close button. */
	closeButtonLabel: string
	/** Placeholder text for the search field. */
	searchPlaceholderLabel: string
	/** Whether the query is non-empty (gates rendering the results panel). */
	hasQuery: boolean
	/** Result groups for the active locale's fallback chain. */
	chainResultGroups: LocaleResultGroup[]
	/** Result groups across every supported locale (all-locales mode). */
	allLocaleResultGroups: LocaleResultGroup[]
	/** REST API endpoint matches, rendered above the locale groups. */
	endpointResults: EndpointSearchResult[]
	/** Whether the content index is still being searched. */
	isSearching: boolean
	/** Whether the content search failed. */
	hasSearchError: boolean
	/** Whether results are currently shown across all locales. */
	isAllLocalesMode: boolean
	/** Active interface locale code. */
	activeLocale: string
}>()

const emit = defineEmits<{
	/** Emitted when the user dismisses the overlay (backdrop click or close button). */
	close: []
	/** Emitted when the user activates a search result. */
	'result-select': [ resultId: string ]
	/** Emitted when the user expands the search to all locales. */
	'activate-all-locales': []
}>()

const searchQuery = defineModel<string>( 'searchQuery', { required: true } )

const searchInputRef = useTemplateRef<{ $el: HTMLElement }>( 'searchInputRef' )

onMounted( async () => {
	await nextTick()
	searchInputRef.value?.$el.querySelector( 'input' )?.focus()
} )
</script>

<template>
	<Teleport to="body">
		<div
			class="shell-header-search-overlay"
			@click.self="emit( 'close' )"
		>
			<div
				class="shell-header-search-overlay__panel"
				role="dialog"
				aria-modal="true"
				:aria-label="overlayLabel"
			>
				<div class="shell-header-search-overlay__header">
					<CdxSearchInput
						ref="searchInputRef"
						v-model="searchQuery"
						class="shell-header-search-overlay__search"
						dir="auto"
						:use-button="false"
						:placeholder="searchPlaceholderLabel"
					/>
					<CdxButton
						class="shell-header-search-overlay__close-button"
						weight="quiet"
						:aria-label="closeButtonLabel"
						@click="emit( 'close' )"
					>
						<CdxIcon :icon="cdxIconClose" />
					</CdxButton>
				</div>
				<SharedSearchResults
					v-if="hasQuery"
					:chain-result-groups="chainResultGroups"
					:all-locale-result-groups="allLocaleResultGroups"
					:endpoint-results="endpointResults"
					:is-searching="isSearching"
					:has-search-error="hasSearchError"
					:is-all-locales-mode="isAllLocalesMode"
					:active-locale="activeLocale"
					:search-query="searchQuery"
					@result-select="emit( 'result-select', $event )"
					@activate-all-locales="emit( 'activate-all-locales' )"
				/>
			</div>
		</div>
	</Teleport>
</template>

<style scoped>
.shell-header-search-overlay {
	position: fixed;
	inset: 0;
	z-index: 20;
	display: flex;
	align-items: flex-start;
	background-color: var( --background-color-backdrop-light );
}

.shell-header-search-overlay__panel {
	box-sizing: border-box;
	inline-size: 100%;
	max-block-size: 100%;
	overflow-block: auto;
	overscroll-behavior: contain;
	padding: var( --spacing-100 );
	background-color: var( --background-color-base );
}

.shell-header-search-overlay__header {
	display: flex;
	align-items: center;
	gap: var( --spacing-50 );
}

.shell-header-search-overlay__search {
	flex: 1 1 auto;
	min-inline-size: 0;
}

.shell-header-search-overlay__close-button {
	flex: 0 0 auto;
}
</style>
