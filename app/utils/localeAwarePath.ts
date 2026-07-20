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
