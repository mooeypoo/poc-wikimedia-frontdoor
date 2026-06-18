/**
 * Legacy content path redirects (HTTP 301).
 *
 * Merged into `nuxt.config.ts` `routeRules`. Locale-prefixed paths use the same
 * slug mapping with a `/{locale}` prefix (`prefix_except_default` strategy).
 */

const NON_DEFAULT_CONTENT_LOCALE_CODES = [ 'es', 'fr', 'he', 'fa' ] as const

/** Locale-agnostic legacy path → replacement path (empty string → home `/`). */
const LEGACY_PATH_REDIRECTS: Readonly<Record<string, string>> = {
	'/learn': '/use-content-and-data',
	'/about': '/',
	'/enterprise': '/'
}

/**
 * Builds Nuxt `routeRules` redirect entries for legacy content URLs.
 *
 * @returns Record suitable for spreading into `nuxt.config.ts` `routeRules`.
 */
export function buildLegacyContentRedirectRouteRules(): Record<string, { redirect: { to: string, statusCode: number } }> {
	const routeRules: Record<string, { redirect: { to: string, statusCode: number } }> = {}

	for ( const [ legacyPath, targetPath ] of Object.entries( LEGACY_PATH_REDIRECTS ) ) {
		routeRules[ legacyPath ] = {
			redirect: { to: targetPath, statusCode: 301 }
		}

		for ( const localeCode of NON_DEFAULT_CONTENT_LOCALE_CODES ) {
			const localizedLegacyPath = `/${ localeCode }${ legacyPath }`
			const localizedTargetPath = targetPath === '/'
				? `/${ localeCode }`
				: `/${ localeCode }${ targetPath }`

			routeRules[ localizedLegacyPath ] = {
				redirect: { to: localizedTargetPath, statusCode: 301 }
			}
		}
	}

	return routeRules
}
