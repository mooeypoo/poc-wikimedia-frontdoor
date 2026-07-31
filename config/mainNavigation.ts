/**
 * Primary site navigation entries in display order.
 *
 * Paths are locale-agnostic; {@link useMainNavigationLinks} applies the active
 * content locale prefix (`prefix_except_default`), except for `/explorer`
 * (`i18n: false` on that route). The **APIs** tab (`nav-api`) lands on the API
 * catalog (`/apis`); explorer routes (`/explorer`, `/explorer/…`) keep the tab
 * selected via {@link getMainNavigationIdFromPath}. The start-column section
 * heading on explorer routes remains **API Explorer**
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

/** Locale-independent path for the API catalog (APIs primary nav destination). */
export const API_CATALOG_NAVIGATION_PATH = '/apis'

/** Locale-independent path for the API Explorer (`i18n: false`; never locale-prefixed). */
export const API_EXPLORER_NAVIGATION_PATH = '/explorer'
