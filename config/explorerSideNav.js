/**
 * config/explorerSideNav.js
 *
 * @deprecated The APIs / API Explorer start-column menu lives in
 * `config/sectionNavigation.js` under the `apis` key (plain `href`s, including
 * `/explorer` paths). Kept temporarily so older ADRs and docs that still name
 * this file remain discoverable; do not add new items here.
 *
 * Historical note: items previously used a `mode` field resolved by
 * `usePageSectionNav()` via `pathForExplorerMode`. That dual path was removed
 * when the explorer sidebar was unified into content section-nav (main).
 */

/**
 * @typedef {'community' | 'enterprise-full' | 'enterprise-custom'} ExplorerMode
 */

/**
 * @typedef {object} ExplorerSideNavItem
 * @property {string} id - Stable id for the nav item.
 * @property {string} messageKey - banana-i18n message key for the link label.
 * @property {string} [href] - Locale-agnostic path (preferred; see sectionNavigation.js).
 * @property {ExplorerMode} [mode] - Legacy explorer mode (unused by usePageSectionNav).
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
				href: '/explorer'
			},
			{
				id: 'enterprise-apis',
				messageKey: 'explorer-side-nav-enterprise-apis',
				href: '/explorer/enterprise',
				enabled: true
			},
			{
				// Hidden from the sidebar for now (functionality retained — the
				// enterprise-custom mode, route, and component are all still wired;
				// flip to true to re-expose it). See ADR §5.2 on the `enabled` toggle.
				id: 'enterprise-apis-custom',
				messageKey: 'explorer-side-nav-enterprise-apis-custom',
				href: '/explorer/enterprise-custom',
				enabled: false
			},
			{ id: 'libraries-sdks', messageKey: 'explorer-side-nav-libraries-sdks', href: '/apis/libraries-sdks' }
		]
	},
	{
		id: 'resources',
		titleMessageKey: 'explorer-side-nav-resources-title',
		items: [
			{ id: 'changelog', messageKey: 'explorer-side-nav-changelog', href: '/apis/changelog' },
			{ id: 'stability-policy', messageKey: 'explorer-side-nav-stability-policy', href: '/apis/stability' },
			{ id: 'troubleshooting-guide', messageKey: 'section-nav-get-help-troubleshooting-guide', href: '/apis/troubleshooting' }
		]
	}
]
