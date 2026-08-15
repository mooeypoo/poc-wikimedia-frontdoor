/**
 * File discovery and output path templating.
 */

import { glob } from 'node:fs/promises'
import { basename, dirname, extname } from 'node:path'

/**
 * Lists source files, sorted for deterministic output.
 *
 * @param {object} options - Discovery options.
 * @param {string} options.dir - Source root.
 * @param {string[]} options.include - Globs relative to the root.
 * @param {string[]} options.exclude - Globs to skip.
 * @returns {Promise<string[]>} Paths relative to the root, with forward slashes.
 */
export async function findSources( { dir, include, exclude } ) {
	const found = new Set()
	for ( const pattern of include ) {
		for await ( const entry of glob( pattern, { cwd: dir, exclude } ) ) {
			found.add( entry.split( '\\' ).join( '/' ) )
		}
	}
	return [ ...found ].sort()
}

/**
 * Lists every file under a directory, sorted.
 *
 * Used to find previously generated output. Deliberately unfiltered by
 * extension: output can be any format, so narrowing by extension would miss
 * files this tool wrote.
 *
 * @param {string} dir - Directory to walk.
 * @returns {Promise<string[]>} Paths relative to the directory.
 */
export async function findAll( dir ) {
	const found = []
	try {
		for await ( const entry of glob( '**/*', { cwd: dir, withFileTypes: true } ) ) {
			if ( entry.isFile() ) {
				const relative = `${ entry.parentPath }/${ entry.name }`
					.slice( dir.length + 1 )
					.split( '\\' )
					.join( '/' )
				found.push( relative )
			}
		}
	} catch {
		return []
	}
	return found.sort()
}

/**
 * Expands an output path template.
 *
 * Empty segments are collapsed, so a template like `%dir%/%name%%ext%` still
 * works for a file sitting at the source root, where `%dir%` is empty.
 *
 * @param {string|Function} template - Template string, or a function.
 * @param {string} relativePath - Source path relative to the source root.
 * @param {string} locale - Target locale.
 * @returns {string} Output path relative to the output root.
 */
export function applyPathTemplate( template, relativePath, locale ) {
	if ( typeof template === 'function' ) {
		const extension = extname( relativePath )
		const directory = dirname( relativePath )
		return template( {
			path: relativePath,
			dir: directory === '.' ? '' : directory,
			name: basename( relativePath, extension ),
			ext: extension
		}, locale )
	}

	const extension = extname( relativePath )
	const directory = dirname( relativePath )
	return template
		.replaceAll( '%locale%', locale )
		.replaceAll( '%path%', relativePath )
		.replaceAll( '%dir%', directory === '.' ? '' : directory )
		.replaceAll( '%name%', basename( relativePath, extension ) )
		.replaceAll( '%ext%', extension )
		.split( '/' )
		.filter( Boolean )
		.join( '/' )
}

/**
 * Simple glob matching for the definitions-only test.
 *
 * Supports `**`, `*`, and `?`. Kept in-house rather than taken as a dependency
 * because this is the only place matching is needed outside `fs.glob`.
 *
 * @param {string} path - Path relative to the source root.
 * @param {string[]} patterns - Glob patterns.
 * @returns {boolean} Whether any pattern matches.
 */
export function matchesAny( path, patterns ) {
	return patterns.some( ( pattern ) => {
		const expression = pattern
			.split( /(\*\*\/|\*\*|\*|\?)/ )
			.map( ( piece ) => {
				if ( piece === '**/' ) {
					return '(?:.*/)?'
				}
				if ( piece === '**' ) {
					return '.*'
				}
				if ( piece === '*' ) {
					return '[^/]*'
				}
				if ( piece === '?' ) {
					return '[^/]'
				}
				return piece.replace( /[.+^${}()|[\]\\]/g, '\\$&' )
			} )
			.join( '' )
		return new RegExp( `^${ expression }$` ).test( path )
	} )
}
