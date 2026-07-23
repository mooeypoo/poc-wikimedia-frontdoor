/**
 * The single discovery-payload parser, shared by all three consumers
 * (docs/adr-module-source-of-truth.md §11):
 *   - the client `useDiscovery` composable (browser/SSR),
 *   - the `explorer-bootstrap` server route, which re-normalizes live on every
 *     wiki-instance/language switch,
 *   - the offline module-source-of-truth generator (plain Node).
 *
 * Because it runs in all three environments it MUST stay pure and isomorphic:
 * no I/O, no Node-only APIs, no dependencies. All fetching happens around it.
 *
 * The Wikimedia discovery endpoint (`{baseUrl}/w/rest.php/specs/v0/discovery`)
 * returns its `modules` field in one of two shapes — an array, or an object
 * keyed by module id. Both are normalized here into a single flat list so no
 * consumer re-implements the parsing.
 */

/** A normalized discovery module: identity, optional metadata, and an absolute spec URL. */
export interface DiscoveryModule {
	name: string
	title?: string
	version?: string
	specUrl: string
}

/** Object-keyed discovery module shape (the alternative to the array shape). */
export interface DiscoveryModuleObjectShape {
	moduleId?: string
	version?: string
	info?: {
		title?: string
		version?: string
	}
	spec?: string
	specUrl?: string
}

/** The discovery endpoint response envelope. */
export interface DiscoveryResponse {
	modules?: DiscoveryModule[] | Record<string, DiscoveryModuleObjectShape>
}

/**
 * Whether a version value is usable (a non-empty string that is not the literal `"undefined"`).
 *
 * @param version - Candidate version value from a discovery payload.
 * @returns True when the value is a usable version string.
 */
function isUsableVersion( version: unknown ): version is string {
	return typeof version === 'string' && version.trim() !== '' && version !== 'undefined'
}

/**
 * Resolves a spec URL to absolute form against the instance base URL.
 *
 * @param baseUrl - Base URL of the wiki instance.
 * @param specUrl - Spec URL from the discovery response (may be relative).
 * @returns Absolute spec URL, or the input unchanged when it cannot be resolved.
 */
export function normalizeSpecUrl( baseUrl: string, specUrl: string ): string {
	try {
		return new URL( specUrl, baseUrl ).toString()
	} catch {
		return specUrl
	}
}

/**
 * Resolves a stable, non-empty module name. Core REST modules may expose an
 * empty moduleId (the "unassociated endpoints" root module); in that case the
 * name is taken from the `/module/{id}` segment of the spec URL (for example
 * `-`), matching how Wikimedia itself addresses that module.
 *
 * @param rawModuleName - Module id or object key from discovery (may be empty).
 * @param specUrl - Absolute OpenAPI spec URL for the module.
 * @returns Non-empty module name.
 */
export function resolveDiscoveryModuleName( rawModuleName: string, specUrl: string ): string {
	if ( typeof rawModuleName === 'string' && rawModuleName.trim() !== '' ) {
		return rawModuleName.trim()
	}

	const modulePathMatch = specUrl.match( /\/module\/([^/?#]+)/ )
	if ( modulePathMatch?.[ 1 ] ) {
		return modulePathMatch[ 1 ]
	}

	return 'unknown-module'
}

/**
 * Normalizes discovery module data across both known response shapes.
 *
 * @param discoveryModules - The `modules` field from a discovery response.
 * @param baseUrl - Base URL of the wiki instance, used to absolutize spec URLs.
 * @returns Normalized module list.
 */
export function normalizeDiscoveryModules(
	discoveryModules: DiscoveryResponse[ 'modules' ],
	baseUrl: string
): DiscoveryModule[] {
	if ( Array.isArray( discoveryModules ) ) {
		return discoveryModules
			.filter( ( rawModule ) => typeof rawModule.specUrl === 'string' )
			.map( ( rawModule ) => {
				const specUrl = normalizeSpecUrl( baseUrl, rawModule.specUrl )
				return {
					name: resolveDiscoveryModuleName( rawModule.name, specUrl ),
					title: typeof rawModule.title === 'string' ? rawModule.title : undefined,
					version: isUsableVersion( rawModule.version ) ? rawModule.version : undefined,
					specUrl
				}
			} )
	}

	if ( discoveryModules && typeof discoveryModules === 'object' ) {
		return Object.entries( discoveryModules )
			.flatMap( ( [ moduleKey, moduleValue ] ) => {
				const moduleVersion =
					isUsableVersion( moduleValue.info?.version )
						? moduleValue.info.version
						: isUsableVersion( moduleValue.version )
							? moduleValue.version
							: undefined
				const moduleTitle = typeof moduleValue.info?.title === 'string'
					? moduleValue.info.title
					: undefined
				const rawSpecUrl =
					typeof moduleValue.spec === 'string'
						? moduleValue.spec
						: typeof moduleValue.specUrl === 'string'
							? moduleValue.specUrl
							: ''

				if ( !rawSpecUrl ) {
					return []
				}

				const specUrl = normalizeSpecUrl( baseUrl, rawSpecUrl )
				const moduleName = resolveDiscoveryModuleName(
					typeof moduleValue.moduleId === 'string' ? moduleValue.moduleId : moduleKey,
					specUrl
				)

				const normalizedModule: DiscoveryModule = {
					name: moduleName,
					specUrl
				}

				if ( moduleTitle ) {
					normalizedModule.title = moduleTitle
				}

				if ( moduleVersion ) {
					normalizedModule.version = moduleVersion
				}

				return [ normalizedModule ]
			} )
	}

	return []
}
