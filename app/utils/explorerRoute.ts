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
 * Reserved first segment after `/explorer/` for a verbose community deep-link:
 * `/explorer/direct/<instance>/<module…>`. The module name is the tail (it may
 * itself span multiple segments, e.g. `site/v1`). See docs/adr-explorer-deep-linking.md §1.
 */
const DIRECT_SEGMENT = 'direct'

/**
 * Reserved first segment after `/explorer/` for a quick community deep-link:
 * `/explorer/q/<module…>`. The instance is resolved from the module source of
 * truth; the SPA then canonicalizes the URL to the `direct` form (ADR §6).
 */
const QUICK_SEGMENT = 'q'

/**
 * How a community explorer path names its target.
 *
 * - `plain` — the bare `/explorer` (no instance/module in the path).
 * - `direct` — `/explorer/direct/<instance>/<module…>`, an explicit instance.
 * - `quick` — `/explorer/q/<module…>`, instance resolved from the source of truth.
 */
export type ExplorerDeepLinkForm = 'plain' | 'direct' | 'quick'

/**
 * The state a `/explorer` path encodes: its mode, and — for community
 * deep-links — the form plus any instance id and module name carried in the
 * path. The operation lives in the URL hash and is parsed separately.
 */
export interface ExplorerDeepLink {
	/** The explorer mode the path selects. */
	mode: ExplorerMode
	/** How the community path names its target (undefined for Enterprise modes). */
	form?: ExplorerDeepLinkForm
	/** Instance id (dbname) from a `direct` path, if present. */
	instanceId?: string
	/** Full discovery module name (e.g. `site/v1`) from a `direct` or `quick` path, if present. */
	moduleName?: string
}

/**
 * Returns the path segments that follow the `explorer` segment.
 *
 * Tolerates a trailing slash and a locale prefix (the `explorer` segment is
 * located by value, not position), so `/fr/explorer/direct/enwiki/site/v1`
 * yields `[ 'direct', 'enwiki', 'site', 'v1' ]`. Returns an empty array for the
 * bare explorer route and for any non-explorer path.
 *
 * @param path - Vue Router path (with or without trailing slash / locale prefix).
 * @returns The decoded segments after `explorer`, or an empty array.
 */
function explorerSubSegments( path: string ): string[] {
	const segments = path.replace( /\/+$/, '' ).split( '/' ).filter( ( segment ) => segment !== '' )
	const explorerIndex = segments.indexOf( 'explorer' )
	if ( explorerIndex < 0 ) {
		return []
	}
	return segments.slice( explorerIndex + 1 )
}

/**
 * Returns whether a route path is the API Explorer (any mode, locale-independent).
 *
 * Matches the explorer index (`/explorer`) and any explorer sub-route
 * (`/explorer/enterprise`, `/explorer/direct/...`, `/explorer/q/...`). The
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
 * Parses a `/explorer` path into the state it encodes: mode, form, and any
 * instance/module carried in a community deep-link.
 *
 * The parser is the single source of truth for the path grammar; `explorerModeFromPath`
 * delegates to it. Unknown or malformed sub-segments fall through to a plain
 * community route so a stale or mistyped deep-link never breaks the page
 * (invalid instance/module values are validated downstream, at resolution time).
 *
 * @param path - Vue Router path.
 * @returns The decoded deep-link. Enterprise modes carry no form/instance/module.
 */
export function parseExplorerDeepLink( path: string ): ExplorerDeepLink {
	const subSegments = explorerSubSegments( path )

	if ( subSegments.length === 0 ) {
		return { mode: 'community', form: 'plain' }
	}

	// Enterprise modes are matched only when their segment is the sole sub-segment,
	// preserving the previous anchored-regex behaviour (`/explorer/enterprise/extra`
	// is not Enterprise). They carry no instance/module.
	if ( subSegments.length === 1 && subSegments[ 0 ] === ENTERPRISE_CUSTOM_SEGMENT ) {
		return { mode: 'enterprise-custom' }
	}
	if ( subSegments.length === 1 && subSegments[ 0 ] === ENTERPRISE_FULL_SEGMENT ) {
		return { mode: 'enterprise-full' }
	}

	if ( subSegments[ 0 ] === DIRECT_SEGMENT ) {
		const instanceId = subSegments[ 1 ]
		// The module name is the tail — it may span multiple segments (`site/v1`).
		const moduleName = subSegments.slice( 2 ).join( '/' )
		return {
			mode: 'community',
			form: 'direct',
			...( instanceId ? { instanceId } : {} ),
			...( moduleName ? { moduleName } : {} )
		}
	}

	if ( subSegments[ 0 ] === QUICK_SEGMENT ) {
		const moduleName = subSegments.slice( 1 ).join( '/' )
		return {
			mode: 'community',
			form: 'quick',
			...( moduleName ? { moduleName } : {} )
		}
	}

	return { mode: 'community', form: 'plain' }
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
	return parseExplorerDeepLink( path ).mode
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

/**
 * Builds the verbose community deep-link path for an instance + module.
 *
 * The module name is appended as-is; discovery names contain `/` (`site/v1`),
 * which is exactly the multi-segment tail the parser reads back. Instance and
 * module values are expected to be URL-safe (dbnames and discovery names are),
 * so no encoding is applied — keeping the path human-readable and reversible.
 *
 * @param instanceId - Wiki instance id (dbname), e.g. `enwiki`.
 * @param moduleName - Full discovery module name, e.g. `site/v1` (or `-` for the root module).
 * @returns The path `/explorer/direct/<instance>/<module…>`.
 */
export function buildExplorerDirectPath( instanceId: string, moduleName: string ): string {
	return `/explorer/${ DIRECT_SEGMENT }/${ instanceId }/${ moduleName }`
}

/**
 * Builds the quick community deep-link path for a module (instance omitted).
 *
 * The quick form is an input shorthand; the SPA resolves the instance from the
 * module source of truth and canonicalizes the URL to the `direct` form (ADR §6).
 *
 * @param moduleName - Full discovery module name, e.g. `site/v1`.
 * @returns The path `/explorer/q/<module…>`.
 */
export function buildExplorerQuickPath( moduleName: string ): string {
	return `/explorer/${ QUICK_SEGMENT }/${ moduleName }`
}
