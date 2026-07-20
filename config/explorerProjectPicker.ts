/**
 * Explorer project + language picker — maps UI selections to wiki instance ids.
 *
 * Wikipedia is parameterized by language; Wikimedia Commons and Wikidata are
 * language-independent (language combobox disabled in the shell).
 */

/** High-level project choices in the explorer project controls. */
export const EXPLORER_PICKER_PROJECT_IDS = [ 'wikipedia', 'commons', 'wikidata' ] as const

export type ExplorerPickerProjectId = typeof EXPLORER_PICKER_PROJECT_IDS[ number ]

/** Wikipedia language choices exposed in the explorer language combobox. */
export const EXPLORER_PICKER_LANGUAGE_CODES = [ 'en', 'es', 'he', 'fa' ] as const

export type ExplorerPickerLanguageCode = typeof EXPLORER_PICKER_LANGUAGE_CODES[ number ]

/** Default project when the explorer loads. */
export const DEFAULT_EXPLORER_PICKER_PROJECT: ExplorerPickerProjectId = 'wikipedia'

/** Default Wikipedia language when the explorer loads. */
export const DEFAULT_EXPLORER_PICKER_LANGUAGE: ExplorerPickerLanguageCode = 'en'

/** banana-i18n key suffix for each project id (`explorer-project-{id}`). */
export const EXPLORER_PICKER_PROJECT_MESSAGE_KEYS: Record<ExplorerPickerProjectId, string> = {
	wikipedia: 'explorer-project-wikipedia',
	commons: 'explorer-project-commons',
	wikidata: 'explorer-project-wikidata'
}

/** banana-i18n key suffix for each language code (`explorer-project-language-{code}`). */
export const EXPLORER_PICKER_LANGUAGE_MESSAGE_KEYS: Record<ExplorerPickerLanguageCode, string> = {
	en: 'explorer-project-language-en',
	es: 'explorer-project-language-es',
	he: 'explorer-project-language-he',
	fa: 'explorer-project-language-fa'
}

const WIKIPEDIA_INSTANCE_ID_BY_LANGUAGE: Record<ExplorerPickerLanguageCode, string> = {
	en: 'enwiki',
	es: 'eswiki',
	he: 'hewiki',
	fa: 'fawiki'
}

/**
 * Returns whether the language combobox applies to the selected project.
 *
 * @param projectId - Selected explorer project id.
 * @returns True for Wikipedia; false for Commons and Wikidata.
 */
export function isExplorerProjectLanguageApplicable( projectId: ExplorerPickerProjectId ): boolean {
	return projectId === 'wikipedia'
}

/**
 * Resolves a wiki instance id from project + language picker state.
 *
 * @param projectId - Selected explorer project id.
 * @param languageCode - Selected Wikipedia language code (ignored for Commons / Wikidata).
 * @returns Wiki instance id consumed by bootstrap and discovery.
 */
export function resolveExplorerWikiInstanceId(
	projectId: ExplorerPickerProjectId,
	languageCode: ExplorerPickerLanguageCode
): string {
	if ( projectId === 'commons' ) {
		return 'commonswiki'
	}

	if ( projectId === 'wikidata' ) {
		return 'wikidata'
	}

	return WIKIPEDIA_INSTANCE_ID_BY_LANGUAGE[ languageCode ]
}

/**
 * Parses a wiki instance id into project + language picker state.
 *
 * Unknown ids fall back to Wikipedia + English.
 *
 * @param wikiInstanceId - Active wiki instance id from shell state.
 * @returns Matching project and language picker values.
 */
export function parseExplorerWikiInstanceSelection( wikiInstanceId: string ): {
	projectId: ExplorerPickerProjectId
	languageCode: ExplorerPickerLanguageCode
} {
	switch ( wikiInstanceId ) {
		case 'commonswiki':
			return { projectId: 'commons', languageCode: DEFAULT_EXPLORER_PICKER_LANGUAGE }
		case 'wikidata':
			return { projectId: 'wikidata', languageCode: DEFAULT_EXPLORER_PICKER_LANGUAGE }
		case 'eswiki':
			return { projectId: 'wikipedia', languageCode: 'es' }
		case 'hewiki':
			return { projectId: 'wikipedia', languageCode: 'he' }
		case 'fawiki':
			return { projectId: 'wikipedia', languageCode: 'fa' }
		case 'enwiki':
			return { projectId: 'wikipedia', languageCode: 'en' }
		default:
			return {
				projectId: DEFAULT_EXPLORER_PICKER_PROJECT,
				languageCode: DEFAULT_EXPLORER_PICKER_LANGUAGE
			}
	}
}
