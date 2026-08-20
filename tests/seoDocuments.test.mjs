import assert from 'node:assert/strict'
import test from 'node:test'

import {
	buildRobotsTxt,
	buildSitemapXml,
	escapeXml
} from '../app/utils/seoDocuments.ts'
import {
	NOINDEX_ROUTE_PATTERNS,
	ROBOTS_DISALLOWED_PATHS,
	resolveSiteOrigin
} from '../config/seo.ts'

test( 'buildRobotsTxt lists disallowed paths', () => {
	const robots = buildRobotsTxt( { disallowedPaths: [ '/api/' ] } )

	assert.match( robots, /^User-agent: \*$/m )
	assert.match( robots, /^Disallow: \/api\/$/m )
	assert.ok( robots.endsWith( '\n' ) )
} )

test( 'buildRobotsTxt emits an explicit Allow when nothing is disallowed', () => {
	const robots = buildRobotsTxt( { disallowedPaths: [] } )
	assert.match( robots, /^Allow: \/$/m )
} )

test( 'buildRobotsTxt omits the Sitemap line without an absolute URL', () => {
	// The directive requires an absolute URL, so omitting beats guessing a host.
	assert.doesNotMatch( buildRobotsTxt( { disallowedPaths: [] } ), /Sitemap:/ )
	assert.match(
		buildRobotsTxt( { disallowedPaths: [], sitemapUrl: 'https://example.org/sitemap.xml' } ),
		/^Sitemap: https:\/\/example\.org\/sitemap\.xml$/m
	)
} )

test( 'noindexed deep links are never also disallowed', () => {
	// The two directives conflict: a disallowed URL is never fetched, so its
	// noindex is never read and anything already indexed stays indexed. This
	// guards the invariant documented in config/seo.ts.
	for ( const pattern of NOINDEX_ROUTE_PATTERNS ) {
		const patternPrefix = pattern.replace( /\*+/g, '' ).replace( /\/+$/, '' )
		for ( const disallowed of ROBOTS_DISALLOWED_PATHS ) {
			assert.ok(
				!patternPrefix.startsWith( disallowed.replace( /\/+$/, '' ) ) ||
					disallowed === '/',
				`${ pattern } is noindexed but also disallowed via ${ disallowed }`
			)
		}
	}
} )

test( 'noindex patterns cover both bare and locale-prefixed explorer deep links', () => {
	assert.ok( NOINDEX_ROUTE_PATTERNS.includes( '/explorer/direct/**' ) )
	assert.ok( NOINDEX_ROUTE_PATTERNS.includes( '/explorer/q/**' ) )
	assert.ok( NOINDEX_ROUTE_PATTERNS.includes( '/*/explorer/direct/**' ) )
	assert.ok( NOINDEX_ROUTE_PATTERNS.includes( '/*/explorer/q/**' ) )
} )

test( 'resolveSiteOrigin prefers explicit config over the platform value', () => {
	assert.equal(
		resolveSiteOrigin( { NUXT_PUBLIC_SITE_URL: 'https://a.example', URL: 'https://b.example' } ),
		'https://a.example'
	)
	assert.equal( resolveSiteOrigin( { URL: 'https://b.example' } ), 'https://b.example' )
} )

test( 'resolveSiteOrigin strips trailing slashes and defaults to empty', () => {
	assert.equal( resolveSiteOrigin( { NUXT_PUBLIC_SITE_URL: 'https://a.example/' } ), 'https://a.example' )
	assert.equal( resolveSiteOrigin( { NUXT_PUBLIC_SITE_URL: 'https://a.example///' } ), 'https://a.example' )
	assert.equal( resolveSiteOrigin( {} ), '' )
	assert.equal( resolveSiteOrigin( { NUXT_PUBLIC_SITE_URL: '   ' } ), '' )
} )

test( 'escapeXml escapes every character that breaks a document', () => {
	assert.equal( escapeXml( 'a&b' ), 'a&amp;b' )
	assert.equal( escapeXml( '<x>' ), '&lt;x&gt;' )
	assert.equal( escapeXml( '"q"' ), '&quot;q&quot;' )
	assert.equal( escapeXml( "'a'" ), '&apos;a&apos;' )
} )

test( 'buildSitemapXml declares the xhtml namespace it uses', () => {
	// hreflang alternates are xhtml:link elements; without the namespace
	// declaration the document is not well-formed and is discarded wholesale.
	const xml = buildSitemapXml( [], 'en' )
	assert.match( xml, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/ )
	assert.match( xml, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/ )
	assert.ok( xml.startsWith( '<?xml version="1.0" encoding="UTF-8"?>' ) )
} )

test( 'buildSitemapXml lists every alternate on every entry, including itself', () => {
	const alternates = [
		{ hreflang: 'en', href: 'https://x.example/reference/site/v1' },
		{ hreflang: 'he', href: 'https://x.example/he/reference/site/v1' }
	]
	const xml = buildSitemapXml(
		[
			{ location: alternates[ 0 ].href, alternates },
			{ location: alternates[ 1 ].href, alternates }
		],
		'en'
	)

	assert.equal( ( xml.match( /<url>/g ) ?? [] ).length, 2 )
	// A self-referential alternate is required; a set that omits the page it
	// appears on is ignored entirely by search engines.
	assert.equal( ( xml.match( /hreflang="en"/g ) ?? [] ).length, 2 )
	assert.equal( ( xml.match( /hreflang="he"/g ) ?? [] ).length, 2 )
} )

test( 'buildSitemapXml points x-default at the default locale', () => {
	const xml = buildSitemapXml(
		[ {
			location: 'https://x.example/he/reference/site/v1',
			alternates: [
				{ hreflang: 'en', href: 'https://x.example/reference/site/v1' },
				{ hreflang: 'he', href: 'https://x.example/he/reference/site/v1' }
			]
		} ],
		'en'
	)

	assert.match(
		xml,
		/hreflang="x-default" href="https:\/\/x\.example\/reference\/site\/v1"/
	)
} )

test( 'buildSitemapXml omits x-default when the default locale is absent', () => {
	const xml = buildSitemapXml(
		[ {
			location: 'https://x.example/he/reference/site/v1',
			alternates: [ { hreflang: 'he', href: 'https://x.example/he/reference/site/v1' } ]
		} ],
		'en'
	)

	assert.doesNotMatch( xml, /x-default/ )
} )

test( 'buildSitemapXml escapes ampersands in URLs', () => {
	const xml = buildSitemapXml(
		[ {
			location: 'https://x.example/reference/a?b=1&c=2',
			alternates: []
		} ],
		'en'
	)

	assert.match( xml, /<loc>https:\/\/x\.example\/reference\/a\?b=1&amp;c=2<\/loc>/ )
	// A single raw ampersand makes the whole document unparseable.
	assert.doesNotMatch( xml, /&(?!amp;|lt;|gt;|quot;|apos;)/ )
} )
