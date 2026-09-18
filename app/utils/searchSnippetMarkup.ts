/**
 * Escaping for the two snippet strings the search panel renders as HTML.
 *
 * Both reach `v-html` in `SearchResults.vue`, and both carry text this project
 * does not author: page content imported from wiki sources, and operation
 * descriptions from upstream OpenAPI specs. Neither arrives escaped, so it
 * happens here.
 */

/**
 * Escapes the five characters that matter in HTML text and attribute content.
 *
 * @param value - Raw text.
 * @returns The same text, safe to place in markup.
 */
export function escapeHtml( value: string ): string {
	return value.replace( /[&<>"']/gu, ( character ) => {
		switch ( character ) {
			case '&': return '&amp;'
			case '<': return '&lt;'
			case '>': return '&gt;'
			case '"': return '&quot;'
			default: return '&#39;'
		}
	} )
}

/**
 * Escapes a Nuxt Content FTS snippet while keeping its highlight tags.
 *
 * `queryFTS` builds these with SQLite's own `snippet()`, which wraps the
 * matched terms in `<mark>` and escapes nothing else, so whatever `<` a page's
 * text contains arrives as markup. The content column is the page's raw text
 * (`extractTextFromAst` keeps inline-code and fenced-code text verbatim), and
 * pages fetched from wiki sources are edited by people outside this project,
 * so that text has to be treated as hostile.
 *
 * Escaping everything and then restoring the two highlight tags is the order
 * that needs no offset bookkeeping. A page containing the literal text
 * `<mark>` therefore renders as a highlight, which is a tag with no attributes
 * and no script: cosmetic, and the trade for not parsing hostile markup to
 * find out.
 *
 * @param snippetHtml - Snippet string from `queryFTS`, or undefined.
 * @returns Escaped markup carrying only `<mark>` tags, or undefined when given none.
 */
export function escapeFtsSnippetMarkup( snippetHtml: string | undefined ): string | undefined {
	if ( snippetHtml === undefined ) {
		return undefined
	}

	return escapeHtml( snippetHtml )
		.replaceAll( '&lt;mark&gt;', '<mark>' )
		.replaceAll( '&lt;/mark&gt;', '</mark>' )
}
