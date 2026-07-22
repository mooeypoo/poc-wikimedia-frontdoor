import type { ExplorerMode } from '../composables/useEnterpriseExplorer'

/**
 * Path segment after `/explorer/` that selects the full Enterprise mode.
 *
 * Public URL representation — the internal mode identifier is `enterprise-full`
 * but the URL uses the shorter `enterprise`.
 */
const ENTERPRISE_FULL_SEGMENT = 'enterprise'

/** Path segment that selects the custom (non-Scalar) Enterprise mode. */
const ENTERPRISE_CUSTOM_SEGMENT = 'enterprise-custom'

/**
 * Returns whether a route path is the API Explorer (any mode, locale-independent).
 *
 * Matches the explorer index (`/explorer`) and any explorer sub-route
 * (`/explorer/enterprise`, `/explorer/enterprise-custom`). The
 * `(^|\/)explorer(\/|$)` shape keeps this safe against accidental matches
 * like `/foo-explorer` while still tolerating locale-prefixed paths.
 *
 * @param path - Vue Router path (with or without trailing slash).
 * @returns True when the path is an explorer route.
 */
export function isExplorerRoutePath( path: string ): boolean {
	const normalizedPath = path.replace( /\/+$/, '' ) || '/'
	return /(^|\/)explorer(\/|$)/.test( normalizedPath )
}

/**
 * Resolves the Explorer mode that a path encodes.
 *
 * Unknown trailing segments fall through to community — keeping a stale or
 * mistyped deep-link from breaking the page.
 *
 * @param path - Vue Router path.
 * @returns The encoded explorer mode (community when no Enterprise segment is present).
 */
export function explorerModeFromPath( path: string ): ExplorerMode {
	const normalizedPath = path.replace( /\/+$/, '' ) || '/'
	if ( new RegExp( `/explorer/${ ENTERPRISE_CUSTOM_SEGMENT }$` ).test( normalizedPath ) ) {
		return 'enterprise-custom'
	}
	if ( new RegExp( `/explorer/${ ENTERPRISE_FULL_SEGMENT }$` ).test( normalizedPath ) ) {
		return 'enterprise-full'
	}
	return 'community'
}

/**
 * Resolves the URL path that represents a given Explorer mode.
 *
 * Community is the default and lives at the bare `/explorer` route so the
 * existing entry point remains unchanged.
 *
 * @param mode - Explorer mode to encode.
 * @returns The path that should be pushed to the router for that mode.
 */
export function pathForExplorerMode( mode: ExplorerMode ): string {
	switch ( mode ) {
		case 'enterprise-full':
			return `/explorer/${ ENTERPRISE_FULL_SEGMENT }`
		case 'enterprise-custom':
			return `/explorer/${ ENTERPRISE_CUSTOM_SEGMENT }`
		case 'community':
		default:
			return '/explorer'
	}
}
