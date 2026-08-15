import { parseSource } from '../src/core/source.js'
import { buildCatalog } from '../src/core/catalog.js'
import { renderSource, createResolver, mergeChain } from '../src/core/render.js'
import { markdown } from '../src/formats/markdown.js'

export const MARKER = { name: 'message', definitionsBlock: 'messages' }
export const KEYS = { prefix: 'content-', pattern: /^content-[a-z0-9-]+$/ }

/**
 * Parses one source file with the usual defaults.
 *
 * @param {string} text - File contents.
 * @param {object} [options] - Overrides.
 * @returns {object} Parsed source.
 */
export function parse( text, options = {} ) {
	return parseSource( text, {
		path: 'page.md',
		format: markdown(),
		marker: MARKER,
		keys: KEYS,
		...options
	} )
}

/**
 * Parses, builds a catalogue, and renders for one locale in a single step.
 *
 * @param {string} text - File contents.
 * @param {object} [options] - Overrides.
 * @param {Record<string, Record<string, string>>} [options.translations] - Extra locales.
 * @param {string} [options.locale] - Locale to render.
 * @returns {object} Everything the assertions need.
 */
export function build( text, options = {} ) {
	const { translations = {}, locale = 'en', ...parseOptions } = options
	const format = parseOptions.format ?? markdown()
	const source = parse( text, { format, ...parseOptions } )
	const catalog = buildCatalog( [ source ] )
	const byLocale = { en: Object.fromEntries( catalog.messages ), ...translations }
	const chain = locale === 'en' ? [ 'en' ] : [ locale, 'en' ]
	const resolve = createResolver( locale, mergeChain( chain, byLocale ) )
	const rendered = renderSource( source, {
		resolve, format, markerName: MARKER.name
	} )
	return { source, catalog, rendered, body: rendered.body }
}

/**
 * All diagnostic messages of one severity, as plain strings.
 *
 * @param {import('../src/core/diagnostics.js').Diagnostics} diagnostics - Sink.
 * @param {'error'|'warning'} severity - Severity to collect.
 * @returns {string[]}
 */
export function messages( diagnostics, severity ) {
	return diagnostics.entries
		.filter( ( entry ) => entry.severity === severity )
		.map( ( entry ) => entry.message )
}
