import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

import {
	buildLegacyOperationAnchor,
	buildOperationAnchor,
	findDuplicateOperationAnchors,
	findOperationByAnchor,
	operationAnchorFromHash
} from '../app/utils/explorerOperationAnchor.ts'

const MODULE_SPECS_DIRECTORY = 'config/generated/module-specs'
const HTTP_METHODS = new Set( [
	'get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace'
] )

/**
 * Reads every committed module spec and returns its operations.
 *
 * @returns Map of module spec stem to its `{ method, path }` operations.
 */
function readCommittedModuleOperations() {
	const operationsByModule = new Map()

	for ( const filename of readdirSync( MODULE_SPECS_DIRECTORY ).sort() ) {
		if ( !filename.endsWith( '.generated.json' ) ) {
			continue
		}
		const spec = JSON.parse(
			readFileSync( join( MODULE_SPECS_DIRECTORY, filename ), 'utf8' )
		)
		const operations = []
		for ( const [ path, pathItem ] of Object.entries( spec.paths ?? {} ) ) {
			for ( const method of Object.keys( pathItem ) ) {
				if ( HTTP_METHODS.has( method ) ) {
					operations.push( { method, path } )
				}
			}
		}
		operationsByModule.set( filename.replace( '.generated.json', '' ), operations )
	}

	return operationsByModule
}

test( 'buildOperationAnchor slugs method and path into a URL-safe fragment', () => {
	assert.equal( buildOperationAnchor( 'GET', '/v1/page/{title}' ), 'get_v1_page_title' )
	assert.equal( buildOperationAnchor( 'post', '/v1/page' ), 'post_v1_page' )
	// The root path contributes nothing, so the method stands alone.
	assert.equal( buildOperationAnchor( 'GET', '/' ), 'get' )
	assert.equal( buildOperationAnchor( '  GeT  ', '/v1/page' ), 'get_v1_page' )
} )

test( 'buildOperationAnchor distinguishes a trailing slash', () => {
	// readinglists/v0 really exposes both of these as separate operations.
	assert.equal( buildOperationAnchor( 'GET', '/lists' ), 'get_lists' )
	assert.equal( buildOperationAnchor( 'GET', '/lists/' ), 'get_lists_' )
	assert.notEqual(
		buildOperationAnchor( 'GET', '/lists' ),
		buildOperationAnchor( 'GET', '/lists/' )
	)

	assert.equal(
		buildOperationAnchor( 'POST', '/lists/{id}/entries' ),
		'post_lists_id_entries'
	)
	assert.equal(
		buildOperationAnchor( 'POST', '/lists/{id}/entries/' ),
		'post_lists_id_entries_'
	)
} )

test( 'buildOperationAnchor does not preserve a trailing brace', () => {
	// A closing brace ends a parameter inside the final segment; it does not add
	// an empty segment. Preserving it would have churned most existing anchors.
	assert.equal( buildOperationAnchor( 'GET', '/v1/page/{title}' ), 'get_v1_page_title' )
	assert.equal( buildOperationAnchor( 'GET', '/lists/{id}/entries' ), 'get_lists_id_entries' )
} )

test( 'anchors are unchanged from the legacy format except for trailing slashes', () => {
	for ( const operations of readCommittedModuleOperations().values() ) {
		for ( const operation of operations ) {
			const current = buildOperationAnchor( operation.method, operation.path )
			const legacy = buildLegacyOperationAnchor( operation.method, operation.path )
			const expectedToDiffer = operation.path.length > 1 && operation.path.endsWith( '/' )

			if ( expectedToDiffer ) {
				assert.notEqual(
					current,
					legacy,
					`expected a new anchor for ${ operation.method } ${ operation.path }`
				)
			} else {
				assert.equal(
					current,
					legacy,
					`anchor churned for ${ operation.method } ${ operation.path }`
				)
			}
		}
	}
} )

test( 'every committed module has collision-free anchors', () => {
	for ( const [ moduleName, operations ] of readCommittedModuleOperations() ) {
		assert.deepEqual(
			findDuplicateOperationAnchors( operations ),
			[],
			`colliding anchors in ${ moduleName }`
		)
	}
} )

test( 'the legacy format collides on real committed data', () => {
	// Guards the reason the format changed: if this ever stops colliding, the
	// trailing-slash rule and its legacy fallback can be reconsidered.
	const operations = readCommittedModuleOperations().get( 'readinglists-v0' )
	assert.ok( operations, 'readinglists-v0 spec is committed' )

	const legacyAnchors = operations.map(
		( operation ) => buildLegacyOperationAnchor( operation.method, operation.path )
	)
	assert.equal(
		legacyAnchors.length - new Set( legacyAnchors ).size,
		4,
		'expected exactly the four historical collisions'
	)
} )

test( 'findDuplicateOperationAnchors reports colliding claimants', () => {
	// `{id}` and a literal `id` segment both collapse to `_id_` — the residual
	// ambiguity the assertion exists to catch.
	const duplicates = findDuplicateOperationAnchors( [
		{ method: 'get', path: '/lists/{id}/x' },
		{ method: 'get', path: '/lists/id/x' },
		{ method: 'get', path: '/unique' }
	] )

	assert.equal( duplicates.length, 1 )
	assert.equal( duplicates[ 0 ].anchor, 'get_lists_id_x' )
	assert.deepEqual( duplicates[ 0 ].operations, [ 'GET /lists/{id}/x', 'GET /lists/id/x' ] )
} )

test( 'findOperationByAnchor round-trips every committed operation', () => {
	for ( const [ moduleName, operations ] of readCommittedModuleOperations() ) {
		for ( const operation of operations ) {
			const anchor = buildOperationAnchor( operation.method, operation.path )
			const resolved = findOperationByAnchor( operations, anchor )

			assert.ok( resolved, `${ anchor } unresolved in ${ moduleName }` )
			assert.equal( resolved.method, operation.method )
			assert.equal( resolved.path, operation.path )
		}
	}
} )

test( 'findOperationByAnchor still resolves legacy shared links', () => {
	const operations = [
		{ method: 'get', path: '/lists' },
		{ method: 'get', path: '/lists/' }
	]

	// Legacy `get_lists` was ambiguous; it must still resolve rather than 404.
	assert.equal( findOperationByAnchor( operations, 'get_lists' ).path, '/lists' )
	// The current format is unambiguous and must win outright.
	assert.equal( findOperationByAnchor( operations, 'get_lists_' ).path, '/lists/' )
} )

test( 'findOperationByAnchor prefers the current format over the legacy pass', () => {
	// `/lists/` legacy-slugs to `get_lists`, which `/lists` also claims in the
	// current format. The current-format match must win.
	const operations = [
		{ method: 'get', path: '/lists/' },
		{ method: 'get', path: '/lists' }
	]

	assert.equal( findOperationByAnchor( operations, 'get_lists' ).path, '/lists' )
} )

test( 'findOperationByAnchor rejects empty and unmatched anchors', () => {
	const operations = [ { method: 'get', path: '/lists' } ]

	assert.equal( findOperationByAnchor( operations, '' ), null )
	assert.equal( findOperationByAnchor( operations, '   ' ), null )
	assert.equal( findOperationByAnchor( operations, 'get_nothing' ), null )
} )

test( 'operationAnchorFromHash strips the leading hash', () => {
	assert.equal( operationAnchorFromHash( '#get_v1_page_title' ), 'get_v1_page_title' )
	assert.equal( operationAnchorFromHash( 'get_v1_page_title' ), 'get_v1_page_title' )
	assert.equal( operationAnchorFromHash( '' ), '' )
	assert.equal( operationAnchorFromHash( '#' ), '' )
} )
