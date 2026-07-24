/**
 * Primary site navigation entries in display order.
 *
 * Paths are locale-agnostic; {@link useMainNavigationLinks} applies the active
 * content locale prefix (`prefix_except_default`), except for `/explorer`
 * (`i18n: false` on that route). The **APIs** tab (`nav-api`) owns explorer routes;
 * the start-column section heading remains **API Explorer**
 * (`explorer-side-nav-api-explorer-title`).
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
		path: '/get-started'
	},
	{
		id: 'apis',
		messageKey: 'nav-api',
		path: '/apis'
	},
	{
		id: 'contribute',
		messageKey: 'nav-contribute',
		path: '/contribute'
	},
	{
		id: 'community',
		messageKey: 'nav-community',
		path: '/community'
	},
	{
		id: 'get-help',
		messageKey: 'nav-get-help',
		path: '/get-help'
	}
]

/** Locale-independent path for the API Explorer / APIs primary nav destination. */
export const API_EXPLORER_NAVIGATION_PATH = '/explorer'
