#!/usr/bin/env node

/**
 * Expands message-driven prose pages into per-locale Markdown.
 *
 * This is a STANDALONE command, decoupled from the build: run it, review the
 * resulting git diff, then commit. The build itself never runs it. Unlike the
 * other generators in this directory it makes NO network calls — its output is
 * a pure function of committed inputs. See
 * docs/adr-translatable-prose-content.md §10.
 *
 * Two phases:
 *   extract  — parse `content-i18n/**` and write `i18n/content/{en,qqq}.json`
 *   generate — wipe previously generated pages, then write `content/<locale>/…`
 *              for English plus every locale clearing the translation threshold
 *
 * Marker syntax (ADR §3):
 *   :message[English text]{#key qqq="…"}     definition, inline
 *   ::message{#key qqq="…"} … ::             definition, block (multi-paragraph)
 *   :message{#key p1="…"}                    reference, attribute-safe
 *   :::messages … :::                        definitions-only block, stripped
 *
 * banana-i18n owns the message format and the call contract; this script only
 * transports `p1`…`pN` as positional arguments (ADR §4). Parameter values are
 * passed through verbatim — `{{BIDI:$1}}`, `{{FORMATNUM:$1}}` and `{{PLURAL:}}`
 * belong in the message, not here.
 *
 * Usage:
 *   node scripts/generate-content-i18n.mjs [--extract-only|--generate-only]
 */

import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'
import { promises as fs } from 'node:fs'
import YAML from 'yaml'
import Banana from 'banana-i18n'
import MarkdownIt from 'markdown-it'
import {
	CONTENT_I18N_BASE_DIRECTORY,
	CONTENT_I18N_MESSAGE_DIRECTORY,
	CONTENT_I18N_OUTPUT_DIRECTORY,
	CONTENT_I18N_SOURCE_LOCALE,
	CONTENT_I18N_KEY_PREFIX,
	CONTENT_I18N_KEY_PATTERN,
	CONTENT_I18N_MIN_TRANSLATED_PERCENT,
	CONTENT_I18N_GENERATED_MARKER
} from '../config/contentI18n.ts'
// Imported directly rather than through the `config/languages.ts` accessor:
// that module resolves `./languages.generated` without a file extension, which
// Node's ESM resolver cannot load. The override layer in the accessor is empty
// today, so this is equivalent — see ADR §13.
import { GENERATED_LANGUAGES } from '../config/languages.generated.ts'

const projectRoot = dirname( dirname( fileURLToPath( import.meta.url ) ) )

/** Marker directive name. */
const MARKER = ':message'

/** Written into the `@metadata` of every generated message file. */
const GENERATED_NOTE =
	'GENERATED FILE - DO NOT EDIT BY HAND. Extracted from ' +
	`${ CONTENT_I18N_BASE_DIRECTORY }/ by scripts/generate-content-i18n.mjs; ` +
	'edit the English source there and re-run `npm run generate-content-i18n`.'

/** banana magic words that cannot work, or emit HTML, in static prose (ADR §4). */
const DISCOURAGED_MAGIC_WORDS = [ 'GENDER', 'WIKILINK', 'EXTLINK', 'HTMLELEMENT' ]

const errors = []
const warnings = []

/**
 * Records a fatal problem. Collected rather than thrown so one run reports
 * every structural error instead of only the first.
 *
 * @param {string} location - Human-readable source location.
 * @param {string} message - What is wrong.
 * @returns {void}
 */
function fail( location, message ) {
	errors.push( `${ location }: ${ message }` )
}

/**
 * Records a non-fatal problem.
 *
 * @param {string} location - Human-readable source location.
 * @param {string} message - What is suspicious.
 * @returns {void}
 */
function warn( location, message ) {
	warnings.push( `${ location }: ${ message }` )
}

/* ------------------------------------------------------------------ *
 * Files
 * ------------------------------------------------------------------ */

/**
 * Parses YAML frontmatter from Markdown content.
 *
 * @param {string} content - Raw Markdown.
 * @returns {{ data: Record<string, unknown>, body: string }}
 */
function parseFrontmatter( content ) {
	const match = /^---\n([\s\S]*?)\n---\n?/.exec( content )
	if ( !match ) {
		return { data: {}, body: content }
	}
	let data = {}
	try {
		data = YAML.parse( match[ 1 ] ) ?? {}
	} catch {
		data = {}
	}
	return { data, body: content.slice( match[ 0 ].length ) }
}

/**
 * Serializes frontmatter + body into a Markdown document.
 *
 * @param {Record<string, unknown>} data - Frontmatter fields.
 * @param {string} body - Markdown body.
 * @returns {string}
 */
function serializeDocument( data, body ) {
	const yaml = YAML.stringify( data ).trimEnd()
	return `---\n${ yaml }\n---\n\n${ body.replace( /^\n+/, '' ).trimEnd() }\n`
}

/**
 * Recursively lists files with a given extension.
 *
 * @param {string} directory - Absolute directory to walk.
 * @param {string} extension - Extension to keep, including the dot.
 * @returns {Promise<string[]>} Absolute paths, sorted for determinism.
 */
async function walkFiles( directory, extension ) {
	let dirEntries
	try {
		dirEntries = await fs.readdir( directory, { withFileTypes: true } )
	} catch {
		return []
	}
	const found = []
	for ( const dirEntry of dirEntries.sort( ( a, b ) => ( a.name < b.name ? -1 : 1 ) ) ) {
		const full = join( directory, dirEntry.name )
		if ( dirEntry.isDirectory() ) {
			found.push( ...await walkFiles( full, extension ) )
		} else if ( dirEntry.name.endsWith( extension ) ) {
			found.push( full )
		}
	}
	return found
}

/**
 * Repository-relative path with forward slashes.
 *
 * @param {string} absolutePath - Absolute path.
 * @returns {string}
 */
function repositoryPath( absolutePath ) {
	return relative( projectRoot, absolutePath ).split( '\\' ).join( '/' )
}

/* ------------------------------------------------------------------ *
 * Marker syntax
 * ------------------------------------------------------------------ */

/**
 * Finds the `}` closing an attribute block, ignoring braces inside quoted
 * values.
 *
 * @param {string} source - Line or fragment.
 * @param {number} openIndex - Index of the opening `{`.
 * @returns {number} Index of the closing `}`, or -1.
 */
function findClosingBrace( source, openIndex ) {
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
 * Parses `#id name="value"` attribute syntax. Values may contain any character
 * including the other quote style; the delimiter itself is backslash-escaped
 * (ADR §5).
 *
 * @param {string} source - Text between `{` and `}`.
 * @param {string} location - Source location for diagnostics.
 * @returns {{ id: string|null, attributes: Map<string, string> }}
 */
function parseAttributes( source, location ) {
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
			fail( location, `unparseable attribute near "${ source.slice( i, i + 24 ) }"` )
			break
		}
		const name = source.slice( i, equals ).trim()
		const quote = source[ equals + 1 ]
		if ( quote !== '"' && quote !== "'" ) {
			fail( location, `attribute "${ name }" value must be quoted` )
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
			fail( location, `unterminated value for attribute "${ name }"` )
			break
		}
		attributes.set( name, value )
		i = j + 1
	}
	return { id, attributes }
}

/**
 * Reads a definition's `[...]` text span. Bracket matching is nesting-aware so
 * Markdown links need no escaping; an unbalanced bracket is written `\[` / `\]`
 * (ADR §5).
 *
 * @param {string} source - Line or fragment.
 * @param {number} openIndex - Index of the opening `[`.
 * @returns {{ raw: string, end: number }|null} Raw span (escapes intact) and
 *   the index of the closing `]`, or null when unbalanced.
 */
function readTextSpan( source, openIndex ) {
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
 * Removes syntax escapes, leaving the logical message value. Escaping is a
 * property of the file, never of the stored message (ADR §5).
 *
 * @param {string} raw - Escaped text.
 * @returns {string}
 */
function unescapeText( raw ) {
	return raw.replace( /\\([[\]|"'\\])/g, '$1' )
}

/**
 * Classifies where a marker sits, so the generator can escape its substituted
 * value for that context (ADR §5).
 *
 * @param {string} line - The whole line.
 * @param {number} start - Marker start index.
 * @param {number} end - Index just past the marker.
 * @returns {{ attributeDelimiter: string|null, tableRow: boolean }}
 */
function detectContext( line, start, end ) {
	const before = line[ start - 1 ]
	const isAttribute =
		( before === '"' || before === "'" ) &&
		line[ end ] === before &&
		line[ start - 2 ] === '='
	return {
		attributeDelimiter: isAttribute ? before : null,
		tableRow: /^\s*\|/.test( line )
	}
}

/**
 * Escapes a resolved message for the context it is being substituted into.
 * A translated string is arbitrary text we do not control, so this is a
 * correctness requirement rather than a convenience (ADR §5).
 *
 * @param {string} value - Resolved message.
 * @param {{ attributeDelimiter: string|null, tableRow: boolean }} context
 * @returns {string}
 */
function escapeForContext( value, context ) {
	let out = value
	if ( context.attributeDelimiter === '"' ) {
		out = out.replace( /"/g, '&quot;' )
	} else if ( context.attributeDelimiter === "'" ) {
		out = out.replace( /'/g, '&#39;' )
	}
	if ( context.tableRow ) {
		out = out.replace( /\|/g, '\\|' )
	}
	return out
}

/**
 * Collects `p1`…`pN` into positional order and reports unknown attributes.
 *
 * @param {Map<string, string>} attributes - Parsed attributes.
 * @param {string} location - Source location for diagnostics.
 * @returns {string[]} Ordered parameter values.
 */
function orderedParameters( attributes, location ) {
	const numbered = []
	for ( const [ name, value ] of attributes ) {
		const match = /^p(\d+)$/.exec( name )
		if ( match ) {
			numbered.push( [ Number( match[ 1 ] ), value ] )
		} else if ( name !== 'qqq' ) {
			fail( location, `unknown attribute "${ name }"` )
		}
	}
	numbered.sort( ( a, b ) => a[ 0 ] - b[ 0 ] )
	numbered.forEach( ( [ index ], position ) => {
		if ( index !== position + 1 ) {
			fail( location, `parameters must be numbered from p1 without gaps (found p${ index })` )
		}
	} )
	return numbered.map( ( [ , value ] ) => value )
}

/**
 * Scans one line for inline markers, returning an ordered mix of literal
 * strings and marker objects.
 *
 * @param {string} line - Source line.
 * @param {string} location - Source location for diagnostics.
 * @returns {Array<string|object>}
 */
function parseInlineParts( line, location ) {
	const parts = []
	let literal = ''
	let i = 0
	while ( i < line.length ) {
		if ( line.startsWith( '\\' + MARKER, i ) ) {
			literal += MARKER
			i += MARKER.length + 1
			continue
		}
		const isMarkerStart =
			line.startsWith( MARKER, i ) &&
			line[ i - 1 ] !== ':' &&
			( line[ i + MARKER.length ] === '[' || line[ i + MARKER.length ] === '{' )
		if ( !isMarkerStart ) {
			literal += line[ i ]
			i++
			continue
		}

		let text = null
		let braceOpen = i + MARKER.length
		if ( line[ braceOpen ] === '[' ) {
			const span = readTextSpan( line, braceOpen )
			if ( !span ) {
				fail( location, 'unbalanced [ ] in a definition; escape a literal bracket as \\] ' )
				literal += line[ i ]
				i++
				continue
			}
			text = unescapeText( span.raw )
			braceOpen = span.end + 1
			if ( line[ braceOpen ] !== '{' ) {
				fail( location, 'a definition must be followed by {#key …}' )
				literal += line[ i ]
				i++
				continue
			}
		}
		const braceClose = findClosingBrace( line, braceOpen )
		if ( braceClose === -1 ) {
			fail( location, 'unterminated attribute block { }' )
			literal += line[ i ]
			i++
			continue
		}
		const { id, attributes } = parseAttributes(
			line.slice( braceOpen + 1, braceClose ), location
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
			parameters: orderedParameters( attributes, location ),
			hasParameters: [ ...attributes.keys() ].some( ( name ) => /^p\d+$/.test( name ) ),
			context: detectContext( line, i, end ),
			location
		} )
		i = end
	}
	if ( literal ) {
		parts.push( literal )
	}
	return parts
}

/* ------------------------------------------------------------------ *
 * Base files
 * ------------------------------------------------------------------ */

/**
 * Derives a page's key namespace from its path (ADR §6).
 *
 * @param {string} relativePath - Path under the base directory, e.g.
 *   `experiments/open-data.md`.
 * @returns {string} Key prefix, e.g. `content-experiments-open-data-`.
 */
function keyPrefixForPath( relativePath ) {
	const withoutExtension = relativePath.replace( /\.md$/, '' )
	return CONTENT_I18N_KEY_PREFIX + withoutExtension.split( '/' ).join( '-' ) + '-'
}

/**
 * Resolves a marker id to a full message key. An id already carrying the
 * reserved prefix is a fully-qualified cross-file reference and is used
 * verbatim; anything else is page-local (ADR §6).
 *
 * @param {string} id - Marker id.
 * @param {string} keyPrefix - This file's namespace.
 * @returns {string}
 */
function resolveKey( id, keyPrefix ) {
	return id.startsWith( CONTENT_I18N_KEY_PREFIX ) ? id : keyPrefix + id
}

/**
 * Parses a base file into a render template plus its definitions.
 *
 * @param {string} relativePath - Path under the base directory.
 * @param {string} raw - File contents.
 * @returns {object} Parsed base file.
 */
function parseBaseFile( relativePath, raw ) {
	const { data: frontmatter, body } = parseFrontmatter( raw )
	const keyPrefix = keyPrefixForPath( relativePath )
	const definitionsOnly = relativePath.split( '/' ).some( ( part ) => part.startsWith( '_' ) )
	const template = []
	const markers = []
	const lines = body.split( '\n' )
	let i = 0

	/**
	 * Registers a parsed marker, resolving its key.
	 *
	 * @param {object} marker - Marker from the line scanner.
	 * @returns {object} The same marker, with `key` set.
	 */
	function register( marker ) {
		if ( !marker.id ) {
			fail( marker.location, 'marker is missing its {#key}' )
			marker.key = ''
			return marker
		}
		marker.key = resolveKey( marker.id, keyPrefix )
		if ( definitionsOnly && !marker.id.startsWith( CONTENT_I18N_KEY_PREFIX ) ) {
			// The derived prefix is meaningless here, so reporting that it also
			// fails the key pattern would just be noise on top of the real problem.
			fail(
				marker.location,
				`"${ marker.id }" must be a fully-qualified key (starting ` +
				`"${ CONTENT_I18N_KEY_PREFIX }"): ${ relativePath } emits no page, so its ` +
				'definitions exist only to be referenced from other files'
			)
		} else if ( !CONTENT_I18N_KEY_PATTERN.test( marker.key ) ) {
			fail( marker.location, `key "${ marker.key }" does not match ${ CONTENT_I18N_KEY_PATTERN }` )
		}
		markers.push( marker )
		return marker
	}

	while ( i < lines.length ) {
		const line = lines[ i ]
		const location = `${ CONTENT_I18N_BASE_DIRECTORY }/${ relativePath }:${ i + 1 }`

		// `:::messages` — definitions only, stripped from the output.
		if ( /^:::messages\s*$/.test( line ) ) {
			i++
			let closed = false
			while ( i < lines.length ) {
				if ( /^:::\s*$/.test( lines[ i ] ) ) {
					closed = true
					i++
					break
				}
				const inner = `${ CONTENT_I18N_BASE_DIRECTORY }/${ relativePath }:${ i + 1 }`
				for ( const part of parseInlineParts( lines[ i ], inner ) ) {
					if ( typeof part === 'string' ) {
						continue
					}
					if ( part.kind !== 'definition' ) {
						fail( inner, 'a :::messages block may only contain definitions' )
					}
					if ( part.hasParameters ) {
						fail(
							inner,
							'a definition inside :::messages never renders in place, so it cannot ' +
							'carry parameter values; put p1…pN on the references instead'
						)
					}
					register( part )
				}
				i++
			}
			if ( !closed ) {
				fail( location, 'unterminated :::messages block' )
			}
			// The block emits nothing, so absorb one following blank line too —
			// otherwise removing it leaves a doubled blank line in the output.
			if ( lines[ i ] !== undefined && lines[ i ].trim() === '' ) {
				i++
			}
			continue
		}

		// `::message{…}` … `::` — block definition spanning several paragraphs.
		if ( /^::message\s*\{/.test( line ) ) {
			const braceOpen = line.indexOf( '{' )
			const braceClose = findClosingBrace( line, braceOpen )
			if ( braceClose === -1 ) {
				fail( location, 'unterminated attribute block { }' )
				i++
				continue
			}
			const { id, attributes } = parseAttributes(
				line.slice( braceOpen + 1, braceClose ), location
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
				fail( location, 'unterminated ::message block' )
			}
			const marker = register( {
				kind: 'definition',
				id,
				text: unescapeText( inner.join( '\n' ).trim() ),
				qqq: attributes.get( 'qqq' ) ?? null,
				parameters: orderedParameters( attributes, location ),
				hasParameters: [ ...attributes.keys() ].some( ( name ) => /^p\d+$/.test( name ) ),
				context: { attributeDelimiter: null, tableRow: false },
				location
			} )
			template.push( marker, '\n' )
			continue
		}

		for ( const part of parseInlineParts( line, location ) ) {
			template.push( typeof part === 'string' ? part : register( part ) )
		}
		template.push( '\n' )
		i++
	}

	return { relativePath, frontmatter, template, markers, definitionsOnly, keyPrefix }
}

/* ------------------------------------------------------------------ *
 * Messages
 * ------------------------------------------------------------------ */

/**
 * Serializes a message map: `@metadata` first, then keys sorted for a stable
 * diff.
 *
 * @param {Map<string, string>} messages - Key to value.
 * @returns {string}
 */
function serializeMessageFile( messages ) {
	const sorted = [ ...messages.entries() ].sort( ( a, b ) => ( a[ 0 ] < b[ 0 ] ? -1 : 1 ) )
	return JSON.stringify(
		{ '@metadata': { note: GENERATED_NOTE }, ...Object.fromEntries( sorted ) },
		null,
		2
	) + '\n'
}

/**
 * Reads a message file, dropping `@metadata`.
 *
 * @param {string} absolutePath - File to read.
 * @returns {Promise<Record<string, string>>}
 */
async function readMessageFile( absolutePath ) {
	const parsed = JSON.parse( await fs.readFile( absolutePath, 'utf-8' ) )
	const messages = {}
	for ( const [ key, value ] of Object.entries( parsed ) ) {
		if ( !key.startsWith( '@' ) ) {
			messages[ key ] = value
		}
	}
	return messages
}

/**
 * Builds the message map a locale renders from, walking the language catalog's
 * fallback chain so the first locale in the chain that has a key wins.
 *
 * @param {string} locale - Target locale.
 * @param {Record<string, Record<string, string>>} byLocale - Messages per locale.
 * @returns {Record<string, string>}
 */
function mergedMessagesFor( locale, byLocale ) {
	const catalogEntry = GENERATED_LANGUAGES.find( ( language ) => language.code === locale )
	const chain = catalogEntry ?
		catalogEntry.fallbackChain :
		[ locale, CONTENT_I18N_SOURCE_LOCALE ]
	const merged = {}
	for ( const code of [ ...chain ].reverse() ) {
		Object.assign( merged, byLocale[ code ] ?? {} )
	}
	return merged
}

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */

/**
 * Renders a base file's template for one locale.
 *
 * @param {Array<string|object>} template - Literals and markers.
 * @param {Banana} banana - Locale-bound banana instance.
 * @returns {string}
 */
function renderTemplate( template, banana ) {
	return template
		.map( ( part ) => (
			typeof part === 'string' ?
				part :
				escapeForContext( banana.i18n( part.key, ...part.parameters ), part.context )
		) )
		.join( '' )
}

const markdown = new MarkdownIt()

/**
 * Checks rendered output for the failures a translated string can cause.
 *
 * @param {string} outputPath - Repository-relative destination, for diagnostics.
 * @param {string} body - Rendered Markdown body.
 * @returns {void}
 */
function validateRendered( outputPath, body ) {
	if ( new RegExp( `${ MARKER }[[{]` ).test( body ) ) {
		fail( outputPath, 'rendered output still contains an unexpanded :message marker' )
	}
	try {
		markdown.parse( body, {} )
	} catch ( error ) {
		fail( outputPath, `rendered output does not parse as Markdown: ${ error.message }` )
	}

	// Within a contiguous run of table rows every row must have the same number
	// of unescaped pipes, or a translated cell has broken the table.
	let run = []
	const flush = () => {
		if ( run.length > 1 ) {
			const counts = new Set( run.map( ( row ) => row.count ) )
			if ( counts.size > 1 ) {
				fail(
					outputPath,
					`table starting at line ${ run[ 0 ].line } has inconsistent cell counts ` +
					`(${ [ ...counts ].join( ', ' ) }); a translated cell probably contains an ` +
					'unescaped pipe'
				)
			}
		}
		run = []
	}
	body.split( '\n' ).forEach( ( line, index ) => {
		if ( /^\s*\|/.test( line ) ) {
			run.push( { line: index + 1, count: ( line.match( /(?<!\\)\|/g ) ?? [] ).length } )
		} else {
			flush()
		}
	} )
	flush()
}

/**
 * Reports translated strings using banana magic words that cannot work in
 * static prose or that emit HTML into a Markdown document (ADR §4).
 *
 * @param {string} locale - Locale being checked.
 * @param {Record<string, string>} messages - That locale's own messages.
 * @returns {void}
 */
function warnOnDiscouragedMagicWords( locale, messages ) {
	for ( const [ key, value ] of Object.entries( messages ) ) {
		for ( const word of DISCOURAGED_MAGIC_WORDS ) {
			if ( value.includes( `{{${ word }` ) ) {
				warn(
					`${ CONTENT_I18N_MESSAGE_DIRECTORY }/${ locale }.json`,
					`"${ key }" uses {{${ word }:…}}, which does not work in static page content`
				)
			}
		}
	}
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

/**
 * Deletes every previously generated page.
 *
 * @param {string} contentRoot - Absolute content directory.
 * @returns {Promise<number>} Files removed.
 */
async function wipeGeneratedPages( contentRoot ) {
	let removed = 0
	for ( const file of await walkFiles( contentRoot, '.md' ) ) {
		const { data } = parseFrontmatter( await fs.readFile( file, 'utf-8' ) )
		if ( data[ CONTENT_I18N_GENERATED_MARKER ] === true ) {
			await fs.unlink( file )
			removed++
		}
	}
	return removed
}

/**
 * Runs the generator.
 *
 * @returns {Promise<void>}
 */
async function main() {
	const argv = process.argv.slice( 2 )
	const extractOnly = argv.includes( '--extract-only' )
	const generateOnly = argv.includes( '--generate-only' )
	if ( extractOnly && generateOnly ) {
		console.error( '--extract-only and --generate-only are mutually exclusive' )
		process.exit( 1 )
	}

	const baseRoot = join( projectRoot, CONTENT_I18N_BASE_DIRECTORY )
	const messageRoot = join( projectRoot, CONTENT_I18N_MESSAGE_DIRECTORY )
	const contentRoot = join( projectRoot, CONTENT_I18N_OUTPUT_DIRECTORY )

	// ---- parse every base file -------------------------------------------
	const baseFiles = []
	for ( const absolutePath of await walkFiles( baseRoot, '.md' ) ) {
		const relativePath = relative( baseRoot, absolutePath ).split( '\\' ).join( '/' )
		baseFiles.push( parseBaseFile( relativePath, await fs.readFile( absolutePath, 'utf-8' ) ) )
	}
	if ( baseFiles.length === 0 ) {
		console.error( `No base files found under ${ CONTENT_I18N_BASE_DIRECTORY }/` )
		process.exit( 1 )
	}

	// ---- collect definitions, one per key --------------------------------
	const definitions = new Map()
	for ( const baseFile of baseFiles ) {
		for ( const marker of baseFile.markers ) {
			if ( marker.kind !== 'definition' || !marker.key ) {
				continue
			}
			const existing = definitions.get( marker.key )
			if ( existing ) {
				fail(
					marker.location,
					`"${ marker.key }" is already defined at ${ existing.location }; ` +
					'a key may be defined exactly once — use a reference instead'
				)
				continue
			}
			definitions.set( marker.key, marker )
			if ( !marker.qqq ) {
				warn( marker.location, `"${ marker.key }" has no qqq documentation` )
			}
		}
	}

	// ---- every reference must resolve ------------------------------------
	for ( const baseFile of baseFiles ) {
		for ( const marker of baseFile.markers ) {
			if ( marker.key && !definitions.has( marker.key ) ) {
				fail( marker.location, `reference to undefined key "${ marker.key }"` )
			}
			if ( marker.context.attributeDelimiter && marker.key ) {
				const definition = definitions.get( marker.key )
				if ( definition && /\[[^\]]*\]\(|[*_`]/.test( definition.text ?? '' ) ) {
					warn(
						marker.location,
						`"${ marker.key }" contains Markdown but is used in an attribute value, ` +
						'where it will render inert'
					)
				}
			}
		}
	}

	if ( errors.length ) {
		report()
		process.exit( 1 )
	}

	// ---- extract ---------------------------------------------------------
	const englishMessages = new Map()
	const qqqMessages = new Map()
	for ( const [ key, definition ] of definitions ) {
		englishMessages.set( key, definition.text )
		if ( definition.qqq ) {
			qqqMessages.set( key, definition.qqq )
		}
	}

	if ( !generateOnly ) {
		await fs.mkdir( messageRoot, { recursive: true } )
		await fs.writeFile(
			join( messageRoot, `${ CONTENT_I18N_SOURCE_LOCALE }.json` ),
			serializeMessageFile( englishMessages ),
			'utf-8'
		)
		await fs.writeFile(
			join( messageRoot, 'qqq.json' ),
			serializeMessageFile( qqqMessages ),
			'utf-8'
		)
		console.log(
			`✓ extracted ${ englishMessages.size } messages → ` +
			`${ CONTENT_I18N_MESSAGE_DIRECTORY }/{${ CONTENT_I18N_SOURCE_LOCALE },qqq}.json`
		)
	}

	if ( extractOnly ) {
		report()
		return
	}

	// ---- read translations ------------------------------------------------
	const byLocale = { [ CONTENT_I18N_SOURCE_LOCALE ]: Object.fromEntries( englishMessages ) }
	const translatedLocales = []
	for ( const absolutePath of await walkFiles( messageRoot, '.json' ) ) {
		const locale = relative( messageRoot, absolutePath ).replace( /\.json$/, '' )
		if ( locale === 'qqq' || locale === CONTENT_I18N_SOURCE_LOCALE ) {
			continue
		}
		const messages = await readMessageFile( absolutePath )
		byLocale[ locale ] = messages
		translatedLocales.push( locale )
		warnOnDiscouragedMagicWords( locale, messages )
		for ( const key of Object.keys( messages ) ) {
			if ( !definitions.has( key ) ) {
				warn(
					`${ CONTENT_I18N_MESSAGE_DIRECTORY }/${ locale }.json`,
					`"${ key }" is not defined by any base file (orphaned translation, ` +
					'likely a renamed key) — left untouched'
				)
			}
		}
	}

	// ---- plan output ------------------------------------------------------
	const planned = []
	const skipped = []
	for ( const baseFile of baseFiles ) {
		if ( baseFile.definitionsOnly ) {
			continue
		}
		const usedKeys = [ ...new Set( baseFile.markers.map( ( marker ) => marker.key ) ) ]
		for ( const locale of [ CONTENT_I18N_SOURCE_LOCALE, ...translatedLocales ] ) {
			if ( locale !== CONTENT_I18N_SOURCE_LOCALE ) {
				const own = byLocale[ locale ]
				const present = usedKeys.filter( ( key ) => own[ key ] !== undefined ).length
				const percent = usedKeys.length ? ( present / usedKeys.length ) * 100 : 100
				if ( percent < CONTENT_I18N_MIN_TRANSLATED_PERCENT ) {
					skipped.push(
						`${ locale }/${ baseFile.relativePath } — ${ percent.toFixed( 0 ) }% ` +
						`translated, below the ${ CONTENT_I18N_MIN_TRANSLATED_PERCENT }% threshold`
					)
					continue
				}
			}
			const banana = new Banana( locale, { messages: mergedMessagesFor( locale, byLocale ) } )
			const body = renderTemplate( baseFile.template, banana )
			const outputPath = join( contentRoot, locale, baseFile.relativePath )
			const displayPath = repositoryPath( outputPath )
			validateRendered( displayPath, body )
			planned.push( {
				outputPath,
				displayPath,
				content: serializeDocument(
					{
						...baseFile.frontmatter,
						[ CONTENT_I18N_GENERATED_MARKER ]: true,
						sourceFile: `${ CONTENT_I18N_BASE_DIRECTORY }/${ baseFile.relativePath }`
					},
					body
				)
			} )
		}
	}

	// ---- refuse to clobber anything we do not own -------------------------
	for ( const { outputPath, displayPath } of planned ) {
		let existing
		try {
			existing = await fs.readFile( outputPath, 'utf-8' )
		} catch {
			continue
		}
		const { data } = parseFrontmatter( existing )
		if ( data[ CONTENT_I18N_GENERATED_MARKER ] === true ) {
			continue
		}
		fail(
			displayPath,
			data.remoteImport === true ?
				'already exists as imported content (remoteImport: true) — a path is owned by ' +
				'exactly one generator' :
				'already exists as hand-authored content — refusing to overwrite it'
		)
	}

	if ( errors.length ) {
		report()
		process.exit( 1 )
	}

	// ---- wipe, then write -------------------------------------------------
	const removed = await wipeGeneratedPages( contentRoot )
	if ( removed ) {
		console.log( `✓ removed ${ removed } previously generated page(s)` )
	}
	for ( const { outputPath, displayPath, content } of planned ) {
		await fs.mkdir( dirname( outputPath ), { recursive: true } )
		await fs.writeFile( outputPath, content, 'utf-8' )
		console.log( `✓ ${ displayPath }` )
	}
	for ( const message of skipped ) {
		console.log( `· skipped ${ message }` )
	}
	report()
}

/**
 * Prints collected warnings and errors.
 *
 * @returns {void}
 */
function report() {
	for ( const message of warnings ) {
		console.warn( `⚠ ${ message }` )
	}
	for ( const message of errors ) {
		console.error( `✗ ${ message }` )
	}
	if ( errors.length ) {
		console.error( `\n${ errors.length } error(s); nothing was written.` )
	}
}

main().catch( ( error ) => {
	console.error( error )
	process.exit( 1 )
} )
