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
 * @property {string} href - Locale-agnostic content path the item links to
 *   (e.g. `/quick-start`). Resolved to a locale-aware route by `usePageSectionNav()`.
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
	'get-started': {
		ariaLabelMessageKey: 'section-nav-get-started-label',
		sections: [
			{
				id: 'get-started',
				titleMessageKey: 'section-nav-get-started-title',
				items: [
					{ id: 'quick-start', messageKey: 'section-nav-get-started-quick-start', href: '/quick-start' },
					{ id: 'learn-about-wikimedia', messageKey: 'section-nav-get-started-learn-about-wikimedia', href: '/about-wikimedia' }
				]
			},
			{
				id: 'for-communities',
				titleMessageKey: 'section-nav-get-started-for-communities-title',
				items: [
					{ id: 'use-wiki-content', messageKey: 'section-nav-get-started-use-wiki-content', href: '/wiki-content' },
					{ id: 'access-open-data', messageKey: 'section-nav-get-started-access-open-data', href: '/open-data' },
					{ id: 'on-wiki-features', messageKey: 'section-nav-get-started-on-wiki-features', href: '/on-wiki' },
					{ id: 'tools-and-bots', messageKey: 'section-nav-get-started-tools-and-bots', href: '/tools-and-bots' }
				]
			},
			{
				id: 'for-enterprise',
				titleMessageKey: 'section-nav-get-started-for-enterprise-title',
				items: [
					{ id: 'about-enterprise', messageKey: 'section-nav-get-started-about-enterprise', href: '/wikimedia-enterprise' },
					{ id: 'commercial-use-cases', messageKey: 'section-nav-get-started-commercial-use-cases', href: '/commercial-use-cases' }
				]
			},
			{
				id: 'explore',
				titleMessageKey: 'section-nav-get-started-explore-title',
				items: [
					{ id: 'explore-featured-apps', messageKey: 'section-nav-get-started-explore-featured-apps', href: '/featured-apps' },
					{ id: 'tutorials', messageKey: 'section-nav-get-started-tutorials', href: '/tutorials' },
					{ id: 'by-language', messageKey: 'section-nav-get-started-by-language', href: '/by-language' }
				]
			}
		]
	},
	'use-content-and-data': {
		ariaLabelMessageKey: 'section-nav-use-content-and-data-label',
		sections: [
			{
				id: 'use-content-and-data',
				titleMessageKey: 'section-nav-use-content-and-data-title',
				items: [
					{ id: 'get-started-link', messageKey: 'section-nav-learn-get-started-link', href: '/get-started' }
				]
			},
			{
				id: 'guides',
				titleMessageKey: 'section-nav-learn-guides-title',
				items: [
					{ id: 'reuse-wikimedia-content', messageKey: 'section-nav-learn-reuse-wikimedia-content', href: '/reuse-wikimedia-content' },
					{ id: 'login-with-wikimedia', messageKey: 'section-nav-learn-login-with-wikimedia', href: '/login-with-wikimedia' },
					{ id: 'troubleshooting', messageKey: 'section-nav-learn-troubleshooting', href: '/troubleshooting' },
					{ id: 'browse-all-guides', messageKey: 'section-nav-learn-browse-all-guides', href: '/browse-all-guides' }
				]
			},
			{
				id: 'tutorials',
				titleMessageKey: 'section-nav-learn-tutorials-title',
				items: [
					{ id: 'display-holidays-from-wikipedia', messageKey: 'section-nav-learn-display-holidays-from-wikipedia', href: '/display-holidays-from-wikipedia' },
					{ id: 'reuse-media-files', messageKey: 'section-nav-learn-reuse-media-files', href: '/reuse-media-files' },
					{ id: 'compare-page-metrics', messageKey: 'section-nav-learn-compare-page-metrics', href: '/compare-page-metrics' },
					{ id: 'browse-all-tutorials', messageKey: 'section-nav-learn-browse-all-tutorials', href: '/browse-all-tutorials' }
				]
			},
			{
				id: 'concepts',
				titleMessageKey: 'section-nav-learn-concepts-title',
				items: [
					{ id: 'page-views', messageKey: 'section-nav-learn-page-views', href: '/page-views' },
					{ id: 'unique-devices', messageKey: 'section-nav-learn-unique-devices', href: '/unique-devices' },
					{ id: 'machine-learning-models', messageKey: 'section-nav-learn-machine-learning-models', href: '/machine-learning-models' },
					{ id: 'browse-all-concepts', messageKey: 'section-nav-learn-browse-all-concepts', href: '/browse-all-concepts' }
				]
			},
			{
				id: 'policies',
				titleMessageKey: 'section-nav-learn-policies-title',
				items: [
					{ id: 'terms-of-use', messageKey: 'section-nav-learn-terms-of-use', href: '/terms-of-use' },
					{ id: 'privacy-policy', messageKey: 'section-nav-learn-privacy-policy', href: '/privacy-policy' },
					{ id: 'robot-policy', messageKey: 'section-nav-learn-robot-policy', href: '/robot-policy' },
					{ id: 'browse-all-policies', messageKey: 'section-nav-learn-browse-all-policies', href: '/browse-all-policies' }
				]
			}
		]
	},
	'tools-and-bots': {
		ariaLabelMessageKey: 'section-nav-tools-and-bots-label',
		sections: [] // Empty — start panel still mounts; no ShellSidePanelNav links
	},
	community: {
		ariaLabelMessageKey: 'section-nav-community-label',
		sections: [
			{
				id: 'community',
				titleMessageKey: 'section-nav-community-title',
				items: [
					{ id: 'explore-hackathons-and-events', messageKey: 'section-nav-community-explore-hackathons-and-events', href: '/explore-hackathons-and-events' },
					{ id: 'communicate-with-tech-community', messageKey: 'section-nav-community-communicate-with-tech-community', href: '/communicate-with-tech-community' },
					{ id: 'learn-and-share-technical-skills', messageKey: 'section-nav-community-learn-and-share-technical-skills', href: '/learn-and-share-technical-skills' },
					{ id: 'get-tech-project-updates', messageKey: 'section-nav-community-get-tech-project-updates', href: '/get-tech-project-updates' },
					{ id: 'learn-about-wikimedia-technical-operations', messageKey: 'section-nav-community-learn-about-wikimedia-technical-operations', href: '/learn-about-wikimedia-technical-operations' }
				]
			}
		]
	},
	contribute: {
		ariaLabelMessageKey: 'section-nav-contribute-label',
		sections: [
			{
				id: 'contribute',
				titleMessageKey: 'section-nav-contribute-title',
				items: [
					{ id: 'wikimedia-open-source', messageKey: 'section-nav-contribute-wikimedia-open-source', href: '/wikimedia-open-source' },
					{ id: 'learn-how-contributing-works', messageKey: 'section-nav-contribute-learn-how-contributing-works', href: '/learn-how-contributing-works' },
					{ id: 'contribute-by-topic', messageKey: 'section-nav-contribute-contribute-by-topic', href: '/contribute-by-topic' },
					{ id: 'contribute-by-programming-language', messageKey: 'section-nav-contribute-contribute-by-programming-language', href: '/contribute-by-programming-language' },
					{ id: 'search-all-projects', messageKey: 'section-nav-contribute-search-all-projects', href: '/search-all-projects' }
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
				titleMessageKey: 'section-nav-get-help-title',
				items: [
					{ id: 'troubleshooting-guide', messageKey: 'section-nav-get-help-troubleshooting-guide', href: '/troubleshooting-guide' }
				]
			}
		]
	}
}
