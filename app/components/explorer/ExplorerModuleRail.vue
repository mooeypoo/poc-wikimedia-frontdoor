<script setup lang="ts">
import { CdxButton, CdxIcon, CdxMenuItem } from '@wikimedia/codex'
import { cdxIconCollapse, cdxIconExpand } from '@wikimedia/codex-icons'
import type { ExplorerModuleRailLayoutMode } from '../../composables/useExplorerModuleRailPlacement'
import type { ExplorerBootstrapModule, ExplorerModuleOperation } from '../../composables/useExplorerBootstrap'
import { useExplorerModuleRailInlineEndpointScrollCap } from '../../composables/useExplorerModuleRailInlineEndpointScrollCap'
import {
	formatEndpointAccessibleLabel,
	resolveEndpointNameLabel
} from '../../utils/explorerEndpointLabels'

/**
 * ExplorerModuleRail — endpoint navigation for the selected REST API module.
 *
 * Desktop end column: always expanded with a large module heading.
 * Inline (below project controls): collapsible panel per Figma mobile API Explorer (477:4968);
 * expanded lists with more than seven endpoints cap the scrollport via
 * `useExplorerModuleRailInlineEndpointScrollCap` (`config/explorerModuleRail.ts`).
 *
 * **Codex exception:** `CdxMenuItem` outside a floating `CdxMenu` — same approved pattern as
 * `ShellSidePanelNav` (static shell list). Endpoint rows use the default slot for method +
 * name styling; `:label` supplies the accessible name.
 */
const props = defineProps<{
	selectedModule: ExplorerBootstrapModule
	/** Bootstrap operation id for the endpoint row currently focused in Scalar. */
	selectedEndpointOperationId: string | null
	isInstanceBootstrapping: boolean
	layoutMode: ExplorerModuleRailLayoutMode
}>()

const emit = defineEmits<{
	'endpoint-click': [ moduleName: string, operation: ExplorerModuleOperation ]
}>()

const { $bananaI18n } = useNuxtApp()

const isInlineLayout = computed( () => props.layoutMode === 'inline' )
const isEndpointListExpanded = ref( false )
const endpointScrollportElement = ref<HTMLElement | null>( null )
const endpointListElement = ref<HTMLElement | null>( null )
const isEndpointListScrolled = ref( false )

const endpointCount = computed( () => props.selectedModule.operations.length )

const { isInlineEndpointScrollCapped } = useExplorerModuleRailInlineEndpointScrollCap(
	endpointScrollportElement,
	endpointListElement,
	isInlineLayout,
	isEndpointListExpanded,
	endpointCount
)

const endpointsNavigationLabel = computed( () => $bananaI18n( 'explorer-endpoints-label' ) )
const endpointsEmptyLabel = computed( () => $bananaI18n( 'explorer-endpoints-empty' ) )
const moduleUnavailableLabel = computed( () => $bananaI18n( 'explorer-module-unavailable' ) )
const endpointFallbackLabel = computed( () => $bananaI18n( 'explorer-endpoint-fallback' ) )
const expandEndpointsLabel = computed( () => $bananaI18n( 'explorer-module-rail-expand-endpoints-label' ) )
const collapseEndpointsLabel = computed( () => $bananaI18n( 'explorer-module-rail-collapse-endpoints-label' ) )

const endpointListElementId = computed( () => {
	return `explorer-module-rail-endpoints-${ props.selectedModule.name.replace( /[^\w-]+/g, '-' ) }`
} )

const toggleEndpointsLabel = computed( () => {
	return isEndpointListExpanded.value ? collapseEndpointsLabel.value : expandEndpointsLabel.value
} )

const toggleEndpointsIcon = computed( () => {
	return isEndpointListExpanded.value ? cdxIconCollapse : cdxIconExpand
} )

const shouldShowEndpointList = computed( () => {
	if ( !isInlineLayout.value ) {
		return true
	}

	return isEndpointListExpanded.value
} )

watch( () => props.selectedModule.name, () => {
	isEndpointListScrolled.value = false

	if ( endpointScrollportElement.value ) {
		endpointScrollportElement.value.scrollTop = 0
	}

	isEndpointListExpanded.value = false
} )

watch( isInlineLayout, ( nextIsInlineLayout ) => {
	if ( nextIsInlineLayout ) {
		isEndpointListExpanded.value = false
		isEndpointListScrolled.value = false
	}
} )

watch( isEndpointListExpanded, ( isExpanded ) => {
	if ( !isExpanded ) {
		isEndpointListScrolled.value = false
		return
	}

	void nextTick( () => {
		if ( !endpointScrollportElement.value ) {
			return
		}

		isEndpointListScrolled.value = endpointScrollportElement.value.scrollTop > 0
	} )
} )

/**
 * Toggles endpoint list visibility in the inline collapsible layout.
 *
 * @returns Nothing.
 */
function onToggleEndpointListClick(): void {
	isEndpointListExpanded.value = !isEndpointListExpanded.value
}

/**
 * Handles activation of an endpoint menu item.
 *
 * @param moduleOperation - Operation metadata for the clicked row.
 * @returns Nothing.
 */
function onEndpointMenuItemClick( moduleOperation: ExplorerModuleOperation ): void {
	emit( 'endpoint-click', props.selectedModule.name, moduleOperation )
}

/**
 * Tracks endpoint scrollport offset so the scrollport can show a top border when scrolled.
 *
 * @param scrollEvent - Scroll event from `.explorer-module-rail__endpoint-scrollport`.
 * @returns Nothing.
 */
function onEndpointScrollportScroll( scrollEvent: Event ): void {
	const scrollTarget = scrollEvent.target

	if ( !( scrollTarget instanceof HTMLElement ) ) {
		return
	}

	isEndpointListScrolled.value = scrollTarget.scrollTop > 0
}
</script>

<template>
	<aside
		class="explorer-module-rail frontdoor-end-panel-nav"
		:class="{
			'explorer-module-rail--end-column': !isInlineLayout,
			'explorer-module-rail--inline': isInlineLayout
		}"
		:aria-busy="isInstanceBootstrapping"
	>
		<header
			class="explorer-module-rail__header"
			:class="{ 'explorer-module-rail__header--inline': isInlineLayout }"
		>
			<h2
				class="explorer-module-rail__title"
				:class="{ 'explorer-module-rail__title--inline': isInlineLayout }"
			>
				<bdi>{{ selectedModule.headingTitle }}</bdi>
			</h2>
			<CdxButton
				v-if="isInlineLayout"
				class="explorer-module-rail__toggle"
				weight="quiet"
				type="button"
				:aria-label="toggleEndpointsLabel"
				:aria-expanded="isEndpointListExpanded"
				:aria-controls="endpointListElementId"
				@click="onToggleEndpointListClick"
			>
				<CdxIcon :icon="toggleEndpointsIcon" />
			</CdxButton>
		</header>

		<div
			v-show="shouldShowEndpointList"
			:id="endpointListElementId"
			ref="endpointScrollportElement"
			class="explorer-module-rail__endpoint-scrollport"
			:class="{
				'explorer-module-rail__endpoint-scrollport--inline-capped': isInlineEndpointScrollCapped
			}"
			@scroll="onEndpointScrollportScroll"
		>
			<div
				v-if="isEndpointListScrolled"
				class="explorer-module-rail__scroll-divider"
				aria-hidden="true"
			/>

			<p
				v-if="selectedModule.hasSpecError"
				class="explorer-module-rail__module-unavailable"
			>
				{{ moduleUnavailableLabel }}
			</p>

			<p
				v-else-if="!selectedModule.operations.length"
				class="explorer-module-rail__module-empty-state"
			>
				{{ endpointsEmptyLabel }}
			</p>

			<nav
				v-else
				ref="endpointListElement"
				class="explorer-module-rail__endpoint-list"
				:aria-label="endpointsNavigationLabel"
			>
				<CdxMenuItem
					v-for="moduleOperation in selectedModule.operations"
					:id="`explorer-module-rail-endpoint-${ moduleOperation.id }`"
					:key="moduleOperation.id"
					class="explorer-module-rail__menu-item"
					:value="moduleOperation.id"
					:label="formatEndpointAccessibleLabel( moduleOperation, endpointFallbackLabel )"
					:selected="moduleOperation.id === selectedEndpointOperationId"
					@click.prevent="onEndpointMenuItemClick( moduleOperation )"
				>
					<span class="explorer-module-rail__endpoint-label">
						<!-- HTTP verbs are LTR identifiers regardless of interface direction. -->
						<span
							class="explorer-module-rail__endpoint-method"
							:data-method="moduleOperation.method.toLowerCase()"
							dir="ltr"
						>
							{{ moduleOperation.method }}
						</span>
						<span class="explorer-module-rail__endpoint-name">
							<bdi>{{ resolveEndpointNameLabel( moduleOperation, endpointFallbackLabel ) }}</bdi>
						</span>
					</span>
				</CdxMenuItem>
			</nav>
		</div>
	</aside>
</template>

<style scoped>
.explorer-module-rail {
	display: flex;
	flex-direction: column;
	align-self: start;
	min-block-size: 0;
	overflow: hidden;
	padding-inline: 0;
	border-radius: var( --fd-explorer-controls-surface-border-radius );
	background-color: var( --fd-explorer-controls-surface-background-color );
	font-family: var( --font-family-sans-stack );
}

.explorer-module-rail--inline {
	inline-size: 100%;
	padding-inline: var( --spacing-50 );
	padding-block: var( --spacing-75 );
	gap: var( --spacing-75 );
}

.explorer-module-rail__header {
	flex-shrink: 0;
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var( --spacing-50 );
	min-inline-size: 0;
	padding-block-start: var( --spacing-75 );
	padding-block-end: var( --spacing-50 );
	padding-inline: var( --spacing-75 );
}

.explorer-module-rail__header--inline {
	align-items: center;
	padding: var( --spacing-75 );
}

.explorer-module-rail--inline .explorer-module-rail__header--inline {
	padding: 0;
}

.explorer-module-rail__title {
	margin: 0;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-small );
	inline-size: 100%;
	min-inline-size: 0;
}

.explorer-module-rail__title--inline {
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
}

.explorer-module-rail__toggle {
	flex-shrink: 0;
}

.explorer-module-rail__endpoint-scrollport {
	flex: 1 1 auto;
	min-block-size: 0;
	overflow-y: auto;
	overscroll-behavior: contain;
	padding-block-end: var( --spacing-75 );
}

/*
 * Sticky divider at the top of the scrollport viewport when the list is scrolled.
 * Real element (not ::before) so the line stays fixed while endpoint rows scroll beneath it.
 */
.explorer-module-rail__scroll-divider {
	position: sticky;
	inset-block-start: 0;
	z-index: 1;
	flex-shrink: 0;
	block-size: 0;
	margin-inline: var( --spacing-75 );
	border-block-start: 1px solid var( --border-color-subtle );
	pointer-events: none;
}

.explorer-module-rail--inline .explorer-module-rail__scroll-divider {
	margin-inline: 0;
}

.explorer-module-rail--inline .explorer-module-rail__endpoint-scrollport {
	padding-block-end: 0;
}

.explorer-module-rail__endpoint-scrollport--inline-capped {
	max-block-size: var( --explorer-module-rail-inline-endpoint-scroll-max-block-size );
}

.explorer-module-rail__module-unavailable,
.explorer-module-rail__module-empty-state {
	margin: 0;
	padding-inline: var( --spacing-75 );
	font-size: var( --font-size-small );
}

.explorer-module-rail--inline .explorer-module-rail__module-unavailable,
.explorer-module-rail--inline .explorer-module-rail__module-empty-state {
	padding-inline: 0;
}

.explorer-module-rail__endpoint-list {
	display: flex;
	flex-direction: column;
	gap: 0;
	min-inline-size: 0;
	inline-size: 100%;
}

.explorer-module-rail__menu-item {
	inline-size: 100%;
}

.explorer-module-rail__endpoint-list :deep( .explorer-module-rail__menu-item.cdx-menu-item ),
.explorer-module-rail__endpoint-list :deep( .cdx-menu-item ) {
	inline-size: 100%;
	margin-inline-start: 0;
	padding-inline-start: var( --spacing-75 );
	padding-inline-end: var( --spacing-75 );
}

/* Selected rows: progressive name colour only — no Codex progressive-subtle fill. */
.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--selected ),
.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--selected.cdx-menu-item--enabled:hover ) {
	background-color: transparent;
}

.explorer-module-rail--inline .explorer-module-rail__endpoint-list :deep( .explorer-module-rail__menu-item.cdx-menu-item ),
.explorer-module-rail--inline .explorer-module-rail__endpoint-list :deep( .cdx-menu-item ) {
	padding-inline-start: 0;
	padding-inline-end: 0;
}

.explorer-module-rail__endpoint-label {
	display: block;
	min-inline-size: 0;
	line-height: var( --line-height-small );
	overflow-wrap: anywhere;
}

.explorer-module-rail__endpoint-method {
	display: inline;
	white-space: nowrap;
	margin-inline-end: var( --spacing-50 );
	font-family: var( --font-family-monospace-stack );
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-bold );
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: var( --color-base );
}

.explorer-module-rail__endpoint-method[data-method='get'] {
	color: var( --color-progressive );
}

.explorer-module-rail__endpoint-method[data-method='post'] {
	color: var( --color-success );
}

.explorer-module-rail__endpoint-method[data-method='delete'] {
	color: var( --color-destructive );
}

.explorer-module-rail__endpoint-method[data-method='put'],
.explorer-module-rail__endpoint-method[data-method='patch'] {
	color: var( --color-warning );
}

.explorer-module-rail__endpoint-name {
	display: inline;
	font-family: var( --font-family-sans-stack );
	font-size: var( --font-size-small );
	color: var( --color-base );
	overflow-wrap: anywhere;
}

/* CdxMenuItem outside CdxMenu: name turns progressive on hover; HTTP methods keep semantic colours. */
.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .explorer-module-rail__endpoint-name ) {
	color: var( --color-progressive );
}

.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--selected .explorer-module-rail__endpoint-name ) {
	color: var( --color-progressive );
}

.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--selected .explorer-module-rail__endpoint-method[data-method='get'] ) {
	color: var( --color-progressive );
}

.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--selected .explorer-module-rail__endpoint-method[data-method='post'] ) {
	color: var( --color-success );
}

.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--selected .explorer-module-rail__endpoint-method[data-method='delete'] ) {
	color: var( --color-destructive );
}

.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--selected .explorer-module-rail__endpoint-method[data-method='put'] ),
.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--selected .explorer-module-rail__endpoint-method[data-method='patch'] ) {
	color: var( --color-warning );
}

.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .explorer-module-rail__endpoint-method[data-method='get'] ) {
	color: var( --color-progressive );
}

.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .explorer-module-rail__endpoint-method[data-method='post'] ) {
	color: var( --color-success );
}

.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .explorer-module-rail__endpoint-method[data-method='delete'] ) {
	color: var( --color-destructive );
}

.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .explorer-module-rail__endpoint-method[data-method='put'] ),
.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .explorer-module-rail__endpoint-method[data-method='patch'] ) {
	color: var( --color-warning );
}

@media screen and ( max-width: 1119px ) {
	.explorer-module-rail--end-column {
		overflow: visible;
	}

	.explorer-module-rail--end-column .explorer-module-rail__endpoint-scrollport {
		overflow-y: visible;
	}
}
</style>
