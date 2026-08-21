import assert from 'node:assert/strict'
import test from 'node:test'

import { buildLlmsFullCorpus, buildLlmsIndex } from '../app/utils/llmsDocuments.ts'

const SITE = 'https://x.example'

/**
 * Builds a module entry for the builders under test.
 *
 * @param overrides - Fields to override on the default entry.
 * @returns A complete LlmsModuleEntry.
 */
function moduleEntry( overrides = {} ) {
	return {
		moduleName: 'site/v1',
		title: 'Site',
		description: 'Information about Wikimedia project sites.',
		specVersion: '1.0.0',
		instanceTotal: 840,
		pageUrl: `${ SITE }/reference/site/v1`,
		specUrl: `${ SITE }/openapi/site/v1.json`,
		operations: [
			{
				method: 'GET',
				path: '/v1/page/{title}',
				summary: 'Fetch a page.',
				anchor: 'get_v1_page_title'
			}
		],
		...overrides
	}
}

test( 'buildLlmsIndex opens with the conventional title and blockquote', () => {
	const index = buildLlmsIndex( { siteOrigin: SITE, modules: [ moduleEntry() ] } )

	assert.ok( index.startsWith( '# Wikimedia REST API reference\n' ) )
	assert.match( index, /^> /m )
	assert.ok( index.endsWith( '\n' ) )
} )

test( 'buildLlmsIndex counts modules and operations', () => {
	const index = buildLlmsIndex( {
		siteOrigin: SITE,
		modules: [
			moduleEntry(),
			moduleEntry( {
				moduleName: 'readinglists/v0',
				operations: [
					{ method: 'GET', path: '/lists', summary: '', anchor: 'get_lists' },
					{ method: 'GET', path: '/lists/', summary: '', anchor: 'get_lists_' }
				]
			} )
		]
	} )

	assert.match( index, /2 modules, 3 operations/ )
} )

test( 'buildLlmsIndex links both the page and the spec for each module', () => {
	const index = buildLlmsIndex( { siteOrigin: SITE, modules: [ moduleEntry() ] } )

	assert.match( index, /- \[site\/v1\]\(https:\/\/x\.example\/reference\/site\/v1\)/ )
	assert.match( index, /OpenAPI: https:\/\/x\.example\/openapi\/site\/v1\.json/ )
	assert.match( index, /1 operations, 840 wikis/ )
} )

test( 'buildLlmsIndex links the full corpus only when given a path', () => {
	assert.doesNotMatch(
		buildLlmsIndex( { siteOrigin: SITE, modules: [] } ),
		/Full text/
	)
	assert.match(
		buildLlmsIndex( { siteOrigin: SITE, modules: [], fullCorpusPath: '/llms-full.txt' } ),
		/https:\/\/x\.example\/llms-full\.txt/
	)
} )

test( 'buildLlmsFullCorpus emits a resolvable link per operation', () => {
	const corpus = buildLlmsFullCorpus( { siteOrigin: SITE, modules: [ moduleEntry() ] } )

	// An AI citing an operation must produce a link that actually lands on the
	// right heading, which is why the anchor vocabulary is shared.
	assert.match(
		corpus,
		/Link: https:\/\/x\.example\/reference\/site\/v1#get_v1_page_title/
	)
	assert.match( corpus, /#### GET \/v1\/page\/\{title\}/ )
	assert.match( corpus, /Fetch a page\./ )
} )

test( 'buildLlmsFullCorpus carries module metadata', () => {
	const corpus = buildLlmsFullCorpus( { siteOrigin: SITE, modules: [ moduleEntry() ] } )

	assert.match( corpus, /^## site\/v1$/m )
	assert.match( corpus, /- Exposed on: 840 Wikimedia wikis/ )
	assert.match( corpus, /- Spec version: 1\.0\.0/ )
	assert.match( corpus, /Information about Wikimedia project sites\./ )
} )

test( 'buildLlmsFullCorpus lists prose-less operations rather than dropping them', () => {
	// 21 operations across two modules declare neither summary nor description.
	// Omitting them would misrepresent the API as smaller than it is.
	const corpus = buildLlmsFullCorpus( {
		siteOrigin: SITE,
		modules: [ moduleEntry( {
			moduleName: 'readinglists/v0',
			description: '',
			specVersion: '',
			operations: [
				{ method: 'GET', path: '/lists', summary: '', anchor: 'get_lists' },
				{ method: 'GET', path: '/lists/', summary: '', anchor: 'get_lists_' }
			]
		} ) ]
	} )

	assert.match( corpus, /#### GET \/lists$/m )
	assert.match( corpus, /#### GET \/lists\/$/m )
	// The two trailing-slash variants must remain distinguishable here too.
	assert.match( corpus, /#get_lists$/m )
	assert.match( corpus, /#get_lists_$/m )
} )

test( 'buildLlmsFullCorpus omits absent optional metadata', () => {
	const corpus = buildLlmsFullCorpus( {
		siteOrigin: SITE,
		modules: [ moduleEntry( { description: '', specVersion: '' } ) ]
	} )

	assert.doesNotMatch( corpus, /Spec version/ )
} )

test( 'buildLlmsFullCorpus states when a module has no operations', () => {
	const corpus = buildLlmsFullCorpus( {
		siteOrigin: SITE,
		modules: [ moduleEntry( { operations: [] } ) ]
	} )

	assert.match( corpus, /This module declares no operations\./ )
} )
