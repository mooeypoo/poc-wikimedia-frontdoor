/**
 * Canonical URL-hash anchor for an explorer operation.
 *
 * The anchor encodes an operation as a readable slug of its HTTP method and
 * OpenAPI path — e.g. `GET /v1/page/{title}` becomes `get_v1_page_title`. It is
 * deliberately lossy: callers do not decode it back into a path but resolve it
 * against a module's live operation list with {@link findOperationByAnchor}. The
 * same builder therefore runs both offline (the endpoint search index, PR 2) and
 * at runtime and still agrees on the anchor for a given operation.
 *
 * Because the explorer owns the URL hash (Scalar's native hash routing is
 * disabled — see docs/adr-explorer-deep-linking.md §2), this format is ours and
 * needs no interoperability with Scalar's internal operation slugs; those are
 * resolved separately at scroll time by `scalarOperationNavigation`.
 */

/** Minimal operation shape the anchor helpers need (method + OpenAPI path). */
export interface AnchorableOperation {
	method: string
	path: string
}

/**
 * Builds the canonical hash anchor (without the leading `#`) for an operation.
 *
 * Non-alphanumeric runs in the path (slashes, braces, dots, hyphens) collapse to
 * a single underscore, so the anchor is safe to place in a URL fragment verbatim
 * (no percent-encoding). The HTTP method distinguishes operations that share a
 * path (`get_...` vs `post_...`).
 *
 * @param method - HTTP method, any case (e.g. `GET`).
 * @param path - OpenAPI path template (e.g. `/v1/page/{title}`).
 * @returns The anchor slug, e.g. `get_v1_page_title` (or just the method for the root path).
 */
export function buildOperationAnchor( method: string, path: string ): string {
	const methodSlug = method.trim().toLowerCase()
	const pathSlug = path
		.replace( /[^a-zA-Z0-9]+/g, '_' )
		.replace( /^_+|_+$/g, '' )
		.toLowerCase()

	return pathSlug ? `${ methodSlug }_${ pathSlug }` : methodSlug
}

/**
 * Reads the operation anchor from a URL hash.
 *
 * @param hash - Route hash, with or without the leading `#` (e.g. `#get_v1_page_title`).
 * @returns The trimmed anchor slug, or an empty string when the hash is absent/empty.
 */
export function operationAnchorFromHash( hash: string ): string {
	return hash.replace( /^#/, '' ).trim()
}

/**
 * Resolves an anchor to a concrete operation within a module's operation list.
 *
 * Matching is by rebuilding each operation's anchor and comparing — so the exact
 * method and path come from the live operation (not the lossy anchor), which is
 * what the Scalar focus engine needs. Returns the first match; distinct
 * operations that slug-collide within one module are astronomically unlikely but
 * would resolve to the first (documented risk, ADR open questions).
 *
 * @param operations - The selected module's operations.
 * @param anchor - Anchor slug (without `#`), typically from {@link operationAnchorFromHash}.
 * @returns The matching operation, or null when the anchor is empty or unmatched.
 */
export function findOperationByAnchor<OperationType extends AnchorableOperation>(
	operations: OperationType[],
	anchor: string
): OperationType | null {
	const normalizedAnchor = anchor.trim().toLowerCase()
	if ( !normalizedAnchor ) {
		return null
	}

	return operations.find(
		( operation ) => buildOperationAnchor( operation.method, operation.path ) === normalizedAnchor
	) ?? null
}
