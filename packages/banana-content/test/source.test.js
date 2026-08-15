/**
 * Source structure: block forms, definitions-only blocks, keys, and frontmatter.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { build, parse, messages, MARKER, KEYS } from './helpers.js'
import { parseSource } from '../src/core/source.js'
import { buildCatalog } from '../src/core/catalog.js'
import { markdown } from '../src/formats/markdown.js'

test( 'a definitions-only block renders nothing and absorbs one blank line', () => {
	const { body } = build( [
		':message[Intro]{#intro qqq="Intro."}',
		'',
		':::messages',
		':message[Card]{#card qqq="Card title."}',
		':::',
		'',
		'::card{title=":message{#card}"}',
		''
	].join( '\n' ) )
	// Without absorbing the blank line the stripped block leaves a doubled gap.
	assert.equal( body, 'Intro\n\n::card{title="Card"}\n' )
} )

test( 'a block definition captures multiple paragraphs as one message', () => {
	const { body, catalog } = build( [
		'::message{#intro qqq="Two paragraphs."}',
		'First paragraph.',
		'',
		'Second paragraph.',
		'::',
		''
	].join( '\n' ) )
	assert.equal(
		catalog.messages.get( 'content-page-intro' ),
		'First paragraph.\n\nSecond paragraph.'
	)
	assert.equal( body, 'First paragraph.\n\nSecond paragraph.\n' )
} )

test( 'parameters on a definition inside a definitions block are an error', () => {
	const source = parse( [
		':::messages',
		':message[Read more on $1]{#k p1="Meta" qqq="Q."}',
		':::',
		''
	].join( '\n' ) )
	assert.match(
		messages( source.diagnostics, 'error' ).join( '\n' ),
		/never renders in place, so it cannot carry parameter values/
	)
} )

test( 'a reference inside a definitions block is an error', () => {
	const source = parse( [ ':::messages', ':message{#content-shared-x}', ':::', '' ].join( '\n' ) )
	assert.match(
		messages( source.diagnostics, 'error' ).join( '\n' ),
		/may only contain definitions/
	)
} )

test( 'an unterminated definitions block is an error', () => {
	const source = parse( [ ':::messages', ':message[A]{#k qqq="Q."}', '' ].join( '\n' ) )
	assert.match( messages( source.diagnostics, 'error' ).join( '\n' ), /unterminated/ )
} )

test( 'local keys are namespaced from the source path', () => {
	const source = parse( ':message[Text]{#intro qqq="Q."}\n', { path: 'experiments/open-data.md' } )
	assert.equal( source.markers[ 0 ].key, 'content-experiments-open-data-intro' )
} )

test( 'a prefixed key is used verbatim as a cross-file reference', () => {
	const source = parse( ':message{#content-shared-read-more}\n', { path: 'experiments/x.md' } )
	assert.equal( source.markers[ 0 ].key, 'content-shared-read-more' )
} )

test( 'a key failing the pattern is an error', () => {
	const source = parse( ':message[Text]{#Bad_Key qqq="Q."}\n' )
	assert.match( messages( source.diagnostics, 'error' ).join( '\n' ), /does not match/ )
} )

test( 'a definitions-only file requires fully-qualified keys', () => {
	const source = parse( ':::messages\n:message[Text]{#local qqq="Q."}\n:::\n', {
		path: '_shared/common.md',
		definitionsOnly: true
	} )
	const errors = messages( source.diagnostics, 'error' ).join( '\n' )
	assert.match( errors, /must be a fully-qualified key/ )
	// The path-derived pattern error would be noise on top of the real problem.
	assert.doesNotMatch( errors, /does not match/ )
} )

test( 'frontmatter is separated from the body and preserved', () => {
	const source = parse( '---\nstatus: mockup\n---\n\n# :message[Title]{#t qqq="Q."}\n' )
	assert.deepEqual( source.metadata, { status: 'mockup' } )
	assert.equal( source.markers[ 0 ].key, 'content-page-t' )
} )

test( 'a key defined twice across files is an error', () => {
	const options = { format: markdown(), marker: MARKER, keys: KEYS, definitionsOnly: true }
	const a = parseSource( ':::messages\n:message[A]{#content-shared-x qqq="Q."}\n:::\n', {
		path: '_a.md', ...options
	} )
	const b = parseSource( ':::messages\n:message[B]{#content-shared-x qqq="Q."}\n:::\n', {
		path: '_b.md', ...options
	} )
	const catalog = buildCatalog( [ a, b ] )
	assert.match(
		messages( catalog.diagnostics, 'error' ).join( '\n' ),
		/is already defined at/
	)
} )

test( 'a reference to an undefined key is an error', () => {
	const { catalog } = build( ':message{#content-shared-missing}\n' )
	assert.match(
		messages( catalog.diagnostics, 'error' ).join( '\n' ),
		/reference to undefined key/
	)
} )

test( 'a definition without qqq is a warning, not an error', () => {
	const { catalog } = build( ':message[Text]{#k}\n' )
	assert.match( messages( catalog.diagnostics, 'warning' ).join( '\n' ), /no qqq documentation/ )
	assert.equal( catalog.diagnostics.hasErrors, false )
} )

test( 'markup used in attribute position is a warning', () => {
	const { catalog } = build(
		'::card{title=":message[See the [guide](/g) page]{#t qqq=\'T.\'}"}\n'
	)
	assert.match( messages( catalog.diagnostics, 'warning' ).join( '\n' ), /render inert/ )
} )
