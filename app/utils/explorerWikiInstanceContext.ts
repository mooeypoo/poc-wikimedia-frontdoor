import { ref } from 'vue'

/**
 * Active explorer wiki instance id for UI rendered outside the Nuxt tree (e.g. Scalar modal).
 *
 * Updated from the explorer page when the user changes project.
 */
export const activeExplorerWikiInstanceId = ref( 'enwiki' )

/**
 * Sets the active explorer wiki instance id for cross-tree consumers.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns Nothing.
 */
export function setActiveExplorerWikiInstanceId( wikiInstanceId: string ): void {
	activeExplorerWikiInstanceId.value = wikiInstanceId
}
