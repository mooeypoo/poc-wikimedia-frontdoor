/**
 * Config file discovery and resolution.
 *
 * A JSON config is fully expressive because every option that accepts a
 * function also accepts a module specifier — a path to a module whose default
 * export is that function. That is what keeps the common case editable by
 * someone who does not want to write JavaScript.
 */

import { readFile } from 'node:fs/promises'
import { dirname, isAbsolute, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { DEFAULT_CONFIG, CONFIG_FILENAMES, MARKER_NAME_PATTERN } from '../core/defaults.js'
import { markdown } from '../formats/markdown.js'
import { plainText } from '../formats/plainText.js'

const BUILT_IN_FORMATS = { markdown, plainText }

/**
 * Whether a string points at a module rather than being a literal value.
 *
 * Relative and absolute paths are module specifiers; anything else is taken
 * literally, so an output template is never mistaken for a module.
 *
 * @param {string} value - Config value.
 * @returns {boolean}
 */
function isModuleSpecifier( value ) {
	return value.startsWith( '.' ) || isAbsolute( value )
}

/**
 * Imports a module specifier's default export.
 *
 * @param {string} specifier - Path or bare module name.
 * @param {string} configDir - Directory the config file lives in.
 * @returns {Promise<*>} The default export, or the namespace when there is none.
 */
async function importDefault( specifier, configDir ) {
	const target = isModuleSpecifier( specifier ) ?
		pathToFileURL( resolve( configDir, specifier ) ).href :
		specifier
	const module = await import( target )
	return module.default ?? module
}

/**
 * Finds and reads the config file.
 *
 * @param {object} options - Lookup options.
 * @param {string} options.cwd - Directory to search.
 * @param {string} [options.configPath] - Explicit config path, bypassing lookup.
 * @returns {Promise<{ raw: object, configDir: string, configPath: string }>}
 */
export async function loadConfig( { cwd, configPath } ) {
	const candidates = configPath ?
		[ resolve( cwd, configPath ) ] :
		CONFIG_FILENAMES.map( ( name ) => resolve( cwd, name ) )

	for ( const candidate of candidates ) {
		let raw
		if ( candidate.endsWith( '.json' ) ) {
			try {
				raw = JSON.parse( await readFile( candidate, 'utf-8' ) )
			} catch ( error ) {
				if ( error.code === 'ENOENT' ) {
					continue
				}
				throw new Error( `${ candidate }: ${ error.message }` )
			}
		} else {
			try {
				raw = ( await import( pathToFileURL( candidate ).href ) ).default
			} catch ( error ) {
				if ( error.code === 'ERR_MODULE_NOT_FOUND' && error.message.includes( candidate ) ) {
					continue
				}
				throw new Error( `${ candidate }: ${ error.message }` )
			}
		}
		delete raw.$schema
		return { raw, configDir: dirname( candidate ), configPath: candidate }
	}

	// Last resort: a `bananaContent` key in package.json.
	const packagePath = resolve( cwd, 'package.json' )
	try {
		const manifest = JSON.parse( await readFile( packagePath, 'utf-8' ) )
		if ( manifest.bananaContent ) {
			return { raw: manifest.bananaContent, configDir: cwd, configPath: packagePath }
		}
	} catch {
		// No package.json, or unreadable — fall through to the error below.
	}

	throw new Error(
		`No configuration found in ${ cwd }. Expected one of ` +
		`${ CONFIG_FILENAMES.join( ', ' ) }, or a "bananaContent" key in package.json.`
	)
}

/**
 * Merges defaults, resolves module specifiers, and validates.
 *
 * @param {object} raw - Config as written.
 * @param {string} configDir - Directory the config file lives in.
 * @returns {Promise<object>} Resolved config.
 */
export async function resolveConfig( raw, configDir ) {
	const merged = {}
	for (
		const section of [ 'source', 'messages', 'output', 'locales', 'keys', 'marker', 'ownership' ]
	) {
		merged[ section ] = { ...DEFAULT_CONFIG[ section ], ...( raw[ section ] ?? {} ) }
	}

	for ( const required of [ 'source', 'messages', 'output' ] ) {
		if ( !merged[ required ].dir ) {
			throw new Error( `config: "${ required }.dir" is required` )
		}
	}

	const formatValue = raw.format ?? DEFAULT_CONFIG.format
	let format
	if ( typeof formatValue === 'string' ) {
		if ( BUILT_IN_FORMATS[ formatValue ] ) {
			format = BUILT_IN_FORMATS[ formatValue ]()
		} else {
			const loaded = await importDefault( formatValue, configDir )
			format = typeof loaded === 'function' ? loaded() : loaded
		}
	} else {
		format = typeof formatValue === 'function' ? formatValue() : formatValue
	}
	if ( !format?.name || !Array.isArray( format.contexts ) ) {
		throw new Error( 'config: format adapter must have a name and a contexts array' )
	}

	for ( const key of [ 'name', 'definitionsBlock' ] ) {
		if ( !MARKER_NAME_PATTERN.test( merged.marker[ key ] ) ) {
			throw new Error(
				`config: marker.${ key } "${ merged.marker[ key ] }" must match ${ MARKER_NAME_PATTERN }`
			)
		}
	}

	const keyPattern = merged.keys.pattern instanceof RegExp ?
		merged.keys.pattern :
		new RegExp( merged.keys.pattern )

	// Fallback: a map, a function, or a module exporting one. The library never
	// asks what languages exist — only what chain to walk for a locale it found.
	const fallbackValue = merged.locales.fallback
	let fallback
	if ( !fallbackValue ) {
		fallback = ( locale ) => [ locale, merged.messages.sourceLocale ]
	} else if ( typeof fallbackValue === 'string' ) {
		fallback = await importDefault( fallbackValue, configDir )
	} else if ( typeof fallbackValue === 'function' ) {
		fallback = fallbackValue
	} else {
		fallback = ( locale ) =>
			fallbackValue[ locale ] ?? [ locale, merged.messages.sourceLocale ]
	}

	let outputPath = merged.output.path
	if ( typeof outputPath === 'string' && isModuleSpecifier( outputPath ) ) {
		outputPath = await importDefault( outputPath, configDir )
	}

	let namespace = merged.keys.namespace
	if ( typeof namespace === 'string' ) {
		namespace = await importDefault( namespace, configDir )
	}

	return {
		configDir,
		format,
		source: {
			...merged.source,
			dir: resolve( configDir, merged.source.dir ),
			// Kept alongside the absolute path because it is what appears in
			// generated files and catalogues: an absolute path there would differ
			// per machine and destroy reproducibility.
			relativeDir: merged.source.dir.replace( /^\.\//, '' ).replace( /\/$/, '' )
		},
		messages: {
			...merged.messages,
			dir: resolve( configDir, merged.messages.dir )
		},
		output: {
			...merged.output,
			dir: resolve( configDir, merged.output.dir ),
			path: outputPath
		},
		locales: { ...merged.locales, fallback },
		keys: { ...merged.keys, pattern: keyPattern, namespace },
		marker: merged.marker,
		ownership: {
			...merged.ownership,
			manifest: merged.ownership.manifest ?
				resolve( configDir, merged.ownership.manifest ) :
				false
		}
	}
}

/**
 * Loads and resolves in one step.
 *
 * @param {object} options - Lookup options.
 * @returns {Promise<object>} Resolved config.
 */
export async function getConfig( options ) {
	const { raw, configDir } = await loadConfig( options )
	return resolveConfig( raw, configDir )
}
