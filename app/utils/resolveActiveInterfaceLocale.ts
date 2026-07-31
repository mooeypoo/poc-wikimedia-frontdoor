/**
 * Supported banana-i18n interface locale codes (short form).
 */
const SUPPORTED_INTERFACE_LOCALES = new Set( [ 'en', 'es', 'fr', 'he', 'fa' ] )

/**
 * Resolves a short interface locale code for banana-i18n helpers.
 *
 * Empty/`lang=""` must not win over the English fallback: banana-i18n treats a
 * falsy locale as “multi-locale message map” and throws
 * `Invalid message source. Must be an object` when given a flat string map.
 * The explorer route (`i18n: false`) can leave `<html lang>` empty, so nullish
 * coalescing (`??`) alone is not enough.
 *
 * @param localeCode - Optional BCP 47 or short locale override.
 * @returns Short locale code with a message file, or `en`.
 */
export function resolveActiveInterfaceLocale( localeCode?: string ): string {
	const documentLocale = typeof document !== 'undefined'
		? document.documentElement.lang?.split( '-' )[ 0 ]?.trim()
		: undefined
	// Prefer `||` so empty strings from `<html lang="">` fall through.
	const candidateLocale = ( localeCode || documentLocale || 'en' ).trim() || 'en'

	return SUPPORTED_INTERFACE_LOCALES.has( candidateLocale ) ? candidateLocale : 'en'
}
