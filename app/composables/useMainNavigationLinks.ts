import { MAIN_NAVIGATION_ITEMS, type MainNavigationItem } from '../../config/mainNavigation'

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
 * Resolves main navigation labels and paths for the current interface locale.
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

		return MAIN_NAVIGATION_ITEMS.map( ( navigationItem ) => ( {
			...navigationItem,
			label: $bananaI18n( navigationItem.messageKey ),
			to: navigationItem.path === '/explorer'
				? '/explorer'
				: buildContentRoutePath( navigationItem, localeCode )
		} ) )
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
