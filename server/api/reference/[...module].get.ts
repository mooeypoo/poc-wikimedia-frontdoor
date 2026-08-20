import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { createError, defineEventHandler } from 'h3'

import { normalizeOpenApiModuleDescription } from '../../../app/utils/explorerModuleDescription.ts'
import { buildOperationAnchor, findDuplicateOperationAnchors } from '../../../app/utils/explorerOperationAnchor.ts'
import { getModuleByName, getModuleInstances } from '../../../config/moduleSourceOfTruth.ts'
import { referenceSlugToModuleName } from '../../../config/referenceRoutes.ts'

/**
 * Tier-1 reference projection for one REST API module.
 *
 * Reads the committed OpenAPI spec (`config/generated/module-specs/`) and the
 * module source of truth, and returns only what a tier-1 page renders: module
 * identity, a summarised instance list, and one entry per operation carrying its
 * method, path, summary and anchor. Deep request/response schema trees are
 * deliberately **not** projected — see docs/adr-static-module-documentation.md §2
 * (prose inline, schemas deferred), which is what keeps page weight and the
 * prerendered payload proportional to prose rather than to spec structure.
 *
 * Spec JSON is read from disk rather than imported. These routes are prerendered
 * (§7), so the reads happen at build time when the project directory is present.
 * A runtime-rendered deployment would need the specs bundled as server assets
 * instead; that is a known constraint of the current experiment, not a design.
 */

/** HTTP methods that denote an operation in an OpenAPI path item. */
const OPERATION_METHODS = new Set( [
	'get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace'
] )

/** Directory holding the committed per-module specs. */
const MODULE_SPECS_DIRECTORY = 'config/generated/module-specs'

/** How many project families to name before collapsing the rest into "other". */
const INSTANCE_FAMILY_LIMIT = 5

/**
 * Longest one-line summary derived from an operation `description`.
 *
 * Only applies to the description fallback below — a real `summary` is already
 * one line by convention and is never truncated.
 */
const DERIVED_SUMMARY_MAX_LENGTH = 180

/**
 * Reduces an operation description to a single summary line.
 *
 * Measured across the committed specs, **71% of operations carry a `summary` but
 * 79% carry a `description`** — and the gap is not spread evenly. Four modules
 * (`growthexperiments/v0`, `wikifunctions/v0`, and partly the root module) have
 * descriptions with no summaries at all, so a summary-only tier-1 projection
 * renders them as a bare list of paths with no indexable prose. Falling back to
 * the description's first sentence recovers those operations.
 *
 * `readinglists/v0` and `specs/v0` have neither, and no projection can invent
 * prose for them; that is a spec-content gap to report upstream, not a bug here.
 *
 * @param description - Raw operation `description` from the spec.
 * @returns A single-line plain-text summary, or an empty string.
 */
function deriveSummaryFromDescription( description: unknown ): string {
	if ( typeof description !== 'string' ) {
		return ''
	}

	const plainText = normalizeOpenApiModuleDescription( description )
	if ( !plainText ) {
		return ''
	}

	const firstLine = plainText.split( /\r?\n/ )[ 0 ]?.trim() ?? ''
	// Prefer a sentence boundary; fall back to a hard cap so a single long
	// sentence cannot dominate the page.
	const firstSentenceMatch = firstLine.match( /^(.+?[.!?])(\s|$)/ )
	const candidate = firstSentenceMatch ? firstSentenceMatch[ 1 ] : firstLine

	if ( candidate.length <= DERIVED_SUMMARY_MAX_LENGTH ) {
		return candidate
	}

	return `${ candidate.slice( 0, DERIVED_SUMMARY_MAX_LENGTH ).trimEnd() }…`
}

/** One operation as a tier-1 page renders it. */
interface ReferenceOperation {
	method: string
	path: string
	summary: string
	anchor: string
}

/** Where a module is deployed, summarised rather than enumerated. */
interface ReferenceInstanceSummary {
	total: number
	families: { family: string; count: number }[]
	examples: { id: string; displayName: string }[]
}

/** The full tier-1 projection for one module. */
interface ReferenceModulePage {
	moduleName: string
	slug: string
	title: string
	description: string
	version: string
	specVersion: string
	instances: ReferenceInstanceSummary
	operations: ReferenceOperation[]
}

/**
 * Extracts the module slug from a catch-all route parameter.
 *
 * Module names span multiple segments (`site/v1`), so the tail is rejoined
 * verbatim — the reason the route is a catch-all at all.
 *
 * @param moduleParameter - Raw `module` route param.
 * @returns The slug (e.g. `site/v1`, `general`), or an empty string.
 */
function readModuleSlug( moduleParameter: unknown ): string {
	if ( Array.isArray( moduleParameter ) ) {
		return moduleParameter.filter( Boolean ).join( '/' )
	}
	return typeof moduleParameter === 'string' ? moduleParameter : ''
}

/**
 * Summarises the instances exposing a module.
 *
 * Six of ten modules are on ~840 wikis, so the page must never enumerate them
 * (docs/adr-static-module-documentation.md §1). Families carry the shape of the
 * deployment; a few named examples make it concrete.
 *
 * @param moduleName - Full discovery module name.
 * @returns Total count, per-family counts (largest first), and example wikis.
 */
function summariseInstances( moduleName: string ): ReferenceInstanceSummary {
	const instances = getModuleInstances( moduleName )
	const countsByFamily = new Map<string, number>()

	for ( const instance of instances ) {
		countsByFamily.set( instance.family, ( countsByFamily.get( instance.family ) ?? 0 ) + 1 )
	}

	const rankedFamilies = [ ...countsByFamily.entries() ]
		.map( ( [ family, count ] ) => ( { family, count } ) )
		.sort( ( a, b ) => b.count - a.count || a.family.localeCompare( b.family ) )

	const namedFamilies = rankedFamilies.slice( 0, INSTANCE_FAMILY_LIMIT )
	const remainder = rankedFamilies
		.slice( INSTANCE_FAMILY_LIMIT )
		.reduce( ( total, entry ) => total + entry.count, 0 )

	if ( remainder > 0 ) {
		namedFamilies.push( { family: 'other', count: remainder } )
	}

	return {
		total: instances.length,
		families: namedFamilies,
		examples: instances
			.slice( 0, 3 )
			.map( ( instance ) => ( { id: instance.id, displayName: instance.displayName } ) )
	}
}

/**
 * Projects an OpenAPI document's operations into tier-1 entries.
 *
 * Sorted by path then method so the page order — and therefore the prerendered
 * bytes and the anchor sequence — is deterministic across regenerations.
 *
 * @param specDocument - Parsed OpenAPI document.
 * @returns Operations in stable order.
 */
function projectOperations( specDocument: Record<string, any> ): ReferenceOperation[] {
	const operations: ReferenceOperation[] = []

	for ( const [ path, pathItem ] of Object.entries( specDocument.paths ?? {} ) ) {
		for ( const [ method, operation ] of Object.entries( pathItem as Record<string, any> ) ) {
			if ( !OPERATION_METHODS.has( method ) ) {
				continue
			}
			const declaredSummary = typeof operation?.summary === 'string'
				? operation.summary.trim()
				: ''

			operations.push( {
				method: method.toUpperCase(),
				path,
				summary: declaredSummary || deriveSummaryFromDescription( operation?.description ),
				anchor: buildOperationAnchor( method, path )
			} )
		}
	}

	return operations.sort(
		( a, b ) => a.path.localeCompare( b.path ) || a.method.localeCompare( b.method )
	)
}

export default defineEventHandler( async ( event ): Promise<ReferenceModulePage> => {
	const slug = readModuleSlug( event.context.params?.module )

	if ( !slug ) {
		throw createError( { statusCode: 400, statusMessage: 'Missing module slug.' } )
	}

	const moduleName = referenceSlugToModuleName( slug )
	const wikiModule = getModuleByName( moduleName )

	if ( !wikiModule ) {
		throw createError( { statusCode: 404, statusMessage: 'Unknown module.' } )
	}

	let specDocument: Record<string, any>
	try {
		const specPath = join( MODULE_SPECS_DIRECTORY, `${ wikiModule.specFile }.generated.json` )
		specDocument = JSON.parse( await readFile( specPath, 'utf8' ) )
	} catch {
		throw createError( {
			statusCode: 404,
			statusMessage: 'No committed spec for this module.'
		} )
	}

	const operations = projectOperations( specDocument )

	// Anchors become durable, indexed URLs, so a collision must fail loudly
	// rather than silently publish two headings that claim the same fragment
	// (docs/adr-static-module-documentation.md §4).
	const duplicateAnchors = findDuplicateOperationAnchors( operations )
	if ( duplicateAnchors.length > 0 ) {
		throw createError( {
			statusCode: 500,
			statusMessage: `Colliding operation anchors in ${ moduleName }: ` +
				duplicateAnchors.map( ( duplicate ) => duplicate.anchor ).join( ', ' )
		} )
	}

	return {
		moduleName,
		slug,
		title: wikiModule.title ?? moduleName,
		description: typeof specDocument.info?.description === 'string'
			? specDocument.info.description
			: '',
		version: wikiModule.version,
		specVersion: typeof specDocument.info?.version === 'string' ? specDocument.info.version : '',
		instances: summariseInstances( moduleName ),
		operations
	}
} )
