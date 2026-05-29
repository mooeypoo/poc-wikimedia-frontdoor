import { buildLocaleCandidates, buildLocaleContentPaths } from '../utils/contentLocalePaths'
import { getLanguageByCode } from '../../config/languages'

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
	const localeCandidates = buildLocaleCandidates(
		requestedLocaleCode,
		selectedLanguage?.fallbackChain ?? [ 'en' ]
	)

	for ( const localeCandidate of localeCandidates ) {
		const pathCandidates = buildLocaleContentPaths( localeCandidate, slugPath )

		for ( const pathCandidate of pathCandidates ) {
			const page = await queryCollection( 'content' ).path( pathCandidate ).first()
			if ( page ) {
				return {
					page: page as Record<string, unknown>,
					resolvedLocale: localeCandidate
				}
			}
		}
	}

	return null
}
