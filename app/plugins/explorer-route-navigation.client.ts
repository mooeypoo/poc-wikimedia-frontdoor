import { isExplorerRoutePath } from '../utils/explorerRoute'

/**
 * Forces a full document navigation when crossing the explorer route boundary.
 *
 * `/explorer` uses `ssr: false`. Client-side transitions to or from that route can
 * leave Scalar DOM behind or prevent ApiReference from mounting until a reload.
 * Documented in ARCHITECTURE.md → API explorer → Route boundary navigation.
 */
export default defineNuxtPlugin( () => {
	const router = useRouter()

	router.beforeEach( ( to, from ) => {
		const isLeavingExplorer = isExplorerRoutePath( from.path ) && !isExplorerRoutePath( to.path )
		const isEnteringExplorer = !isExplorerRoutePath( from.path ) && isExplorerRoutePath( to.path )

		if ( !isLeavingExplorer && !isEnteringExplorer ) {
			return
		}

		// The OAuth callback populates the in-memory session store and then
		// redirects to `returnTo`. A hard reload here would wipe that store
		// (ADR §5.4 keeps the access token in memory only), so allow the
		// client-side transition — the callback is itself a fresh app boot,
		// so Scalar still mounts from a clean slate.
		if ( from.path === '/oauth/callback' ) {
			return
		}

		const resolvedTarget = router.resolve( to )
		window.location.assign( resolvedTarget.href )
		return false
	} )
} )
