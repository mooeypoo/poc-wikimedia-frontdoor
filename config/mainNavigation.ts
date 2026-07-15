/**
 * Primary site navigation entries in display order.
 *
 * Paths are locale-agnostic; {@link useMainNavigationLinks} applies the active
 * content locale prefix (`prefix_except_default`). Remote content sources with
 * `navEntry.target === 'primary'` are merged at runtime (see
 * `config/remoteContentSources.ts`).
 *
 * API Explorer is **not** a tab — it is a separate header link to `/explorer`
 * (`i18n: false` on that route). See Figma Header node 284:11443.
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
		id: 'use-content-and-data',
		messageKey: 'nav-use-content-and-data',
		path: '/use-content-and-data'
	},
	{
		id: 'tools-and-bots',
		messageKey: 'nav-tools-and-bots',
		path: '/tools-and-bots'
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
	}
	// 'get-help' was replaced in the primary bar by the wiki-translated demo page
	// (see config/remoteContentSources.ts). The /get-help content page still exists.
]

/** Locale-independent path for the API Explorer header link. */
export const API_EXPLORER_NAVIGATION_PATH = '/explorer'
