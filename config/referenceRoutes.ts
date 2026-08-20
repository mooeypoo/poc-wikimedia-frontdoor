/**
 * URL policy for the static module reference surface (`/reference/…`).
 *
 * Discovery module names are the identity used everywhere in data — the module
 * source of truth, spec filenames, translation overlays. A *few* of them make
 * poor URL segments, so this module owns the (small) translation between the two
 * and nothing else. See docs/adr-static-module-documentation.md §8.
 *
 * Explicit `.ts` extension on the import chain: this module is read by plain
 * `.mjs` tooling (the reference generator) as well as by Vite, and Node's ESM
 * resolver cannot resolve an extensionless relative specifier.
 */

/** Path prefix owned by the static reference surface. */
export const REFERENCE_PATH_PREFIX = 'reference'

/**
 * Module names whose URL slug differs from their identity.
 *
 * Deliberately a table rather than an inline special case, so a second alias
 * needs no new mechanism. Every module not listed here slugs to itself.
 *
 * `-` is the root module: discovery reports it with an empty id and Wikimedia's
 * own spec path calls it `/module/-`, so `-` is its identity (see
 * docs/adr-module-source-of-truth.md §4). `/reference/-` is a legal URL but
 * reads as a typo and is hostile to say aloud or to recognise in a search
 * result, so it is published as `general`.
 */
const MODULE_SLUG_OVERRIDES: Record<string, string> = {
	'-': 'general'
}

/** Reverse of {@link MODULE_SLUG_OVERRIDES}, built once so lookups stay O(1). */
const MODULE_NAME_BY_SLUG: Record<string, string> = Object.fromEntries(
	Object.entries( MODULE_SLUG_OVERRIDES ).map( ( [ name, slug ] ) => [ slug, name ] )
)

/**
 * Converts a discovery module name to its URL slug.
 *
 * The slug may still contain slashes (`site/v1` → `site/v1`); the reference
 * route carries the module as tail segments precisely so it needs no encoding.
 *
 * @param moduleName - Full discovery module name (e.g. `site/v1`, `-`).
 * @returns The URL slug for that module (e.g. `site/v1`, `general`).
 */
export function moduleNameToReferenceSlug( moduleName: string ): string {
	return MODULE_SLUG_OVERRIDES[ moduleName ] ?? moduleName
}

/**
 * Converts a URL slug back to its discovery module name.
 *
 * Inverse of {@link moduleNameToReferenceSlug}. Unknown slugs pass through
 * unchanged — resolving whether the result is a real module is the caller's job,
 * not this table's.
 *
 * @param slug - URL slug from a `/reference/…` path (e.g. `general`, `site/v1`).
 * @returns The discovery module name (e.g. `-`, `site/v1`).
 */
export function referenceSlugToModuleName( slug: string ): string {
	return MODULE_NAME_BY_SLUG[ slug ] ?? slug
}

/**
 * Locales the reference surface is prerendered for during the experiment.
 *
 * Deliberately **not** `SUPPORTED_LANGUAGES` (575 entries): publishing a locale
 * before its translation overlay has real coverage produces near-duplicate
 * English pages at scale, which is an active SEO liability rather than neutral
 * filler. docs/adr-static-module-documentation.md §5 replaces this list with a
 * coverage gate once per-language specs exist; until then it is the explicit
 * allowlist, and it doubles as the phase-0a prerender scale-test fixture.
 *
 * `en` is the default locale, so `prefix_except_default` gives it unprefixed
 * paths; every other entry gets a `/<locale>/` prefix. RTL locales (`he`, `fa`,
 * `ar`) are included on purpose — direction bugs in a prerendered page are
 * cheapest to find before the page has content worth reading.
 */
export const REFERENCE_EXPERIMENT_LOCALES = [
	'en',
	'ar',
	'de',
	'es',
	'fa',
	'fr',
	'he',
	'hi',
	'it',
	'ja',
	'nl',
	'pt',
	'ru',
	'uk',
	'zh'
]

/**
 * Builds the locale-less reference path for a module.
 *
 * Locale prefixing is `@nuxtjs/i18n`'s job (`prefix_except_default`), so this
 * returns the unprefixed path and callers pass it through `localePath`.
 *
 * @param moduleName - Full discovery module name.
 * @returns Absolute path, e.g. `/reference/site/v1`.
 */
export function referencePathForModule( moduleName: string ): string {
	return `/${ REFERENCE_PATH_PREFIX }/${ moduleNameToReferenceSlug( moduleName ) }`
}
