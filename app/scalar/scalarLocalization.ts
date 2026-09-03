import Banana from 'banana-i18n'
import { GENERATED_SCALAR_LOCALIZATION_MAP } from '../../config/generated/scalarLocalization.generated'
import { SCALAR_LOCALIZATION_DIRECTION } from '../../config/scalarLocalization'
import messagesArabic from '../../i18n/explorer-scalar/ar.json'
import messagesChineseSimplified from '../../i18n/explorer-scalar/zh-cn.json'
import messagesEnglish from '../../i18n/explorer-scalar/en.json'
import messagesFrench from '../../i18n/explorer-scalar/fr.json'
import messagesGerman from '../../i18n/explorer-scalar/de.json'
import messagesPortuguese from '../../i18n/explorer-scalar/pt.json'
import messagesRussian from '../../i18n/explorer-scalar/ru.json'
import messagesSpanish from '../../i18n/explorer-scalar/es.json'

/**
 * Builds Scalar's `localization` configuration from banana messages.
 *
 * Lives under `app/scalar/` rather than `app/composables/` on purpose: this
 * module statically imports the whole `i18n/explorer-scalar/` namespace, and
 * that weight belongs in the explorer's route chunk, not in the shell bundle
 * every page pays for. It is reached only through `useScalarConfig`, which is
 * itself only used by the client-only explorer page.
 *
 * See docs/adr-scalar-interface-localization.md §5.
 */

type MessageMap = Record<string, string>

/**
 * Drops the `@metadata` block from a catalogue.
 *
 * Unlike `i18n/*.json`, these catalogues carry `@metadata` — the generated
 * marker on `en.json`, the seeded-from-upstream provenance on `es.json` and
 * `fr.json`. banana would tolerate it (a non-string message is never returned),
 * but handing it a block that is not a message is untidy and it breaks the
 * `Record<string, string>` type outright.
 *
 * @param catalogue - Parsed catalogue JSON.
 * @returns The catalogue without its metadata block.
 */
function stripMetadata( catalogue: Record<string, unknown> ): MessageMap {
	const { '@metadata': _metadata, ...messages } = catalogue
	return messages as MessageMap
}

/**
 * Catalogues for locales that have one.
 *
 * This covers every locale Scalar itself translates, not just the portal's
 * interface locales, and that is the point: a string Scalar could supply
 * directly is a string that did not come from banana and therefore never got
 * BiDi isolation or our terminology. Owning them means the only thing Scalar's
 * own translation layer is ever left to serve is a locale nobody has
 * translated at all — where it falls through to English, which is our English.
 *
 * Adding a locale is adding a file plus one line here. The catalogue set is
 * deliberately not derived from `config/languages.ts`: the catalog governs
 * which languages exist, not which have been translated.
 *
 * `he` and `fa` are the notable absences — Scalar ships no built-in to seed
 * them from, so they need hand-authored catalogues, and they are the portal's
 * two right-to-left interface locales.
 */
const MESSAGES_BY_LOCALE: Record<string, MessageMap> = {
	ar: stripMetadata( messagesArabic ),
	de: stripMetadata( messagesGerman ),
	en: stripMetadata( messagesEnglish ),
	es: stripMetadata( messagesSpanish ),
	fr: stripMetadata( messagesFrench ),
	pt: stripMetadata( messagesPortuguese ),
	ru: stripMetadata( messagesRussian ),
	'zh-cn': stripMetadata( messagesChineseSimplified )
}

/** Unicode FIRST STRONG ISOLATE — opens a directionally isolated run. */
const FIRST_STRONG_ISOLATE = '⁨'

/** Unicode POP DIRECTIONAL ISOLATE — closes the run opened by FSI. */
const POP_DIRECTIONAL_ISOLATE = '⁩'

// One Banana per locale, created on first use. Mirrors the caching in
// app/plugins/banana-i18n.ts, which this module cannot reuse: that plugin
// deliberately does not load this namespace, and must not start.
const bananaCache: Record<string, Banana> = {}

/**
 * Returns a Banana instance loaded with one locale's catalogue and no other.
 *
 * Loading English as a fallback here would be actively wrong. A key missing
 * from the target catalogue must resolve to nothing so it can be omitted from
 * the payload entirely — Scalar then falls back through its own built-in
 * translation for that locale before reaching English. Supplying our English
 * instead would override a real upstream translation with an English string.
 *
 * @param localeCode - Short interface locale code.
 * @returns Banana instance, or null when the locale has no catalogue.
 */
function getBanana( localeCode: string ): Banana | null {
	const catalogue = MESSAGES_BY_LOCALE[ localeCode ]

	if ( !catalogue ) {
		return null
	}

	if ( !bananaCache[ localeCode ] ) {
		bananaCache[ localeCode ] = new Banana( localeCode, { messages: catalogue } )
	}

	return bananaCache[ localeCode ]
}

/**
 * Wraps a string in Unicode directional isolation.
 *
 * The explorer is pinned left-to-right (see SCALAR_LOCALIZATION_DIRECTION), so
 * a Hebrew or Persian label is a right-to-left run inside a left-to-right
 * container — precisely the case AGENTS.md rule 2 requires isolation for.
 * Scalar renders these as bare text nodes and attribute values, so `<bdi>` is
 * not available and the Unicode characters are the only mechanism.
 *
 * Applied here rather than stored in the catalogue so translators never see
 * control characters and no one has to remember the rule.
 *
 * @param value - String to isolate.
 * @returns The string wrapped in FSI…PDI.
 */
function isolate( value: string ): string {
	return `${ FIRST_STRONG_ISOLATE }${ value }${ POP_DIRECTIONAL_ISOLATE }`
}

/**
 * Converts banana's positional `$n` back into Scalar's named placeholders.
 *
 * Each placeholder is isolated in turn. Scalar substitutes these with names
 * taken from the OpenAPI document — tag, schema and operation names — which
 * are external strings of unknown direction (rule 2), and it substitutes them
 * by plain text replacement, so the isolation has to be baked into the
 * template before Scalar ever sees it.
 *
 * A translation that drops a placeholder simply leaves it unsubstituted, which
 * Scalar tolerates: `replaceAll` on an absent token is a no-op.
 *
 * @param message - Resolved banana message using `$1`…`$n`.
 * @param parameterNames - Ordered Scalar placeholder names for this message.
 * @returns The message in Scalar's `{name}` syntax, placeholders isolated.
 */
function toScalarMessage( message: string, parameterNames: readonly string[] = [] ): string {
	return parameterNames.reduce(
		( current, parameterName, index ) =>
			current.replaceAll( `$${ index + 1 }`, isolate( `{${ parameterName }}` ) ),
		message
	)
}

/**
 * Assigns a value into a nested object at a dot-path, creating levels as needed.
 *
 * @param target - Object to write into.
 * @param dotPath - Path such as `operation.testRequest`.
 * @param value - String to assign.
 * @returns Nothing.
 */
function assignByPath( target: Record<string, unknown>, dotPath: string, value: string ): void {
	const segments = dotPath.split( '.' )
	const leaf = segments.pop()

	if ( !leaf ) {
		return
	}

	let cursor = target

	for ( const segment of segments ) {
		if ( typeof cursor[ segment ] !== 'object' || cursor[ segment ] === null ) {
			cursor[ segment ] = {}
		}

		cursor = cursor[ segment ] as Record<string, unknown>
	}

	cursor[ leaf ] = value
}

/**
 * Builds the partial translation table Scalar merges over its own defaults.
 *
 * Only keys that resolve in the requested locale are included. Everything else
 * is omitted so Scalar's merge chain — built-in locale, then English — decides
 * what to show.
 *
 * @param localeCode - Short interface locale code.
 * @returns Nested translations object, empty when the locale has no catalogue.
 */
export function buildScalarTranslations( localeCode: string ): Record<string, unknown> {
	const translations: Record<string, unknown> = {}

	// Pinned paths are written in every locale, unwrapped, and before the
	// catalogue check — a locale we have no catalogue for may still have a
	// Scalar built-in that would translate one. The language picker offers the
	// whole catalog, so `ar`, `de`, `pt`, `ru` and `zh-CN` are all reachable
	// selections that Scalar translates on its own. Isolation characters are
	// withheld here for the same reason the value is pinned at all: this string
	// is not display-only, and control characters have no business in a URL slug.
	for ( const entry of GENERATED_SCALAR_LOCALIZATION_MAP ) {
		if ( entry.pinnedEnglish !== undefined ) {
			assignByPath( translations, entry.scalarPath, entry.pinnedEnglish )
		}
	}

	const banana = getBanana( localeCode )

	if ( !banana ) {
		return translations
	}

	for ( const entry of GENERATED_SCALAR_LOCALIZATION_MAP ) {
		if ( entry.translatable === false ) {
			continue
		}

		const resolved = banana.i18n( entry.bananaKey )

		// banana returns the key itself when no message exists. Passing that
		// through would render a raw message key in the interface, which is
		// strictly worse than the English it would have displaced.
		if ( !resolved || resolved === entry.bananaKey ) {
			continue
		}

		assignByPath(
			translations,
			entry.scalarPath,
			isolate( toScalarMessage( resolved, entry.parameters ) )
		)
	}

	return translations
}

/**
 * Builds the full `localization` value for Scalar's configuration.
 *
 * @param localeCode - Short interface locale code.
 * @returns Scalar localization configuration.
 */
export function buildScalarLocalization( localeCode: string ) {
	return {
		locale: localeCode,
		// Pinned, never inferred — see SCALAR_LOCALIZATION_DIRECTION.
		direction: SCALAR_LOCALIZATION_DIRECTION,
		translations: buildScalarTranslations( localeCode )
	}
}
