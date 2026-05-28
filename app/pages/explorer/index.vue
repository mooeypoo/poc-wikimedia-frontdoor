<script setup lang="ts">
import { CdxAccordion, CdxButton, CdxField, CdxMessage, CdxSelect } from '@wikimedia/codex'
import { computed, markRaw, onMounted, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import { WIKI_INSTANCES } from '../../../config/instances'
import type { ExplorerModuleOperation } from '../../composables/useExplorerBootstrap'
import { useDirection } from '../../composables/useDirection'
import { useExplorerBootstrap } from '../../composables/useExplorerBootstrap'
import { useExplorerDiagnostics } from '../../composables/useExplorerDiagnostics'
import { useScalarConfig } from '../../composables/useScalarConfig'

interface PickerMenuItem {
	label: string
	value: string
}

definePageMeta( {
	i18n: false
} )

const { $i18n } = useNuxtApp()
const { selectedWikiInstanceId } = useDirection()
const {
	modules,
	availableModules,
	failedModules,
	wikiDisplayName,
	selectedModuleName,
	expandedModuleName,
	selectedModule,
	openApiSpecUrl,
	pendingOperationTarget,
	isInstanceBootstrapping,
	hasInstanceBootstrapError,
	instanceBootstrapErrorMessage,
	isScalarSwitching,
	selectModule,
	markScalarReady,
	retryBootstrap,
	clearPendingOperationTarget
} = useExplorerBootstrap( selectedWikiInstanceId )
const { entries: diagnosticsEntries } = useExplorerDiagnostics()

const scalarApiReferenceComponent = shallowRef<Component>()
const isScalarInterfaceLoading = ref( false )
const scalarShellRef = ref<HTMLElement | null>( null )

// <option>-like rendering targets cannot include HTML tags, so we use
// FSI/PDI markers to enforce BiDi isolation for external labels.
function isolateLabel( label: string ): string {
	return `\u2068${ label }\u2069`
}

const wikiInstanceMenuItems = computed<PickerMenuItem[]>( () => {
	return WIKI_INSTANCES.map( ( wikiInstance ) => ( {
		value: wikiInstance.id,
		label: isolateLabel( wikiInstance.displayName )
	} ) )
} )

const moduleMenuItems = computed<PickerMenuItem[]>( () => {
	return availableModules.value.map( ( moduleItem ) => ( {
		value: moduleItem.name,
		label: isolateLabel( moduleItem.label )
	} ) )
} )

const { scalarConfiguration } = useScalarConfig( openApiSpecUrl, {
	onLoaded: () => {
		markScalarReady()
		requestAnimationFrame( () => {
			focusPendingOperationInScalar()
		} )
	}
} )

const explorerTitle = computed( () => $i18n( 'explorer-title' ) )
const explorerDescription = computed( () => $i18n( 'explorer-description' ) )
const instanceLabel = computed( () => $i18n( 'explorer-instance-label' ) )
const moduleLabel = computed( () => $i18n( 'explorer-module-label' ) )
const moduleRailTitle = computed( () => $i18n( 'explorer-module-rail-title' ) )
const moduleRailDescription = computed( () => $i18n( 'explorer-module-rail-description' ) )
const modulePlaceholderLabel = computed( () => $i18n( 'explorer-module-placeholder' ) )
const instancePlaceholderLabel = computed( () => $i18n( 'explorer-instance-placeholder' ) )
const refreshButtonLabel = computed( () => $i18n( 'explorer-refresh-button' ) )
const emptyModulesLabel = computed( () => $i18n( 'explorer-empty-modules' ) )
const missingSpecLabel = computed( () => $i18n( 'explorer-spec-missing' ) )
const endpointsLabel = computed( () => $i18n( 'explorer-endpoints-label' ) )
const endpointsEmptyLabel = computed( () => $i18n( 'explorer-endpoints-empty' ) )
const selectedModuleBadgeLabel = computed( () => $i18n( 'explorer-selected-module-badge' ) )
const diagnosticsTitle = computed( () => $i18n( 'explorer-debug-title' ) )
const diagnosticsEmptyLabel = computed( () => $i18n( 'explorer-debug-empty' ) )
const explorerInterfaceLoadingLabel = computed( () => $i18n( 'explorer-loading-interface' ) )
const loadingInstanceLabel = computed( () => $i18n( 'explorer-loading-instance' ) )
const loadingInstanceDescriptionLabel = computed( () => $i18n( 'explorer-loading-instance-description' ) )
const bootstrapErrorLabel = computed( () => $i18n( 'explorer-bootstrap-error' ) )
const failedModulesLabel = computed( () => $i18n( 'explorer-failed-modules-label' ) )
const noSelectableModulesLabel = computed( () => $i18n( 'explorer-no-selectable-modules' ) )
const scalarSwitchingLabel = computed( () => $i18n( 'explorer-scalar-switching' ) )

/**
 * Loads Scalar after the explorer shell has rendered.
 *
 * This keeps the route chrome responsive on client-only navigation while the
 * heavy API reference bundle downloads.
 *
 * @returns Nothing.
 */
async function loadScalarApiReference(): Promise<void> {
	if ( scalarApiReferenceComponent.value || isScalarInterfaceLoading.value ) {
		return
	}

	isScalarInterfaceLoading.value = true

	try {
		const scalarModule = await import( '@scalar/api-reference' )
		scalarApiReferenceComponent.value = markRaw( scalarModule.ApiReference )
	} finally {
		isScalarInterfaceLoading.value = false
	}
}

onMounted( () => {
	requestAnimationFrame( () => {
		void loadScalarApiReference()
	} )
} )

watch( pendingOperationTarget, ( nextPendingOperationTarget ) => {
	if ( !nextPendingOperationTarget ) {
		return
	}

	if ( isScalarSwitching.value || isInstanceBootstrapping.value ) {
		return
	}

	requestAnimationFrame( () => {
		focusPendingOperationInScalar()
	} )
} )

function onRetryBootstrap(): void {
	void retryBootstrap()
}

function onModuleSelectChange( nextModuleName: string ): void {
	void selectModule( nextModuleName, {
		source: 'module-select'
	} )
}

function onModuleTitleClick( moduleName: string ): void {
	void selectModule( moduleName, {
		source: 'module-title'
	} )
}

function onModuleAccordionToggle( moduleName: string, isOpen: boolean ): void {
	if ( !isOpen ) {
		if ( expandedModuleName.value === moduleName ) {
			expandedModuleName.value = ''
		}
		return
	}

	void selectModule( moduleName, {
		source: 'module-accordion'
	} )
}

function onEndpointClick( moduleName: string, operation: ExplorerModuleOperation ): void {
	void selectModule( moduleName, {
		source: 'endpoint-item',
		operationTarget: {
			moduleName,
			method: operation.method,
			path: operation.path,
			summary: operation.summary,
			operationId: operation.operationId
		}
	} )

	requestAnimationFrame( () => {
		focusPendingOperationInScalar()
	} )
}

function isModuleExpanded( moduleName: string ): boolean {
	return expandedModuleName.value === moduleName
}

function getModuleDescription( moduleName: string ): string {
	const selectedBootstrapModule = modules.value.find( ( moduleItem ) => moduleItem.name === moduleName )

	if ( selectedBootstrapModule?.hasSpecError ) {
		return selectedBootstrapModule.specErrorMessage || failedModulesLabel.value
	}

	const operationCount = selectedBootstrapModule?.operations.length ?? 0
	if ( operationCount > 0 ) {
		return `${ operationCount } ${ endpointsLabel.value }`
	}

	return moduleRailDescription.value
}

/**
 * Attempts to focus a selected operation in Scalar once the module is loaded.
 *
 * Uses operationId when available and falls back to matching method+path text
 * in the Scalar content tree.
 *
 * @returns Nothing.
 */
function focusPendingOperationInScalar(): void {
	const operationTarget = pendingOperationTarget.value
	if ( !operationTarget ) {
		return
	}

	const scalarShellElement = scalarShellRef.value
	if ( !scalarShellElement ) {
		return
	}

	let matchedElement: HTMLElement | null = null

	if ( operationTarget.operationId ) {
		const escapedOperationId = operationTarget.operationId.replaceAll( '"', '\\"' )
		matchedElement = scalarShellElement.querySelector<HTMLElement>( `[id="${ escapedOperationId }"]` )
			?? scalarShellElement.querySelector<HTMLElement>( `[id*="${ escapedOperationId }"]` )
	}

	if ( !matchedElement ) {
		const allCandidates = Array.from( scalarShellElement.querySelectorAll<HTMLElement>( 'section, article, div, h2, h3, h4, a, button' ) )
		matchedElement = allCandidates.find( ( candidateElement ) => {
			const candidateText = candidateElement.textContent ?? ''
			return candidateText.includes( operationTarget.path ) && candidateText.includes( operationTarget.method )
		} ) ?? null
	}

	if ( !matchedElement ) {
		return
	}

	matchedElement.scrollIntoView( {
		behavior: 'smooth',
		block: 'center'
	} )

	clearPendingOperationTarget()
}
</script>

<template>
	<section class="explorer-page">
		<header class="explorer-page__header">
			<h1>{{ explorerTitle }}</h1>
			<p>{{ explorerDescription }}</p>
		</header>

		<section
			v-if="isInstanceBootstrapping"
			class="explorer-page__bootstrap-loading"
		>
			<div class="explorer-page__scalar-loading-indicator" aria-hidden="true"></div>
			<h2>{{ loadingInstanceLabel }}</h2>
			<p>{{ loadingInstanceDescriptionLabel }} <bdi>{{ wikiDisplayName }}</bdi></p>
		</section>

		<template v-else>
			<section class="explorer-page__controls-panel">
				<CdxField class="explorer-page__control-item">
					<template #label>
						{{ instanceLabel }}
					</template>
					<CdxSelect
						v-model:selected="selectedWikiInstanceId"
						:menu-items="wikiInstanceMenuItems"
						:default-label="instancePlaceholderLabel"
					/>
				</CdxField>

				<CdxField class="explorer-page__control-item explorer-page__module-select">
					<template #label>
						{{ moduleLabel }}
					</template>
					<template #help-text>
						{{ moduleRailDescription }}
					</template>
					<CdxSelect
						v-model:selected="selectedModuleName"
						:menu-items="moduleMenuItems"
						:default-label="modulePlaceholderLabel"
						:disabled="!moduleMenuItems.length"
						@update:selected="onModuleSelectChange"
					/>
				</CdxField>

				<div class="explorer-page__action-row">
					<CdxButton
						weight="primary"
						@click="onRetryBootstrap"
					>
						{{ refreshButtonLabel }}
					</CdxButton>
				</div>
			</section>

			<CdxMessage
				v-if="hasInstanceBootstrapError"
				type="error"
			>
				{{ bootstrapErrorLabel }} <bdi>{{ instanceBootstrapErrorMessage }}</bdi>
			</CdxMessage>

			<template v-else>
				<section
					v-if="selectedModule"
					class="explorer-page__module-summary"
				>
					<header class="explorer-page__module-summary-header">
						<p>{{ moduleRailTitle }}</p>
						<h2><bdi>{{ selectedModule.label }}</bdi></h2>
					</header>

					<p
						v-if="!selectedModule.operations.length"
						class="explorer-page__module-empty-state"
					>
						{{ endpointsEmptyLabel }}
					</p>

					<ol
						v-else
						class="explorer-page__endpoint-list"
					>
						<li
							v-for="moduleOperation in selectedModule.operations"
							:key="moduleOperation.id"
							class="explorer-page__endpoint-item"
						>
							<button
								type="button"
								class="explorer-page__endpoint-action"
								@click="onEndpointClick( selectedModule.name, moduleOperation )"
							>
								<span class="explorer-page__endpoint-method" :data-method="moduleOperation.method.toLowerCase()">
									{{ moduleOperation.method }}
								</span>
								<span class="explorer-page__endpoint-path" dir="ltr">
									<bdi>{{ moduleOperation.path }}</bdi>
								</span>
								<span class="explorer-page__endpoint-summary">
									<bdi>{{ moduleOperation.summary }}</bdi>
								</span>
							</button>
						</li>
					</ol>
				</section>

				<div class="explorer-page__workspace">
			<aside class="explorer-page__module-rail">
				<header class="explorer-page__module-rail-header">
					<h2><bdi>{{ wikiDisplayName }}</bdi></h2>
					<p>{{ moduleRailDescription }}</p>
				</header>

				<CdxMessage
					v-if="!availableModules.length"
					type="warning"
				>
					{{ noSelectableModulesLabel }}
				</CdxMessage>

				<div
					v-if="availableModules.length"
					class="explorer-page__module-accordion-list"
				>
					<CdxAccordion
						v-for="moduleOption in availableModules"
						:key="moduleOption.name"
						class="explorer-page__module-accordion"
						:model-value="isModuleExpanded( moduleOption.name )"
						heading-level="h3"
						@toggle="onModuleAccordionToggle( moduleOption.name, $event )"
					>
						<template #title>
							<span class="explorer-page__module-title-row">
								<button
									type="button"
									class="explorer-page__module-title-button"
									@click.stop="onModuleTitleClick( moduleOption.name )"
								>
									<bdi>{{ moduleOption.label }}</bdi>
								</button>
								<span
									v-if="selectedModuleName === moduleOption.name"
									class="explorer-page__module-badge"
								>
									{{ selectedModuleBadgeLabel }}
								</span>
							</span>
						</template>

						<template #description>
							{{ getModuleDescription( moduleOption.name ) }}
						</template>

						<div class="explorer-page__module-content">
							<p
								v-if="!moduleOption.operations.length"
								class="explorer-page__module-empty-state"
							>
								{{ endpointsEmptyLabel }}
							</p>

							<!-- API paths stay LTR so slash-delimited routes remain legible in RTL shells. -->
							<ol
								v-else
								class="explorer-page__endpoint-list"
							>
								<li
									v-for="moduleOperation in moduleOption.operations"
									:key="moduleOperation.id"
									class="explorer-page__endpoint-item"
								>
									<button
										type="button"
										class="explorer-page__endpoint-action"
										@click="onEndpointClick( moduleOption.name, moduleOperation )"
									>
										<span class="explorer-page__endpoint-method" :data-method="moduleOperation.method.toLowerCase()">
											{{ moduleOperation.method }}
										</span>
										<span class="explorer-page__endpoint-path" dir="ltr">
											<bdi>{{ moduleOperation.path }}</bdi>
										</span>
										<span class="explorer-page__endpoint-summary">
											<bdi>{{ moduleOperation.summary }}</bdi>
										</span>
									</button>
								</li>
							</ol>
						</div>
					</CdxAccordion>
				</div>

				<CdxMessage
					v-if="failedModules.length"
					type="warning"
				>
					{{ failedModulesLabel }}:
					<bdi>{{ failedModules.map( ( moduleItem ) => moduleItem.label ).join( ', ' ) }}</bdi>
				</CdxMessage>
			</aside>

			<section class="explorer-page__reference-panel">
				<header
					v-if="selectedModule"
					class="explorer-page__reference-header"
				>
					<p>{{ moduleLabel }}</p>
					<h2><bdi>{{ selectedModule.label }}</bdi></h2>
				</header>

				<CdxMessage
					v-if="!openApiSpecUrl"
					type="warning"
				>
					{{ missingSpecLabel }}
				</CdxMessage>

				<ClientOnly v-else>
					<div
						ref="scalarShellRef"
						class="explorer-page__scalar-shell"
					>
						<div
							v-if="isScalarSwitching"
							class="explorer-page__scalar-switching-mask"
						>
							<div class="explorer-page__scalar-loading-indicator" aria-hidden="true"></div>
							<p>{{ scalarSwitchingLabel }}</p>
						</div>
						<component
							:is="scalarApiReferenceComponent"
							v-if="scalarApiReferenceComponent"
							:configuration="scalarConfiguration"
						/>
						<div
							v-else
							class="explorer-page__scalar-loading"
						>
							<div class="explorer-page__scalar-loading-indicator" aria-hidden="true"></div>
							<p>{{ explorerInterfaceLoadingLabel }}</p>
						</div>
					</div>
				</ClientOnly>
			</section>
				</div>
			</template>
		</template>

		<aside class="explorer-page__diagnostics">
			<h2>{{ diagnosticsTitle }}</h2>
			<p v-if="!diagnosticsEntries.length">
				{{ diagnosticsEmptyLabel }}
			</p>
			<ol v-else>
				<li v-for="diagnosticsEntry in diagnosticsEntries" :key="`${diagnosticsEntry.timestamp}-${diagnosticsEntry.event}`">
					<strong>{{ diagnosticsEntry.event }}</strong>
					<pre>{{ JSON.stringify( diagnosticsEntry.details, null, 2 ) }}</pre>
				</li>
			</ol>
		</aside>
	</section>
</template>

<style scoped>
.explorer-page {
	display: grid;
	gap: var( --spacing-150 );
}

.explorer-page__header p {
	max-inline-size: 60ch;
}

.explorer-page__controls-panel {
	display: grid;
	gap: var( --spacing-100 );
	padding: var( --spacing-150 );
	border: 1px solid var( --border-color-subtle );
	border-radius: var( --border-radius-base );
	background: linear-gradient( 180deg, var( --background-color-base ) 0%, var( --background-color-neutral-subtle ) 100% );
	align-items: start;
}

.explorer-page__control-item {
	position: relative;
	z-index: 20;
}

.explorer-page__action-row {
	display: flex;
	justify-content: flex-start;
	align-items: end;
}

.explorer-page__workspace {
	display: grid;
	gap: var( --spacing-150 );
	align-items: start;
}

.explorer-page__bootstrap-loading {
	position: fixed;
	inset: 0;
	z-index: 30;
	display: grid;
	align-content: center;
	justify-items: center;
	gap: var( --spacing-100 );
	padding-inline: var( --spacing-150 );
	padding-block: var( --spacing-250 );
	min-block-size: 100vh;
	background:
		radial-gradient( circle at top, color-mix( in srgb, var( --background-color-progressive-subtle ) 65%, transparent ) 0%, transparent 55% ),
		linear-gradient( 180deg, var( --background-color-base ) 0%, var( --background-color-neutral-subtle ) 100% );
	text-align: center;
}

.explorer-page__bootstrap-loading h2,
.explorer-page__bootstrap-loading p {
	margin: 0;
}

.explorer-page__module-summary {
	display: grid;
	gap: var( --spacing-100 );
	padding: var( --spacing-150 );
	border: 1px solid var( --border-color-subtle );
	border-radius: var( --border-radius-base );
	background: linear-gradient( 180deg, var( --background-color-base ) 0%, var( --background-color-neutral-subtle ) 100% );
}

.explorer-page__module-summary-header h2 {
	margin: 0;
}

.explorer-page__module-summary-header p {
	margin: 0;
	color: var( --color-subtle );
}

.explorer-page__module-select {
	display: grid;
}

.explorer-page__module-rail {
	display: none;
	gap: var( --spacing-125 );
	padding: var( --spacing-150 );
	border: 1px solid var( --border-color-subtle );
	border-radius: var( --border-radius-base );
	background:
		linear-gradient( 180deg, var( --background-color-base ) 0%, color-mix( in srgb, var( --background-color-progressive-subtle ) 28%, var( --background-color-base ) ) 100% );
	}

.explorer-page__module-rail-header h2,
.explorer-page__reference-header h2 {
	margin: 0;
}

.explorer-page__module-rail-header p,
.explorer-page__reference-header p,
.explorer-page__module-empty-state,
.explorer-page__endpoint-summary {
	margin: 0;
	color: var( --color-subtle );
}

.explorer-page__module-accordion-list {
	display: grid;
	gap: var( --spacing-75 );
}

.explorer-page__module-title-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-50 );
	font-weight: var( --font-weight-bold );
}

.explorer-page__module-title-button {
	all: unset;
	cursor: pointer;
	border-bottom: 1px dotted transparent;
}

.explorer-page__module-title-button:hover {
	border-bottom-color: var( --border-color-interactive );
}

.explorer-page__module-badge {
	padding-block: calc( var( --spacing-25 ) / 2 );
	padding-inline: var( --spacing-50 );
	border-radius: 999px;
	background-color: var( --background-color-progressive-subtle );
	color: var( --color-progressive );
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-bold );
	text-transform: uppercase;
	letter-spacing: 0.03em;
}

.explorer-page__module-content {
	display: grid;
	gap: var( --spacing-75 );
}

.explorer-page__endpoint-list {
	margin: 0;
	padding: 0;
	list-style: none;
	display: grid;
	gap: var( --spacing-75 );
}

.explorer-page__endpoint-item {
	margin: 0;
}

.explorer-page__endpoint-action {
	inline-size: 100%;
	display: grid;
	text-align: start;
	gap: var( --spacing-50 );
	background: transparent;
	border: none;
	padding: 0;
	cursor: pointer;
}

.explorer-page__endpoint-card,
.explorer-page__endpoint-action {
	display: grid;
	gap: var( --spacing-50 );
	padding: var( --spacing-100 );
	border: 1px solid var( --border-color-subtle );
	border-radius: var( --border-radius-base );
	background-color: color-mix( in srgb, var( --background-color-base ) 86%, var( --background-color-neutral-subtle ) );
}

.explorer-page__endpoint-action:hover {
	border-color: var( --border-color-interactive );
}

.explorer-page__endpoint-heading {
	display: grid;
	gap: var( --spacing-50 );
}

.explorer-page__endpoint-method {
	justify-self: start;
	padding-block: calc( var( --spacing-25 ) / 2 );
	padding-inline: var( --spacing-50 );
	border-radius: 999px;
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-bold );
	letter-spacing: 0.04em;
	text-transform: uppercase;
	background-color: var( --background-color-neutral-subtle );
	color: var( --color-base );
}

.explorer-page__endpoint-method[data-method='get'] {
	background-color: color-mix( in srgb, var( --background-color-progressive-subtle ) 72%, white );
	color: var( --color-progressive );
}

.explorer-page__endpoint-method[data-method='post'] {
	background-color: color-mix( in srgb, var( --background-color-success-subtle ) 72%, white );
	color: var( --color-success );
}

.explorer-page__endpoint-method[data-method='delete'] {
	background-color: color-mix( in srgb, var( --background-color-destructive-subtle ) 72%, white );
	color: var( --color-destructive );
}

.explorer-page__endpoint-method[data-method='put'],
.explorer-page__endpoint-method[data-method='patch'] {
	background-color: color-mix( in srgb, var( --background-color-warning-subtle ) 72%, white );
	color: var( --color-warning );
}

.explorer-page__endpoint-path {
	font-family: monospace;
	font-size: var( --font-size-small );
	word-break: break-word;
	color: var( --color-emphasized );
}

.explorer-page__reference-panel {
	display: grid;
	gap: var( --spacing-100 );
	min-inline-size: 0;
}

.explorer-page__reference-header {
	display: grid;
	gap: var( --spacing-25 );
	padding-block: var( --spacing-50 );
	padding-inline: 0;
}

.explorer-page__scalar-shell {
	min-inline-size: 0;
	min-block-size: 24rem;
	border: 1px solid var( --border-color-subtle );
	border-radius: var( --border-radius-base );
	overflow: hidden;
	background-color: var( --background-color-base );
}

.explorer-page__scalar-loading {
	display: grid;
	place-items: center;
	gap: var( --spacing-100 );
	min-block-size: 24rem;
	padding: var( --spacing-200 );
	background:
		radial-gradient( circle at top, color-mix( in srgb, var( --background-color-progressive-subtle ) 65%, transparent ) 0%, transparent 55% ),
		linear-gradient( 180deg, var( --background-color-base ) 0%, var( --background-color-neutral-subtle ) 100% );
	text-align: center;
}

.explorer-page__scalar-loading p {
	margin: 0;
	color: var( --color-subtle );
}

.explorer-page__scalar-loading-indicator {
	inline-size: 2.5rem;
	block-size: 2.5rem;
	border: 3px solid var( --border-color-subtle );
	border-top-color: var( --color-progressive );
	border-radius: 50%;
	animation: explorer-loading-spin 0.9s linear infinite;
}

.explorer-page__scalar-switching-mask {
	display: none;
}

.explorer-page :deep( .scalar-app ),
.explorer-page :deep( .scalar-app-root ) {
	position: relative;
	z-index: 0;
}

.explorer-page__diagnostics {
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-100 );
	border: 1px solid var( --border-color-subtle );
	border-radius: var( --border-radius-base );
	background-color: var( --background-color-base );
}

.explorer-page__diagnostics ol {
	margin: 0;
	padding-inline-start: var( --spacing-200 );
	display: grid;
	gap: var( --spacing-75 );
}

.explorer-page__diagnostics pre {
	margin: 0;
	padding-block: var( --spacing-50 );
	padding-inline: var( --spacing-75 );
	background-color: var( --background-color-neutral-subtle );
	inline-size: 100%;
	overflow: auto;
}

@media screen and ( min-width: 960px ) {
	.explorer-page__controls-panel {
		grid-template-columns: minmax( 18rem, 24rem ) auto;
	}

	.explorer-page__module-summary {
		display: none;
	}

	.explorer-page__workspace {
		grid-template-columns: minmax( 20rem, 26rem ) minmax( 0, 1fr );
		align-items: stretch;
	}

	.explorer-page__module-select {
		display: none;
	}

	.explorer-page__module-rail {
		display: grid;
		position: sticky;
		inset-block-start: var( --spacing-150 );
		block-size: calc( 100vh - ( var( --spacing-150 ) * 2 ) );
		overflow: auto;
		overscroll-behavior: contain;
	}

	.explorer-page__reference-panel {
		position: sticky;
		inset-block-start: var( --spacing-150 );
		block-size: calc( 100vh - ( var( --spacing-150 ) * 2 ) );
		grid-template-rows: auto minmax( 0, 1fr );
		overflow: hidden;
	}

	.explorer-page__scalar-shell {
		block-size: 100%;
		min-block-size: 0;
		overflow: auto;
		overscroll-behavior: contain;
	}

	.explorer-page__endpoint-heading {
		grid-template-columns: auto minmax( 0, 1fr );
		align-items: start;
	}

	.explorer-page__scalar-switching-mask {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		gap: var( --spacing-100 );
		background-color: color-mix( in srgb, var( --background-color-base ) 78%, transparent );
		backdrop-filter: blur( 2px );
		z-index: 2;
	}

	.explorer-page__scalar-switching-mask p {
		margin: 0;
		color: var( --color-subtle );
	}
}

@keyframes explorer-loading-spin {
	from {
		transform: rotate( 0deg );
	}

	to {
		transform: rotate( 360deg );
	}
}
</style>
