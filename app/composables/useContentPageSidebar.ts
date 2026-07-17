/**
 * Bridge for per-page sidebar frontmatter (`sidebar` field).
 *
 * The application shell (`app/layouts/default.vue` via `usePageSectionNav`)
 * resolves the left section navigation from the route path alone — it has no
 * access to the current content page's frontmatter.
 *
 * The `content-sidebar.global` route middleware resolves the target page's
 * `sidebar` frontmatter and publishes it here *before* the layout renders, so
 * SSR emits the correct shell state (no post-hydration flash). The value is
 * keyed to the route path so a stale preference from a previous route is never
 * applied. See `docs/content-authoring-guide.md` for the authoring contract.
 */

/**
 * Raw `sidebar` frontmatter value:
 *   - `false` — hide the sidebar (full-width content)
 *   - `true` — show this page's path-based section menu
 *   - string — force a named menu (a key of `SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID`)
 *   - `undefined` — automatic, path-based resolution
 */
export type SidebarFrontmatter = boolean | string | undefined

interface StoredSidebarPref {
	/** Route path the preference was published for. */
	path: string
	sidebar: SidebarFrontmatter
}

/**
 * Normalizes a raw `sidebar` frontmatter value into the typed preference.
 *
 * Because the field's schema is a `boolean | string` union, Nuxt Content stores
 * it in a TEXT column and returns booleans as the strings `"true"` / `"false"`.
 * Collapse the string forms back to booleans; any other string is a menu id.
 *
 * @param raw - The value read from the content document (`page.sidebar`).
 * @returns `false` / `true` / a menu-id string / `undefined`.
 */
export function normalizeSidebarFrontmatter( raw: unknown ): SidebarFrontmatter {
	if ( raw === undefined || raw === null || raw === '' ) {
		return undefined
	}

	if ( typeof raw === 'boolean' ) {
		return raw
	}

	if ( raw === 'false' ) {
		return false
	}

	if ( raw === 'true' ) {
		return true
	}

	return String( raw )
}

/**
 * Shared reactive store for the current content page's `sidebar` preference.
 *
 * @returns Nuxt `useState` ref holding the path-keyed preference (or `null`).
 */
export function useContentPageSidebarState() {
	return useState<StoredSidebarPref | null>( 'fd-content-sidebar', () => null )
}

/**
 * Publishes a content page's `sidebar` frontmatter for the current route.
 *
 * @param path - The route path the value applies to (`route.path`).
 * @param sidebar - The page's `sidebar` frontmatter value.
 */
export function publishContentPageSidebar( path: string, sidebar: SidebarFrontmatter ): void {
	useContentPageSidebarState().value = { path, sidebar }
}

/**
 * Resolves the `sidebar` preference for a path, ignoring stale values published
 * for a different route.
 *
 * @param path - The current route path.
 * @returns The preference when it matches `path`, otherwise `undefined`.
 */
export function resolveContentPageSidebar( path: string ): SidebarFrontmatter {
	const stored = useContentPageSidebarState().value
	return stored && stored.path === path ? stored.sidebar : undefined
}
