#!/usr/bin/env node

/**
 * Generates config/languages.generated.ts — the full Wikimedia language
 * catalog used as the portal's single source of locales.
 *
 * This is a maintenance tool, NOT a build step. Run it occasionally and review
 * the resulting git diff:
 *
 *   npm run generate-language-catalog
 *   git diff config/languages.generated.ts
 *
 * Data sources (joined on language `code`):
 *   - meta=siteinfo&siprop=languages  → spine: the selectable content languages
 *   - meta=languageinfo               → enrichment: dir, autonym, fallbacks
 *
 * See docs/adr-language-catalog.md §2–§4 for the decisions behind this.
 *
 * Override the source wiki with CATALOG_WIKI_API if needed:
 *   CATALOG_WIKI_API=https://meta.wikimedia.org/w/api.php npm run generate-language-catalog
 */

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { promises as fs } from 'node:fs'

const __filename = fileURLToPath( import.meta.url )
const projectRoot = dirname( dirname( __filename ) )

const WIKI_API = process.env.CATALOG_WIKI_API ?? 'https://www.mediawiki.org/w/api.php'

/**
 * Descriptive User-Agent, required by the Wikimedia API etiquette policy.
 * @see https://meta.wikimedia.org/wiki/User-Agent_policy
 */
const USER_AGENT =
	'WikimediaDeveloperPortal-language-catalog-generator/1.0 ' +
	'(https://gitlab.wikimedia.org/repos/wikimedia/frontdoor; developer portal build tooling)'

const OUTPUT_PATH = join( projectRoot, 'config', 'languages.generated.ts' )

/**
 * Fetches a MediaWiki API URL as JSON with the required User-Agent.
 *
 * @param {URL} url - Fully-built API URL.
 * @returns {Promise<object>} Parsed JSON response.
 * @throws {Error} On non-OK HTTP status or an API-level `error` field.
 */
async function fetchApiJson( url ) {
	const response = await fetch( url, { headers: { 'User-Agent': USER_AGENT } } )
	if ( !response.ok ) {
		throw new Error( `HTTP ${ response.status }: ${ response.statusText } for ${ url }` )
	}
	const json = await response.json()
	if ( json.error ) {
		throw new Error( `API error ${ json.error.code }: ${ json.error.info }` )
	}
	return json
}

/**
 * Builds an API URL with the shared defaults applied.
 *
 * @param {Record<string, string>} params - Query parameters.
 * @returns {URL} The API URL.
 */
function apiUrl( params ) {
	const url = new URL( WIKI_API )
	url.searchParams.set( 'format', 'json' )
	url.searchParams.set( 'formatversion', '2' )
	url.searchParams.set( 'uselang', 'en' )
	for ( const [ key, value ] of Object.entries( params ) ) {
		url.searchParams.set( key, value )
	}
	return url
}

/**
 * Fetches the spine list of selectable content languages.
 *
 * @returns {Promise<Array<{ code: string, bcp47: string, name: string }>>}
 */
async function fetchSiteLanguages() {
	const json = await fetchApiJson( apiUrl( {
		action: 'query',
		meta: 'siteinfo',
		siprop: 'languages'
	} ) )
	return json.query.languages
}

/**
 * Fetches per-language enrichment (dir, autonym, name, bcp47, fallbacks),
 * following continuation until exhausted.
 *
 * @returns {Promise<Record<string, { code: string, bcp47: string, dir: string, autonym: string, name: string, fallbacks: string[] }>>}
 *   Map keyed by language code.
 */
async function fetchLanguageInfo() {
	const info = {}
	let continuation = {}

	do {
		const json = await fetchApiJson( apiUrl( {
			action: 'query',
			meta: 'languageinfo',
			liprop: 'code|bcp47|dir|autonym|name|fallbacks',
			...continuation
		} ) )

		Object.assign( info, json.query.languageinfo )
		continuation = json.continue ?? null
	} while ( continuation )

	return info
}

/**
 * Builds a fallback chain: the language itself, its MediaWiki fallbacks, then a
 * guaranteed English terminal — deduplicated in order.
 *
 * @param {string} code - Language code.
 * @param {string[]} fallbacks - MediaWiki fallback codes (may be empty).
 * @returns {string[]} Ordered, deduplicated fallback chain ending in 'en'.
 */
function buildFallbackChain( code, fallbacks ) {
	const ordered = [ code, ...( fallbacks ?? [] ), 'en' ]
	const seen = new Set()
	const chain = []
	for ( const entry of ordered ) {
		if ( seen.has( entry ) ) {
			continue
		}
		seen.add( entry )
		chain.push( entry )
	}
	return chain
}

/**
 * Joins the spine and enrichment into catalog entries, sorted by code.
 *
 * @param {Array<{ code: string, bcp47: string, name: string }>} siteLanguages
 * @param {Record<string, object>} languageInfo
 * @returns {Array<object>} Catalog entries in LanguageConfig shape.
 */
function buildCatalog( siteLanguages, languageInfo ) {
	return siteLanguages
		.map( ( language ) => {
			const info = languageInfo[ language.code ] ?? {}
			const dir = info.dir === 'rtl' ? 'rtl' : 'ltr'
			return {
				code: language.code,
				dir,
				fallbackChain: buildFallbackChain( language.code, info.fallbacks ),
				// autonym: native name (languageinfo). name: English name — languageinfo
				// under uselang=en; siteinfo's `name` is actually the autonym, so it is
				// only a last resort.
				autonym: info.autonym ?? language.name ?? language.code,
				bcp47: language.bcp47 ?? info.bcp47 ?? language.code,
				name: info.name ?? language.name ?? language.code
			}
		} )
		.sort( ( a, b ) => a.code.localeCompare( b.code ) )
}

/**
 * Serializes the catalog to a TypeScript module.
 *
 * @param {Array<object>} catalog - Catalog entries.
 * @returns {string} File contents.
 */
function serializeModule( catalog ) {
	const header = [
		'/**',
		' * GENERATED FILE — DO NOT EDIT BY HAND.',
		' *',
		' * The full Wikimedia language catalog. Regenerate with:',
		' *   npm run generate-language-catalog',
		' * then review the git diff. Hand-authored policy (custom fallbacks, pinned',
		' * metadata) belongs in the LANGUAGE_OVERRIDES layer in config/languages.ts,',
		' * never here — this file is overwritten wholesale on every regeneration.',
		' *',
		` * Source: ${ WIKI_API } (siteinfo/languages + languageinfo).`,
		' * See docs/adr-language-catalog.md.',
		' */',
		'',
		"import type { LanguageConfig } from './languages'",
		''
	].join( '\n' )

	const body = `export const GENERATED_LANGUAGES: LanguageConfig[] = ${
		JSON.stringify( catalog, null, '\t' )
	}\n`

	return `${ header }\n${ body }`
}

/**
 * Main entrypoint.
 *
 * @returns {Promise<void>}
 */
async function main() {
	console.log( `[generate-language-catalog] source: ${ WIKI_API }` )

	const [ siteLanguages, languageInfo ] = await Promise.all( [
		fetchSiteLanguages(),
		fetchLanguageInfo()
	] )

	const catalog = buildCatalog( siteLanguages, languageInfo )

	// Warn about any fallback code that is not itself a catalog entry — the chain
	// still works (a missing locale is simply skipped), but it signals drift.
	const codes = new Set( catalog.map( ( language ) => language.code ) )
	const danglingFallbacks = new Set()
	for ( const language of catalog ) {
		for ( const fallback of language.fallbackChain ) {
			if ( !codes.has( fallback ) ) {
				danglingFallbacks.add( fallback )
			}
		}
	}
	if ( danglingFallbacks.size > 0 ) {
		console.warn(
			`[generate-language-catalog] fallback codes not in the spine: ${
				[ ...danglingFallbacks ].sort().join( ', ' )
			}`
		)
	}

	await fs.writeFile( OUTPUT_PATH, serializeModule( catalog ), 'utf-8' )

	console.log(
		`[generate-language-catalog] wrote ${ catalog.length } languages to ${ OUTPUT_PATH }`
	)
}

main().catch( ( error ) => {
	console.error( '[generate-language-catalog] fatal:', error.message )
	process.exit( 1 )
} )
