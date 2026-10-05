/**
 * Surface tokens for explorer project controls (and shared exploratory radius
 * consumers). The former module rail is not product UX (PR #40).
 *
 * CSS custom properties in `app/assets/css/page-grid.css`
 * (`--fd-explorer-controls-surface-*`) must stay in sync with these values.
 *
 * Background uses the Codex neutral-subtle token (not a fixed hex) so light and
 * dark modes keep readable contrast on control chrome.
 *
 * Border radius is an exploratory **4px** value — not a Codex design token
 * (Codex `--border-radius-base` is **2px**). It is under consideration as a
 * future system default. Account list-element cards, the Reset success
 * credentials panel, content **`NavigationCard`**, **`.fd-highlight`** /
 * **`Highlight`**, **`CodeBlock`**, **`CodeTabs`**, and the Explorer
 * **Test Request** dialog (UI exploration under `--client-modal-open`)
 * consume the mirrored CSS variable
 * `--fd-explorer-controls-surface-border-radius` (do not hardcode `4px` there).
 *
 * Test Request shell-clamp knobs (`EXPLORER_TEST_REQUEST_*`) pair with
 * `--fd-explorer-test-request-modal-padding` in `explorer-codex-overrides.css`
 * and `useScalarClientModalBackgroundScrollLock` — keep gutter in sync with
 * Codex **`--spacing-250`**.
 *
 * Back-to-top insets (`EXPLORER_BACK_TO_TOP_*`) match Figma 1696:27981 —
 * viewport block-end **32px** (`--spacing-200`) and Scalar-shell inline-end
 * **16px** (`--spacing-100`).
 */
export const EXPLORER_CONTROLS_SURFACE_BACKGROUND_COLOR = 'var(--background-color-neutral-subtle)'

/** Border radius (px) for shared exploratory surfaces — not a Codex token (see file JSDoc). */
export const EXPLORER_CONTROLS_SURFACE_BORDER_RADIUS_PX = 4

/**
 * Test Request modal gutter on each side (px).
 * Must match Codex `--spacing-250` and CSS `--fd-explorer-test-request-modal-padding`.
 */
export const EXPLORER_TEST_REQUEST_MODAL_GUTTER_PX = 40

/**
 * Minimum change (px) before updating `--fd-explorer-test-request-shell-block-size`.
 * Prevents ResizeObserver + subpixel layout from chasing ~1px/s.
 */
export const EXPLORER_TEST_REQUEST_SHELL_BLOCK_SIZE_UPDATE_THRESHOLD_PX = 2

/**
 * Distance from the viewport block-end to the explorer “Back to top” button (px).
 * Matches Codex `--spacing-200` (32px) — Figma 1696:27981.
 */
export const EXPLORER_BACK_TO_TOP_VIEWPORT_BLOCK_END_INSET_PX = 32

/**
 * Distance from the Scalar shell’s inline-end border to the “Back to top” button (px).
 * Matches Codex `--spacing-100` (16px) — Figma 1696:27981.
 */
export const EXPLORER_BACK_TO_TOP_SHELL_INLINE_END_INSET_PX = 16

/**
 * Body-scroll offset (px) before the “Back to top” control is shown.
 */
export const EXPLORER_BACK_TO_TOP_REVEAL_SCROLL_PX = 320
