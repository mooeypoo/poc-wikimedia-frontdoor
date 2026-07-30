import { MAIN_NAVIGATION_ITEMS } from '../../config/mainNavigation'
import { REMOTE_CONTENT_SOURCES } from '../../config/remoteContentSources'
import { isExplorerRoutePath } from './explorerRoute'

/**
 * Main-navigation id that owns the API Explorer (the **APIs** tab), from
 * `config/mainNavigation.ts`. Explorer routes (`/explorer`, `/explorer/…`) live
 * under this tab even though its path is `/apis`.
 */
const API_EXPLORER_NAVIGATION_ID = 'apis'

/** Content locales that use a URL prefix (must match `nuxt.config.ts` i18n locales). */
const NON_DEFAULT_CONTENT_LOCALE_PREFIXES = [ 'es', 'fr', 'he', 'fa' ] as const

/**
 * Resolves the content locale a route path belongs to.
 *
 * Mirrors the `prefix_except_default` i18n strategy: a non-default locale prefix
 * (e.g. `/fr/...`) resolves to that locale; anything else is the default (`en`).
 *
 * @param path - Vue Router path.
 * @returns Content locale code (`en` when no non-default prefix is present).
 */
export function contentLocaleFromPath( path: string ): string {
	const normalizedPath = path.replace( /\/+$/, '' ) || '/'

	for ( const localeCode of NON_DEFAULT_CONTENT_LOCALE_PREFIXES ) {
		if ( normalizedPath === `/${ localeCode }`
			|| normalizedPath.startsWith( `/${ localeCode }/` ) ) {
			return localeCode
		}
	}

	return 'en'
}

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
 * Resolves the main navigation entry id for a route path.
 *
 * Matches `MAIN_NAVIGATION_ITEMS` and remote sources with `navEntry.target === 'primary'`.
 * Explorer routes (`/explorer`, `/explorer/…`) resolve to the **APIs** tab id (`apis`).
 *
 * @param path - Vue Router path (may include locale prefix).
 * @returns Main navigation id from `config/mainNavigation.ts` or a remote source id, or null.
 */
export function getMainNavigationIdFromPath( path: string ): string | null {
	// Explorer routes are owned by the APIs tab but do not share its `/apis`
	// path, so match them explicitly (this also drives the `apis` section-nav
	// menu on `/explorer`, mirroring `/apis`).
	if ( isExplorerRoutePath( path ) ) {
		return API_EXPLORER_NAVIGATION_ID
	}

	const contentPath = stripContentLocalePrefix( path )

	for ( const remoteSource of REMOTE_CONTENT_SOURCES ) {
		if ( remoteSource.navEntry?.target !== 'primary' ) {
			continue
		}

		const remoteContentPath = `/${ remoteSource.localPath }`

		if ( contentPath === remoteContentPath
			|| contentPath.startsWith( `${ remoteContentPath }/` ) ) {
			return remoteSource.id
		}
	}

	const matchingNavigationItem = MAIN_NAVIGATION_ITEMS.find( ( navigationItem ) => {
		if ( navigationItem.path === '/' ) {
			return contentPath === '/'
		}

		return contentPath === navigationItem.path
			|| contentPath.startsWith( `${ navigationItem.path }/` )
	} )

	return matchingNavigationItem?.id ?? null
}
