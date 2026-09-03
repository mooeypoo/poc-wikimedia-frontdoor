/**
 * Keyword scoring over the generated endpoint search index.
 *
 * A hand-rolled scorer rather than a search library: the index is a few hundred
 * records, so the cost is negligible, and the ranking needs field weights that
 * are specific to OpenAPI shape — notably that path segments and `operationId`
 * have to carry the ~8% of Wikimedia REST operations whose upstream spec omits a
 * summary entirely. See docs/adr-explorer-deep-linking.md §10.
 *
 * Matching is AND across query tokens (every token must hit some field) with a
 * per-token best-field score, so "reading list" ranks the reading-list endpoints
 * above anything matching only one of the two words.
 *
 * Endpoint text is English-only — it comes from the upstream OpenAPI specs,
 * which Wikimedia does not translate — so unlike the content search this is not
 * locale-partitioned. Results are rendered in their own labelled group.
 */

import {
	ENDPOINT_SEARCH_FIELD_WEIGHTS,
	ENDPOINT_SEARCH_DEPRECATED_WEIGHT,
	ENDPOINT_SEARCH_RESULT_LIMIT,
	ENDPOINT_SEARCH_MIN_QUERY_LENGTH,
	isEndpointSearchable
} from '../../config/endpointSearch.ts'
import type { GeneratedEndpointSearchRecord } from '../../config/endpointSearch.ts'

/** An endpoint record paired with the score it earned for a query. */
export interface EndpointSearchResult {
	record: GeneratedEndpointSearchRecord
	score: number
}

/**
 * Returns the display title for an endpoint search result.
 *
 * Roughly 8% of Wikimedia REST operations ship without a `summary`, and a few
 * without an `operationId` either, so the title falls back through the fields
 * that are actually always present rather than rendering an empty heading.
 *
 * The result is external text (it originates in an upstream OpenAPI spec) and
 * must be BiDi-isolated wherever it is rendered.
 *
 * @param record - An endpoint record from the generated index.
 * @returns The best available human-readable title for the operation.
 */
export function endpointResultTitle( record: GeneratedEndpointSearchRecord ): string {
	return record.summary || record.operationId || record.path
}

/** A record's searchable text, split into words once and reused across queries. */
interface EndpointSearchEntry {
	record: GeneratedEndpointSearchRecord
	/** Field name → the words that field contributes. */
	fieldWords: Array<{ weight: number, words: string[] }>
}

/**
 * Splits a string into lower-cased, alphanumeric word tokens.
 *
 * Unicode-aware so accented characters in a description survive as letters
 * rather than splitting a word in two. Everything else — slashes, braces,
 * underscores, punctuation — is a separator, which is what turns an OpenAPI path
 * like `/v1/page/{title}/bare` into the words a developer would actually type.
 *
 * @param value - Raw text.
 * @returns Lower-cased word tokens (empty when there is no usable text).
 */
export function tokenizeEndpointText( value: string | undefined ): string[] {
	if ( !value ) {
		return []
	}
	return value
		.toLowerCase()
		.split( /[^\p{L}\p{N}]+/u )
		.filter( ( token ) => token !== '' )
}

/**
 * Builds the reusable word index for a set of endpoint records.
 *
 * Tokenizing every record on every keystroke would be wasteful, so callers build
 * this once (after the index module is loaded) and pass it to
 * {@link searchEndpointIndex} for each query.
 *
 * Records excluded by {@link isEndpointSearchable} are dropped here, so gated
 * endpoints can never leak into a result set regardless of the query.
 *
 * @param records - Records from the generated endpoint index.
 * @returns Prepared search entries.
 */
export function buildEndpointSearchEntries(
	records: GeneratedEndpointSearchRecord[]
): EndpointSearchEntry[] {
	return records.filter( isEndpointSearchable ).map( ( record ) => ( {
		record,
		fieldWords: [
			{ weight: ENDPOINT_SEARCH_FIELD_WEIGHTS.summary, words: tokenizeEndpointText( record.summary ) },
			{ weight: ENDPOINT_SEARCH_FIELD_WEIGHTS.path, words: tokenizeEndpointText( record.path ) },
			{ weight: ENDPOINT_SEARCH_FIELD_WEIGHTS.operationId, words: tokenizeEndpointText( record.operationId ) },
			{ weight: ENDPOINT_SEARCH_FIELD_WEIGHTS.tags, words: tokenizeEndpointText( record.tags?.join( ' ' ) ) },
			{ weight: ENDPOINT_SEARCH_FIELD_WEIGHTS.moduleTitle, words: tokenizeEndpointText( record.moduleTitle ) },
			{ weight: ENDPOINT_SEARCH_FIELD_WEIGHTS.method, words: tokenizeEndpointText( record.method ) },
			{ weight: ENDPOINT_SEARCH_FIELD_WEIGHTS.description, words: tokenizeEndpointText( record.description ) }
		].filter( ( field ) => field.words.length > 0 )
	} ) )
}

/**
 * Scores one query token against one prepared entry.
 *
 * A whole-word hit scores the field's full weight; a prefix hit scores half, so
 * typing "list" still finds "lists" but ranks behind an exact "list". The best
 * field wins rather than the sum, so an endpoint does not out-rank another just
 * by repeating the same word across several fields.
 *
 * @param entry - Prepared search entry.
 * @param queryToken - A single lower-cased query token.
 * @returns The token's score, or 0 when no field matches it.
 */
function scoreTokenAgainstEntry( entry: EndpointSearchEntry, queryToken: string ): number {
	let bestScore = 0

	for ( const field of entry.fieldWords ) {
		for ( const word of field.words ) {
			if ( word === queryToken ) {
				bestScore = Math.max( bestScore, field.weight )
				// Full weight is the ceiling for this field; no better hit is possible.
				break
			}
			if ( word.startsWith( queryToken ) ) {
				bestScore = Math.max( bestScore, field.weight / 2 )
			}
		}
	}

	return bestScore
}

/**
 * Ranks endpoints against a free-text query.
 *
 * Every query token must match some field (AND semantics) — a query of
 * "reading list" will not return an endpoint that only matches "list" — which
 * keeps the endpoint group small and precise next to the content results.
 *
 * @param entries - Prepared entries from {@link buildEndpointSearchEntries}.
 * @param query - Raw user query.
 * @param resultLimit - Maximum results to return.
 * @returns Scored results, highest score first; empty when the query is too short.
 */
export function searchEndpointIndex(
	entries: EndpointSearchEntry[],
	query: string,
	resultLimit: number = ENDPOINT_SEARCH_RESULT_LIMIT
): EndpointSearchResult[] {
	const trimmedQuery = query.trim()
	if ( trimmedQuery.length < ENDPOINT_SEARCH_MIN_QUERY_LENGTH ) {
		return []
	}

	const queryTokens = tokenizeEndpointText( trimmedQuery )
	if ( queryTokens.length === 0 ) {
		return []
	}

	const results: EndpointSearchResult[] = []

	for ( const entry of entries ) {
		let totalScore = 0
		let hasUnmatchedToken = false

		for ( const queryToken of queryTokens ) {
			const tokenScore = scoreTokenAgainstEntry( entry, queryToken )
			if ( tokenScore === 0 ) {
				hasUnmatchedToken = true
				break
			}
			totalScore += tokenScore
		}

		if ( hasUnmatchedToken ) {
			continue
		}

		if ( entry.record.isDeprecated ) {
			totalScore *= ENDPOINT_SEARCH_DEPRECATED_WEIGHT
		}

		results.push( { record: entry.record, score: totalScore } )
	}

	// Ties break on module then path so the ordering is stable for a given query
	// rather than depending on index order.
	results.sort( ( a, b ) => {
		if ( b.score !== a.score ) {
			return b.score - a.score
		}
		return a.record.module.localeCompare( b.record.module )
			|| a.record.path.localeCompare( b.record.path )
			|| a.record.method.localeCompare( b.record.method )
	} )

	return results.slice( 0, resultLimit )
}
