import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeOpenApiModuleDescription } from '../app/utils/explorerModuleDescription.ts'

test( 'normalizeOpenApiModuleDescription preserves full text when short', () => {
	const normalized = normalizeOpenApiModuleDescription(
		'Experimental editing suggestions and editor feedback regarding such suggestions.'
	)

	assert.equal(
		normalized,
		'Experimental editing suggestions and editor feedback regarding such suggestions.'
	)
} )

test( 'normalizeOpenApiModuleDescription strips markdown links and URLs but keeps full sentence', () => {
	const normalized = normalizeOpenApiModuleDescription(
		'The Attribution API provides well-structured attribution data. For more information, see the [docs on mediawiki.org](https://www.mediawiki.org/wiki/Special:MyLanguage/Attribution_API).'
	)

	assert.equal(
		normalized,
		'The Attribution API provides well-structured attribution data. For more information, see the docs on mediawiki.org.'
	)
} )

test( 'normalizeOpenApiModuleDescription does not truncate long text', () => {
	const longDescription = 'Provides information about Wikimedia project sites including sitemaps and other structured site metadata used by clients that need to discover project endpoints and capabilities across the federation'
	const normalized = normalizeOpenApiModuleDescription( longDescription )

	assert.equal( normalized, longDescription )
	assert.doesNotMatch( normalized, /…$/ )
} )
