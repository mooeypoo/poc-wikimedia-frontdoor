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

		// Initial router navigation (hard load / first hydrate): `from` has no
		// matched records. Re-assigning the explorer URL here would full-reload
		// in a loop.
		if ( from.matched.length === 0 ) {
			return
		}

		// Already at the target document URL (e.g. soft nav that then forces
		// assign to the same explorer path).
		if ( import.meta.client && window.location.pathname === to.path ) {
			return
		}

		const resolvedTarget = router.resolve( to )
		window.location.assign( resolvedTarget.href )
		return false
	} )
} )
