/**
 * Wraps a string in Unicode first-strong isolate (FSI) and pop directional isolate (PDI)
 * characters for BiDi isolation where HTML `<bdi>` is unavailable (e.g. Codex menu labels).
 *
 * @param label - User-visible or external text to isolate.
 * @returns The label wrapped in FSI/PDI.
 */
export function isolateLabel( label: string ): string {
	return `\u2068${ label }\u2069`
}
