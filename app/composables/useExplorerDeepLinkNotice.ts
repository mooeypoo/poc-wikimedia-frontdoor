/**
 * The deep-link outcomes surfaced to the user as a `CdxMessage` (ADR §9). Every
 * one corresponds to a case where the explorer adjusted the URL on the user's
 * behalf — a fallback, or the quick→direct expansion.
 */
export type ExplorerDeepLinkNotice =
	| 'instance-fallback'
	| 'module-fallback'
	| 'operation-missing'
	| 'quick-canonicalized'
	| 'quick-unresolved'
	| null

/**
 * App-scoped deep-link notice, shared across the deep-link composables and the
 * page via Nuxt `useState`.
 *
 * It is **not** a component-local ref on purpose: adjusting the URL in-explorer
 * (fallbacks, quick→direct) can remount the explorer page, which would tear down
 * a component-local ref before the notice is ever rendered. `useState` is scoped
 * to the Nuxt app instance, so the value set just before the URL change survives
 * the remount and is read by the fresh page instance. It resets naturally on a
 * full document load (a new Nuxt app), and on leaving the explorer (the route-
 * boundary plugin forces a full navigation), so notices do not leak across visits.
 *
 * @returns The reactive notice ref (null when there is nothing to show).
 */
export function useExplorerDeepLinkNotice() {
	return useState<ExplorerDeepLinkNotice>( 'explorer-deep-link-notice', () => null )
}
