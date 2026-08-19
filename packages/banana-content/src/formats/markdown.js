/**
 * Markdown format adapter — Markdown, GFM, and MDC.
 *
 * Answers the only two questions the core cannot: metadata lives in YAML
 * frontmatter, and the dangerous characters are the delimiter of a quoted
 * attribute value and the pipe inside a table row.
 */

import YAML from 'yaml'

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/
const ATTRIBUTE_QUOTES = new Set( [ '"', "'" ] )
const ENTITIES = { '"': '&quot;', "'": '&#39;' }

/** YAML frontmatter envelope. */
export const yamlFrontmatter = {
	/**
	 * @param {string} text - File contents.
	 * @returns {{ metadata: object, body: string }}
	 */
	parse( text ) {
		const match = FRONTMATTER.exec( text )
		if ( !match ) {
			return { metadata: {}, body: text }
		}
		let metadata = {}
		try {
			metadata = YAML.parse( match[ 1 ] ) ?? {}
		} catch {
			metadata = {}
		}
		return { metadata, body: text.slice( match[ 0 ].length ) }
	},

	/**
	 * @param {object} metadata - Frontmatter fields.
	 * @param {string} body - Document body.
	 * @returns {string}
	 */
	serialize( metadata, body ) {
		if ( !metadata || Object.keys( metadata ).length === 0 ) {
			return `${ body.replace( /^\n+/, '' ).trimEnd() }\n`
		}
		const yaml = YAML.stringify( metadata ).trimEnd()
		return `---\n${ yaml }\n---\n\n${ body.replace( /^\n+/, '' ).trimEnd() }\n`
	}
}

/**
 * Quoted attribute value, as in `title=":message{#key}"`.
 *
 * Detection insists on three conditions — a quote before the marker, the same
 * quote immediately after it, and an `=` before that — so ordinary quoted prose
 * is never mistaken for an attribute.
 */
const attributeContext = {
	name: 'attribute',

	/**
	 * @param {string} line - The whole line.
	 * @param {number} start - Marker start index.
	 * @param {number} end - Index just past the marker.
	 * @returns {{ delimiter: string }|false}
	 */
	detect( line, start, end ) {
		const delimiter = line[ start - 1 ]
		const isAttribute =
			ATTRIBUTE_QUOTES.has( delimiter ) &&
			line[ end ] === delimiter &&
			line[ start - 2 ] === '='
		return isAttribute ? { delimiter } : false
	},

	/**
	 * @param {string} value - Resolved message.
	 * @param {{ delimiter: string }} match - Detection result.
	 * @returns {string}
	 */
	escape( value, { delimiter } ) {
		return value.replaceAll( delimiter, ENTITIES[ delimiter ] )
	}
}

/** GFM table row: an unescaped pipe would split the row into extra cells. */
const tableRowContext = {
	name: 'table-row',

	/**
	 * @param {string} line - The whole line.
	 * @returns {boolean}
	 */
	detect( line ) {
		return /^\s*\|/.test( line )
	},

	/**
	 * @param {string} value - Resolved message.
	 * @returns {string}
	 */
	escape( value ) {
		return value.replaceAll( '|', '\\|' )
	}
}

/**
 * Checks that a run of table rows agrees on cell count.
 *
 * Disagreement is the signature of a translated cell carrying an unescaped
 * pipe. There is deliberately no Markdown parser here: parsers are permissive
 * enough that such a check never fires, and it would cost a dependency for
 * nothing.
 *
 * @param {string} output - Rendered document body.
 * @returns {string[]} Problems found.
 */
function validateTables( output ) {
	const problems = []
	let run = []

	const flush = () => {
		if ( run.length > 1 ) {
			const counts = new Set( run.map( ( row ) => row.count ) )
			if ( counts.size > 1 ) {
				problems.push(
					`table starting at line ${ run[ 0 ].line } has inconsistent cell counts ` +
					`(${ [ ...counts ].join( ', ' ) }); a translated cell probably contains an ` +
					'unescaped pipe'
				)
			}
		}
		run = []
	}

	output.split( '\n' ).forEach( ( line, index ) => {
		if ( /^\s*\|/.test( line ) ) {
			run.push( { line: index + 1, count: ( line.match( /(?<!\\)\|/g ) ?? [] ).length } )
		} else {
			flush()
		}
	} )
	flush()
	return problems
}

/**
 * Creates the Markdown format adapter.
 *
 * @returns {object} Format adapter.
 */
export function markdown() {
	return {
		name: 'markdown',
		envelope: yamlFrontmatter,
		// Order is load-bearing: attributes escape to entities that contain no
		// pipe, so escaping them first is safe; the reverse order would mangle
		// the backslash the table escape introduces.
		contexts: [ attributeContext, tableRowContext ],
		validate: validateTables
	}
}

export default markdown
