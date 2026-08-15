/**
 * Marker tokenizing.
 *
 * The one recognition rule, on which everything else depends: a marker is the
 * marker name preceded by a colon and followed IMMEDIATELY by `[` or `{`.
 * Nothing else in a source file belongs to this library. That is what lets
 * markers be dropped into a host format this code has never heard of without
 * colliding with that format's own syntax — an MDC heading id trailing a
 * marker (`{#anchor}` after a space) is not ours, and passes through untouched.
 */

/** Characters an escape may protect inside a definition's text span. */
const TEXT_ESCAPES = /\\([[\]|"'\\])/g

/**
 * Finds the `}` closing an attribute block, ignoring braces inside quoted
 * values.
 *
 * @param {string} source - Line or fragment.
 * @param {number} openIndex - Index of the opening `{`.
 * @returns {number} Index of the closing `}`, or -1 when unterminated.
 */
export function findClosingBrace( source, openIndex ) {
	let quote = null
	for ( let i = openIndex + 1; i < source.length; i++ ) {
		const char = source[ i ]
		if ( quote ) {
			if ( char === '\\' ) {
				i++
			} else if ( char === quote ) {
				quote = null
			}
			continue
		}
		if ( char === '"' || char === "'" ) {
			quote = char
		} else if ( char === '}' ) {
			return i
		}
	}
	return -1
}

/**
 * Reads a definition's `[...]` text span.
 *
 * Bracket matching is nesting-aware, so Markdown links inside the text need no
 * escaping; a genuinely unbalanced bracket is written `\[` or `\]`.
 *
 * @param {string} source - Line or fragment.
 * @param {number} openIndex - Index of the opening `[`.
 * @returns {{ raw: string, end: number }|null} Raw span with escapes intact and
 *   the index of the closing `]`, or null when unbalanced.
 */
export function readTextSpan( source, openIndex ) {
	let depth = 1
	let raw = ''
	let i = openIndex + 1
	while ( i < source.length ) {
		const char = source[ i ]
		if ( char === '\\' ) {
			raw += char + ( source[ i + 1 ] ?? '' )
			i += 2
			continue
		}
		if ( char === '[' ) {
			depth++
		} else if ( char === ']' ) {
			depth--
			if ( depth === 0 ) {
				return { raw, end: i }
			}
		}
		raw += char
		i++
	}
	return null
}

/**
 * Removes syntax escapes, leaving the logical message value.
 *
 * Escaping is a property of the file, never of the stored message: a value
 * written `XML \| SQL` in a table cell is stored as `XML | SQL`, and re-escaped
 * per context on the way out.
 *
 * @param {string} raw - Escaped text.
 * @returns {string}
 */
export function unescapeText( raw ) {
	return raw.replace( TEXT_ESCAPES, '$1' )
}

/**
 * Parses `#id name="value"` attribute syntax.
 *
 * Values may contain any character including the other quote style; the
 * delimiter itself is backslash-escaped.
 *
 * @param {string} source - Text between `{` and `}`.
 * @param {string} location - Source location for diagnostics.
 * @param {import('./diagnostics.js').Diagnostics} diagnostics - Problem sink.
 * @returns {{ id: string|null, attributes: Map<string, string> }}
 */
export function parseAttributes( source, location, diagnostics ) {
	const attributes = new Map()
	let id = null
	let i = 0
	while ( i < source.length ) {
		if ( /\s/.test( source[ i ] ) ) {
			i++
			continue
		}
		if ( source[ i ] === '#' ) {
			let end = i + 1
			while ( end < source.length && !/\s/.test( source[ end ] ) ) {
				end++
			}
			id = source.slice( i + 1, end )
			i = end
			continue
		}
		const equals = source.indexOf( '=', i )
		if ( equals === -1 ) {
			diagnostics.error( location, `unparseable attribute near "${ source.slice( i, i + 24 ) }"` )
			break
		}
		const name = source.slice( i, equals ).trim()
		const quote = source[ equals + 1 ]
		if ( quote !== '"' && quote !== "'" ) {
			diagnostics.error( location, `attribute "${ name }" value must be quoted` )
			break
		}
		let value = ''
		let j = equals + 2
		let terminated = false
		for ( ; j < source.length; j++ ) {
			if ( source[ j ] === '\\' ) {
				value += source[ j + 1 ] ?? ''
				j++
			} else if ( source[ j ] === quote ) {
				terminated = true
				break
			} else {
				value += source[ j ]
			}
		}
		if ( !terminated ) {
			diagnostics.error( location, `unterminated value for attribute "${ name }"` )
			break
		}
		attributes.set( name, value )
		i = j + 1
	}
	return { id, attributes }
}

/**
 * Collects `p1`…`pN` into positional order and reports unknown attributes.
 *
 * @param {Map<string, string>} attributes - Parsed attributes.
 * @param {string} location - Source location for diagnostics.
 * @param {import('./diagnostics.js').Diagnostics} diagnostics - Problem sink.
 * @returns {string[]} Ordered parameter values.
 */
export function orderedParameters( attributes, location, diagnostics ) {
	const numbered = []
	for ( const [ name, value ] of attributes ) {
		const match = /^p(\d+)$/.exec( name )
		if ( match ) {
			numbered.push( [ Number( match[ 1 ] ), value ] )
		} else if ( name !== 'qqq' ) {
			diagnostics.error( location, `unknown attribute "${ name }"` )
		}
	}
	numbered.sort( ( a, b ) => a[ 0 ] - b[ 0 ] )
	numbered.forEach( ( [ index ], position ) => {
		if ( index !== position + 1 ) {
			diagnostics.error(
				location,
				`parameters must be numbered from p1 without gaps (found p${ index })`
			)
		}
	} )
	return numbered.map( ( [ , value ] ) => value )
}

/**
 * Runs a format's context rules against a marker's position in its line.
 *
 * Rules are evaluated in the order the adapter declares them, and every match
 * is kept — several may apply to one marker, and their escapes compose in the
 * same order at render time.
 *
 * @param {string} line - The whole line.
 * @param {number} start - Marker start index.
 * @param {number} end - Index just past the marker.
 * @param {object[]} contextRules - Format adapter context rules.
 * @returns {{ name: string, match: object }[]} Matched contexts, in order.
 */
export function detectContexts( line, start, end, contextRules ) {
	const matched = []
	for ( const rule of contextRules ) {
		const match = rule.detect( line, start, end )
		if ( match ) {
			matched.push( { name: rule.name, match: match === true ? {} : match } )
		}
	}
	return matched
}

/**
 * Scans one line for inline markers.
 *
 * @param {string} line - Source line.
 * @param {string} location - Source location for diagnostics.
 * @param {object} options - Tokenizer options.
 * @param {string} options.markerName - Directive name, without the colon.
 * @param {object[]} options.contextRules - Format adapter context rules.
 * @param {import('./diagnostics.js').Diagnostics} options.diagnostics - Problem sink.
 * @returns {Array<string|object>} Ordered literals and marker objects.
 */
export function parseInlineParts( line, location, options ) {
	const { markerName, contextRules, diagnostics } = options
	const marker = `:${ markerName }`
	const parts = []
	let literal = ''
	let i = 0

	while ( i < line.length ) {
		// `\:message` is a literal marker, not a marker.
		if ( line.startsWith( `\\${ marker }`, i ) ) {
			literal += marker
			i += marker.length + 1
			continue
		}

		const isMarkerStart =
			line.startsWith( marker, i ) &&
			line[ i - 1 ] !== ':' &&
			( line[ i + marker.length ] === '[' || line[ i + marker.length ] === '{' )
		if ( !isMarkerStart ) {
			literal += line[ i ]
			i++
			continue
		}

		let text = null
		let braceOpen = i + marker.length
		if ( line[ braceOpen ] === '[' ) {
			const span = readTextSpan( line, braceOpen )
			if ( !span ) {
				diagnostics.error(
					location,
					'unbalanced [ ] in a definition; escape a literal bracket as \\]'
				)
				literal += line[ i ]
				i++
				continue
			}
			text = unescapeText( span.raw )
			braceOpen = span.end + 1
			if ( line[ braceOpen ] !== '{' ) {
				diagnostics.error( location, 'a definition must be followed by {#key …}' )
				literal += line[ i ]
				i++
				continue
			}
		}

		const braceClose = findClosingBrace( line, braceOpen )
		if ( braceClose === -1 ) {
			diagnostics.error( location, 'unterminated attribute block { }' )
			literal += line[ i ]
			i++
			continue
		}

		const { id, attributes } = parseAttributes(
			line.slice( braceOpen + 1, braceClose ), location, diagnostics
		)
		const end = braceClose + 1
		if ( literal ) {
			parts.push( literal )
			literal = ''
		}
		parts.push( {
			kind: text === null ? 'reference' : 'definition',
			id,
			text,
			qqq: attributes.get( 'qqq' ) ?? null,
			parameters: orderedParameters( attributes, location, diagnostics ),
			hasParameters: [ ...attributes.keys() ].some( ( name ) => /^p\d+$/.test( name ) ),
			contexts: detectContexts( line, i, end, contextRules ),
			location
		} )
		i = end
	}

	if ( literal ) {
		parts.push( literal )
	}
	return parts
}
