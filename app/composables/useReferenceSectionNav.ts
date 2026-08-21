import { REFERENCE_PATH_PREFIX } from '../../config/referenceRoutes'
import { isolateLabel } from '../utils/bidiIsolation'
import type { ResolvedSectionNavSection } from './usePageSectionNav'

/**
 * Dynamic section-nav content for the static API reference surface.
 *
 * The fixed part of this menu (the link back to the index) is config, like every
 * other menu. The module list and a module's operations are **data** — generated
 * from committed OpenAPI specs and changing whenever the fleet does — so they are
 * appended here rather than hand-listed in `config/sectionNavigation.js`, which
 * would rot on the next regeneration.
 *
 * **Fetched here, deduplicated with the pages.** The first implementation read
 * Nuxt's payload cache under the keys the pages populate, on the assumption that
 * the page had already fetched them. It had not: during server rendering the
 * layout renders *before* the page component, so the cache was always empty and
 * both sections silently vanished from the prerendered HTML. This now calls
 * `useAsyncData` with **the same keys the pages use**, so Nuxt awaits it before
 * rendering, and the page's later call is a cache hit rather than a second
 * request.
 *
 * Off the reference surface the handlers resolve to `null` immediately, so no
 * request is issued from the rest of the site.
 *
 * Operation labels are external strings (method and path from a spec), so they
 * are wrapped in FSI/PDI: they reach `CdxMenuItem` as an attribute where `<bdi>`
 * is unavailable (Absolute Rule 2).
 */

interface ReferenceIndexPayload {
	modules?: { moduleName: string; slug: string; title: string }[]
}

interface ReferenceModulePayload {
	moduleName?: string
	operations?: { method: string; path: string; anchor: string }[]
}

/**
 * Extracts the module slug from a `/reference/…` path.
 *
 * @param contentPath - Locale-stripped route path.
 * @returns The slug, or an empty string when this is not a module page.
 */
function referenceSlugFromPath( contentPath: string ): string {
	const prefix = `/${ REFERENCE_PATH_PREFIX }/`
	return contentPath.startsWith( prefix ) ? contentPath.slice( prefix.length ) : ''
}

/**
 * Builds the dynamic reference sections for the current route.
 *
 * @param contentPath - Locale-stripped route path (e.g. `/reference/site/v1`).
 * @param contentLocale - Active content locale, for locale-aware hrefs.
 * @returns Sections to append after the configured ones; empty off-surface.
 */
export function useReferenceSectionNav(
	contentPath: Ref<string>,
	contentLocale: Ref<string>
): ComputedRef<ResolvedSectionNavSection[]> {
	const { $bananaI18n } = useNuxtApp()
	const localePath = useLocalePath()

	const slug = computed( () => referenceSlugFromPath( contentPath.value ) )
	const isReferenceSurface = computed(
		() => contentPath.value === `/${ REFERENCE_PATH_PREFIX }` || slug.value !== ''
	)

	const { data: indexPayload } = useAsyncData<ReferenceIndexPayload | null>(
		'reference-index',
		() => ( isReferenceSurface.value ? $fetch( '/api/reference-index' ) : Promise.resolve( null ) ),
		{ watch: [ isReferenceSurface ] }
	)

	const { data: modulePayload } = useAsyncData<ReferenceModulePayload | null>(
		// Same key the module page uses, so this is one request shared between the
		// sidebar and the page rather than two.
		() => ( slug.value ? `reference-${ slug.value }` : 'reference-no-module' ),
		() => ( slug.value ? $fetch( `/api/reference/${ slug.value }` ) : Promise.resolve( null ) ),
		{ watch: [ slug ] }
	)

	return computed<ResolvedSectionNavSection[]>( () => {
		const sections: ResolvedSectionNavSection[] = []

		// Operations for the module being viewed, so a long module is navigable
		// without scrolling the page. Anchors are the canonical operation anchor
		// vocabulary (ADR §4), so these match the page's heading ids exactly.
		const operations = modulePayload.value?.operations ?? []
		if ( operations.length > 0 ) {
			sections.push( {
				id: 'reference-operations',
				title: $bananaI18n( 'reference-operations-heading' ),
				items: operations.map( ( operation ) => ( {
					id: operation.anchor,
					label: isolateLabel( `${ operation.method } ${ operation.path }` ),
					to: `${ localePath( `/${ REFERENCE_PATH_PREFIX }/${ slug.value }` ) }#${ operation.anchor }`,
					// In-page anchors are never the "current page" in the sense the
					// menu means; highlighting them would need scroll tracking, which
					// the on-this-page navigation owns elsewhere.
					isActive: false
				} ) )
			} )
		}

		// Sibling modules, so the reader can move across the surface directly.
		const modules = indexPayload.value?.modules ?? []
		if ( modules.length > 0 ) {
			sections.push( {
				id: 'reference-modules',
				title: $bananaI18n( 'section-nav-reference-modules-title' ),
				items: modules.map( ( wikiModule ) => {
					const target = `/${ REFERENCE_PATH_PREFIX }/${ wikiModule.slug }`
					return {
						id: `module-${ wikiModule.slug }`,
						label: isolateLabel( wikiModule.title ),
						to: localePath( target ),
						isActive: contentPath.value === target
					}
				} )
			} )
		}

		return sections
	} )
}
