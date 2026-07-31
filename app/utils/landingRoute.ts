import { SUPPORTED_LANGUAGES } from '../../config/languages'

/** Locale codes that may appear as a single path segment for a localized home. */
const LOCALE_HOME_SEGMENTS = new Set(
	SUPPORTED_LANGUAGES.map( ( language ) => language.code )
)

/**
 * Returns whether a route path is the platform home / landing page.
 *
 * Matches `/` (default-locale home) and a single locale segment that exists in
 * {@link SUPPORTED_LANGUAGES} (e.g. `/fr`, `/he`). Does not match content
 * routes like `/get-started`.
 *
 * @param path - Vue Router path (with or without trailing slash).
 * @returns True when the path is the landing page.
 */
export function isLandingRoutePath( path: string ): boolean {
	const normalizedPath = path.replace( /\/+$/, '' ) || '/'
	if ( normalizedPath === '/' ) {
		return true
	}
	const singleSegmentMatch = /^\/([^/]+)$/.exec( normalizedPath )
	if ( !singleSegmentMatch ) {
		return false
	}
	return LOCALE_HOME_SEGMENTS.has( singleSegmentMatch[ 1 ] )
}
