/**
 * Catalogue building and cross-file validation.
 *
 * A key is defined exactly once across all source files; every other appearance
 * is a reference. Enforcing that is what makes reuse trustworthy — without it,
 * the extracted source text would depend on file traversal order, and a
 * translator could be documenting one string while the output renders another.
 */

import { Diagnostics } from './diagnostics.js'

/** Markdown-ish syntax that renders inert inside an attribute value. */
const MARKUP_HINT = /\[[^\]]*\]\(|[*_`]/

/**
 * Builds the source and documentation catalogues from parsed source files.
 *
 * @param {object[]} sources - Parsed sources from `parseSource`.
 * @returns {object} Catalogue, definitions, and diagnostics.
 */
export function buildCatalog( sources ) {
	const diagnostics = new Diagnostics()
	const definitions = new Map()

	for ( const source of sources ) {
		diagnostics.absorb( source.diagnostics )
	}

	// One definition per key, first wins; a second is an error, not an override.
	for ( const source of sources ) {
		for ( const entry of source.markers ) {
			if ( entry.kind !== 'definition' || !entry.key ) {
				continue
			}
			const existing = definitions.get( entry.key )
			if ( existing ) {
				diagnostics.error(
					entry.location,
					`"${ entry.key }" is already defined at ${ existing.location }; a key may be ` +
					'defined exactly once — use a reference instead'
				)
				continue
			}
			definitions.set( entry.key, entry )
			if ( !entry.qqq ) {
				diagnostics.warn( entry.location, `"${ entry.key }" has no qqq documentation` )
			}
		}
	}

	// Every reference must resolve, and anything landing in an attribute should
	// not be carrying markup that will render as literal text there.
	for ( const source of sources ) {
		for ( const entry of source.markers ) {
			if ( !entry.key ) {
				continue
			}
			const definition = definitions.get( entry.key )
			if ( !definition ) {
				diagnostics.error( entry.location, `reference to undefined key "${ entry.key }"` )
				continue
			}
			const inAttribute = entry.contexts.some( ( context ) => context.name === 'attribute' )
			if ( inAttribute && MARKUP_HINT.test( definition.text ?? '' ) ) {
				diagnostics.warn(
					entry.location,
					`"${ entry.key }" contains markup but is used in an attribute value, where it ` +
					'will render inert'
				)
			}
		}
	}

	const messages = new Map()
	const documentation = new Map()
	for ( const [ key, definition ] of definitions ) {
		messages.set( key, definition.text )
		if ( definition.qqq ) {
			documentation.set( key, definition.qqq )
		}
	}

	return { messages, documentation, definitions, diagnostics }
}

/**
 * Keys a source file uses, whether defined there or referenced from elsewhere.
 *
 * Used to measure translation coverage per file, which is why it counts
 * referenced keys from shared files too — a page is only as translated as the
 * strings it actually renders.
 *
 * @param {object} source - Parsed source.
 * @returns {string[]} Unique keys.
 */
export function keysUsedBy( source ) {
	return [ ...new Set( source.markers.map( ( entry ) => entry.key ).filter( Boolean ) ) ]
}

/**
 * Share of a source file's keys present in a locale's own catalogue.
 *
 * Measured against the locale's own file, not its fallback chain: a key served
 * by fallback is by definition not translated into this locale.
 *
 * @param {object} source - Parsed source.
 * @param {Record<string, string>} localeMessages - That locale's own messages.
 * @returns {number} Percentage from 0 to 100.
 */
export function translatedPercent( source, localeMessages ) {
	const used = keysUsedBy( source )
	if ( used.length === 0 ) {
		return 100
	}
	const present = used.filter( ( key ) => localeMessages[ key ] !== undefined ).length
	return ( present / used.length ) * 100
}
