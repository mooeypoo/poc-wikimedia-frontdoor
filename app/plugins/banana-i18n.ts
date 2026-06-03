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

// One Banana instance per locale, created on first use and reused thereafter.
// Constructing Banana on every i18n() call was unnecessarily expensive.
const bananaCache: Record<string, Banana> = {}

function getBanana( localeCode: string ): Banana {
	if ( !bananaCache[ localeCode ] ) {
		bananaCache[ localeCode ] = new Banana( localeCode, {
			messages: MESSAGES_BY_LOCALE[ localeCode ] ?? MESSAGES_BY_LOCALE.en
		} )
	}
	return bananaCache[ localeCode ]
}

/**
 * Registers banana-i18n as the interface message provider.
 */
export default defineNuxtPlugin( ( nuxtApp ) => {
	const interfaceLocale = useState<string>( 'interfaceLocale', () => 'en' )

	/**
	 * Returns a translated message for the active interface locale.
	 *
	 * Parameters must be passed as a positional object: { $1: 'first', $2: 'second' }.
	 * They are converted to a positional array before being forwarded to banana.i18n(),
	 * which expects positional arguments — passing the raw object produces "[object Object]"
	 * in rendered strings (ADR §7).
	 *
	 * @param messageKey  - Message key to resolve.
	 * @param parameters  - Optional named positional params ($1, $2, …).
	 * @returns Translated message string, falling back to English then the key itself.
	 */
	function i18n( messageKey: string, parameters: Record<string, string> = {} ): string {
		const banana = getBanana( interfaceLocale.value )

		// Extract $1, $2, … in order into a positional array.
		// banana.i18n() treats the second argument as positional replacements.
		const args: string[] = []
		for ( let i = 1; parameters[ `$${ i }` ] !== undefined; i++ ) {
			args.push( parameters[ `$${ i }` ] )
		}

		const translatedMessage = banana.i18n( messageKey, ...args )
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
