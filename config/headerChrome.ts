/**
 * Header chrome layout constants for the shell utility row.
 *
 * Collapse is driven by a `ResizeObserver` on `.shell-header-utility-actions` comparing
 * the allocated flex track width to {@link HEADER_UTILITY_COLLAPSE_THRESHOLD_PX}.
 *
 * Expanded option spacing (must stay in sync with `ShellHeaderUtilityActions` CSS):
 * - search → preferences: `--spacing-100` (16px)
 * - preferences → language → session: `--spacing-50` (8px) via `column-gap`
 *
 * @see DESIGN_REQUIREMENTS.md → Header (utility row + primary navigation)
 */

/** Codex `CdxSearchInput` minimum inline size (px) — responsive collapse trigger. */
export const HEADER_SEARCH_INPUT_MIN_INLINE_SIZE_PX = 256

/** Search minimum inline size as rem for CSS custom properties (16px root). */
export const HEADER_SEARCH_INPUT_MIN_INLINE_SIZE = '16rem'

/**
 * Fixed-width estimates for expanded utility controls (settings, language trigger,
 * log in) used to compute the collapse threshold — not for runtime layout measurement.
 *
 * Gap fields match the CSS tokens in `ShellHeaderUtilityActions`
 * (`column-gap: --spacing-50`; search wrap adds another `--spacing-50` toward preferences).
 */
export const HEADER_UTILITY_COLLAPSE_ESTIMATES = {
	settingsButtonPx: 32,
	languageSelectMinPx: 128,
	loginLinkMinPx: 112,
	/** `--spacing-100` between search input and preferences button. */
	searchToPreferencesGapPx: 16,
	/** `--spacing-50` between preferences↔language and language↔session. */
	optionGapPx: 8,
	/** Option-gap slots after preferences (language, then session). */
	optionGapCountAfterPreferences: 2
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
	+ HEADER_UTILITY_COLLAPSE_ESTIMATES.searchToPreferencesGapPx
	+ ( HEADER_UTILITY_COLLAPSE_ESTIMATES.optionGapCountAfterPreferences
		* HEADER_UTILITY_COLLAPSE_ESTIMATES.optionGapPx )

/**
 * Codex `MenuConfig.visibleItemLimit` for the interface-language `CdxLookup` menu.
 * Codex recommends generally 5–7 visible items before scrolling (“magical number seven”).
 * See `ARCHITECTURE.md` → Codex exceptions (shell chrome) #8 for how the Lookup popover
 * keeps this limit when Floating UI would otherwise apply a viewport maxHeight.
 */
export const HEADER_LANGUAGE_MENU_VISIBLE_ITEM_LIMIT = 7

/**
 * Cap on language menu items passed to `CdxLookup` for render performance (~575 catalog
 * languages). Distinct from {@link HEADER_LANGUAGE_MENU_VISIBLE_ITEM_LIMIT} (scroll height);
 * typing narrows the list further. The active language is always kept present.
 */
export const HEADER_LANGUAGE_MENU_ITEM_RENDER_CAP = 50
