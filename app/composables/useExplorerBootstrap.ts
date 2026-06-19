import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useExplorerDiagnostics } from './useExplorerDiagnostics'
import { DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS } from '../../config/explorerOptIn'
import { resolveFirstExplorerRailModule } from '../utils/explorerModuleOptInFilter'

export interface ExplorerModuleOperation {
	id: string
	method: string
	path: string
	summary: string
	operationId?: string
	primaryTag?: string
}

export interface ExplorerBootstrapModule {
	name: string
	title?: string
	version?: string
	label: string
	headingTitle: string
	versionChipLabel?: string
	showBetaChip: boolean
	specUrl: string
	moduleDescription?: string
	operations: ExplorerModuleOperation[]
	hasSpecError: boolean
	specErrorMessage?: string
}

interface ExplorerBootstrapResponse {
	wikiInstanceId: string
	wikiDisplayName: string
	generatedAt: string
	modules: ExplorerBootstrapModule[]
}

export interface ExplorerOperationTarget {
	moduleName: string
	method: string
	path: string
	summary: string
	operationId?: string
	primaryTag?: string
}

type SelectionSource = 'module-title' | 'module-accordion' | 'module-select' | 'endpoint-item' | 'bootstrap-default'

interface SelectModuleOptions {
	source: SelectionSource
	operationTarget?: ExplorerOperationTarget
}

const SCALAR_SWITCH_FALLBACK_TIMEOUT_MS = 2500

/**
 * Orchestrates explorer bootstrap and module selection state for a wiki instance.
 *
 * Fetches discovery/module endpoint metadata through one server bootstrap route,
 * tracks full-interface and Scalar-only loading states, and centralizes module
 * selection so page components only render UI and forward interaction events.
 *
 * @param selectedWikiInstanceId - Reactive wiki instance id.
 * @returns Reactive bootstrap state, selected module state, and selection actions.
 *   {@link isExplorerModuleRailVisible} is true only after bootstrap succeeds so the end-column
 *   rail mounts together with module data and aligned project controls.
 *   Establishes an `onMounted` bootstrap (post-hydration) and a watcher for wiki instance changes.
 */
export function useExplorerBootstrap( selectedWikiInstanceId: Ref<string>, enabled: Ref<boolean> = ref( true ) ) {
	const modules = ref<ExplorerBootstrapModule[]>( [] )
	const wikiDisplayName = ref( '' )
	const selectedModuleName = ref( '' )
	const expandedModuleNames = ref<string[]>( [] )
	// Show the loading UI immediately on the client-only explorer route (no idle flash).
	const instanceBootstrapState = ref<'idle' | 'loading' | 'ready' | 'error'>(
		import.meta.client ? 'loading' : 'idle'
	)
	const scalarSwitchState = ref<'idle' | 'switching'>( 'idle' )
	const instanceBootstrapErrorMessage = ref( '' )
	const pendingOperationTarget = ref<ExplorerOperationTarget | null>( null )
	const { logEvent } = useExplorerDiagnostics()

	let requestGeneration = 0
	let scalarSwitchTimeoutId: ReturnType<typeof setTimeout> | null = null

	const isInstanceBootstrapping = computed( () => instanceBootstrapState.value === 'loading' )
	const hasInstanceBootstrapError = computed( () => instanceBootstrapState.value === 'error' )
	const isExplorerModuleRailVisible = computed( () => instanceBootstrapState.value === 'ready' )
	const isScalarSwitching = computed( () => scalarSwitchState.value === 'switching' )

	const selectedModule = computed( () => {
		return modules.value.find( ( moduleItem ) => moduleItem.name === selectedModuleName.value ) ?? null
	} )

	const availableModules = computed( () => {
		return modules.value.filter( ( moduleItem ) => !moduleItem.hasSpecError )
	} )

	const failedModules = computed( () => {
		return modules.value.filter( ( moduleItem ) => moduleItem.hasSpecError )
	} )

	const hasSelectableModules = computed( () => availableModules.value.length > 0 )

	const openApiSpecUrl = computed<string | null>( () => selectedModule.value?.specUrl ?? null )

	/**
	 * Sets Scalar switch state with a deterministic timeout fallback.
	 *
	 * @returns Nothing.
	 */
	function startScalarSwitch(): void {
		scalarSwitchState.value = 'switching'

		if ( scalarSwitchTimeoutId ) {
			clearTimeout( scalarSwitchTimeoutId )
		}

		scalarSwitchTimeoutId = setTimeout( () => {
			scalarSwitchState.value = 'idle'
			scalarSwitchTimeoutId = null

			logEvent( 'scalar.switch_ready', {
				readyStrategy: 'fallback_timeout'
			} )
		}, SCALAR_SWITCH_FALLBACK_TIMEOUT_MS )
	}

	/**
	 * Marks Scalar as ready after a module spec switch.
	 *
	 * @returns Nothing.
	 */
	function markScalarReady(): void {
		if ( scalarSwitchTimeoutId ) {
			clearTimeout( scalarSwitchTimeoutId )
			scalarSwitchTimeoutId = null
		}

		scalarSwitchState.value = 'idle'

		logEvent( 'scalar.switch_ready', {
			readyStrategy: 'event_or_callback'
		} )
	}

	/**
	 * Returns whether a named module exists and can be selected.
	 *
	 * @param moduleName - Module name.
	 * @returns True when module exists and has no spec error.
	 */
	function isModuleSelectable( moduleName: string ): boolean {
		const moduleItem = modules.value.find( ( candidateModule ) => candidateModule.name === moduleName )
		return Boolean( moduleItem && !moduleItem.hasSpecError )
	}

	/**
	 * Ensures a module section is expanded in the navigation rail.
	 *
	 * @param moduleName - Module name to expand.
	 * @returns Nothing.
	 */
	function ensureModuleExpanded( moduleName: string ): void {
		if ( expandedModuleNames.value.includes( moduleName ) ) {
			return
		}

		expandedModuleNames.value = [ ...expandedModuleNames.value, moduleName ]
	}

	/**
	 * Toggles whether a module section is expanded in the navigation rail.
	 *
	 * @param moduleName - Module name for the heading that was activated.
	 * @param isOpen - Whether the section should be open.
	 * @returns Nothing.
	 */
	function setModuleExpanded( moduleName: string, isOpen: boolean ): void {
		if ( isOpen ) {
			ensureModuleExpanded( moduleName )
			return
		}

		expandedModuleNames.value = expandedModuleNames.value.filter(
			( expandedName ) => expandedName !== moduleName
		)
	}

	/**
	 * Selects a module and triggers Scalar switching state.
	 *
	 * @param moduleName - Target module name.
	 * @param options - Selection source and optional operation target.
	 * @returns True when module selection changed or was re-applied.
	 */
	function selectModule( moduleName: string, options: SelectModuleOptions ): boolean {
		if ( !isModuleSelectable( moduleName ) ) {
			return false
		}

		const isAlreadySelected = selectedModuleName.value === moduleName
		selectedModuleName.value = moduleName
		ensureModuleExpanded( moduleName )

		if ( options.operationTarget ) {
			pendingOperationTarget.value = options.operationTarget
		}

		// Only block on Scalar reload when the spec URL changes (new module).
		// Same-module endpoint clicks keep the current spec mounted so focus can run immediately.
		if ( !isAlreadySelected ) {
			startScalarSwitch()
		}

		logEvent( 'ui.module_selected', {
			source: options.source,
			selectedModuleName: moduleName,
			withOperationTarget: Boolean( options.operationTarget )
		} )

		return true
	}

	/**
	 * Clears any pending operation focus request after handling.
	 *
	 * @returns Nothing.
	 */
	function clearPendingOperationTarget(): void {
		pendingOperationTarget.value = null
	}

	/**
	 * Fetches and initializes explorer bootstrap data for the selected instance.
	 *
	 * @param shouldForceRefresh - Whether to bypass bootstrap cache.
	 * @returns Nothing.
	 */
	async function bootstrapSelectedInstance( shouldForceRefresh = false ): Promise<void> {
		const nextRequestGeneration = requestGeneration + 1
		requestGeneration = nextRequestGeneration

		instanceBootstrapState.value = 'loading'
		instanceBootstrapErrorMessage.value = ''
		modules.value = []
		wikiDisplayName.value = ''
		selectedModuleName.value = ''
		expandedModuleNames.value = []
		pendingOperationTarget.value = null
		scalarSwitchState.value = 'idle'

		logEvent( 'bootstrap.start', {
			selectedWikiInstanceId: selectedWikiInstanceId.value,
			forceRefresh: shouldForceRefresh
		} )

		try {
			const bootstrapResponse = await $fetch<ExplorerBootstrapResponse>( '/api/explorer-bootstrap', {
				query: {
					wikiInstanceId: selectedWikiInstanceId.value,
					refresh: shouldForceRefresh ? '1' : '0'
				}
			} )

			if ( nextRequestGeneration !== requestGeneration ) {
				return
			}

			modules.value = bootstrapResponse.modules
			wikiDisplayName.value = bootstrapResponse.wikiDisplayName

			const defaultModule = resolveFirstExplorerRailModule(
				bootstrapResponse.modules,
				DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS
			)

			if ( defaultModule ) {
				selectModule( defaultModule.name, {
					source: 'bootstrap-default'
				} )
			}

			instanceBootstrapState.value = 'ready'

			logEvent( 'bootstrap.success', {
				selectedWikiInstanceId: selectedWikiInstanceId.value,
				moduleCount: bootstrapResponse.modules.length,
				failedModuleCount: bootstrapResponse.modules.filter( ( moduleItem ) => moduleItem.hasSpecError ).length,
				defaultModule: defaultModule?.name ?? null
			} )
		} catch ( error ) {
			if ( nextRequestGeneration !== requestGeneration ) {
				return
			}

			instanceBootstrapState.value = 'error'
			instanceBootstrapErrorMessage.value = error instanceof Error ? error.message : 'Instance bootstrap failed.'

			logEvent( 'bootstrap.error', {
				selectedWikiInstanceId: selectedWikiInstanceId.value,
				errorMessage: instanceBootstrapErrorMessage.value
			} )
		}
	}

	/**
	 * Retries bootstrap for the selected wiki instance.
	 *
	 * @returns Nothing.
	 */
	async function retryBootstrap(): Promise<void> {
		await bootstrapSelectedInstance( true )
	}

	onMounted( () => {
		if ( !enabled.value ) {
			return
		}

		const nuxtApp = useNuxtApp()

		/**
		 * Waits until Nuxt finishes client hydration, then starts bootstrap.
		 *
		 * Immediate watchers can hang `$fetch` on SPA entry to `ssr: false` routes; see
		 * ARCHITECTURE.md → API explorer → Route boundary navigation.
		 *
		 * @returns Promise that resolves when bootstrap has been scheduled.
		 */
		async function bootstrapAfterHydration(): Promise<void> {
			if ( nuxtApp.isHydrating ) {
				await new Promise<void>( ( resolve ) => {
					const finishHydration = (): void => {
						if ( !nuxtApp.isHydrating ) {
							resolve()
						}
					}

					const stopHook = nuxtApp.hook( 'app:suspense:resolve', () => {
						stopHook()
						finishHydration()
					} )

					requestAnimationFrame( finishHydration )
					setTimeout( finishHydration, 500 )
				} )
			}

			await nextTick()
			void bootstrapSelectedInstance( false )
		}

		void bootstrapAfterHydration()

		// Fallback when bootstrap started before the client was fully ready (SPA entry to `/explorer`).
		setTimeout( () => {
			if (
				instanceBootstrapState.value !== 'ready'
				&& instanceBootstrapState.value !== 'error'
			) {
				void bootstrapSelectedInstance( false )
			}
		}, 1000 )
	} )

	watch( selectedWikiInstanceId, ( newWikiInstanceId, previousWikiInstanceId ) => {
		if ( !enabled.value ) {
			return
		}

		if ( previousWikiInstanceId === undefined ) {
			return
		}

		if ( newWikiInstanceId === previousWikiInstanceId ) {
			return
		}

		void bootstrapSelectedInstance( false )
	} )

	watch( enabled, ( isEnabled, wasEnabled ) => {
		if ( isEnabled && !wasEnabled ) {
			void bootstrapSelectedInstance( false )
		}
	} )

	return {
		modules,
		availableModules,
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
		retryBootstrap,
		clearPendingOperationTarget
	}
}