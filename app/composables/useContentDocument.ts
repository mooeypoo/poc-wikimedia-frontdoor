import type { ContentDocumentResponse } from '../../server/api/content-document.get'

/**
 * Fetches a single content document by exact path from the client.
 *
 * The query this wraps lives in `server/api/content-document.get.ts` now, for
 * the same reason `useLocalizedContentPage` moved its own query server-side:
 * running it in a browser pulls down the SQLite engine and the whole locale
 * dump to read one document.
 *
 * @param path - Exact content path to resolve.
 * @param localeCode - Locale whose collection to query; omit for the shared partials collection.
 * @returns The resolved document, or null when nothing matches.
 */
export async function useContentDocument(
	path: string,
	localeCode?: string
): Promise<Record<string, unknown> | null> {
	const resolved = await $fetch<ContentDocumentResponse>( '/api/content-document', {
		query: {
			path,
			locale: localeCode ?? ''
		}
	} )

	return resolved?.document ?? null
}
