<script setup lang="ts">
import { CdxMessage } from '@wikimedia/codex'
import { computed, markRaw, nextTick, onMounted, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import { WIKI_INSTANCES } from '../../../config/instances'
import type { ExplorerModuleOperation } from '../../composables/useExplorerBootstrap'
import { useDirection } from '../../composables/useDirection'
import { useExplorerBootstrap } from '../../composables/useExplorerBootstrap'
import { useExplorerRailStickyAlign } from '../../composables/useExplorerRailStickyAlign'
import { useScalarConfig } from '../../composables/useScalarConfig'

interface PickerMenuItem {
	label: string
	value: string
}

const { $i18n } = useNuxtApp()
const { selectedWikiInstanceId } = useDirection()
const {
	modules,
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
	clearPendingOperationTarget
} = useExplorerBootstrap( selectedWikiInstanceId )

const scalarApiReferenceComponent = shallowRef<Component>()
const isScalarInterfaceLoading = ref( false )
const explorerPageTitleRef = ref<HTMLElement | null>( null )
const scalarShellRef = ref<HTMLElement | null>( null )

const { railStickyStyle, refreshRailStickyAlign } = useExplorerRailStickyAlign(
	explorerPageTitleRef,
	scalarShellRef
)

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
const moduleLabel = computed( () => $i18n( 'explorer-module-label' ) )
const instancePlaceholderLabel = computed( () => $i18n( 'explorer-instance-placeholder' ) )
const missingSpecLabel = computed( () => $i18n( 'explorer-spec-missing' ) )
const explorerInterfaceLoadingLabel = computed( () => $i18n( 'explorer-loading-interface' ) )
const loadingInstanceLabel = computed( () => $i18n( 'explorer-loading-instance' ) )
const loadingInstanceDescriptionLabel = computed( () => $i18n( 'explorer-loading-instance-description' ) )
const bootstrapErrorLabel = computed( () => $i18n( 'explorer-bootstrap-error' ) )
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

watch( [ isInstanceBootstrapping, selectedModuleName, openApiSpecUrl ], () => {
	nextTick( () => {
		refreshRailStickyAlign()
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

function onModuleExpandToggle( moduleName: string, isOpen: boolean ): void {
	if ( !isOpen ) {
		if ( expandedModuleName.value === moduleName ) {
			expandedModuleName.value = ''
		}
		return
	}

	expandedModuleName.value = moduleName
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
			<h1 ref="explorerPageTitleRef">
				{{ explorerTitle }}
			</h1>
			<p>{{ explorerDescription }}</p>
		</header>

		<ClientOnly>
			<Teleport to="#explorer-end-panel">
				<ExplorerModuleRail
					v-model:selected-wiki-instance-id="selectedWikiInstanceId"
					:style="railStickyStyle"
					:modules="modules"
					:selected-module-name="selectedModuleName"
					:expanded-module-name="expandedModuleName"
					:wiki-instance-menu-items="wikiInstanceMenuItems"
					:instance-placeholder-label="instancePlaceholderLabel"
					:is-instance-bootstrapping="isInstanceBootstrapping"
					@module-expand-toggle="onModuleExpandToggle"
					@endpoint-click="onEndpointClick"
				/>
			</Teleport>
		</ClientOnly>

		<section
			v-if="isInstanceBootstrapping"
			class="explorer-page__bootstrap-loading"
		>
			<div class="explorer-page__scalar-loading-indicator" aria-hidden="true"></div>
			<h2>{{ loadingInstanceLabel }}</h2>
			<p>{{ loadingInstanceDescriptionLabel }} <bdi>{{ wikiDisplayName }}</bdi></p>
		</section>

		<template v-else>
			<CdxMessage
				v-if="hasInstanceBootstrapError"
				type="error"
			>
				{{ bootstrapErrorLabel }} <bdi>{{ instanceBootstrapErrorMessage }}</bdi>
			</CdxMessage>

			<template v-else>
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
			</template>
		</template>
	</section>
</template>

<style scoped>
.explorer-page {
	display: grid;
	gap: var( --spacing-150 );
	min-inline-size: 0;
	max-inline-size: 100%;
}

.explorer-page__header p {
	max-inline-size: 60ch;
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

.explorer-page__reference-header h2 {
	margin: 0;
}

.explorer-page__reference-header p {
	margin: 0;
	color: var( --color-subtle );
}

.explorer-page__reference-panel {
	display: grid;
	gap: var( --spacing-100 );
	min-inline-size: 0;
	max-inline-size: 100%;
	overflow: hidden;
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

@media screen and ( min-width: 960px ) {
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
