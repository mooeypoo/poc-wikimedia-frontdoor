import type { LocalizedContentPageResponse } from '../../server/api/content-page.get'

/**
 * Resolves a content page from locale-specific markdown paths with fallback.
 *
 * The walk it used to run here lives in `server/api/content-page.get.ts` now,
 * because `queryCollection` in a browser pulls down the SQLite engine and the
 * whole locale dump to read one page. One request covers the entire fallback
 * chain, so a Catalan reader pays the same round trip an English one does.
 *
 * @param requestedLocaleCode - Locale selected by the user.
 * @param slugPath - Route slug path without leading slash.
 * @returns The resolved page document, or null when no locale in the chain has one.
 */
export async function useLocalizedContentPage(
	requestedLocaleCode: string,
	slugPath: string
): Promise<Record<string, unknown> | null> {
	const resolved = await $fetch<LocalizedContentPageResponse>( '/api/content-page', {
		query: {
			locale: requestedLocaleCode,
			slug: slugPath
		}
	} )

	return resolved?.page ?? null
}
