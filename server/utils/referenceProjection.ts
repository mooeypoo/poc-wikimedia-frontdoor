import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { normalizeOpenApiModuleDescription } from '../../app/utils/explorerModuleDescription.ts'
import { buildOperationAnchor, findDuplicateOperationAnchors } from '../../app/utils/explorerOperationAnchor.ts'
import { GENERATED_MODULES } from '../../config/generated/modules.generated.ts'
import { getModuleByName, getModuleInstances } from '../../config/moduleSourceOfTruth.ts'

/**
 * Shared tier-1 projection of a REST API module's committed OpenAPI spec.
 *
 * One implementation, three consumers: the reference page's data route, the
 * `llms-full.txt` prose corpus, and the `llms.txt` index. They must agree — a
 * page and a machine surface describing the same operation differently is worse
 * than either being absent — so the projection lives here rather than being
 * re-derived per route.
 *
 * Deep request/response schema trees are deliberately **not** projected
 * (docs/adr-static-module-documentation.md §2): they are 83% of spec bytes and
 * the least useful material for indexing.
 *
 * Spec JSON is read from disk. That is correct while these routes are
 * prerendered — the project directory is present at build time — but would fail
 * in a runtime-rendered deployment where the files are not bundled. Recorded as
 * an open question in the ADR.
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
 * Only applies to the description fallback — a real `summary` is already one line
 * by convention and is never truncated.
 */
const DERIVED_SUMMARY_MAX_LENGTH = 180

/** One operation as a tier-1 surface renders it. */
export interface ReferenceOperation {
	method: string
	path: string
	summary: string
	anchor: string
}

/** Where a module is deployed, summarised rather than enumerated. */
export interface ReferenceInstanceSummary {
	total: number
	families: { family: string; count: number }[]
	examples: { id: string; displayName: string }[]
}

/** The full tier-1 projection for one module. */
export interface ReferenceModuleProjection {
	moduleName: string
	title: string
	description: string
	version: string
	specVersion: string
	specFile: string
	instances: ReferenceInstanceSummary
	operations: ReferenceOperation[]
}

/** Raised when a module has no committed spec, so callers can map it to a 404. */
export class MissingModuleSpecError extends Error {}

/** Raised when a module's anchors are not unique, so callers can fail the build. */
export class CollidingAnchorsError extends Error {}

/**
 * Reduces an operation description to a single summary line.
 *
 * Measured across the committed specs, **71% of operations carry a `summary` but
 * 79% carry a `description`**, unevenly: four modules have descriptions with no
 * summaries at all, so a summary-only projection renders them as a bare list of
 * paths with no indexable prose. This fallback recovers those.
 *
 * `readinglists/v0` and `specs/v0` have neither, and no projection can invent
 * prose for them — that is a spec-content gap to report upstream.
 *
 * @param description - Raw operation `description` from the spec.
 * @returns A single-line plain-text summary, or an empty string.
 */
export function deriveSummaryFromDescription( description: unknown ): string {
	if ( typeof description !== 'string' ) {
		return ''
	}

	const plainText = normalizeOpenApiModuleDescription( description )
	if ( !plainText ) {
		return ''
	}

	const firstLine = plainText.split( /\r?\n/ )[ 0 ]?.trim() ?? ''
	// Prefer a sentence boundary; fall back to a hard cap so one long sentence
	// cannot dominate the surface.
	const firstSentenceMatch = firstLine.match( /^(.+?[.!?])(\s|$)/ )
	const candidate = firstSentenceMatch ? firstSentenceMatch[ 1 ] : firstLine

	if ( candidate.length <= DERIVED_SUMMARY_MAX_LENGTH ) {
		return candidate
	}

	return `${ candidate.slice( 0, DERIVED_SUMMARY_MAX_LENGTH ).trimEnd() }…`
}

/**
 * Summarises the instances exposing a module.
 *
 * Six of ten modules are on ~840 wikis, so no surface may enumerate them
 * (docs/adr-static-module-documentation.md §1). Families carry the shape of the
 * deployment; a few named examples make it concrete.
 *
 * @param moduleName - Full discovery module name.
 * @returns Total count, per-family counts (largest first), and example wikis.
 */
export function summariseInstances( moduleName: string ): ReferenceInstanceSummary {
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
 * Sorted by path then method so surface order — and therefore prerendered bytes
 * and anchor sequence — is deterministic across regenerations.
 *
 * @param specDocument - Parsed OpenAPI document.
 * @returns Operations in stable order.
 */
export function projectOperations( specDocument: Record<string, any> ): ReferenceOperation[] {
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

/**
 * Reads a module's committed OpenAPI spec verbatim.
 *
 * @param specFile - Spec file stem from the module source of truth.
 * @returns The parsed OpenAPI document.
 * @throws {MissingModuleSpecError} When the file is absent or unparseable.
 */
export async function readModuleSpec( specFile: string ): Promise<Record<string, any>> {
	try {
		const specPath = join( MODULE_SPECS_DIRECTORY, `${ specFile }.generated.json` )
		return JSON.parse( await readFile( specPath, 'utf8' ) )
	} catch {
		throw new MissingModuleSpecError( `No committed spec for ${ specFile }.` )
	}
}

/**
 * Builds the tier-1 projection for one module.
 *
 * @param moduleName - Full discovery module name (e.g. `site/v1`, `-`).
 * @returns The projection, or null when the module is unknown.
 * @throws {MissingModuleSpecError} When the module has no committed spec.
 * @throws {CollidingAnchorsError} When two operations claim one anchor.
 */
export async function projectModuleReference(
	moduleName: string
): Promise<ReferenceModuleProjection | null> {
	const wikiModule = getModuleByName( moduleName )
	if ( !wikiModule ) {
		return null
	}

	const specDocument = await readModuleSpec( wikiModule.specFile )
	const operations = projectOperations( specDocument )

	// Anchors become durable, indexed URLs, so a collision must fail loudly
	// rather than publish two headings claiming one fragment (ADR §4).
	const duplicateAnchors = findDuplicateOperationAnchors( operations )
	if ( duplicateAnchors.length > 0 ) {
		throw new CollidingAnchorsError(
			`Colliding operation anchors in ${ moduleName }: ` +
			duplicateAnchors.map( ( duplicate ) => duplicate.anchor ).join( ', ' )
		)
	}

	return {
		moduleName,
		title: wikiModule.title ?? moduleName,
		description: normalizeOpenApiModuleDescription(
			specDocument.info?.description,
			moduleName
		) ?? '',
		version: wikiModule.version,
		specVersion: typeof specDocument.info?.version === 'string' ? specDocument.info.version : '',
		specFile: wikiModule.specFile,
		instances: summariseInstances( moduleName ),
		operations
	}
}

/**
 * Builds projections for every committed module, in source-of-truth order.
 *
 * Used by the whole-corpus machine surfaces, which must cover the same modules
 * the per-module pages do.
 *
 * @returns One projection per module with a committed spec.
 */
export async function projectAllModuleReferences(): Promise<ReferenceModuleProjection[]> {
	const projections: ReferenceModuleProjection[] = []

	for ( const wikiModule of GENERATED_MODULES ) {
		const projection = await projectModuleReference( wikiModule.name )
		if ( projection ) {
			projections.push( projection )
		}
	}

	return projections
}
