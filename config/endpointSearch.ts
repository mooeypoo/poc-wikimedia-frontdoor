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
 * Relative weight of each indexed field when scoring a match, passed straight
 * through as MiniSearch's per-field `boost`.
 *
 * Summary is the endpoint's own one-line description and by far the strongest
 * signal. Path and operationId rank next because they carry the domain nouns a
 * developer actually types ("lists", "pageviews", "revision") — and they are the
 * only signal at all for the operations whose upstream spec omits a summary.
 * Description is a truncated excerpt and ranks lowest: a match deep in prose is
 * weak evidence next to a match in the endpoint's own name.
 *
 * These double as the indexed field list, so a field added here is searched.
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
 * Score multiplier for a term that only matched as a prefix.
 *
 * Half weight, so typing "list" still finds "lists" but ranks behind an exact
 * "list". MiniSearch's own default here is 0.375; we keep the halving the
 * hand-rolled scorer documented and shipped.
 */
export const ENDPOINT_SEARCH_PREFIX_WEIGHT = 0.5

/**
 * Edit distance allowed on a term, as a fraction of its length, and the score
 * multiplier a term that only matched fuzzily earns.
 *
 * New capability rather than a port: the hand-rolled scorer had no typo
 * tolerance at all, so "pagevies" found nothing. 0.2 is roughly one edit per
 * five characters, which catches a transposed or dropped letter without letting
 * short words match each other. Fuzzy hits are weighted well below prefix ones
 * so they surface only when nothing better matched.
 */
export const ENDPOINT_SEARCH_FUZZY_DISTANCE = 0.2
export const ENDPOINT_SEARCH_FUZZY_WEIGHT = 0.3

/**
 * Longest snippet, in characters, rendered under an endpoint result.
 *
 * Sized to about two lines at the panel's width. Upstream descriptions run to
 * paragraphs, so the snippet is a window around the first match rather than a
 * leading truncation — the matched words are the reason the result is there.
 */
export const ENDPOINT_SEARCH_SNIPPET_MAX_LENGTH = 160

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
