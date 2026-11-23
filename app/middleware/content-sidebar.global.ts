import { CONTENT_SIDEBAR_MAP } from '#build/content-sidebar-map'
import {
	normalizeSidebarFrontmatter,
	publishContentPageSidebar
} from '../composables/useContentPageSidebar'
import { contentLocaleFromPath, stripContentLocalePrefix } from '../utils/contentRoute'
import { lookupContentPageSidebar } from '../utils/contentSidebarLookup'
import { isExplorerRoutePath } from '../utils/explorerRoute'

/**
 * Resolves the target content page's `sidebar` frontmatter and publishes it for
 * the application shell, *before* the layout renders.
 *
 * The shell (`app/layouts/default.vue` → `usePageSectionNav`) decides the left
 * section nav and the full-width collapse from the route alone; it cannot read
 * the page frontmatter, which loads inside the page components. Resolving it in a
 * global route middleware guarantees the preference is in place at layout render
 * time on both SSR and client navigation, so there is no post-hydration flash of
 * a reserved-but-empty column. See `docs/content-authoring-guide.md`.
 *
 * The field comes from the map `modules/content-sidebar-map.mjs` builds out of
 * the frontmatter, not from the content collection: global middleware runs in
 * the browser too, where any `queryCollection` pulls down the SQLite WASM
 * runtime and the whole collection dump to read one field.
 */
export default defineNuxtRouteMiddleware( ( to ) => {
	// Explorer resolves its own side nav from the path; skip the lookup.
	if ( isExplorerRoutePath( to.path ) ) {
		return
	}

	const contentPath = stripContentLocalePrefix( to.path )

	// Account dashboard is a Vue page (not Nuxt Content); hide the start column
	// so an empty section nav track is not reserved (Figma /account layout).
	if ( contentPath === '/account' ) {
		publishContentPageSidebar( to.path, false )
		return
	}

	// A non-content route resolves to no preference, so the shell falls back to
	// path-based section-nav resolution.
	publishContentPageSidebar(
		to.path,
		normalizeSidebarFrontmatter(
			lookupContentPageSidebar( CONTENT_SIDEBAR_MAP, contentLocaleFromPath( to.path ), contentPath )
		)
	)
} )
