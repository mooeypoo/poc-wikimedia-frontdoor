# DESIGN_REQUIREMENTS.md — Front Door Developer Portal

This document records **UI/UX design decisions** introduced during the **design exploration** work on the `design` branch (Cursor-assisted implementation, May 2026). It complements:

- **`ARCHITECTURE.md`** — system structure, data flow, and technical constraints
- **`AGENTS.md`** — non-negotiable implementation rules (i18n, BiDi, Codex, layer separation)
- **`docs/TECH_DECISIONS.md`** — settled product/tech choices (stack, discovery, instances)

Use this file when implementing or reviewing visual behaviour, layout, navigation, and explorer interaction patterns. Where this document conflicts with **`AGENTS.md`**, **`AGENTS.md` wins**.

---

## Scope of the design exploration

The design branch extends Experiment 1 (Scalar multi-spec explorer) with a **product-shaped shell**: site grid, header chrome, primary navigation, placeholder content sections, and a three-column API Explorer layout (left doc nav, centre reference, right module rail).

**In scope (implemented as design exploration):**

- **Layout system** — Codex responsive grid (mobile 4-col, tablet 8-col, desktop / desktop-wide 24-col), 2-panel desktop pattern, and shell column split; see **Layout system** below for full specification and prototype status
- Shell header with search, settings, language, and login placeholders
- Primary site navigation below the header
- API Explorer page layout, module rail, project controls, loading states
- Scalar visual alignment with Codex tokens

**Explicitly prototype / not final:**

- The site is not yet fully responsive
- Search, settings, and login controls are present but **disabled** or non-functional
- API Explorer page's **left side nav** links use `href="#"` and do not route anywhere
- Learn, Enterprise, Community, Contribute, and Get help pages are **empty Markdown stubs**
- Opt-in filters (beta / internal endpoints) are **UI only** — not wired to spec filtering
- Full reload when crossing `/explorer` boundary (UX trade-off for reliability; see `ARCHITECTURE.md`)
- **Shell chrome layout** (`design-chrome` branch): full-viewport header band; start column **always mounted** (empty panel when no section links); **transparent** panel with **`border-inline-end`** (`--border-color-subtle`); **281px** fixed width; **static site footer** (`ShellSiteFooter`) inside main content column with **48px** bottom inset

---

## Information architecture

### Primary site navigation

**Decision:** Primary nav tabs (Figma [Header node 284:11443](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=284-11443)):

| Order | Label (en) | Route | Notes |
|------:|------------|-------|--------|
| 1 | Get started | `/` | Locale-prefixed when not default |
| 2 | Use content and data | `/use-content-and-data` | Former **Learn** content and section nav |
| 3 | Tools and bots | `/tools-and-bots` | Empty section nav — start panel still shown |
| 4 | Contribute | `/contribute` | Stub |
| 5 | Community | `/community` | Stub |
| 6 | Get help | `/get-help` | Stub |
| 7 | Remote MD | `/demo-remote-markdown` | Experimental; merged from `REMOTE_CONTENT_SOURCES` |

**API Explorer** is a **separate progressive link** with `cdxIconArrowNext` (not a tab) → `/explorer` (`i18n: false`).

**Removed from primary nav (v2 IA):** API Explorer tab, Enterprise, About. **About** and **Enterprise** markdown pages are removed; legacy URLs redirect to home (`/` or `/{locale}`).

**Learn rename:** `/learn` → `/use-content-and-data` (301) for all locale prefixes. See `config/contentRedirects.ts`.

### Legacy content redirects

**Decision:** Retired routes redirect with HTTP **301** via `config/contentRedirects.ts` → `nuxt.config.ts` `routeRules`:

| Legacy path | Target |
|-------------|--------|
| `/learn` | `/use-content-and-data` |
| `/about` | `/` |
| `/enterprise` | `/` |

Locale-prefixed paths use the same mapping (e.g. `/fr/learn` → `/fr/use-content-and-data`). **About** and **Enterprise** markdown files are **removed** from `content/`; only redirects serve old URLs.

**Source:** `config/mainNavigation.ts`, `config/remoteContentSources.ts`, `config/contentRedirects.ts`, `nuxt.config.ts`, banana-i18n (`nav-*` keys).

### Brand logo

**Decision:** The **header** shows a compact lockup: 32px Wikimedia mark (`public/images/developer-portal-logo-mark.svg`, SVG from design) plus two-line wordmark via banana-i18n (`brand-wordmark-*`). Links to **Get started** through `ShellHeaderBrand.vue` (`aria-label` from `app-title` — no duplicate visible app-title text). The start column no longer shows a logo — only section navigation when applicable.

**Status:** **Prototype asset** — Figma specifies Montserrat; shell uses Codex typography until brand fonts ship.

**Source:** `app/components/shared/ShellHeaderBrand.vue`, `app/composables/useMainNavigationLinks.ts`.

### Start column section navigation

**Decision:** Every page mounts the **start column panel** (`.shell-side-panel`). When section config defines links, the column shows a **flat** vertical section menu (no logo in the start column — brand lives in the header). When sections are **empty** (e.g. **Tools and bots**) or the route has no dedicated config, the panel still renders — only the `<nav>` is omitted.

- **Section headings** (bold) and **page links** share one list — no nested sub-menus or extra indent for items under a heading.
- **Horizontal dividers** (`--border-color-subtle`) separate section groups within the menu.
- **Panel edge:** **`border-inline-end: 1px solid var(--border-color-subtle)`** on `.fd-page-grid__start` (`default.vue`) — **no** filled panel background. Supersedes the earlier `#F3F3F3` background exploration (`--fd-layout-start-panel-background-color` retained in `page-grid.css` but **unused**).
- **Full-height panel (tablet+):** the start column track spans from below the header band to the **bottom of the viewport** (`min-block-size: 100%` on the page grid and start panel).
- **Fixed width** **281px** (`--fd-layout-start-panel-inline-size` = Figma **241px** + one Codex **40px** desktop grid column) at tablet and above — **wider than Figma** side-panel spec; collapse into the header is **deferred**.
- **Item hover:** non-selected menu item labels turn **`--color-progressive`** on hover (custom CSS — see **Codex exceptions** below).
- **Exactly one** menu item shows a selected state at a time (current page). On Get started (`/`), only **Introduction** is selected.

**Content sources:**

| Primary nav | Config | Notes |
|-------------|--------|-------|
| Get started, Use content and data, Community, Contribute, Get help | `config/sectionNavigation.js` | IA from Developer Portal v2 |
| Tools and bots | `config/sectionNavigation.js` | **Empty** sections array — panel shown, no `<nav>` |
| API Explorer | `config/explorerSideNav.js` | Two sections: API Explorer + Overview placeholders |

**Rendering:** `usePageSectionNav()` → `.shell-side-panel` always in `app/layouts/default.vue`; `ShellSidePanelNav.vue` when sections are non-empty. Labels via banana-i18n only.

**Codex exceptions:**

1. **`CdxMenuItem` standalone** — used **outside** `CdxMenu`. Approved for this static shell list; do not reuse for floating menus without review.
2. **Section nav hover colour** — custom `:hover` CSS sets **`--color-progressive`** on non-selected item labels. Codex `CdxMenuItem` hover normally changes **background only** (`--background-color-interactive-subtle--hover`), not unselected text colour. Because items are outside `CdxMenu`, the `highlighted` prop is never toggled (parent menu normally handles `@change`); shell styles must target **`:hover`**, not `.cdx-menu-item--highlighted`. Selected items use Codex’s built-in progressive styling via `cdx-menu-item--selected`.

**Status:** **Visual/IA prototype only.** All item links use `href="#"` with `@click.prevent`. Active state comes from `PROTOTYPE_ACTIVE_ITEM_BY_CONTENT_PATH` in `usePageSectionNav.ts` (content routes) or `isActive` in `explorerSideNav.js` (explorer). Wiring to real content routes is future work.

**Superseded:** `ExplorerSideNav.vue` is no longer mounted; explorer uses the shared side panel component.

**Design reference:** [Unified Developer Front Door — Navigation (Figma)](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=225-4548)

---

## Layout system

Layout follows the **Codex responsive grid** and the **2-panel desktop layout** pattern so the shell can host section navigation (left) and page-level navigation (e.g. API Explorer module rail) beside primary content.

**Design reference:** [Codex — 2-panel desktop layout (Figma)](https://www.figma.com/design/KoDuJMadWBXtsOtzGS4134/Codex?m=auto&node-id=29258-10335&t=J1XPwW1kabNcWMB6-1)

### Responsive breakpoints (design specification)

| Breakpoint | Viewport width | Grid | Gutter | Start / end page margins | Content width |
|------------|----------------|------|--------|---------------------------|---------------|
| **Mobile** | 320px–639px | **4 columns** | 16px | 16px | Fluid within margins |
| **Tablet** | 640px–1119px | **8 columns** | 24px | 24px | Fluid within margins |
| **Desktop** | 1120px–1679px | **24 columns** | 24px | 32px | Fluid within margins |
| **Desktop wide** | ≥ 1680px | **24 columns** (40px column width) | 24px | **Grow with viewport** | **Fixed** at desktop maximum width; extra space becomes margin |

**Header chrome width (project-specific):** The header **band** spans the full viewport. Inner content (`.frontdoor-shell__chrome-inner`) is centred with Codex page margins and locks at **`--fd-layout-grid-content-max-inline-size`** at **≥ 1440px**. Header brand and primary nav align at the same inline-start inset as the start column menu (**`--spacing-200`** at tablet+).

**Desktop wide behaviour:** At viewports wider than 1679px, the **page content block keeps the same width** as at 1679px; only the **outer start and end margins increase**. Main and end columns share remaining space in a **16:4** ratio (`4fr` / `1fr` grid tracks).

**Rationale:** Aligns with Codex layout tokens and Wikimedia portal conventions; wide screens avoid over-long line lengths in the main column.

### Shell column distribution (desktop)

On **desktop** and **desktop wide**, the implemented shell uses a **fixed start panel** plus fluid main and end columns:

| Area | Width | Role |
|------|-------|------|
| **Start** | **281px fixed** (Figma 241px + 40px grid column) | Section navigation only (`ShellSidePanelNav`) when the route has sections |
| **Main** | **4fr** (≈16/20 of remainder) | Header utilities, primary nav, page content |
| **End** | **1fr** (≈4/20 of remainder) | Reserved on all pages; on `/explorer`, API Explorer **module rail** (teleported to `#explorer-end-panel`) |

On **desktop** and **desktop wide**, both side columns are **always present** in the grid. Non-explorer routes keep the end column as empty reserved space for future page-level navigation.

**Column gutters:** Uniform **`--fd-layout-grid-gutter`** (`--spacing-150`, **24px** at tablet and desktop) between all grid columns, including between the start panel and main column.

**Note:** The Codex **4 \| 16 \| 4** mental model is preserved via the main:end **16:4** ratio; the start column is **not** a fluid grid fraction — it is locked to a **fixed** width (currently **281px**, wider than the Figma side-panel spec) until responsive collapse is implemented.

**Source (prototype):** `app/assets/css/page-grid.css`, `app/components/shared/PageGrid.vue`.

**Breakpoints:** Media queries use [Codex breakpoint tokens](https://doc.wikimedia.org/codex/latest/design-tokens/breakpoint.html) from `theme-wikimedia-ui.css` (e.g. `--min-width-breakpoint-tablet`, `--max-width-breakpoint-desktop`). JavaScript `matchMedia` helpers: `app/utils/codexBreakpointMediaQuery.ts`.

### Implementation status

| Design spec | Status | Implementation |
|-------------|--------|------------------|
| Mobile 320px–639px (4-col tokens, 16px gutter/margins, stacked) | **Implemented** | `page-grid.css` — `--spacing-100` page margin and gutter |
| Tablet 640px–1119px (fixed start + fluid main, 24px gutter/margins) | **Interim** | `page-grid.css` — `281px` start + `1fr` main; end panel hidden until desktop |
| Desktop 1120px–1679px (fixed start + 4fr \| 1fr main:end, 32px margins) | **Implemented** | `page-grid.css` — `--spacing-200` page margin; both side panels on sides, always reserved |
| Desktop wide ≥ 1680px (fixed 1679px shell, fixed start + 16:4 main:end) | **Implemented** | `page-grid.css` — `@media (min-width: 1680px)`, `--max-width-breakpoint-desktop` cap |
| Header chrome fluid width (&lt; 1440px viewport) | **Implemented** | `default.vue` — full-bleed band; centred inner wrapper |
| Header / start nav inline-start alignment | **Implemented** | `default.vue` — shared `--spacing-200` inset (Figma 225:4548) |
| Header chrome width lock (≥ 1440px viewport) | **Implemented** | `page-grid.css` + `default.vue` — `--fd-layout-grid-content-max-inline-size` |
| Section nav below header | **Implemented** | Start column in `PageGrid`; header outside grid in `.frontdoor-shell__chrome-band` |
| Start column inline-end border | **Implemented** | `default.vue` — `border-inline-end` with `--border-color-subtle` on `.fd-page-grid__start` |
| Start column width 281px | **Implemented** | `page-grid.css` — `--fd-layout-start-panel-inline-size` (Figma 241px + 40px grid column) |
| Section nav item hover (`--color-progressive`) | **Implemented** | `ShellSidePanelNav.vue` — custom `:hover` CSS; **Codex exception** (see Start column section navigation) |
| Static site footer (Figma 393:4639) | **Implemented** | `ShellSiteFooter.vue`, `config/siteFooter.ts`, inside `frontdoor-shell__content` |
| Footer width (main column only) | **Implemented** | Footer sibling of `.frontdoor-shell__main` — matches central page content; not main + end |
| Footer short-page bottom pin + 48px inset | **Implemented** | `.frontdoor-shell__content` flex column + main `flex: 1`; `padding-block-end: --spacing-300` on `.shell-site-footer`; tablet+ `min-block-size: 100%` on `.fd-page-grid__main` |
| Start panel always mounted | **Implemented** | `default.vue` — `.shell-side-panel` on every route; `ShellSidePanelNav` when sections exist |
| Start panel full viewport height (tablet+) | **Implemented** | `default.vue` — `min-block-size: 100%` on grid + start panel below header band |

**Responsive behaviour summary:**

| Viewport | Shell layout |
|----------|----------------|
| **&lt; 640px** | **Interim:** header band, then start panel (nav when sections exist), then main, then footer; main **`flex: 1`** on short pages pins footer to shell bottom |
| **640px–1119px** | **Interim:** **281px** fixed start beside fluid main column (start nav height matches main cell, which includes footer); footer in **main column only**; end panel hidden until desktop |
| **≥ 1120px** | Fixed **281px** start + **4fr \| 1fr** main:end; footer in **main column only** (does not span end panel — **Figma deviation**); **`border-inline-end`** on start column |
| **≥ 1680px** | Same tracks; grid box **max 1679px** centered |

**Note:** `@media` conditions in `page-grid.css` and `default.vue` use **px literals** aligned to Codex breakpoint tokens (`640px`, `1120px`, `1680px`) plus the project-specific **`1440px`** header lock, because custom properties are unreliable in media query conditions.

### Explorer layout (module rail and reference panel)

**Decision:** On `/explorer`, the **end** column hosts a teleported **module rail** (`#explorer-end-panel`). The **main** column holds project controls and the Scalar reference panel.

**Below desktop (&lt; 1120px):** Side panels use the interim layout above; module rail and full 2-panel placement are **desktop-only** until side-panel responsive behaviour is implemented.

**Wide (≥ 960px on explorer page):** Reference panel and Scalar shell use sticky, viewport-height scrolling as documented in **API Explorer page layout** below.

---

## Shell chrome

### Summary (design-chrome exploration)

The **`design-chrome`** work reshaped the application shell to match [Unified Developer Front Door (Figma)](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door) layout references. All changes below are **visual/IA prototypes** unless marked functional.

| Change | Implementation | Disclaimer |
|--------|----------------|------------|
| v2 primary nav IA (Figma 284:11443) | `config/mainNavigation.ts`, `useMainNavigationLinks` | Use content and data, Tools and bots; Enterprise/About removed |
| Header brand in utility row | `ShellHeaderBrand.vue`, `developer-portal-logo-mark.svg` | 32px mark + wordmark; `aria-label` only (no visible duplicate app title) |
| API Explorer separate link | `.frontdoor-shell__api-explorer-link` in `default.vue` | Immediately after tabs; **24px** gap (`--spacing-150`); not a tab |
| Legacy URL redirects | `config/contentRedirects.ts` → `nuxt.config` `routeRules` | `/learn`, `/about`, `/enterprise` → 301 |
| Start column section nav | `ShellSidePanelNav`, `usePageSectionNav` | Panel always mounted; nav when sections exist; **Tools and bots** empty |
| Primary nav as Codex quiet tabs | `ShellPrimaryNav`, `usePrimaryNavigationTab` | Tab panels hidden — **navigation-only** Codex exception |
| Two-row header (utility + tabs) | `default.vue` `.frontdoor-shell__chrome` inside full-bleed band | Settings **disabled**; log in **non-functional** |
| Full-viewport header band | `.frontdoor-shell__chrome-band` in `default.vue` | Background + bottom border span viewport; inner content centred |
| Header / start nav aligned at inline-start | Shared `--spacing-200` padding on chrome + start panel | Figma [Navigation 225:4548](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=225-4548) |
| Start column below header | Section nav in `PageGrid` start slot only | Panel always mounted; full height on tablet+ |
| Start panel full viewport height | `min-block-size: 100%` on start panel (tablet+) | Below header to viewport bottom |
| Start column inline-end border | `border-inline-end` on `.fd-page-grid__start` | `--border-color-subtle`; supersedes filled `#F3F3F3` panel |
| Start column width 281px | `--fd-layout-start-panel-inline-size` in `page-grid.css` | Figma 241px + one 40px Codex grid column — **deviation from Figma** |
| Section nav hover colour | `:hover` override in `ShellSidePanelNav.vue` | **Codex exception** — progressive text on non-selected items |
| Footer main column width | `ShellSiteFooter` inside `.frontdoor-shell__content` | Matches central page content; does not span end panel |
| Footer flush under main | Footer is last child in `.frontdoor-shell__content` flex column | Sits directly below page slot — no grid row between main and footer |
| Footer 48px page-bottom inset | `padding-block-end: --spacing-300` on `.shell-site-footer` | Short pages: `.frontdoor-shell__main` `flex: 1` + tablet+ `.fd-page-grid__main` `min-block-size: 100%` pin footer to shell bottom |
| Footer width vs Figma | Main column only — not x=241 / width=1199 (main+end) | **Intentional deviation** from [Navigation 354:33034](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=354-33034) |
| Header utility row (Figma) | `.frontdoor-shell__header-top` + `.frontdoor-shell__header-actions` | **24px** logo–search gap (`--spacing-150`); search **flexes** in header (max **40rem**); language **8–11rem**; container query on actions row |
| Interface language icon on trigger only | `CdxSelect` `#label` slot + `:key="direction"` | Menu items text-only; `isolateLabel()` for BiDi; remount on LTR ↔ RTL |
| Codex RTL sheet toggled on locale switch | `codex-rtl-styles.client.ts` | **`link.disabled`** prototype — prevents stale RTL layout on LTR locales without reload |

**Architecture reference:** `ARCHITECTURE.md` → Shell layout and chrome.

### Header (utility row + primary navigation)

**Decision:** Two-row header chrome in a **full-viewport band** (background and bottom border edge-to-edge). Inner content is centred within Codex page margins and, when section navigation applies, aligned to the **main (+ end) columns** of the page grid:

| Row | Contents |
|-----|----------|
| **Utility (row 1)** | **Brand lockup** (`ShellHeaderBrand`), search (`CdxSearchInput`, flexes up to **640px**), settings (`CdxButton` + configure icon, **disabled** prototype), interface language (`CdxSelect`), Log in link |
| **Primary nav (row 2)** | Codex **quiet** tabs (`ShellPrimaryNav`) plus separate **API Explorer** progressive link (`cdxIconArrowNext`) |

**Width:** The outer band is **full viewport width**. `.frontdoor-shell__chrome-inner` matches `PageGrid` max width and margins. At **≥ 1440px**, inner **`max-inline-size`** locks to `--fd-layout-grid-content-max-inline-size`. At **≥ 1680px**, inner max width matches the Codex desktop-wide grid cap.

**Grid placement:** Header lives **above** `PageGrid` and spans the full centred inner width. Brand lockup and primary nav tabs align at the **inline-start** with the start column section menu below (**`--spacing-200`** inset at tablet+, per Figma [Navigation 225:4548](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=225-4548)). Utility controls remain at the inline-end of the header row.

**Padding:** `--spacing-150` block-start on chrome; `--spacing-150` gap between utility row and tab row; **`padding-inline: var(--spacing-200)`** on `.frontdoor-shell__chrome` at tablet+ (matches start panel inline-start padding).

**Tab layout:** Quiet tab labels use **extra `--spacing-75` (12px) block-end padding** beyond Codex defaults (4px block-start, 12px inline) for alignment with the header bottom border. Tab panels are hidden — navigation only; page content renders in the main slot. **Codex override:** quiet-tabs header **`border-bottom`** is suppressed in `app/assets/css/shell-primary-nav-overrides.css` (imported from `main.css` and re-imported after `codex.style-rtl.css` in `codex-rtl-styles.client.ts`) because `.frontdoor-shell__chrome-band` owns the single header edge (Figma layout). Codex uses a **physical** border property; both `border-block-end` and `border-bottom` are cleared with `!important`.

**Utility row layout (Figma `Header/Default`, node 284:11443):** Row 1 is **`justify-between`** with **`gap: var(--spacing-150)` (24px)** between the brand lockup and the start of the utility controls. `.frontdoor-shell__header-actions` uses **`flex: 1 1 auto`**. Search (`.frontdoor-shell__search-wrap`) uses **`flex: 1 1 auto`** with **`max-inline-size: min(40rem, 100%)`** so it grows and shrinks to fit the header beside settings, language select, and log in. Gaps **within** the actions row remain **`--spacing-100` (16px)**. Container query for search collapse is scoped to **`.frontdoor-shell__header-actions`** so it measures the utility track, not the full header width including the logo.

**Primary nav row (row 2):** `.frontdoor-shell__primary-nav-row` — quiet tabs (`flex: 0 1 auto`) and **API Explorer** link (`flex: 0 0 auto`) on the same baseline. The link sits **immediately after** the last tab with **`gap: var(--spacing-150)` (24px)** — not pushed to the inline-end of the row. Link label from `nav-api`; arrow icon uses **`--color-progressive`**. Active on `/explorer` routes; no tab selected when explorer is active.

**Utility row alignment:** Utility controls (search through log in) are grouped at the **inline-end** in `.frontdoor-shell__header-actions`.

| Element | Behaviour |
|---------|-----------|
| Search (`CdxSearchInput`) | Flexes in the header (max **640px**); collapses to icon-only when the **actions** container is too narrow — **full header responsive deferred** |
| Search icon button | Shown when container &lt; ~640px; **disabled** prototype |
| Settings (`CdxButton` + configure icon) | **Disabled** prototype |
| Interface language (`CdxSelect`) | **Functional** — switches interface locale; on explorer, does not change URL. **Icon on closed select only** — dropdown items are text-only; see below |
| Log in | Text link (`--color-progressive`), `@click.prevent` — **non-functional** prototype |

**Interface language select (icon display):** Per Figma header chrome, the globe icon appears on the **closed** select trigger only — not on each dropdown option. Implementation:

- **`menuItems`** — `value` + `label` only (no `icon` on items).
- **`#label` slot** — renders `CdxIcon` (`cdxIconLanguage`) beside the selected label (or placeholder). **`defaultIcon` is not used** — Codex applies that prop only when no item is selected; the slot keeps the icon visible whenever a locale is active.
- **BiDi** — labels pass through `isolateLabel()` (Unicode FSI/PDI) because Codex menu item labels cannot be wrapped in `<bdi>` (same constraint as combobox options).
- **Width** — `min-inline-size: 8rem`, `max-inline-size: 11rem` on `.frontdoor-shell__language-select`; long locale names ellipsize so the control does not overlap the log in link.
- **LTR ↔ RTL switching** — `:key="direction"` remounts the select; `codex-rtl-styles.client.ts` enables/disables `codex.style-rtl.css` so Codex mirrored rules do not persist after switching back to an LTR interface locale (**prototype workaround** — no full reload required).

**Source:** `app/layouts/default.vue` — `.frontdoor-shell__header-top`, `.frontdoor-shell__header-actions`, `.frontdoor-shell__primary-nav-row`, `.frontdoor-shell__api-explorer-link`, `.frontdoor-shell__language-select`.

**Primary navigation:** `v-model:active` bound to route via `usePrimaryNavigationTab()`; tab select calls `navigateTo()` with locale-aware paths from `useMainNavigationLinks()`. Explorer routes leave **no tab selected** (`activeNavigationId` empty).

**Status:** Visual chrome prototype aligned to [Unified Developer Front Door — header (Figma)](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=284-11443). Header responsive collapse deferred.

**Source:** `app/layouts/default.vue`, `app/components/shared/ShellPrimaryNav.vue`, `app/components/shared/ShellHeaderBrand.vue`, `app/composables/usePrimaryNavigationTab.ts`.

### Primary navigation row (superseded)

**Previous decision:** Horizontal `NuxtLink` list with `router-link-active` styling. **Superseded** by Codex quiet tabs above.

### Footer

**Decision:** Static site footer at the **end of the main content band**, matching Figma Footer node **393:4639** ([Navigation 225:4548](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=225-4548); layout reference [Navigation 354:33034](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=354-33034)).

**Placement:** Rendered inside `.frontdoor-shell__content` in `default.vue` — sibling of `.frontdoor-shell__main`, after the page slot. **Not** a separate `PageGrid` slot.

| Viewport | Footer width | Notes |
|----------|--------------|-------|
| **All** | **Main column only** | Same inline size as `.frontdoor-shell__content`; does **not** span end panel or start nav |

**Figma deviation (width):** [Navigation 354:33034](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=354-33034) shows the footer band spanning **main + end** (x=241, width=1199). Implementation keeps **main-column width only** by product decision.

**Vertical rhythm:**

- Footer is the **last child** in `.frontdoor-shell__content` (`display: flex; flex-direction: column`) — sits **flush** under main content (no grid row gap).
- **Short pages:** `.frontdoor-shell__main` uses **`flex: 1 1 auto`** so the footer band’s outer edge aligns with the shell bottom; tablet+ **`.fd-page-grid__main`** uses **`min-block-size: 100%`** and is a flex column (`default.vue`); mobile **`.fd-page-grid__main`** uses **`flex: 1 1 auto`** (`page-grid.css`).
- **Long pages:** Footer follows content in normal document flow.
- **No `margin-block-end`** on the footer — **48px** bottom spacing is **`padding-block-end: var(--spacing-300)`** inside `.shell-site-footer` only.

**Content (row 1):** Centred brand row — **14px** Wikimedia mark (`developer-portal-logo-mark.svg`) + single-line wordmark (`footer-brand-wordmark`) + **Privacy policy** and **Terms of use** links.

**Content (row 2):** Centred legal attribution — **three sentences** (one per line) with an inline **Creative Commons Attribution-ShareAlike** link on the middle line.

**Visual:** `--background-color-base`, **`border-block-start`** with `--border-color-muted`, **`padding-block-start: var(--spacing-150)` (24px)**, **`padding-block-end: var(--spacing-300)` (48px)** — **48px from legal copy to the page bottom** per Figma, **`padding-inline: var(--spacing-200)` (32px)**. Policy and license links use `--color-progressive`; brand wordmark and legal body text use **`--color-subtle`**.

**URLs:** External Foundation / CC links from `config/siteFooter.ts` — not constructed in components.

**i18n:** `footer-aria-label`, `footer-brand-wordmark`, `footer-privacy-policy`, `footer-terms-of-use`, `footer-policy-nav-label`, `footer-attribution-sentence-created-by`, `footer-attribution-sentence-license-before`, `footer-license-link-label`, `footer-attribution-sentence-license-after`, `footer-attribution-sentence-trademark` in `i18n/*.json` + `qqq.json`. Legal copy renders **one sentence per line** (three lines).

**Codex exceptions:**

1. **Footer wordmark typography** — Figma specifies **Montserrat**; shell uses Codex **`--font-family-sans-stack`** until brand fonts are integrated (same as header).
2. **Footer brand asset** — Figma uses a horizontal **227×14px** lockup (mark + “WIKIMEDIA DEVELOPER PORTAL”); implementation composes **14px mark SVG + banana wordmark** until the footer logo asset is added to `public/images/`.

**Supersedes:** Previous single-line `footer-title` band with `--background-color-neutral-subtle` inside the main column only (removed from `default.vue`).

**Source:** `app/components/shared/ShellSiteFooter.vue`, `config/siteFooter.ts`, `app/layouts/default.vue`, `app/assets/css/page-grid.css`.

### Main content padding

**Decision:** Main slot (`.frontdoor-shell__main`) uses **`padding-block: var(--spacing-200)`** (32px) only — no inline-start padding. Horizontal alignment with the header utility row comes from the **24px grid gutter** between the always-mounted start panel and main columns.

**Note:** Page titles (`h1`) have **no extra top margin**; vertical rhythm comes from main padding only (aligned with explorer page title).

**Source:** `app/layouts/default.vue`, `app/assets/css/main.css`.

### Start column chrome

**Decision:** The start column (`.shell-side-panel`) is **always present** on every page. Padding **`--spacing-150`** block-start / **`--spacing-100`** block-end / **`--spacing-200`** inline-start (tablet+) / **`--spacing-75`** inline-end. Inline-start padding matches the header chrome inset so section menu labels align with the brand lockup and primary nav tabs above.

**Height (tablet+):** The panel **`min-block-size: 100%`** fills the page grid row from below the header band to the **bottom of the viewport**; main column content may extend farther and scroll independently.

**Edge treatment (supersedes background fill):** The start column track is **transparent**. Separation from main content uses **`border-inline-end: 1px solid var(--border-color-subtle)`** on `.fd-page-grid__start` in `app/layouts/default.vue` — a standard Codex border token, not a custom hex surface.

| Aspect | Detail |
|--------|--------|
| **Current** | Transparent panel + `--border-color-subtle` inline-end border |
| **Supersedes** | `#F3F3F3` filled panel via `--fd-layout-start-panel-background-color` (exploratory surface under Codex review) |
| **Legacy token** | `--fd-layout-start-panel-background-color` remains in `page-grid.css` but is **not consumed** — retained only if design reverts to a filled panel |
| **Width** | **281px** — `calc(15.0625rem + var(--fd-layout-desktop-wide-column-width))` (Figma **241px** + one **40px** grid column); **wider than Figma** side-panel spec |

**Disclaimer:** The **281px** width and **border-not-background** treatment are **prototype styling choices** from chrome exploration (May 2026). Confirm with design before treating either as final relative to [Unified Developer Front Door — Navigation (Figma)](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=225-4548). Responsive collapse deferred.

**Source:** `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `app/components/shared/ShellSidePanelNav.vue`, `app/assets/css/main.css` (shell side-panel font stack).

---

## Typography and colour

### Design tokens

**Decision:** All first-party UI uses **Codex Wikimedia UI theme tokens** (`@wikimedia/codex-design-tokens/theme-wikimedia-ui.css`) and Codex component styles.

**Exploratory / legacy values:** `--fd-layout-start-panel-background-color` (`#F3F3F3`) was explored for a filled start panel but is **superseded** by transparent panel + `--border-color-subtle` edge. The token is retained unused in `page-grid.css` for possible revert. Do not reuse the hex elsewhere without design review.

**Body:** `--font-size-medium`, `--line-height-medium`, system sans stack.

**Headings:** Emphasized colour; `h1` uses `--font-size-xx-large`; `h2`–`h6` retain block spacing below titles.

**Monospace:** API paths, HTTP methods in module rail, and Scalar code areas use `--font-family-monospace-stack`.

### Subtle / secondary text

**Decision:** Helper copy (explorer description, rail empty states, footer-adjacent hints) uses **`--color-subtle`** via shared selectors in `main.css`.

### Scalar theming

**Decision:** Map Scalar CSS variables to Codex tokens inside `.explorer-page .scalar-app` (backgrounds, accents, links, semantic colours for method badges). Links inside Scalar match portal progressive / visited colours.

**Decision:** Scalar spec panel sits in a bordered shell (`--border-color-subtle`, `--border-radius-base`) with **inline padding** `--spacing-150` on the shell; inner Scalar layout padding is not globally overridden in the current phase.

**Source:** `app/assets/css/main.css`, `app/assets/css/explorer-codex-overrides.css`.

---

## API Explorer page layout

### Vertical structure (main column)

Top to bottom:

1. **Page header** — `h1` “API Explorer” + description (max **60ch** width on subtitle)
2. **Project controls** — wiki combobox + opt-in checkboxes (hidden while instance bootstrapping)
3. **Reference panel** — module label, title row (module name + wiki InfoChip), Scalar shell

**Spacing:** Section gaps use `--spacing-150` / `--spacing-100` grid gaps.

### Reference panel (wide ≥ 960px)

**Decision:**

- Panel is **sticky** with `inset-block-start: --spacing-150`
- Panel height: `calc(100vh - 2 * --spacing-150)`
- Scalar shell fills remaining grid row (`minmax(0, 1fr)`), **scrollable** with `overscroll-behavior: contain`

**Rationale:** Keeps spec in view while module rail scrolls independently in the end column.

### Scalar shell containment

**Decision:** `transform: translateZ(0)` on `.explorer-page__scalar-shell` to contain Scalar `position: fixed` UI so it does not cover the global header.

**Z-index (explorer):** Scalar shell `z-index: 2`, module rail `z-index: 1`, shell chrome `z-index: 10` — modals/overlays from Scalar can span viewport but rail stays beside panel when possible.

---

## Project controls block

**Decision:** Horizontal flex row (wrap) with neutral subtle background, `--spacing-75` padding, rounded border:

| Control | Pattern |
|---------|---------|
| Wiki project | `CdxCombobox` — menu values are **display names**; model stores **instance id** |
| Opt-in | Fieldset with two `CdxCheckbox` options: Beta endpoints, Internal endpoints |

**Defaults:** Beta **off**, Internal **on**.

**Layout:** Wiki field flexes up to **40rem** max; opt-in group aligns to start with **no** extra `margin-block-start` (overrides Codex field default).

**Source:** `ExplorerProjectControls.vue`, `config/explorerOptIn.ts`.

**Status:** Opt-in values are not applied to discovery or Scalar filtering yet.

---

## Module rail (right column)

### Purpose

**Decision:** Browse discovered REST **modules** for the selected wiki; expand a module to list **endpoints**; click an endpoint to load/focus that operation in Scalar.

### Title

**Decision:** Heading pattern: `Browse {wiki display name} API modules` with wiki name in `<bdi>` (split banana strings `explorer-browse-api-modules-before` / `-after`).

### Module headings

**Decision:**

- Accordion-style **button** headings (not native `<details>`)
- **Multiple modules may be expanded** simultaneously
- Expand/collapse icon: Codex **expand / collapse** icons at **80% of 14px** (~11.2px)
- Module title parsing: strip `(Beta)` from title → **warning** “beta” chip; version → **success** chip with `v` prefix; chip **icons hidden** (text-only chips)
- First-load expansion of default module uses `overflow-anchor: none` on list so first heading stays visible

### Endpoint rows

**Decision:** Each endpoint is a button with:

| Part | Style |
|------|--------|
| HTTP method | Monospace, uppercase, bold; **method colour**: GET progressive, POST success, DELETE destructive, PUT/PATCH warning; `dir="ltr"` |
| Path | Monospace, small, wraps anywhere; in `<bdi>` |

**Interaction:** Click selects module (if needed) and triggers **Scalar operation focus** (scroll + navigation id resolution).

**Source:** `dafafc3` (endpoint navigation), `334a51a` (multiple expansion), `ExplorerModuleRail.vue`, `useExplorerScalarFocus.ts`.

### Rail positioning

**Decision (wide):** Rail uses shared class **`frontdoor-end-panel-nav`** in the end column. Vertical alignment with main-column page controls uses `useEndPanelNavAlign` (anchor: `.frontdoor-page-nav-align-anchor` on project controls) setting `--frontdoor-end-panel-nav-flow-offset` and `--frontdoor-end-panel-nav-sticky-inset`. Fallback: `--fd-explorer-rail-offset` in `page-grid.css`. **Future** section page menus in the end column should use the same class and composable pattern.

**Decision (narrow):** Rail is static (not sticky), full width in stack.

**Surface:** `--background-color-neutral-subtle`, rounded corners, internal scroll with `max-block-size` tied to viewport.

---

## Loading, empty, and error states

| State | UX |
|-------|-----|
| Instance bootstrap | Full-page overlay inside explorer (absolute, not fixed over header): spinner, “Loading wiki API modules”, wiki name in `<bdi>`; gradient background matching Scalar loading |
| Scalar client mount | `ClientOnly` fallback with same spinner pattern |
| Module switch | On wide viewports only: semi-transparent mask over Scalar shell with “Loading selected module…” |
| No selectable modules | Warning `CdxMessage` in rail |
| Per-module spec error | Inline “Not available” + aggregated failed module list at rail bottom |
| Empty endpoint list | Subtle empty copy under expanded module |
| Bootstrap error | Error `CdxMessage` in main column |

**Spinner:** 2.5rem circle, progressive-colour top border, 0.9s rotation.

---

## Interaction and navigation UX

### Endpoint → Scalar anchoring

**Decision:** Selecting an endpoint in the rail scrolls/focuses the matching operation in the Scalar reference panel (smooth scroll within the spec shell).

**Architecture (flow, id resolution, retries):** see **`ARCHITECTURE.md` → Module rail → Scalar operation focus**.

**UX constraint:** Documented remount via `:key` on `ExplorerScalarReference` when module/spec context changes; `Object.assign` used for in-place spec URL updates when staying on the same module.

### Crossing `/explorer` boundary

**Decision:** Entering or leaving `/explorer` triggers a **full document navigation** (not SPA transition) so Scalar DOM does not leak and bootstrap/Scalar mount reliably.

**User-visible effect:** Brief reload when opening or closing API Explorer from other sections.

**Source:** `app/plugins/explorer-route-navigation.client.ts`.

### Interface locale on explorer

**Decision:** Explorer route does not use locale-prefixed URLs. Changing interface language on `/explorer` updates banana strings and `dir` but does not navigate to `/fr/explorer`. Leaving explorer resyncs Vue I18n locale from URL prefix.

---

## RTL and multilingual UX

**Decision:** Shell `dir` follows `useDirection()` (interface language from `config/languages.js`, with wiki instance fallback).

**Decision:** External strings (wiki names, module titles, paths) use `<bdi>` or `isolatePickerLabel()` (FSI/PDI) in combobox menus.

**Decision:** HTTP methods in rail use explicit `dir="ltr"`.

**Decision:** Scalar content is not globally direction-flipped; portal maps link colours only. See `ARCHITECTURE.md` → RTL and BiDi.

**Decision (interface locale switch):** When the user changes interface language between LTR and RTL (or back), shell `dir` updates immediately. Codex RTL mirror CSS is toggled via `app/plugins/codex-rtl-styles.client.ts` (`link.disabled` on `#fd-codex-rtl-stylesheet`). Header `CdxSelect` remounts via `:key="direction"`. **Disclaimer:** This is a prototype workaround for Codex’s global RTL stylesheet; other Codex widgets may need similar treatment if locale switching expands beyond the header.

**Supported interface locales in shell:** en, es, fr, he, fa (banana + content routing).

---

## Commit traceability (design branch)

Mapping of notable commits to design areas (newest first among design-only work):

| Commit | Summary | Design area |
|--------|---------|-------------|
| `00f525e` | Explorer UI layer refactor | Code structure; no visual change intended |
| `83e5395` | Explorer route / Netlify | Reliability; full reload at explorer boundary |
| `443ea74` | Main navigation sections | IA: 8-item nav + stub pages |
| `54f260c` | Spec and rail paddings | Scalar shell + rail spacing |
| `7aeb709` | Explorer main nav mock | Left side nav sections |
| `27e2760` | Menu expand icons | Rail accordion icons |
| `b216113`, `76b770c`, `c287c23`, `67cb517` | Page nav menu iterations | Module rail accordion UI |
| `334a51a` | Multiple expansion | Rail allows several open modules |
| `dafafc3` | Endpoint navigation | Rail click → Scalar focus |
| `a23c01d` | Project InfoChip style | Subtle chip on reference header |
| `29ffbd5` | Font adjustments | Codex sans/monospace stacks on shell |
| `c8bdfbc` | Combobox label match | Wiki picker display consistency |
| `5320ae6` | Project selector + opt-in | Project controls block |
| `53138a3` | Site header | Utility row + responsive search |
| `6ed626b` | Grid layout | 24-column `PageGrid` |
| `2437049` | z-index | Scalar vs rail stacking |
| `413a062`, `6754e9c` | i18n / content | Locale routing (foundation, not visual) |

---

## Open questions / future design work

1. **Wire section navigation** to real content routes (replace `href="#"` placeholders and prototype active map).
2. **Collapse start column** into header on small viewports (responsive chrome).
3. **Align body content width with header lock** — confirm whether main/end columns should also lock at 1440px or stay fluid until Codex desktop-wide.
4. **Wire explorer side nav** to real doc routes or in-page anchors.
5. **Implement search** in header (Nuxt Content FTS5 per `ARCHITECTURE.md`).
6. **Apply opt-in filters** to module/endpoint lists and Scalar display.
7. **Mobile explorer** — dedicated small-screen module rail placement (currently stacked; start panel always mounted, full height deferred on mobile).
8. **Reduce full reload** at explorer boundary if Nuxt/Scalar SPA transitions become stable without DOM bleed.
9. **Editorial content** for Use content and data, Community, Contribute, Get help.
10. **Instance display names** — move from English literals in `config/instances.ts` to i18n or API-sourced labels.
11. **Confirm footer width with design** — keep **main-column only** or adopt Figma [354:33034](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=354-33034) main+end span.
12. **Add footer horizontal logo asset** — replace composed 14px mark + wordmark with Figma **227×14px** lockup when asset is finalized.
13. **Codex RTL loading strategy** — evaluate alternatives to `link.disabled` toggling (e.g. build-time RTL bundle, per-component direction props) before production.
14. **Confirm start column chrome with design** — border vs filled panel, and **281px** width vs Figma **241px** side-panel spec.

---

## Related files (implementation index)

| Area | Primary files |
|------|----------------|
| Site grid + chrome tokens | `app/assets/css/page-grid.css`, `app/components/shared/PageGrid.vue` |
| Primary nav + redirects | `config/mainNavigation.ts`, `config/contentRedirects.ts`, `config/remoteContentSources.ts` |
| Shell | `app/layouts/default.vue`, `app/assets/css/main.css` |
| Start column chrome | `app/layouts/default.vue` (border), `app/assets/css/page-grid.css` (`--fd-layout-start-panel-inline-size`), `app/components/shared/ShellSidePanelNav.vue`, `app/composables/usePageSectionNav.ts` |
| Site footer | `app/components/shared/ShellSiteFooter.vue`, `config/siteFooter.ts`, `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `i18n/*` (`footer-*`) |
| Header brand | `app/components/shared/ShellHeaderBrand.vue`, `public/images/developer-portal-logo-mark.svg` |
| Header chrome | `app/layouts/default.vue`, `app/components/shared/ShellPrimaryNav.vue`, `app/composables/usePrimaryNavigationTab.ts` |
| Header Codex overrides | `app/assets/css/shell-primary-nav-overrides.css`, `app/plugins/codex-rtl-styles.client.ts` |
| i18n (section nav) | `i18n/en.json`, `i18n/qqq.json` (`section-nav-*`, `section-nav-site-label`) |
| Section nav config | `config/sectionNavigation.js`, `config/explorerSideNav.js`, `app/utils/contentRoute.ts` |
| Primary nav | `config/mainNavigation.ts`, `app/composables/useMainNavigationLinks.ts` |
| Explorer page | `app/pages/explorer/index.vue` |
| Module rail | `app/components/explorer/ExplorerModuleRail.vue` |
| Project controls | `app/components/explorer/ExplorerProjectControls.vue` |
| Explorer side nav (legacy) | `app/components/explorer/ExplorerSideNav.vue` — superseded by `ShellSidePanelNav` |
| Scalar focus | `app/composables/useExplorerScalarFocus.ts`, `app/utils/scalarOperationNavigation.ts` |
| End-panel nav align | `app/composables/useEndPanelNavAlign.ts`, `app/assets/css/shell-end-panel-nav.css` |
| Scalar + Codex visuals | `app/assets/css/main.css`, `app/assets/css/explorer-codex-overrides.css` |
