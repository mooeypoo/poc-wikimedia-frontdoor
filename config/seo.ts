/**
 * Crawler policy for the portal: robots directives, indexability, and sitemap
 * scope. See docs/adr-static-module-documentation.md §10.
 *
 * Explicit `.ts` extensions on imports here — this module is read by `.mjs`
 * tooling and by Nitro, and Node's ESM resolver cannot resolve extensionless
 * relative specifiers.
 */

/**
 * Route patterns served with `X-Robots-Tag: noindex`.
 *
 * These are the Explorer's shareable deep-link families. `docs/adr-explorer-deep-linking.md`
 * made **6,374 such URLs valid today** (one per instance/module pair), heading
 * for ~32,000 as the module count grows, and every one serves the same empty
 * client-only shell — the Explorer is `ssr: false` by Absolute Rule 4. That is a
 * large near-duplicate surface pointing at the domain.
 *
 * **Why `noindex` and not `Disallow`.** `Disallow` was the first instinct and it
 * is the wrong tool here. `Disallow` prevents *crawling*, not *indexing*: a
 * disallowed URL can still be indexed from external links alone, showing up as a
 * bare URL with no description and no way for us to correct it. And these URLs
 * exist precisely to be **shared externally** — that is the entire point of the
 * deep-linking feature — so external links are the expected case, not an edge
 * case. Worse, the two directives conflict: a URL that is `Disallow`ed can never
 * be fetched, so its `noindex` is never read, and anything already indexed stays
 * indexed indefinitely.
 *
 * `noindex` costs crawl budget (the crawler must fetch to see the header) but it
 * is the only directive that actually keeps these URLs out of the index. Google
 * reduces crawl frequency for consistently-`noindex` URLs over time, so the cost
 * decays.
 *
 * **Consequence:** these patterns must NOT also appear in `ROBOTS_DISALLOWED_PATHS`.
 * A future maintainer adding them there would silently re-break this.
 */
export const NOINDEX_ROUTE_PATTERNS = [
	'/explorer/direct/**',
	'/explorer/q/**',
	// Locale-prefixed variants (`prefix_except_default`), mirroring the
	// `/*/account` style already used in nuxt.config.ts routeRules.
	'/*/explorer/direct/**',
	'/*/explorer/q/**'
]

/**
 * Paths excluded from crawling outright in `robots.txt`.
 *
 * Deliberately short. Server endpoints carry no indexable content and are never
 * linked externally, so `Disallow` is correct for them — unlike the deep links
 * above. Build asset directories (`/_nuxt/`) are **not** listed: crawlers need
 * CSS and JS to render pages, and blocking them degrades how the site is
 * assessed.
 */
export const ROBOTS_DISALLOWED_PATHS = [
	'/api/'
]

/**
 * Origin assumed when none is configured and this is not a production build.
 *
 * Local development publishes nothing, so defaulting to the dev server keeps
 * `/robots.txt`, `/sitemap.xml`, `/llms.txt` and `/llms-full.txt` testable with
 * no configuration at all. Matches the port `nuxt dev` uses by default.
 */
export const DEVELOPMENT_SITE_ORIGIN = 'http://localhost:3000'

/**
 * Resolves the absolute site origin used for sitemap, `robots.txt` and `llms.txt`
 * URLs — or an empty string when a production build has none configured.
 *
 * **Resolution order**, first non-empty wins:
 *
 * 1. `NUXT_PUBLIC_SITE_URL` — explicit configuration, always authoritative.
 * 2. `DEPLOY_PRIME_URL` — Netlify's *this deploy* URL. Preferred over `URL`
 *    because on a deploy preview `URL` is still the **production** address,
 *    which would make a preview's sitemap and llms files point at pages that do
 *    not exist there. `DEPLOY_PRIME_URL` equals the production URL on production
 *    deploys, so preferring it is correct in both cases.
 * 3. `URL` — Netlify's production site URL, as a fallback.
 * 4. `DEVELOPMENT_SITE_ORIGIN` — but *only* outside a production build.
 *
 * A production build with nothing configured deliberately gets **no default**.
 * Emitting a sitemap full of guessed absolute URLs is worse than emitting none:
 * it publishes wrong addresses that crawlers then act on. When this returns
 * empty, those documents are skipped and `robots.txt` omits its `Sitemap:` line —
 * everything stays valid, just less useful.
 *
 * @param environment - Environment variables to read (defaults to `process.env`).
 * @returns Origin without a trailing slash, or an empty string.
 */
export function resolveSiteOrigin(
	environment: Record<string, string | undefined> = process.env
): string {
	const configured = (
		environment.NUXT_PUBLIC_SITE_URL ||
		environment.DEPLOY_PRIME_URL ||
		environment.URL ||
		''
	).trim().replace( /\/+$/, '' )

	if ( configured ) {
		return configured
	}

	return environment.NODE_ENV === 'production' ? '' : DEVELOPMENT_SITE_ORIGIN
}
