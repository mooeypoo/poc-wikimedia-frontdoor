import codexRtlStylesheetUrl from '@wikimedia/codex/dist/codex.style-rtl.css?url'
import { useDirection } from '../composables/useDirection'

const CODEX_RTL_STYLESHEET_ID = 'fd-codex-rtl-stylesheet'

/** In-flight load promise so concurrent rtl requests share one `<link>` insert. */
let codexRtlStylesheetLoad: Promise<void> | null = null

/**
 * Injects or toggles the Codex RTL stylesheet so it is active only when shell
 * direction is `rtl`. Without disabling on return to LTR, Codex components keep
 * mirrored physical layout rules (e.g. language select chevron position).
 *
 * @param direction - Shell text direction from `useDirection()`.
 */
async function syncCodexRtlStylesheet( direction: 'ltr' | 'rtl' ): Promise<void> {
	if ( typeof document === 'undefined' ) {
		return
	}

	const existingLink = document.getElementById(
		CODEX_RTL_STYLESHEET_ID
	) as HTMLLinkElement | null

	if ( direction === 'ltr' ) {
		if ( existingLink ) {
			existingLink.disabled = true
		}
		return
	}

	if ( existingLink ) {
		existingLink.disabled = false
		await import( '~/assets/css/shell-primary-nav-overrides.css' )
		return
	}

	if ( !codexRtlStylesheetLoad ) {
		codexRtlStylesheetLoad = new Promise<void>( ( resolve, reject ) => {
			const linkElement = document.createElement( 'link' )
			linkElement.id = CODEX_RTL_STYLESHEET_ID
			linkElement.rel = 'stylesheet'
			linkElement.href = codexRtlStylesheetUrl
			linkElement.onload = () => resolve()
			linkElement.onerror = () => {
				codexRtlStylesheetLoad = null
				reject( new Error( 'Failed to load Codex RTL stylesheet' ) )
			}
			document.head.appendChild( linkElement )
		} )
	}

	await codexRtlStylesheetLoad
	await import( '~/assets/css/shell-primary-nav-overrides.css' )
}

/**
 * Loads Codex RTL component styles when the shell direction is rtl.
 *
 * The base LTR stylesheet is registered globally in nuxt.config. This plugin
 * toggles the RTL mirror sheet on locale-driven direction changes (see
 * ARCHITECTURE.md → RTL and BiDi).
 */
export default defineNuxtPlugin( () => {
	const { direction } = useDirection()

	watch(
		direction,
		( nextDirection ) => {
			void syncCodexRtlStylesheet( nextDirection )
		},
		{ immediate: true }
	)
} )
