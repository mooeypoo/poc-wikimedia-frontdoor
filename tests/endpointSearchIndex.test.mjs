import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// The generated files are self-contained (no relative imports), so node --test
// can load them directly — see the note in tests/moduleSourceOfTruth.test.mjs.
// The two policy inputs the generator uses live in self-contained leaf modules
// for the same reason, so this test exercises the real policy, not a copy.
import {
	GENERATED_ENDPOINT_SEARCH_INDEX,
	GENERATED_ENDPOINT_SEARCH_INDEX_META
} from '../config/generated/endpointSearchIndex.generated.ts'
import { GENERATED_MODULES } from '../config/generated/modules.generated.ts'
import { GENERATED_WIKI_INSTANCES } from '../config/generated/wikiInstances.generated.ts'
import { SCALAR_DOCUMENT_SLUG } from '../config/scalarDocument.ts'
import { resolvePreferredModuleInstance } from '../config/explorerInstancePolicy.ts'
import { isExplorerBetaOptInModule, isExplorerInternalOptInModule } from '../config/explorerOptIn.ts'
import { parseExplorerDeepLink, buildExplorerDirectPath } from '../app/utils/explorerRoute.ts'
import {
	buildEndpointSearchEntries,
	searchEndpointIndex,
	endpointResultTitle,
	tokenizeEndpointText
} from '../app/utils/endpointSearch.ts'
import { buildEndpointSearchIndex, buildDescriptionExcerpt } from '../scripts/lib/endpointSearchIndex.mjs'

const projectRoot = dirname( dirname( fileURLToPath( import.meta.url ) ) )
const SPECS_DIR = join( projectRoot, 'config', 'generated', 'module-specs' )

/**
 * Re-runs the generator against the committed specs, exactly as phase 3 does.
 *
 * @returns {{ records: object[], modulesWithoutSpec: string[] }} Freshly built index.
 */
function regenerateIndex() {
	return buildEndpointSearchIndex( {
		modules: GENERATED_MODULES,
		documentSlug: SCALAR_DOCUMENT_SLUG,
		resolveInstance: resolvePreferredModuleInstance,
		buildModulePath: buildExplorerDirectPath,
		resolveGate: ( moduleName ) => {
			if ( isExplorerInternalOptInModule( moduleName ) ) {
				return 'internal'
			}
			return isExplorerBetaOptInModule( moduleName ) ? 'beta' : null
		},
		readSpec: ( wikiModule ) => {
			try {
				return JSON.parse(
					readFileSync( join( SPECS_DIR, `${ wikiModule.specFile }.generated.json` ), 'utf-8' )
				)
			} catch {
				return null
			}
		}
	} )
}

// ---------------------------------------------------------------------------
// Drift guard
// ---------------------------------------------------------------------------

// The operation hash in every deepLink is produced by Scalar's own navigation-id
// builders, because Scalar owns the explorer's URL hash and reads it on load
// (docs/adr-explorer-deep-linking.md §2, §10). That buys correctness today at
// the cost of a dependency on a third-party format: if a Scalar upgrade changes
// how it spells operation ids, every committed deep link silently stops focusing
// its endpoint. This test converts that silent breakage into a hard failure.
test( 'committed index matches a fresh build from the committed specs', () => {
	const { records } = regenerateIndex()

	assert.deepEqual(
		records,
		GENERATED_ENDPOINT_SEARCH_INDEX,
		'endpoint index is stale or Scalar\'s navigation-id format changed — ' +
		'run `npm run generate-module-source-of-truth -- --index-only` and review the diff'
	)
} )

test( 'index metadata matches the committed records', () => {
	const { modulesWithoutSpec } = regenerateIndex()

	assert.equal( GENERATED_ENDPOINT_SEARCH_INDEX_META.endpointCount, GENERATED_ENDPOINT_SEARCH_INDEX.length )
	assert.equal( GENERATED_ENDPOINT_SEARCH_INDEX_META.scalarDocumentSlug, SCALAR_DOCUMENT_SLUG )
	assert.deepEqual( GENERATED_ENDPOINT_SEARCH_INDEX_META.modulesWithoutSpec, modulesWithoutSpec )
} )

// ---------------------------------------------------------------------------
// Deep-link correctness
// ---------------------------------------------------------------------------

test( 'every deep link parses back to its own instance and module', () => {
	const instanceIds = new Set( GENERATED_WIKI_INSTANCES.map( ( instance ) => instance.id ) )

	for ( const record of GENERATED_ENDPOINT_SEARCH_INDEX ) {
		const [ path ] = record.deepLink.split( '#' )
		const parsed = parseExplorerDeepLink( path )

		assert.equal( parsed.mode, 'community', `${ record.deepLink } is not a community link` )
		assert.equal( parsed.form, 'direct', `${ record.deepLink } is not in the direct form` )
		assert.equal( parsed.instanceId, record.instance, `${ record.deepLink } instance mismatch` )
		assert.equal( parsed.moduleName, record.module, `${ record.deepLink } module mismatch` )
		assert.ok( instanceIds.has( record.instance ), `${ record.instance } is not a known instance` )
	}
} )

test( 'every deep link carries a non-empty operation hash', () => {
	for ( const record of GENERATED_ENDPOINT_SEARCH_INDEX ) {
		const hashIndex = record.deepLink.indexOf( '#' )
		assert.ok( hashIndex > 0, `${ record.deepLink } has no operation hash` )
		assert.ok( record.deepLink.length > hashIndex + 1, `${ record.deepLink } has an empty hash` )
	}
} )

test( 'deep links are unique per operation', () => {
	const deepLinks = GENERATED_ENDPOINT_SEARCH_INDEX.map( ( record ) => record.deepLink )
	const duplicates = deepLinks.filter( ( link, index ) => deepLinks.indexOf( link ) !== index )

	assert.deepEqual( [ ...new Set( duplicates ) ], [], 'two operations resolve to the same deep link' )
} )

test( 'the landing instance actually exposes the module', () => {
	for ( const record of GENERATED_ENDPOINT_SEARCH_INDEX ) {
		const wikiModule = GENERATED_MODULES.find( ( candidate ) => candidate.name === record.module )
		assert.ok( wikiModule, `${ record.module } is not in the module registry` )
		assert.ok(
			wikiModule.instances.includes( record.instance ),
			`${ record.module } is not exposed by ${ record.instance }`
		)
	}
} )

test( 'trailing-slash path variants stay distinct', () => {
	// readinglists/v0 declares both `/lists` and `/lists/`; Scalar preserves the
	// trailing slash in the hash, and a naive split-on-slash would collapse them.
	const listEndpoints = GENERATED_ENDPOINT_SEARCH_INDEX.filter(
		( record ) => record.module === 'readinglists/v0' && record.method === 'GET' &&
			( record.path === '/lists' || record.path === '/lists/' )
	)

	assert.equal( listEndpoints.length, 2, 'expected both /lists and /lists/ to be indexed' )
	assert.notEqual( listEndpoints[ 0 ].deepLink, listEndpoints[ 1 ].deepLink )
} )

test( 'internal-gated modules are marked so search can exclude them', () => {
	for ( const record of GENERATED_ENDPOINT_SEARCH_INDEX ) {
		if ( isExplorerInternalOptInModule( record.module ) ) {
			assert.equal( record.gate, 'internal', `${ record.module } is not marked internal` )
		}
	}
} )

// ---------------------------------------------------------------------------
// Search relevance
// ---------------------------------------------------------------------------

const searchEntries = buildEndpointSearchEntries( GENERATED_ENDPOINT_SEARCH_INDEX )

test( 'gated modules never appear in results', () => {
	const gatedModules = GENERATED_ENDPOINT_SEARCH_INDEX
		.filter( ( record ) => record.gate === 'internal' )
		.map( ( record ) => record.module )

	// Query each gated module by its own title — the strongest possible match.
	for ( const moduleName of new Set( gatedModules ) ) {
		const record = GENERATED_ENDPOINT_SEARCH_INDEX.find( ( entry ) => entry.module === moduleName )
		const results = searchEndpointIndex( searchEntries, record.moduleTitle, 50 )
		assert.ok(
			results.every( ( result ) => result.record.module !== moduleName ),
			`${ moduleName } is internal-gated but reachable from search`
		)
	}
} )

test( 'a summary-less endpoint is still findable by its path', () => {
	// The point of indexing path segments: operations whose upstream spec omits
	// both summary and description would otherwise be invisible.
	const pathOnlyRecords = GENERATED_ENDPOINT_SEARCH_INDEX.filter(
		( record ) => !record.summary && !record.description && record.gate !== 'internal'
	)

	for ( const record of pathOnlyRecords ) {
		const pathToken = tokenizeEndpointText( record.path ).at( -1 )
		if ( !pathToken ) {
			continue
		}
		const results = searchEndpointIndex( searchEntries, pathToken, 100 )
		assert.ok(
			results.some( ( result ) => result.record.deepLink === record.deepLink ),
			`${ record.method } ${ record.path } is not findable by "${ pathToken }"`
		)
	}
} )

test( 'all query tokens must match (AND semantics)', () => {
	const results = searchEndpointIndex( searchEntries, 'reading zzzznotaword', 50 )
	assert.deepEqual( results, [] )
} )

test( 'a multi-word query outranks a single-word overlap', () => {
	const results = searchEndpointIndex( searchEntries, 'reading list', 5 )

	assert.ok( results.length > 0, 'expected reading list endpoints' )
	assert.equal( results[ 0 ].record.module, 'readinglists/v0' )
} )

test( 'queries shorter than the minimum return nothing', () => {
	assert.deepEqual( searchEndpointIndex( searchEntries, 'a', 5 ), [] )
	assert.deepEqual( searchEndpointIndex( searchEntries, '   ', 5 ), [] )
} )

test( 'a query of only separators returns nothing rather than matching everything', () => {
	assert.deepEqual( searchEndpointIndex( searchEntries, '///', 5 ), [] )
} )

test( 'results respect the requested limit and are ordered by score', () => {
	const results = searchEndpointIndex( searchEntries, 'page', 3 )

	assert.ok( results.length <= 3 )
	for ( let index = 1; index < results.length; index++ ) {
		assert.ok( results[ index - 1 ].score >= results[ index ].score, 'results are not score-ordered' )
	}
} )

test( 'ranking is deterministic for a given query', () => {
	const first = searchEndpointIndex( searchEntries, 'revision', 10 )
	const second = searchEndpointIndex( buildEndpointSearchEntries( GENERATED_ENDPOINT_SEARCH_INDEX ), 'revision', 10 )

	assert.deepEqual(
		first.map( ( result ) => result.record.deepLink ),
		second.map( ( result ) => result.record.deepLink )
	)
} )

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

test( 'every record produces a non-empty display title', () => {
	for ( const record of GENERATED_ENDPOINT_SEARCH_INDEX ) {
		assert.ok( endpointResultTitle( record ).trim() !== '', `${ record.deepLink } has no title` )
	}
} )

test( 'description excerpts are plain text and bounded', () => {
	const excerpt = buildDescriptionExcerpt(
		'## Heading\n\nSee [the docs](https://example.org) for `details`.\n\n```js\ncode()\n```\n'
	)

	assert.equal( excerpt, 'Heading See the docs for details.' )

	for ( const record of GENERATED_ENDPOINT_SEARCH_INDEX ) {
		if ( record.description === undefined ) {
			continue
		}
		assert.ok( record.description.length <= 200, `${ record.deepLink } excerpt is too long` )
		assert.ok( !record.description.includes( '\n' ), `${ record.deepLink } excerpt has a newline` )
	}
} )
