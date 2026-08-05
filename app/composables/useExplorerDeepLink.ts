import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import { parseExplorerDeepLink, buildExplorerDirectPath } from '../utils/explorerRoute'
import { operationAnchorFromHash } from '../utils/explorerOperationAnchor'
import { WIKI_INSTANCES } from '../../config/instances'
import { EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR } from '../../config/explorerInternalSidebarExperiment'
import type { ExplorerDeepLinkIntent } from './useExplorerBootstrap'

/** Default community instance loaded when no deep-link (or an unresolved one) applies. */
const DEFAULT_WIKI_INSTANCE_ID = WIKI_INSTANCES[ 0 ]?.id ?? 'enwiki'

/** Instance-level deep-link outcomes this composable can surface (ADR §9). */
export type ExplorerDeepLinkNotice = 'instance-fallback' | 'quick-unresolved' | null

/**
 * Response shape of the quick-resolve route (`/api/explorer-quick-resolve`).
 */
interface QuickResolveResponse {
	moduleName: string
	instanceId: string
}

/**
 * Hydrates explorer state from a community deep-link URL on load (ADR §4, §6).
 *
 * Runs before {@link useExplorerBootstrap} so it can set the target instance and
 * hand over a module/operation intent before the first bootstrap fires:
 * - `direct` (`/explorer/direct/<instance>/<module…>`): sets the instance
 *   synchronously and records the intent.
 * - `quick` (`/explorer/q/<module…>`): defers the first bootstrap (`isBootstrapReady`
 *   stays false) while it resolves the module's representative instance server-side,
 *   then sets the instance and canonicalizes the URL to the `direct` form. An unknown
 *   module drops to the default explorer with a `quick-unresolved` notice.
 *
 * The parsed intent is applied — and its anchor resolved against loaded
 * operations — inside the bootstrap (see {@link useExplorerBootstrap}); this
 * composable only captures it and steers the instance.
 *
 * @param selectedWikiInstanceId - Reactive wiki instance id (mutated to steer bootstrap).
 * @returns Deep-link state: the pending intent for bootstrap, a readiness gate to
 *   compose into the bootstrap's `enabled`, the instance a deep-link requested, and
 *   an instance-level notice ref.
 */
export function useExplorerDeepLink( selectedWikiInstanceId: Ref<string> ) {
	const route = useRoute()
	const router = useRouter()

	const initialDeepLinkIntent = ref<ExplorerDeepLinkIntent | null>( null )
	// Gate for the bootstrap's `enabled`: true immediately for direct/plain loads,
	// false only while a quick link resolves its instance (avoids a throwaway
	// bootstrap of the default instance that would consume the intent early).
	const isBootstrapReady = ref( true )
	// The instance a deep-link asked for, so the fallback watcher (in
	// useExplorerDeepLinkSync) can tell a deep-link load failure from a normal one.
	const deepLinkInstanceId = ref<string | null>( null )
	const deepLinkNotice = ref<ExplorerDeepLinkNotice>( null )

	// Deep-link hydration is a client-only concern (the explorer route is ssr: false).
	if ( import.meta.client ) {
		const parsedDeepLink = parseExplorerDeepLink( route.path )
		// When Scalar's internal sidebar is active it owns operation navigation and
		// the URL hash (in Scalar's own `#{METHOD}{path}` format), so we do not read an
		// operation anchor into the intent or drive focus ourselves — Scalar scrolls to
		// and selects the operation from the hash. In manual-rail mode we own the hash
		// with our slug format. See docs/adr-explorer-deep-linking.md §2.
		const operationAnchor = EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR
			? ''
			: operationAnchorFromHash( route.hash )

		if ( parsedDeepLink.mode === 'community' && parsedDeepLink.moduleName ) {
			initialDeepLinkIntent.value = {
				moduleName: parsedDeepLink.moduleName,
				anchor: operationAnchor
			}
		}

		if ( parsedDeepLink.form === 'direct' && parsedDeepLink.instanceId ) {
			// Set synchronously so the bootstrap's onMounted reads the deep-linked instance.
			// Validity is resolved by the bootstrap route (curated → fleet); a load failure
			// falls back to the default in useExplorerDeepLinkSync.
			selectedWikiInstanceId.value = parsedDeepLink.instanceId
			deepLinkInstanceId.value = parsedDeepLink.instanceId
		} else if ( parsedDeepLink.form === 'quick' && parsedDeepLink.moduleName ) {
			isBootstrapReady.value = false
			scheduleQuickResolve( parsedDeepLink.moduleName )
		}
	}

	/**
	 * Resolves a quick link's instance after hydration and canonicalizes the URL.
	 *
	 * @param moduleName - Module from the `/q/` path.
	 * @returns Nothing.
	 */
	function scheduleQuickResolve( moduleName: string ): void {
		let hasStarted = false

		/**
		 * Runs the resolve exactly once, after client hydration settles.
		 *
		 * An immediate `$fetch` on SPA entry to an `ssr: false` route can hang
		 * (same hazard useExplorerBootstrap guards against), so this waits for
		 * hydration before firing.
		 *
		 * @returns Nothing.
		 */
		function startOnce(): void {
			if ( hasStarted ) {
				return
			}
			hasStarted = true
			void resolveQuickLink( moduleName )
		}

		onMounted( () => {
			const nuxtApp = useNuxtApp()
			if ( !nuxtApp.isHydrating ) {
				startOnce()
				return
			}

			const stopHook = nuxtApp.hook( 'app:suspense:resolve', () => {
				stopHook()
				startOnce()
			} )
			// Fallbacks in case the suspense hook does not fire on this entry path.
			requestAnimationFrame( startOnce )
			setTimeout( startOnce, 500 )
		} )
	}

	/**
	 * Fetches the representative instance for a quick link's module and applies it.
	 *
	 * @param moduleName - Module from the `/q/` path.
	 * @returns Nothing.
	 */
	async function resolveQuickLink( moduleName: string ): Promise<void> {
		try {
			const resolved = await $fetch<QuickResolveResponse>( '/api/explorer-quick-resolve', {
				query: { module: moduleName }
			} )

			selectedWikiInstanceId.value = resolved.instanceId
			deepLinkInstanceId.value = resolved.instanceId

			// Canonicalize /q → /direct so the shared URL is explicit (ADR §6),
			// preserving the operation hash verbatim (Scalar's format or our slug).
			void router.replace( {
				path: buildExplorerDirectPath( resolved.instanceId, resolved.moduleName ),
				hash: route.hash
			} )
		} catch {
			// Unknown module: drop to the default explorer with a notice (ADR §9).
			initialDeepLinkIntent.value = null
			deepLinkNotice.value = 'quick-unresolved'
			selectedWikiInstanceId.value = DEFAULT_WIKI_INSTANCE_ID
			void router.replace( { path: '/explorer', hash: '' } )
		} finally {
			// Release the gate so the (now correctly targeted) first bootstrap runs.
			isBootstrapReady.value = true
		}
	}

	return {
		initialDeepLinkIntent,
		isBootstrapReady,
		deepLinkInstanceId,
		deepLinkNotice
	}
}
