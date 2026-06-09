#!/usr/bin/env node

/**
 * Fetches remote content sources at build time and writes them to the
 * content directory before the Nuxt build runs.
 *
 * Reads from config/remoteContentSources.ts and processes each source
 * according to its strategy. Phase 1 supports 'markdown-url' strategy only.
 *
 * Exit code: always 0 (never fails the build).
 * Build failures from unreachable sources are mitigated via stale file fallback
 * and empty placeholder files. Always check stderr for warnings.
 *
 * Usage:
 *   node scripts/fetch-remote-content.mjs
 *
 * Integrate into build pipeline:
 *   "generate": "npm run fetch-remote-content && nuxt generate"
 *   "build:netlify": "... && npm run fetch-remote-content && nuxt build"
 */

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { promises as fs } from 'node:fs'
import { REMOTE_CONTENT_SOURCES } from '../config/remoteContentSources.ts'

const __filename = fileURLToPath( import.meta.url )
const __dirname = dirname( __filename )
const projectRoot = dirname( dirname( __filename ) )

/**
 * Fetches a remote URL and returns the response text.
 *
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} The response text
 * @throws {Error} If the fetch fails
 */
async function fetchRemoteContent( url ) {
	const response = await fetch( url )
	if ( !response.ok ) {
		throw new Error(
			`HTTP ${ response.status }: ${ response.statusText }`
		)
	}
	return response.text()
}

/**
 * Merges frontmatter fields into raw Markdown content.
 *
 * If the content starts with YAML frontmatter (--- delimiter), merges the
 * override fields on top. If no frontmatter exists, prepends a new block.
 *
 * @param {string} content - Raw Markdown content
 * @param {Record<string, unknown>} overrideFrontmatter - Fields to merge/override
 * @returns {string} Markdown with merged frontmatter
 */
function mergeFrontmatter( content, overrideFrontmatter ) {
	if ( !overrideFrontmatter || Object.keys( overrideFrontmatter ).length === 0 ) {
		return content
	}

	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/
	const match = content.match( frontmatterRegex )

	let frontmatterLines = []
	let bodyStart = 0

	if ( match ) {
		// Parse existing YAML frontmatter (simple key: value parsing)
		const yamlContent = match[ 1 ]
		frontmatterLines = yamlContent.split( '\n' ).filter( line => line.trim() )
		bodyStart = match[ 0 ].length
	}

	// Build merged frontmatter as YAML
	const mergedYaml = {}

	// Parse existing frontmatter into object
	for ( const line of frontmatterLines ) {
		const colonIndex = line.indexOf( ':' )
		if ( colonIndex > 0 ) {
			const key = line.substring( 0, colonIndex ).trim()
			const value = line.substring( colonIndex + 1 ).trim()
			// Simple YAML value parsing; more complex types (arrays, objects) are preserved as strings
			mergedYaml[ key ] = value.startsWith( '"' ) && value.endsWith( '"' )
				? value.slice( 1, -1 )
				: value
		}
	}

	// Merge overrides
	Object.assign( mergedYaml, overrideFrontmatter )

	// Serialize back to YAML
	const yamlLines = Object.entries( mergedYaml )
		.map( ( [ key, value ] ) => {
			const serialized = typeof value === 'string' && value.includes( ' ' )
				? `"${ value }"`
				: value
			return `${ key }: ${ serialized }`
		} )

	const newFrontmatter = `---\n${ yamlLines.join( '\n' ) }\n---\n`
	const body = bodyStart > 0 ? content.substring( bodyStart ) : content

	return newFrontmatter + body
}

/**
 * Creates an empty placeholder Markdown page.
 *
 * @param {string} [title='Content unavailable'] - Page title to use
 * @returns {string} Minimal Markdown page
 */
function createEmptyPlaceholder( title = 'Content unavailable' ) {
	return `---\ntitle: "${title}"\n---\n\nThis page's content could not be fetched at build time.\n`
}

/**
 * Ensures a directory exists, creating it recursively if needed.
 *
 * @param {string} dir - Directory path
 * @returns {Promise<void>}
 */
async function ensureDir( dir ) {
	await fs.mkdir( dir, { recursive: true } )
}

/**
 * Checks if a file exists on disk.
 *
 * @param {string} filePath - File path to check
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists( filePath ) {
	try {
		await fs.access( filePath )
		return true
	} catch {
		return false
	}
}

/**
 * Processes a single remote content source.
 *
 * @param {RemoteContentSource} source - The source to fetch
 * @returns {Promise<{status: 'success' | 'stale' | 'placeholder', message: string}>}
 */
async function processSource( source ) {
	const locale = source.locale ?? 'en'
	const contentDir = join( projectRoot, 'content', locale )
	const filePath = join( contentDir, `${ source.localPath }.md` )

	try {
		// Ensure directory exists
		await ensureDir( contentDir )

		// Fetch remote content
		let content = await fetchRemoteContent( source.remoteUrl )

		// Merge frontmatter if overrides are provided
		if ( source.overrideFrontmatter ) {
			content = mergeFrontmatter( content, source.overrideFrontmatter )
		}

		// Write to disk
		await fs.writeFile( filePath, content, 'utf-8' )

		return {
			status: 'success',
			message: `✓ ${ source.id } → ${ locale }/${ source.localPath }.md`
		}
	} catch ( error ) {
		// Fetch failed; try stale fallback
		const staleExists = await fileExists( filePath )

		if ( staleExists ) {
			console.warn(
				`⚠ ${ source.id }: fetch failed (${ error.message }), using stale file at ${ filePath }`
			)
			return {
				status: 'stale',
				message: `⚠ ${ source.id } (stale)`
			}
		}

		// No stale file; create empty placeholder
		const title = source.overrideFrontmatter?.title ?? source.id
		const placeholder = createEmptyPlaceholder( String( title ) )
		await fs.writeFile( filePath, placeholder, 'utf-8' )

		console.warn(
			`⚠ ${ source.id }: fetch failed (${ error.message }), created empty placeholder at ${ filePath }`
		)

		return {
			status: 'placeholder',
			message: `⚠ ${ source.id } (empty placeholder)`
		}
	}
}

/**
 * Main entrypoint.
 *
 * @returns {Promise<void>}
 */
async function main() {
	if ( REMOTE_CONTENT_SOURCES.length === 0 ) {
		console.log( '[fetch-remote-content] no remote content sources configured' )
		return
	}

	const results = await Promise.all(
		REMOTE_CONTENT_SOURCES
			.filter( source => source.strategy === 'markdown-url' )
			.map( processSource )
	)

	const success = results.filter( r => r.status === 'success' ).length
	const stale = results.filter( r => r.status === 'stale' ).length
	const placeholder = results.filter( r => r.status === 'placeholder' ).length

	results.forEach( result => {
		if ( result.status === 'success' ) {
			console.log( result.message )
		} else {
			console.warn( result.message )
		}
	} )

	console.log(
		`[fetch-remote-content] wrote ${ success } files, used stale ${ stale }, empty placeholder ${ placeholder }`
	)
}

main().catch( error => {
	console.error( '[fetch-remote-content] fatal error:', error.message )
	process.exit( 1 )
} )
