import { buildLocaleCandidates, buildLocaleContentPaths } from '../utils/contentLocalePaths'
import { getLanguageByCode } from '../../config/languages'
import { contentCollectionForLocale } from '../../config/contentCollections'
import { CONTENT_LOCALES } from '#build/content-locales'

interface LocalizedPageResult {
	page: Record<string, unknown>
	resolvedLocale: string
}

/**
 * Resolves a content page from locale-specific markdown paths with fallback.
 *
 * @param requestedLocaleCode - Locale selected by the user.
 * @param slugPath - Route slug path without leading slash.
 * @returns Resolved page document and locale that provided it.
 */
export async function useLocalizedContentPage(
	requestedLocaleCode: string,
	slugPath: string
): Promise<LocalizedPageResult | null> {
	const selectedLanguage = getLanguageByCode( requestedLocaleCode )
	// A catalog locale with no content/<locale> directory (most of
	// SUPPORTED_LANGUAGES) has no collection to query — querying one throws
	// rather than returning no match, so it is dropped here instead of left to
	// fail. English always has a directory, so this never empties the list.
	const localeCandidates = buildLocaleCandidates(
		requestedLocaleCode,
		selectedLanguage?.fallbackChain ?? [ 'en' ]
	).filter( ( localeCode ) => CONTENT_LOCALES.includes( localeCode ) )

	for ( const localeCandidate of localeCandidates ) {
		const pathCandidates = buildLocaleContentPaths( localeCandidate, slugPath )

		for ( const pathCandidate of pathCandidates ) {
			const page = await queryCollection( contentCollectionForLocale( localeCandidate ) ).path( pathCandidate ).first()
			if ( page ) {
				return {
					page: page as unknown as Record<string, unknown>,
					resolvedLocale: localeCandidate
				}
			}
		}
	}

	return null
}
