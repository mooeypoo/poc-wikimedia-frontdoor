import assert from 'node:assert/strict'
import test from 'node:test'

// Node's type stripping loads the scorer directly, so these exercise the real
// MiniSearch configuration rather than a re-declared copy of it — same reason
// tests/endpointSearchIndex.test.mjs imports the generated index itself.
import {
	buildEndpointSearcher,
	buildEndpointSnippet,
	endpointResultTitle,
	searchEndpoints,
	tokenizeEndpointText
} from '../app/utils/endpointSearch.ts'
import { ENDPOINT_SEARCH_SNIPPET_MAX_LENGTH } from '../config/endpointSearch.ts'

/**
 * Builds an endpoint record carrying only the fields under test.
 *
 * @param overrides - Fields to set on the record.
 * @returns A record shaped like one from the generated index.
 */
function record( overrides ) {
	return {
		module: 'site/v1',
		moduleTitle: 'Site API',
		instance: 'enwiki',
		method: 'GET',
		path: '/v1/thing',
		deepLink: `/explorer/direct/enwiki/site/v1#GET/${ overrides.path ?? 'thing' }`,
		...overrides
	}
}

/**
 * Searches a one-off index built from the given records.
 *
 * @param records - Records to index.
 * @param query   - Raw query.
 * @param limit   - Optional result cap.
 * @returns Search results.
 */
function search( records, query, limit ) {
	return searchEndpoints( buildEndpointSearcher( records ), query, limit )
}

test( 'tokenizeEndpointText splits an OpenAPI path into typed words', () => {
	assert.deepEqual(
		tokenizeEndpointText( '/v1/page/{title}/bare' ),
		[ 'v1', 'page', 'title', 'bare' ]
	)
} )

test( 'tokenizeEndpointText keeps accented letters whole and drops symbols', () => {
	assert.deepEqual( tokenizeEndpointText( 'résumé a+b' ), [ 'résumé', 'a', 'b' ] )
	assert.deepEqual( tokenizeEndpointText( undefined ), [] )
	assert.deepEqual( tokenizeEndpointText( '///' ), [] )
} )

test( 'endpointResultTitle falls back past a missing summary', () => {
	assert.equal( endpointResultTitle( record( { summary: 'Get a page' } ) ), 'Get a page' )
	assert.equal( endpointResultTitle( record( { operationId: 'getPage' } ) ), 'getPage' )
	assert.equal( endpointResultTitle( record( { path: '/v1/only' } ) ), '/v1/only' )
} )

test( 'every query token must match', () => {
	const records = [
		record( { path: '/v1/lists', summary: 'Get reading lists' } ),
		record( { path: '/v1/shopping', summary: 'Get shopping lists' } )
	]

	const both = search( records, 'reading list' )
	assert.equal( both.length, 1 )
	assert.equal( both[ 0 ].record.path, '/v1/lists' )

	// "list" alone matches both, so the AND above is what narrowed it.
	assert.equal( search( records, 'list' ).length, 2 )
} )

test( 'a summary match outranks a description-only match', () => {
	const results = search( [
		record( { path: '/v1/buried', description: 'Somewhere deep in prose: pageviews.' } ),
		record( { path: '/v1/named', summary: 'Get pageviews' } )
	], 'pageviews' )

	assert.deepEqual( results.map( ( r ) => r.record.path ), [ '/v1/named', '/v1/buried' ] )
} )

test( 'path and operationId find an operation whose spec omits a summary', () => {
	const records = [ record( { path: '/v1/page/{title}/bare', operationId: 'getBareTitle' } ) ]

	assert.equal( search( records, 'bare' ).length, 1 )
	assert.equal( search( records, 'getBareTitle' ).length, 1 )
} )

test( 'a prefix matches but ranks below the exact term', () => {
	const results = search( [
		record( { path: '/v1/plural', summary: 'Get lists' } ),
		record( { path: '/v1/exact', summary: 'Get list' } )
	], 'list' )

	assert.deepEqual( results.map( ( r ) => r.record.path ), [ '/v1/exact', '/v1/plural' ] )
} )

test( 'a typo still finds the endpoint', () => {
	const records = [ record( { path: '/v1/pageviews', summary: 'Get pageviews' } ) ]

	assert.equal( search( records, 'pagevies' ).length, 1 )
} )

test( 'a short token gets prefix matching but not fuzziness', () => {
	// MiniSearch turns the 0.2 fraction into round( length * 0.2 ), which would
	// otherwise hand a full edit to a four-character token.
	const records = [ record( { path: '/v1/pages', summary: 'List pages' } ) ]

	// Prefix, which is what a reader typing a short token actually wants.
	assert.equal( search( records, 'page' ).length, 1 )
	// One edit away from "page", and not the endpoint anyone meant.
	assert.deepEqual( search( records, 'cage' ), [] )
	assert.deepEqual( search( records, 'gage' ), [] )
} )

test( 'internal-gated endpoints never appear', () => {
	const records = [
		record( { path: '/v1/open', summary: 'Get widgets' } ),
		record( { path: '/v1/hidden', summary: 'Get widgets', gate: 'internal' } ),
		record( { path: '/v1/beta', summary: 'Get widgets', gate: 'beta' } )
	]

	const paths = search( records, 'widgets' ).map( ( r ) => r.record.path )
	assert.deepEqual( paths.sort(), [ '/v1/beta', '/v1/open' ] )
} )

test( 'a deprecated endpoint ranks below its live equivalent', () => {
	const results = search( [
		record( { path: '/v1/old', summary: 'Get pageviews', isDeprecated: true } ),
		record( { path: '/v1/new', summary: 'Get pageviews' } )
	], 'pageviews' )

	assert.deepEqual( results.map( ( r ) => r.record.path ), [ '/v1/new', '/v1/old' ] )
} )

test( 'the result limit caps the group', () => {
	const records = Array.from( { length: 10 }, ( _unused, index ) => record( {
		path: `/v1/thing/${ index }`,
		summary: 'Get widgets'
	} ) )

	assert.equal( search( records, 'widgets', 4 ).length, 4 )
} )

test( 'identical-scoring records order on module then path then method', () => {
	// The trailing-slash variants upstream declares score exactly equal.
	const records = [
		record( { module: 'readinglists/v0', path: '/lists/', summary: 'Get reading lists' } ),
		record( { module: 'readinglists/v0', path: '/lists', summary: 'Get reading lists' } )
	]

	const forward = search( records, 'reading lists' ).map( ( r ) => r.record.path )
	const reversed = search( [ ...records ].reverse(), 'reading lists' ).map( ( r ) => r.record.path )

	assert.deepEqual( forward, [ '/lists', '/lists/' ] )
	assert.deepEqual( reversed, forward )
} )

test( 'too short or wordless queries return nothing', () => {
	const records = [ record( { path: '/v1/lists', summary: 'Get reading lists' } ) ]

	assert.deepEqual( search( records, 'a' ), [] )
	assert.deepEqual( search( records, '  ' ), [] )
	assert.deepEqual( search( records, '///' ), [] )
	assert.deepEqual( searchEndpoints( null, 'reading lists' ), [] )
} )

test( 'the snippet highlights the matched term in the description', () => {
	const snippet = buildEndpointSnippet(
		record( { description: 'Returns the pageviews for an article.' } ),
		[ 'pageviews' ]
	)

	assert.equal( snippet, 'Returns the <mark>pageviews</mark> for an article.' )
} )

test( 'the snippet highlights the whole word a prefix term matched', () => {
	const snippet = buildEndpointSnippet(
		record( { description: 'Reading lists for a user.' } ),
		[ 'list' ]
	)

	assert.equal( snippet, 'Reading <mark>lists</mark> for a user.' )
} )

test( 'the snippet escapes the upstream description', () => {
	const snippet = buildEndpointSnippet(
		record( { description: '<script>alert("x")</script> & pageviews' } ),
		[ 'pageviews' ]
	)

	assert.ok( !snippet.includes( '<script>' ) )
	assert.ok( snippet.includes( '&lt;script&gt;' ) )
	assert.ok( snippet.includes( '&amp;' ) )
	assert.ok( snippet.includes( '<mark>pageviews</mark>' ) )
} )

test( 'the snippet escapes a matched term that carries markup characters', () => {
	const snippet = buildEndpointSnippet(
		record( { description: 'Handles a<b comparison.' } ),
		[ 'a<b' ]
	)

	assert.ok( !snippet.includes( '<b' ) )
	assert.ok( snippet.includes( '&lt;' ) )
} )

test( 'the snippet windows a long description around the match', () => {
	const filler = 'padding words to push the match well past the window. '.repeat( 8 )
	const snippet = buildEndpointSnippet(
		record( { description: `${ filler }the pageviews endpoint. ${ filler }` } ),
		[ 'pageviews' ]
	)

	assert.ok( snippet.includes( '<mark>pageviews</mark>' ) )
	assert.ok( snippet.startsWith( '...' ) )
	assert.ok( snippet.endsWith( '...' ) )
	// The markup adds the mark tags and both ellipses on top of the text window.
	assert.ok( snippet.length < ENDPOINT_SEARCH_SNIPPET_MAX_LENGTH + 40 )
} )

test( 'the snippet keeps the module title when there is no description', () => {
	assert.equal(
		buildEndpointSnippet( record( { moduleTitle: 'Site API' } ), [ 'site' ] ),
		'<mark>Site</mark> API'
	)
} )

test( 'a search result carries its own snippet', () => {
	const [ result ] = search( [ record( {
		path: '/v1/pageviews',
		summary: 'Get pageviews',
		description: 'Returns the pageviews for an article.'
	} ) ], 'pageviews' )

	assert.equal( result.snippet, 'Returns the <mark>pageviews</mark> for an article.' )
} )
