import { createError, defineEventHandler, getQuery } from 'h3'
import { getWikiInstanceById } from '../../config/instances'

const EXPLORER_BOOTSTRAP_USER_AGENT =
	'frontdoor-dev-portal/0.1 (https://www.mediawiki.org/wiki/Front_Door_Developer_Portal)'

const BOOTSTRAP_CACHE_TTL_MS = 5 * 60 * 1000
const SPEC_FETCH_CONCURRENCY_LIMIT = 4
const OPENAPI_HTTP_METHODS = new Set( [ 'delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace' ] )

interface OpenApiOperationObject {
	summary?: string
	operationId?: string
	tags?: string[]
}

interface OpenApiDocument {
	paths?: Record<string, Record<string, OpenApiOperationObject>>
}

interface DiscoveryModule {
	name: string
	title?: string
	version?: string
	specUrl: string
}

interface DiscoveryModuleObjectShape {
	moduleId?: string
	version?: string
	info?: {
		title?: string
		version?: string
	}
	spec?: string
	specUrl?: string
}

interface DiscoveryResponse {
	modules?: DiscoveryModule[] | Record<string, DiscoveryModuleObjectShape>
}

interface ExplorerModuleOperation {
	id: string
	method: string
	path: string
	summary: string
	operationId?: string
	primaryTag?: string
}

interface ExplorerBootstrapModule {
	name: string
	title?: string
	version?: string
	label: string
	specUrl: string
	operations: ExplorerModuleOperation[]
	hasSpecError: boolean
	specErrorMessage?: string
}

interface ExplorerBootstrapPayload {
	wikiInstanceId: string
	wikiDisplayName: string
	generatedAt: string
	modules: ExplorerBootstrapModule[]
}

interface BootstrapCacheEntry {
	createdAtMs: number
	payload: ExplorerBootstrapPayload
}

const explorerBootstrapCacheByInstance = new Map<string, BootstrapCacheEntry>()

/**
 * Proxies discovery and module spec fetches for a selected wiki instance.
 *
 * The explorer relies on this endpoint to fetch all module endpoint summaries
 * for an instance in one request, with bounded upstream concurrency and a
 * short-lived in-memory cache.
 */
export default defineEventHandler( async ( event ) => {
	const query = getQuery( event )
	const wikiInstanceId = typeof query.wikiInstanceId === 'string' ? query.wikiInstanceId : ''
	const forceRefresh = query.refresh === '1'
	const selectedWikiInstance = getWikiInstanceById( wikiInstanceId )

	if ( !selectedWikiInstance ) {
		throw createError( {
			statusCode: 400,
			statusMessage: 'Unknown wiki instance id.'
		} )
	}

	const cachedEntry = explorerBootstrapCacheByInstance.get( selectedWikiInstance.id )
	const isCachedEntryUsable = Boolean(
		cachedEntry
		&& Date.now() - cachedEntry.createdAtMs <= BOOTSTRAP_CACHE_TTL_MS
		&& !forceRefresh
	)

	if ( isCachedEntryUsable && cachedEntry ) {
		return cachedEntry.payload
	}

	const discoveryUrl = `${ selectedWikiInstance.baseUrl }/w/rest.php/specs/v0/discovery`

	let discoveryResponse: DiscoveryResponse

	try {
		discoveryResponse = await $fetch<DiscoveryResponse>( discoveryUrl, {
			headers: {
				'user-agent': EXPLORER_BOOTSTRAP_USER_AGENT
			}
		} )
	} catch ( error: unknown ) {
		const statusCode =
			typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number'
				? error.statusCode
				: 502

		throw createError( {
			statusCode,
			statusMessage: 'Failed to fetch discovery from upstream instance.'
		} )
	}

	const normalizedModules = normalizeDiscoveryModules( discoveryResponse.modules, selectedWikiInstance.baseUrl )
	const modules = await mapWithConcurrency( normalizedModules, SPEC_FETCH_CONCURRENCY_LIMIT, async ( moduleItem ) => {
		try {
			const openApiDocument = await $fetch<OpenApiDocument | string>( moduleItem.specUrl, {
				headers: {
					accept: 'application/json',
					'user-agent': EXPLORER_BOOTSTRAP_USER_AGENT
				}
			} )

			const parsedOpenApiDocument = typeof openApiDocument === 'string'
				? JSON.parse( openApiDocument ) as OpenApiDocument
				: openApiDocument

			const modulePayload: ExplorerBootstrapModule = {
				name: moduleItem.name,
				label: formatModuleLabel( moduleItem.name, moduleItem.title, moduleItem.version ),
				specUrl: moduleItem.specUrl,
				operations: extractOperationsFromOpenApi( parsedOpenApiDocument.paths ?? {} ),
				hasSpecError: false
			}

			if ( moduleItem.title ) {
				modulePayload.title = moduleItem.title
			}

			if ( moduleItem.version ) {
				modulePayload.version = moduleItem.version
			}

			return modulePayload
		} catch ( error ) {
			const failedModulePayload: ExplorerBootstrapModule = {
				name: moduleItem.name,
				label: formatModuleLabel( moduleItem.name, moduleItem.title, moduleItem.version ),
				specUrl: moduleItem.specUrl,
				operations: [],
				hasSpecError: true,
				specErrorMessage: error instanceof Error ? error.message : 'Module spec fetch failed.'
			}

			if ( moduleItem.title ) {
				failedModulePayload.title = moduleItem.title
			}

			if ( moduleItem.version ) {
				failedModulePayload.version = moduleItem.version
			}

			return failedModulePayload
		}
	} )

	const payload: ExplorerBootstrapPayload = {
		wikiInstanceId: selectedWikiInstance.id,
		wikiDisplayName: selectedWikiInstance.displayName,
		generatedAt: new Date().toISOString(),
		modules
	}

	explorerBootstrapCacheByInstance.set( selectedWikiInstance.id, {
		createdAtMs: Date.now(),
		payload
	} )

	return payload
} )

/**
 * Resolves a discovery spec URL to an absolute URL.
 *
 * @param baseUrl - Base URL for the selected wiki instance.
 * @param specUrl - Spec URL from discovery payload.
 * @returns Absolute spec URL.
 */
function normalizeSpecUrl( baseUrl: string, specUrl: string ): string {
	try {
		return new URL( specUrl, baseUrl ).toString()
	} catch {
		return specUrl
	}
}

/**
 * Normalizes discovery modules from known array/object response shapes.
 *
 * @param discoveryModules - Discovery modules payload.
 * @param baseUrl - Base URL for the selected wiki instance.
 * @returns Normalized modules list.
 */
function normalizeDiscoveryModules(
	discoveryModules: DiscoveryResponse[ 'modules' ],
	baseUrl: string
): DiscoveryModule[] {
	const isUsableVersion = ( version: unknown ): version is string => {
		return typeof version === 'string' && version.trim() !== '' && version !== 'undefined'
	}

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
				const moduleVersion =
					isUsableVersion( moduleValue.info?.version )
						? moduleValue.info.version
						: isUsableVersion( moduleValue.version )
							? moduleValue.version
							: undefined
				const moduleTitle = typeof moduleValue.info?.title === 'string'
					? moduleValue.info.title
					: undefined

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

/**
 * Resolves a stable, non-empty module name for discovery entries.
 *
 * Core REST modules may expose an empty moduleId; in that case the name is
 * taken from the `/module/{id}` segment in the spec URL (for example `-`).
 *
 * @param rawModuleName - Module id or object key from discovery.
 * @param specUrl - Absolute OpenAPI spec URL for the module.
 * @returns Non-empty module name used for selection and accordion state.
 */
function resolveDiscoveryModuleName( rawModuleName: string, specUrl: string ): string {
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
 * Formats the module label shown by the explorer interface.
 *
 * @param moduleName - Discovery module name.
 * @param moduleTitle - Optional module title.
 * @param moduleVersion - Optional module version.
 * @returns Human-readable module label.
 */
function formatModuleLabel( moduleName: string, moduleTitle?: string, moduleVersion?: string ): string {
	if ( !moduleVersion ) {
		return moduleTitle ?? moduleName
	}

	const normalizedVersion = moduleVersion.startsWith( 'v' ) ? moduleVersion : `v${ moduleVersion }`
	return `${ moduleTitle ?? moduleName } (${ normalizedVersion })`
}

/**
 * Extracts endpoint operation summaries from an OpenAPI paths map.
 *
 * @param openApiPaths - OpenAPI paths object.
 * @returns Flattened operation summary list for the explorer sidebar.
 */
function extractOperationsFromOpenApi(
	openApiPaths: Record<string, Record<string, OpenApiOperationObject>>
): ExplorerModuleOperation[] {
	return Object.entries( openApiPaths )
		.flatMap( ( [ pathName, pathItem ] ) => {
			return Object.entries( pathItem ?? {} )
				.filter( ( [ methodName ] ) => OPENAPI_HTTP_METHODS.has( methodName.toLowerCase() ) )
				.map( ( [ methodName, operation ] ) => ( {
					id: `${ methodName.toLowerCase() }:${ pathName }`,
					method: methodName.toUpperCase(),
					path: pathName,
					summary: operation.summary?.trim() || operation.operationId?.trim() || pathName,
					operationId: operation.operationId,
					primaryTag: Array.isArray( operation.tags ) && operation.tags.length > 0
						? operation.tags[ 0 ]
						: undefined
				} ) )
		} )
}

/**
 * Maps async work over a list with a bounded concurrency limit.
 *
 * @param items - Items to process.
 * @param limit - Max in-flight mapper calls.
 * @param mapper - Async mapper function.
 * @returns Ordered mapper results.
 */
async function mapWithConcurrency<InputType, OutputType>(
	items: InputType[],
	limit: number,
	mapper: ( item: InputType, index: number ) => Promise<OutputType>
): Promise<OutputType[]> {
	const safeLimit = Math.max( 1, Math.floor( limit ) )
	const results: OutputType[] = new Array( items.length )
	let nextIndex = 0

	async function runWorker(): Promise<void> {
		while ( true ) {
			const currentIndex = nextIndex
			nextIndex += 1

			if ( currentIndex >= items.length ) {
				return
			}

			results[ currentIndex ] = await mapper( items[ currentIndex ], currentIndex )
		}
	}

	const workers = Array.from( { length: Math.min( safeLimit, items.length ) }, () => runWorker() )
	await Promise.all( workers )
	return results
}