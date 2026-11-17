/**
 * config/sectionNavigation.js
 *
 * Left-hand section navigation structure for content pages, keyed by
 * `MainNavigationItem.id` from `config/mainNavigation.ts`.
 *
 * An entry with `sections: []` still mounts the start panel in the shell;
 * `ShellSidePanelNav` is omitted until sections are defined.
 *
 * Labels resolve at runtime via banana-i18n. Each item's `href` is a
 * locale-agnostic content path; `usePageSectionNav()` applies the active
 * content-locale prefix (`prefix_except_default`) before navigation.
 */

/**
 * @typedef {object} SectionNavItem
 * @property {string} id - Stable id for the nav item.
 * @property {string} messageKey - banana-i18n message key for the link label.
 * @property {string} [href] - Locale-agnostic content path the item links to
 *   (e.g. `/quick-start`). Resolved to a locale-aware route by `usePageSectionNav()`.
 *   API Explorer paths (`/explorer`, `/explorer/…`) are left unprefixed
 *   (`i18n: false`). Omit for a non-navigating placeholder link.
 * @property {boolean} [enabled] - When false, the item is hidden entirely
 *   (functionality may still be wired). Defaults to true.
 */

/**
 * @typedef {object} SectionNavSection
 * @property {string} id - Stable id for the nav section.
 * @property {string} titleMessageKey - banana-i18n message key for the section heading.
 * @property {SectionNavItem[]} items - Links listed under the section heading.
 */

/**
 * @typedef {object} SectionNavigationDefinition
 * @property {string} ariaLabelMessageKey - banana-i18n key for the nav region accessible name.
 * @property {SectionNavSection[]} sections - Ordered section groups for the page menu.
 */

/** @type {Record<string, SectionNavigationDefinition>} */
export const SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID = {
	// APIs / API Explorer. Shared by the `/apis` catalog page and every
	// `/explorer` route (both resolve to the `apis` main-nav id — see
	// `getMainNavigationIdFromPath`). Explorer-mode links are plain `href`s to
	// their public URLs; `resolveContentHref` leaves `/explorer` paths unprefixed
	// (`i18n: false`) and active state is derived from the path like any content item.
	apis: {
		ariaLabelMessageKey: 'explorer-side-nav-label',
		sections: [
			{
				id: 'overview',
				titleMessageKey: 'nav-api',
				items: [
					{ id: 'apis-overview', messageKey: 'section-nav-overview', href: '/apis' },
					{ id: 'quickstart', messageKey: 'Quick start', href: '/apis/quickstart' },
					{ id: 'catalog', messageKey: 'API catalog', href: '/apis/catalog' }
				]
			},
			{
				id: 'requests',
				titleMessageKey: 'Guides',
				items: [
					{ id: 'requests-overview', messageKey: 'Making requests', href: '/apis/overview' },
					{ id: 'rate-limits', messageKey: 'Rate limits', href: '/apis/rate-limits' },
					{ id: 'auth-overview', messageKey: 'Authentication', href: '/apis/auth' },
					{ id: 'stability-policy', messageKey: 'Versioning and stability', href: '/apis/stability' },
					{ id: 'troubleshooting', messageKey: 'Troubleshooting', href: '/apis/troubleshooting' },
				]
			},
			{
				id: 'api-explorer',
				titleMessageKey: 'API explorer',
				items: [
					{ id: 'wikimedia-api-modules', messageKey: 'explorer-side-nav-wikimedia-api-modules', href: '/explorer' },
					{ id: 'enterprise-apis', messageKey: 'explorer-side-nav-enterprise-apis', href: '/explorer/enterprise' },
					{ id: 'clients', messageKey: 'Client libraries', href: '/apis/libraries' },
					{
						// Stays hidden: the "Enterprise APIs" entry above now renders the
						// bespoke viewer itself (ENTERPRISE_EXPLORER_USE_CUSTOM_VIEWER in
						// config/enterpriseExplorer.ts), so exposing this would be a second
						// nav item for the same experience. The `/explorer/enterprise-custom`
						// route and component remain wired. See ADR §5.2 on `enabled`.
						id: 'enterprise-apis-custom',
						messageKey: 'explorer-side-nav-enterprise-apis-custom',
						href: '/explorer/enterprise-custom',
						enabled: false
					}
				]
			},
			{
				id: 'resources',
				titleMessageKey: 'explorer-side-nav-resources-title',
				items: [
					{ id: 'changelog', messageKey: 'explorer-side-nav-changelog', href: '/apis/changelog' },
					{ id: 'policies', messageKey: 'Policies', href: '/apis/policies' }
				]
			}
		]
	},
	'get-started': {
		ariaLabelMessageKey: 'section-nav-get-started-label',
		sections: [
			{
				id: 'get-started',
				titleMessageKey: 'nav-get-started',
				items: [
					{ id: 'get-started-overview', messageKey: 'section-nav-overview', href: '/get-started' },
					{ id: 'learn-about-wikimedia', messageKey: 'section-nav-get-started-learn-about-wikimedia', href: '/get-started/about-wikimedia' },
					{ id: 'tutorials', messageKey: 'Learn with tutorials', href: '/get-started/tutorials' }
				]
			},
			{
				id: 'for-communities',
				titleMessageKey: 'Start building',
				items: [
					{ id: 'community-overview', messageKey: 'Use Wikimedia content', href: '/get-started/wiki-content' },
					{ id: 'access-open-data', messageKey: 'Access open data', href: '/get-started/open-data' },
					{ id: 'commercial-use-cases', messageKey: 'Build for Wikimedia communities', href: '/get-started/tools-and-bots' },
					{ id: 'commercial', messageKey: 'Build for commercial use cases', href: '/get-started/commercial' }
				]
			},
			{
				id: 'x',
				titleMessageKey: 'Explore',
				items: [
					{ id: 'explore-featured-apps', messageKey: 'Browse featured apps', href: '/get-started/featured-apps' },
					{ id: 'catalog', messageKey: 'Browse APIs', href: '/apis/catalog' }
				]
			},
		]
	},
	community: {
		ariaLabelMessageKey: 'section-nav-community-label',
		sections: [
			{
				id: 'community',
				titleMessageKey: 'nav-community',
				items: [
					{ id: 'community-overview', messageKey: 'section-nav-overview', href: '/community' },
					{ id: 'explore-hackathons-and-events', messageKey: 'section-nav-community-explore-hackathons-and-events', href: '/community/events' },
					{ id: 'communicate-with-tech-community', messageKey: 'section-nav-community-communicate-with-tech-community', href: '/community/communicate' },
					{ id: 'learn-and-share-technical-skills', messageKey: 'section-nav-community-learn-and-share-technical-skills', href: '/community/grow' },
					{ id: 'get-tech-project-updates', messageKey: 'section-nav-community-get-tech-project-updates', href: '/community/updates' },
					{ id: 'learn-about-wikimedia-technical-operations', messageKey: 'section-nav-community-learn-about-wikimedia-technical-operations', href: '/community/tech-ops' }
				]
			}
		]
	},
	contribute: {
		ariaLabelMessageKey: 'section-nav-contribute-label',
		sections: [
			{
				id: 'contribute',
				titleMessageKey: 'nav-contribute',
				items: [
					{ id: 'contribute-overview', messageKey: 'section-nav-overview', href: '/contribute' },
					{ id: 'learn-how-contributing-works', messageKey: 'section-nav-contribute-learn-how-contributing-works', href: '/contribute/learn' },
					{ id: 'dp', messageKey: 'Contribute to the Developer Portal', href: '/contribute/dev-portal' },
				]
			},
			{
				id: 'find-projects',
				titleMessageKey: 'Find open source projects',
				items: [
					{ id: 'contribute-by-topic', messageKey: 'section-nav-contribute-contribute-by-topic', href: '/contribute/by-topic' },
					{ id: 'contribute-by-programming-language', messageKey: 'section-nav-contribute-contribute-by-programming-language', href: '/contribute/by-language' },
					{ id: 'search-all-projects', messageKey: 'section-nav-contribute-search-all-projects', href: '/contribute/search' }
				]
			},
		]
	},
	'get-help': {
		ariaLabelMessageKey: 'section-nav-get-help-label',
		sections: [
			{
				id: 'get-help',
				titleMessageKey: 'nav-get-help',
				items: [
					{ id: 'get-help-overview', messageKey: 'section-nav-overview', href: '/get-help' },
					{ id: 'get-help-about', messageKey: 'section-nav-get-help-about', href: '/get-help/about' }
				]
			}
		]
	}
}
