/**
 * Which output files this tool owns.
 *
 * Ownership is the union of two independent records: a manifest listing what
 * was written, and a marker stamped into each generated file's metadata. Each
 * covers the other's failure — a deleted manifest, or a hand-stripped marker —
 * and the wipe pass deletes the union.
 *
 * The union matters because generated files may be interleaved with
 * hand-authored ones in the same directory. Owning a whole subtree would be
 * simpler, but is not available when the two live side by side.
 */

import { readFile, writeFile, unlink, mkdir, rmdir } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { findAll } from './files.js'

/**
 * Reads the manifest, tolerating its absence.
 *
 * @param {string|false} path - Manifest path, or false when disabled.
 * @returns {Promise<string[]>} Output-relative paths previously written.
 */
export async function readManifest( path ) {
	if ( !path ) {
		return []
	}
	try {
		const parsed = JSON.parse( await readFile( path, 'utf-8' ) )
		return Array.isArray( parsed.files ) ? parsed.files : []
	} catch {
		return []
	}
}

/**
 * Writes the manifest.
 *
 * @param {string|false} path - Manifest path, or false when disabled.
 * @param {string[]} files - Output-relative paths, unsorted.
 * @param {string} note - Explanatory note for a human reading the file.
 * @returns {Promise<void>}
 */
export async function writeManifest( path, files, note ) {
	if ( !path ) {
		return
	}
	await mkdir( dirname( path ), { recursive: true } )
	await writeFile(
		path,
		JSON.stringify( { note, files: [ ...files ].sort() }, null, 2 ) + '\n',
		'utf-8'
	)
}

/**
 * Finds files under the output root carrying the generated marker.
 *
 * Requires a format with an envelope; formats without one have nowhere to put a
 * marker, and rely on the manifest alone.
 *
 * @param {object} options - Search options.
 * @param {string} options.dir - Output root.
 * @param {object|null} options.envelope - Format envelope.
 * @param {string|false} options.markerField - Metadata field to look for.
 * @returns {Promise<string[]>} Output-relative paths.
 */
export async function findMarked( { dir, envelope, markerField } ) {
	if ( !envelope || !markerField ) {
		return []
	}
	const marked = []
	for ( const relativePath of await findAll( dir ) ) {
		let text
		try {
			text = await readFile( join( dir, relativePath ), 'utf-8' )
		} catch {
			continue
		}
		let metadata
		try {
			( { metadata } = envelope.parse( text ) )
		} catch {
			continue
		}
		if ( metadata?.[ markerField ] === true ) {
			marked.push( relativePath )
		}
	}
	return marked
}

/**
 * The full set of files this tool owns: manifest entries plus marked files.
 *
 * @param {object} options - Search options.
 * @param {string} options.dir - Output root.
 * @param {string|false} options.manifestPath - Manifest path.
 * @param {object|null} options.envelope - Format envelope.
 * @param {string|false} options.markerField - Metadata field.
 * @returns {Promise<Set<string>>} Output-relative paths.
 */
export async function findOwned( { dir, manifestPath, envelope, markerField } ) {
	const [ manifest, marked ] = await Promise.all( [
		readManifest( manifestPath ),
		findMarked( { dir, envelope, markerField } )
	] )
	return new Set( [ ...manifest, ...marked ] )
}

/**
 * Removes directories left empty by a wipe, deepest first.
 *
 * A locale that loses its last translation should leave no trace. Directories
 * that still hold anything — hand-authored files living alongside generated
 * ones — fail the rmdir and are left exactly as they were.
 *
 * @param {string} root - Output root, never itself removed.
 * @param {string[]} removedPaths - Output-relative paths just deleted.
 * @returns {Promise<void>}
 */
export async function pruneEmptyDirectories( root, removedPaths ) {
	const directories = new Set()
	for ( const relativePath of removedPaths ) {
		let directory = dirname( relativePath )
		while ( directory && directory !== '.' && directory !== '/' ) {
			directories.add( directory )
			directory = dirname( directory )
		}
	}
	// Deepest first, so a parent is only attempted once its children are gone.
	const deepestFirst = [ ...directories ].sort(
		( a, b ) => b.split( '/' ).length - a.split( '/' ).length
	)
	for ( const directory of deepestFirst ) {
		try {
			await rmdir( join( root, directory ) )
		} catch {
			// Not empty, or already gone. Both are fine.
		}
	}
}

/**
 * Deletes owned files, tolerating ones already gone, then prunes directories
 * the deletion emptied.
 *
 * @param {string} dir - Output root.
 * @param {Set<string>|string[]} owned - Output-relative paths.
 * @returns {Promise<number>} Files actually removed.
 */
export async function wipe( dir, owned ) {
	const removedPaths = []
	for ( const relativePath of owned ) {
		try {
			await unlink( join( dir, relativePath ) )
			removedPaths.push( relativePath )
		} catch {
			// Already gone: the manifest and the marker overlap by design.
		}
	}
	await pruneEmptyDirectories( dir, removedPaths )
	return removedPaths.length
}

/**
 * Reports planned outputs that would overwrite a file this tool does not own.
 *
 * The failure mode this prevents is silent and destructive: a source file whose
 * output path collides with hand-authored content would otherwise have that
 * content deleted by the next wipe pass.
 *
 * @param {object} options - Guard options.
 * @param {string} options.dir - Output root.
 * @param {string[]} options.planned - Planned output-relative paths.
 * @param {Set<string>} options.owned - Paths this tool owns.
 * @param {object|null} options.envelope - Format envelope, for a better message.
 * @returns {Promise<{ path: string, reason: string }[]>} Collisions.
 */
export async function findCollisions( { dir, planned, owned, envelope } ) {
	const collisions = []
	for ( const relativePath of planned ) {
		if ( owned.has( relativePath ) ) {
			continue
		}
		let text
		try {
			text = await readFile( join( dir, relativePath ), 'utf-8' )
		} catch {
			continue
		}
		let reason = 'already exists and is not owned by this tool — refusing to overwrite it'
		if ( envelope ) {
			try {
				const { metadata } = envelope.parse( text )
				if ( metadata?.remoteImport === true ) {
					reason =
						'already exists as imported content (remoteImport: true) — a path is owned ' +
						'by exactly one generator'
				}
			} catch {
				// Unparseable metadata does not change the verdict.
			}
		}
		collisions.push( { path: relativePath, reason } )
	}
	return collisions
}

/**
 * Output-relative path for an absolute one.
 *
 * @param {string} dir - Output root.
 * @param {string} absolutePath - Absolute path.
 * @returns {string}
 */
export function toOutputRelative( dir, absolutePath ) {
	return relative( dir, absolutePath ).split( '\\' ).join( '/' )
}
