import Banana from 'banana-i18n'
import type { Ref } from 'vue'
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
 * Registers banana-i18n as the interface message provider.
 */
export default defineNuxtPlugin( ( nuxtApp ) => {
	const interfaceLocale = useState<string>( 'interfaceLocale', () => 'en' )

	/**
	 * Returns a translated message key for the active interface locale.
	 *
	 * @param messageKey - Message key to resolve.
	 * @param parameters - Optional replacement parameters.
	 * @returns Translated message string, or key fallback.
	 */
	function i18n( messageKey: string, parameters: Record<string, string> = {} ): string {
		const localeMessages = MESSAGES_BY_LOCALE[ interfaceLocale.value ] ?? MESSAGES_BY_LOCALE.en
		const banana = new Banana( interfaceLocale.value, {
			messages: localeMessages
		} )
		const translatedMessage = banana.i18n( messageKey, parameters )
		return translatedMessage || MESSAGES_BY_LOCALE.en[ messageKey ] || messageKey
	}

	/**
	 * Updates the active interface locale.
	 *
	 * @param nextLocale - New locale code.
	 * @returns Nothing.
	 */
	function setInterfaceLocale( nextLocale: string ): void {
		interfaceLocale.value = MESSAGES_BY_LOCALE[ nextLocale ] ? nextLocale : 'en'
	}

	// Use bananaI18n only — @nuxtjs/i18n already registers $i18n for content locale routing.
	nuxtApp.provide( 'bananaI18n', i18n )
	nuxtApp.provide( 'setInterfaceLocale', setInterfaceLocale )
	nuxtApp.provide( 'interfaceLocale', interfaceLocale )
} )

declare module '#app' {
	interface NuxtApp {
		$bananaI18n: ( messageKey: string, parameters?: Record<string, string> ) => string
		$setInterfaceLocale: ( nextLocale: string ) => void
		$interfaceLocale: Ref<string>
	}
}

declare module 'vue' {
	interface ComponentCustomProperties {
		$bananaI18n: ( messageKey: string, parameters?: Record<string, string> ) => string
	}
}
