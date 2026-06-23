import assert from 'node:assert/strict'
import test from 'node:test'
import { rewriteRequestOrigin } from '../app/utils/rewriteRequestOrigin.ts'

test( 'rewriteRequestOrigin maps language wikis to test.wikipedia.org', () => {
	const rewrittenUrl = rewriteRequestOrigin(
		'https://en.wikipedia.org/w/rest.php/v1/page/Earth',
		'https://en.wikipedia.org',
		'https://test.wikipedia.org'
	)

	assert.equal(
		rewrittenUrl,
		'https://test.wikipedia.org/w/rest.php/v1/page/Earth'
	)
} )

test( 'rewriteRequestOrigin maps Wikidata to test.wikidata.org', () => {
	const rewrittenUrl = rewriteRequestOrigin(
		'https://www.wikidata.org/w/rest.php/wikibase/v1/entities/Q42',
		'https://www.wikidata.org',
		'https://test.wikidata.org'
	)

	assert.equal(
		rewrittenUrl,
		'https://test.wikidata.org/w/rest.php/wikibase/v1/entities/Q42'
	)
} )

test( 'rewriteRequestOrigin leaves unrelated origins unchanged', () => {
	const requestUrl = 'https://example.org/w/rest.php/v1/page/Earth'

	assert.equal(
		rewriteRequestOrigin(
			requestUrl,
			'https://en.wikipedia.org',
			'https://test.wikipedia.org'
		),
		requestUrl
	)
} )
