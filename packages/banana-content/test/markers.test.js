/**
 * Tokenizer behaviour.
 *
 * Every case here was found by hand while building the frontdoor generator, so
 * these are regressions rather than hypotheticals.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { build, parse, messages } from './helpers.js'

test( 'host-format syntax trailing a marker is not claimed', () => {
	// The `{#commercial}` is an MDC heading id, not part of the marker: a brace is
	// ours only when it sits directly against the marker or its text span.
	const { body } = build(
		'## :message[High-volume access]{#h qqq="H2."} {#commercial}\n'
	)
	assert.equal( body.trim(), '## High-volume access {#commercial}' )
} )

test( 'balanced brackets let Markdown links pass through unescaped', () => {
	const { body, catalog } = build(
		':message[See the [dumps guide](/dumps) page]{#intro qqq="Intro."}\n'
	)
	assert.equal( body.trim(), 'See the [dumps guide](/dumps) page' )
	assert.equal(
		catalog.messages.get( 'content-page-intro' ),
		'See the [dumps guide](/dumps) page'
	)
} )

test( 'an unbalanced bracket is escaped, and stored unescaped', () => {
	const { body, catalog } = build( ':message[Close it \\] here]{#k qqq="Q."}\n' )
	assert.equal( catalog.messages.get( 'content-page-k' ), 'Close it ] here' )
	assert.equal( body.trim(), 'Close it ] here' )
} )

test( 'a backslash-escaped marker is literal text', () => {
	const { body } = build( 'Write \\:message[Text]{#k} to mark a string.\n' )
	assert.equal( body.trim(), 'Write :message[Text]{#k} to mark a string.' )
} )

test( 'a definition may live inside an attribute value', () => {
	const { body, catalog } = build(
		'::card{url="/x" title=":message[Lift Wing API]{#t qqq=\'Card title.\'}"}\n'
	)
	assert.equal( body.trim(), '::card{url="/x" title="Lift Wing API"}' )
	assert.equal( catalog.messages.get( 'content-page-t' ), 'Lift Wing API' )
	assert.equal( catalog.documentation.get( 'content-page-t' ), 'Card title.' )
} )

test( 'text quotes are free inside brackets, and escaped on the way out', () => {
	// The text span is bracket-delimited, so quotes in it never need escaping —
	// but landing in a double-quoted attribute they must become entities.
	const { body, catalog } = build(
		'::card{title=":message[A project\'s \"best\" tools]{#t qqq=\'T.\'}"}\n'
	)
	assert.equal( catalog.messages.get( 'content-page-t' ), 'A project\'s "best" tools' )
	assert.match( body, /title="A project's &quot;best&quot; tools"/ )
} )

test( 'an attribute value may escape its own delimiter', () => {
	const { catalog } = build(
		':message[Streams]{#t qqq=\'It\\\'s a feed; the \\"Dumps\\" service.\'}\n'
	)
	assert.equal(
		catalog.documentation.get( 'content-page-t' ),
		'It\'s a feed; the "Dumps" service.'
	)
} )

test( 'a marker with no key is an error', () => {
	const { source } = build( ':message[Text]{qqq="Q."}\n' )
	assert.match( messages( source.diagnostics, 'error' ).join( '\n' ), /missing its \{#key\}/ )
} )

test( 'an unquoted attribute value is an error', () => {
	const source = parse( ':message[Text]{#k qqq=bare}\n' )
	assert.match( messages( source.diagnostics, 'error' ).join( '\n' ), /must be quoted/ )
} )

test( 'parameters must be numbered from p1 without gaps', () => {
	const source = parse( ':message{#content-shared-x p1="a" p3="c"}\n' )
	assert.match(
		messages( source.diagnostics, 'error' ).join( '\n' ),
		/numbered from p1 without gaps/
	)
} )

test( 'an unknown attribute is an error', () => {
	const source = parse( ':message[Text]{#k qqq="Q." bogus="x"}\n' )
	assert.match( messages( source.diagnostics, 'error' ).join( '\n' ), /unknown attribute "bogus"/ )
} )
