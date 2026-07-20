/**
 * Discovery-payload normalization shared by the runtime explorer and the
 * offline module-source-of-truth generator (see docs/adr-module-source-of-truth.md §1, §7).
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
			.filter( ( rawModule ) => typeof rawModule.name === 'string' && typeof rawModule.specUrl === 'string' )
			.map( ( rawModule ) => ( {
				name: rawModule.name,
				title: typeof rawModule.title === 'string' ? rawModule.title : undefined,
				version: isUsableVersion( rawModule.version ) ? rawModule.version : undefined,
				specUrl: normalizeSpecUrl( baseUrl, rawModule.specUrl )
			} ) )
	}

	if ( discoveryModules && typeof discoveryModules === 'object' ) {
		return Object.entries( discoveryModules )
			.flatMap( ( [ moduleKey, moduleValue ] ) => {
				const moduleName = typeof moduleValue.moduleId === 'string' ? moduleValue.moduleId : moduleKey
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

				const normalizedModule: DiscoveryModule = {
					name: moduleName,
					specUrl: normalizeSpecUrl( baseUrl, rawSpecUrl )
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
