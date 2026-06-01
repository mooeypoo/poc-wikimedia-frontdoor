/**
 * Wraps a label with Unicode FSI/PDI markers for BiDi isolation in picker controls.
 *
 * HTML cannot be used inside `<option>`-like targets; markers enforce isolation for
 * external display names (see AGENTS.md → BiDi isolation).
 *
 * @param label - External or config-sourced label text.
 * @returns Label wrapped with isolate formatting characters.
 */
export function isolatePickerLabel( label: string ): string {
	return `\u2068${ label }\u2069`
}
