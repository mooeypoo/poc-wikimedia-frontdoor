/**
 * Pure builders for `robots.txt` and `sitemap.xml`.
 *
 * Kept free of I/O and framework imports so the same functions serve the Nitro
 * routes that emit these documents and the tests that assert their shape — the
 * same isomorphic-purity constraint as `normalizeDiscoveryModules.ts`.
 */

/** One sitemap entry, with its locale alternates. */
export interface SitemapEntry {
	/** Absolute URL of the page. */
	location: string
	/** Locale alternates for `hreflang`, including this entry's own locale. */
	alternates: { hreflang: string; href: string }[]
}

/**
 * Escapes text for inclusion in XML character data or an attribute value.
 *
 * Sitemap URLs are built from module names and locale codes, so the practical
 * risk is `&` in a query string rather than markup injection — but escaping is
 * unconditional because a single unescaped `&` makes the whole document
 * unparseable, and a silently invalid sitemap is worse than none.
 *
 * @param value - Raw text.
 * @returns XML-safe text.
 */
export function escapeXml( value: string ): string {
	return value
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&apos;' )
}

/**
 * Builds a `robots.txt` document.
 *
 * The `Sitemap:` line is emitted only when an absolute sitemap URL is supplied —
 * the directive requires an absolute URL, so a missing site origin means the line
 * is omitted rather than guessed (see `config/seo.ts` `resolveSiteOrigin`).
 *
 * Note what is deliberately absent: the Explorer's deep-link families. They are
 * handled with `X-Robots-Tag: noindex` instead, because `Disallow` cannot remove
 * an externally-linked URL from the index and would prevent the `noindex` from
 * ever being read. See `config/seo.ts` `NOINDEX_ROUTE_PATTERNS`.
 *
 * @param options - Disallowed paths and optional absolute sitemap URL.
 * @returns The complete `robots.txt` body, newline-terminated.
 */
export function buildRobotsTxt( options: {
	disallowedPaths: string[]
	sitemapUrl?: string
} ): string {
	const lines = [ 'User-agent: *' ]

	for ( const path of options.disallowedPaths ) {
		lines.push( `Disallow: ${ path }` )
	}

	// An explicit Allow makes the intent legible when there are no Disallow
	// lines at all; without it the group reads as though something is missing.
	if ( options.disallowedPaths.length === 0 ) {
		lines.push( 'Allow: /' )
	}

	if ( options.sitemapUrl ) {
		lines.push( '', `Sitemap: ${ options.sitemapUrl }` )
	}

	return `${ lines.join( '\n' ) }\n`
}

/**
 * Builds a sitemap with `hreflang` alternates.
 *
 * Every entry lists **all** locale alternates including itself, which is what the
 * specification requires — a set of alternates that omits the page it appears on
 * is ignored. `x-default` points at the default-locale URL so crawlers have a
 * fallback for unmatched languages.
 *
 * @param entries - Pages to list, each with its full alternate set.
 * @param defaultLocaleHreflang - The `hreflang` treated as `x-default`.
 * @returns A complete sitemap XML document.
 */
export function buildSitemapXml(
	entries: SitemapEntry[],
	defaultLocaleHreflang: string
): string {
	const urlBlocks = entries.map( ( entry ) => {
		const alternateLines = entry.alternates.map(
			( alternate ) => `\t\t<xhtml:link rel="alternate" hreflang="${ escapeXml( alternate.hreflang ) }" href="${ escapeXml( alternate.href ) }"/>`
		)

		const defaultAlternate = entry.alternates.find(
			( alternate ) => alternate.hreflang === defaultLocaleHreflang
		)
		if ( defaultAlternate ) {
			alternateLines.push(
				`\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${ escapeXml( defaultAlternate.href ) }"/>`
			)
		}

		return [
			'\t<url>',
			`\t\t<loc>${ escapeXml( entry.location ) }</loc>`,
			...alternateLines,
			'\t</url>'
		].join( '\n' )
	} )

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...urlBlocks,
		'</urlset>',
		''
	].join( '\n' )
}
