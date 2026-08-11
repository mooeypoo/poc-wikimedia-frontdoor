/**
 * Product decision (PR #40): community Explorer uses Scalar’s built-in operation
 * sidebar instead of the frontdoor-built module endpoints rail (`ExplorerModuleRail`).
 *
 * When `true` (current default):
 *  - The custom endpoints rail is not rendered/teleported (component + wiring remain
 *    for rollback only — not the product UX).
 *  - Scalar’s internal sidebar is enabled via `showSidebar` (see `config/scalar.ts`).
 *  - The Explorer reference panel stretches into the reclaimed end column
 *    (`.frontdoor-shell--explorer-internal-sidebar` in `app/layouts/default.vue`).
 *
 * Set to `false` only to temporarily restore the custom rail for comparison.
 */
export const EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR = true
