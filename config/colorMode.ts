/**
 * Color-mode constants shared by the runtime composable (useColorMode.ts) and
 * the pre-hydration anti-FOUC script wired in nuxt.config.ts.
 *
 * Dark-mode token values live in app/assets/css/color-modes.css, scoped under
 * the `html.fd-theme--*` classes defined here.
 */

/** Persisted color-mode choices. `auto` follows the OS `prefers-color-scheme`. */
export const COLOR_MODES = [ 'light', 'auto', 'dark' ] as const

export type ColorMode = typeof COLOR_MODES[ number ]

/** localStorage key holding the user's color-mode choice. */
export const COLOR_MODE_STORAGE_KEY = 'fd-color-mode'

/** Default when nothing is stored: follow the operating system. */
export const DEFAULT_COLOR_MODE: ColorMode = 'auto'

/**
 * Maps a color-mode choice to its `<html>` class.
 *
 * @param mode - Color-mode choice.
 * @returns Theme class applied to the document element.
 */
export function colorModeClass( mode: ColorMode ): string {
	return `fd-theme--${ mode }`
}

/** All theme classes, for cleanup before applying the active one. */
export const COLOR_MODE_CLASSES = COLOR_MODES.map( colorModeClass )
