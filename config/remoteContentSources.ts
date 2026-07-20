/**
 * Declares remote content sources imported by scripts/fetch-remote-content.mjs.
 *
 * Each entry maps a remote source to a local content path; imported files are
 * written to content/[locale]/[localPath].md. Importing is a standalone command
 * (`npm run fetch-remote-content`), not part of the build, and its output is
 * committed and reviewed via git diff.
 *
 * Strategies (both implemented): 'markdown-url' and 'mediawiki-translated-page'.
 *
 * How to add/change a source: docs/content-import-guide.md (Part 1).
 * @see scripts/fetch-remote-content.mjs, docs/adr-remote-content-fetching.md
 */

export interface RemoteContentNavEntry {
	/**
	 * Which navigation surface to add the entry to.
	 *
	 * 'primary' — merge into the primary top nav bar (implemented in Phase 1).
	 * 'explorer-side' — add to the API Explorer left side nav (planned, not yet
	 *                   implemented; requires extending config/explorerSideNav.js).
	 */
	target: 'primary'  // extend to 'primary' | 'explorer-side' when Phase 2 nav is added

	/** banana-i18n message key for the nav label. Must exist in all i18n/*.json files. */
	messageKey: string

	/**
	 * Position in the primary nav among all merged items.
	 * Use a numeric index (0-based) or 'after:{id}' referencing a
	 * MAIN_NAVIGATION_ITEMS entry id (e.g. 'after:learn').
	 */
	navPosition: number | `after:${string}`
}

export interface RemoteContentSource {
	/** Unique identifier — used in log output and error messages. */
	id: string

	/**
	 * Fetch strategy.
	 *
	 * 'markdown-url'             — fetch raw Markdown from remoteUrl (implemented)
	 * 'mediawiki-translated-page' — fetch a MediaWiki page + all its translation
	 *                              subpages (Parsoid HTML → Markdown), one file per
	 *                              locale (implemented; see the wiki fields below and
	 *                              docs/adr-remote-content-fetching.md §9)
	 */
	strategy: 'markdown-url' | 'mediawiki-translated-page'

	/** URL from which to fetch the raw Markdown content. Required for 'markdown-url'. */
	remoteUrl?: string

	// ---- Fields for strategy 'mediawiki-translated-page' ----

	/** MediaWiki Action API endpoint, e.g. 'https://www.mediawiki.org/w/api.php'. */
	wikiApiUrl?: string

	/** Canonical source page title (with namespace), e.g. 'Help:Extension:Translate'. */
	pageTitle?: string

	/**
	 * Skip translations whose completeness is below this percentage (0–100).
	 * Defaults to 1 — i.e. skip only 0%-translated languages; keep the rest and
	 * let untranslated units fall through to the source language.
	 */
	minTranslatedPercent?: number

	/** Conservative element → MDC component mapping toggles. */
	componentMapping?: {
		/** Fenced code blocks with language (default true). */
		code?: boolean
		/** Message/note boxes → `::callout` (default true). */
		callouts?: boolean
	}

	/**
	 * Attribution metadata for CC BY-SA reuse. When present, provenance is written
	 * to frontmatter and a `::attribution` footer is appended to each page.
	 */
	attribution?: {
		/** SPDX-style license id, e.g. 'CC BY-SA 4.0'. */
		license: string
	}

	/**
	 * Path under content/[locale]/ where the file will be written, without
	 * extension. Determines the resulting route.
	 *
	 * Example: 'terms-of-use' writes to content/en/terms-of-use.md
	 * and is served at /terms-of-use (or /fr/terms-of-use via locale fallback).
	 */
	localPath: string

	/**
	 * Locale for the primary (or only) fetched file.
	 * Defaults to 'en'. See ADR §4 for multi-locale planned shape.
	 *
	 * Phase 1: Use this field for single-locale sources.
	 * Phase 2: Will be replaced by `localeFiles` for multi-locale sources.
	 * Both can coexist; script prioritizes `localeFiles` if present.
	 */
	locale?: string

	/**
	 * Multi-locale file URLs — Phase 2, not yet implemented.
	 *
	 * When a source has translations available at different URLs for different
	 * locales, use this instead of the single `remoteUrl` + `locale` combo.
	 *
	 * Example:
	 * ```ts
	 * localeFiles: {
	 *   en: 'https://example.org/docs/page.md',
	 *   fr: 'https://example.org/docs/fr/page.md',
	 *   ar: 'https://example.org/docs/ar/page.md',
	 * }
	 * ```
	 *
	 * Each URL is fetched and written to the corresponding `content/[locale]/` path.
	 * Locales not listed fall back via the language fallback chain in config/languages.ts.
	 *
	 * Phase 2 implementation: script will fetch all URLs in `localeFiles`,
	 * apply `overrideFrontmatter` to each (per-locale overrides TBD),
	 * and write to `content/[locale]/[localPath].md`.
	 */
	localeFiles?: Record<string, string>

	/**
	 * Frontmatter fields to inject into (or override in) the fetched file.
	 * Merged on top of any frontmatter the remote file declares, so the
	 * portal controls page title and nav metadata regardless of source.
	 *
	 * At minimum, set `title` here if the remote file does not guarantee
	 * a frontmatter title block.
	 */
	overrideFrontmatter?: Record<string, unknown>

	/**
	 * When present, registers a navigation entry for this page.
	 * See ADR §5 for full shape and nav target details.
	 */
	navEntry?: RemoteContentNavEntry
}

/**
 * Array of remote content sources to fetch at build time.
 *
 * Populate with real sources when available. Example:
 *
 * {
 *   id: 'terms-of-use',
 *   strategy: 'markdown-url',
 *   remoteUrl: 'https://example.org/portal-docs/terms.md',
 *   localPath: 'terms-of-use',
 *   overrideFrontmatter: { title: 'Terms of Use' },
 *   navEntry: {
 *     target: 'primary',
 *     messageKey: 'nav-terms',
 *     navPosition: 'after:about',
 *   },
 * }
 */
export const REMOTE_CONTENT_SOURCES: readonly RemoteContentSource[] = [
	{
		id: 'wikimedia-spectral-ruleset',
		strategy: 'markdown-url',
		remoteUrl: 'https://gitlab.wikimedia.org/repos/ci-tools/wikimedia-spectral-ruleset/-/raw/main/README.md?ref_type=heads',
		localPath: 'demo-remote-markdown',
		overrideFrontmatter: { title: 'Demo Remote Markdown' },
		// navEntry: {
		// 	target: 'primary',
		// 	messageKey: 'nav-remote-md',
		// 	navPosition: 'after:community'
		// }
	},
	{
		// Demo of the wiki translated-page strategy: fetches a translatable
		// mediawiki.org page and its translation subpages, one file per locale.
		// Reachable at /wiki-translate-help (and /<locale>/wiki-translate-help).
		// minTranslatedPercent keeps the demo to well-translated locales.
		id: 'demo-wiki-translated',
		strategy: 'mediawiki-translated-page',
		wikiApiUrl: 'https://www.mediawiki.org/w/api.php',
		pageTitle: 'Help:Extension:Translate',
		localPath: 'wiki-translate-help',
		minTranslatedPercent: 85,
		overrideFrontmatter: { title: 'Translate extension (from mediawiki.org)' },
		attribution: { license: 'CC BY-SA 4.0' },
		// navEntry: {
		// 	target: 'primary',
		// 	messageKey: 'nav-wiki-translate',
		// 	navPosition: 'after:community'
		// }
	}
]
