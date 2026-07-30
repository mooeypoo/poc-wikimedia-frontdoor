import { EXPLORER_SIDE_NAV_SECTIONS } from '../../config/explorerSideNav'
import { SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID } from '../../config/sectionNavigation'
import type { ExplorerMode } from './useEnterpriseExplorer'
import { resolveContentPageSidebar } from './useContentPageSidebar'
import { contentLocaleFromPath, getMainNavigationIdFromPath, stripContentLocalePrefix } from '../utils/contentRoute'
import { explorerModeFromPath, isExplorerRoutePath, pathForExplorerMode } from '../utils/explorerRoute'
import { resolveContentHref } from '../utils/localeAwarePath'

export interface ResolvedSectionNavItem {
	id: string
	label: string
	isActive: boolean
	/**
	 * Locale-aware in-app route. Content items resolve it from their config
	 * `href`; explorer items from their `mode`. `null` only for items with no
	 * target (kept as a non-navigating placeholder link).
	 */
	to: string | null
}

export interface ResolvedSectionNavSection {
	id: string
	title: string
	items: ResolvedSectionNavItem[]
}

interface ContentSectionNavItem {
	id: string
	messageKey: string
	/** Locale-agnostic content path the item links to (see `config/sectionNavigation.js`). */
	href?: string
}

interface ExplorerSectionNavItem extends ContentSectionNavItem {
	mode?: ExplorerMode
	enabled?: boolean
}

interface SectionNavigationSource {
	ariaLabelMessageKey: string
	sections: Array<{
		id: string
		titleMessageKey: string
		items: Array<ContentSectionNavItem | ExplorerSectionNavItem>
	}>
}

const APIS_SECTION_NAVIGATION_SOURCE: SectionNavigationSource = {
	ariaLabelMessageKey: 'explorer-side-nav-label',
	sections: EXPLORER_SIDE_NAV_SECTIONS
}

const EMPTY_SECTION_SOURCE: SectionNavigationSource = {
	ariaLabelMessageKey: 'section-nav-site-label',
	sections: []
}

/**
 * Resolves left-hand section navigation for the current route.
 *
 * Returns explorer or content section menus from config, with banana-i18n
 * labels. The **APIs** primary section (`apis`) — catalog `/apis`, `/apis/…`,
 * and explorer `/explorer` / `/explorer/…` — always uses
 * `config/explorerSideNav.js` (same menu as Get started keeps its section nav
 * on every page under that tab). Items may declare `href` (content), `mode`
 * (explorer), or neither (placeholder). `enabled: false` items are omitted.
 *
 * A page's `sidebar` frontmatter overrides path-based resolution on content
 * routes: `false` hides the menu, a string forces a named menu, `true`/omitted
 * uses the path (see `useContentPageSidebar`). Explorer routes ignore
 * frontmatter and always show the APIs section menu. The `/account` Vue page
 * publishes `sidebar: false` so the shell collapses the start column.
 *
 * @returns {{
 *   navigationLabel: import('vue').ComputedRef<string>,
 *   navigationSections: import('vue').ComputedRef<ResolvedSectionNavSection[]>,
 *   isSidebarHidden: import('vue').ComputedRef<boolean>
 * }} Reactive section navigation for the shell start column. The start panel
 * is always mounted in the layout; `navigationSections` may be empty.
 * `isSidebarHidden` is true only for an explicit `sidebar: false`.
 */
export function usePageSectionNav() {
	const route = useRoute()
	const { $bananaI18n } = useNuxtApp()

	const mainNavigationId = computed( () => getMainNavigationIdFromPath( route.path ) )
	const onExplorerRoute = computed( () => isExplorerRoutePath( route.path ) )
	const isApisSection = computed( () => mainNavigationId.value === 'apis' )

	// Per-page `sidebar` frontmatter, ignored on explorer routes (which always
	// show the APIs section menu). See `useContentPageSidebar`.
	const sidebarPreference = computed( () => {
		if ( onExplorerRoute.value ) {
			return undefined
		}

		return resolveContentPageSidebar( route.path )
	} )

	/**
	 * Whether the current page explicitly hides its sidebar (`sidebar: false`).
	 * Distinct from an empty section list: the shell uses this to collapse the
	 * start column to full-width, while empty sections keep the column reserved.
	 */
	const isSidebarHidden = computed( () => sidebarPreference.value === false )

	const navigationSource = computed<SectionNavigationSource>( () => {
		// Explorer always shows the APIs section menu (ignores content frontmatter).
		if ( onExplorerRoute.value ) {
			return APIS_SECTION_NAVIGATION_SOURCE
		}

		const preference = sidebarPreference.value

		// `sidebar: false` — hide the sidebar entirely.
		if ( preference === false ) {
			return EMPTY_SECTION_SOURCE
		}

		// `sidebar: "<menu-id>"` — force a named menu regardless of path.
		// `Object.hasOwn` guards against inherited keys (e.g. a `"__proto__"`
		// frontmatter typo resolving to a prototype object with no `sections`).
		if ( typeof preference === 'string' ) {
			return Object.hasOwn( SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID, preference )
				? SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID[ preference ]
				: EMPTY_SECTION_SOURCE
		}

		// Catalog `/apis` and `/apis/…` share the same menu as the explorer.
		if ( isApisSection.value ) {
			return APIS_SECTION_NAVIGATION_SOURCE
		}

		const navigationId = mainNavigationId.value

		if ( navigationId ) {
			return SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID[ navigationId ] ?? EMPTY_SECTION_SOURCE
		}

		return EMPTY_SECTION_SOURCE
	} )

	const navigationLabel = computed( () => {
		return $bananaI18n( navigationSource.value.ariaLabelMessageKey )
	} )

	const navigationSections = computed<ResolvedSectionNavSection[]>( () => {
		const source = navigationSource.value
		const usingApisSectionMenu = source === APIS_SECTION_NAVIGATION_SOURCE
		const activeExplorerMode = onExplorerRoute.value
			? explorerModeFromPath( route.path )
			: null

		const contentPath = onExplorerRoute.value
			? null
			: stripContentLocalePrefix( route.path )

		const contentLocale = contentLocaleFromPath( route.path )

		return source.sections.map( ( section ) => ( {
			id: section.id,
			title: $bananaI18n( section.titleMessageKey ),
			items: section.items
				.filter( ( item ) => {
					if ( !usingApisSectionMenu ) {
						return true
					}

					const explorerItem = item as ExplorerSectionNavItem
					return explorerItem.enabled !== false
				} )
				.map( ( item ) => {
					if ( usingApisSectionMenu ) {
						const explorerItem = item as ExplorerSectionNavItem
						const mode = explorerItem.mode
						const href = explorerItem.href

						if ( mode !== undefined ) {
							return {
								id: item.id,
								label: $bananaI18n( item.messageKey ),
								to: pathForExplorerMode( mode ),
								isActive: mode === activeExplorerMode
							}
						}

						if ( href !== undefined ) {
							return {
								id: item.id,
								label: $bananaI18n( item.messageKey ),
								to: resolveContentHref( href, contentLocale ),
								isActive: href === contentPath
							}
						}

						return {
							id: item.id,
							label: $bananaI18n( item.messageKey ),
							to: null,
							isActive: false
						}
					}

					const contentItem = item as ContentSectionNavItem

					return {
						id: item.id,
						label: $bananaI18n( item.messageKey ),
						to: contentItem.href
							? resolveContentHref( contentItem.href, contentLocale )
							: null,
						// Active when this item's target is the current page. `contentPath`
						// and `href` are both locale-agnostic, so they compare directly.
						isActive: contentItem.href !== undefined
							&& contentItem.href === contentPath
					}
				} )
		} ) )
	} )

	return {
		navigationLabel,
		navigationSections,
		isSidebarHidden
	}
}
