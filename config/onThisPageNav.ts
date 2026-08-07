/**
 * On-this-page (in-page section) navigation thresholds and breakpoints.
 *
 * End-column TOC at {@link ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX}+;
 * quiet header MenuButton below that width (Figma Off-wiki 50:2563).
 * Visibility also requires ≥ {@link ON_THIS_PAGE_NAV_MIN_H2_COUNT} `h2` sections.
 *
 * @see ARCHITECTURE.md → On-this-page navigation
 * @see DESIGN_REQUIREMENTS.md → On-this-page navigation
 */

/** Minimum number of `h2` headings required before the TOC is shown. */
export const ON_THIS_PAGE_NAV_MIN_H2_COUNT = 3

/**
 * Min viewport width (px) for the end-column TOC.
 * Not a Codex breakpoint — Figma on-this-page chrome (1280).
 */
export const ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX = 1280

/**
 * Max viewport width (px) for the header MenuButton layout
 * (`END_PANEL_MIN - 1`). Kept in config so the complementary breakpoint is not
 * hardcoded beside {@link ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX}; layout
 * uses `min-width: END_PANEL_MIN` / its negation rather than this constant.
 */
export const ON_THIS_PAGE_NAV_HEADER_MAX_VIEWPORT_PX =
	ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX - 1
