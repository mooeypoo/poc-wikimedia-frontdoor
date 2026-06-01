/**
 * Returns whether a route path is the API Explorer (locale-independent).
 *
 * @param path - Vue Router path (with or without trailing slash).
 * @returns True when the path is the explorer route.
 */
export function isExplorerRoutePath( path: string ): boolean {
	const normalizedPath = path.replace( /\/+$/, '' ) || '/'
	return normalizedPath === '/explorer' || normalizedPath.endsWith( '/explorer' )
}
