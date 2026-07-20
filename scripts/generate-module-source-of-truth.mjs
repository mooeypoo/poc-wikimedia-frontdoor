#!/usr/bin/env node

/**
 * Generates the module source of truth — a fleet-wide picture of the REST API
 * modules Wikimedia exposes. See docs/adr-module-source-of-truth.md.
 *
 * This is a maintenance tool, NOT a build step. Run it occasionally and review
 * the resulting git diff:
 *
 *   npm run generate-module-source-of-truth
 *   git diff config/generated/
 *
 * Phase 1: enumerate the fleet from `action=sitematrix`, filter to public +
 * open wikis, sweep each wiki's `/w/rest.php/specs/v0/discovery` endpoint, and
 * invert the results into:
 *
 *   config/generated/wikiInstances.generated.ts — the fleet registry (metadata)
 *   config/generated/modules.generated.ts       — modules → instance-id lists
 *
 * Phase 2: for each unique module, fetch the full OpenAPI spec from its
 * representative instance and write it verbatim to:
 *
 *   config/generated/module-specs/<name>.generated.json
 *
 * Both phases run by default. Phases are independently runnable so refreshing
 * specs never requires re-sweeping the fleet (ADR §5):
 *   --skip-specs   phase 1 only
 *   --specs-only   phase 2 only, against the existing module registry
 *
 * Correctness (ADR §6): a discovery fetch that FAILS is never recorded as
 * "this instance has no modules". Failures are retried with backoff and, if
 * still unresolved, recorded in the output metadata — absence is only ever
 * inferred from a successful response that omits a module.
 *
 * Environment overrides:
 *   SITEMATRIX_API          fleet-enumeration API (default meta.wikimedia.org)
 *   MODULE_SOT_CONCURRENCY  discovery-sweep worker pool size (default 4)
 *   MODULE_SOT_LIMIT        cap instances swept — for fast local testing
 */

import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { promises as fs } from 'node:fs'
import { normalizeDiscoveryModules } from '../app/utils/normalizeDiscoveryModules.ts'

const __filename = fileURLToPath( import.meta.url )
const projectRoot = dirname( dirname( __filename ) )

const SITEMATRIX_API = process.env.SITEMATRIX_API ?? 'https://meta.wikimedia.org/w/api.php'
const CONCURRENCY = Math.max( 1, Number.parseInt( process.env.MODULE_SOT_CONCURRENCY ?? '4', 10 ) || 4 )
const INSTANCE_LIMIT = process.env.MODULE_SOT_LIMIT
	? Math.max( 1, Number.parseInt( process.env.MODULE_SOT_LIMIT, 10 ) || 0 )
	: null

/**
 * Descriptive User-Agent, required by the Wikimedia API etiquette policy.
 * @see https://meta.wikimedia.org/wiki/User-Agent_policy
 */
const USER_AGENT =
	'WikimediaDeveloperPortal-module-source-of-truth-generator/1.0 ' +
	'(https://gitlab.wikimedia.org/repos/wikimedia/frontdoor; developer portal build tooling)'

/** Path segment appended to a wiki base URL to reach its discovery endpoint. */
const DISCOVERY_PATH = '/w/rest.php/specs/v0/discovery'

/** Retry budget and backoff for a single discovery fetch (transient failures only). */
const MAX_ATTEMPTS = 5
const BACKOFF_BASE_MS = 500

/**
 * Wikimedia's shared edge rate-limits by IP and answers 429 with a Retry-After
 * (observed ~11s). We honor that header; this is the fallback when it is absent,
 * plus a small buffer so the whole worker pool does not retry on the same tick.
 */
const RATE_LIMIT_FALLBACK_S = 11
const RATE_LIMIT_BUFFER_MS = 1000

/** Per-request timeout — bounds a single hanging wiki so it cannot stall a worker. */
const REQUEST_TIMEOUT_MS = 20000

/**
 * Preferred instance ids for the phase-2 representative spec fetch (ADR §8),
 * tried in order; falls back to the first-sorted instance that has the module.
 */
const REPRESENTATIVE_PREFERENCE = [ 'mediawikiwiki', 'enwiki', 'commonswiki', 'metawiki', 'wikidatawiki' ]

const OUTPUT_DIR = join( projectRoot, 'config', 'generated' )
const INSTANCES_OUTPUT = join( OUTPUT_DIR, 'wikiInstances.generated.ts' )
const MODULES_OUTPUT = join( OUTPUT_DIR, 'modules.generated.ts' )
const SPECS_OUTPUT_DIR = join( OUTPUT_DIR, 'module-specs' )

/**
 * Fetches a URL as JSON with the required User-Agent.
 *
 * @param {string} url - URL to fetch.
 * @returns {Promise<object>} Parsed JSON response.
 * @throws {Error} On non-OK HTTP status.
 */
async function fetchJson( url ) {
	const response = await fetch( url, {
		headers: { 'user-agent': USER_AGENT },
		signal: AbortSignal.timeout( REQUEST_TIMEOUT_MS )
	} )
	if ( !response.ok ) {
		const error = new Error( `HTTP ${ response.status } ${ response.statusText }` )
		error.status = response.status
		// Retry-After may be seconds or an HTTP-date; we honor only the numeric
		// form (what Wikimedia sends) and fall back to a fixed cooldown otherwise.
		const retryAfterSeconds = Number.parseInt( response.headers.get( 'retry-after' ) ?? '', 10 )
		error.retryAfterMs = Number.isFinite( retryAfterSeconds ) ? retryAfterSeconds * 1000 : null
		throw error
	}
	return response.json()
}

/**
 * Sleeps for the given duration.
 *
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
function sleep( ms ) {
	return new Promise( ( resolve ) => setTimeout( resolve, ms ) )
}

/**
 * Runs an async worker over items with a bounded concurrency pool.
 *
 * @template T, R
 * @param {T[]} items - Work items.
 * @param {number} limit - Maximum concurrent workers.
 * @param {( item: T, index: number ) => Promise<R>} worker - Per-item task.
 * @returns {Promise<R[]>} Results in input order.
 */
async function mapWithConcurrency( items, limit, worker ) {
	const results = new Array( items.length )
	let nextIndex = 0

	async function runWorker() {
		for ( ;; ) {
			const index = nextIndex++
			if ( index >= items.length ) {
				return
			}
			results[ index ] = await worker( items[ index ], index )
		}
	}

	const workers = []
	for ( let workerId = 0; workerId < Math.min( limit, items.length ); workerId++ ) {
		workers.push( runWorker() )
	}
	await Promise.all( workers )

	return results
}

/**
 * Whether a sitematrix site entry represents a wiki we should sweep — public
 * and open (not closed, private, or fishbowl).
 *
 * @param {object} site - A sitematrix site or specials entry.
 * @returns {boolean}
 */
function isPublicOpenSite( site ) {
	return !site.closed && !site.private && !site.fishbowl &&
		typeof site.url === 'string' && typeof site.dbname === 'string'
}

/**
 * Human-readable name for a sitematrix `specials` entry. Their `sitename` is
 * usually good ("Wikimedia Commons"), but sitematrix returns a generic
 * "Wikipedia" placeholder for several non-Wikipedia specials (Wikidata, the
 * test wikis, Wikimania, labs). Real Wikipedias live in the language groups,
 * never in `specials`, so a `specials` sitename of "Wikipedia" is always the
 * placeholder — fall back to the (accurate) project code, capitalized.
 *
 * @param {object} site - A sitematrix specials entry.
 * @returns {string} Display name.
 */
function specialDisplayName( site ) {
	if ( site.sitename && site.sitename !== 'Wikipedia' ) {
		return site.sitename
	}
	const code = site.code ?? site.dbname
	return code.charAt( 0 ).toUpperCase() + code.slice( 1 )
}

/**
 * Flattens the sitematrix response into the fleet registry of public, open
 * wikis, sorted by instance id (dbname).
 *
 * @param {object} sitematrix - The `sitematrix` field of the API response.
 * @returns {Array<object>} Instance registry entries.
 */
function buildInstanceRegistry( sitematrix ) {
	const instances = []

	for ( const [ key, value ] of Object.entries( sitematrix ) ) {
		if ( key === 'count' ) {
			continue
		}

		if ( key === 'specials' ) {
			for ( const site of value ) {
				if ( !isPublicOpenSite( site ) ) {
					continue
				}
				instances.push( {
					id: site.dbname,
					displayName: specialDisplayName( site ),
					baseUrl: site.url,
					dir: site.dir === 'rtl' ? 'rtl' : 'ltr',
					language: site.lang ?? 'en',
					family: site.code ?? ''
				} )
			}
			continue
		}

		// Numeric-keyed language group.
		const groupDir = value.dir === 'rtl' ? 'rtl' : 'ltr'
		const groupName = value.localname ?? value.name ?? value.code
		for ( const site of value.site ?? [] ) {
			if ( !isPublicOpenSite( site ) ) {
				continue
			}
			instances.push( {
				id: site.dbname,
				displayName: `${ groupName } ${ site.sitename }`.trim(),
				baseUrl: site.url,
				dir: groupDir,
				language: value.code,
				family: site.code ?? ''
			} )
		}
	}

	instances.sort( ( a, b ) => a.id.localeCompare( b.id ) )
	return instances
}

/**
 * Fetches a URL as JSON, retrying transient failures and honoring a 429
 * Retry-After cooldown.
 *
 * @param {string} url - URL to fetch.
 * @returns {Promise<object>} Parsed JSON response.
 * @throws {Error} When all attempts fail (the last error, carrying `.status`).
 */
async function fetchJsonWithRetry( url ) {
	let lastError

	for ( let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++ ) {
		try {
			return await fetchJson( url )
		} catch ( error ) {
			lastError = error
			if ( attempt >= MAX_ATTEMPTS ) {
				break
			}
			if ( error.status === 429 ) {
				// Honor the edge's cooldown rather than hammering through it.
				await sleep( ( error.retryAfterMs ?? RATE_LIMIT_FALLBACK_S * 1000 ) + RATE_LIMIT_BUFFER_MS )
			} else {
				await sleep( BACKOFF_BASE_MS * attempt )
			}
		}
	}

	throw lastError
}

/**
 * Fetches an instance's discovery modules, retrying transient failures.
 *
 * @param {object} instance - Instance registry entry.
 * @returns {Promise<import('../app/utils/normalizeDiscoveryModules.ts').DiscoveryModule[]>}
 * @throws {Error} When all attempts fail.
 */
async function fetchInstanceModules( instance ) {
	const response = await fetchJsonWithRetry( `${ instance.baseUrl }${ DISCOVERY_PATH }` )
	return normalizeDiscoveryModules( response.modules, instance.baseUrl )
}

/**
 * Sweeps discovery across the fleet with bounded concurrency.
 *
 * @param {Array<object>} instances - Instance registry entries.
 * @returns {Promise<{ modulesByInstance: Map<string, object[]>, failedInstances: string[] }>}
 *   Successful per-instance module lists, and the ids of instances whose
 *   discovery could not be resolved (distinct from "no modules").
 */
async function sweepDiscovery( instances ) {
	const modulesByInstance = new Map()
	const failedInstances = []
	const failureReasons = new Map()
	let completed = 0

	await mapWithConcurrency( instances, CONCURRENCY, async ( instance ) => {
		try {
			const modules = await fetchInstanceModules( instance )
			modulesByInstance.set( instance.id, modules )
		} catch ( error ) {
			failedInstances.push( instance.id )
			const reason = error.status ? `HTTP ${ error.status }` : ( error.name || 'Error' )
			failureReasons.set( reason, ( failureReasons.get( reason ) ?? 0 ) + 1 )
		} finally {
			completed++
			if ( completed % 50 === 0 || completed === instances.length ) {
				console.log( `[module-sot] discovery ${ completed }/${ instances.length } ` +
					`(${ failedInstances.length } failed)` )
			}
		}
	} )

	if ( failureReasons.size > 0 ) {
		const summary = [ ...failureReasons.entries() ]
			.sort( ( a, b ) => b[ 1 ] - a[ 1 ] )
			.map( ( [ reason, count ] ) => `${ reason }×${ count }` )
			.join( ', ' )
		console.warn( `[module-sot] failure reasons: ${ summary }` )
	}

	failedInstances.sort( ( a, b ) => a.localeCompare( b ) )
	return { modulesByInstance, failedInstances }
}

/**
 * Canonical name for a discovery module. Discovery reports the root
 * "unassociated endpoints" module with an empty id; Wikimedia's own spec path
 * names it `-` (`/module/-`), so we adopt that as its identifier.
 *
 * @param {string} name - Raw discovery module name (may be empty).
 * @returns {string} A non-empty canonical name.
 */
function canonicalModuleName( name ) {
	return name === '' ? '-' : name
}

/**
 * Splits a discovery module name into its base and version segment.
 * `site/v1` → `{ base: 'site', version: 'v1' }`; a name without a slash keeps
 * the whole name as the base and an empty version.
 *
 * @param {string} name - Full discovery module name.
 * @returns {{ base: string, version: string }}
 */
function splitModuleName( name ) {
	const slashIndex = name.lastIndexOf( '/' )
	if ( slashIndex < 0 ) {
		return { base: name, version: '' }
	}
	return { base: name.slice( 0, slashIndex ), version: name.slice( slashIndex + 1 ) }
}

/**
 * Filesystem-safe stem for a module's spec file (phase 2 target).
 * `site/v1` → `site-v1`.
 *
 * @param {string} name - Full discovery module name.
 * @returns {string}
 */
function moduleSpecFileStem( name ) {
	return name.replace( /\//g, '-' )
}

/**
 * Chooses the deterministic representative instance for a module (ADR §8).
 *
 * @param {string[]} sortedInstanceIds - Instance ids that have the module, sorted.
 * @returns {string} The chosen representative instance id.
 */
function chooseRepresentativeInstance( sortedInstanceIds ) {
	const available = new Set( sortedInstanceIds )
	for ( const preferred of REPRESENTATIVE_PREFERENCE ) {
		if ( available.has( preferred ) ) {
			return preferred
		}
	}
	return sortedInstanceIds[ 0 ]
}

/**
 * Inverts the per-instance discovery results into the module registry, keyed by
 * full discovery name, with full sorted instance-id lists (ADR §3, §4).
 *
 * @param {Map<string, object[]>} modulesByInstance - Per-instance module lists.
 * @returns {Array<object>} Module registry entries, sorted by name.
 */
function buildModuleRegistry( modulesByInstance ) {
	// name → { instanceIds: Set, sample: Map<instanceId, DiscoveryModule> }
	const byName = new Map()

	for ( const [ instanceId, modules ] of modulesByInstance ) {
		for ( const discoveryModule of modules ) {
			const name = canonicalModuleName( discoveryModule.name )
			let entry = byName.get( name )
			if ( !entry ) {
				entry = { instanceIds: new Set(), sample: new Map() }
				byName.set( name, entry )
			}
			entry.instanceIds.add( instanceId )
			entry.sample.set( instanceId, discoveryModule )
		}
	}

	const modules = []
	for ( const [ name, entry ] of byName ) {
		const instances = [ ...entry.instanceIds ].sort( ( a, b ) => a.localeCompare( b ) )
		const representative = chooseRepresentativeInstance( instances )
		const representativeModule = entry.sample.get( representative )
		const { base, version } = splitModuleName( name )

		modules.push( {
			name,
			base,
			version,
			...( representativeModule.title ? { title: representativeModule.title } : {} ),
			specSourceInstance: representative,
			specUrl: representativeModule.specUrl,
			specFile: moduleSpecFileStem( name ),
			instances
		} )
	}

	modules.sort( ( a, b ) => a.name.localeCompare( b.name ) )
	return modules
}

/**
 * Recursively sorts object keys for a stable, diff-friendly serialization.
 * Arrays keep their order (order is significant in OpenAPI — parameters, enums,
 * `required`, `security`); only object keys are reordered.
 *
 * @param {*} value - Any JSON value.
 * @returns {*} The value with all nested object keys sorted.
 */
function sortObjectKeysDeep( value ) {
	if ( Array.isArray( value ) ) {
		return value.map( sortObjectKeysDeep )
	}
	if ( value && typeof value === 'object' ) {
		const sorted = {}
		for ( const key of Object.keys( value ).sort( ( a, b ) => a.localeCompare( b ) ) ) {
			sorted[ key ] = sortObjectKeysDeep( value[ key ] )
		}
		return sorted
	}
	return value
}

/**
 * Phase 2 (ADR §5): captures each module's full OpenAPI spec, verbatim, from its
 * representative instance and writes it to config/generated/module-specs/. Specs
 * are stored with `$ref`s unresolved and keys recursively sorted (ADR §3, §8).
 *
 * @param {Array<object>} modules - Module registry entries (need specUrl, specFile).
 * @returns {Promise<{ succeeded: number, failed: Array<{ name: string, reason: string }> }>}
 */
async function captureModuleSpecs( modules ) {
	await fs.mkdir( SPECS_OUTPUT_DIR, { recursive: true } )
	console.log( `[module-sot] capturing ${ modules.length } module specs` )

	const outcomes = await mapWithConcurrency( modules, CONCURRENCY, async ( module ) => {
		try {
			const spec = await fetchJsonWithRetry( module.specUrl )
			const outputPath = join( SPECS_OUTPUT_DIR, `${ module.specFile }.generated.json` )
			await fs.writeFile( outputPath, `${ JSON.stringify( sortObjectKeysDeep( spec ), null, '\t' ) }\n`, 'utf-8' )
			return { name: module.name, ok: true }
		} catch ( error ) {
			const reason = error.status ? `HTTP ${ error.status }` : ( error.name || 'Error' )
			return { name: module.name, ok: false, reason }
		}
	} )

	const failed = outcomes
		.filter( ( outcome ) => !outcome.ok )
		.map( ( outcome ) => ( { name: outcome.name, reason: outcome.reason } ) )
		.sort( ( a, b ) => a.name.localeCompare( b.name ) )

	return { succeeded: outcomes.length - failed.length, failed }
}

/**
 * Builds the shared "DO NOT EDIT" header for a generated file.
 *
 * @param {string} description - One-line description of the file's contents.
 * @returns {string}
 */
function generatedHeader( description ) {
	return [
		'/**',
		' * GENERATED FILE — DO NOT EDIT BY HAND.',
		' *',
		` * ${ description }`,
		' *',
		' * Regenerate with:',
		' *   npm run generate-module-source-of-truth',
		' * then review the git diff. See docs/adr-module-source-of-truth.md.',
		' */',
		''
	].join( '\n' )
}

/**
 * Serializes the fleet registry to a TypeScript module.
 *
 * @param {Array<object>} instances - Instance registry entries.
 * @param {object} meta - Generation metadata.
 * @returns {string} File contents.
 */
function serializeInstances( instances, meta ) {
	return `${ generatedHeader( 'The public, open Wikimedia wiki fleet, keyed by instance id (dbname).' ) }
export interface GeneratedWikiInstance {
	/** Instance id — the wiki's dbname (e.g. \`enwiki\`). */
	id: string
	/** Human-readable name (e.g. \`English Wikipedia\`). */
	displayName: string
	/** Base URL (e.g. \`https://en.wikipedia.org\`). */
	baseUrl: string
	/** Text direction of the wiki's content language. */
	dir: 'ltr' | 'rtl'
	/** Content language code. */
	language: string
	/** Project family / site type (e.g. \`wiki\`, \`wiktionary\`, \`commons\`). */
	family: string
}

export interface GeneratedWikiInstancesMeta {
	generatedAt: string
	source: string
	instanceCount: number
	limited: boolean
}

export const GENERATED_WIKI_INSTANCES_META: GeneratedWikiInstancesMeta = ${
	JSON.stringify( meta, null, '\t' )
}

export const GENERATED_WIKI_INSTANCES: GeneratedWikiInstance[] = ${
	JSON.stringify( instances, null, '\t' )
}
`
}

/**
 * Serializes the module registry to a TypeScript module.
 *
 * @param {Array<object>} modules - Module registry entries.
 * @param {object} meta - Generation + sweep metadata.
 * @returns {string} File contents.
 */
function serializeModules( modules, meta ) {
	return `${ generatedHeader( 'Unique Wikimedia REST API modules, keyed by full discovery name, with the sorted instance ids that expose each. Instance ids reference GENERATED_WIKI_INSTANCES in ./wikiInstances.generated.' ) }
export interface GeneratedModule {
	/** Full discovery module name, including version (e.g. \`site/v1\`). */
	name: string
	/** Base module name without the version segment (e.g. \`site\`). */
	base: string
	/** Version segment of the name (e.g. \`v1\`, \`v0-beta\`), or empty. */
	version: string
	/** Module title from discovery, when provided. */
	title?: string
	/** Instance the representative OpenAPI spec is captured from (ADR §8). */
	specSourceInstance: string
	/** Absolute spec URL on the representative instance. */
	specUrl: string
	/** Stem of the module's spec file under ./module-specs/ (phase 2). */
	specFile: string
	/** Sorted instance ids that expose this module (FKs into GENERATED_WIKI_INSTANCES). */
	instances: string[]
}

export interface GeneratedModulesMeta {
	generatedAt: string
	sitematrixSource: string
	instancesSwept: number
	instancesSucceeded: number
	instancesFailed: number
	/** Instances whose discovery could not be resolved — NOT counted as module-absent. */
	failedInstances: string[]
	moduleCount: number
	limited: boolean
}

export const GENERATED_MODULES_META: GeneratedModulesMeta = ${
	JSON.stringify( meta, null, '\t' )
}

export const GENERATED_MODULES: GeneratedModule[] = ${
	JSON.stringify( modules, null, '\t' )
}
`
}

/**
 * Main entrypoint.
 *
 * @returns {Promise<void>}
 */
async function runPhase1() {
	const generatedAt = new Date().toISOString()

	console.log( `[module-sot] sitematrix: ${ SITEMATRIX_API }` )
	const sitematrixUrl = new URL( SITEMATRIX_API )
	sitematrixUrl.searchParams.set( 'action', 'sitematrix' )
	sitematrixUrl.searchParams.set( 'format', 'json' )
	sitematrixUrl.searchParams.set( 'formatversion', '2' )
	sitematrixUrl.searchParams.set( 'uselang', 'en' )
	const sitematrixResponse = await fetchJson( sitematrixUrl.toString() )

	let instances = buildInstanceRegistry( sitematrixResponse.sitematrix )
	const limited = INSTANCE_LIMIT !== null && INSTANCE_LIMIT < instances.length
	if ( limited ) {
		console.log( `[module-sot] MODULE_SOT_LIMIT=${ INSTANCE_LIMIT } — sweeping a subset` )
		instances = instances.slice( 0, INSTANCE_LIMIT )
	}
	console.log( `[module-sot] ${ instances.length } public, open instances; sweeping discovery (concurrency ${ CONCURRENCY })` )

	const { modulesByInstance, failedInstances } = await sweepDiscovery( instances )
	const modules = buildModuleRegistry( modulesByInstance )

	await fs.mkdir( OUTPUT_DIR, { recursive: true } )

	await fs.writeFile( INSTANCES_OUTPUT, serializeInstances( instances, {
		generatedAt,
		source: SITEMATRIX_API,
		instanceCount: instances.length,
		limited
	} ), 'utf-8' )

	await fs.writeFile( MODULES_OUTPUT, serializeModules( modules, {
		generatedAt,
		sitematrixSource: SITEMATRIX_API,
		instancesSwept: instances.length,
		instancesSucceeded: modulesByInstance.size,
		instancesFailed: failedInstances.length,
		failedInstances,
		moduleCount: modules.length,
		limited
	} ), 'utf-8' )

	console.log( `[module-sot] wrote ${ instances.length } instances → ${ INSTANCES_OUTPUT }` )
	console.log( `[module-sot] wrote ${ modules.length } modules → ${ MODULES_OUTPUT }` )
	if ( failedInstances.length > 0 ) {
		console.warn( `[module-sot] ${ failedInstances.length } instances failed discovery (recorded in metadata, not treated as module-absent)` )
	}
	if ( limited ) {
		console.warn( '[module-sot] LIMITED run — output is a subset, do not commit as the full source of truth' )
	}

	return modules
}

/**
 * Loads the module registry from the committed phase-1 output (for --specs-only).
 *
 * @returns {Promise<Array<object>>} Module registry entries.
 * @throws {Error} When the file is missing or has no modules.
 */
async function loadExistingModules() {
	let generated
	try {
		generated = await import( pathToFileURL( MODULES_OUTPUT ).href )
	} catch {
		throw new Error( `cannot read ${ MODULES_OUTPUT } — run phase 1 first (without --specs-only)` )
	}
	const modules = generated.GENERATED_MODULES
	if ( !Array.isArray( modules ) || modules.length === 0 ) {
		throw new Error( `no modules in ${ MODULES_OUTPUT } — run phase 1 first` )
	}
	console.log( `[module-sot] --specs-only: ${ modules.length } modules from ${ MODULES_OUTPUT }` )
	return modules
}

/**
 * Main entrypoint. Runs phase 1 (fleet sweep) and phase 2 (spec capture) by
 * default; --skip-specs runs phase 1 only, --specs-only runs phase 2 only
 * against the existing module registry (ADR §5).
 *
 * @returns {Promise<void>}
 */
async function main() {
	const args = process.argv.slice( 2 )
	const skipSpecs = args.includes( '--skip-specs' )
	const specsOnly = args.includes( '--specs-only' )
	if ( skipSpecs && specsOnly ) {
		throw new Error( '--skip-specs and --specs-only are mutually exclusive' )
	}

	const modules = specsOnly ? await loadExistingModules() : await runPhase1()

	if ( !skipSpecs ) {
		const { succeeded, failed } = await captureModuleSpecs( modules )
		console.log( `[module-sot] wrote ${ succeeded } specs → ${ SPECS_OUTPUT_DIR }` )
		if ( failed.length > 0 ) {
			console.warn( `[module-sot] ${ failed.length } spec(s) failed: ${
				failed.map( ( entry ) => `${ entry.name } (${ entry.reason })` ).join( ', ' )
			}` )
		}
	}
}

main().catch( ( error ) => {
	console.error( '[module-sot] fatal:', error.message )
	process.exit( 1 )
} )
