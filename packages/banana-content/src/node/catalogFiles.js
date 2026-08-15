/**
 * Reading and writing banana message catalogues.
 *
 * Exactly two files here are written: the source-language catalogue and the
 * documentation catalogue. Every other `<locale>.json` belongs to translators
 * and is only ever read.
 */

import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { basename, join } from 'node:path'

/**
 * Serializes a catalogue: `@metadata` first, then keys sorted for a stable diff.
 *
 * No wall-clock field is written, so an unchanged input regenerates
 * byte-identically and a real diff always means a real change.
 *
 * @param {Map<string, string>} entries - Key to value.
 * @param {string} note - Text for the `@metadata` note.
 * @param {number|string} indent - JSON indentation.
 * @returns {string}
 */
export function serializeCatalog( entries, note, indent ) {
	const sorted = [ ...entries.entries() ].sort( ( a, b ) => ( a[ 0 ] < b[ 0 ] ? -1 : 1 ) )
	return JSON.stringify(
		{ '@metadata': { note }, ...Object.fromEntries( sorted ) },
		null,
		indent
	) + '\n'
}

/**
 * Reads a catalogue, dropping `@metadata` and any other reserved key.
 *
 * @param {string} path - File to read.
 * @returns {Promise<Record<string, string>>}
 */
export async function readCatalog( path ) {
	const parsed = JSON.parse( await readFile( path, 'utf-8' ) )
	const messages = {}
	for ( const [ key, value ] of Object.entries( parsed ) ) {
		if ( !key.startsWith( '@' ) && typeof value === 'string' ) {
			messages[ key ] = value
		}
	}
	return messages
}

/**
 * Reads every translator-owned catalogue in a directory.
 *
 * The set of locales this returns IS the set of locales that will be generated.
 * There is no configured list: adding a translation is the whole act of adding
 * a locale.
 *
 * @param {object} options - Read options.
 * @param {string} options.dir - Catalogue directory.
 * @param {string} options.sourceLocale - Locale whose catalogue is generated.
 * @param {string} options.documentationLocale - Documentation catalogue name.
 * @returns {Promise<Record<string, Record<string, string>>>} Messages by locale.
 */
export async function readTranslations( { dir, sourceLocale, documentationLocale } ) {
	let entries
	try {
		entries = await readdir( dir )
	} catch {
		return {}
	}
	const byLocale = {}
	for ( const entry of entries.sort() ) {
		if ( !entry.endsWith( '.json' ) ) {
			continue
		}
		const locale = basename( entry, '.json' )
		if ( locale === sourceLocale || locale === documentationLocale ) {
			continue
		}
		byLocale[ locale ] = await readCatalog( join( dir, entry ) )
	}
	return byLocale
}

/**
 * Writes the two generated catalogues.
 *
 * @param {object} options - Write options.
 * @param {string} options.dir - Catalogue directory.
 * @param {string} options.sourceLocale - Source locale filename.
 * @param {string} options.documentationLocale - Documentation filename.
 * @param {Map<string, string>} options.messages - Source-language messages.
 * @param {Map<string, string>} options.documentation - Translator documentation.
 * @param {string} options.note - `@metadata` note.
 * @param {number|string} options.indent - JSON indentation.
 * @returns {Promise<string[]>} Paths written.
 */
export async function writeCatalogs( options ) {
	const {
		dir, sourceLocale, documentationLocale, messages, documentation, note, indent
	} = options
	await mkdir( dir, { recursive: true } )
	const sourcePath = join( dir, `${ sourceLocale }.json` )
	const documentationPath = join( dir, `${ documentationLocale }.json` )
	await writeFile( sourcePath, serializeCatalog( messages, note, indent ), 'utf-8' )
	await writeFile(
		documentationPath, serializeCatalog( documentation, note, indent ), 'utf-8'
	)
	return [ sourcePath, documentationPath ]
}
