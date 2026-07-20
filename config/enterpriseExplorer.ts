/** Spec URL via server-side proxy (upstream has no CORS headers). */
export const ENTERPRISE_SPEC_URL = '/api/enterprise-spec'

/** Scalar overrides for the full Enterprise API Explorer experience. */
export const ENTERPRISE_FULL_SCALAR_OVERRIDES = {
	showSidebar: true
} as const

/**
 * Scalar overrides for the limited Enterprise API experience.
 * Note: per-endpoint parameters, responses, and inline schemas have no Scalar
 * config flag — see ADR §7.3 for the path forward on limited mode.
 */
export const ENTERPRISE_LIMITED_SCALAR_OVERRIDES = {
	showSidebar: true,
	hideTestRequestButton: true,
	hideDownloadButton: true,
	hideClientButton: true,
	hiddenClients: true as const,
	hideModels: true
} as const
