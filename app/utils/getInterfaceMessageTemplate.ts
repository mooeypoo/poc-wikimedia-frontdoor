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
 * Returns the raw interface message template for the active locale (before $1 substitution).
 *
 * @param messageKey - banana-i18n message key.
 * @param localeCode - BCP 47 or short locale override; defaults from `document.documentElement.lang`.
 * @returns Message template string.
 */
export function getInterfaceMessageTemplate(
	messageKey: string,
	localeCode?: string
): string {
	const documentLocale = typeof document !== 'undefined'
		? document.documentElement.lang?.split( '-' )[ 0 ]
		: undefined
	const activeLocale = localeCode ?? documentLocale ?? 'en'
	const localeMessages = MESSAGES_BY_LOCALE[ activeLocale ] ?? MESSAGES_BY_LOCALE.en

	return localeMessages[ messageKey ] ?? MESSAGES_BY_LOCALE.en[ messageKey ] ?? messageKey
}

/**
 * Splits a message template at the first `$1` placeholder for BiDi-safe rendering.
 *
 * @param messageTemplate - Raw message containing `$1`.
 * @returns Text before the placeholder and text after it.
 */
export function splitMessageAtFirstPositionalParameter( messageTemplate: string ): {
	beforeParameter: string
	afterParameter: string
} {
	const parameterIndex = messageTemplate.indexOf( '$1' )

	if ( parameterIndex === -1 ) {
		return {
			beforeParameter: messageTemplate,
			afterParameter: ''
		}
	}

	return {
		beforeParameter: messageTemplate.slice( 0, parameterIndex ),
		afterParameter: messageTemplate.slice( parameterIndex + 2 )
	}
}

/**
 * Splits a message template at `$1` and `$2` for BiDi-safe rendering of two external values.
 *
 * @param messageTemplate - Raw message containing `$1` and `$2`.
 * @returns Text before `$1`, between `$1` and `$2`, and after `$2`.
 */
export function splitMessageAtTwoPositionalParameters( messageTemplate: string ): {
	beforeFirstParameter: string
	betweenParameters: string
	afterSecondParameter: string
} {
	const firstParameterIndex = messageTemplate.indexOf( '$1' )
	const secondParameterIndex = messageTemplate.indexOf( '$2' )

	if ( firstParameterIndex === -1 || secondParameterIndex === -1 ) {
		return {
			beforeFirstParameter: messageTemplate,
			betweenParameters: '',
			afterSecondParameter: ''
		}
	}

	return {
		beforeFirstParameter: messageTemplate.slice( 0, firstParameterIndex ),
		betweenParameters: messageTemplate.slice( firstParameterIndex + 2, secondParameterIndex ),
		afterSecondParameter: messageTemplate.slice( secondParameterIndex + 2 )
	}
}
