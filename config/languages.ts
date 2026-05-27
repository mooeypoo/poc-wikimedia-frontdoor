/**
 * Supported interface/content locales and fallback policy.
 */
export interface LanguageConfig {
	code: string
	dir: 'ltr' | 'rtl'
	fallbackChain: string[]
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
	{ code: 'en', dir: 'ltr', fallbackChain: [ 'en' ] },
	{ code: 'es', dir: 'ltr', fallbackChain: [ 'es', 'en' ] },
	{ code: 'fr', dir: 'ltr', fallbackChain: [ 'fr', 'en' ] },
	{ code: 'he', dir: 'rtl', fallbackChain: [ 'he', 'en' ] },
	{ code: 'fa', dir: 'rtl', fallbackChain: [ 'fa', 'en' ] }
]

/**
 * Returns language configuration by locale code.
 *
 * @param localeCode - Locale code to resolve.
 * @returns Language configuration, or undefined when missing.
 */
export function getLanguageByCode( localeCode: string ): LanguageConfig | undefined {
	return SUPPORTED_LANGUAGES.find( ( language ) => language.code === localeCode )
}
