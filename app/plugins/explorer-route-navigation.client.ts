import { isExplorerRoutePath } from '../utils/explorerRoute'

/**
 * Forces a full document navigation when crossing the explorer route boundary.
 *
 * `/explorer` uses `ssr: false`. Client-side transitions to or from that route can
 * leave Scalar DOM behind or prevent ApiReference from mounting until a reload.
 */
export default defineNuxtPlugin( () => {
	const router = useRouter()

	router.beforeEach( ( to, from ) => {
		const isLeavingExplorer = isExplorerRoutePath( from.path ) && !isExplorerRoutePath( to.path )
		const isEnteringExplorer = !isExplorerRoutePath( from.path ) && isExplorerRoutePath( to.path )

		if ( !isLeavingExplorer && !isEnteringExplorer ) {
			return
		}

		const resolvedTarget = router.resolve( to )
		window.location.assign( resolvedTarget.href )
		return false
	} )
} )
