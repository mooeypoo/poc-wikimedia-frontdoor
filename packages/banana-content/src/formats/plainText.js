/**
 * Plain text format adapter — no envelope, no escaping contexts.
 *
 * This exists to keep the core honest. An abstraction with one implementation
 * is a guess rather than a boundary, so if the core ever acquires a hidden
 * assumption about Markdown — a frontmatter fence, a pipe, an attribute quote —
 * this is where it shows up, as a test failure rather than as a surprise for
 * whoever brings the second format.
 *
 * Files using it have no metadata slot, so generated-file ownership rests
 * entirely on the manifest: set `ownership.marker` to `false`.
 */

/**
 * Creates the plain text format adapter.
 *
 * @returns {object} Format adapter.
 */
export function plainText() {
	return {
		name: 'plainText',
		envelope: null,
		contexts: []
	}
}

export default plainText
