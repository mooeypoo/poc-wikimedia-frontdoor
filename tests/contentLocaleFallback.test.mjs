import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
	buildLocaleCandidates,
	buildLocaleContentPaths,
	contentDocumentIdentity,
	dropDuplicateChainDocuments,
	localeFromContentPath,
	resolveContentLocaleChain
} from '../app/utils/contentLocalePaths.ts'

const projectRoot = dirname( dirname( fileURLToPath( import.meta.url ) ) )

test( 'the fallback chain keeps its order and ends at English', () => {
	assert.deepEqual( buildLocaleCandidates( 'fr', [ 'fr', 'en' ] ), [ 'fr', 'en' ] )
} )

test( 'the chain drops locales with no collection and keeps English', () => {
	// Catalan's real chain is [ ca, oc, en ], and neither ca nor oc has a
	// content directory, so a Catalan reader resolves against English alone.
	assert.deepEqual( resolveContentLocaleChain( 'ca', [ 'en', 'fr' ] ), [ 'en' ] )
	assert.deepEqual( resolveContentLocaleChain( 'fr', [ 'en', 'fr' ] ), [ 'fr', 'en' ] )
} )

test( 'an unknown or empty locale still resolves against English', () => {
	assert.deepEqual( resolveContentLocaleChain( 'zz', [ 'en' ] ), [ 'en' ] )
	assert.deepEqual( resolveContentLocaleChain( '', [ 'en' ] ), [ 'en' ] )
} )

test( 'translations of one page share a document identity', () => {
	assert.equal( contentDocumentIdentity( '/en/about' ), '/about' )
	assert.equal( contentDocumentIdentity( '/fr/about' ), '/about' )
	assert.equal( contentDocumentIdentity( '/fr/about#history' ), '/about' )
	assert.equal( contentDocumentIdentity( '/en/learn/deep/page' ), '/learn/deep/page' )
} )

test( 'every locale root page is the same document', () => {
	assert.equal( contentDocumentIdentity( '/en' ), '/' )
	assert.equal( contentDocumentIdentity( '/fr' ), '/' )
	assert.equal( contentDocumentIdentity( '/fr#section' ), '/' )
} )

test( 'a page found in the reader\'s locale does not repeat down the chain', () => {
	const groups = dropDuplicateChainDocuments( [
		{ locale: 'fr', results: [ { id: '/fr/about' } ] },
		{ locale: 'en', results: [ { id: '/en/about' }, { id: '/en/only-english' } ] }
	] )

	assert.deepEqual( groups, [
		{ locale: 'fr', results: [ { id: '/fr/about' } ] },
		{ locale: 'en', results: [ { id: '/en/only-english' } ] }
	] )
} )

test( 'a fallback group left with nothing is dropped, not left empty', () => {
	const groups = dropDuplicateChainDocuments( [
		{ locale: 'fr', results: [ { id: '/fr/about' } ] },
		{ locale: 'en', results: [ { id: '/en/about#history' } ] }
	] )

	assert.deepEqual( groups, [ { locale: 'fr', results: [ { id: '/fr/about' } ] } ] )
} )

test( 'several matching sections of one page all survive in their own group', () => {
	const groups = dropDuplicateChainDocuments( [
		{ locale: 'fr', results: [ { id: '/fr/about#intro' }, { id: '/fr/about#history' } ] }
	] )

	assert.deepEqual( groups, [
		{ locale: 'fr', results: [ { id: '/fr/about#intro' }, { id: '/fr/about#history' } ] }
	] )
} )

test( 'the whole chain dedupes, not just the first hop', () => {
	// pt-br's chain is pt-br, pt, en, and all three have a content collection,
	// so one page in all three would otherwise be three headings deep.
	const groups = dropDuplicateChainDocuments( [
		{ locale: 'pt-br', results: [ { id: '/pt-br/about' } ] },
		{ locale: 'pt', results: [ { id: '/pt/about' } ] },
		{ locale: 'en', results: [ { id: '/en/about' } ] }
	] )

	assert.deepEqual( groups, [ { locale: 'pt-br', results: [ { id: '/pt-br/about' } ] } ] )
} )

test( 'deduping preserves the rest of a group\'s shape', () => {
	const groups = dropDuplicateChainDocuments( [
		{ locale: 'fa', dir: 'rtl', results: [ { id: '/fa/about' } ] },
		{ locale: 'en', dir: 'ltr', results: [ { id: '/en/about' }, { id: '/en/other' } ] }
	] )

	assert.deepEqual( groups, [
		{ locale: 'fa', dir: 'rtl', results: [ { id: '/fa/about' } ] },
		{ locale: 'en', dir: 'ltr', results: [ { id: '/en/other' } ] }
	] )
} )

test( 'a slug builds one candidate path per locale', () => {
	assert.deepEqual( buildLocaleContentPaths( 'fr', 'get-help' ), [ '/fr/get-help' ] )
	assert.deepEqual( buildLocaleContentPaths( 'en', 'get-help' ), [ '/en/get-help' ] )
} )

test( 'a locale-qualified content path yields its own locale segment', () => {
	assert.equal( localeFromContentPath( '/en/learn', 'fr' ), 'en' )
	assert.equal( localeFromContentPath( '/fr/get-help', 'en' ), 'fr' )
} )

test( 'a path with no second segment falls back to the given locale', () => {
	assert.equal( localeFromContentPath( '', 'en' ), 'en' )
	assert.equal( localeFromContentPath( 'no-leading-slash', 'en' ), 'en' )
} )

test( 'the missing French page has an English file behind it', () => {
	assert.equal(
		existsSync( join( projectRoot, 'content/fr/get-help.md' ) ),
		false,
		'Expected French get-help markdown file to be intentionally missing.'
	)
	assert.equal(
		existsSync( join( projectRoot, 'content/en/get-help.md' ) ),
		true,
		'Expected English get-help markdown file to exist for fallback.'
	)
} )
