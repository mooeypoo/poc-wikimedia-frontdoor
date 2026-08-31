/**
 * Policy for translating Scalar's own interface strings through banana-i18n.
 *
 * Hand-authored decisions only. The banana-key ↔ Scalar-path map itself is
 * generated from Scalar's built-in English table — see
 * `config/generated/scalarLocalization.generated.ts` and
 * `npm run generate-scalar-localization`.
 *
 * See docs/adr-scalar-interface-localization.md.
 */

/**
 * Prefix applied to every banana key derived from a Scalar translation path.
 *
 * Scalar's own names are terse and namespaced only by their dot-path
 * (`operation.testRequest`, `common.required`). Flattening those into the
 * banana namespace without a prefix would produce keys that collide with, or
 * are indistinguishable from, our own interface messages.
 */
export const SCALAR_LOCALIZATION_KEY_PREFIX = 'explorer-scalar-ui-'

/**
 * Text direction for the Scalar embed. Pinned, never inferred.
 *
 * Scalar sets `dir` on its own root element from `localization.direction`, and
 * its default (`auto`) derives right-to-left from the locale — so a Hebrew or
 * Persian interface locale would flip the whole embed. Scalar's stylesheet has
 * no `[dir=rtl]` rules and is overwhelmingly physical rather than logical, so
 * that flip mirrors text while leaving layout unmirrored: a half-broken page.
 *
 * `auto` is also inference, which AGENTS.md rule 7 forbids outright.
 *
 * Right-to-left labels rendered inside this left-to-right container are
 * isolated at injection time instead — see `app/composables/useScalarLocalization.ts`.
 */
export const SCALAR_LOCALIZATION_DIRECTION = 'ltr' as const

/**
 * Scalar translation groups deliberately excluded from the message catalogue.
 *
 * These are strings for features the explorer does not surface. Mapping them
 * anyway would cost translators roughly 40% more keys for copy no visitor can
 * reach, and some of it is Scalar's own product marketing, which has no
 * sensible translation in Wikimedia's voice.
 *
 * Excluded groups are still *mapped* (the generated map covers every upstream
 * path) so that upgrade drift detection stays complete. They are only kept out
 * of the translator-facing catalogues.
 */
export const SCALAR_LOCALIZATION_EXCLUDED_GROUPS: Readonly<Record<string, string>> = {
	developerTools: 'Not rendered — `showDeveloperTools: \'never\'` in config/scalar.ts.',
	agent: 'Not rendered — `agent: { disabled: true }` in config/scalar.ts.',
	mcp: 'Not rendered — `mcp: { disabled: true }` in config/scalar.ts.',
	asyncapi: 'The explorer only ever loads OpenAPI documents, never AsyncAPI.',
	gettingStarted: 'Scalar\'s own empty-state marketing copy ("Deploy on Scalar", "Swagger Editor"). The explorer always supplies a document URL and shows its own loading state, and this copy is Scalar product voice we would not translate into Wikimedia voice even if it were reachable.'
}

/**
 * Individual Scalar translation paths held at Scalar's English default in every
 * locale.
 *
 * Group exclusions above are about reachability — strings no visitor sees.
 * These are the opposite case: strings the explorer *does* render, which are
 * not purely display text, so translating them changes behaviour rather than
 * wording.
 *
 * Pinning is deliberately stronger than omission. Omitting a path lets Scalar's
 * own built-in translation for the locale supply it — which for Spanish and
 * French it does — so the behaviour we were trying to avoid happens anyway,
 * just via a different layer. Only writing the English value explicitly stops
 * it. This was caught by running the pipeline through Scalar's real resolver;
 * do not "simplify" it back into an exclusion.
 */
export const SCALAR_LOCALIZATION_PINNED_PATHS: Readonly<Record<string, string>> = {
	'models.label': 'Not display-only. Scalar feeds this through `slugify()` to build the canonical URL for the Models section, so a translated value makes that URL locale-dependent — a routing change disguised as a translation. Navigation entry ids are unaffected either way (Scalar localizes entry `title`/`name` but never `id`, and app/utils/scalarOperationNavigation.ts matches on `id`), so deep links keep working; this is specifically about the canonical URL rewrite.'
}

/**
 * Returns whether a Scalar translation path is offered to translators.
 *
 * @param scalarPath - Dot-path into Scalar's translation table (e.g. `operation.testRequest`).
 * @returns `true` when the path is reachable and safe to translate.
 */
export function isTranslatableScalarPath( scalarPath: string ): boolean {
	if ( Object.hasOwn( SCALAR_LOCALIZATION_PINNED_PATHS, scalarPath ) ) {
		return false
	}

	const group = scalarPath.split( '.' )[ 0 ] ?? ''
	return !Object.hasOwn( SCALAR_LOCALIZATION_EXCLUDED_GROUPS, group )
}

/**
 * Returns whether a Scalar translation path must be forced to English.
 *
 * @param scalarPath - Dot-path into Scalar's translation table.
 * @returns `true` when the path is pinned.
 */
export function isPinnedScalarPath( scalarPath: string ): boolean {
	return Object.hasOwn( SCALAR_LOCALIZATION_PINNED_PATHS, scalarPath )
}
