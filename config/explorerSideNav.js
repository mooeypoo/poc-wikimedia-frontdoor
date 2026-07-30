/**
 * config/explorerSideNav.js
 *
 * Static section structure for the **APIs** primary-tab start-column menu
 * (catalog `/apis`, `/apis/…`, and explorer `/explorer` / `/explorer/…`).
 * Labels are resolved at runtime via banana-i18n using each entry's messageKey.
 *
 * Items with a `mode` field navigate to explorer routes via `usePageSectionNav()`
 * (`pathForExplorerMode` in `app/utils/explorerRoute.ts`). Items with `href`
 * navigate to content pages (e.g. `/apis/attribution`). Active state is derived
 * from the current route — do not set `isActive` in this config.
 *
 * The catalog landing (`/apis`) is the section overview (same role as
 * `/get-started` under Get started) and does not need its own menu row.
 */

/**
 * @typedef {'community' | 'enterprise-full' | 'enterprise-custom'} ExplorerMode
 */

/**
 * @typedef {object} ExplorerSideNavItem
 * @property {string} id - Stable id for the nav item.
 * @property {string} messageKey - banana-i18n message key for the link label.
 * @property {ExplorerMode} mode - Explorer mode this item activates.
 * @property {boolean} [enabled] - When false, the item is hidden entirely. Defaults to true.
 */

/**
 * @typedef {object} ExplorerSideNavSection
 * @property {string} id - Stable id for the nav section.
 * @property {string} titleMessageKey - banana-i18n message key for the section heading.
 * @property {ExplorerSideNavItem[]} items - Links listed under the section heading.
 */

/** @type {ExplorerSideNavSection[]} */
export const EXPLORER_SIDE_NAV_SECTIONS = [
	{
		id: 'overview',
		titleMessageKey: 'explorer-side-nav-overview-title',
		items: [
			{ id: 'licensing-attribution', messageKey: 'explorer-side-nav-licensing-attribution', href: '/apis/attribution' },
			{ id: 'authentication', messageKey: 'explorer-side-nav-authentication', href: '/apis/authentication' },
			{ id: 'rate-limits', messageKey: 'explorer-side-nav-rate-limits', href: '/apis/rate-limits' }

		]
	},
	{
		id: 'api-explorer',
		titleMessageKey: 'explorer-side-nav-api-explorer-title',
		items: [
			{
				id: 'wikimedia-api-modules',
				messageKey: 'explorer-side-nav-wikimedia-api-modules',
				mode: 'community'
			},
			{
				id: 'enterprise-apis',
				messageKey: 'explorer-side-nav-enterprise-apis',
				mode: 'enterprise-full',
				enabled: true
			},
			{
				// Hidden from the sidebar for now (functionality retained — the
				// enterprise-custom mode, route, and component are all still wired;
				// flip to true to re-expose it). See ADR §5.2 on the `enabled` toggle.
				id: 'enterprise-apis-custom',
				messageKey: 'explorer-side-nav-enterprise-apis-custom',
				mode: 'enterprise-custom',
				enabled: false
			},
			{ id: 'libraries-sdks', messageKey: 'explorer-side-nav-libraries-sdks' }
		]
	},
	{
		id: 'resources',
		titleMessageKey: 'explorer-side-nav-resources-title',
		items: [
			{ id: 'changelog', messageKey: 'explorer-side-nav-changelog' },
			{ id: 'stability-policy', messageKey: 'explorer-side-nav-stability-policy' },
			{ id: 'troubleshooting-guide', messageKey: 'section-nav-get-help-troubleshooting-guide', href: '/troubleshooting' }
		]
	},
]
