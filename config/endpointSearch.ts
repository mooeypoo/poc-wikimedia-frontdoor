/**
 * Policy layer over the generated endpoint search index.
 *
 * The data lives in `config/generated/endpointSearchIndex.generated.ts`
 * (regenerate with `npm run generate-module-source-of-truth`; see
 * docs/adr-explorer-deep-linking.md §10). This module owns the hand-authored
 * decisions that sit on top of it — which endpoints are searchable, how strongly
 * each field counts toward a match, and how many results to show — so the
 * generated artifact stays pure data, and consumers never reach into
 * `config/generated/` directly.
 */

import type {
	GeneratedEndpointSearchRecord,
	GeneratedEndpointGate
} from './generated/endpointSearchIndex.generated'

export type { GeneratedEndpointSearchRecord, GeneratedEndpointGate }

/**
 * Maximum number of endpoint results rendered in the search panel.
 *
 * The endpoint group shares the panel with locale-partitioned content results,
 * so it is capped rather than allowed to push content off the screen.
 */
export const ENDPOINT_SEARCH_RESULT_LIMIT = 6

/** Minimum query length before the endpoint index is consulted (matches content search). */
export const ENDPOINT_SEARCH_MIN_QUERY_LENGTH = 2

/**
 * Relative weight of each indexed field when scoring a match.
 *
 * Summary is the endpoint's own one-line description and by far the strongest
 * signal. Path and operationId rank next because they carry the domain nouns a
 * developer actually types ("lists", "pageviews", "revision") — and they are the
 * only signal at all for the operations whose upstream spec omits a summary.
 * Description is a truncated excerpt and ranks lowest: a match deep in prose is
 * weak evidence next to a match in the endpoint's own name.
 */
export const ENDPOINT_SEARCH_FIELD_WEIGHTS = {
	summary: 10,
	path: 7,
	operationId: 6,
	tags: 5,
	moduleTitle: 4,
	method: 3,
	description: 2
} as const

/**
 * Score multiplier applied to endpoints the spec marks deprecated.
 *
 * Deprecated endpoints stay searchable — developers maintaining existing code
 * still need to find them — but rank below live equivalents.
 */
export const ENDPOINT_SEARCH_DEPRECATED_WEIGHT = 0.4

/**
 * Returns whether an endpoint should appear in site-wide search results.
 *
 * Internal-gated modules (`*-internal`, e.g. `discord/v0-internal`) are hidden in
 * the explorer unless the user ticks the internal opt-in checkbox, and the
 * explorer actively re-selects away from a gated module
 * (`useExplorerOptInFilteredModules`). Surfacing their endpoints in the global
 * search bar would therefore produce results that bounce the user somewhere else
 * on arrival, so they are excluded. Beta-gated modules are opt-in *on* by
 * default, so they stay searchable.
 *
 * @param endpointRecord - A record from the generated endpoint index.
 * @returns True when the endpoint may be shown in search results.
 */
export function isEndpointSearchable( endpointRecord: GeneratedEndpointSearchRecord ): boolean {
	return endpointRecord.gate !== 'internal'
}
