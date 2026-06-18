/**
 * Codex checkbox `input-value` tokens and module visibility rules for explorer opt-in filters.
 */

/** Opt-in checkbox value for beta REST endpoints and modules. */
export const EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS = 'beta-endpoints'

/** Opt-in checkbox value for internal REST endpoints and modules. */
export const EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS = 'internal-endpoints'

/** Default opt-in checkbox state when the community explorer loads. */
export const DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS = {
	includeBetaEndpoints: false,
	includeInternalEndpoints: false
} as const

/**
 * Discovery module name prefixes that require the beta opt-in checkbox.
 *
 * The Attribution API is published as `attribution/v0-beta` on Wikimedia wikis.
 */
export const EXPLORER_BETA_OPT_IN_MODULE_NAME_PREFIXES = [
	'attribution/'
] as const

/**
 * Returns whether a discovery module is hidden until beta opt-in is enabled.
 *
 * @param moduleName - Discovery module id from bootstrap (e.g. `attribution/v0-beta`).
 * @returns True when the module requires the beta opt-in checkbox.
 */
export function isExplorerBetaOptInModule( moduleName: string ): boolean {
	const normalizedModuleName = moduleName.trim().toLowerCase()

	return EXPLORER_BETA_OPT_IN_MODULE_NAME_PREFIXES.some( ( moduleNamePrefix ) => {
		return normalizedModuleName.startsWith( moduleNamePrefix )
	} )
}
