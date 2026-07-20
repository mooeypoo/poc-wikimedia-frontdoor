import Banana from 'banana-i18n'
import messagesEnglish from '../../i18n/en.json'
import messagesSpanish from '../../i18n/es.json'
import messagesFrench from '../../i18n/fr.json'
import messagesHebrew from '../../i18n/he.json'
import messagesPersian from '../../i18n/fa.json'

type MessageMap = Record<string, string>

const MESSAGES_BY_LOCALE: Record<string, MessageMap> = {
	en: messagesEnglish as MessageMap,
	es: messagesSpanish as MessageMap,
	fr: messagesFrench as MessageMap,
	he: messagesHebrew as MessageMap,
	fa: messagesPersian as MessageMap
}

/**
 * Resolves an interface message outside the Nuxt component tree (e.g. Scalar's modal app).
 *
 * Uses the same message files as the banana-i18n plugin. Locale is read from `<html lang>`
 * when running in the browser.
 *
 * @param messageKey - banana-i18n message key.
 * @param replacements - Positional parameters (`$1`, `$2`, …) for the message.
 * @param localeCode - BCP 47 or short locale override; defaults from `document.documentElement.lang`.
 * @returns Translated string, with English fallback.
 */
export function resolveInterfaceMessage(
	messageKey: string,
	replacements: string[] = [],
	localeCode?: string
): string {
	const documentLocale = typeof document !== 'undefined'
		? document.documentElement.lang?.split( '-' )[ 0 ]
		: undefined
	const activeLocale = localeCode ?? documentLocale ?? 'en'
	const localeMessages = MESSAGES_BY_LOCALE[ activeLocale ] ?? MESSAGES_BY_LOCALE.en
	const banana = new Banana( activeLocale, {
		messages: localeMessages
	} )
	const translatedMessage = banana.i18n( messageKey, replacements )
	return translatedMessage || MESSAGES_BY_LOCALE.en[ messageKey ] || messageKey
}
