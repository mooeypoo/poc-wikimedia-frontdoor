#!/usr/bin/env node

/**
 * Fetches remote content sources at build time and writes them to the
 * content directory before the Nuxt build runs.
 *
 * Reads from config/remoteContentSources.ts and processes each source
 * according to its strategy:
 *   - 'markdown-url'              — fetch raw Markdown from a URL
 *   - 'mediawiki-translated-page' — fetch a MediaWiki page + its translation
 *                                   subpages (Parsoid HTML → Markdown), one file
 *                                   per locale (docs/adr-remote-content-fetching.md §9)
 *
 * Exit code: always 0 (never fails the build). Fetch failures are mitigated per
 * file via stale-copy fallback and empty placeholders. Always check stderr for
 * warnings.
 *
 * Usage:
 *   node scripts/fetch-remote-content.mjs
 */

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { promises as fs } from 'node:fs'
import YAML from 'yaml'
import { REMOTE_CONTENT_SOURCES } from '../config/remoteContentSources.ts'
import { convertWikiHtmlToMarkdown } from './lib/wikiContentConversion.mjs'

const __filename = fileURLToPath( import.meta.url )
const projectRoot = dirname( dirname( __filename ) )

/**
 * Descriptive User-Agent, required by Wikimedia API etiquette.
 * @see https://meta.wikimedia.org/wiki/User-Agent_policy
 */
const USER_AGENT =
	'WikimediaDeveloperPortal-content-fetcher/1.0 ' +
	'(https://gitlab.wikimedia.org/repos/wikimedia/frontdoor; developer portal build tooling)'

/** Max concurrent per-locale fetches for a single wiki source. */
const FETCH_CONCURRENCY = 6

/**
 * Fetches a URL as text with the required User-Agent, retrying once on 429.
 *
 * @param {string} url - URL to fetch.
 * @returns {Promise<{ text: string, response: Response }>}
 * @throws {Error} On non-OK HTTP status.
 */
async function fetchText( url ) {
	let response = await fetch( url, { headers: { 'User-Agent': USER_AGENT } } )
	if ( response.status === 429 ) {
		const retryAfter = Number( response.headers.get( 'retry-after' ) ) || 2
		await new Promise( ( resolve ) => setTimeout( resolve, retryAfter * 1000 ) )
		response = await fetch( url, { headers: { 'User-Agent': USER_AGENT } } )
	}
	if ( !response.ok ) {
		throw new Error( `HTTP ${ response.status }: ${ response.statusText }` )
	}
	return { text: await response.text(), response }
}

/**
 * Fetches a URL as JSON with the required User-Agent.
 *
 * @param {string} url - URL to fetch.
 * @returns {Promise<object>}
 * @throws {Error} On non-OK HTTP status or an API-level error.
 */
async function fetchJson( url ) {
	const { text } = await fetchText( url )
	const json = JSON.parse( text )
	if ( json.error ) {
		throw new Error( `API error ${ json.error.code }: ${ json.error.info }` )
	}
	return json
}

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
	return `---\n${ yaml }\n---\n\n${ body.replace( /^\n+/, '' ) }`
}

/**
 * Merges override fields into a Markdown document's frontmatter using a real
 * YAML parser (nested keys, arrays, and colon-bearing values are preserved).
 *
 * @param {string} content - Raw Markdown.
 * @param {Record<string, unknown>} overrideFrontmatter - Fields to merge on top.
 * @returns {string}
 */
function mergeFrontmatter( content, overrideFrontmatter ) {
	if ( !overrideFrontmatter || Object.keys( overrideFrontmatter ).length === 0 ) {
		return content
	}
	const { data, body } = parseFrontmatter( content )
	return serializeDocument( { ...data, ...overrideFrontmatter }, body )
}

/**
 * Creates an empty placeholder page.
 *
 * @param {string} [title='Content unavailable'] - Page title.
 * @returns {string}
 */
function createEmptyPlaceholder( title = 'Content unavailable' ) {
	return serializeDocument(
		{ title },
		"This page's content could not be fetched at build time.\n"
	)
}

/**
 * Ensures a directory exists.
 *
 * @param {string} dir - Directory path.
 * @returns {Promise<void>}
 */
async function ensureDir( dir ) {
	await fs.mkdir( dir, { recursive: true } )
}

/**
 * Checks whether a file exists.
 *
 * @param {string} filePath - File path.
 * @returns {Promise<boolean>}
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
 * Writes produced content to a file, falling back to a stale copy or an empty
 * placeholder when production fails. Never throws.
 *
 * @param {string} filePath - Destination file.
 * @param {() => Promise<string>} produce - Produces the file content (may throw).
 * @param {{ label: string, placeholderTitle: string }} options
 * @returns {Promise<{ status: 'success'|'stale'|'placeholder', message: string }>}
 */
async function writeOrFallback( filePath, produce, { label, placeholderTitle } ) {
	try {
		const content = await produce()
		await ensureDir( dirname( filePath ) )
		await fs.writeFile( filePath, content, 'utf-8' )
		return { status: 'success', message: `✓ ${ label }` }
	} catch ( error ) {
		if ( await fileExists( filePath ) ) {
			console.warn( `⚠ ${ label }: fetch failed (${ error.message }), using stale ${ filePath }` )
			return { status: 'stale', message: `⚠ ${ label } (stale)` }
		}
		await ensureDir( dirname( filePath ) )
		await fs.writeFile( filePath, createEmptyPlaceholder( placeholderTitle ), 'utf-8' )
		console.warn( `⚠ ${ label }: fetch failed (${ error.message }), wrote empty placeholder` )
		return { status: 'placeholder', message: `⚠ ${ label } (empty placeholder)` }
	}
}

/**
 * Runs an async mapper over items with bounded concurrency.
 *
 * @template T, R
 * @param {T[]} items - Items to process.
 * @param {number} limit - Max concurrent tasks.
 * @param {(item: T) => Promise<R>} mapper - Async mapper.
 * @returns {Promise<R[]>}
 */
async function mapWithConcurrency( items, limit, mapper ) {
	const results = new Array( items.length )
	let cursor = 0
	async function worker() {
		while ( cursor < items.length ) {
			const index = cursor++
			results[ index ] = await mapper( items[ index ] )
		}
	}
	await Promise.all(
		Array.from( { length: Math.min( limit, items.length ) }, () => worker() )
	)
	return results
}

// ---------------------------------------------------------------------------
// Strategy: markdown-url
// ---------------------------------------------------------------------------

/**
 * Processes a 'markdown-url' source.
 *
 * @param {object} source - The source config entry.
 * @returns {Promise<{ status: string, message: string }>}
 */
async function processMarkdownUrlSource( source ) {
	const locale = source.locale ?? 'en'
	const filePath = join( projectRoot, 'content', locale, `${ source.localPath }.md` )
	const label = `${ source.id } → ${ locale }/${ source.localPath }.md`

	return writeOrFallback( filePath, async () => {
		const { text } = await fetchText( source.remoteUrl )
		return source.overrideFrontmatter
			? mergeFrontmatter( text, source.overrideFrontmatter )
			: text
	}, { label, placeholderTitle: String( source.overrideFrontmatter?.title ?? source.id ) } )
}

// ---------------------------------------------------------------------------
// Strategy: mediawiki-translated-page
// ---------------------------------------------------------------------------

/**
 * Discovers the locales a translatable page has been translated into, via the
 * Translate extension's messagegroupstats. English (the source) is always
 * included.
 *
 * @param {object} source - Wiki source config.
 * @returns {Promise<string[]>} Locale codes meeting the completeness threshold.
 */
async function discoverTranslationLocales( source ) {
	const url = new URL( source.wikiApiUrl )
	url.search = new URLSearchParams( {
		action: 'query',
		meta: 'messagegroupstats',
		mgsgroup: `page-${ source.pageTitle }`,
		mgsprop: 'total,translated',
		mgssuppressempty: '1',
		format: 'json',
		formatversion: '2'
	} ).toString()

	const json = await fetchJson( url )
	const stats = json.query?.messagegroupstats ?? []
	const minPercent = source.minTranslatedPercent ?? 1

	const locales = stats
		.filter( ( stat ) => stat.total > 0 && ( stat.translated / stat.total ) * 100 >= minPercent )
		.map( ( stat ) => stat.code )

	if ( !locales.includes( 'en' ) ) {
		locales.unshift( 'en' )
	}
	return locales
}

/**
 * Builds the Parsoid HTML REST endpoint for a page title.
 *
 * @param {string} wikiApiUrl - The wiki's Action API URL.
 * @param {string} title - Full page title (may include a `/lang` subpage).
 * @returns {string}
 */
function parsoidHtmlUrl( wikiApiUrl, title ) {
	const restBase = wikiApiUrl.replace( /\/api\.php.*$/, '/rest.php' )
	return `${ restBase }/v1/page/${ encodeURIComponent( title ) }/html`
}

/**
 * Fetches and converts one locale's translated page to Markdown, including a
 * frontmatter block and a CC BY-SA attribution footer.
 *
 * @param {object} source - Wiki source config.
 * @param {string} origin - Wiki origin (e.g. 'https://www.mediawiki.org').
 * @param {string} locale - Locale code.
 * @returns {Promise<string>} Full Markdown document.
 */
async function fetchAndConvertLocale( source, origin, locale ) {
	// The source language lives at both the bare title and `/en`; other locales
	// live at `/<locale>`. Try the locale subpage first, then the bare title.
	const candidates = locale === 'en'
		? [ `${ source.pageTitle }/en`, source.pageTitle ]
		: [ `${ source.pageTitle }/${ locale }` ]

	let html = null
	let usedTitle = null
	let response = null
	let lastError = null
	for ( const candidate of candidates ) {
		try {
			const result = await fetchText( parsoidHtmlUrl( source.wikiApiUrl, candidate ) )
			html = result.text
			response = result.response
			usedTitle = candidate
			break
		} catch ( error ) {
			lastError = error
		}
	}
	if ( html === null ) {
		throw lastError ?? new Error( 'no page variant found' )
	}

	const body = await convertWikiHtmlToMarkdown( html, { origin } )

	// Provenance for frontmatter + attribution footer.
	const sourceUrl = `${ origin }/wiki/${ usedTitle.replace( / /g, '_' ) }`
	const etag = response.headers.get( 'etag' ) ?? ''
	const revision = /"?(\d+)\//.exec( etag )?.[ 1 ] ?? null
	const sourceWiki = new URL( origin ).host

	const frontmatter = {
		title: source.overrideFrontmatter?.title ?? source.pageTitle,
		...source.overrideFrontmatter,
		sourceUrl,
		sourceWiki,
		...( revision ? { sourceRevision: revision } : {} ),
		...( source.attribution?.license ? { license: source.attribution.license } : {} ),
		fetchedAt: new Date().toISOString()
	}

	const withFooter = source.attribution
		? `${ body }\n${ attributionBlock( {
			sourceUrl,
			sourceTitle: String( frontmatter.title ),
			sourceWiki,
			license: source.attribution.license,
			revision
		} ) }\n`
		: body

	return serializeDocument( frontmatter, withFooter )
}

/**
 * Builds an `::attribution` MDC block for the CC BY-SA footer.
 *
 * @param {{ sourceUrl: string, sourceTitle: string, sourceWiki: string, license: string, revision: string|null }} fields
 * @returns {string}
 */
function attributionBlock( fields ) {
	const attributes = [
		`source-url="${ fields.sourceUrl }"`,
		`source-title="${ fields.sourceTitle.replace( /"/g, '' ) }"`,
		`source-wiki="${ fields.sourceWiki }"`,
		`license="${ fields.license }"`,
		...( fields.revision ? [ `revision="${ fields.revision }"` ] : [] )
	].join( ' ' )
	return `::attribution{${ attributes }}\n::`
}

/**
 * Processes a 'mediawiki-translated-page' source: discovers translations and
 * writes one file per locale, each independently fault-tolerant.
 *
 * @param {object} source - Wiki source config.
 * @returns {Promise<{ status: string, message: string }[]>}
 */
async function processWikiTranslatedSource( source ) {
	const origin = new URL( source.wikiApiUrl ).origin

	let locales
	try {
		locales = await discoverTranslationLocales( source )
	} catch ( error ) {
		console.warn(
			`⚠ ${ source.id }: translation discovery failed (${ error.message }); fetching source (en) only`
		)
		locales = [ 'en' ]
	}

	console.log(
		`[fetch-remote-content] ${ source.id }: ${ locales.length } locale(s) — ${ locales.join( ', ' ) }`
	)

	return mapWithConcurrency( locales, FETCH_CONCURRENCY, ( locale ) => {
		const filePath = join( projectRoot, 'content', locale, `${ source.localPath }.md` )
		const label = `${ source.id } → ${ locale }/${ source.localPath }.md`
		return writeOrFallback(
			filePath,
			() => fetchAndConvertLocale( source, origin, locale ),
			{ label, placeholderTitle: String( source.overrideFrontmatter?.title ?? source.pageTitle ) }
		)
	} )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

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

	const results = []
	for ( const source of REMOTE_CONTENT_SOURCES ) {
		if ( source.strategy === 'markdown-url' ) {
			results.push( await processMarkdownUrlSource( source ) )
		} else if ( source.strategy === 'mediawiki-translated-page' ) {
			results.push( ...await processWikiTranslatedSource( source ) )
		} else {
			console.warn( `⚠ ${ source.id }: unknown strategy "${ source.strategy }", skipped` )
		}
	}

	const count = ( status ) => results.filter( ( r ) => r.status === status ).length
	results.forEach( ( result ) => {
		( result.status === 'success' ? console.log : console.warn )( result.message )
	} )
	console.log(
		`[fetch-remote-content] wrote ${ count( 'success' ) }, stale ${ count( 'stale' ) }, ` +
		`placeholder ${ count( 'placeholder' ) }`
	)
}

main().catch( ( error ) => {
	console.error( '[fetch-remote-content] fatal error:', error.message )
	process.exit( 1 )
} )
