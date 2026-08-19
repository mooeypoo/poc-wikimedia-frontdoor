/**
 * Content-locale fallback chains for the prose content generator.
 *
 * `@wikimedia/banana-content` never enumerates languages: which locales it
 * generates is the set of `i18n/content/<locale>.json` files on disk. The one
 * thing it does ask is what chain to walk when a key is missing from a locale
 * it found, and this answers that from the portal's own language catalog — so
 * a Catalan reader gets Spanish before English, per docs/adr-language-catalog.md.
 *
 * Reads `config/languages.ts`, the accessor, and never `languages.generated.ts`
 * directly: the generated catalog is only half the policy, and a hand-authored
 * entry in LANGUAGE_OVERRIDES must apply to generated content exactly as it
 * applies to the interface. That is also why `languages.ts` imports its
 * generated half with an explicit `.ts` extension — see nuxt.config.ts.
 */

import { getLanguageByCode } from './languages.ts'

/**
 * Returns the fallback chain for a content locale.
 *
 * @param {string} locale - Locale code found in the message directory.
 * @returns {string[]} Ordered chain, most specific first, terminating in English.
 */
export default function contentLocaleFallback( locale ) {
	return getLanguageByCode( locale )?.fallbackChain ?? [ locale, 'en' ]
}
