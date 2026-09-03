/**
 * Policy for choosing which wiki instance a module-only explorer link lands on.
 *
 * Split out of `config/moduleSourceOfTruth.ts` as a self-contained leaf module
 * (no value imports) so it can be loaded directly by Node — the endpoint search
 * index generator needs the *same* policy the runtime quick-resolve route uses,
 * and the accessor's extensionless imports are not resolvable outside the app
 * build (see the note in tests/moduleSourceOfTruth.test.mjs). App and server code
 * should keep importing these from `config/moduleSourceOfTruth`, which re-exports
 * them; this file exists so the generator cannot drift from that policy.
 *
 * See docs/adr-explorer-deep-linking.md §6, §10.
 */

import type { GeneratedModule } from './generated/modules.generated'

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
