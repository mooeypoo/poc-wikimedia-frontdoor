/**
 * Accessor layer over the generated module source of truth.
 *
 * The data lives in three generated, diff-reviewed artifacts under
 * `config/generated/` (regenerate with `npm run generate-module-source-of-truth`;
 * see docs/adr-module-source-of-truth.md):
 *
 *   wikiInstances.generated.ts — the public, open wiki fleet, keyed by id
 *   modules.generated.ts       — unique REST API modules, each with the sorted
 *                                instance ids that expose it (FKs into the fleet)
 *   module-specs/<name>.generated.json — each module's full OpenAPI spec
 *
 * This module is the single entry point for consumers: it resolves the
 * instance-id foreign keys so callers never re-implement the cross-file joins.
 * Spec JSON is not imported here — consumers load `module-specs/<specFile>.generated.json`
 * themselves, since load strategy differs between build-time and runtime.
 */

import { GENERATED_WIKI_INSTANCES } from './generated/wikiInstances.generated'
import type { GeneratedWikiInstance } from './generated/wikiInstances.generated'
import { GENERATED_MODULES } from './generated/modules.generated'
import type { GeneratedModule } from './generated/modules.generated'

export type { GeneratedWikiInstance, GeneratedModule }
export { GENERATED_WIKI_INSTANCES, GENERATED_MODULES }

const INSTANCE_BY_ID = new Map(
	GENERATED_WIKI_INSTANCES.map( ( instance ) => [ instance.id, instance ] )
)

const MODULE_BY_NAME = new Map(
	GENERATED_MODULES.map( ( wikiModule ) => [ wikiModule.name, wikiModule ] )
)

/**
 * Returns a wiki instance by its id (dbname).
 *
 * @param instanceId - Instance id, e.g. `enwiki`.
 * @returns The instance, or undefined when unknown.
 */
export function getWikiInstanceById( instanceId: string ): GeneratedWikiInstance | undefined {
	return INSTANCE_BY_ID.get( instanceId )
}

/**
 * Returns a module by its full discovery name.
 *
 * @param moduleName - Full discovery name, e.g. `site/v1`.
 * @returns The module, or undefined when unknown.
 */
export function getModuleByName( moduleName: string ): GeneratedModule | undefined {
	return MODULE_BY_NAME.get( moduleName )
}

/**
 * Resolves a module's instance-id list to full instance objects (the FK join),
 * preserving the sorted order. Ids without a matching instance are skipped.
 *
 * @param moduleName - Full discovery name, e.g. `site/v1`.
 * @returns The instances that expose the module (empty when the module is unknown).
 */
export function getModuleInstances( moduleName: string ): GeneratedWikiInstance[] {
	const wikiModule = MODULE_BY_NAME.get( moduleName )
	if ( !wikiModule ) {
		return []
	}
	return wikiModule.instances
		.map( ( instanceId ) => INSTANCE_BY_ID.get( instanceId ) )
		.filter( ( instance ): instance is GeneratedWikiInstance => instance !== undefined )
}

/**
 * Returns the modules exposed by a given wiki instance.
 *
 * @param instanceId - Instance id, e.g. `wikidatawiki`.
 * @returns Modules whose instance list includes the id, in module-name order.
 */
export function getModulesForInstance( instanceId: string ): GeneratedModule[] {
	return GENERATED_MODULES.filter( ( wikiModule ) => wikiModule.instances.includes( instanceId ) )
}

/**
 * Preferred instances, in priority order, for resolving a module-only quick
 * deep-link (`/explorer/q/<module>`) to a concrete instance.
 *
 * The first instance here that actually exposes the requested module wins. This
 * is a product/QA decision — familiar, high-traffic wikis are preferred over the
 * module's arbitrary first-sorted instance — so it lives as editable policy here,
 * distinct from the generator's `specSourceInstance` choice. See
 * docs/adr-explorer-deep-linking.md §6.
 */
export const QUICK_LINK_INSTANCE_PREFERENCE = [
	'enwiki',
	'mediawikiwiki',
	'wikidatawiki',
	'commonswiki'
] as const

/**
 * Resolves the instance a module-only quick deep-link should load.
 *
 * Walks {@link QUICK_LINK_INSTANCE_PREFERENCE} in order and returns the first
 * preferred instance that exposes the module; when none do, falls back to the
 * module's first (sorted) instance, and finally its representative instance.
 *
 * @param wikiModule - The module to resolve an instance for.
 * @returns The chosen instance id.
 */
export function resolvePreferredModuleInstance( wikiModule: GeneratedModule ): string {
	const preferredInstanceId = QUICK_LINK_INSTANCE_PREFERENCE.find(
		( instanceId ) => wikiModule.instances.includes( instanceId )
	)

	return preferredInstanceId ?? wikiModule.instances[ 0 ] ?? wikiModule.specSourceInstance
}
