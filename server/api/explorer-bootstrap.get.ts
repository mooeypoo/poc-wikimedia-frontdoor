import { createError, defineEventHandler, getQuery } from 'h3'
import { getWikiInstanceById } from '../../config/instances'
import { resolveExplorerModuleRailHeading } from '../../app/utils/explorerModuleRailHeading'
import { normalizeOpenApiModuleDescription } from '../../app/utils/explorerModuleDescription'
import { normalizeDiscoveryModules } from '../../app/utils/normalizeDiscoveryModules'
import type { DiscoveryResponse } from '../../app/utils/normalizeDiscoveryModules'

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
	info?: {
		description?: string
	}
	paths?: Record<string, Record<string, OpenApiOperationObject>>
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
	headingTitle: string
	versionChipLabel?: string
	showBetaChip: boolean
	specUrl: string
	moduleDescription?: string
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
				headingTitle: moduleItem.title ?? moduleItem.name,
				showBetaChip: false,
				specUrl: moduleItem.specUrl,
				operations: extractOperationsFromOpenApi( parsedOpenApiDocument.paths ?? {} ),
				hasSpecError: false
			}

			attachModuleRailHeadingFields(
				modulePayload,
				moduleItem.name,
				moduleItem.title,
				moduleItem.version
			)

			if ( moduleItem.title ) {
				modulePayload.title = moduleItem.title
			}

			if ( moduleItem.version ) {
				modulePayload.version = moduleItem.version
			}

			const moduleDescription = normalizeOpenApiModuleDescription(
				parsedOpenApiDocument.info?.description,
				moduleItem.name
			)

			if ( moduleDescription ) {
				modulePayload.moduleDescription = moduleDescription
			}

			return modulePayload
		} catch ( error ) {
			const failedModulePayload: ExplorerBootstrapModule = {
				name: moduleItem.name,
				label: formatModuleLabel( moduleItem.name, moduleItem.title, moduleItem.version ),
				headingTitle: moduleItem.title ?? moduleItem.name,
				showBetaChip: false,
				specUrl: moduleItem.specUrl,
				operations: [],
				hasSpecError: true,
				specErrorMessage: error instanceof Error ? error.message : 'Module spec fetch failed.'
			}

			attachModuleRailHeadingFields(
				failedModulePayload,
				moduleItem.name,
				moduleItem.title,
				moduleItem.version
			)

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
 * Adds parsed rail heading fields used by the explorer module navigation menu.
 *
 * @param modulePayload - Bootstrap module record to enrich.
 * @param moduleName - Discovery module name.
 * @param moduleTitle - Optional human-readable module title.
 * @param moduleVersion - Optional module version.
 * @returns Nothing.
 */
function attachModuleRailHeadingFields(
	modulePayload: ExplorerBootstrapModule,
	moduleName: string,
	moduleTitle?: string,
	moduleVersion?: string
): void {
	const railHeading = resolveExplorerModuleRailHeading( moduleName, moduleTitle, moduleVersion )
	modulePayload.headingTitle = railHeading.headingTitle
	modulePayload.showBetaChip = railHeading.showBetaChip

	if ( railHeading.versionChipLabel ) {
		modulePayload.versionChipLabel = railHeading.versionChipLabel
	}
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
