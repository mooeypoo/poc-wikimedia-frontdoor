import { SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID } from '../../config/sectionNavigation'
import { resolveContentPageSidebar } from './useContentPageSidebar'
import { contentLocaleFromPath, getMainNavigationIdFromPath, stripContentLocalePrefix } from '../utils/contentRoute'
import { resolveContentHref } from '../utils/localeAwarePath'

export interface ResolvedSectionNavItem {
	id: string
	label: string
	isActive: boolean
	/**
	 * Locale-aware in-app route resolved from the item's config `href`. `null`
	 * only for items with no target (kept as a non-navigating placeholder link).
	 */
	to: string | null
}

export interface ResolvedSectionNavSection {
	id: string
	title: string
	items: ResolvedSectionNavItem[]
}

interface SectionNavItem {
	id: string
	messageKey: string
	/**
	 * Locale-agnostic path the item links to (see `config/sectionNavigation.js`).
	 * Content paths are locale-prefixed by `resolveContentHref`; `/explorer` paths
	 * are left verbatim (`i18n: false`). Omitted for a non-navigating placeholder.
	 */
	href?: string
	/** When false, the item is hidden entirely. Defaults to true. */
	enabled?: boolean
}

interface SectionNavigationSource {
	ariaLabelMessageKey: string
	sections: Array<{
		id: string
		titleMessageKey: string
		items: SectionNavItem[]
	}>
}

/**
 * Resolves left-hand section navigation for the current route.
 *
 * Every menu — including the API Explorer sidebar — is a named entry in
 * `SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID`, so content experts edit them all
 * the same way. Each item resolves its route from a locale-agnostic `href`
 * (`resolveContentHref` locale-prefixes content paths and leaves `/explorer`
 * paths verbatim) and is active when that `href` matches the current page. Items
 * with `enabled: false` are hidden; items without an `href` are non-navigating
 * placeholders. At most one item is selected per menu (targets are unique).
 *
 * A page's `sidebar` frontmatter overrides path-based resolution: `false` hides
 * the menu, a string forces a named menu (e.g. `sidebar: "apis"` attaches the
 * API Explorer sidebar to any page), `true`/omitted uses the path (see
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

	// Per-page `sidebar` frontmatter. Explorer routes are not Nuxt Content, so
	// `content-sidebar.global` never publishes a preference for them and this
	// resolves to `undefined` (path-based resolution). See `useContentPageSidebar`.
	const sidebarPreference = computed( () => resolveContentPageSidebar( route.path ) )

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
		const contentPath = stripContentLocalePrefix( route.path )
		const contentLocale = contentLocaleFromPath( route.path )

		return source.sections.map( ( section ) => ( {
			id: section.id,
			title: $bananaI18n( section.titleMessageKey ),
			items: section.items
				.filter( ( item ) => item.enabled !== false )
				.map( ( item ) => ( {
					id: item.id,
					label: $bananaI18n( item.messageKey ),
					to: item.href
						? resolveContentHref( item.href, contentLocale )
						: null,
					// Active when this item's target is the current page. Both
					// `contentPath` and `href` are locale-agnostic (explorer paths
					// carry no locale prefix), so they compare directly.
					isActive: item.href !== undefined && item.href === contentPath
				} ) )
		} ) )
	} )

	return {
		navigationLabel,
		navigationSections,
		isSidebarHidden
	}
}
