/**
 * config/sectionNavigation.js
 *
 * Left-hand section navigation structure for content pages, keyed by
 * `MainNavigationItem.id` from `config/mainNavigation.ts`.
 *
 * An entry with `sections: []` still mounts the start panel in the shell;
 * `ShellSidePanelNav` is omitted until sections are defined.
 *
 * Labels resolve at runtime via banana-i18n. Link targets are prototype
 * placeholders (`href="#"`) until content routes exist.
 */

/**
 * @typedef {object} SectionNavItem
 * @property {string} id - Stable id for the nav item.
 * @property {string} messageKey - banana-i18n message key for the link label.
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
					{ id: 'introduction', messageKey: 'section-nav-get-started-introduction' },
					{ id: 'learn-about-wikimedia-projects', messageKey: 'section-nav-get-started-learn-about-wikimedia-projects' },
					{ id: 'learn-about-wikimedia-technology', messageKey: 'section-nav-get-started-learn-about-wikimedia-technology' },
					{ id: 'explore-featured-apps', messageKey: 'section-nav-get-started-explore-featured-apps' }
				]
			},
			{
				id: 'build-for-wikimedia-communities',
				titleMessageKey: 'section-nav-get-started-build-for-wikimedia-communities-title',
				items: [
					{ id: 'on-wiki-features', messageKey: 'section-nav-get-started-on-wiki-features' },
					{ id: 'tools-and-bots', messageKey: 'section-nav-get-started-tools-and-bots' },
					{ id: 'use-wiki-content', messageKey: 'section-nav-get-started-use-wiki-content' },
					{ id: 'access-open-data', messageKey: 'section-nav-get-started-access-open-data' },
					{ id: 'mediawiki-and-extensions', messageKey: 'section-nav-get-started-mediawiki-and-extensions' }
				]
			},
			{
				id: 'build-for-commercial-use-cases',
				titleMessageKey: 'section-nav-get-started-build-for-commercial-use-cases-title',
				items: [
					{ id: 'content-reuse', messageKey: 'section-nav-get-started-content-reuse' },
					{ id: 'embedded-learning', messageKey: 'section-nav-get-started-embedded-learning' },
					{ id: 'commercial-decision-making', messageKey: 'section-nav-get-started-commercial-decision-making' }
				]
			},
			{
				id: 'use-wikimedia-data-in-research',
				titleMessageKey: 'section-nav-get-started-use-wikimedia-data-in-research-title',
				items: [
					{ id: 'study-wikimedia-communities', messageKey: 'section-nav-get-started-study-wikimedia-communities' },
					{ id: 'data-for-academic-research', messageKey: 'section-nav-get-started-data-for-academic-research' }
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
					{ id: 'get-started-link', messageKey: 'section-nav-learn-get-started-link' }
				]
			},
			{
				id: 'guides',
				titleMessageKey: 'section-nav-learn-guides-title',
				items: [
					{ id: 'reuse-wikimedia-content', messageKey: 'section-nav-learn-reuse-wikimedia-content' },
					{ id: 'login-with-wikimedia', messageKey: 'section-nav-learn-login-with-wikimedia' },
					{ id: 'troubleshooting', messageKey: 'section-nav-learn-troubleshooting' },
					{ id: 'browse-all-guides', messageKey: 'section-nav-learn-browse-all-guides' }
				]
			},
			{
				id: 'tutorials',
				titleMessageKey: 'section-nav-learn-tutorials-title',
				items: [
					{ id: 'display-holidays-from-wikipedia', messageKey: 'section-nav-learn-display-holidays-from-wikipedia' },
					{ id: 'reuse-media-files', messageKey: 'section-nav-learn-reuse-media-files' },
					{ id: 'compare-page-metrics', messageKey: 'section-nav-learn-compare-page-metrics' },
					{ id: 'browse-all-tutorials', messageKey: 'section-nav-learn-browse-all-tutorials' }
				]
			},
			{
				id: 'concepts',
				titleMessageKey: 'section-nav-learn-concepts-title',
				items: [
					{ id: 'page-views', messageKey: 'section-nav-learn-page-views' },
					{ id: 'unique-devices', messageKey: 'section-nav-learn-unique-devices' },
					{ id: 'machine-learning-models', messageKey: 'section-nav-learn-machine-learning-models' },
					{ id: 'browse-all-concepts', messageKey: 'section-nav-learn-browse-all-concepts' }
				]
			},
			{
				id: 'policies',
				titleMessageKey: 'section-nav-learn-policies-title',
				items: [
					{ id: 'terms-of-use', messageKey: 'section-nav-learn-terms-of-use' },
					{ id: 'privacy-policy', messageKey: 'section-nav-learn-privacy-policy' },
					{ id: 'robot-policy', messageKey: 'section-nav-learn-robot-policy' },
					{ id: 'browse-all-policies', messageKey: 'section-nav-learn-browse-all-policies' }
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
					{ id: 'explore-hackathons-and-events', messageKey: 'section-nav-community-explore-hackathons-and-events' },
					{ id: 'communicate-with-tech-community', messageKey: 'section-nav-community-communicate-with-tech-community' },
					{ id: 'learn-and-share-technical-skills', messageKey: 'section-nav-community-learn-and-share-technical-skills' },
					{ id: 'get-tech-project-updates', messageKey: 'section-nav-community-get-tech-project-updates' },
					{ id: 'learn-about-wikimedia-technical-operations', messageKey: 'section-nav-community-learn-about-wikimedia-technical-operations' }
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
					{ id: 'wikimedia-open-source', messageKey: 'section-nav-contribute-wikimedia-open-source' },
					{ id: 'learn-how-contributing-works', messageKey: 'section-nav-contribute-learn-how-contributing-works' },
					{ id: 'contribute-by-topic', messageKey: 'section-nav-contribute-contribute-by-topic' },
					{ id: 'contribute-by-programming-language', messageKey: 'section-nav-contribute-contribute-by-programming-language' },
					{ id: 'search-all-projects', messageKey: 'section-nav-contribute-search-all-projects' }
				]
			},
			{
				id: 'developer-portal',
				titleMessageKey: 'section-nav-contribute-developer-portal-title',
				items: [
					{ id: 'contribute-code', messageKey: 'section-nav-contribute-contribute-code' },
					{ id: 'edit-the-docs', messageKey: 'section-nav-contribute-edit-the-docs' },
					{ id: 'write-a-guide', messageKey: 'section-nav-contribute-write-a-guide' }
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
					{ id: 'troubleshooting-guide', messageKey: 'section-nav-get-help-troubleshooting-guide' }
				]
			}
		]
	}
}
