import { MAIN_NAVIGATION_ITEMS } from '../../config/mainNavigation'
import { isExplorerRoutePath } from './explorerRoute'

/** Content locales that use a URL prefix (must match `nuxt.config.ts` i18n locales). */
const NON_DEFAULT_CONTENT_LOCALE_PREFIXES = [ 'es', 'fr', 'he', 'fa' ] as const

/**
 * Strips a non-default content locale prefix from a route path.
 *
 * @param path - Vue Router path.
 * @returns Path without locale prefix (e.g. `/fr/learn` → `/learn`).
 */
export function stripContentLocalePrefix( path: string ): string {
	const normalizedPath = path.replace( /\/+$/, '' ) || '/'

	for ( const localeCode of NON_DEFAULT_CONTENT_LOCALE_PREFIXES ) {
		if ( normalizedPath === `/${ localeCode }` ) {
			return '/'
		}

		if ( normalizedPath.startsWith( `/${ localeCode }/` ) ) {
			return normalizedPath.slice( localeCode.length + 1 ) || '/'
		}
	}

	return normalizedPath
}

/**
 * Resolves the main navigation entry id for a content or explorer route path.
 *
 * @param path - Vue Router path (may include locale prefix).
 * @returns Main navigation id from `config/mainNavigation.ts`, or null when unmatched.
 */
export function getMainNavigationIdFromPath( path: string ): string | null {
	if ( isExplorerRoutePath( path ) ) {
		return 'api-explorer'
	}

	const contentPath = stripContentLocalePrefix( path )

	const matchingNavigationItem = MAIN_NAVIGATION_ITEMS.find( ( navigationItem ) => {
		if ( navigationItem.path === '/' ) {
			return contentPath === '/'
		}

		return contentPath === navigationItem.path
			|| contentPath.startsWith( `${ navigationItem.path }/` )
	} )

	return matchingNavigationItem?.id ?? null
}
