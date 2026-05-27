<script setup lang="ts">
import { CdxButton, CdxField, CdxMessage, CdxSelect } from '@wikimedia/codex'
import { computed, markRaw, onMounted, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import { WIKI_INSTANCES } from '../../../config/instances'
import { useDirection } from '../../composables/useDirection'
import { useSpecUrl } from '../../composables/useSpecUrl'
import { useScalarConfig } from '../../composables/useScalarConfig'
import { useExplorerDiagnostics } from '../../composables/useExplorerDiagnostics'

interface PickerMenuItem {
	label: string
	value: string
}

const { $i18n } = useNuxtApp()
const { selectedWikiInstanceId } = useDirection()
const selectedModuleName = ref( '' )
const { entries: diagnosticsEntries, logEvent } = useExplorerDiagnostics()

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

const {
	openApiSpecUrl,
	moduleOptions,
	isLoading,
	hasError,
	errorMessage,
	refetchDiscovery
} = useSpecUrl( selectedWikiInstanceId, selectedModuleName )

const moduleMenuItems = computed<PickerMenuItem[]>( () => {
	return moduleOptions.value.map( ( moduleOption ) => ( {
		value: moduleOption.value,
		label: isolateLabel( moduleOption.label )
	} ) )
} )

watch( moduleMenuItems, ( nextModuleMenuItems ) => {
	if ( !nextModuleMenuItems.length ) {
		selectedModuleName.value = ''
		return
	}

	const hasSelectedModule = nextModuleMenuItems.some( ( moduleMenuItem ) => moduleMenuItem.value === selectedModuleName.value )
	if ( !hasSelectedModule ) {
		selectedModuleName.value = nextModuleMenuItems[ 0 ].value
	}
}, { immediate: true } )

const { scalarConfiguration } = useScalarConfig( openApiSpecUrl )

watch( selectedWikiInstanceId, ( nextSelectedWikiInstanceId ) => {
	logEvent( 'ui.instance_changed', {
		selectedWikiInstanceId: nextSelectedWikiInstanceId
	} )
} )

watch( selectedModuleName, ( nextSelectedModuleName ) => {
	logEvent( 'ui.module_changed', {
		selectedModuleName: nextSelectedModuleName
	} )
} )

const explorerTitle = computed( () => $i18n( 'explorer-title' ) )
const explorerDescription = computed( () => $i18n( 'explorer-description' ) )
const instanceLabel = computed( () => $i18n( 'explorer-instance-label' ) )
const moduleLabel = computed( () => $i18n( 'explorer-module-label' ) )
const loadingModulesLabel = computed( () => $i18n( 'explorer-loading-modules' ) )
const modulePlaceholderLabel = computed( () => $i18n( 'explorer-module-placeholder' ) )
const instancePlaceholderLabel = computed( () => $i18n( 'explorer-instance-placeholder' ) )
const refreshButtonLabel = computed( () => $i18n( 'explorer-refresh-button' ) )
const emptyModulesLabel = computed( () => $i18n( 'explorer-empty-modules' ) )
const discoveryErrorLabel = computed( () => $i18n( 'explorer-discovery-error' ) )
const missingSpecLabel = computed( () => $i18n( 'explorer-spec-missing' ) )
const diagnosticsTitle = computed( () => $i18n( 'explorer-debug-title' ) )
const diagnosticsEmptyLabel = computed( () => $i18n( 'explorer-debug-empty' ) )
const explorerInterfaceLoadingLabel = computed( () => $i18n( 'explorer-loading-interface' ) )
const hasModules = computed( () => moduleMenuItems.value.length > 0 )
const scalarApiReferenceComponent = shallowRef<Component | null>( null )
const isScalarInterfaceLoading = ref( false )

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

function onRetryDiscovery(): void {
	void refetchDiscovery()
}
</script>

<template>
	<section class="explorer-page">
		<header class="explorer-page__header">
			<h1>{{ explorerTitle }}</h1>
			<p>{{ explorerDescription }}</p>
		</header>

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

			<CdxField class="explorer-page__control-item">
				<template #label>
					{{ moduleLabel }}
				</template>
				<template #help-text>
					{{ isLoading ? loadingModulesLabel : ( hasModules ? explorerDescription : emptyModulesLabel ) }}
				</template>
				<CdxSelect
					v-model:selected="selectedModuleName"
					:menu-items="moduleMenuItems"
					:default-label="modulePlaceholderLabel"
					:disabled="isLoading || !hasModules"
				/>
			</CdxField>

			<div
				v-if="hasError"
				class="explorer-page__action-row"
			>
				<CdxButton weight="primary" @click="onRetryDiscovery">
					{{ refreshButtonLabel }}
				</CdxButton>
			</div>
		</section>

		<section class="explorer-page__reference-panel">
				<CdxMessage
					v-if="isLoading"
					type="notice"
				>
					{{ loadingModulesLabel }}
				</CdxMessage>

				<CdxMessage
					v-else-if="hasError"
					type="error"
				>
					{{ discoveryErrorLabel }} <bdi>{{ errorMessage }}</bdi>
				</CdxMessage>

				<CdxMessage
					v-else-if="!hasModules"
					type="warning"
				>
					{{ emptyModulesLabel }}
				</CdxMessage>

				<CdxMessage
					v-else-if="!openApiSpecUrl"
					type="warning"
				>
					{{ missingSpecLabel }}
				</CdxMessage>

				<ClientOnly v-else-if="openApiSpecUrl">
					<div class="explorer-page__scalar-shell">
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

.explorer-page__reference-panel {
	display: grid;
	gap: var( --spacing-100 );
	min-inline-size: 0;
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
		grid-template-columns: minmax( 16rem, 22rem ) minmax( 16rem, 22rem ) auto;
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
