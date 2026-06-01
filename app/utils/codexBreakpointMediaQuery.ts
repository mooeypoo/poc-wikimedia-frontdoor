/**
 * Codex breakpoint token names on :root (theme-wikimedia-ui.css).
 * @see https://doc.wikimedia.org/codex/latest/design-tokens/breakpoint.html
 */
const MIN_WIDTH_BREAKPOINT_CUSTOM_PROPERTY = {
	tablet: '--min-width-breakpoint-tablet',
	desktop: '--min-width-breakpoint-desktop',
	'desktop-wide': '--min-width-breakpoint-desktop-wide'
} as const

const MAX_WIDTH_BREAKPOINT_CUSTOM_PROPERTY = {
	mobile: '--max-width-breakpoint-mobile',
	tablet: '--max-width-breakpoint-tablet',
	desktop: '--max-width-breakpoint-desktop'
} as const

/** Fallback px values when computed styles are unavailable (SSR). */
const MIN_WIDTH_FALLBACK_PX = {
	tablet: '640px',
	desktop: '1120px',
	'desktop-wide': '1680px'
} as const

const MAX_WIDTH_FALLBACK_PX = {
	mobile: '639px',
	tablet: '1119px',
	desktop: '1679px'
} as const

export type CodexMinWidthBreakpoint = keyof typeof MIN_WIDTH_BREAKPOINT_CUSTOM_PROPERTY
export type CodexMaxWidthBreakpoint = keyof typeof MAX_WIDTH_BREAKPOINT_CUSTOM_PROPERTY

/**
 * Reads a Codex breakpoint custom property from :root.
 *
 * @param customPropertyName - CSS variable name including leading `--`.
 * @param fallbackPx - Value used when the property is empty (e.g. during SSR).
 * @returns Trimmed token value (e.g. `1120px` or `calc( 1120px - 1px )`).
 */
function readBreakpointToken( customPropertyName: string, fallbackPx: string ): string {
	if ( typeof document === 'undefined' ) {
		return fallbackPx
	}

	const tokenValue = getComputedStyle( document.documentElement )
		.getPropertyValue( customPropertyName )
		.trim()

	return tokenValue || fallbackPx
}

/**
 * Builds a `matchMedia` query for a Codex min-width breakpoint.
 *
 * @param breakpoint - Codex breakpoint id (`tablet`, `desktop`, `desktop-wide`).
 * @returns Media query string, e.g. `(min-width: 1120px)`.
 */
export function getMinWidthMediaQuery( breakpoint: CodexMinWidthBreakpoint ): string {
	const customPropertyName = MIN_WIDTH_BREAKPOINT_CUSTOM_PROPERTY[ breakpoint ]
	const fallbackPx = MIN_WIDTH_FALLBACK_PX[ breakpoint ]
	const minWidth = readBreakpointToken( customPropertyName, fallbackPx )

	return `(min-width: ${ minWidth })`
}

/**
 * Builds a `matchMedia` query for a Codex max-width breakpoint.
 *
 * @param breakpoint - Codex breakpoint id (`mobile`, `tablet`, `desktop`).
 * @returns Media query string, e.g. `(max-width: calc( 1120px - 1px ))`.
 */
export function getMaxWidthMediaQuery( breakpoint: CodexMaxWidthBreakpoint ): string {
	const customPropertyName = MAX_WIDTH_BREAKPOINT_CUSTOM_PROPERTY[ breakpoint ]
	const fallbackPx = MAX_WIDTH_FALLBACK_PX[ breakpoint ]
	const maxWidth = readBreakpointToken( customPropertyName, fallbackPx )

	return `(max-width: ${ maxWidth })`
}
