import { defineEventHandler } from 'h3'

import { GENERATED_MODULES } from '../../config/generated/modules.generated.ts'
import { moduleNameToReferenceSlug } from '../../config/referenceRoutes.ts'
import { getModuleInstances } from '../../config/moduleSourceOfTruth.ts'

/**
 * Index of every documented module, for the reference landing page and sidebar.
 *
 * A server route rather than a client-side import of the source of truth: the
 * accessor builds an 841-instance lookup map at module load and is not
 * tree-shakeable, so importing it into the page would ship ~250 KB of registry
 * to the browser. Same reasoning as `explorer-quick-resolve`.
 *
 * Deliberately NOT at `/api/reference`: that path is ambiguous against the
 * `[...module]` catch-all next to it, which matches an empty tail. Same class of
 * ambiguity as `/reference/<module>/openapi.json`, avoided the same way — a
 * distinct path rather than reliance on route-precedence subtleties.
 *
 * Sorted by operation-bearing usefulness rather than alphabetically — a reader
 * landing here wants the substantial modules first, and `-` (published as
 * `general`) would otherwise sort to the top on punctuation alone.
 */
export default defineEventHandler( () => {
	const modules = GENERATED_MODULES.map( ( wikiModule ) => ( {
		moduleName: wikiModule.name,
		slug: moduleNameToReferenceSlug( wikiModule.name ),
		title: wikiModule.title ?? wikiModule.name,
		version: wikiModule.version,
		instanceTotal: getModuleInstances( wikiModule.name ).length
	} ) )

	return {
		modules: modules.sort(
			( a, b ) => b.instanceTotal - a.instanceTotal || a.moduleName.localeCompare( b.moduleName )
		)
	}
} )
