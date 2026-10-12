import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeOpenApiModuleDescription } from '../app/utils/explorerModuleDescription.ts'
import { EXPLORER_MODULE_SELECT_DESCRIPTION_MAX_CHARS } from '../config/explorerModuleDescriptions.ts'

test( 'normalizeOpenApiModuleDescription preserves full text when short', () => {
	const normalized = normalizeOpenApiModuleDescription(
		'Experimental editing suggestions and editor feedback regarding such suggestions.'
	)

	assert.equal(
		normalized,
		'Experimental editing suggestions and editor feedback regarding such suggestions.'
	)
} )

test( 'normalizeOpenApiModuleDescription strips sandbox caution boilerplate', () => {
	const normalized = normalizeOpenApiModuleDescription( [
		'Experimental editing suggestions and editor feedback regarding such suggestions.',
		'Caution: The REST Sandbox executes calls against the production database by default.',
		'To avoid unintended edits to live content, select the sandbox server.'
	].join( ' ' ) )

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

test( 'normalizeOpenApiModuleDescription shortens long text at a sentence boundary without ellipsis', () => {
	const longDescription = [
		'This API provides cacheable and straightforward access to Wikimedia content and data, in machine-readable formats.',
		'Clients can request articles, media, and related metadata for tools and research.',
		'Additional guidance covers caching headers, pagination, and content negotiation for multilingual projects.',
		'Further notes describe authentication options and stability guarantees for write endpoints.'
	].join( ' ' )
	const normalized = normalizeOpenApiModuleDescription( longDescription )

	assert.ok( normalized )
	assert.ok( normalized.length <= EXPLORER_MODULE_SELECT_DESCRIPTION_MAX_CHARS )
	assert.doesNotMatch( normalized, /…$/ )
	assert.match( normalized, /\.$/ )
	assert.equal(
		normalized,
		'This API provides cacheable and straightforward access to Wikimedia content and data, in machine-readable formats. Clients can request articles, media, and related metadata for tools and research.'
	)
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

test( 'normalizeOpenApiModuleDescription keeps Attribution API one-line summary', () => {
	const attributionDescription = [
		'The Attribution API provides well-structured attribution data for content across Wikimedia projects.',
		'For more information about the Attribution API, see the [docs on mediawiki.org](https://www.mediawiki.org/wiki/Special:MyLanguage/Attribution_API).',
		'For more information about attribution guidelines, expectations, and style guides when reusing Wikimedia content, see the [Attribution Framework](https://wikimedia-attribution.toolforge.org/attribution-signals/overview.html).',
		'Have questions or comments about this API? Help shape the experience and functionality while during the beta period by [joining the discussion](https://www.mediawiki.org/wiki/Talk:Attribution_API).'
	].join( ' ' )

	const normalized = normalizeOpenApiModuleDescription(
		attributionDescription,
		'attribution/v0-beta'
	)

	assert.equal(
		normalized,
		'The Attribution API provides well-structured attribution data for content across Wikimedia projects.'
	)
} )

test( 'normalizeOpenApiModuleDescription drops Global Rules sections', () => {
	const normalized = normalizeOpenApiModuleDescription( [
		'This API provides support for rendering mathematical formulae.',
		'### Global Rules',
		'- Limit your clients to no more than 200 requests/s to this API.'
	].join( '\n' ) )

	assert.equal(
		normalized,
		'This API provides support for rendering mathematical formulae.'
	)
} )
