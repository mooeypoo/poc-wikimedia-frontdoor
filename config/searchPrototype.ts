/**
 * Presentation knobs for the global search design prototype.
 *
 * Branch `design-global-search`, stacked on PR #66 (`search-api-modules`).
 * Does **not** change MiniSearch boosts, FTS collections, or deep-link
 * generation — only panel chrome, category filtering, and disclosure.
 *
 * Primary source: Developer Portal Global Search Requirements (v1 Draft).
 * Pure Claude sections (a11y, matching, security, non-functional, no-JS)
 * come from the Consolidated Requirements PDF.
 *
 * @see DESIGN_REQUIREMENTS.md → Global search design prototype
 */

/** Category chip ids for the fixed menu header (Figma filter chips). */
export type SearchPrototypeCategory = 'all' | 'endpoints' | 'documentation'

/**
 * How many result rows are visible before the list scrolls / load-more fires.
 * Requirements default: 7 (not counting the chip header or fallback divider).
 */
export const SEARCH_PROTOTYPE_VISIBLE_ITEM_LIMIT = 7

/**
 * How many additional rows `load-more` appends each time.
 * QUESTION: chunk size is an open question in the requirements — 7 mirrors the
 * visible window until design locks a value.
 */
export const SEARCH_PROTOTYPE_LOAD_MORE_CHUNK_SIZE = 7

/**
 * Upper bound when fetching endpoint hits for the prototype panel.
 * Kept modest so All-view relevance mixing (and the English-fallback tier after
 * it) remains reachable without endless load-more through endpoints alone.
 * Ranking still comes from MiniSearch; this only caps the display pool.
 */
export const SEARCH_PROTOTYPE_ENDPOINT_RESULT_POOL = 12

/**
 * Approximate plain-text snippet length for documentation / endpoint
 * descriptions in the menu (requirements: ~120 characters).
 */
export const SEARCH_PROTOTYPE_SNIPPET_MAX_LENGTH = 120

/**
 * Pending indicator delay (ms) before showing the searching state.
 * Codex TypeaheadSearch default is 500 ms (RES-12 / UI pending).
 */
export const SEARCH_PROTOTYPE_PENDING_DELAY_MS = 500

/**
 * Live-region clear→rewrite delay (ms) so identical status text is re-announced.
 */
export const SEARCH_PROTOTYPE_STATUS_ANNOUNCE_DELAY_MS = 100

/**
 * Delay (ms) before announcing “Searching…” when a query stays in flight.
 * Distinct from {@link SEARCH_PROTOTYPE_PENDING_DELAY_MS} (visual pending bar).
 */
export const SEARCH_PROTOTYPE_SLOW_SEARCH_ANNOUNCE_MS = 1000

/**
 * Whether to hide PR #66's "Search all languages" expansion.
 * Primary §4: no cross-language search action; UI language + English only.
 */
export const SEARCH_PROTOTYPE_HIDE_ALL_LANGUAGES_CTA = true
