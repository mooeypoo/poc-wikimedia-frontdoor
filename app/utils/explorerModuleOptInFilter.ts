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
 * @returns Modules that may be shown in the rail and reference panel.
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
