/**
 * Primary site navigation entries in display order.
 *
 * Paths are locale-agnostic; {@link useMainNavigationLinks} applies the active
 * content locale prefix (`prefix_except_default`). The API Explorer path is
 * always `/explorer` (see `definePageMeta({ i18n: false })` on that route).
 */
export interface MainNavigationItem {
	id: string
	messageKey: string
	path: string
}

export const MAIN_NAVIGATION_ITEMS: readonly MainNavigationItem[] = [
	{
		id: 'get-started',
		messageKey: 'nav-get-started',
		path: '/'
	},
	{
		id: 'learn',
		messageKey: 'nav-learn',
		path: '/learn'
	},
	{
		id: 'api-explorer',
		messageKey: 'nav-api',
		path: '/explorer'
	},
	{
		id: 'enterprise',
		messageKey: 'nav-enterprise',
		path: '/enterprise'
	},
	{
		id: 'community',
		messageKey: 'nav-community',
		path: '/community'
	},
	{
		id: 'contribute',
		messageKey: 'nav-contribute',
		path: '/contribute'
	},
	{
		id: 'get-help',
		messageKey: 'nav-get-help',
		path: '/get-help'
	},
	{
		id: 'about',
		messageKey: 'nav-about',
		path: '/about'
	}
]
