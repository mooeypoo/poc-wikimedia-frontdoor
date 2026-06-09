import { MAIN_NAVIGATION_ITEMS, type MainNavigationItem } from '../../config/mainNavigation'
import { REMOTE_CONTENT_SOURCES, type RemoteContentSource } from '../../config/remoteContentSources'

/** Default locale; must match `defaultLocale` in `nuxt.config.ts` (`prefix_except_default`). */
const DEFAULT_CONTENT_LOCALE = 'en'

export interface MainNavigationLink extends MainNavigationItem {
	label: string
	to: string
}

/**
 * Builds a localized content route path for `prefix_except_default` i18n strategy.
 *
 * @param navigationItem - Main navigation config entry.
 * @param localeCode - Active interface / content locale code.
 * @returns Path suitable for `NuxtLink` `to` (no reliance on `localePath()` from `/explorer`).
 */
function buildContentRoutePath( navigationItem: MainNavigationItem, localeCode: string ): string {
	if ( navigationItem.path === '/' ) {
		return localeCode === DEFAULT_CONTENT_LOCALE ? '/' : `/${ localeCode }`
	}

	return localeCode === DEFAULT_CONTENT_LOCALE
		? navigationItem.path
		: `/${ localeCode }${ navigationItem.path }`
}

/**
 * Maps a remote content source with a primary nav entry to a MainNavigationLink.
 *
 * @param source - Remote content source with navEntry
 * @param localeCode - Active interface locale code
 * @param bananaI18n - Banana i18n function
 * @returns MainNavigationLink for the remote source
 */
function remoteSourceToNavLink(
	source: RemoteContentSource,
	localeCode: string,
	bananaI18n: (key: string) => string
): MainNavigationLink {
	const path = `/${ source.localPath }`

	return {
		id: source.id,
		messageKey: source.navEntry!.messageKey,
		path,
		label: bananaI18n( source.navEntry!.messageKey ),
		to: buildContentRoutePath( { path, messageKey: '', id: source.id }, localeCode )
	}
}

/**
 * Merges remote content sources (with nav entries) into the main navigation items.
 *
 * Remote sources with navEntry.target === 'primary' are inserted according to their
 * navPosition field. Phase 2 will support additional nav targets.
 *
 * @param items - Base MAIN_NAVIGATION_ITEMS
 * @param localeCode - Active interface locale
 * @param bananaI18n - Banana i18n function
 * @returns Merged navigation items
 */
function mergeRemoteNavSources(
	items: MainNavigationItem[],
	localeCode: string,
	bananaI18n: (key: string) => string
): MainNavigationLink[] {
	// Convert base items to nav links
	const baseLinks = items.map( ( navigationItem ) => ( {
		...navigationItem,
		label: bananaI18n( navigationItem.messageKey ),
		to: navigationItem.path === '/explorer'
			? '/explorer'
			: buildContentRoutePath( navigationItem, localeCode )
	} ) ) as MainNavigationLink[]

	// Filter remote sources with primary nav target
	const remoteNavSources = REMOTE_CONTENT_SOURCES.filter(
		source => source.navEntry?.target === 'primary'
	)

	if ( remoteNavSources.length === 0 ) {
		return baseLinks
	}

	// Merge remote nav sources into the array respecting navPosition
	const mergedLinks = [ ...baseLinks ]

	for ( const source of remoteNavSources ) {
		const newLink = remoteSourceToNavLink( source, localeCode, bananaI18n )
		const position = source.navEntry!.navPosition

		if ( typeof position === 'number' ) {
			// Direct index insertion
			mergedLinks.splice( position, 0, newLink )
		} else if ( typeof position === 'string' && position.startsWith( 'after:' ) ) {
			// Insert after reference id
			const refId = position.substring( 6 ) // 'after:' is 6 chars
			const refIndex = mergedLinks.findIndex( link => link.id === refId )
			if ( refIndex >= 0 ) {
				mergedLinks.splice( refIndex + 1, 0, newLink )
			} else {
				// Reference not found; append to end
				mergedLinks.push( newLink )
			}
		}
	}

	return mergedLinks
}

/**
 * Resolves main navigation labels and paths for the current interface locale.
 *
 * Merges entries from REMOTE_CONTENT_SOURCES that declare navEntry.target === 'primary'
 * into the primary navigation according to their navPosition field.
 *
 * Explorer uses an explicit `/explorer` path because `localePath()` can return an
 * empty string when invoked from the `i18n: false` explorer route.
 *
 * @returns {{ mainNavigationLinks: import('vue').ComputedRef<MainNavigationLink[]>, getStartedPath: import('vue').ComputedRef<string> }}
 *   Shell navigation links with banana labels and locale-aware `to` paths.
 */
export function useMainNavigationLinks() {
	const { $bananaI18n, $interfaceLocale } = useNuxtApp()

	const mainNavigationLinks = computed<MainNavigationLink[]>( () => {
		const localeCode = $interfaceLocale.value
		return mergeRemoteNavSources( MAIN_NAVIGATION_ITEMS, localeCode, $bananaI18n )
	} )

	const getStartedPath = computed( () => {
		const getStartedItem = MAIN_NAVIGATION_ITEMS[ 0 ]
		return buildContentRoutePath( getStartedItem, $interfaceLocale.value )
	} )

	return {
		mainNavigationLinks,
		getStartedPath
	}
}
