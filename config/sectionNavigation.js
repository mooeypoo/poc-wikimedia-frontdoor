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
					{ id: 'licensing-attribution', messageKey: 'explorer-side-nav-licensing-attribution', href: '/apis/attribution' },
					{ id: 'authentication', messageKey: 'explorer-side-nav-authentication', href: '/apis/authentication' },
					{ id: 'rate-limits', messageKey: 'explorer-side-nav-rate-limits', href: '/apis/rate-limits' },
					{ id: 'policies', messageKey: 'explorer-side-nav-policies', href: '/apis/policies' }
				]
			},
			{
				id: 'api-explorer',
				titleMessageKey: 'explorer-side-nav-api-explorer-title',
				items: [
					{ id: 'wikimedia-api-modules', messageKey: 'explorer-side-nav-wikimedia-api-modules', href: '/explorer' },
					{ id: 'enterprise-apis', messageKey: 'explorer-side-nav-enterprise-apis', href: '/explorer/enterprise' },
					{
						// Hidden for now (functionality retained — the enterprise-custom
						// mode, route, and component are all still wired; flip `enabled`
						// to true to re-expose it). See ADR §5.2 on the `enabled` toggle.
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
	},
	'get-started': {
		ariaLabelMessageKey: 'section-nav-get-started-label',
		sections: [
			{
				id: 'get-started',
				titleMessageKey: 'nav-get-started',
				items: [
					{ id: 'get-started-overview', messageKey: 'section-nav-overview', href: '/get-started' },
					{ id: 'quick-start', messageKey: 'section-nav-get-started-quick-start', href: '/get-started/quick-start' },
					{ id: 'learn-about-wikimedia', messageKey: 'section-nav-get-started-learn-about-wikimedia', href: '/get-started/about-wikimedia' }
				]
			},
			{
				id: 'for-communities',
				titleMessageKey: 'section-nav-get-started-for-communities-title',
				items: [
					{ id: 'community-overview', messageKey: 'section-nav-overview', href: '/get-started/build-for-communities' },
					{ id: 'use-wiki-content', messageKey: 'section-nav-get-started-use-wiki-content', href: '/get-started/wiki-content' },
					{ id: 'access-open-data', messageKey: 'section-nav-get-started-access-open-data', href: '/get-started/open-data' },
					{ id: 'tools-and-bots', messageKey: 'section-nav-get-started-tools-and-bots', href: '/get-started/tools-and-bots' },
					{ id: 'on-wiki-features', messageKey: 'section-nav-get-started-on-wiki-features', href: '/get-started/on-wiki' }
				]
			},
			{
				id: 'for-enterprise',
				titleMessageKey: 'section-nav-get-started-for-enterprise-title',
				items: [
					{ id: 'wikimedia-enterprise', messageKey: 'section-nav-get-started-about-enterprise', href: '/get-started/wikimedia-enterprise' },
					{ id: 'commercial-use-cases', messageKey: 'section-nav-get-started-commercial-use-cases', href: '/get-started/commercial-use-cases' },
					{ id: 'data-for-research', messageKey: 'section-nav-get-started-data-for-research', href: '/get-started/data-for-research' }
				]
			},
			{
				id: 'explore',
				titleMessageKey: 'section-nav-get-started-explore-title',
				items: [
					{ id: 'explore-featured-apps', messageKey: 'section-nav-get-started-explore-featured-apps', href: '/get-started/featured-apps' },
					{ id: 'tutorials', messageKey: 'section-nav-get-started-tutorials', href: '/get-started/tutorials' },
					{ id: 'by-language', messageKey: 'section-nav-get-started-by-language', href: '/get-started/by-language' }
				]
			}
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
					{ id: 'contribute-by-topic', messageKey: 'section-nav-contribute-contribute-by-topic', href: '/contribute/by-topic' },
					{ id: 'contribute-by-programming-language', messageKey: 'section-nav-contribute-contribute-by-programming-language', href: '/contribute/by-language' },
					{ id: 'search-all-projects', messageKey: 'section-nav-contribute-search-all-projects', href: '/contribute/search' }
				]
			},
			{
				id: 'developer-portal',
				titleMessageKey: 'section-nav-contribute-developer-portal-title',
				items: [
					{ id: 'contribute-code', messageKey: 'section-nav-contribute-contribute-code', href: '/contribute-code' },
					{ id: 'edit-the-docs', messageKey: 'section-nav-contribute-edit-the-docs', href: '/edit-the-docs' },
					{ id: 'write-a-guide', messageKey: 'section-nav-contribute-write-a-guide', href: '/write-a-guide' }
				]
			}
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
	},
	// Static API reference. Only the fixed part lives here — the module list and
	// each module's operations are data, not policy, so `useReferenceSectionNav`
	// appends them at runtime from the same payload the page already fetched. See
	// docs/adr-static-module-documentation.md §13a.
	reference: {
		ariaLabelMessageKey: 'section-nav-reference-label',
		sections: [
			{
				id: 'reference-overview',
				titleMessageKey: 'nav-reference',
				items: [
					{ id: 'reference-index', messageKey: 'section-nav-reference-index', href: '/reference' }
				]
			}
		]
	}
}
