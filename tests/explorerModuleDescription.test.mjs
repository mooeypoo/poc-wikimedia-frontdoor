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

test( 'normalizeOpenApiModuleDescription strips Site API access boilerplate suffix', () => {
	const siteApiDescription = [
		'Provides information about Wikimedia project sites, including sitemaps.',
		'To prevent abusive scraping and ensure fair use of infrastructure, access to endpoints in this API is restricted to specific user groups.',
		'For more information about who can access this API, see [CDN/Backend_api/Sitemap_access](https://wikitech.wikimedia.org/wiki/CDN/Backend_api/Sitemap_access)',
		'or contact [mailto:bot-traffic@wikimedia.org bot-traffic@wikimedia.org].'
	].join( ' ' )

	const normalized = normalizeOpenApiModuleDescription( siteApiDescription, 'site/v1' )

	assert.equal(
		normalized,
		'Provides information about Wikimedia project sites, including sitemaps. To prevent abusive scraping and ensure fair use of infrastructure, access to endpoints in this API is restricted to specific user groups.'
	)
} )
