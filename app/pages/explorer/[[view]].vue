<script setup lang="ts">
import { CdxInfoChip, CdxMessage } from '@wikimedia/codex'
import { computed, nextTick, watch } from 'vue'
import type { ExplorerModuleOperation } from '../../composables/useExplorerBootstrap'
import { useDirection } from '../../composables/useDirection'
import { useExplorerBootstrap } from '../../composables/useExplorerBootstrap'
import { useEndPanelNavAlign } from '../../composables/useEndPanelNavAlign'
import { useExplorerScalarFocus, type ScalarInterfaceHandle } from '../../composables/useExplorerScalarFocus'
import { useScalarClientWriteEndpointWarnings } from '../../composables/useScalarClientWriteEndpointWarnings'
import { useScalarWriteRequestAddressBarSync } from '../../composables/useScalarWriteRequestAddressBarSync'
import { useScalarWriteRequestTestWiki } from '../../composables/useScalarWriteRequestTestWiki'
import { setActiveExplorerWikiInstanceId } from '../../utils/explorerWikiInstanceContext'
import ExplorerScalarReference from '../../components/explorer/ExplorerScalarReference.client.vue'
import ExplorerEnterpriseCustom from '../../components/explorer/ExplorerEnterpriseCustom.vue'
import { useScalarConfig } from '../../composables/useScalarConfig'
import { useExplorerMode } from '../../composables/useExplorerMode'
import { useEnterpriseExplorer } from '../../composables/useEnterpriseExplorer'
import { isExplorerRoutePath } from '../../utils/explorerRoute'
import { SCALAR_DEFAULT_CONFIGURATION } from '../../../config/scalar'

definePageMeta( {
	i18n: false,
	keepalive: false
} )

const route = useRoute()
const { $bananaI18n } = useNuxtApp()

/** Whether this page is still the active route (disables teleports on exit). */
const isActiveExplorerRoute = computed( () => isExplorerRoutePath( route.path ) )
const { selectedWikiInstanceId } = useDirection()
const { explorerMode } = useExplorerMode()
const isCommunityMode = computed( () => explorerMode.value === 'community' )
const isCustomEnterpriseMode = computed( () => explorerMode.value === 'enterprise-custom' )
/** True for Scalar-bearing Enterprise modes (full / limited), false for community and custom. */
const isScalarEnterpriseMode = computed(
	() => explorerMode.value === 'enterprise-full' || explorerMode.value === 'enterprise-limited'
)

const enterpriseMode = computed( () =>
	isScalarEnterpriseMode.value
		? explorerMode.value as 'enterprise-full' | 'enterprise-limited'
		: 'enterprise-full' as const
)
const { specUrl: enterpriseSpecUrl, scalarOverrides: enterpriseScalarOverrides } =
	useEnterpriseExplorer( enterpriseMode )
const {
	modules,
	failedModules,
	hasSelectableModules,
	wikiDisplayName,
	selectedModuleName,
	expandedModuleNames,
	setModuleExpanded,
	selectedModule,
	openApiSpecUrl,
	pendingOperationTarget,
	isInstanceBootstrapping,
	isExplorerModuleRailVisible,
	hasInstanceBootstrapError,
	instanceBootstrapErrorMessage,
	isScalarSwitching,
	selectModule,
	markScalarReady,
	clearPendingOperationTarget
} = useExplorerBootstrap( selectedWikiInstanceId, isCommunityMode )

const scalarInterface = ref<ScalarInterfaceHandle | null>( null )

useScalarClientWriteEndpointWarnings( scalarInterface, selectedWikiInstanceId )

watch( selectedWikiInstanceId, ( wikiInstanceId ) => {
	setActiveExplorerWikiInstanceId( wikiInstanceId )
}, { immediate: true } )

const referenceHeaderRef = ref<HTMLElement | null>( null )
const referenceModuleLabelRef = ref<HTMLElement | null>( null )
const projectControlsRef = ref<HTMLElement | null>( null )
const scalarShellRef = ref<HTMLElement | null>( null )
const includeBetaEndpoints = ref( false )
const includeInternalEndpoints = ref( false )

const explorerEndPanelElement = ref<HTMLElement | null>( null )

const { focusPendingOperationInScalar } = useExplorerScalarFocus(
	pendingOperationTarget,
	scalarInterface,
	scalarShellRef,
	isScalarSwitching,
	isInstanceBootstrapping,
	clearPendingOperationTarget
)

/**
 * Stores Scalar navigation handles once the ApiReference component is ready.
 *
 * @param nextScalarInterface - Event bus and workspace store from Scalar.
 * @returns Nothing.
 */
function onScalarInterfaceReady( nextScalarInterface: ScalarInterfaceHandle ): void {
	scalarInterface.value = nextScalarInterface

	if ( pendingOperationTarget.value && !isScalarSwitching.value && !isInstanceBootstrapping.value ) {
		requestAnimationFrame( () => {
			focusPendingOperationInScalar()
		} )
	}
}

const { endPanelNavStyle, refreshEndPanelNavAlign } = useEndPanelNavAlign(
	projectControlsRef,
	explorerEndPanelElement,
	scalarShellRef
)

onMounted( () => {
	explorerEndPanelElement.value = document.getElementById( 'explorer-end-panel' )
	refreshEndPanelNavAlign()
} )

/** Whether Scalar has finished loading its spec for the current mode. */
const isScalarReady = ref( false )

/**
 * Shared onLoaded handler. Marks Scalar ready for the loading overlay,
 * lets the community switch state settle, and resumes any pending focus.
 *
 * @returns Nothing.
 */
function onScalarLoaded(): void {
	isScalarReady.value = true
	markScalarReady()
	requestAnimationFrame( () => {
		focusPendingOperationInScalar()
	} )
}

// Per-mode Scalar configurations — keeping them separate avoids mutating a
// shared reactive object across modes, which previously produced a
// "Document not found in configList" warning from Scalar during transitions.
const { scalarConfiguration: communityScalarConfiguration } = useScalarConfig(
	openApiSpecUrl,
	{ onLoaded: onScalarLoaded }
)

const enterpriseScalarConfiguration = computed( () => ( {
	...SCALAR_DEFAULT_CONFIGURATION,
	...enterpriseScalarOverrides.value,
	spec: { url: enterpriseSpecUrl.value },
	onLoaded: onScalarLoaded
} ) )

const activeScalarConfiguration = computed<Record<string, unknown>>( () =>
	isCommunityMode.value
		? communityScalarConfiguration as unknown as Record<string, unknown>
		: enterpriseScalarConfiguration.value
)

useScalarWriteRequestTestWiki( scalarConfiguration )
useScalarWriteRequestAddressBarSync( scalarInterface, selectedWikiInstanceId )

/**
 * Forces ApiReference remount when the spec context changes.
 *
 * Object.assign on the Scalar config handles in-place URL updates, but a full remount
 * is still required when crossing the explorer route boundary or recovering from a
 * stuck client-only mount (documented in ARCHITECTURE.md → API explorer).
 */
const scalarReferenceKey = computed( () => {
	return [
		route.fullPath,
		selectedWikiInstanceId.value,
		selectedModuleName.value,
		explorerMode.value,
		openApiSpecUrl.value ?? ''
	].join( ':' )
} )

// Re-arm the loading overlay whenever the Scalar instance is about to remount
// (mode change, module switch, or wiki instance change). onScalarLoaded clears it.
watch( scalarReferenceKey, () => {
	isScalarReady.value = false
} )

// Title matches the side-nav label for the active mode (same wording,
// already translated in every locale).
const explorerTitle = computed( () => {
	switch ( explorerMode.value ) {
		case 'enterprise-full':
			return $bananaI18n( 'explorer-side-nav-enterprise-apis' )
		case 'enterprise-limited':
			return $bananaI18n( 'explorer-side-nav-enterprise-apis-limited' )
		case 'enterprise-custom':
			return $bananaI18n( 'explorer-side-nav-enterprise-apis-custom' )
		case 'community':
		default:
			return $bananaI18n( 'explorer-side-nav-wikimedia-api-modules' )
	}
} )

const explorerDescription = computed( () =>
	isCommunityMode.value ? $bananaI18n( 'explorer-description' ) : ''
)
const moduleLabel = computed( () => $bananaI18n( 'explorer-module-label' ) )
const missingSpecLabel = computed( () => $bananaI18n( 'explorer-spec-missing' ) )
const explorerInterfaceLoadingLabel = computed( () => $bananaI18n( 'explorer-loading-interface' ) )
const loadingInstanceLabel = computed( () => $bananaI18n( 'explorer-loading-instance' ) )
const loadingInstanceDescriptionLabel = computed( () => $bananaI18n( 'explorer-loading-instance-description' ) )
const bootstrapErrorLabel = computed( () => $bananaI18n( 'explorer-bootstrap-error' ) )
const scalarSwitchingLabel = computed( () => $bananaI18n( 'explorer-scalar-switching' ) )

watch( [ isExplorerModuleRailVisible, selectedModuleName, openApiSpecUrl, wikiDisplayName ], () => {
	nextTick( () => {
		refreshEndPanelNavAlign()
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
	setModuleExpanded( moduleName, isOpen )
}

function onEndpointClick( moduleName: string, operation: ExplorerModuleOperation ): void {
	void selectModule( moduleName, {
		source: 'endpoint-item',
		operationTarget: {
			moduleName,
			method: operation.method,
			path: operation.path,
			summary: operation.summary,
			operationId: operation.operationId,
			primaryTag: operation.primaryTag
		}
	} )
}
</script>

<template>
	<section class="explorer-page">
		<div class="explorer-page__intro">
			<header class="explorer-page__header">
				<h1>
					{{ explorerTitle }}
				</h1>
				<p v-if="explorerDescription">{{ explorerDescription }}</p>
			</header>

			<div
				v-if="!isInstanceBootstrapping && isCommunityMode"
				ref="projectControlsRef"
				class="explorer-page__project-controls-anchor frontdoor-page-nav-align-anchor"
			>
				<ExplorerProjectControls
					v-model:selected-wiki-instance-id="selectedWikiInstanceId"
					v-model:include-beta-endpoints="includeBetaEndpoints"
					v-model:include-internal-endpoints="includeInternalEndpoints"
					:is-instance-bootstrapping="isInstanceBootstrapping"
				/>
			</div>
		</div>

		<ClientOnly v-if="isCommunityMode">
			<Teleport
				to="#explorer-end-panel"
				:disabled="!isActiveExplorerRoute"
			>
				<ExplorerModuleRail
					v-if="isExplorerModuleRailVisible"
					:style="endPanelNavStyle"
					:modules="modules"
					:failed-modules="failedModules"
					:has-selectable-modules="hasSelectableModules"
					:selected-module-name="selectedModuleName"
					:expanded-module-names="expandedModuleNames"
					:wiki-display-name="wikiDisplayName"
					:is-instance-bootstrapping="isInstanceBootstrapping"
					@module-expand-toggle="onModuleExpandToggle"
					@endpoint-click="onEndpointClick"
				/>
			</Teleport>
		</ClientOnly>

		<section
			v-if="isCommunityMode && isInstanceBootstrapping"
			class="explorer-page__bootstrap-loading"
		>
			<div class="explorer-page__scalar-loading-indicator" aria-hidden="true"></div>
			<h2>{{ loadingInstanceLabel }}</h2>
			<p>{{ loadingInstanceDescriptionLabel }} <bdi>{{ wikiDisplayName }}</bdi></p>
		</section>

		<template v-else>
			<CdxMessage
				v-if="isCommunityMode && hasInstanceBootstrapError"
				type="error"
			>
				{{ bootstrapErrorLabel }} <bdi>{{ instanceBootstrapErrorMessage }}</bdi>
			</CdxMessage>

			<template v-else>
				<section class="explorer-page__reference-panel">
					<header
						v-if="isCommunityMode && selectedModule"
						ref="referenceHeaderRef"
						class="explorer-page__reference-header"
					>
						<p ref="referenceModuleLabelRef">
							{{ moduleLabel }}
						</p>
						<div class="explorer-page__reference-heading">
							<h2 class="explorer-page__reference-title">
								<bdi>{{ selectedModule.label }}</bdi>
							</h2>
							<CdxInfoChip
								v-if="wikiDisplayName"
								status="subtle"
								class="explorer-page__wiki-info-chip"
							>
								<bdi>{{ wikiDisplayName }}</bdi>
							</CdxInfoChip>
						</div>
					</header>

					<CdxMessage
						v-if="isCommunityMode && !openApiSpecUrl"
						type="warning"
					>
						{{ missingSpecLabel }}
					</CdxMessage>

					<ClientOnly v-else-if="isCustomEnterpriseMode">
						<ExplorerEnterpriseCustom />
						<template #fallback>
							<div class="explorer-page__scalar-shell explorer-page__scalar-shell--loading">
								<div class="explorer-page__scalar-loading">
									<div class="explorer-page__scalar-loading-indicator" aria-hidden="true"></div>
									<p>{{ explorerInterfaceLoadingLabel }}</p>
								</div>
							</div>
						</template>
					</ClientOnly>

					<ClientOnly v-else>
						<div
							ref="scalarShellRef"
							class="explorer-page__scalar-shell"
						>
							<div
								v-if="!isScalarReady || isScalarSwitching"
								class="explorer-page__scalar-loading-overlay"
							>
								<div class="explorer-page__scalar-loading-indicator" aria-hidden="true"></div>
								<p>{{ isScalarSwitching ? scalarSwitchingLabel : explorerInterfaceLoadingLabel }}</p>
							</div>
							<ExplorerScalarReference
								:key="scalarReferenceKey"
								:configuration="activeScalarConfiguration"
								@interface-ready="onScalarInterfaceReady"
							/>
						</div>
						<template #fallback>
							<div class="explorer-page__scalar-shell explorer-page__scalar-shell--loading">
								<div class="explorer-page__scalar-loading">
									<div class="explorer-page__scalar-loading-indicator" aria-hidden="true"></div>
									<p>{{ explorerInterfaceLoadingLabel }}</p>
								</div>
							</div>
						</template>
					</ClientOnly>
				</section>
			</template>
		</template>
	</section>
</template>

<style scoped>
.explorer-page {
	position: relative;
	display: grid;
	gap: var( --spacing-150 );
	min-inline-size: 0;
	max-inline-size: 100%;
}

.explorer-page__intro {
	display: grid;
	gap: var( --spacing-100 );
	min-inline-size: 0;
}

.explorer-page__header {
	display: grid;
	gap: var( --spacing-50 );
}

.explorer-page__header h1 {
	margin: 0;
}

.explorer-page__header p {
	margin: 0;
	max-inline-size: 60ch;
}

.explorer-page__bootstrap-loading {
	/* Contained to the page so a stuck loader cannot cover the shell header. */
	position: absolute;
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

.explorer-page__reference-header p {
	margin: 0;
}

.explorer-page__reference-heading {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.explorer-page__reference-title {
	flex: 1 1 auto;
	min-inline-size: 0;
	margin: 0;
}

.explorer-page__wiki-info-chip {
	flex: 0 0 auto;
	max-inline-size: 100%;
}

/*
 * Codex subtle InfoChip (transparent fill, base border). Re-assert here because the
 * default .cdx-info-chip rules use notice colours until cdx-info-chip--subtle applies.
 */
.explorer-page__wiki-info-chip.cdx-info-chip,
.explorer-page__reference-heading :deep( .cdx-info-chip ) {
	background-color: var( --background-color-transparent );
	border-color: var( --border-color-base );
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
	/* Contain Scalar `position: fixed` UI so it cannot cover the shell header. */
	transform: translateZ( 0 );
	min-inline-size: 0;
	min-block-size: 24rem;
	border: 1px solid var( --border-color-subtle );
	border-radius: var( --border-radius-base );
	overflow: hidden;
	background-color: var( --background-color-base );
	padding-inline: var( --spacing-150 );
	padding-block: 0;
}

.explorer-page__scalar-shell--loading {
	display: grid;
	place-items: center;
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
}

.explorer-page__scalar-loading-indicator {
	inline-size: 2.5rem;
	block-size: 2.5rem;
	border: 3px solid var( --border-color-subtle );
	border-top-color: var( --color-progressive );
	border-radius: 50%;
	animation: explorer-loading-spin 0.9s linear infinite;
}

.explorer-page__scalar-loading-overlay {
	position: absolute;
	inset: 0;
	display: grid;
	place-items: center;
	gap: var( --spacing-100 );
	background-color: color-mix( in srgb, var( --background-color-base ) 92%, transparent );
	backdrop-filter: blur( 2px );
	z-index: 2;
	text-align: center;
}

.explorer-page__scalar-loading-overlay p {
	margin: 0;
}

@media screen and ( min-width: 960px ) {
	.explorer-page__reference-panel {
		position: sticky;
		inset-block-start: var( --spacing-150 );
		block-size: calc(
			var( --fd-layout-shell-body-block-size-estimate ) - ( var( --spacing-150 ) * 2 )
		);
		grid-template-rows: auto minmax( 0, 1fr );
		overflow: hidden;
	}

	.explorer-page__scalar-shell {
		block-size: 100%;
		min-block-size: 0;
		overflow: auto;
		overscroll-behavior: contain;
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
