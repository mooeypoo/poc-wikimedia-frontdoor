import { isExplorerBetaOptInModule } from '../../config/explorerOptIn'

export interface ExplorerModuleOptInFilterOptions {
	includeBetaEndpoints: boolean
	includeInternalEndpoints: boolean
}

/**
 * Filters explorer bootstrap modules by opt-in checkbox state.
 *
 * Beta-gated modules (for example Attribution API) are removed unless beta opt-in
 * is checked. Internal opt-in is reserved for a later phase.
 *
 * @param modules - Full module list from explorer bootstrap.
 * @param filterOptions - Current opt-in checkbox values.
 * @returns Modules that may be shown in the REST API module select and reference panel.
 */
export function filterExplorerBootstrapModulesByOptIn<T extends { name: string }>(
	modules: T[],
	filterOptions: ExplorerModuleOptInFilterOptions
): T[] {
	return modules.filter( ( moduleItem ) => {
		if ( !filterOptions.includeBetaEndpoints && isExplorerBetaOptInModule( moduleItem.name ) ) {
			return false
		}

		return true
	} )
}

/**
 * Resolves the first selectable module in discovery order after opt-in filtering.
 *
 * Applies the same opt-in filter and discovery ordering as {@link filterExplorerBootstrapModulesByOptIn},
 * then returns the first module without a spec fetch error.
 *
 * @param modules - Ordered bootstrap modules from discovery.
 * @param filterOptions - Opt-in checkbox values (defaults match initial explorer load).
 * @returns First healthy module for the REST API module select and rail, or undefined when none qualify.
 */
export function resolveFirstExplorerRailModule<T extends { name: string; hasSpecError: boolean }>(
	modules: T[],
	filterOptions: ExplorerModuleOptInFilterOptions
): T | undefined {
	const railOrderedModules = filterExplorerBootstrapModulesByOptIn( modules, filterOptions )

	return railOrderedModules.find( ( moduleItem ) => !moduleItem.hasSpecError )
}
