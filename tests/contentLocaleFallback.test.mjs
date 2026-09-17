import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
	buildLocaleCandidates,
	buildLocaleContentPaths,
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

test( 'a slug builds one candidate path per locale', () => {
	assert.deepEqual( buildLocaleContentPaths( 'fr', 'get-help' ), [ '/fr/get-help' ] )
	assert.deepEqual( buildLocaleContentPaths( 'en', 'get-help' ), [ '/en/get-help' ] )
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
