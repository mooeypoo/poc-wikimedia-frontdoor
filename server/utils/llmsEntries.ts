import type { LlmsModuleEntry } from '../../app/utils/llmsDocuments.ts'
import { referencePathForModule, moduleNameToReferenceSlug } from '../../config/referenceRoutes.ts'
import { projectAllModuleReferences } from './referenceProjection.ts'

/**
 * Builds the `llms.txt` module entries from the shared tier-1 projection.
 *
 * Both `llms.txt` and `llms-full.txt` consume this, so the index and the corpus
 * can never disagree about which modules exist or how many operations each has.
 *
 * URLs are English (default-locale) and therefore unprefixed. The machine
 * surfaces are English-only for now: translation overlays do not exist yet, and
 * an AI consumer served 15 near-identical English corpora would be worse off
 * than one served a single authoritative document.
 *
 * @param siteOrigin - Absolute origin, without a trailing slash.
 * @returns One entry per committed module, in source-of-truth order.
 */
export async function buildLlmsModuleEntries( siteOrigin: string ): Promise<LlmsModuleEntry[]> {
	const projections = await projectAllModuleReferences()

	return projections.map( ( projection ) => ( {
		moduleName: projection.moduleName,
		title: projection.title,
		description: projection.description,
		specVersion: projection.specVersion,
		instanceTotal: projection.instances.total,
		pageUrl: `${ siteOrigin }${ referencePathForModule( projection.moduleName ) }`,
		specUrl: `${ siteOrigin }/openapi/${ moduleNameToReferenceSlug( projection.moduleName ) }.json`,
		operations: projection.operations.map( ( operation ) => ( {
			method: operation.method,
			path: operation.path,
			summary: operation.summary,
			anchor: operation.anchor
		} ) )
	} ) )
}
