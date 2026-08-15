/**
 * Rendering: escaping per context, parameters, fallback, and format adapters.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { build, messages } from './helpers.js'
import { plainText } from '../src/formats/plainText.js'
import { markdown } from '../src/formats/markdown.js'
import { translatedPercent, keysUsedBy } from '../src/core/catalog.js'

const TABLE = [
	'| :message[Format]{#th qqq="Header."} |',
	'| --- |',
	'| :message[XML \\| SQL]{#td qqq="Formats."} |',
	''
].join( '\n' )

test( 'a pipe in a table cell is stored unescaped and re-escaped on output', () => {
	const { body, catalog } = build( TABLE )
	assert.equal( catalog.messages.get( 'content-page-td' ), 'XML | SQL' )
	assert.match( body, /\| XML \\\| SQL \|/ )
} )

test( 'a translated pipe is escaped too, not just the source one', () => {
	// The source file's escaping cannot protect us here: this value came from a
	// translator, and an unescaped pipe would silently add a table cell.
	const { body } = build( TABLE, {
		locale: 'he',
		translations: { he: { 'content-page-th': 'פורמט', 'content-page-td': 'XML | SQL' } }
	} )
	assert.match( body, /\| XML \\\| SQL \|/ )
} )

test( 'a translated quote in an attribute is escaped', () => {
	const { body } = build( '::card{title=":message[Tools]{#t qqq=\'T.\'}"}\n', {
		locale: 'he',
		translations: { he: { 'content-page-t': 'the "best" tools' } }
	} )
	assert.match( body, /title="the &quot;best&quot; tools"/ )
} )

test( 'parameters are transported positionally and substituted by banana', () => {
	const { body } = build( [
		':::messages',
		':message[Read more on $1]{#content-shared-more qqq="$1 is a site."}',
		':::',
		'::card{text=":message{#content-shared-more p1=\'Meta-Wiki\'}"}',
		''
	].join( '\n' ) )
	assert.match( body, /text="Read more on Meta-Wiki"/ )
} )

test( 'the same message renders differently per reference', () => {
	const { body } = build( [
		':::messages',
		':message[Read more on $1]{#content-shared-more qqq="$1 is a site."}',
		':::',
		':message{#content-shared-more p1=\'Meta-Wiki\'}',
		'',
		':message{#content-shared-more p1=\'Wikidata\'}',
		''
	].join( '\n' ) )
	assert.match( body, /Read more on Meta-Wiki/ )
	assert.match( body, /Read more on Wikidata/ )
} )

test( 'banana magic words in the message are honoured, not reimplemented', () => {
	// {{BIDI:$1}} wraps in directional control characters; the library passes the
	// parameter through verbatim and lets banana decide.
	const { body } = build( [
		':::messages',
		':message[Read more on {{BIDI:$1}}]{#content-shared-more qqq="$1 is a site."}',
		':::',
		':message{#content-shared-more p1=\'Meta-Wiki\'}',
		''
	].join( '\n' ) )
	assert.match( body, /‪Meta-Wiki‬/ )
} )

test( 'a missing key falls back to the source locale per message', () => {
	const { body } = build( [
		'# :message[Title]{#title qqq="H1."}',
		'',
		':message[Untranslated body.]{#body qqq="Body."}',
		''
	].join( '\n' ), {
		locale: 'es',
		translations: { es: { 'content-page-title': 'Título' } }
	} )
	assert.match( body, /# Título/ )
	assert.match( body, /Untranslated body\./ )
} )

test( 'coverage is measured against the locale\'s own catalogue', () => {
	const { source } = build( [
		'# :message[Title]{#title qqq="H1."}',
		'',
		':message[Body]{#body qqq="Body."}',
		''
	].join( '\n' ) )
	assert.equal( keysUsedBy( source ).length, 2 )
	assert.equal( translatedPercent( source, { 'content-page-title': 'Título' } ), 50 )
	assert.equal( translatedPercent( source, {} ), 0 )
} )

test( 'a table broken by a translation is caught by the format validator', () => {
	// Simulates a translated cell whose pipe slipped through unescaped.
	const problems = markdown().validate( [
		'| a | b |',
		'| --- | --- |',
		'| x | y | z |',
		''
	].join( '\n' ) )
	assert.equal( problems.length, 1 )
	assert.match( problems[ 0 ], /inconsistent cell counts/ )
} )

test( 'plainText applies no escaping and has no envelope', () => {
	// If the core ever grows a hidden Markdown assumption, it surfaces here.
	const text = '| :message[XML | SQL]{#td qqq="Formats."} |\n'
	const { body, source } = build( text, { format: plainText() } )
	assert.deepEqual( source.metadata, {} )
	assert.equal( body, '| XML | SQL |\n' )
} )

test( 'plainText treats frontmatter as ordinary text', () => {
	const { source, body } = build( '---\nstatus: mockup\n---\n:message[Hi]{#k qqq="Q."}\n', {
		format: plainText()
	} )
	assert.deepEqual( source.metadata, {} )
	assert.match( body, /^---\nstatus: mockup\n---\nHi/ )
} )

test( 'an unexpanded marker in the output is an error', () => {
	// A literal marker written past the escape still counts as a leak.
	const { rendered } = build( ':message[Text]{#k qqq="Q."}\n\nliteral :message{' )
	assert.match(
		messages( rendered.diagnostics, 'error' ).join( '\n' ),
		/unexpanded marker/
	)
} )
