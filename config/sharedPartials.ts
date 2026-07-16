/**
 * Allowlist registry of shared content partials that can be inserted via the
 * `::partial{name}` MDC component — including from imported wiki pages, where a
 * placeholder is converted to `::partial{name}` at fetch time (ADR §11).
 *
 * This list is a **security boundary**: because a partial name can originate
 * from wiki text, only names registered here resolve to content. There is no
 * path derivation from the name, so a wiki reference cannot select an arbitrary
 * content path or traverse the tree.
 *
 * Authored partial files live at `content/_partials/shared/<name>.md`
 * (committed, hand-maintained, never fetched or wiped). They are ordinary
 * content and may use MDC components, Vue, and banana-i18n.
 *
 * How to add/change a shared partial: docs/content-import-guide.md (Part 2).
 */
export interface SharedPartial {
	/** Stable name referenced by `::partial{name}` and the wiki placeholder. */
	name: string
	/** Nuxt Content path of the authored partial. */
	path: string
}

export const SHARED_PARTIALS: readonly SharedPartial[] = [
	{ name: 'portal-note', path: '/_partials/shared/portal-note' }
]

const SHARED_PARTIAL_BY_NAME = new Map(
	SHARED_PARTIALS.map( ( partial ) => [ partial.name, partial ] )
)

/**
 * Resolves a registered partial name to its content path.
 *
 * @param name - Partial name.
 * @returns The content path, or null when the name is not registered.
 */
export function resolveSharedPartialPath( name: string ): string | null {
	return SHARED_PARTIAL_BY_NAME.get( name )?.path ?? null
}

/**
 * Whether a partial name is registered (allowlisted).
 *
 * @param name - Partial name.
 * @returns True when registered.
 */
export function isRegisteredSharedPartial( name: string ): boolean {
	return SHARED_PARTIAL_BY_NAME.has( name )
}
