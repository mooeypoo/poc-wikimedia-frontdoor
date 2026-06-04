import { computed, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { ExplorerBootstrapModule } from './useExplorerBootstrap'
import { filterExplorerBootstrapModulesByOptIn } from '../utils/explorerModuleOptInFilter'

interface UseExplorerOptInFilteredModulesOptions {
	modules: Ref<ExplorerBootstrapModule[]>
	failedModules: ComputedRef<ExplorerBootstrapModule[]>
	includeBetaEndpoints: Ref<boolean>
	includeInternalEndpoints: Ref<boolean>
	selectedModuleName: Ref<string>
	/**
	 * @param moduleName - Replacement module name.
	 * @param options - Selection metadata forwarded to bootstrap.
	 * @returns True when selection succeeded.
	 */
	selectModule: (
		moduleName: string,
		options: { source: 'module-select' }
	) => boolean
}

/**
 * Applies explorer opt-in checkbox rules to bootstrap module lists.
 *
 * Hides beta-gated modules (for example Attribution API) unless beta opt-in is
 * enabled, and re-selects a visible module when the current selection is hidden.
 *
 * @param options - Bootstrap module state, opt-in flags, and selection actions.
 * @returns {{
 *   visibleModules: ComputedRef<ExplorerBootstrapModule[]>,
 *   visibleFailedModules: ComputedRef<ExplorerBootstrapModule[]>,
 *   hasVisibleSelectableModules: ComputedRef<boolean>,
 *   visibleSelectedModule: ComputedRef<ExplorerBootstrapModule | null>,
 *   visibleOpenApiSpecUrl: ComputedRef<string | null>
 * }}
 */
export function useExplorerOptInFilteredModules( options: UseExplorerOptInFilteredModulesOptions ) {
	const filterOptions = computed( () => ( {
		includeBetaEndpoints: options.includeBetaEndpoints.value,
		includeInternalEndpoints: options.includeInternalEndpoints.value
	} ) )

	const visibleModules = computed( () => {
		return filterExplorerBootstrapModulesByOptIn( options.modules.value, filterOptions.value )
	} )

	const visibleFailedModules = computed( () => {
		return filterExplorerBootstrapModulesByOptIn( options.failedModules.value, filterOptions.value )
	} )

	const hasVisibleSelectableModules = computed( () => {
		return visibleModules.value.some( ( moduleItem ) => !moduleItem.hasSpecError )
	} )

	const visibleSelectedModule = computed( () => {
		return visibleModules.value.find( ( moduleItem ) => {
			return moduleItem.name === options.selectedModuleName.value && !moduleItem.hasSpecError
		} ) ?? null
	} )

	const visibleOpenApiSpecUrl = computed<string | null>( () => {
		return visibleSelectedModule.value?.specUrl ?? null
	} )

	/**
	 * Selects the first visible, healthy module when the current selection is opt-in gated.
	 *
	 * @returns Nothing.
	 */
	function reconcileSelectedModuleWithOptIn(): void {
		const selectedModuleName = options.selectedModuleName.value

		if ( !selectedModuleName ) {
			return
		}

		const selectedModuleStillVisible = visibleModules.value.some( ( moduleItem ) => {
			return moduleItem.name === selectedModuleName && !moduleItem.hasSpecError
		} )

		if ( selectedModuleStillVisible ) {
			return
		}

		const fallbackModule = visibleModules.value.find( ( moduleItem ) => !moduleItem.hasSpecError )

		if ( fallbackModule ) {
			options.selectModule( fallbackModule.name, { source: 'module-select' } )
		}
	}

	watch( filterOptions, () => {
		reconcileSelectedModuleWithOptIn()
	} )

	watch( options.modules, () => {
		reconcileSelectedModuleWithOptIn()
	} )

	return {
		visibleModules,
		visibleFailedModules,
		hasVisibleSelectableModules,
		visibleSelectedModule,
		visibleOpenApiSpecUrl
	}
}
