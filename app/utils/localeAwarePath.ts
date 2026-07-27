import { API_EXPLORER_NAVIGATION_PATH } from '../../config/mainNavigation'

/** Default content locale; must match `defaultLocale` in `nuxt.config.ts`. */
export const DEFAULT_CONTENT_LOCALE = 'en'

/**
 * Builds a locale-aware app route path for `prefix_except_default` i18n strategy.
 *
 * @param basePath - Locale-agnostic path (e.g. `/account`, `/get-started`).
 * @param localeCode - Active interface / content locale code.
 * @returns Path with locale prefix when required.
 */
export function buildLocaleAwarePath( basePath: string, localeCode: string ): string {
	if ( localeCode === DEFAULT_CONTENT_LOCALE ) {
		return basePath
	}

	return `/${ localeCode }${ basePath }`
}

/**
 * Whether a locale-agnostic content path targets the API Explorer.
 *
 * The explorer route is `i18n: false`, so it must never be locale-prefixed —
 * wherever an author places a link to it (top nav, section sidebars, …).
 *
 * @param basePath - Locale-agnostic path from nav config (e.g. an item `href`).
 * @returns True for `/explorer` and any explorer sub-route (`/explorer/…`).
 */
export function isApiExplorerPath( basePath: string ): boolean {
	return basePath === API_EXPLORER_NAVIGATION_PATH
		|| basePath.startsWith( `${ API_EXPLORER_NAVIGATION_PATH }/` )
}

/**
 * Resolves a nav-config path/`href` to a route, applying locale prefixing to
 * content paths while leaving API Explorer paths untouched (they are
 * `i18n: false`). Use this for any menu surface that lets an author point at
 * `/explorer` so the explorer link works from top nav *and* section sidebars.
 *
 * @param basePath - Locale-agnostic path from nav config.
 * @param localeCode - Active interface / content locale code.
 * @returns Locale-aware route, or the explorer path verbatim.
 */
export function resolveContentHref( basePath: string, localeCode: string ): string {
	if ( isApiExplorerPath( basePath ) ) {
		return basePath
	}

	return buildLocaleAwarePath( basePath, localeCode )
}
