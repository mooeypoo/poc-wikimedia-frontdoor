/**
 * Maps PR #66 content + endpoint search hits into the global-search panel model.
 *
 * Presentation only — ranking stays in `useContentSearch` / `useEndpointSearch`.
 * Snippets are plain text (SEC-01 / Pure Claude: no `v-html` on untrusted
 * markup). Codex `highlightQuery` can still bold labels when wired through
 * TypeaheadSearch / MenuItem.
 */

import type { MenuGroupData, MenuItemData } from '@wikimedia/codex'
import {
	SEARCH_PROTOTYPE_SNIPPET_MAX_LENGTH,
	type SearchPrototypeCategory
} from '../../config/searchPrototype.ts'
import { contentIdToUrl } from './contentLocalePaths.ts'
import {
	endpointResultTitle,
	type EndpointSearchResult
} from './endpointSearch.ts'

/**
 * Locale-partitioned FTS group — structural match for `LocaleResultGroup`
 * without importing the Nuxt content-search composable (keeps this module
 * Node-testable).
 */
export interface DocumentationSearchLocaleGroup {
	locale: string
	dir: 'ltr' | 'rtl'
	results: Array<{
		id: string
		title: string
		content?: string
		rank?: number
		snippets?: { content?: string }
	}>
}

/** Result kind for category chips and assistive type text. */
export type GlobalSearchResultKind = 'endpoint' | 'documentation'

/**
 * One navigable row in the global-search prototype menu.
 */
export interface GlobalSearchPanelItem {
	/** Stable id used as MenuItem `value` and list key. */
	id: string
	kind: GlobalSearchResultKind
	/** Same-origin path or explorer deep link. */
	url: string
	/** Primary label (section/page title, or endpoint summary). */
	label: string
	/**
	 * HTTP method for endpoint rows — always shown as text (not colour alone).
	 * Null for documentation.
	 */
	method: string | null
	/** Supporting line: module title · snippet, or page context · snippet. */
	description: string
	/**
	 * Relevance score used only to mix endpoints + UI-locale docs in All view.
	 * Higher is better. Endpoint MiniSearch scores and FTS ranks are normalised
	 * per-list before merge so the scales stay comparable.
	 */
	score: number
	/** BCP 47 of the result language when it differs from the UI (docs only). */
	resultLocale: string | null
	/** Text direction for the result language. */
	resultDir: 'ltr' | 'rtl' | null
	/** True when this doc row sits in the English fallback tier. */
	isEnglishFallback: boolean
}

/**
 * Strips HTML tags (including FTS `<mark>`) to plain text for safe rendering.
 *
 * @param markup - Possibly HTML snippet from FTS or MiniSearch builders.
 * @returns Plain text with entities left as-is after tag removal.
 */
export function stripSearchSnippetToPlainText( markup: string ): string {
	return markup
		.replace( /<[^>]+>/gu, '' )
		.replace( /\s+/gu, ' ' )
		.trim()
}

/**
 * Truncates plain text to about `maxLength` characters at a word boundary.
 *
 * @param text - Plain source text.
 * @param maxLength - Soft maximum length.
 * @returns Truncated text with an ellipsis when cut.
 */
export function truncateSearchSnippet(
	text: string,
	maxLength: number = SEARCH_PROTOTYPE_SNIPPET_MAX_LENGTH
): string {
	if ( text.length <= maxLength ) {
		return text
	}

	const slice = text.slice( 0, maxLength )
	const lastSpace = slice.lastIndexOf( ' ' )
	const cut = lastSpace > maxLength / 3 ? slice.slice( 0, lastSpace ) : slice
	return `${ cut.trimEnd() }…`
}

/**
 * Converts an FTS5 BM25 `rank` (smaller = better) into a higher-is-better score.
 *
 * @param rank - Nuxt Content FTS rank, or undefined when missing.
 * @returns Score suitable for mixing with MiniSearch endpoint scores after normalisation.
 */
export function contentRankToScore( rank: number | undefined ): number {
	if ( rank === undefined || Number.isNaN( rank ) ) {
		return 0
	}
	// FTS5 bm25: lower/more-negative is more relevant → negate for higher-is-better.
	return -rank
}

/**
 * Builds documentation panel items from locale-partitioned FTS groups.
 *
 * QUESTION: Primary §2 wants section-level hits with heading anchors. PR #66
 * FTS is still largely page-oriented — we map each hit's title + snippet and
 * keep any `#anchor` already present on the FTS id.
 *
 * Intermediate fallback-chain locales (e.g. pt-br → pt) are skipped so the
 * panel matches primary §4 (UI language + English only).
 *
 * @param chainResultGroups - Groups from `useContentSearch` in chain order.
 * @param activeLocale - Current interface locale.
 * @returns Documentation items with English-fallback flags.
 */
export function mapDocumentationSearchItems(
	chainResultGroups: DocumentationSearchLocaleGroup[],
	activeLocale: string
): GlobalSearchPanelItem[] {
	const items: GlobalSearchPanelItem[] = []

	for ( const group of chainResultGroups ) {
		const isActiveLocale = group.locale === activeLocale
		const isEnglish = group.locale === 'en'
		// UI language + English only (primary §4). Skip other chain locales.
		if ( !isActiveLocale && !isEnglish ) {
			continue
		}

		for ( const result of group.results ) {
			const plainSnippet = truncateSearchSnippet(
				stripSearchSnippetToPlainText( result.snippets?.content ?? result.content ?? '' )
			)

			items.push( {
				id: `doc:${ result.id }`,
				kind: 'documentation',
				url: contentIdToUrl( result.id ),
				label: result.title,
				method: null,
				description: plainSnippet,
				score: contentRankToScore( result.rank ),
				resultLocale: group.locale,
				resultDir: group.dir,
				isEnglishFallback: isEnglish && activeLocale !== 'en'
			} )
		}
	}

	return items
}

/**
 * Builds endpoint panel items from MiniSearch hits.
 *
 * Description format (Figma / §6.2): module title · plain snippet.
 *
 * @param endpointResults - Hits from `useEndpointSearch`.
 * @returns Endpoint panel items (English-only OpenAPI text).
 */
export function mapEndpointSearchItems(
	endpointResults: EndpointSearchResult[]
): GlobalSearchPanelItem[] {
	return endpointResults.map( ( endpointResult ) => {
		const moduleTitle = endpointResult.record.moduleTitle
		const plainSnippet = truncateSearchSnippet(
			stripSearchSnippetToPlainText( endpointResult.snippet )
		)
		const description = plainSnippet.length > 0
			? `${ moduleTitle } · ${ plainSnippet }`
			: moduleTitle

		return {
			id: `endpoint:${ endpointResult.record.deepLink }`,
			kind: 'endpoint' as const,
			url: endpointResult.record.deepLink,
			label: endpointResultTitle( endpointResult.record ),
			method: endpointResult.record.method,
			description,
			score: endpointResult.score,
			resultLocale: null,
			resultDir: 'ltr' as const,
			isEnglishFallback: false
		}
	} )
}

/**
 * Merges two already-scored lists by normalised relevance (higher first).
 *
 * Each list is scaled to its own max so MiniSearch and FTS magnitudes do not
 * drown each other. Ties break on `id` for a stable order.
 *
 * @param left - First scored list (e.g. endpoints).
 * @param right - Second scored list (e.g. UI-locale documentation).
 * @returns Interleaved items, highest normalised score first.
 */
export function mergeByNormalisedRelevance(
	left: GlobalSearchPanelItem[],
	right: GlobalSearchPanelItem[]
): GlobalSearchPanelItem[] {
	const leftMax = Math.max( ...left.map( ( item ) => item.score ), Number.EPSILON )
	const rightMax = Math.max( ...right.map( ( item ) => item.score ), Number.EPSILON )

	const tagged = [
		...left.map( ( item ) => ( { item, key: item.score / leftMax } ) ),
		...right.map( ( item ) => ( { item, key: item.score / rightMax } ) )
	]

	tagged.sort( ( a, b ) => {
		if ( b.key !== a.key ) {
			return b.key - a.key
		}
		return a.item.id.localeCompare( b.item.id )
	} )

	return tagged.map( ( entry ) => entry.item )
}

/**
 * Filters and orders panel items for the selected category chip.
 *
 * All view (primary §6.2): endpoints + UI-locale documentation interleaved by
 * relevance. English fallback documentation stays after that tier so the
 * "Results in English" divider can sit between them.
 *
 * @param documentationItems - Mapped documentation hits.
 * @param endpointItems - Mapped endpoint hits.
 * @param category - Active chip.
 * @returns Ordered list for the scrolling menu body.
 */
export function orderGlobalSearchPanelItems(
	documentationItems: GlobalSearchPanelItem[],
	endpointItems: GlobalSearchPanelItem[],
	category: SearchPrototypeCategory
): GlobalSearchPanelItem[] {
	if ( category === 'endpoints' ) {
		return [ ...endpointItems ]
	}
	if ( category === 'documentation' ) {
		return [ ...documentationItems ]
	}

	const primaryDocs = documentationItems.filter( ( item ) => !item.isEnglishFallback )
	const englishDocs = documentationItems.filter( ( item ) => item.isEnglishFallback )
	return [
		...mergeByNormalisedRelevance( endpointItems, primaryDocs ),
		...englishDocs
	]
}

/**
 * Splits ordered items into UI-language (plus endpoints) and English-fallback
 * documentation tiers for the "Results in English" divider.
 *
 * @param items - Ordered panel items for the current chip.
 * @returns Leading (non-fallback) items and English-fallback documentation items.
 */
export function splitEnglishFallbackTier( items: GlobalSearchPanelItem[] ): {
	primaryItems: GlobalSearchPanelItem[]
	englishFallbackItems: GlobalSearchPanelItem[]
} {
	const primaryItems: GlobalSearchPanelItem[] = []
	const englishFallbackItems: GlobalSearchPanelItem[] = []

	for ( const item of items ) {
		if ( item.isEnglishFallback ) {
			englishFallbackItems.push( item )
		} else {
			primaryItems.push( item )
		}
	}

	return { primaryItems, englishFallbackItems }
}

/**
 * Takes a visible window across primary then English tiers.
 *
 * Result-row budget applies to items only (not the divider). When English
 * fallback rows exist, at least one slot is reserved for them so the
 * "Results in English" divider is never pushed entirely below the disclosure
 * window by a long primary (endpoint) list — load-more then reveals more
 * primary rows above the divider, then more English rows below it.
 *
 * @param primaryItems - Non-fallback rows (endpoints + UI-locale docs).
 * @param englishFallbackItems - English documentation fallback rows.
 * @param visibleCount - How many result rows may be shown.
 * @returns Visible slices and whether to render the English divider.
 */
export function sliceVisibleSearchTiers(
	primaryItems: GlobalSearchPanelItem[],
	englishFallbackItems: GlobalSearchPanelItem[],
	visibleCount: number
): {
	visiblePrimaryItems: GlobalSearchPanelItem[]
	visibleEnglishFallbackItems: GlobalSearchPanelItem[]
	showEnglishFallbackDivider: boolean
} {
	if ( visibleCount <= 0 ) {
		return {
			visiblePrimaryItems: [],
			visibleEnglishFallbackItems: [],
			showEnglishFallbackDivider: false
		}
	}

	if ( englishFallbackItems.length === 0 ) {
		return {
			visiblePrimaryItems: primaryItems.slice( 0, visibleCount ),
			visibleEnglishFallbackItems: [],
			showEnglishFallbackDivider: false
		}
	}

	// Reserve ≥1 row for English whenever fallbacks exist so the labeled
	// section is visible in the first disclosure window (ADR multilingual
	// search §4 / primary Languages).
	const primaryBudget = Math.min( primaryItems.length, visibleCount - 1 )
	const englishBudget = visibleCount - primaryBudget

	return {
		visiblePrimaryItems: primaryItems.slice( 0, primaryBudget ),
		visibleEnglishFallbackItems: englishFallbackItems.slice( 0, englishBudget ),
		showEnglishFallbackDivider: true
	}
}

/**
 * Maps a panel row to a Codex `MenuItemData` for `CdxMenu`.
 *
 * `url` is omitted on purpose: Codex wraps `url` in a plain `<a>`, which would
 * full-page-navigate outside Nuxt. Selection handlers call `navigateTo` instead.
 *
 * @param item - Panel row.
 * @returns Codex menu item (value = stable panel id).
 */
export function toCodexMenuItem( item: GlobalSearchPanelItem ): MenuItemData {
	if ( item.kind === 'endpoint' && item.method ) {
		return {
			value: item.id,
			label: item.label,
			// Method as supporting text — inherently LTR API vocabulary.
			supportingText: item.method,
			description: item.description || null
		}
	}

	return {
		value: item.id,
		label: item.label,
		description: item.description || null,
		language: item.resultLocale
			? { label: item.resultLocale, description: item.resultLocale }
			: undefined
	}
}

/**
 * Builds Codex menu entries from the visible primary / English tiers.
 *
 * English fallback rows become a labeled {@link MenuGroupData} (Codex’s group
 * header — the closest native stand-in for “Results in English”; there is no
 * Menu header slot for chips).
 *
 * @param primaryItems - Visible non-fallback rows.
 * @param englishFallbackItems - Visible English documentation rows.
 * @param englishFallbackHeading - Banana “Results in …” group label.
 * @param showEnglishFallbackDivider - Whether to emit the English group.
 * @returns Menu items and optional trailing English group for `CdxMenu`.
 */
export function toCodexMenuEntries(
	primaryItems: GlobalSearchPanelItem[],
	englishFallbackItems: GlobalSearchPanelItem[],
	englishFallbackHeading: string,
	showEnglishFallbackDivider: boolean
): ( MenuItemData | MenuGroupData )[] {
	const entries: ( MenuItemData | MenuGroupData )[] = primaryItems.map( toCodexMenuItem )

	if ( showEnglishFallbackDivider && englishFallbackItems.length > 0 ) {
		entries.push( {
			label: englishFallbackHeading,
			items: englishFallbackItems.map( toCodexMenuItem )
		} )
	}

	return entries
}
