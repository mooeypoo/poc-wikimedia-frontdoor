/**
 * Source file parsing.
 *
 * Produces a render template — an ordered mix of literal strings and marker
 * objects — plus the list of markers the file declares or uses. Nothing here
 * knows what the host format is beyond the two questions it asks the adapter:
 * where the metadata lives, and which characters are dangerous where.
 */

import { Diagnostics } from './diagnostics.js'
import { parseInlineParts, findClosingBrace, parseAttributes, orderedParameters, unescapeText } from './markers.js'
import { keyPrefixForPath, resolveKey, isQualified } from './keys.js'

/**
 * @typedef {object} ParseSourceOptions
 * @property {string} path - Path relative to the source root.
 * @property {object} format - Format adapter.
 * @property {{ name: string, definitionsBlock: string }} marker - Marker names.
 * @property {{ prefix: string, pattern: RegExp }} keys - Key policy.
 * @property {boolean} [definitionsOnly] - Whether this file emits no output.
 */

/**
 * Parses one source file.
 *
 * @param {string} text - File contents.
 * @param {ParseSourceOptions} options - Parse options.
 * @returns {object} Parsed source.
 */
export function parseSource( text, options ) {
	const { path, format, marker, keys, definitionsOnly = false } = options
	const diagnostics = new Diagnostics()
	const contextRules = format.contexts ?? []

	const { metadata, body } = format.envelope ?
		format.envelope.parse( text ) :
		{ metadata: {}, body: text }

	const keyPrefix = keyPrefixForPath( path, keys.prefix )
	const template = []
	const markers = []
	const lines = body.split( '\n' )
	const definitionsFence = `:::${ marker.definitionsBlock }`
	const blockOpen = new RegExp( `^::${ marker.name }\\s*\\{` )

	/**
	 * Resolves a marker's key and records it.
	 *
	 * @param {object} entry - Marker from the tokenizer.
	 * @returns {object} The same marker, with `key` set.
	 */
	function register( entry ) {
		if ( !entry.id ) {
			diagnostics.error( entry.location, `marker is missing its {#key}` )
			entry.key = ''
			return entry
		}
		entry.key = resolveKey( entry.id, keyPrefix, keys.prefix )
		if ( definitionsOnly && !isQualified( entry.id, keys.prefix ) ) {
			// The path-derived prefix is meaningless in a file that emits nothing,
			// so reporting that it also fails the key pattern would be noise on top
			// of the real problem.
			diagnostics.error(
				entry.location,
				`"${ entry.id }" must be a fully-qualified key (starting "${ keys.prefix }"): ` +
				`${ path } emits no output, so its definitions exist only to be ` +
				'referenced from other files'
			)
		} else if ( !keys.pattern.test( entry.key ) ) {
			diagnostics.error( entry.location, `key "${ entry.key }" does not match ${ keys.pattern }` )
		}
		markers.push( entry )
		return entry
	}

	let i = 0
	while ( i < lines.length ) {
		const line = lines[ i ]
		const location = `${ path }:${ i + 1 }`

		// `:::messages` — definitions only, stripped from the output.
		if ( line.trimEnd() === definitionsFence ) {
			i++
			let closed = false
			while ( i < lines.length ) {
				if ( /^:::\s*$/.test( lines[ i ] ) ) {
					closed = true
					i++
					break
				}
				const innerLocation = `${ path }:${ i + 1 }`
				const parts = parseInlineParts( lines[ i ], innerLocation, {
					markerName: marker.name, contextRules, diagnostics
				} )
				for ( const part of parts ) {
					if ( typeof part === 'string' ) {
						continue
					}
					if ( part.kind !== 'definition' ) {
						diagnostics.error(
							innerLocation,
							`a ${ definitionsFence } block may only contain definitions`
						)
					}
					if ( part.hasParameters ) {
						diagnostics.error(
							innerLocation,
							`a definition inside ${ definitionsFence } never renders in place, so it ` +
							'cannot carry parameter values; put p1…pN on the references instead'
						)
					}
					register( part )
				}
				i++
			}
			if ( !closed ) {
				diagnostics.error( location, `unterminated ${ definitionsFence } block` )
			}
			// The block emits nothing, so absorb one following blank line too,
			// or removing it leaves a doubled blank line in the output.
			if ( lines[ i ] !== undefined && lines[ i ].trim() === '' ) {
				i++
			}
			continue
		}

		// `::message{…}` … `::` — block definition spanning several paragraphs.
		if ( blockOpen.test( line ) ) {
			const braceOpen = line.indexOf( '{' )
			const braceClose = findClosingBrace( line, braceOpen )
			if ( braceClose === -1 ) {
				diagnostics.error( location, 'unterminated attribute block { }' )
				i++
				continue
			}
			const { id, attributes } = parseAttributes(
				line.slice( braceOpen + 1, braceClose ), location, diagnostics
			)
			i++
			const inner = []
			let closed = false
			while ( i < lines.length ) {
				if ( /^::\s*$/.test( lines[ i ] ) ) {
					closed = true
					i++
					break
				}
				inner.push( lines[ i ] )
				i++
			}
			if ( !closed ) {
				diagnostics.error( location, `unterminated ::${ marker.name } block` )
			}
			template.push( register( {
				kind: 'definition',
				id,
				text: unescapeText( inner.join( '\n' ).trim() ),
				qqq: attributes.get( 'qqq' ) ?? null,
				parameters: orderedParameters( attributes, location, diagnostics ),
				hasParameters: [ ...attributes.keys() ].some( ( name ) => /^p\d+$/.test( name ) ),
				contexts: [],
				location
			} ), '\n' )
			continue
		}

		for ( const part of parseInlineParts( line, location, {
			markerName: marker.name, contextRules, diagnostics
		} ) ) {
			template.push( typeof part === 'string' ? part : register( part ) )
		}
		template.push( '\n' )
		i++
	}

	return { path, metadata, template, markers, definitionsOnly, keyPrefix, diagnostics }
}
