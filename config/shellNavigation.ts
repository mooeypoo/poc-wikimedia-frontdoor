/**
 * Shell primary / section navigation collapse constants.
 *
 * Collapse uses a single intrinsic-width vs row-width comparison with hysteresis
 * (see `useShellNavigationCollapse`).
 *
 * @see DESIGN_REQUIREMENTS.md → Primary navigation collapse
 */

/** Minimum trailing inline space (px) required after the API Explorer link — Codex `--spacing-150` (24px). */
export const SHELL_NAV_COLLAPSE_PADDING_PX = 24

/**
 * Extra trailing inline space (px) required before expanding again — prevents
 * oscillation when the row is near the fit threshold (e.g. ~1050px viewports).
 */
export const SHELL_NAV_EXPAND_HYSTERESIS_PX = 24

/** Trailing inline space (px) required to leave collapsed mode — collapse padding + hysteresis. */
export const SHELL_NAV_EXPAND_PADDING_PX =
	SHELL_NAV_COLLAPSE_PADDING_PX + SHELL_NAV_EXPAND_HYSTERESIS_PX

/**
 * @deprecated Use {@link SHELL_NAV_COLLAPSE_PADDING_PX}. Retained for doc references.
 */
export const SHELL_NAV_MIN_PADDING_AFTER_EXPLORER_PX = SHELL_NAV_COLLAPSE_PADDING_PX
