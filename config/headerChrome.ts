/**
 * Header chrome layout constants for the shell utility row.
 *
 * Collapse is driven by a `ResizeObserver` on `.shell-header-utility-actions` comparing
 * the allocated flex track width to {@link HEADER_UTILITY_COLLAPSE_THRESHOLD_PX}.
 *
 * @see DESIGN_REQUIREMENTS.md → Header (utility row + primary navigation)
 */

/** Codex `CdxSearchInput` minimum inline size (px) — responsive collapse trigger. */
export const HEADER_SEARCH_INPUT_MIN_INLINE_SIZE_PX = 256

/** Search minimum inline size as rem for CSS custom properties (16px root). */
export const HEADER_SEARCH_INPUT_MIN_INLINE_SIZE = '16rem'

/**
 * Fixed-width estimates for expanded utility controls (settings, full language select,
 * log in) used to compute the collapse threshold — not for runtime layout measurement.
 */
export const HEADER_UTILITY_COLLAPSE_ESTIMATES = {
	settingsButtonPx: 32,
	languageSelectMinPx: 128,
	loginLinkMinPx: 112,
	gapPx: 16,
	gapCount: 3
} as const

/**
 * Inline size (px) below which the utility row switches to compact mode: search icon,
 * compact language select (icon + code), and overflow menu (settings + log in).
 */
export const HEADER_UTILITY_COLLAPSE_THRESHOLD_PX =
	HEADER_SEARCH_INPUT_MIN_INLINE_SIZE_PX
	+ HEADER_UTILITY_COLLAPSE_ESTIMATES.settingsButtonPx
	+ HEADER_UTILITY_COLLAPSE_ESTIMATES.languageSelectMinPx
	+ HEADER_UTILITY_COLLAPSE_ESTIMATES.loginLinkMinPx
	+ ( HEADER_UTILITY_COLLAPSE_ESTIMATES.gapCount * HEADER_UTILITY_COLLAPSE_ESTIMATES.gapPx )
