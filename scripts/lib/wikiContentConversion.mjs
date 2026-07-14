/**
 * Converts MediaWiki page HTML (Parsoid REST output) to MDC-compatible Markdown
 * for the Nuxt Content pipeline.
 *
 * Uses the unified/rehype/remark toolchain already present via @nuxt/content
 * (rehype-parse → rehype-remark → remark-gfm → remark-stringify), rather than
 * Turndown, which cannot be installed in this environment. See
 * docs/adr-remote-content-fetching.md §9.4.
 *
 * Element → MDC mapping is the conservative safe set:
 *   - fenced code with language (from MediaWiki `mw-highlight-lang-*`)
 *   - message/note boxes → `::callout{type=...}`
 * Noise (language bar, TOC, navboxes, edit links, styles/scripts) is stripped;
 * links and images are absolutized against the source wiki.
 */

import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { visit, SKIP } from 'unist-util-visit'
import { toString as hastToString } from 'hast-util-to-string'

/**
 * Returns the class list of a hast element as an array of strings.
 *
 * @param {object} node - hast element node.
 * @returns {string[]} Class names (empty when none).
 */
function classList( node ) {
	const cls = node.properties?.className
	return Array.isArray( cls ) ? cls.filter( ( c ) => typeof c === 'string' ) : []
}

/**
 * Whether any class on the node contains the given substring.
 *
 * @param {object} node - hast element node.
 * @param {string} substring - Substring to look for.
 * @returns {boolean}
 */
function classIncludes( node, substring ) {
	return classList( node ).some( ( c ) => c.includes( substring ) )
}

/**
 * Adds a class to a hast element if not already present.
 *
 * @param {object} node - hast element node.
 * @param {string} className - Class to add.
 * @returns {void}
 */
function addClass( node, className ) {
	node.properties = node.properties ?? {}
	const cls = classList( node )
	if ( !cls.includes( className ) ) {
		node.properties.className = [ ...cls, className ]
	}
}

/**
 * Reads a code language from a single node's own classes (MediaWiki's
 * `mw-highlight-lang-<lang>` or the generic `language-<lang>`).
 *
 * @param {object} node - hast element node.
 * @returns {string|null} Language code, or null.
 */
function readLangClass( node ) {
	for ( const c of classList( node ) ) {
		const match = /^(?:mw-highlight-lang-|language-)(.+)$/.exec( c )
		if ( match ) {
			return match[ 1 ]
		}
	}
	return null
}

/**
 * Extracts a code language from a node or any descendant.
 *
 * @param {object} node - hast element node.
 * @returns {string|null} Language code, or null.
 */
function findCodeLang( node ) {
	let lang = readLangClass( node )
	if ( !lang ) {
		visit( node, 'element', ( descendant ) => {
			if ( !lang ) {
				lang = readLangClass( descendant )
			}
		} )
	}
	return lang
}

/**
 * Maps a message-box element's classes to a Callout type.
 *
 * @param {object} node - hast element node.
 * @returns {'notice'|'warning'|'error'|'success'}
 */
function calloutType( node ) {
	if ( classIncludes( node, 'error' ) ) {
		return 'error'
	}
	if ( classIncludes( node, 'warning' ) || classIncludes( node, 'ambox-content' ) ) {
		return 'warning'
	}
	if ( classIncludes( node, 'success' ) ) {
		return 'success'
	}
	return 'notice'
}

/**
 * Whether an element is a MediaWiki/Codex message box that maps to a Callout.
 *
 * @param {object} node - hast element node.
 * @returns {boolean}
 */
function isCallout( node ) {
	return node.tagName === 'div' && (
		classIncludes( node, 'cdx-message' ) ||
		classIncludes( node, 'mw-message-box' ) ||
		classList( node ).includes( 'ambox' ) ||
		classIncludes( node, 'mbox' )
	)
}

/** Tag names removed outright before conversion. */
const STRIP_TAGS = new Set( [ 'script', 'style', 'link', 'meta', 'base' ] )

/**
 * Whether an element is structural noise to strip (language bar, TOC, navboxes,
 * edit links, non-content navigation).
 *
 * @param {object} node - hast element node.
 * @returns {boolean}
 */
function isNoise( node ) {
	return (
		classIncludes( node, 'mw-editsection' ) ||
		classIncludes( node, 'mw-pt-languages' ) ||
		classList( node ).includes( 'toc' ) ||
		classList( node ).includes( 'navbox' ) ||
		classList( node ).includes( 'metadata' ) ||
		classList( node ).includes( 'noprint' ) ||
		classList( node ).includes( 'mw-empty-elt' ) ||
		node.properties?.role === 'navigation'
	)
}

/**
 * Resolves a possibly-relative URL against the wiki origin / base href.
 *
 * @param {string} url - Original URL.
 * @param {string} origin - Wiki origin, e.g. 'https://www.mediawiki.org'.
 * @param {string|null} baseHref - `<base href>` from the document, if any.
 * @returns {string} Absolute URL (or the original when it cannot be resolved).
 */
function resolveUrl( url, origin, baseHref ) {
	if ( !url || typeof url !== 'string' ) {
		return url
	}
	if ( url.startsWith( '#' ) || /^(mailto|tel|data):/.test( url ) ) {
		return url
	}
	if ( url.startsWith( '//' ) ) {
		return 'https:' + url
	}
	if ( /^https?:\/\//.test( url ) ) {
		return url
	}
	try {
		let base = baseHref || ( origin + '/wiki/' )
		if ( base.startsWith( '//' ) ) {
			base = 'https:' + base
		}
		return new URL( url, base ).href
	} catch {
		return url
	}
}

/**
 * rehype plugin: reduce a Parsoid document to clean, content-only hast.
 *
 * @param {{ origin: string }} options - Conversion options.
 * @returns {(tree: object) => void} Transformer.
 */
function rehypeCleanWikiContent( options ) {
	const { origin } = options

	return ( tree ) => {
		// Read <base href> and locate <body> before discarding the document shell.
		let baseHref = null
		let body = null
		visit( tree, 'element', ( node ) => {
			if ( node.tagName === 'base' && node.properties?.href ) {
				baseHref = node.properties.href
			}
			if ( node.tagName === 'body' ) {
				body = node
			}
		} )
		if ( body ) {
			tree.children = body.children
		}

		// Remove noise and transform the survivors.
		visit( tree, ( node, index, parent ) => {
			if ( !parent || index === null ) {
				return
			}
			if ( node.type === 'comment' ) {
				parent.children.splice( index, 1 )
				return [ SKIP, index ]
			}
			if ( node.type !== 'element' ) {
				return
			}
			if ( STRIP_TAGS.has( node.tagName ) || isNoise( node ) ) {
				parent.children.splice( index, 1 )
				return [ SKIP, index ]
			}

			// Message box → callout marker (handled by a rehype-remark handler).
			if ( isCallout( node ) ) {
				const type = calloutType( node )
				node.tagName = 'x-callout'
				node.properties = { calloutType: type }
				return
			}

			// Syntax-highlight wrappers carry the language on the enclosing element
			// (e.g. `<div class="mw-highlight-lang-python"><pre>`). Propagate it onto
			// the <pre> so the pre handler emits a fenced block with that language.
			const ownLang = readLangClass( node )
			if ( ownLang && node.tagName !== 'pre' ) {
				visit( node, 'element', ( descendant ) => {
					if ( descendant.tagName === 'pre' ) {
						addClass( descendant, 'language-' + ownLang )
					}
				} )
			}

			// Links: drop clutter titles and empty-text anchors (Parsoid emits a
			// bare duplicate link beside each Special:MyLanguage link); absolutize.
			if ( node.tagName === 'a' ) {
				if ( node.properties ) {
					delete node.properties.title
				}
				const hasMedia = node.tagName === 'a' &&
					node.children?.some( ( child ) => child.type === 'element' && child.tagName === 'img' )
				if ( !hasMedia && hastToString( node ).trim() === '' ) {
					parent.children.splice( index, 1 )
					return [ SKIP, index ]
				}
				if ( node.properties?.href ) {
					node.properties.href = resolveUrl( node.properties.href, origin, baseHref )
				}
			}

			// Media: drop titles, absolutize src.
			if ( node.tagName === 'img' && node.properties ) {
				delete node.properties.title
				if ( node.properties.src ) {
					node.properties.src = resolveUrl( node.properties.src, origin, baseHref )
				}
			}
		} )
	}
}

/** rehype-remark handlers for the conservative MDC element mapping. */
const mdcHandlers = {
	/**
	 * Emits a `::callout{type=...}` MDC block wrapping the converted children.
	 *
	 * @param {object} state - hast-util-to-mdast state.
	 * @param {object} node - The `x-callout` hast node.
	 * @returns {object[]} mdast nodes.
	 */
	'x-callout': ( state, node ) => {
		const type = node.properties?.calloutType || 'notice'
		const children = state.all( node )
		return [
			{ type: 'html', value: `::callout{type="${ type }"}` },
			...children,
			{ type: 'html', value: '::' }
		]
	},

	/**
	 * Emits a fenced code block, detecting the language from MediaWiki's
	 * `mw-highlight-lang-*` (or generic `language-*`) class on the `<pre>` or a
	 * descendant. Overrides the default `pre` handler so highlighted blocks keep
	 * their language.
	 *
	 * @param {object} state - hast-util-to-mdast state.
	 * @param {object} node - The `pre` hast node.
	 * @returns {object} mdast code node.
	 */
	pre: ( state, node ) => {
		const lang = findCodeLang( node )
		const value = hastToString( node ).replace( /\n$/, '' )
		const codeNode = { type: 'code', lang: lang || null, meta: null, value }
		state.patch( node, codeNode )
		return codeNode
	}
}

/**
 * Converts wiki page HTML to MDC-compatible Markdown.
 *
 * @param {string} html - Parsoid HTML (full document or fragment).
 * @param {{ origin: string }} options - Conversion options; `origin` is the
 *   source wiki origin used to absolutize links/media.
 * @returns {Promise<string>} Markdown body (no frontmatter).
 */
export async function convertWikiHtmlToMarkdown( html, options ) {
	const file = await unified()
		.use( rehypeParse, { fragment: false } )
		.use( rehypeCleanWikiContent, { origin: options.origin } )
		.use( rehypeRemark, { handlers: mdcHandlers } )
		.use( remarkGfm )
		.use( remarkStringify, {
			bullet: '-',
			fences: true,
			rule: '-',
			emphasis: '_',
			listItemIndent: 'one'
		} )
		.process( html )

	return String( file ).trim() + '\n'
}
