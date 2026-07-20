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
		path: '/get-started'
	},
	{
		id: 'apis',
		messageKey: 'nav-api',
		path: '/explorer'
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

/** Locale-independent path for the API Explorer header link. */
export const API_EXPLORER_NAVIGATION_PATH = '/explorer'
