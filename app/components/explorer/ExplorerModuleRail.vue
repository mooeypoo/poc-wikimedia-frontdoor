<script setup lang="ts">
import { CdxField, CdxIcon, CdxMessage, CdxSelect } from '@wikimedia/codex'
import { cdxIconCollapse, cdxIconExpand } from '@wikimedia/codex-icons'
import type { ExplorerBootstrapModule, ExplorerModuleOperation } from '../../composables/useExplorerBootstrap'

interface PickerMenuItem {
	label: string
	value: string
}

/**
 * ExplorerModuleRail — right-hand API modules navigation for the explorer.
 *
 * Renders wiki project selection and expandable module headings with
 * endpoint entries. Presentational only; the explorer page owns state
 * and passes handlers for user interactions.
 */
const props = defineProps<{
	modules: ExplorerBootstrapModule[]
	selectedModuleName: string
	expandedModuleName: string
	wikiInstanceMenuItems: PickerMenuItem[]
	instancePlaceholderLabel: string
	isInstanceBootstrapping: boolean
}>()

const emit = defineEmits<{
	'module-expand-toggle': [ moduleName: string, isOpen: boolean ]
	'endpoint-click': [ moduleName: string, operation: ExplorerModuleOperation ]
}>()

const selectedWikiInstanceId = defineModel<string>( 'selectedWikiInstanceId', {
	required: true
} )

const { $i18n } = useNuxtApp()

const apiModulesTitle = computed( () => $i18n( 'explorer-api-modules-title' ) )
const wikiProjectLabel = computed( () => $i18n( 'explorer-wiki-project-label' ) )
const wikiProjectHelpLabel = computed( () => $i18n( 'explorer-wiki-project-help' ) )
const noSelectableModulesLabel = computed( () => $i18n( 'explorer-no-selectable-modules' ) )
const failedModulesLabel = computed( () => $i18n( 'explorer-failed-modules-label' ) )
const endpointsEmptyLabel = computed( () => $i18n( 'explorer-endpoints-empty' ) )
const moduleUnavailableLabel = computed( () => $i18n( 'explorer-module-unavailable' ) )
const endpointFallbackLabel = computed( () => $i18n( 'explorer-endpoint-fallback' ) )

const hasSelectableModules = computed( () => {
	return props.modules.some( ( moduleItem ) => !moduleItem.hasSpecError )
} )

const failedModules = computed( () => {
	return props.modules.filter( ( moduleItem ) => moduleItem.hasSpecError )
} )

/**
 * Returns whether the given module section is expanded.
 *
 * @param moduleName - Module name to check.
 * @returns True when the module section is open.
 */
function isModuleExpanded( moduleName: string ): boolean {
	return props.expandedModuleName === moduleName
}

/**
 * Resolves the endpoint label shown beside the HTTP method.
 *
 * @param operation - Module operation metadata.
 * @returns Summary text or the generic endpoint fallback label.
 */
function getEndpointLabel( operation: ExplorerModuleOperation ): string {
	return operation.summary || endpointFallbackLabel.value
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
</script>

<template>
	<aside
		class="explorer-module-rail"
		:aria-busy="isInstanceBootstrapping"
	>
		<header class="explorer-module-rail__header">
			<h2 class="explorer-module-rail__title">
				{{ apiModulesTitle }}
			</h2>
			<CdxField class="explorer-module-rail__wiki-field">
				<template #label>
					{{ wikiProjectLabel }}
				</template>
				<template #help-text>
					{{ wikiProjectHelpLabel }}
				</template>
				<CdxSelect
					v-model:selected="selectedWikiInstanceId"
					:menu-items="wikiInstanceMenuItems"
					:default-label="instancePlaceholderLabel"
					:disabled="isInstanceBootstrapping"
				/>
			</CdxField>
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
					@click="onModuleHeadingClick( moduleOption.name )"
				>
					<span class="explorer-module-rail__module-heading-label">
						<bdi>{{ moduleOption.label }}</bdi>
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
								@click="emit( 'endpoint-click', moduleOption.name, moduleOperation )"
							>
								<span
									class="explorer-module-rail__endpoint-method"
									:data-method="moduleOperation.method.toLowerCase()"
								>
									{{ moduleOperation.method }}
								</span>
								<span class="explorer-module-rail__endpoint-label">
									<bdi>{{ getEndpointLabel( moduleOperation ) }}</bdi>
								</span>
							</button>
						</li>
					</ol>
				</div>
			</section>
		</div>

		<CdxMessage
			v-if="failedModules.length"
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
	align-content: start;
	gap: var( --spacing-125 );
	padding: var( --spacing-75 );
	min-inline-size: 0;
	max-inline-size: 100%;
	overflow-x: hidden;
	margin-block-start: var( --fd-explorer-rail-offset );
	position: sticky;
	inset-block-start: var( --fd-explorer-rail-offset );
	max-block-size: calc( 100vh - var( --fd-explorer-rail-offset ) );
	overflow-y: auto;
	overscroll-behavior: contain;
	border-radius: var( --border-radius-base );
	background-color: var( --background-color-neutral-subtle );
}

.explorer-module-rail__header {
	display: grid;
	gap: var( --spacing-100 );
	min-inline-size: 0;
}

.explorer-module-rail__title {
	margin: 0;
	font-family: inherit;
	font-size: var( --font-size-large );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-large );
	color: var( --color-emphasized );
}

.explorer-module-rail__wiki-field {
	position: relative;
	z-index: 20;
	inline-size: 100%;
	min-inline-size: 0;
	max-inline-size: 100%;
}

.explorer-module-rail__wiki-field :deep( .cdx-select-vue ),
.explorer-module-rail__wiki-field :deep( .cdx-select-vue__handle ) {
	inline-size: 100%;
	max-inline-size: 100%;
	min-inline-size: 0;
}

.explorer-module-rail__wiki-field :deep( .cdx-select-vue__handle-button ) {
	min-inline-size: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.explorer-module-rail__module-list {
	display: grid;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.explorer-module-rail__module {
	min-inline-size: 0;
}

.explorer-module-rail__module-heading {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var( --spacing-100 );
	inline-size: 100%;
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-50 );
	border: none;
	background: transparent;
	cursor: pointer;
	text-align: start;
}

.explorer-module-rail__module-heading:hover {
	background-color: var( --background-color-interactive-subtle );
}

.explorer-module-rail__module-heading-label {
	flex: 1 1 auto;
	min-inline-size: 0;
	font-family: inherit;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-medium );
	color: var( --color-emphasized );
	overflow-wrap: anywhere;
}

.explorer-module-rail__module-expand-icon {
	flex-shrink: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	inline-size: 14px;
	block-size: 14px;
	overflow: hidden;
	color: var( --color-subtle );
}

.explorer-module-rail__module-expand-icon :deep( .cdx-icon ) {
	display: block;
	inline-size: 14px;
	block-size: 14px;
	font-size: 14px;
}

.explorer-module-rail__module-expand-icon :deep( .cdx-icon svg ) {
	display: block;
	inline-size: 14px;
	block-size: 14px;
}

.explorer-module-rail__module-panel {
	padding-inline: var( --spacing-50 );
	padding-block-end: var( --spacing-75 );
	min-inline-size: 0;
}

.explorer-module-rail__module-unavailable,
.explorer-module-rail__module-empty-state {
	margin: 0;
	color: var( --color-subtle );
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

.explorer-module-rail__endpoint-action:hover .explorer-module-rail__endpoint-label {
	text-decoration: underline;
}

.explorer-module-rail__endpoint-method {
	flex-shrink: 0;
	font-family: var( --font-family-monospace );
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

.explorer-module-rail__endpoint-label {
	flex: 1 1 auto;
	min-inline-size: 0;
	color: var( --color-base );
	font-size: var( --font-size-medium );
	overflow-wrap: anywhere;
}

@media screen and ( max-width: 69.999rem ) {
	.explorer-module-rail {
		margin-block-start: 0;
		position: static;
		max-block-size: none;
	}
}
</style>
