import { defineEventHandler, getQuery } from 'h3'
import { CONTENT_LOCALES } from '#content-locales'
import { contentCollectionForLocale, SHARED_CONTENT_COLLECTION } from '../../config/contentCollections'
import { resolveContentDocument } from '../utils/contentQuerySafety'

/** The resolved document, or null when nothing matches the path. */
export interface ContentDocumentResponse {
	document: Record<string, unknown> | null
}

/**
 * Resolves a single content document by exact path: a locale's collection
 * when `locale` is given, the shared partials collection otherwise.
 *
 * `Partial.vue` and `Include.vue` used to run this query wherever the
 * component rendered, which on a client-side navigation meant the same
 * SQLite-WASM-and-locale-dump cost `content-page.get.ts` moved off page
 * resolution for. Answering here keeps both off the browser.
 */
export default defineEventHandler( async ( event ): Promise<ContentDocumentResponse> => {
	const query = getQuery( event )
	const path = typeof query.path === 'string' ? query.path : ''
	const localeCode = typeof query.locale === 'string' ? query.locale : ''

	if ( localeCode && !CONTENT_LOCALES.includes( localeCode ) ) {
		return { document: null }
	}

	const collection = localeCode ? contentCollectionForLocale( localeCode ) : SHARED_CONTENT_COLLECTION

	const document = await resolveContentDocument( event, collection, path )

	return { document }
} )
