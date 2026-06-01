<script setup lang="ts">
import { CdxIcon, CdxInfoChip, CdxMessage } from '@wikimedia/codex'
import { cdxIconCollapse, cdxIconExpand } from '@wikimedia/codex-icons'
import type { ExplorerBootstrapModule, ExplorerModuleOperation } from '../../composables/useExplorerBootstrap'
import {
	formatEndpointAccessibleLabel,
	resolveEndpointPathLabel
} from '../../utils/explorerEndpointLabels'
import { formatModuleRailHeadingAriaLabel } from '../../utils/explorerModuleRailHeading'

/**
 * ExplorerModuleRail — right-hand API modules navigation for the explorer.
 *
 * Renders expandable module headings with endpoint entries. Presentational only;
 * the explorer page owns state and passes handlers for user interactions.
 */
const props = defineProps<{
	modules: ExplorerBootstrapModule[]
	failedModules: ExplorerBootstrapModule[]
	hasSelectableModules: boolean
	selectedModuleName: string
	expandedModuleNames: string[]
	wikiDisplayName: string
	isInstanceBootstrapping: boolean
}>()

const emit = defineEmits<{
	'module-expand-toggle': [ moduleName: string, isOpen: boolean ]
	'endpoint-click': [ moduleName: string, operation: ExplorerModuleOperation ]
}>()

const { $bananaI18n } = useNuxtApp()

const browseModulesTitleBefore = computed( () => $bananaI18n( 'explorer-browse-api-modules-before' ) )
const browseModulesTitleAfter = computed( () => $bananaI18n( 'explorer-browse-api-modules-after' ) )
const noSelectableModulesLabel = computed( () => $bananaI18n( 'explorer-no-selectable-modules' ) )
const failedModulesLabel = computed( () => $bananaI18n( 'explorer-failed-modules-label' ) )
const endpointsEmptyLabel = computed( () => $bananaI18n( 'explorer-endpoints-empty' ) )
const moduleUnavailableLabel = computed( () => $bananaI18n( 'explorer-module-unavailable' ) )
const endpointFallbackLabel = computed( () => $bananaI18n( 'explorer-endpoint-fallback' ) )
const betaChipLabel = computed( () => $bananaI18n( 'explorer-module-beta-chip-label' ) )

/**
 * Returns whether the given module section is expanded.
 *
 * @param moduleName - Module name to check.
 * @returns True when the module section is open.
 */
function isModuleExpanded( moduleName: string ): boolean {
	return props.expandedModuleNames.includes( moduleName )
}

/**
 * Toggles a module section open or closed.
 *
 * @param moduleName - Module name for the heading that was activated.
 * @returns Nothing.
 */
function onModuleHeadingClick( moduleName: string ): void {
	emit( 'module-expand-toggle', moduleName, !isModuleExpanded( moduleName ) )
}

/**
 * Returns the expand or collapse icon for a module section heading.
 *
 * @param moduleName - Module name for the heading.
 * @returns Codex icon descriptor for the current expanded state.
 */
function getModuleExpandIcon( moduleName: string ) {
	return isModuleExpanded( moduleName ) ? cdxIconCollapse : cdxIconExpand
}

/**
 * Builds an accessible name for a module section heading button.
 *
 * @param moduleOption - Module metadata for the heading row.
 * @returns Title plus beta and version chip labels when present.
 */
function getModuleHeadingAccessibleLabel( moduleOption: ExplorerBootstrapModule ): string {
	return formatModuleRailHeadingAriaLabel(
		{
			headingTitle: moduleOption.headingTitle,
			versionChipLabel: moduleOption.versionChipLabel,
			showBetaChip: moduleOption.showBetaChip
		},
		betaChipLabel.value
	)
}
</script>

<template>
	<aside
		class="explorer-module-rail frontdoor-end-panel-nav"
		:aria-busy="isInstanceBootstrapping"
	>
		<header class="explorer-module-rail__header">
			<h2 class="explorer-module-rail__title">
				{{ browseModulesTitleBefore }}<bdi>{{ wikiDisplayName }}</bdi>{{ browseModulesTitleAfter }}
			</h2>
		</header>

		<CdxMessage
			v-if="!hasSelectableModules && !isInstanceBootstrapping"
			type="warning"
		>
			{{ noSelectableModulesLabel }}
		</CdxMessage>

		<div
			v-if="modules.length"
			class="explorer-module-rail__module-list"
		>
			<section
				v-for="moduleOption in modules"
				:key="moduleOption.specUrl"
				class="explorer-module-rail__module"
			>
				<button
					type="button"
					class="explorer-module-rail__module-heading"
					:aria-expanded="isModuleExpanded( moduleOption.name )"
					:aria-label="getModuleHeadingAccessibleLabel( moduleOption )"
					@click="onModuleHeadingClick( moduleOption.name )"
				>
					<span class="explorer-module-rail__module-heading-label">
						<bdi>{{ moduleOption.headingTitle }}</bdi>
						<CdxInfoChip
							v-if="moduleOption.showBetaChip"
							status="warning"
							class="explorer-module-rail__module-chip"
						>
							{{ betaChipLabel }}
						</CdxInfoChip>
						<CdxInfoChip
							v-if="moduleOption.versionChipLabel"
							status="success"
							class="explorer-module-rail__module-chip"
						>
							<bdi>{{ moduleOption.versionChipLabel }}</bdi>
						</CdxInfoChip>
					</span>
					<CdxIcon
						:icon="getModuleExpandIcon( moduleOption.name )"
						class="explorer-module-rail__module-expand-icon"
					/>
				</button>

				<div
					v-show="isModuleExpanded( moduleOption.name )"
					class="explorer-module-rail__module-panel"
				>
					<p
						v-if="moduleOption.hasSpecError"
						class="explorer-module-rail__module-unavailable"
					>
						{{ moduleUnavailableLabel }}
					</p>

					<p
						v-else-if="!moduleOption.operations.length"
						class="explorer-module-rail__module-empty-state"
					>
						{{ endpointsEmptyLabel }}
					</p>

					<ol
						v-else
						class="explorer-module-rail__endpoint-list"
					>
						<li
							v-for="moduleOperation in moduleOption.operations"
							:key="moduleOperation.id"
							class="explorer-module-rail__endpoint-item"
						>
							<button
								type="button"
								class="explorer-module-rail__endpoint-action"
								:aria-label="formatEndpointAccessibleLabel( moduleOperation, endpointFallbackLabel )"
								@click="emit( 'endpoint-click', moduleOption.name, moduleOperation )"
							>
								<!-- HTTP verbs are LTR identifiers regardless of interface direction. -->
								<span
									class="explorer-module-rail__endpoint-method"
									:data-method="moduleOperation.method.toLowerCase()"
									dir="ltr"
								>
									{{ moduleOperation.method }}
								</span>
								<span class="explorer-module-rail__endpoint-path">
									<bdi>{{ resolveEndpointPathLabel( moduleOperation, endpointFallbackLabel ) }}</bdi>
								</span>
							</button>
						</li>
					</ol>
				</div>
			</section>
		</div>

		<CdxMessage
			v-if="failedModules.length > 0"
			type="warning"
		>
			{{ failedModulesLabel }}:
			<bdi>{{ failedModules.map( ( moduleItem ) => moduleItem.label ).join( ', ' ) }}</bdi>
		</CdxMessage>
	</aside>
</template>

<style scoped>
.explorer-module-rail {
	display: grid;
	gap: var( --spacing-25 );
	padding-inline: var( --spacing-75 );
	border-radius: var( --border-radius-base );
	background-color: var( --background-color-neutral-subtle );
	font-family: var( --font-family-sans-stack );
}

.explorer-module-rail__header {
	display: grid;
	gap: var( --spacing-100 );
	min-inline-size: 0;
	position: sticky;
	inset-block-start: 0;
	z-index: 1;
	padding-block-end: var( --spacing-50 );
	background-color: var( --background-color-neutral-subtle );
}

.explorer-module-rail__title {
	margin: 0;
	font-size: var( --font-size-large );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-large );
	inline-size: 100%;
	padding-block-start: var( --spacing-75 );
}

.explorer-module-rail__module-list {
	display: grid;
	gap: 0;
	min-inline-size: 0;
	/* Keep the first module heading visible when the default module expands on load. */
	overflow-anchor: none;
}

.explorer-module-rail__module {
	min-inline-size: 0;
}

.explorer-module-rail__module-heading,
.explorer-module-rail__endpoint-action {
	/* Buttons do not inherit font-family from ancestors in most browsers (UA default is often Arial). */
	font-family: var( --font-family-sans-stack );
	color: var( --color-base );
}

.explorer-module-rail__module-heading {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var( --spacing-100 );
	inline-size: 100%;
	padding-block: var( --spacing-50 );
	padding-inline: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	text-align: start;
	scroll-margin-block-start: var( --spacing-50 );
}

.explorer-module-rail__module-heading:hover {
	background-color: var( --background-color-interactive-subtle );
}

.explorer-module-rail__module-heading-label {
	flex: 1 1 auto;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-50 );
	/* Prevent flex from shrinking the label to zero width in the narrow end column. */
	min-inline-size: 1px;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-medium );
	color: var( --color-emphasized );
	overflow-wrap: anywhere;
}

.explorer-module-rail__module-chip {
	flex-shrink: 0;
	font-weight: var( --font-weight-normal );
}

/* Module rail chips are text-only; hide Codex status icons (warning/success). */
.explorer-module-rail__module-chip :deep( .cdx-info-chip__icon ),
.explorer-module-rail__module-chip :deep( .cdx-info-chip__icon--vue ) {
	display: none;
}

.explorer-module-rail__module-expand-icon {
	--explorer-module-expand-icon-size: calc( 14px * 0.8 );
	flex-shrink: 0;
	align-self: flex-start;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding-block-start: var( --spacing-25 );
	inline-size: var( --explorer-module-expand-icon-size );
	block-size: var( --explorer-module-expand-icon-size );
	overflow: hidden;
	color: var( --color-subtle );
}

.explorer-module-rail__module-expand-icon :deep( .cdx-icon ) {
	display: block;
	inline-size: var( --explorer-module-expand-icon-size );
	block-size: var( --explorer-module-expand-icon-size );
	font-size: var( --explorer-module-expand-icon-size );
}

.explorer-module-rail__module-expand-icon :deep( .cdx-icon svg ) {
	display: block;
	inline-size: var( --explorer-module-expand-icon-size );
	block-size: var( --explorer-module-expand-icon-size );
}

.explorer-module-rail__module-panel {
	padding-inline: var( --spacing-50 );
	padding-block-end: var( --spacing-75 );
	min-inline-size: 0;
}

.explorer-module-rail__module-unavailable,
.explorer-module-rail__module-empty-state {
	margin: 0;
	font-size: var( --font-size-small );
}

.explorer-module-rail__endpoint-list {
	margin: 0;
	padding: 0;
	list-style: none;
	display: grid;
	gap: var( --spacing-50 );
}

.explorer-module-rail__endpoint-item {
	margin: 0;
	min-inline-size: 0;
}

.explorer-module-rail__endpoint-action {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: var( --spacing-50 );
	inline-size: 100%;
	padding: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	text-align: start;
	min-inline-size: 0;
}

.explorer-module-rail__endpoint-action:hover .explorer-module-rail__endpoint-path {
	text-decoration: underline;
}

.explorer-module-rail__endpoint-method {
	flex-shrink: 0;
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

.explorer-module-rail__endpoint-path {
	flex: 1 1 auto;
	min-inline-size: 1px;
	font-family: var( --font-family-monospace-stack );
	font-size: var( --font-size-small );
	color: var( --color-base );
	overflow-wrap: anywhere;
}

</style>
