/**
 * The runner: source files in, catalogues and per-locale output files out.
 *
 * Ordering is deliberate. Everything is parsed, validated, and rendered into
 * memory before a single file is touched, so that an error means nothing was
 * written rather than a half-applied run.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { Diagnostics } from '../core/diagnostics.js'
import { parseSource } from '../core/source.js'
import { buildCatalog, translatedPercent } from '../core/catalog.js'
import { createResolver, mergeChain, renderSource, warnOnDiscouragedMagicWords } from '../core/render.js'
import { findSources, applyPathTemplate, matchesAny } from './files.js'
import { readTranslations, writeCatalogs } from './catalogFiles.js'
import { findOwned, findCollisions, wipe, writeManifest } from './ownership.js'

/**
 * Note stamped into generated catalogues.
 *
 * @param {string} sourceDir - Source directory, as the config named it.
 * @returns {string}
 */
function catalogNote( sourceDir ) {
	return 'GENERATED FILE - DO NOT EDIT BY HAND. Extracted from ' +
		`${ sourceDir } by @wikimedia/banana-content; edit the source text there and ` +
		're-run the generator.'
}

/**
 * Runs the generator.
 *
 * @param {object} config - Resolved config.
 * @param {object} [options] - Run options.
 * @param {boolean} [options.extractOnly] - Write catalogues only.
 * @param {boolean} [options.generateOnly] - Write output files only.
 * @param {boolean} [options.check] - Validate and report; write nothing.
 * @returns {Promise<object>} Result summary and diagnostics.
 */
export async function run( config, options = {} ) {
	const { extractOnly = false, generateOnly = false, check = false } = options
	const diagnostics = new Diagnostics()
	const result = { diagnostics, written: [], removed: 0, skipped: [], locales: [] }

	// ---- parse every source file -----------------------------------------
	const relativePaths = await findSources( config.source )
	if ( relativePaths.length === 0 ) {
		diagnostics.error( config.source.dir, 'no source files matched' )
		return result
	}

	const sources = []
	for ( const relativePath of relativePaths ) {
		const text = await readFile( join( config.source.dir, relativePath ), 'utf-8' )
		sources.push( parseSource( text, {
			path: relativePath,
			format: config.format,
			marker: config.marker,
			keys: config.keys,
			definitionsOnly: matchesAny( relativePath, config.source.definitionsOnly )
		} ) )
	}

	const catalog = buildCatalog( sources )
	diagnostics.absorb( catalog.diagnostics )
	if ( diagnostics.hasErrors ) {
		return result
	}

	// ---- extract ----------------------------------------------------------
	if ( !generateOnly && !check ) {
		result.written.push( ...await writeCatalogs( {
			dir: config.messages.dir,
			sourceLocale: config.messages.sourceLocale,
			documentationLocale: config.messages.documentationLocale,
			messages: catalog.messages,
			documentation: catalog.documentation,
			note: catalogNote( config.source.dir ),
			indent: config.messages.indent
		} ) )
	}
	result.messageCount = catalog.messages.size

	if ( extractOnly ) {
		return result
	}

	// ---- read translations ------------------------------------------------
	// The locales generated ARE the catalogue files on disk. There is no list.
	const translations = await readTranslations( {
		dir: config.messages.dir,
		sourceLocale: config.messages.sourceLocale,
		documentationLocale: config.messages.documentationLocale
	} )
	const byLocale = {
		[ config.messages.sourceLocale ]: Object.fromEntries( catalog.messages ),
		...translations
	}
	result.locales = [ config.messages.sourceLocale, ...Object.keys( translations ) ]

	for ( const [ locale, messages ] of Object.entries( translations ) ) {
		warnOnDiscouragedMagicWords( locale, messages, diagnostics )
		for ( const key of Object.keys( messages ) ) {
			if ( !catalog.definitions.has( key ) ) {
				diagnostics.warn(
					`${ locale }.json`,
					`"${ key }" is not defined by any source file (orphaned translation, likely a ` +
					'renamed key) — left untouched'
				)
			}
		}
	}

	// ---- render everything into memory before touching anything ----------
	const planned = []
	for ( const source of sources ) {
		if ( source.definitionsOnly ) {
			continue
		}
		for ( const locale of result.locales ) {
			if ( locale !== config.messages.sourceLocale ) {
				const percent = translatedPercent( source, byLocale[ locale ] )
				if ( percent < config.locales.minTranslatedPercent ) {
					result.skipped.push( {
						locale, path: source.path, percent: Math.round( percent )
					} )
					diagnostics.warn(
						`${ locale }/${ source.path }`,
						`${ Math.round( percent ) }% translated, below the ` +
						`${ config.locales.minTranslatedPercent }% threshold — not generated`
					)
					continue
				}
			}

			const chain = config.locales.fallback( locale )
			const resolve = createResolver( locale, mergeChain( chain, byLocale ) )
			const rendered = renderSource( source, {
				resolve, format: config.format, markerName: config.marker.name
			} )
			diagnostics.absorb( rendered.diagnostics )

			const template = config.output.overrides?.[ source.path ] ?? config.output.path
			const outputPath = applyPathTemplate( template, source.path, locale )
			const metadata = config.format.envelope && config.ownership.marker ?
				{
					...source.metadata,
					[ config.ownership.marker ]: true,
					sourceFile: source.path
				} :
				source.metadata
			const content = config.format.envelope ?
				config.format.envelope.serialize( metadata, rendered.body ) :
				rendered.body

			planned.push( { outputPath, content } )
		}
	}

	if ( diagnostics.hasErrors ) {
		return result
	}

	// ---- refuse to clobber anything we cannot prove we own ---------------
	const owned = await findOwned( {
		dir: config.output.dir,
		manifestPath: config.ownership.manifest,
		envelope: config.format.envelope,
		markerField: config.ownership.marker
	} )
	const collisions = await findCollisions( {
		dir: config.output.dir,
		planned: planned.map( ( entry ) => entry.outputPath ),
		owned,
		envelope: config.format.envelope
	} )
	for ( const collision of collisions ) {
		diagnostics.error( collision.path, collision.reason )
	}
	if ( diagnostics.hasErrors || check ) {
		return result
	}

	// ---- wipe, then write -------------------------------------------------
	result.removed = await wipe( config.output.dir, owned )
	for ( const { outputPath, content } of planned ) {
		const absolute = join( config.output.dir, outputPath )
		await mkdir( dirname( absolute ), { recursive: true } )
		await writeFile( absolute, content, 'utf-8' )
		result.written.push( absolute )
	}
	await writeManifest(
		config.ownership.manifest,
		planned.map( ( entry ) => entry.outputPath ),
		'GENERATED FILE - DO NOT EDIT BY HAND. Every file listed here is owned by ' +
		'@wikimedia/banana-content and is deleted and rewritten on each run.'
	)

	return result
}
