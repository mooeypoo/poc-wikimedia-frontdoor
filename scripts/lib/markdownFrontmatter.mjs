/**
 * YAML frontmatter envelope for the markdown under content/.
 *
 * Hoisted out of fetch-remote-content.mjs so the sidebar-map builder reads
 * frontmatter the same way the content importer writes it. Unparseable
 * frontmatter yields no fields rather than throwing, which is the importer's
 * long-standing behaviour: a half-written file mid-save is a normal thing for a
 * watcher to see.
 *
 * `packages/banana-content` carries its own copy on purpose — it ships as a
 * standalone workspace package and cannot reach into ./scripts.
 */

import YAML from 'yaml'

const FRONTMATTER_BLOCK = /^---\n([\s\S]*?)\n---\n?/

/**
 * Parses YAML frontmatter from Markdown content.
 *
 * @param {string} content - Raw Markdown.
 * @returns {{ data: Record<string, unknown>, body: string }}
 */
export function parseFrontmatter( content ) {
	const match = FRONTMATTER_BLOCK.exec( content )
	if ( !match ) {
		return { data: {}, body: content }
	}
	let data
	try {
		data = YAML.parse( match[ 1 ] ) ?? {}
	} catch {
		data = {}
	}
	return { data, body: content.slice( match[ 0 ].length ) }
}
