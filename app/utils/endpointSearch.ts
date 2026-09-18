/**
 * MiniSearch over the generated endpoint search index.
 *
 * The ranking this needs is specific to OpenAPI shape: path segments and
 * `operationId` have to carry the ~8% of Wikimedia REST operations whose
 * upstream spec omits a summary entirely, and every query token has to match
 * so the group stays precise enough to lead the panel. Both are MiniSearch
 * options (`boost`, `combineWith: 'AND'`), which is what reversed the earlier
 * decision to hand-roll a scorer — see docs/adr-explorer-deep-linking.md §10.
 * Typo tolerance and the highlighted snippet come along for free; neither was
 * reachable without the library.
 *
 * Endpoint text is English-only — it comes from the upstream OpenAPI specs,
 * which Wikimedia does not translate — so unlike the content search this is not
 * locale-partitioned. Results are rendered in their own labelled group.
 */

import MiniSearch from 'minisearch'
import {
	ENDPOINT_SEARCH_FIELD_WEIGHTS,
	ENDPOINT_SEARCH_DEPRECATED_WEIGHT,
	ENDPOINT_SEARCH_RESULT_LIMIT,
	ENDPOINT_SEARCH_MIN_QUERY_LENGTH,
	ENDPOINT_SEARCH_PREFIX_WEIGHT,
	ENDPOINT_SEARCH_FUZZY_DISTANCE,
	ENDPOINT_SEARCH_FUZZY_MIN_TERM_LENGTH,
	ENDPOINT_SEARCH_FUZZY_WEIGHT,
	ENDPOINT_SEARCH_SNIPPET_MAX_LENGTH,
	isEndpointSearchable
} from '../../config/endpointSearch.ts'
import type { GeneratedEndpointSearchRecord } from '../../config/endpointSearch.ts'
import { escapeHtml } from './searchSnippetMarkup.ts'

/** An endpoint record paired with the score it earned and its snippet markup. */
export interface EndpointSearchResult {
	record: GeneratedEndpointSearchRecord
	score: number
	/**
	 * Snippet markup for the result line. Safe to render with `v-html`: the
	 * upstream text is escaped by {@link buildEndpointSnippet} and the only tags
	 * in it are the `<mark>` elements that function adds.
	 */
	snippet: string
}

/**
 * A built MiniSearch index, plus the records its document ids point back into.
 *
 * Named for what it does rather than what it holds, because
 * `scripts/lib/endpointSearchIndex.mjs` already owns "endpoint search index" —
 * that one generates the records, this one searches them.
 */
export interface EndpointSearcher {
	miniSearch: MiniSearch<EndpointSearchDocument>
	records: GeneratedEndpointSearchRecord[]
}

/**
 * One record flattened for indexing.
 *
 * `id` is the record's position in {@link EndpointSearcher.records}, so a
 * result maps back to its record without storing the whole thing twice. Every
 * searched field is a plain string because MiniSearch tokenizes field values,
 * and leaving `tags` an array would put that join behind its default
 * `stringifyField` rather than in front of us.
 */
export interface EndpointSearchDocument {
	id: number
	summary: string
	path: string
	operationId: string
	tags: string
	moduleTitle: string
	method: string
	description: string
	isDeprecated: boolean
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

/**
 * Splits a string into lower-cased, alphanumeric word tokens.
 *
 * Unicode-aware so accented characters in a description survive as letters
 * rather than splitting a word in two. Everything else — slashes, braces,
 * underscores, punctuation — is a separator, which is what turns an OpenAPI path
 * like `/v1/page/{title}/bare` into the words a developer would actually type.
 *
 * Used in place of MiniSearch's default tokenizer, which splits on Unicode
 * spaces and punctuation only and so leaves symbols like `+` and `=` glued
 * inside a token.
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
 * Flattens one generated record into its indexed document.
 *
 * @param record        - A record from the generated index.
 * @param documentId    - The record's position in the searchable record list.
 * @returns The document MiniSearch indexes.
 */
function toSearchDocument(
	record: GeneratedEndpointSearchRecord,
	documentId: number
): EndpointSearchDocument {
	return {
		id: documentId,
		summary: record.summary ?? '',
		path: record.path,
		operationId: record.operationId ?? '',
		tags: record.tags?.join( ' ' ) ?? '',
		moduleTitle: record.moduleTitle,
		method: record.method,
		description: record.description ?? '',
		isDeprecated: record.isDeprecated === true
	}
}

/**
 * Builds the searchable index for a set of endpoint records.
 *
 * Indexing every record on every keystroke would be wasteful, so callers build
 * this once (after the index module is loaded) and pass it to
 * {@link searchEndpoints} for each query.
 *
 * Records excluded by {@link isEndpointSearchable} are dropped here, so gated
 * endpoints can never leak into a result set regardless of the query.
 *
 * @param records - Records from the generated endpoint index.
 * @returns The built index, ready to search.
 */
export function buildEndpointSearcher(
	records: GeneratedEndpointSearchRecord[]
): EndpointSearcher {
	const searchableRecords = records.filter( isEndpointSearchable )

	const miniSearch = new MiniSearch<EndpointSearchDocument>( {
		fields: Object.keys( ENDPOINT_SEARCH_FIELD_WEIGHTS ),
		// Only what scoring and the snippet read back. The rest of the record is
		// reached through `records[ id ]`, so it isn't duplicated into the index.
		storeFields: [ 'summary', 'description', 'isDeprecated' ],
		tokenize: tokenizeEndpointText,
		searchOptions: {
			// Copied, not passed through: this object outlives the call inside a
			// long-lived MiniSearch instance, and the policy layer's own is frozen
			// by `as const`.
			boost: { ...ENDPOINT_SEARCH_FIELD_WEIGHTS },
			// Every query token must match some field: "reading list" will not
			// return an endpoint that only matches "list".
			combineWith: 'AND',
			prefix: true,
			// Per term, so short path tokens get prefix matching but no fuzziness.
			fuzzy: ( term ) => (
				term.length >= ENDPOINT_SEARCH_FUZZY_MIN_TERM_LENGTH
					? ENDPOINT_SEARCH_FUZZY_DISTANCE
					: false
			),
			weights: {
				prefix: ENDPOINT_SEARCH_PREFIX_WEIGHT,
				fuzzy: ENDPOINT_SEARCH_FUZZY_WEIGHT
			},
			boostDocument: ( _documentId, _term, storedFields ) => (
				storedFields?.isDeprecated ? ENDPOINT_SEARCH_DEPRECATED_WEIGHT : 1
			)
		}
	} )

	miniSearch.addAll( searchableRecords.map( toSearchDocument ) )

	return { miniSearch, records: searchableRecords }
}

/**
 * Escapes a string for literal use inside a regular expression.
 *
 * @param value - Raw text.
 * @returns The same text with regex metacharacters escaped.
 */
function escapeRegExp( value: string ): string {
	return value.replace( /[.*+?^${}()|[\]\\]/gu, '\\$&' )
}

/**
 * Builds the pattern that finds matched terms in snippet text.
 *
 * Anchored at a word start and allowed to run to the word's end, so a term that
 * matched a longer word — by prefix or by edit distance — highlights the whole
 * word rather than leaving a stray tail. Longest terms alternate first so the
 * more specific of two overlapping terms wins at a given position.
 *
 * The word start is a captured character rather than a lookbehind: WebKit only
 * shipped lookbehind in Safari 16.4, and `new RegExp` throwing on an older iOS
 * would take the whole endpoint group down rather than just the highlight.
 * Group 1 is that character (empty at the start of the text) and group 2 is the
 * word to wrap.
 *
 * @param matchedTerms - Document terms MiniSearch reported for the result.
 * @returns A global pattern, or null when there is nothing to highlight.
 */
function buildMatchedTermPattern( matchedTerms: string[] ): RegExp | null {
	const usableTerms = matchedTerms.filter( ( term ) => term.length > 0 )
	if ( usableTerms.length === 0 ) {
		return null
	}

	const alternation = [ ...usableTerms ]
		.sort( ( a, b ) => b.length - a.length )
		.map( escapeRegExp )
		.join( '|' )

	return new RegExp(
		`(^|[^\\p{L}\\p{N}])((?:${ alternation })[\\p{L}\\p{N}]*)`,
		'giu'
	)
}

/**
 * Narrows text to a window around the first matched term.
 *
 * Keeps roughly a third of the window ahead of the match so the matched word
 * reads in context rather than starting the line, and snaps both edges to word
 * boundaries so the excerpt never begins or ends mid-word.
 *
 * @param text      - Full source text.
 * @param matchIndex - Index of the first matched term, or -1 when none matched.
 * @param maxLength - Longest excerpt to return.
 * @returns The excerpt and whether either edge was cut.
 */
function excerptAroundMatch(
	text: string,
	matchIndex: number,
	maxLength: number
): { excerpt: string, isCutAtStart: boolean, isCutAtEnd: boolean } {
	if ( text.length <= maxLength ) {
		return { excerpt: text, isCutAtStart: false, isCutAtEnd: false }
	}

	const leadingContext = Math.floor( maxLength / 3 )
	const anchorIndex = matchIndex === -1 ? 0 : matchIndex
	let end = Math.min( text.length, Math.max( 0, anchorIndex - leadingContext ) + maxLength )
	let start = Math.max( 0, end - maxLength )

	if ( start > 0 ) {
		const nextBoundary = text.indexOf( ' ', start )
		if ( nextBoundary !== -1 && nextBoundary < anchorIndex ) {
			start = nextBoundary + 1
		}
	}
	if ( end < text.length ) {
		const previousBoundary = text.lastIndexOf( ' ', end )
		if ( previousBoundary > anchorIndex ) {
			end = previousBoundary
		}
	}

	return {
		excerpt: text.slice( start, end ),
		isCutAtStart: start > 0,
		isCutAtEnd: end < text.length
	}
}

/**
 * Escapes text and wraps every matched term in `<mark>`.
 *
 * Each run between matches is escaped on its own and the matched text is
 * escaped too, so the only markup that survives is the `<mark>` pairs added
 * here — escaping the whole string first would have shifted every match offset.
 *
 * @param text    - Raw excerpt.
 * @param pattern - Pattern from {@link buildMatchedTermPattern}, or null.
 * @returns Escaped markup with matches highlighted.
 */
function markMatchedTerms( text: string, pattern: RegExp | null ): string {
	if ( !pattern ) {
		return escapeHtml( text )
	}

	let markup = ''
	let cursor = 0
	pattern.lastIndex = 0

	let match = pattern.exec( text )
	while ( match !== null ) {
		// A zero-length match cannot advance lastIndex on its own and would spin.
		if ( match[ 0 ].length === 0 ) {
			pattern.lastIndex++
		} else {
			// Group 1 is the word-start character the pattern had to consume in
			// place of a lookbehind, so it is re-emitted outside the highlight.
			markup += escapeHtml( text.slice( cursor, match.index ) )
			markup += escapeHtml( match[ 1 ] ?? '' )
			markup += `<mark>${ escapeHtml( match[ 2 ] ?? '' ) }</mark>`
			cursor = match.index + match[ 0 ].length
		}
		match = pattern.exec( text )
	}

	return markup + escapeHtml( text.slice( cursor ) )
}

/**
 * Builds the snippet line shown under an endpoint result.
 *
 * Prefers the operation's description, which is the only field with enough prose
 * to excerpt; an operation without one keeps the module title that this line
 * carried before snippets existed, so the line is never empty.
 *
 * The source is external text from an upstream OpenAPI spec and is escaped here.
 * It still needs BiDi isolation at the render site, like every other spec value.
 *
 * @param record       - The matched endpoint record.
 * @param matchedTerms - Document terms MiniSearch reported for the result.
 * @param maxLength    - Longest snippet to return.
 * @returns Escaped markup with the matched terms wrapped in `<mark>`.
 */
export function buildEndpointSnippet(
	record: GeneratedEndpointSearchRecord,
	matchedTerms: string[],
	maxLength: number = ENDPOINT_SEARCH_SNIPPET_MAX_LENGTH
): string {
	const sourceText = record.description || record.moduleTitle
	if ( !sourceText ) {
		return ''
	}

	const pattern = buildMatchedTermPattern( matchedTerms )
	const firstMatch = pattern ? pattern.exec( sourceText ) : null
	// Past group 1's consumed word-start character, so the window centres on the
	// matched word rather than on the space in front of it.
	const { excerpt, isCutAtStart, isCutAtEnd } = excerptAroundMatch(
		sourceText,
		firstMatch ? firstMatch.index + ( firstMatch[ 1 ]?.length ?? 0 ) : -1,
		maxLength
	)

	const markup = markMatchedTerms( excerpt, pattern )

	return `${ isCutAtStart ? '...' : '' }${ markup }${ isCutAtEnd ? '...' : '' }`
}

/**
 * Ranks endpoints against a free-text query.
 *
 * @param searcher    - Searcher from {@link buildEndpointSearcher}, or null before it loads.
 * @param query       - Raw user query.
 * @param resultLimit - Maximum results to return.
 * @returns Scored results, highest score first; empty when the query is too short.
 */
export function searchEndpoints(
	searcher: EndpointSearcher | null,
	query: string,
	resultLimit: number = ENDPOINT_SEARCH_RESULT_LIMIT
): EndpointSearchResult[] {
	const trimmedQuery = query.trim()
	if ( !searcher || trimmedQuery.length < ENDPOINT_SEARCH_MIN_QUERY_LENGTH ) {
		return []
	}
	if ( tokenizeEndpointText( trimmedQuery ).length === 0 ) {
		return []
	}

	const scored = searcher.miniSearch.search( trimmedQuery )

	// MiniSearch orders by score, but some upstream modules declare trailing-slash
	// path variants with identical text (`readinglists/v0` has both `/lists` and
	// `/lists/`), which score exactly equal. Break those on module then path so a
	// given query always returns them in the same order.
	scored.sort( ( a, b ) => {
		if ( b.score !== a.score ) {
			return b.score - a.score
		}
		const first = searcher.records[ a.id as number ]
		const second = searcher.records[ b.id as number ]
		return first.module.localeCompare( second.module )
			|| first.path.localeCompare( second.path )
			|| first.method.localeCompare( second.method )
	} )

	return scored.slice( 0, resultLimit ).map( ( result ) => {
		const record = searcher.records[ result.id as number ]
		return {
			record,
			score: result.score,
			snippet: buildEndpointSnippet( record, result.terms )
		}
	} )
}
