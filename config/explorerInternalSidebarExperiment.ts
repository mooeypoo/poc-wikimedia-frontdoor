/**
 * Experiment flag: use Scalar's built-in operation sidebar on the Explorer page
 * instead of the frontdoor-built module endpoints rail (`ExplorerModuleRail`).
 *
 * When enabled:
 *  - The manual endpoints rail is not rendered/teleported (the component and its
 *    wiring are left intact — this is a pure show/hide experiment).
 *  - Scalar's internal sidebar is enabled via `showSidebar` (see `config/scalar.ts`).
 *  - The Explorer reference panel stretches into the reclaimed end column so
 *    Scalar takes the freed horizontal space (see `app/layouts/default.vue`).
 *
 * Flip back to `false` to restore the manual endpoints rail.
 */
export const EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR = true
