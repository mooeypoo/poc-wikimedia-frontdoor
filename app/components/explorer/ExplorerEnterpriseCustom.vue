<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { CdxMessage } from '@wikimedia/codex'
import MarkdownIt from 'markdown-it'
import {
	useEnterpriseSpecOutline,
	type EnterpriseSpecOperationOutline,
	type EnterpriseSpecTagOutline
} from '../../composables/useEnterpriseSpecOutline'

/**
 * ExplorerEnterpriseCustom — non-Scalar tag-driven viewer for the Enterprise
 * OpenAPI spec.
 *
 * Reads the parsed spec via {@link useEnterpriseSpecOutline} and renders a
 * single-select WAI-ARIA tablist (sidebar) + tabpanel (endpoint detail) inside
 * the Explorer page's reference-panel slot. The active tag lives in the URL
 * as `#tag=<name>` so selections are shareable.
 *
 * Routing decisions, the page-level mount, and the surrounding layout grid
 * live in `app/pages/explorer/[[view]].vue`; this component is presentational
 * apart from the small amount of URL-hash plumbing.
 */
const { $bananaI18n } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const { tags, operationsByTag, isLoading, hasError, errorMessage } = useEnterpriseSpecOutline()

const tablistLabel = computed( () => $bananaI18n( 'explorer-enterprise-custom-tablist-label' ) )
const loadingLabel = computed( () => $bananaI18n( 'explorer-enterprise-custom-loading' ) )
const errorLabel = computed( () => $bananaI18n( 'explorer-enterprise-custom-error' ) )
const emptyLabel = computed( () => $bananaI18n( 'explorer-enterprise-custom-empty' ) )
const emptyTagLabel = computed( () => $bananaI18n( 'explorer-enterprise-custom-empty-tag' ) )
const untaggedDisplayName = computed( () => $bananaI18n( 'explorer-enterprise-custom-untagged-label' ) )

/** Internal id used by the parsed endpoint for operations with no tag. Must match the server. */
const UNTAGGED_BUCKET_KEY = '__untagged__'

/** Configured Markdown renderer — HTML disabled so spec strings cannot inject markup. */
const markdownRenderer = new MarkdownIt( {
	html: false,
	linkify: true,
	breaks: false
} )

/** Currently selected tag name, or null while the outline is still loading / empty. */
const selectedTagName = ref<string | null>( null )

/** Buttons used as tabs; populated by the template ref callback. */
const tabButtonRefs = ref<HTMLButtonElement[]>( [] )

const hasTags = computed( () => tags.value.length > 0 )

const selectedTag = computed<EnterpriseSpecTagOutline | null>( () => {
	if ( !selectedTagName.value ) {
		return null
	}
	return tags.value.find( ( tag ) => tag.name === selectedTagName.value ) ?? null
} )

const selectedOperations = computed<EnterpriseSpecOperationOutline[]>( () => {
	if ( !selectedTagName.value ) {
		return []
	}
	return operationsByTag.value[ selectedTagName.value ] ?? []
} )

/**
 * Returns the human-facing label for a tag, swapping the synthetic
 * untagged-bucket key for a translated label.
 *
 * @param tag - Tag descriptor as returned by the outline endpoint.
 * @returns Display string to render inside `<bdi>`.
 */
function displayNameForTag( tag: EnterpriseSpecTagOutline ): string {
	if ( tag.name === UNTAGGED_BUCKET_KEY ) {
		return untaggedDisplayName.value
	}
	return tag.displayName || tag.name
}

/**
 * Builds the DOM id for a tab button so the tabpanel can declare
 * `aria-labelledby` correctly.
 *
 * @param tagName - Tag name.
 * @returns Stable element id for the tab.
 */
function tabId( tagName: string ): string {
	return `explorer-enterprise-custom-tab-${ encodeURIComponent( tagName ) }`
}

/**
 * Builds the DOM id for the tabpanel paired with the active tab.
 *
 * @param tagName - Tag name.
 * @returns Stable element id for the tabpanel.
 */
function tabPanelId( tagName: string ): string {
	return `explorer-enterprise-custom-panel-${ encodeURIComponent( tagName ) }`
}

/**
 * Renders a Markdown string to sanitized HTML for the description region.
 * HTML inside the source is disabled via markdown-it options so external
 * spec content cannot inject markup.
 *
 * @param markdownSource - Markdown string from the OpenAPI description field.
 * @returns HTML string ready for v-html.
 */
function renderMarkdown( markdownSource: string ): string {
	return markdownRenderer.render( markdownSource )
}

/**
 * Reads `#tag=<name>` from the current route hash and returns the decoded name.
 *
 * @returns Decoded tag name or null when no `tag` parameter is present.
 */
function readTagFromHash(): string | null {
	const rawHash = route.hash || ''
	if ( !rawHash ) {
		return null
	}
	// Strip leading '#'.
	const hashBody = rawHash.startsWith( '#' ) ? rawHash.slice( 1 ) : rawHash
	const params = new URLSearchParams( hashBody )
	const candidate = params.get( 'tag' )
	if ( !candidate ) {
		return null
	}
	try {
		return decodeURIComponent( candidate )
	} catch {
		// URLSearchParams already decodes once; a second decode is opportunistic.
		return candidate
	}
}

/**
 * Updates the URL hash to reflect the active tag without adding a history entry.
 *
 * @param tagName - Tag to encode into the hash.
 * @returns Nothing.
 */
function writeTagToHash( tagName: string ): void {
	const nextHash = `#tag=${ encodeURIComponent( tagName ) }`
	if ( route.hash === nextHash ) {
		return
	}
	void router.replace( { path: route.path, hash: nextHash, query: route.query } )
}

/**
 * Selects a tag and synchronizes the URL hash. No-op if the requested tag
 * is not present in the outline.
 *
 * @param tagName - Tag to select.
 * @returns Nothing.
 */
function selectTag( tagName: string ): void {
	if ( !tags.value.some( ( tag ) => tag.name === tagName ) ) {
		return
	}
	selectedTagName.value = tagName
	writeTagToHash( tagName )
}

/**
 * Handles tab-button click (mouse / pointer / touch).
 *
 * @param tagName - Tag clicked.
 * @returns Nothing.
 */
function onTabClick( tagName: string ): void {
	selectTag( tagName )
}

/**
 * Handles keyboard activation on a tab. Implements the WAI-ARIA tabs pattern:
 * Up/Down moves focus and selection between tabs, Home/End jumps, Enter/Space
 * activates (focus already moved selection so these are no-ops aside from the
 * default click handler).
 *
 * @param event - KeyboardEvent from the tab button.
 * @param currentIndex - Index of the currently focused tab.
 * @returns Nothing.
 */
function onTabKeydown( event: KeyboardEvent, currentIndex: number ): void {
	const tagsList = tags.value
	if ( tagsList.length === 0 ) {
		return
	}

	let nextIndex: number | null = null
	switch ( event.key ) {
		case 'ArrowDown':
		case 'ArrowRight':
			nextIndex = ( currentIndex + 1 ) % tagsList.length
			break
		case 'ArrowUp':
		case 'ArrowLeft':
			nextIndex = ( currentIndex - 1 + tagsList.length ) % tagsList.length
			break
		case 'Home':
			nextIndex = 0
			break
		case 'End':
			nextIndex = tagsList.length - 1
			break
		default:
			return
	}

	event.preventDefault()
	if ( nextIndex === null ) {
		return
	}
	const nextTag = tagsList[ nextIndex ]
	if ( !nextTag ) {
		return
	}
	selectTag( nextTag.name )
	void nextTick( () => {
		tabButtonRefs.value[ nextIndex! ]?.focus()
	} )
}

/**
 * Initializes the selected tag once the outline arrives. Prefers the tag
 * named in `#tag=` if it exists; otherwise falls back to the first tag.
 *
 * @returns Nothing.
 */
function initializeSelection(): void {
	if ( tags.value.length === 0 ) {
		selectedTagName.value = null
		return
	}
	const hashTag = readTagFromHash()
	if ( hashTag && tags.value.some( ( tag ) => tag.name === hashTag ) ) {
		selectedTagName.value = hashTag
	} else {
		selectedTagName.value = tags.value[ 0 ]?.name ?? null
	}
}

// Initialize when the outline arrives (or changes shape on retry).
// `immediate: true` covers the case where the outline is already loaded
// synchronously from cache during setup.
watch( tags, ( nextTags ) => {
	if ( nextTags.length === 0 ) {
		selectedTagName.value = null
		return
	}
	if ( !selectedTagName.value || !nextTags.some( ( tag ) => tag.name === selectedTagName.value ) ) {
		initializeSelection()
	}
}, { immediate: true } )

// React to external hash changes (browser back/forward, manual edits).
watch( () => route.hash, () => {
	const hashTag = readTagFromHash()
	if ( hashTag && tags.value.some( ( tag ) => tag.name === hashTag ) ) {
		if ( hashTag !== selectedTagName.value ) {
			selectedTagName.value = hashTag
		}
	}
} )
</script>

<template>
	<section class="explorer-enterprise-custom">
		<div
			v-if="isLoading"
			class="explorer-enterprise-custom__loading"
		>
			<div class="explorer-enterprise-custom__spinner" aria-hidden="true"></div>
			<p>{{ loadingLabel }}</p>
		</div>

		<CdxMessage
			v-else-if="hasError"
			type="error"
		>
			{{ errorLabel }}<template v-if="errorMessage">: <bdi>{{ errorMessage }}</bdi></template>
		</CdxMessage>

		<CdxMessage
			v-else-if="!hasTags"
			type="notice"
		>
			{{ emptyLabel }}
		</CdxMessage>

		<div
			v-else
			class="explorer-enterprise-custom__layout"
		>
			<div
				role="tablist"
				:aria-label="tablistLabel"
				aria-orientation="vertical"
				class="explorer-enterprise-custom__tablist"
			>
				<button
					v-for="(tag, tagIndex) in tags"
					:id="tabId( tag.name )"
					:key="tag.name"
					:ref="( element ) => {
						if ( element ) {
							tabButtonRefs[ tagIndex ] = element as HTMLButtonElement
						}
					}"
					type="button"
					role="tab"
					:aria-selected="tag.name === selectedTagName"
					:aria-controls="tabPanelId( tag.name )"
					:tabindex="tag.name === selectedTagName ? 0 : -1"
					class="explorer-enterprise-custom__tab"
					:class="{ 'explorer-enterprise-custom__tab--active': tag.name === selectedTagName }"
					@click="onTabClick( tag.name )"
					@keydown="onTabKeydown( $event, tagIndex )"
				>
					<bdi>{{ displayNameForTag( tag ) }}</bdi>
				</button>
			</div>

			<div
				v-if="selectedTag"
				:id="tabPanelId( selectedTag.name )"
				role="tabpanel"
				:aria-labelledby="tabId( selectedTag.name )"
				tabindex="0"
				class="explorer-enterprise-custom__panel"
			>
				<header class="explorer-enterprise-custom__panel-header">
					<h2 class="explorer-enterprise-custom__panel-title">
						<bdi>{{ displayNameForTag( selectedTag ) }}</bdi>
					</h2>
					<div
						v-if="selectedTag.description"
						class="explorer-enterprise-custom__tag-description"
					>
						<bdi v-html="renderMarkdown( selectedTag.description )"></bdi>
					</div>
				</header>

				<p
					v-if="selectedOperations.length === 0"
					class="explorer-enterprise-custom__empty-state"
				>
					{{ emptyTagLabel }}
				</p>

				<ol
					v-else
					class="explorer-enterprise-custom__operation-list"
				>
					<li
						v-for="operation in selectedOperations"
						:key="( operation.operationId ?? operation.path ) + ':' + operation.method"
						class="explorer-enterprise-custom__operation"
					>
						<div class="explorer-enterprise-custom__operation-row">
							<!-- HTTP verbs are LTR identifiers regardless of interface direction. -->
							<span
								class="explorer-enterprise-custom__method"
								:data-method="operation.method"
								dir="ltr"
							>
								{{ operation.method.toUpperCase() }}
							</span>
							<span class="explorer-enterprise-custom__path">
								<bdi>{{ operation.path }}</bdi>
							</span>
						</div>
						<p
							v-if="operation.summary"
							class="explorer-enterprise-custom__summary"
						>
							<bdi>{{ operation.summary }}</bdi>
						</p>
						<div
							v-if="operation.description"
							class="explorer-enterprise-custom__description"
						>
							<bdi v-html="renderMarkdown( operation.description )"></bdi>
						</div>
					</li>
				</ol>
			</div>
		</div>
	</section>
</template>

<style scoped>
.explorer-enterprise-custom {
	display: flex;
	flex-direction: column;
	min-inline-size: 0;
	min-block-size: 24rem;
	border: 1px solid var( --border-color-subtle );
	border-radius: var( --border-radius-base );
	background-color: var( --background-color-base );
	overflow: hidden;
}

.explorer-enterprise-custom__loading {
	display: grid;
	place-items: center;
	gap: var( --spacing-100 );
	padding: var( --spacing-200 );
	min-block-size: 24rem;
	background:
		radial-gradient( circle at top, color-mix( in srgb, var( --background-color-progressive-subtle ) 65%, transparent ) 0%, transparent 55% ),
		linear-gradient( 180deg, var( --background-color-base ) 0%, var( --background-color-neutral-subtle ) 100% );
	text-align: center;
}

.explorer-enterprise-custom__loading p {
	margin: 0;
}

.explorer-enterprise-custom__spinner {
	inline-size: 2.5rem;
	block-size: 2.5rem;
	border: 3px solid var( --border-color-subtle );
	border-top-color: var( --color-progressive );
	border-radius: 50%;
	animation: explorer-enterprise-custom-spin 0.9s linear infinite;
}

@keyframes explorer-enterprise-custom-spin {
	from {
		transform: rotate( 0deg );
	}

	to {
		transform: rotate( 360deg );
	}
}

.explorer-enterprise-custom__layout {
	display: grid;
	gap: 0;
	grid-template-columns: 1fr;
	min-block-size: 0;
	flex: 1 1 auto;
}

.explorer-enterprise-custom__tablist {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-25 );
	padding: var( --spacing-75 );
	background-color: var( --background-color-neutral-subtle );
	border-block-end: 1px solid var( --border-color-subtle );
	font-family: var( --font-family-sans-stack );
	min-inline-size: 0;
}

.explorer-enterprise-custom__tab {
	display: block;
	inline-size: 100%;
	padding-block: var( --spacing-50 );
	padding-inline: var( --spacing-75 );
	border: none;
	border-radius: var( --border-radius-base );
	background: transparent;
	color: var( --color-base );
	font-family: var( --font-family-sans-stack );
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-small );
	text-align: start;
	cursor: pointer;
	min-inline-size: 0;
	overflow-wrap: anywhere;
}

.explorer-enterprise-custom__tab:hover {
	background-color: var( --background-color-interactive-subtle );
}

.explorer-enterprise-custom__tab:focus-visible {
	outline: 2px solid var( --color-progressive );
	outline-offset: -2px;
}

.explorer-enterprise-custom__tab--active {
	background-color: var( --background-color-progressive-subtle );
	color: var( --color-emphasized );
	font-weight: var( --font-weight-bold );
}

.explorer-enterprise-custom__panel {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-150 );
	padding: var( --spacing-150 );
	min-inline-size: 0;
	overflow-y: auto;
	overscroll-behavior: contain;
}

.explorer-enterprise-custom__panel:focus-visible {
	outline: none;
}

.explorer-enterprise-custom__panel-header {
	display: grid;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.explorer-enterprise-custom__panel-title {
	margin: 0;
	font-size: var( --font-size-large );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-medium );
	color: var( --color-emphasized );
}

.explorer-enterprise-custom__tag-description {
	color: var( --color-subtle );
}

.explorer-enterprise-custom__operation-list {
	margin: 0;
	padding: 0;
	list-style: none;
	display: grid;
	gap: var( --spacing-150 );
}

.explorer-enterprise-custom__operation {
	display: grid;
	gap: var( --spacing-50 );
	padding: var( --spacing-100 );
	border: 1px solid var( --border-color-subtle );
	border-radius: var( --border-radius-base );
	background-color: var( --background-color-base );
	min-inline-size: 0;
}

.explorer-enterprise-custom__operation-row {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: var( --spacing-75 );
	min-inline-size: 0;
}

.explorer-enterprise-custom__method {
	flex-shrink: 0;
	font-family: var( --font-family-monospace-stack );
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-bold );
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: var( --color-base );
}

/* Method colour palette mirrors ExplorerModuleRail per DESIGN_REQUIREMENTS §Endpoint rows. */
.explorer-enterprise-custom__method[data-method='get'] {
	color: var( --color-progressive );
}

.explorer-enterprise-custom__method[data-method='post'] {
	color: var( --color-success );
}

.explorer-enterprise-custom__method[data-method='delete'] {
	color: var( --color-destructive );
}

.explorer-enterprise-custom__method[data-method='put'],
.explorer-enterprise-custom__method[data-method='patch'] {
	color: var( --color-warning );
}

.explorer-enterprise-custom__path {
	flex: 1 1 auto;
	min-inline-size: 1px;
	font-family: var( --font-family-monospace-stack );
	font-size: var( --font-size-medium );
	color: var( --color-base );
	overflow-wrap: anywhere;
}

.explorer-enterprise-custom__summary {
	margin: 0;
	font-size: var( --font-size-medium );
	color: var( --color-base );
}

.explorer-enterprise-custom__description {
	font-size: var( --font-size-small );
	color: var( --color-subtle );
}

.explorer-enterprise-custom__description :deep( p ) {
	margin: 0 0 var( --spacing-50 );
}

.explorer-enterprise-custom__description :deep( p:last-child ) {
	margin-block-end: 0;
}

.explorer-enterprise-custom__description :deep( code ) {
	font-family: var( --font-family-monospace-stack );
	font-size: var( --font-size-x-small );
	padding-inline: var( --spacing-25 );
	background-color: var( --background-color-neutral-subtle );
	border-radius: var( --border-radius-base );
}

.explorer-enterprise-custom__description :deep( a ) {
	color: var( --color-progressive );
}

.explorer-enterprise-custom__empty-state {
	margin: 0;
	color: var( --color-subtle );
}

@media screen and ( min-width: 960px ) {
	.explorer-enterprise-custom {
		block-size: 100%;
		min-block-size: 0;
	}

	.explorer-enterprise-custom__layout {
		grid-template-columns: minmax( 12rem, 14rem ) minmax( 0, 1fr );
		min-block-size: 0;
	}

	.explorer-enterprise-custom__tablist {
		border-block-end: none;
		border-inline-end: 1px solid var( --border-color-subtle );
		overflow-y: auto;
	}
}
</style>
