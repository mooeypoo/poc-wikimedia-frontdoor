import { computed, onMounted } from 'vue'
import {
	COLOR_MODES,
	COLOR_MODE_CLASSES,
	COLOR_MODE_STORAGE_KEY,
	DEFAULT_COLOR_MODE,
	colorModeClass,
	type ColorMode
} from '../../config/colorMode'

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

// Init runs once per client page load, even though several components call this
// composable (header toggle, Scalar config). Guarded by `import.meta.client`, so
// module scope is per browser tab — never shared across SSR requests.
let clientInitialized = false

/**
 * Site-wide light/dark/auto color mode.
 *
 * State owner: the choice is persisted to `localStorage` and reflected as an
 * `html.fd-theme--{mode}` class. Dark token values are scoped under those classes
 * in `app/assets/css/color-modes.css`; `auto` resolves to the OS preference purely
 * in CSS (a `prefers-color-scheme` media query), so no JavaScript is needed to
 * follow the system once the class is present.
 *
 * The pre-hydration script in `nuxt.config.ts` applies the stored class before
 * first paint (anti-FOUC); this composable keeps it in sync at runtime and exposes
 * a concrete `resolvedMode` for consumers that cannot read CSS media state
 * themselves (e.g. Scalar's `darkMode` boolean).
 *
 * @returns Reactive color-mode state and a setter.
 */
export function useColorMode() {
	// SSR-safe shared state: renders as DEFAULT_COLOR_MODE on the server, then the
	// stored choice is read on the client in onMounted (after hydration) so there is
	// no hydration mismatch. The FOUC script has already corrected the DOM class.
	const mode = useState<ColorMode>( 'fd-color-mode', () => DEFAULT_COLOR_MODE )
	const systemPrefersDark = useState<boolean>( 'fd-color-mode-system-dark', () => false )

	/** Concrete light/dark used by non-CSS consumers; resolves `auto` via the OS. */
	const resolvedMode = computed<'light' | 'dark'>( () => {
		if ( mode.value === 'auto' ) {
			return systemPrefersDark.value ? 'dark' : 'light'
		}
		return mode.value
	} )

	/**
	 * Narrows an arbitrary stored string to a known color mode.
	 *
	 * @param value - Raw localStorage value.
	 * @returns Whether the value is a supported color mode.
	 */
	function isColorMode( value: string | null ): value is ColorMode {
		return value !== null && ( COLOR_MODES as readonly string[] ).includes( value )
	}

	/**
	 * Applies the active mode's theme class to `<html>` (client only).
	 *
	 * @param next - Mode whose class should be present.
	 */
	function applyThemeClass( next: ColorMode ): void {
		if ( !import.meta.client ) {
			return
		}
		const element = document.documentElement
		element.classList.remove( ...COLOR_MODE_CLASSES )
		element.classList.add( colorModeClass( next ) )
	}

	/**
	 * Sets, persists, and applies the color mode.
	 *
	 * @param next - New color-mode choice.
	 */
	function setMode( next: ColorMode ): void {
		mode.value = next
		if ( !import.meta.client ) {
			return
		}
		try {
			window.localStorage.setItem( COLOR_MODE_STORAGE_KEY, next )
		} catch {
			// Private-mode / disabled storage: keep the in-memory choice for this session.
		}
		applyThemeClass( next )
	}

	onMounted( () => {
		const mediaQuery = window.matchMedia( DARK_MEDIA_QUERY )
		systemPrefersDark.value = mediaQuery.matches

		if ( clientInitialized ) {
			return
		}
		clientInitialized = true

		// Keep `resolvedMode` live so `auto` tracks OS changes for Scalar. The CSS
		// media query handles the token swap without help, so no class change here.
		mediaQuery.addEventListener( 'change', ( event ) => {
			systemPrefersDark.value = event.matches
		} )

		let stored: string | null = null
		try {
			stored = window.localStorage.getItem( COLOR_MODE_STORAGE_KEY )
		} catch {
			// Ignore; fall back to the default.
		}

		const initial = isColorMode( stored ) ? stored : DEFAULT_COLOR_MODE
		mode.value = initial
		// Idempotent with the FOUC script; corrects the class if storage changed
		// in another tab before this page hydrated.
		applyThemeClass( initial )
	} )

	return {
		mode,
		resolvedMode,
		setMode,
		colorModes: COLOR_MODES
	}
}
