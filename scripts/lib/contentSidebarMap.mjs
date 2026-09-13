/**
 * Builds the route-path → `sidebar` frontmatter map that the sidebar route
 * middleware reads, from the markdown under `content/`.
 *
 * `modules/content-sidebar-map.mjs` calls this to write the map into the build;
 * `tests/contentSidebarMap.test.mjs` calls it to exercise the lookup against the
 * real content tree.
 *
 * Markdown only. The `content` collection's source is `**`, so a non-markdown
 * page would be routable and simply absent here — nothing under content/ is
 * anything but `.md` today.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'

import { parseFrontmatter } from './markdownFrontmatter.mjs'

/**
 * A path segment Nuxt Content serves under its own name.
 *
 * Nuxt slugifies each segment of a file stem into the route path, and also
 * strips ordering prefixes (`1.intro.md`) and a `.draft` suffix. We key the map
 * on the file path instead of reimplementing any of that, which holds only for
 * names that survive slugification unchanged. Anything else would produce a key
 * no route ever looks up, so the generator refuses to write it.
 */
const SLUG_SAFE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Walks a content directory for markdown files, skipping `_`-prefixed partial
 * directories the way Nuxt Content does.
 *
 * @param {string} directory - Directory to walk.
 * @param {string[]} parentSegments - Path segments already walked into.
 * @yields {{ filePath: string, relativePath: string, segments: string[] }} One markdown file.
 */
function* walkMarkdownFiles( directory, parentSegments = [] ) {
	const entries = readdirSync( directory, { withFileTypes: true } )
		.sort( ( a, b ) => a.name.localeCompare( b.name ) )

	for ( const entry of entries ) {
		if ( entry.name.startsWith( '_' ) ) {
			continue
		}

		if ( entry.isDirectory() ) {
			yield* walkMarkdownFiles( join( directory, entry.name ), [ ...parentSegments, entry.name ] )
			continue
		}

		if ( !entry.name.endsWith( '.md' ) ) {
			continue
		}

		yield {
			filePath: join( directory, entry.name ),
			relativePath: [ ...parentSegments, entry.name ].join( '/' ),
			segments: [ ...parentSegments, basename( entry.name, '.md' ) ]
		}
	}
}

/**
 * Builds the route path a file's segments are served at.
 *
 * @param {string[]} segments - File stem split on `/`.
 * @returns {string} Route path with a leading slash (`[ 'en', 'index' ]` → `/en`).
 */
function contentPathFromSegments( segments ) {
	const routeSegments = segments.at( -1 ) === 'index' ? segments.slice( 0, -1 ) : segments
	return `/${ routeSegments.join( '/' ) }`
}

/**
 * Reads a markdown file's `sidebar` frontmatter.
 *
 * @param {{ filePath: string, relativePath: string }} file - A walked markdown file.
 * @returns {boolean|string|null} The declared value, or `null` when the page declares none.
 * @throws {Error} When the value is not the `boolean | string` content.config.ts allows.
 */
function readSidebarFrontmatter( file ) {
	const { data } = parseFrontmatter( readFileSync( file.filePath, 'utf-8' ) )
	const sidebar = data.sidebar

	if ( sidebar === undefined || sidebar === null ) {
		return null
	}

	if ( typeof sidebar !== 'boolean' && typeof sidebar !== 'string' ) {
		throw new Error(
			`${ file.relativePath }: sidebar is ${ JSON.stringify( sidebar ) }, which ` +
			'content.config.ts does not allow. Use false, true, or a section-menu id.'
		)
	}

	return sidebar
}

/**
 * Builds the full map from a content directory.
 *
 * Every page is recorded, not just the ones declaring `sidebar`: the middleware
 * walks a locale fallback chain and has to stop at the first locale that has the
 * page, whether or not that page states a preference.
 *
 * @param {string} contentDirectory - Path to `content/`.
 * @returns {Record<string, boolean|string|null>} Route path to `sidebar` value, key-sorted.
 * @throws {Error} On a filename Nuxt would slugify, or two files sharing a route path.
 */
export function buildContentSidebarMap( contentDirectory ) {
	const map = {}
	const sourceFiles = {}

	for ( const file of walkMarkdownFiles( contentDirectory ) ) {
		const unslugSafeSegment = file.segments.find( ( segment ) => !SLUG_SAFE_SEGMENT.test( segment ) )
		if ( unslugSafeSegment ) {
			throw new Error(
				`${ file.relativePath }: "${ unslugSafeSegment }" is not a lower-case-hyphenated name, so ` +
				'Nuxt Content would serve it at a different path than this map would record. ' +
				'Rename the file, or teach scripts/lib/contentSidebarMap.mjs that spelling.'
			)
		}

		const contentPath = contentPathFromSegments( file.segments )
		if ( Object.hasOwn( map, contentPath ) ) {
			throw new Error(
				`${ file.relativePath } and ${ sourceFiles[ contentPath ] } are both served at ${ contentPath }`
			)
		}

		map[ contentPath ] = readSidebarFrontmatter( file )
		sourceFiles[ contentPath ] = file.relativePath
	}

	return Object.fromEntries(
		Object.entries( map ).sort( ( [ a ], [ b ] ) => a.localeCompare( b ) )
	)
}

/**
 * Serializes a map into the TypeScript module written to the build directory.
 *
 * @param {Record<string, boolean|string|null>} map - Route path to `sidebar` value.
 * @returns {string} Module source.
 */
export function serializeContentSidebarMap( map ) {
	return [
		'// Written by modules/content-sidebar-map.mjs from the frontmatter under',
		'// content/, and rewritten whenever that frontmatter changes. Not committed:',
		'// the markdown is the source of truth and this is a build artifact of it.',
		'',
		'/** Route path to `sidebar` frontmatter; null where a page declares none. */',
		`export const CONTENT_SIDEBAR_MAP: Record<string, boolean | string | null> = ${
			JSON.stringify( map, null, '\t' )
		}\n`
	].join( '\n' )
}
