/**
 * Key namespacing.
 *
 * A local key is namespaced from its source file's path; a key already carrying
 * the reserved prefix is a fully-qualified cross-file reference and is used
 * verbatim.
 *
 * The rule is deliberately mechanical rather than "try local, then fall back to
 * global": under a fallback rule a typo silently becomes a cross-file reference
 * to nothing, which is exactly the mistake worth catching.
 */

/**
 * Derives a source file's key namespace from its path.
 *
 * `experiments/open-data.md` with prefix `content-` becomes
 * `content-experiments-open-data-`.
 *
 * @param {string} relativePath - Path relative to the source root.
 * @param {string} prefix - Reserved key prefix.
 * @returns {string}
 */
export function keyPrefixForPath( relativePath, prefix ) {
	const withoutExtension = relativePath.replace( /\.[^./]+$/, '' )
	return prefix + withoutExtension.split( '/' ).join( '-' ) + '-'
}

/**
 * Resolves a written marker id to a full message key.
 *
 * @param {string} id - Marker id as written.
 * @param {string} keyPrefix - This file's namespace.
 * @param {string} prefix - Reserved key prefix.
 * @returns {string}
 */
export function resolveKey( id, keyPrefix, prefix ) {
	return id.startsWith( prefix ) ? id : keyPrefix + id
}

/**
 * Whether a written id is a fully-qualified cross-file reference.
 *
 * @param {string} id - Marker id as written.
 * @param {string} prefix - Reserved key prefix.
 * @returns {boolean}
 */
export function isQualified( id, prefix ) {
	return id.startsWith( prefix )
}
