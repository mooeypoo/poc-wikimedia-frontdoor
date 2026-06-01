import { useDirection } from '../composables/useDirection'

let hasLoadedCodexRtlStylesheet = false

/**
 * Loads Codex RTL component styles when the shell direction is rtl.
 *
 * The base LTR stylesheet is registered globally in nuxt.config; this plugin
 * adds the RTL mirror rules on the client when needed (see ARCHITECTURE.md).
 */
export default defineNuxtPlugin( () => {
	const { direction } = useDirection()

	watch(
		direction,
		async ( nextDirection ) => {
			if ( nextDirection !== 'rtl' || hasLoadedCodexRtlStylesheet ) {
				return
			}

			await import( '@wikimedia/codex/dist/codex.style-rtl.css' )
			hasLoadedCodexRtlStylesheet = true
		},
		{ immediate: true }
	)
} )
