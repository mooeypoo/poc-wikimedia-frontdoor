/**
 * Builds the endpoint search index — one record per REST API operation, derived
 * from the committed OpenAPI specs under `config/generated/module-specs/`.
 *
 * See docs/adr-explorer-deep-linking.md §10. This is the pure builder; the CLI
 * wiring lives in scripts/generate-module-source-of-truth.mjs (phase 3) so the
 * index can never drift from the specs it is derived from.
 *
 * ## Why the operation hash comes from Scalar's own code
 *
 * The community explorer runs Scalar's internal sidebar
 * (`EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR`), so Scalar — not this application —
 * owns the operation hash and reads it on load to scroll to and select an
 * operation (docs/adr-explorer-deep-linking.md §2). A deep link therefore has to
 * spell the operation the way Scalar spells it:
 *
 *   untagged  →  #GET/v1/page/{title}/bare
 *   tagged    →  #tag/events/POST/event_registration
 *
 * Rather than re-implementing Scalar's slugging (which would break silently on
 * upgrade), this builder calls Scalar's actual id builders — `createNavigation`
 * from @scalar/workspace-store and `makeHrefFromId` from @scalar/api-reference.
 * A Scalar upgrade that changes the format therefore changes the generated
 * index, which shows up as a reviewable git diff and fails the drift test in
 * tests/endpointSearchIndex.test.mjs rather than quietly breaking every link.
 *
 * `makeHrefFromId` is passed `isMultiDocument: false` because the explorer
 * mounts exactly one Scalar document; in that mode Scalar strips the document
 * slug from the id before writing the hash.
 */

import { createNavigation } from '@scalar/workspace-store/navigation'
import { makeHrefFromId } from '@scalar/api-reference/helpers'

/** HTTP methods that count as operations (matches Scalar's traversal). */
const OPERATION_METHODS = new Set( [ 'get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace' ] )

/**
 * Maximum length of the indexed `description` excerpt, in characters.
 *
 * Descriptions are prose (sometimes several paragraphs of Markdown). Indexing
 * them whole bloats the payload and dilutes ranking — a match deep in a long
 * description is far weaker evidence than one in the summary — so only the
 * opening excerpt is kept.
 */
const MAX_DESCRIPTION_LENGTH = 200

/**
 * Reduces a Markdown description to a plain-text excerpt suitable for indexing
 * and for display in a search result.
 *
 * Conservative and lossy by design: this text is only ever matched against and
 * shown as a snippet, never rendered as Markdown. Fenced code blocks are dropped
 * entirely (they are examples, not description), link text is kept while the URL
 * is discarded, and the result is truncated at a word boundary.
 *
 * @param {string | undefined} description - Raw Markdown description from the OpenAPI operation.
 * @returns {string} Plain-text excerpt, or an empty string when there is nothing usable.
 */
export function buildDescriptionExcerpt( description ) {
	if ( typeof description !== 'string' || description.trim() === '' ) {
		return ''
	}

	const plainText = description
		// Fenced code blocks are examples, not prose — drop before anything else.
		.replace( /```[\s\S]*?```/g, ' ' )
		.replace( /~~~[\s\S]*?~~~/g, ' ' )
		// Images before links: `![alt](src)` would otherwise leave a stray `!`.
		.replace( /!\[[^\]]*\]\([^)]*\)/g, ' ' )
		.replace( /\[([^\]]*)\]\([^)]*\)/g, '$1' )
		.replace( /<[^>]+>/g, ' ' )
		.replace( /[`*_~]/g, '' )
		// Leading block markers (headings, quotes, list bullets) on any line.
		.replace( /^[ \t]*(?:[#>]+|[-+*]|\d+\.)[ \t]+/gm, '' )
		.replace( /\s+/g, ' ' )
		.trim()

	if ( plainText.length <= MAX_DESCRIPTION_LENGTH ) {
		return plainText
	}

	const truncated = plainText.slice( 0, MAX_DESCRIPTION_LENGTH )
	const lastSpaceIndex = truncated.lastIndexOf( ' ' )

	// Only honour the word boundary when it is not so early that we lose the excerpt.
	return ( lastSpaceIndex > MAX_DESCRIPTION_LENGTH / 2
		? truncated.slice( 0, lastSpaceIndex )
		: truncated
	).trimEnd()
}

/**
 * Collects every operation entry from a Scalar navigation tree, depth-first.
 *
 * Scalar nests operations under tag nodes (and examples under operations), so
 * the tree has to be walked rather than read a level at a time.
 *
 * @param {object[] | undefined} entries - Navigation entries to walk.
 * @param {object[]} [collected] - Accumulator used by the recursion.
 * @returns {object[]} Operation entries in navigation (sidebar) order.
 */
function collectOperationEntries( entries, collected = [] ) {
	for ( const entry of entries ?? [] ) {
		if ( entry.type === 'operation' ) {
			collected.push( entry )
		}
		if ( entry.children ) {
			collectOperationEntries( entry.children, collected )
		}
	}
	return collected
}

/**
 * Reads the source OpenAPI operation object for a navigation entry.
 *
 * Returns an empty object when the path item is a `$ref` (the committed specs
 * keep `$ref`s unresolved, while Scalar resolves them during traversal), so
 * callers fall back to what the navigation entry itself carries.
 *
 * @param {object} openApiSpec - The full OpenAPI document.
 * @param {string} path - OpenAPI path template.
 * @param {string} method - Lower-case HTTP method.
 * @returns {object} The operation object, or an empty object when unresolvable.
 */
function readSourceOperation( openApiSpec, path, method ) {
	const pathItem = openApiSpec?.paths?.[ path ]
	if ( !pathItem || typeof pathItem !== 'object' ) {
		return {}
	}
	const operation = pathItem[ method ]
	return operation && typeof operation === 'object' ? operation : {}
}

/**
 * Builds the endpoint search records for a single module.
 *
 * @param {object} options - Builder inputs.
 * @param {object} options.wikiModule - Module registry entry from `modules.generated.ts`.
 * @param {object} options.openApiSpec - The module's captured OpenAPI document.
 * @param {string} options.documentSlug - Scalar document slug (`SCALAR_DOCUMENT_SLUG`).
 * @param {string} options.instanceId - Instance the module's deep links should load.
 * @param {( instanceId: string, moduleName: string ) => string} options.buildModulePath - Builds
 *   the `/explorer/direct/<instance>/<module>` path.
 * @param {( moduleName: string ) => ( 'beta' | 'internal' | null )} options.resolveGate - Opt-in gate resolver.
 * @returns {object[]} Endpoint records in Scalar navigation order.
 */
function buildModuleRecords( {
	wikiModule,
	openApiSpec,
	documentSlug,
	instanceId,
	buildModulePath,
	resolveGate
} ) {
	// Scalar filters `x-internal` / `x-scalar-ignore` operations out of the
	// navigation tree, so driving off the tree (rather than off spec.paths)
	// guarantees we never index an operation Scalar will not render — which
	// would produce a deep link whose hash resolves to nothing.
	const navigation = createNavigation( documentSlug, openApiSpec )
	const operationEntries = collectOperationEntries( navigation.children )

	const modulePath = buildModulePath( instanceId, wikiModule.name )
	const gate = resolveGate( wikiModule.name )

	return operationEntries.map( ( operationEntry ) => {
		const method = String( operationEntry.method ?? '' ).toLowerCase()
		const sourceOperation = readSourceOperation( openApiSpec, operationEntry.path, method )

		// Scalar sets the entry title to the summary when there is one, and to the
		// path otherwise — so a title that differs from the path is a usable
		// summary even when the spec object was behind an unresolved `$ref`.
		const summary = typeof sourceOperation.summary === 'string' && sourceOperation.summary.trim() !== ''
			? sourceOperation.summary.trim()
			: ( operationEntry.title !== operationEntry.path ? String( operationEntry.title ?? '' ).trim() : '' )

		const descriptionExcerpt = buildDescriptionExcerpt( sourceOperation.description )
		const operationId = typeof sourceOperation.operationId === 'string'
			? sourceOperation.operationId.trim()
			: ''
		const tags = Array.isArray( sourceOperation.tags )
			? sourceOperation.tags.filter( ( tag ) => typeof tag === 'string' && tag.trim() !== '' )
			: []

		// Scalar's own href builder — the hash exactly as Scalar will write and read it.
		const operationHash = makeHrefFromId( operationEntry.id, undefined, false )

		return {
			module: wikiModule.name,
			moduleTitle: wikiModule.title ?? wikiModule.name,
			instance: instanceId,
			method: method.toUpperCase(),
			path: operationEntry.path,
			...( summary ? { summary } : {} ),
			...( descriptionExcerpt ? { description: descriptionExcerpt } : {} ),
			...( operationId ? { operationId } : {} ),
			...( tags.length > 0 ? { tags } : {} ),
			...( operationEntry.isDeprecated ? { isDeprecated: true } : {} ),
			...( gate ? { gate } : {} ),
			deepLink: `${ modulePath }${ operationHash }`
		}
	} )
}

/**
 * Builds the full endpoint search index across every module that has a captured
 * OpenAPI spec.
 *
 * Modules whose spec could not be captured (a phase-2 failure) are reported
 * rather than silently skipped — absence of a spec is never treated as "this
 * module has no endpoints", mirroring the correctness rule the fleet sweep
 * follows for discovery (docs/adr-module-source-of-truth.md §6).
 *
 * @param {object} options - Builder inputs.
 * @param {object[]} options.modules - Module registry entries, in name order.
 * @param {( wikiModule: object ) => ( object | null )} options.readSpec - Loads a module's
 *   captured OpenAPI document, or returns null when it is not present on disk.
 * @param {string} options.documentSlug - Scalar document slug (`SCALAR_DOCUMENT_SLUG`).
 * @param {( wikiModule: object ) => string} options.resolveInstance - Resolves the instance
 *   a module's deep links should load (shared with the runtime quick-resolve policy).
 * @param {( instanceId: string, moduleName: string ) => string} options.buildModulePath - Builds
 *   the `/explorer/direct/<instance>/<module>` path.
 * @param {( moduleName: string ) => ( 'beta' | 'internal' | null )} options.resolveGate - Opt-in gate resolver.
 * @returns {{ records: object[], modulesWithoutSpec: string[] }} The index and the
 *   names of modules that contributed nothing because their spec is missing.
 */
export function buildEndpointSearchIndex( {
	modules,
	readSpec,
	documentSlug,
	resolveInstance,
	buildModulePath,
	resolveGate
} ) {
	const records = []
	const modulesWithoutSpec = []

	for ( const wikiModule of modules ) {
		const openApiSpec = readSpec( wikiModule )
		if ( !openApiSpec ) {
			modulesWithoutSpec.push( wikiModule.name )
			continue
		}

		records.push( ...buildModuleRecords( {
			wikiModule,
			openApiSpec,
			documentSlug,
			instanceId: resolveInstance( wikiModule ),
			buildModulePath,
			resolveGate
		} ) )
	}

	modulesWithoutSpec.sort( ( a, b ) => a.localeCompare( b ) )
	return { records, modulesWithoutSpec }
}

/**
 * Counts the operations an OpenAPI document declares, without traversing it
 * through Scalar. Used only to sanity-check the generated index against the raw
 * spec so a silent traversal regression is visible in the run output.
 *
 * @param {object} openApiSpec - The OpenAPI document.
 * @returns {number} Number of declared operations.
 */
export function countDeclaredOperations( openApiSpec ) {
	let operationCount = 0
	for ( const pathItem of Object.values( openApiSpec?.paths ?? {} ) ) {
		if ( !pathItem || typeof pathItem !== 'object' ) {
			continue
		}
		for ( const method of Object.keys( pathItem ) ) {
			if ( OPERATION_METHODS.has( method.toLowerCase() ) ) {
				operationCount++
			}
		}
	}
	return operationCount
}

/**
 * Serializes the endpoint search index to a generated TypeScript module,
 * matching the conventions of its siblings under `config/generated/`.
 *
 * @param {object[]} records - Endpoint records.
 * @param {object} meta - Generation metadata.
 * @returns {string} File contents.
 */
export function serializeEndpointSearchIndex( records, meta ) {
	return `/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Keyword search index over the Wikimedia REST API endpoints, one record per
 * operation, derived from the committed OpenAPI specs in ./module-specs/.
 *
 * Each record carries a \`deepLink\` into the community API Explorer. The
 * operation hash is produced by Scalar's own navigation-id builders, so it is
 * only valid for the Scalar version pinned in \`scalarApiReferenceVersion\`
 * below — an upgrade that changes the format will change this file.
 *
 * Regenerate with:
 *   npm run generate-module-source-of-truth
 * (or just this phase: \`-- --index-only\`), then review the git diff.
 * See docs/adr-explorer-deep-linking.md §10.
 */

/** Opt-in gate that hides an endpoint's module in the explorer until enabled. */
export type GeneratedEndpointGate = 'beta' | 'internal'

export interface GeneratedEndpointSearchRecord {
	/** Full discovery module name (e.g. \`site/v1\`). */
	module: string
	/** Human-readable module title (e.g. \`Site API\`). */
	moduleTitle: string
	/** Instance id the deep link loads (shared quick-link policy). */
	instance: string
	/** Upper-case HTTP method (e.g. \`GET\`). */
	method: string
	/** OpenAPI path template (e.g. \`/v1/page/{title}\`). */
	path: string
	/** Operation summary, when the spec provides one. */
	summary?: string
	/** Plain-text excerpt of the operation description, when present. */
	description?: string
	/** OpenAPI \`operationId\`, when present. */
	operationId?: string
	/** OpenAPI tags, when present. */
	tags?: string[]
	/** Present and true when the spec marks the operation deprecated. */
	isDeprecated?: true
	/** Present when the endpoint's module is hidden behind an opt-in checkbox. */
	gate?: GeneratedEndpointGate
	/** Explorer deep link: \`/explorer/direct/<instance>/<module>#<scalar-hash>\`. */
	deepLink: string
}

export interface GeneratedEndpointSearchIndexMeta {
	generatedAt: string
	/** Scalar document slug the operation hashes were built against. */
	scalarDocumentSlug: string
	/** @scalar/api-reference version whose hash format these deep links match. */
	scalarApiReferenceVersion: string
	moduleCount: number
	endpointCount: number
	/** Modules with no captured spec — they contribute no records (not "no endpoints"). */
	modulesWithoutSpec: string[]
}

export const GENERATED_ENDPOINT_SEARCH_INDEX_META: GeneratedEndpointSearchIndexMeta = ${
	JSON.stringify( meta, null, '\t' )
}

export const GENERATED_ENDPOINT_SEARCH_INDEX: GeneratedEndpointSearchRecord[] = ${
	JSON.stringify( records, null, '\t' )
}
`
}
