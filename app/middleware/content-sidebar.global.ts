import {
	normalizeSidebarFrontmatter,
	publishContentPageSidebar,
	type SidebarFrontmatter
} from '../composables/useContentPageSidebar'
import { useLocalizedContentPage } from '../composables/useLocalizedContentPage'
import { contentLocaleFromPath, stripContentLocalePrefix } from '../utils/contentRoute'
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
 */
export default defineNuxtRouteMiddleware( async ( to ) => {
	// Explorer resolves its own side nav from the path; skip the content query.
	if ( isExplorerRoutePath( to.path ) ) {
		return
	}

	const contentPath = stripContentLocalePrefix( to.path )
	const slugPath = contentPath === '/' ? '' : contentPath.replace( /^\/+/, '' )
	const localeCode = contentLocaleFromPath( to.path )

	let sidebar: SidebarFrontmatter
	try {
		const result = await useLocalizedContentPage( localeCode, slugPath )
		sidebar = normalizeSidebarFrontmatter( result?.page?.sidebar )
	} catch {
		// A non-content route (or a failed lookup) leaves the preference undefined,
		// so the shell falls back to path-based section-nav resolution.
		sidebar = undefined
	}

	publishContentPageSidebar( to.path, sidebar )
} )
