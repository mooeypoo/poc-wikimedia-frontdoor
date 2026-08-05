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
 */
export const EXPLORER_CONTROLS_SURFACE_BACKGROUND_COLOR = 'var(--background-color-neutral-subtle)'

/** Border radius (px) for shared exploratory surfaces — not a Codex token (see file JSDoc). */
export const EXPLORER_CONTROLS_SURFACE_BORDER_RADIUS_PX = 4
