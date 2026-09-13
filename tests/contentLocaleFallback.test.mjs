import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildLocaleCandidates, buildLocaleContentPaths } from '../app/utils/contentLocalePaths.ts'

const projectRoot = dirname( dirname( fileURLToPath( import.meta.url ) ) )

test( 'the fallback chain keeps its order and ends at English', () => {
	assert.deepEqual( buildLocaleCandidates( 'fr', [ 'fr', 'en' ] ), [ 'fr', 'en' ] )
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
