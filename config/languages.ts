import { GENERATED_LANGUAGES } from './languages.generated'

/**
 * Supported interface/content locales and fallback policy.
 *
 * The full catalog lives in the generated `languages.generated.ts` (produced by
 * `scripts/generate-language-catalog.mjs` from the Wikimedia language APIs).
 * This module layers hand-authored policy on top — see `LANGUAGE_OVERRIDES` —
 * and exposes the merged `SUPPORTED_LANGUAGES` plus lookup helpers.
 *
 * There is deliberately ONE language list: content and interface locales are
 * the same set, with fallback (ultimately to English) filling any gaps. See
 * docs/adr-language-catalog.md.
 */
export interface LanguageConfig {
	code: string
	dir: 'ltr' | 'rtl'
	fallbackChain: string[]
	/** Native language name, e.g. "עברית". Used as the language-picker label. */
	autonym: string
	/** BCP 47 language tag, e.g. "he". Used for i18n locale / `lang` attributes. */
	bcp47: string
	/** English language name, e.g. "Hebrew". Used for reference and search. */
	name: string
}

/**
 * Hand-authored overrides merged on top of the generated catalog, keyed by
 * language code. Use this to pin a custom fallback chain or correct metadata
 * for a specific language. Never edit `languages.generated.ts` directly — it is
 * overwritten on every regeneration.
 */
const LANGUAGE_OVERRIDES: Record<string, Partial<LanguageConfig>> = {}

/**
 * The merged language catalog: generated entries with any hand-authored
 * overrides applied.
 */
export const SUPPORTED_LANGUAGES: LanguageConfig[] = GENERATED_LANGUAGES.map(
	( language ) => {
		const override = LANGUAGE_OVERRIDES[ language.code ]
		return override ? { ...language, ...override } : language
	}
)

const LANGUAGE_BY_CODE = new Map(
	SUPPORTED_LANGUAGES.map( ( language ) => [ language.code, language ] )
)

/**
 * Returns language configuration by locale code.
 *
 * @param localeCode - Locale code to resolve.
 * @returns Language configuration, or undefined when missing.
 */
export function getLanguageByCode( localeCode: string ): LanguageConfig | undefined {
	return LANGUAGE_BY_CODE.get( localeCode )
}
