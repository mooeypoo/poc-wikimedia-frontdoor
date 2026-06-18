<script setup lang="ts">
import { CdxMenuItem } from '@wikimedia/codex'
import type { ExplorerBootstrapModule, ExplorerModuleOperation } from '../../composables/useExplorerBootstrap'
import {
	formatEndpointAccessibleLabel,
	resolveEndpointPathLabel
} from '../../utils/explorerEndpointLabels'

/**
 * ExplorerModuleRail — right-hand endpoint navigation for the selected REST API module.
 *
 * Lists endpoints for the module chosen in project controls. Presentational only;
 * the explorer page owns state and passes handlers for user interactions.
 *
 * **Codex exception:** `CdxMenuItem` outside a floating `CdxMenu` — same approved pattern as
 * `ShellSidePanelNav` (static shell list). Endpoint rows use the default slot for method +
 * path styling; `:label` supplies the accessible name.
 */
const props = defineProps<{
	selectedModule: ExplorerBootstrapModule
	isInstanceBootstrapping: boolean
}>()

const emit = defineEmits<{
	'endpoint-click': [ moduleName: string, operation: ExplorerModuleOperation ]
}>()

const { $bananaI18n } = useNuxtApp()

const endpointsNavigationLabel = computed( () => $bananaI18n( 'explorer-endpoints-label' ) )
const endpointsEmptyLabel = computed( () => $bananaI18n( 'explorer-endpoints-empty' ) )
const moduleUnavailableLabel = computed( () => $bananaI18n( 'explorer-module-unavailable' ) )
const endpointFallbackLabel = computed( () => $bananaI18n( 'explorer-endpoint-fallback' ) )

/**
 * Handles activation of an endpoint menu item.
 *
 * @param moduleOperation - Operation metadata for the clicked row.
 * @returns Nothing.
 */
function onEndpointMenuItemClick( moduleOperation: ExplorerModuleOperation ): void {
	emit( 'endpoint-click', props.selectedModule.name, moduleOperation )
}
</script>

<template>
	<aside
		class="explorer-module-rail frontdoor-end-panel-nav"
		:aria-busy="isInstanceBootstrapping"
	>
		<header class="explorer-module-rail__header">
			<h2 class="explorer-module-rail__title">
				<bdi>{{ selectedModule.headingTitle }}</bdi>
			</h2>
		</header>

		<div class="explorer-module-rail__endpoint-scrollport">
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
						<span class="explorer-module-rail__endpoint-path">
							<bdi>{{ resolveEndpointPathLabel( moduleOperation, endpointFallbackLabel ) }}</bdi>
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
	border-radius: var( --border-radius-base );
	background-color: var( --background-color-neutral-subtle );
	font-family: var( --font-family-sans-stack );
}

.explorer-module-rail__header {
	flex-shrink: 0;
	min-inline-size: 0;
	padding-block-start: var( --spacing-75 );
	padding-block-end: var( --spacing-50 );
	padding-inline: var( --spacing-75 );
}

.explorer-module-rail__title {
	margin: 0;
	font-size: var( --font-size-large );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-large );
	inline-size: 100%;
}

.explorer-module-rail__endpoint-scrollport {
	flex: 1 1 auto;
	min-block-size: 0;
	overflow-y: auto;
	overscroll-behavior: contain;
	padding-block-end: var( --spacing-75 );
}

.explorer-module-rail__module-unavailable,
.explorer-module-rail__module-empty-state {
	margin: 0;
	padding-inline: var( --spacing-75 );
	font-size: var( --font-size-small );
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

.explorer-module-rail__endpoint-path {
	display: inline;
	font-family: var( --font-family-monospace-stack );
	font-size: var( --font-size-small );
	color: var( --color-base );
	overflow-wrap: anywhere;
}

/* CdxMenuItem outside CdxMenu: match ShellSidePanelNav progressive hover (no underline). */
.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover ),
.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .cdx-menu-item__content ),
.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .explorer-module-rail__endpoint-method ),
.explorer-module-rail__endpoint-list :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .explorer-module-rail__endpoint-path ) {
	color: var( --color-progressive );
}

@media screen and ( max-width: 1119px ) {
	.explorer-module-rail {
		overflow: visible;
	}

	.explorer-module-rail__endpoint-scrollport {
		overflow-y: visible;
	}
}
</style>
