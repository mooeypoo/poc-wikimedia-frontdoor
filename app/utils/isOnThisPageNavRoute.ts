import { isExplorerRoutePath } from './explorerRoute'
import { isLandingRoutePath } from './landingRoute'

/**
 * Returns whether the current path may show on-this-page navigation.
 *
 * Excludes platform landing, API explorer, account, and OAuth callback /
 * login handoff routes. Remaining content pages are eligible when they also
 * meet the `h2` count threshold (see {@link useOnThisPageNav}).
 *
 * @param routePath - Full path from the Vue router (may include locale prefix).
 * @returns True when the route is a documentation content surface.
 */
export function isOnThisPageNavRoute( routePath: string ): boolean {
	if ( isLandingRoutePath( routePath ) ) {
		return false
	}

	if ( isExplorerRoutePath( routePath ) ) {
		return false
	}

	const pathWithoutQuery = routePath.split( '?' )[ 0 ] ?? routePath
	const normalizedPath = pathWithoutQuery.replace( /\/+$/, '' ) || '/'

	// Locale-aware account: `/account`, `/fr/account`, …
	if (
		normalizedPath === '/account' ||
		/^\/[a-z]{2,3}(-[a-z0-9]+)?\/account$/i.test( normalizedPath )
	) {
		return false
	}

	// OAuth callback / handoff (not a documentation surface).
	if (
		normalizedPath === '/oauth/callback' ||
		/^\/[a-z]{2,3}(-[a-z0-9]+)?\/oauth\/callback$/i.test( normalizedPath )
	) {
		return false
	}

	return true
}
