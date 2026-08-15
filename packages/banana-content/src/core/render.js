/**
 * Rendering a parsed source for one locale.
 *
 * banana owns the message format and the call contract; this module only
 * transports argument values. Parameter values are passed through verbatim —
 * `{{BIDI:$1}}`, `{{FORMATNUM:$1}}` and `{{PLURAL:}}` belong in the message,
 * where a translator can see and adjust them.
 */

import Banana from 'banana-i18n'
import { Diagnostics } from './diagnostics.js'

/** banana magic words that cannot work, or emit HTML, in static content. */
export const DISCOURAGED_MAGIC_WORDS = [ 'GENDER', 'WIKILINK', 'EXTLINK', 'HTMLELEMENT' ]

/**
 * Merges a locale's messages with its fallback chain, first hit winning.
 *
 * The chain is applied in reverse so that earlier entries overwrite later ones,
 * leaving the most specific available translation for each key.
 *
 * @param {string[]} chain - Ordered fallback chain, most specific first.
 * @param {Record<string, Record<string, string>>} byLocale - Messages per locale.
 * @returns {Record<string, string>}
 */
export function mergeChain( chain, byLocale ) {
	const merged = {}
	for ( const code of [ ...chain ].reverse() ) {
		Object.assign( merged, byLocale[ code ] ?? {} )
	}
	return merged
}

/**
 * Builds a message resolver bound to one locale.
 *
 * The locale binds banana's plural and grammar rules, so a message served by
 * fallback is still parsed in the target language — matching MediaWiki's own
 * behaviour.
 *
 * @param {string} locale - Target locale.
 * @param {Record<string, string>} messages - Merged messages for that locale.
 * @returns {(key: string, parameters: string[]) => string}
 */
export function createResolver( locale, messages ) {
	const banana = new Banana( locale, { messages } )
	return ( key, parameters ) => banana.i18n( key, ...parameters )
}

/**
 * Applies a format's escapes for the contexts a marker sits in.
 *
 * A translated string is arbitrary text supplied by someone else, so this is a
 * correctness requirement rather than a nicety: a stray double quote in a
 * translated card title would otherwise terminate the attribute it lands in.
 *
 * @param {string} value - Resolved message.
 * @param {{ name: string, match: object }[]} contexts - Matched contexts, in order.
 * @param {object[]} contextRules - Format adapter context rules.
 * @returns {string}
 */
export function escapeForContexts( value, contexts, contextRules ) {
	let out = value
	for ( const context of contexts ) {
		const rule = contextRules.find( ( candidate ) => candidate.name === context.name )
		if ( rule ) {
			out = rule.escape( out, context.match )
		}
	}
	return out
}

/**
 * Renders a parsed source for one locale.
 *
 * @param {object} source - Parsed source.
 * @param {object} options - Render options.
 * @param {(key: string, parameters: string[]) => string} options.resolve - Message resolver.
 * @param {object} options.format - Format adapter.
 * @param {string} options.markerName - Directive name, for the leak check.
 * @returns {{ body: string, diagnostics: Diagnostics }}
 */
export function renderSource( source, options ) {
	const { resolve, format, markerName } = options
	const contextRules = format.contexts ?? []
	const diagnostics = new Diagnostics()

	const body = source.template
		.map( ( part ) => (
			typeof part === 'string' ?
				part :
				escapeForContexts( resolve( part.key, part.parameters ), part.contexts, contextRules )
		) )
		.join( '' )
		.replace( /\n+$/, '\n' )

	// One check every format gets: no marker may survive into the output.
	if ( new RegExp( `:${ markerName }[[{]` ).test( body ) ) {
		diagnostics.error( source.path, 'rendered output still contains an unexpanded marker' )
	}
	for ( const problem of format.validate?.( body ) ?? [] ) {
		diagnostics.error( source.path, problem )
	}

	return { body, diagnostics }
}

/**
 * Reports translated strings using magic words that cannot work in static
 * content, or that emit HTML into a document that may not be HTML.
 *
 * These are warned about and never rewritten: a translator's string is theirs.
 *
 * @param {string} locale - Locale being checked.
 * @param {Record<string, string>} messages - That locale's own messages.
 * @param {Diagnostics} diagnostics - Problem sink.
 * @returns {void}
 */
export function warnOnDiscouragedMagicWords( locale, messages, diagnostics ) {
	for ( const [ key, value ] of Object.entries( messages ) ) {
		for ( const word of DISCOURAGED_MAGIC_WORDS ) {
			if ( value.includes( `{{${ word }` ) ) {
				diagnostics.warn(
					`${ locale }`,
					`"${ key }" uses {{${ word }:…}}, which does not work in static content`
				)
			}
		}
	}
}
