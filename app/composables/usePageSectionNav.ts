import { EXPLORER_SIDE_NAV_SECTIONS } from '../../config/explorerSideNav'
import { SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID } from '../../config/sectionNavigation'
import type { ExplorerMode } from './useEnterpriseExplorer'
import { resolveContentPageSidebar } from './useContentPageSidebar'
import { contentLocaleFromPath, getMainNavigationIdFromPath, stripContentLocalePrefix } from '../utils/contentRoute'
import { explorerModeFromPath, isExplorerRoutePath, pathForExplorerMode } from '../utils/explorerRoute'
import { buildLocaleAwarePath } from '../utils/localeAwarePath'

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

/**
 * Resolves left-hand section navigation for the current route.
 *
 * Returns explorer or content section menus from config, with banana-i18n
 * labels. Content items resolve their route from a locale-agnostic `href` and
 * are active when that `href` matches the current page; explorer items resolve
 * from a `mode` via `pathForExplorerMode` and follow `explorerModeFromPath`. At
 * most one item is selected per menu (targets are unique).
 *
 * A page's `sidebar` frontmatter overrides path-based resolution: `false` hides
 * the menu, a string forces a named menu, `true`/omitted uses the path (see
 * `useContentPageSidebar`). The `/account` Vue page is not Nuxt Content —
 * `content-sidebar.global` publishes `sidebar: false` for that path so the
 * shell collapses the start column (Figma `/account` has no section nav).
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

	// Per-page `sidebar` frontmatter, ignored on explorer routes (which resolve
	// their side nav from the path). See `useContentPageSidebar`.
	const sidebarPreference = computed( () => {
		if ( isExplorerRoutePath( route.path ) ) {
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

	const EMPTY_SECTION_SOURCE: SectionNavigationSource = {
		ariaLabelMessageKey: 'section-nav-site-label',
		sections: []
	}

	const navigationSource = computed<SectionNavigationSource>( () => {
		if ( isExplorerRoutePath( route.path ) ) {
			return {
				ariaLabelMessageKey: 'explorer-side-nav-label',
				sections: EXPLORER_SIDE_NAV_SECTIONS
			}
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

		// `sidebar: true` or omitted — automatic, path-based resolution.
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
		const onExplorerRoute = isExplorerRoutePath( route.path )
		const activeExplorerMode = onExplorerRoute ? explorerModeFromPath( route.path ) : null

		const contentPath = onExplorerRoute
			? null
			: stripContentLocalePrefix( route.path )

		const contentLocale = contentLocaleFromPath( route.path )

		return source.sections.map( ( section ) => ( {
			id: section.id,
			title: $bananaI18n( section.titleMessageKey ),
			items: section.items
				.filter( ( item ) => {
					if ( !onExplorerRoute ) {
						return true
					}

					const explorerItem = item as ExplorerSectionNavItem
					return explorerItem.enabled !== false
				} )
				.map( ( item ) => {
					if ( onExplorerRoute ) {
						const explorerItem = item as ExplorerSectionNavItem
						const mode = explorerItem.mode

						return {
							id: item.id,
							label: $bananaI18n( item.messageKey ),
							to: mode !== undefined ? pathForExplorerMode( mode ) : null,
							isActive: mode !== undefined && mode === activeExplorerMode
						}
					}

					const contentItem = item as ContentSectionNavItem

					return {
						id: item.id,
						label: $bananaI18n( item.messageKey ),
						to: contentItem.href
							? buildLocaleAwarePath( contentItem.href, contentLocale )
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
