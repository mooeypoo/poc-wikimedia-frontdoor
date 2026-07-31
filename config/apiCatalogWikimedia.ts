import type { StatusType } from '@wikimedia/codex'

/**
 * config/apiCatalogWikimedia.ts
 *
 * Wikimedia APIs catalog cards and project-filter options for `/apis`.
 * Filter chrome labels are banana-i18n keys; card title / description /
 * chip / supporting-text copy is English content (v0 — locale-specific card
 * catalogs can follow later). Card titles use current product names (e.g.
 * Device / Editor / Media file / Page view analytics — singular forms).
 *
 * Visibility rules (product):
 * - `universal` cards stay visible for every project filter **except** any
 *   ids listed in optional `excludeProjectIds` (still always shown for “Any”).
 * - Project-specific cards appear for “Any” and their matching project(s).
 */

/** Stable project filter ids (combobox values). */
export type ApiCatalogProjectFilterId =
	| 'any'
	| 'wikidata'
	| 'wikifunctions'
	| 'commons'
	| 'wikipedia'

/** Project ids that can be selected (excludes the “Any” sentinel). */
export type ApiCatalogProjectId = Exclude<ApiCatalogProjectFilterId, 'any'>

/**
 * @property id - Stable filter option id (combobox value).
 * @property messageKey - banana-i18n key for the menu label.
 */
export type ApiCatalogProjectFilterOption = {
	id: ApiCatalogProjectFilterId
	messageKey: string
}

/**
 * @property label - Visible chip text (content string).
 * @property status - Codex InfoChip status.
 */
export type ApiCatalogCardChip = {
	label: string
	status: StatusType
}

/**
 * Filter visibility for a catalog card.
 *
 * - `universal` — shown for “Any” and every project, unless the selected
 *   project is listed in `excludeProjectIds`.
 * - `projects` — shown for “Any” and the listed project id(s) only.
 */
export type ApiCatalogCardVisibility =
	| { kind: 'universal'; excludeProjectIds?: readonly ApiCatalogProjectId[] }
	| { kind: 'projects'; projectIds: readonly ApiCatalogProjectId[] }

/**
 * One Wikimedia APIs catalog card.
 *
 * @property id - Stable card id.
 * @property title - Card title (content).
 * @property description - Card description (content).
 * @property url - Destination URL.
 * @property chips - InfoChips under the description.
 * @property supportingText - Optional external supporting-text label.
 * @property visibility - Filter visibility (`universal` or project-specific).
 */
export type ApiCatalogWikimediaCard = {
	id: string
	title: string
	description: string
	url: string
	chips: ApiCatalogCardChip[]
	supportingText?: string
	visibility: ApiCatalogCardVisibility
}

/** Default combobox selection — show all cards. */
export const API_CATALOG_PROJECT_FILTER_DEFAULT: ApiCatalogProjectFilterId = 'any'

/**
 * Filter menu options in display order ([Figma 1183:31958](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=1183-31958)).
 */
export const API_CATALOG_PROJECT_FILTER_OPTIONS: readonly ApiCatalogProjectFilterOption[] = [
	{ id: 'any', messageKey: 'api-catalog-filter-project-any' },
	{ id: 'wikidata', messageKey: 'api-catalog-filter-project-wikidata' },
	{ id: 'wikifunctions', messageKey: 'api-catalog-filter-project-wikifunctions' },
	{ id: 'commons', messageKey: 'api-catalog-filter-project-commons' },
	{ id: 'wikipedia', messageKey: 'api-catalog-filter-project-wikipedia' }
]

/**
 * Wikimedia APIs cards for the catalog filterable grid.
 *
 * Display order is curated here (not Markdown). Internal explorer destinations
 * use `/explorer`; off-platform cards set `supportingText` + absolute `url`.
 * Card copy and chips are **content** (AGENTS.md — not banana-i18n).
 */
export const API_CATALOG_WIKIMEDIA_CARDS: readonly ApiCatalogWikimediaCard[] = [
	{
		id: 'mediawiki-rest',
		title: 'MediaWiki REST API',
		description: 'Provides access to wiki content and functionality, supporting operations like searching, getting and transforming wiki pages, and accessing page history.',
		url: '/explorer',
		chips: [
			{ label: 'All projects', status: 'notice' },
			{ label: 'Check stability at endpoint level', status: 'success' }
		],
		visibility: { kind: 'universal' }
	},
	{
		id: 'wikimedia-rest',
		title: 'Wikimedia REST APIs',
		description: 'Provides cacheable and straightforward access to Wikimedia content and data, in machine-readable formats.',
		url: '/explorer',
		chips: [
			{ label: 'All projects', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'universal' }
	},
	{
		id: 'attribution',
		title: 'Attribution API',
		description: 'Returns attribution signals for wiki pages to ensure fair reuse of Wikimedia content.',
		url: '/explorer',
		chips: [
			{ label: 'Multi-project', status: 'notice' },
			{ label: 'Beta', status: 'warning' }
		],
		visibility: { kind: 'universal', excludeProjectIds: [ 'wikifunctions' ] }
	},
	{
		id: 'lift-wing',
		title: 'Lift Wing API',
		description: 'A machine-learning model-serving platform that returns predictions about Wikimedia pages and edits, such as article or edit-quality score.',
		url: '/explorer',
		chips: [
			{ label: 'Multi-project', status: 'notice' },
			{ label: 'Check stability at endpoint level', status: 'success' }
		],
		visibility: {
			kind: 'universal',
			excludeProjectIds: [ 'wikifunctions', 'commons' ]
		}
	},
	{
		id: 'growth-experiments',
		title: 'GrowthExperiments API',
		description: 'Experimental editing suggestions and editor feedback regarding such suggestions',
		url: '/explorer',
		chips: [
			{ label: 'Multi-project', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: {
			kind: 'universal',
			excludeProjectIds: [ 'wikifunctions', 'commons' ]
		}
	},
	{
		id: 'reading-lists',
		title: 'ReadingLists API',
		description: 'Store and retrieve private lists of pages, such as bookmarks or read-it-later feature.',
		url: '/explorer',
		chips: [
			{ label: 'All projects', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'universal' }
	},
	{
		id: 'campaign-events',
		title: 'CampaignEvents API',
		description: 'REST API for the CampaignEvents extension. Create and manage campaign events, invite and track participants, and associate wiki contributions with events.',
		url: '/explorer',
		chips: [
			{ label: 'All projects', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'universal' }
	},
	{
		id: 'commons-analytics',
		title: 'Commons analytics API',
		description: 'Provides data about the usage of categories and media files on Wikimedia Commons. This data is focused on categories associated with contributions from galleries, libraries, archives, and museums (GLAM).',
		url: '/explorer',
		chips: [
			{ label: 'Wikimedia Commons', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'projects', projectIds: [ 'commons' ] }
	},
	{
		id: 'devices-analytics',
		title: 'Device analytics API',
		description: 'Provides data about the number of unique devices that access Wikimedia projects. This endpoint only returns data for projects that have at least 1,000 unique devices for the requested time period.',
		url: '/explorer',
		chips: [
			{ label: 'All projects', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'universal' }
	},
	{
		id: 'edit-analytics',
		title: 'Edit analytics API',
		description: 'Edit analytics provides data about the number of edits and edited pages on Wikimedia projects.',
		url: '/explorer',
		chips: [
			{ label: 'All projects', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'universal' }
	},
	{
		id: 'editors-analytics',
		title: 'Editor analytics API',
		description: 'Editor analytics provides data about the number of editors and newly registered users of Wikimedia projects. Data returned by these endpoints includes edits on redirects.',
		url: '/explorer',
		chips: [
			{ label: 'All projects', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'universal' }
	},
	{
		id: 'media-files-analytics',
		title: 'Media file analytics API',
		description: 'Media file analytics provides data about requests for media files on Wikimedia projects.',
		url: '/explorer',
		chips: [
			{ label: 'All projects', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'universal' }
	},
	{
		id: 'page-views-analytics',
		title: 'Page view analytics API',
		description: 'Page view analytics provides data about page views for Wikimedia projects.',
		url: '/explorer',
		chips: [
			{ label: 'All projects', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'universal' }
	},
	{
		id: 'math',
		title: 'Math API',
		description: 'Provides support for rendering mathematical formulae. It allows callers to convert various forms of math input into MathML + SVG or PNG outputs, which can be used across Wikimedia projects.',
		url: '/explorer',
		chips: [
			{ label: 'All projects', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'universal' }
	},
	{
		id: 'wikifunctions',
		title: 'Wikifunctions API',
		description: 'Search, fetch, and call functions hosted on Wikifunctions (Abstract Wikipedia). Create, edit, and orchestrate function objects.',
		url: 'https://www.mediawiki.org/wiki/Wikifunctions_API',
		supportingText: 'Read more on mediawiki.org',
		chips: [
			{ label: 'Wikifunctions', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'projects', projectIds: [ 'wikifunctions' ] }
	},
	{
		id: 'wikibase-graphql',
		title: 'Wikibase GraphQL API',
		description: 'A GraphQL API for Wikidata optimised for developer experience. Handles common read use cases in a single request, reducing load vs SPARQL. Beta, actively developed.',
		url: 'https://www.wikidata.org/wiki/Wikidata:Wikibase_GraphQL',
		supportingText: 'Read more on Wikidata',
		chips: [
			{ label: 'Wikidata', status: 'notice' },
			{ label: 'Beta', status: 'warning' }
		],
		visibility: { kind: 'projects', projectIds: [ 'wikidata' ] }
	},
	{
		id: 'wikibase-rest',
		title: 'Wikibase REST API',
		description: 'A modern, OpenAPI-documented REST interface for reading and writing Wikidata entities, statements, labels, aliases, and sitelinks.',
		url: 'https://doc.wikimedia.org/Wikibase/master/js/rest-api/',
		supportingText: 'Read the docs',
		chips: [
			{ label: 'Wikidata', status: 'notice' },
			{ label: 'Stable', status: 'success' }
		],
		visibility: { kind: 'projects', projectIds: [ 'wikidata' ] }
	}
]

/**
 * Whether a catalog card is visible for the selected project filter.
 *
 * “Any” shows every card. Universal cards show for every project except those
 * listed in `excludeProjectIds`. Project-specific cards show for their listed
 * projects only.
 *
 * @param card - Catalog card definition.
 * @param selectedProjectFilterId - Active combobox filter id.
 * @returns True when the card should render in the grid.
 */
export function isApiCatalogCardVisibleForProjectFilter(
	card: ApiCatalogWikimediaCard,
	selectedProjectFilterId: ApiCatalogProjectFilterId
): boolean {
	if ( selectedProjectFilterId === 'any' ) {
		return true
	}

	if ( card.visibility.kind === 'universal' ) {
		return !card.visibility.excludeProjectIds?.includes( selectedProjectFilterId )
	}

	return card.visibility.projectIds.includes( selectedProjectFilterId )
}
