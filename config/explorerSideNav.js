/**
 * config/explorerSideNav.js
 *
 * Static section structure for the API Explorer left-hand navigation menu.
 * Labels are resolved at runtime via banana-i18n using each entry's messageKey.
 */

/**
 * @typedef {'community' | 'enterprise-full' | 'enterprise-limited'} ExplorerMode
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
				enabled: false
			},
			{
				id: 'enterprise-apis-limited',
				messageKey: 'explorer-side-nav-enterprise-apis-limited',
				mode: 'enterprise-limited',
				enabled: false
			}
		]
	},
	{
		id: 'overview',
		titleMessageKey: 'explorer-side-nav-overview-title',
		items: [
			{ id: 'access-policy', messageKey: 'explorer-side-nav-access-policy' },
			{ id: 'rate-limits', messageKey: 'explorer-side-nav-rate-limits' },
			{ id: 'authentication', messageKey: 'explorer-side-nav-authentication' },
			{ id: 'licensing-attribution', messageKey: 'explorer-side-nav-licensing-attribution' },
			{ id: 'stability-policy', messageKey: 'explorer-side-nav-stability-policy' },
			{ id: 'changelog', messageKey: 'explorer-side-nav-changelog' },
			{ id: 'libraries-sdks', messageKey: 'explorer-side-nav-libraries-sdks' }
		]
	}
]
