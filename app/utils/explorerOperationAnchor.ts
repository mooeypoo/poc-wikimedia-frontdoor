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
 * Slugs an OpenAPI path, collapsing non-alphanumeric runs and trimming the
 * separators that bracket the result.
 *
 * @param path - OpenAPI path template.
 * @returns The collapsed, trimmed, lowercased path slug (may be empty).
 */
function collapsePathToSlug( path: string ): string {
	return path
		.replace( /[^a-zA-Z0-9]+/g, '_' )
		.replace( /^_+|_+$/g, '' )
		.toLowerCase()
}

/**
 * Builds the canonical hash anchor (without the leading `#`) for an operation.
 *
 * Non-alphanumeric runs in the path (slashes, braces, dots, hyphens) collapse to
 * a single underscore, so the anchor is safe to place in a URL fragment verbatim
 * (no percent-encoding). The HTTP method distinguishes operations that share a
 * path (`get_...` vs `post_...`).
 *
 * **A trailing slash is preserved as a single trailing underscore.** OpenAPI
 * treats `/lists` and `/lists/` as *distinct* paths, and `readinglists/v0` really
 * does expose both — as it does `/lists/{id}/entries` and
 * `/lists/{id}/entries/`. Collapsing them produced four colliding anchors across
 * the committed specs, so a deep link to one silently focused the other. A
 * trailing `}` is *not* preserved, because it closes a parameter inside the final
 * segment rather than adding an empty one; that keeps every non-trailing-slash
 * anchor byte-identical to the format shipped before this distinction existed.
 *
 * This is not injective by construction — `{id}` and a literal `id` segment both
 * collapse to `_id_` — so generators must additionally assert uniqueness with
 * {@link findDuplicateOperationAnchors}.
 *
 * @param method - HTTP method, any case (e.g. `GET`).
 * @param path - OpenAPI path template (e.g. `/v1/page/{title}`).
 * @returns The anchor slug, e.g. `get_v1_page_title` (or just the method for the root path).
 */
export function buildOperationAnchor( method: string, path: string ): string {
	const methodSlug = method.trim().toLowerCase()
	const trimmedPath = path.trim()
	// `/` alone is the root path, not a trailing-slash variant of anything.
	const hasTrailingSlash = trimmedPath.length > 1 && trimmedPath.endsWith( '/' )
	const pathSlug = collapsePathToSlug( trimmedPath )

	if ( !pathSlug ) {
		return methodSlug
	}

	return `${ methodSlug }_${ pathSlug }${ hasTrailingSlash ? '_' : '' }`
}

/**
 * Builds the anchor in the pre-trailing-slash format.
 *
 * Retained solely so {@link findOperationByAnchor} can still resolve links
 * shared before {@link buildOperationAnchor} began preserving trailing slashes.
 * Never emit this format — it is read-only, and for the four paths that motivated
 * the change it is ambiguous by construction.
 *
 * @param method - HTTP method, any case.
 * @param path - OpenAPI path template.
 * @returns The legacy anchor slug.
 */
export function buildLegacyOperationAnchor( method: string, path: string ): string {
	const methodSlug = method.trim().toLowerCase()
	const pathSlug = collapsePathToSlug( path )

	return pathSlug ? `${ methodSlug }_${ pathSlug }` : methodSlug
}

/** One anchor claimed by more than one operation, with the claimants' labels. */
export interface DuplicateOperationAnchor {
	anchor: string
	operations: string[]
}

/**
 * Finds anchors claimed by more than one operation in the same module.
 *
 * {@link buildOperationAnchor} is collision-free across every currently
 * committed spec but is not injective by construction, so anything generating
 * durable URLs must fail rather than silently emit a duplicate. Uniqueness only
 * has to hold within a module, since anchors are page-scoped.
 *
 * @param operations - Operations belonging to a single module.
 * @returns One entry per colliding anchor, sorted by anchor; empty when unique.
 */
export function findDuplicateOperationAnchors(
	operations: AnchorableOperation[]
): DuplicateOperationAnchor[] {
	const claimantsByAnchor = new Map<string, string[]>()

	for ( const operation of operations ) {
		const anchor = buildOperationAnchor( operation.method, operation.path )
		const label = `${ operation.method.trim().toUpperCase() } ${ operation.path }`
		const claimants = claimantsByAnchor.get( anchor )
		if ( claimants ) {
			claimants.push( label )
		} else {
			claimantsByAnchor.set( anchor, [ label ] )
		}
	}

	return [ ...claimantsByAnchor.entries() ]
		.filter( ( [ , claimants ] ) => claimants.length > 1 )
		.map( ( [ anchor, claimants ] ) => ( { anchor, operations: claimants } ) )
		.sort( ( a, b ) => a.anchor.localeCompare( b.anchor ) )
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
 * what the Scalar focus engine needs.
 *
 * Resolution is tried in two passes: the current format first, then the legacy
 * pre-trailing-slash format, so links shared before that change still land. The
 * legacy pass is deliberately second — for the four paths that motivated the
 * change a legacy anchor is genuinely ambiguous, and preferring the current
 * format means an unambiguous link is never resolved by an ambiguous rule.
 * Within a pass the first match wins; use {@link findDuplicateOperationAnchors}
 * at generation time to guarantee that never matters for emitted anchors.
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

	const currentMatch = operations.find(
		( operation ) => buildOperationAnchor( operation.method, operation.path ) === normalizedAnchor
	)
	if ( currentMatch ) {
		return currentMatch
	}

	return operations.find(
		( operation ) =>
			buildLegacyOperationAnchor( operation.method, operation.path ) === normalizedAnchor
	) ?? null
}
