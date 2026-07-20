# DESIGN_REQUIREMENTS.md — Front Door Developer Portal

This document records **UI/UX design decisions** introduced during the **design exploration** work on the `design` branch (Cursor-assisted implementation, May 2026). It complements:

- **`ARCHITECTURE.md`** — system structure, data flow, and technical constraints
- **`AGENTS.md`** — non-negotiable implementation rules (i18n, BiDi, Codex, layer separation)
- **`docs/TECH_DECISIONS.md`** — settled product/tech choices (stack, discovery, instances)

Use this file when implementing or reviewing visual styles, grids, layout areas, responsive behaviours, navigation, and interaction patterns. Where this document conflicts with **`AGENTS.md`**, **`AGENTS.md` wins**.

---

## Scope of the design exploration

The design branch extends Experiment 1 (Scalar multi-spec explorer) with a **product-shaped shell**: site grid, header chrome, primary navigation, placeholder content sections, and a three-column API Explorer layout (left doc nav, centre reference, right module rail).

**In scope (implemented as design exploration):**

- **Layout system** — Codex responsive grid (mobile 4-col, tablet 8-col, desktop / desktop-wide 24-col), 2-panel desktop pattern, and shell column split; see **Layout system** below for full specification and prototype status
- Shell header with search, settings, language, and account link
- Primary site navigation below the header
- API Explorer page layout, module rail, project controls, loading states
- Scalar visual alignment with Codex tokens

**Explicitly prototype / not final:**

- The site is not yet fully responsive
- The site needs to be reviewed and improved for compliance with best internationalization practices.
- The site needs to be tested for compliance with an AA level of accessibility. It should be fully actionable via screen reader technology.
- Page areas such as the header, side navigation menus and the footer are placeholders that will be replaced by new standardized components
- Default Nuxt elements such as skeletons need to be replaced by Codex components
- Search and settings controls are present but **disabled** or non-functional
- Account dashboard prototype lives at `/account`; header utility row uses OAuth login/logout
- API Explorer **mode** links in the start column navigate to `/explorer` sub-routes (`usePageSectionNav` + `pathForExplorerMode`); **Overview** section links remain `href="#"` placeholders
- Learn, Enterprise, Community, Contribute, and Get help pages are **empty Markdown stubs**
- Opt-in filters (beta / internal endpoints) are **UI only** — not wired to spec filtering
- Full reload when crossing `/explorer` boundary (UX trade-off for reliability; see `ARCHITECTURE.md`)
- **Shell chrome layout** (`design-chrome` branch): full-viewport header band; **mark + Montserrat banana wordmark** header brand; start column **always mounted** (empty panel when no section links); **transparent** panel with **`border-inline-end`** on the scrollport panel (`--border-color-muted`, hidden when collapsed); **281px** drawer panel / **0** grid track when nav collapsed; **single start-nav scrollport** + thin overlay-style thumb + **`::after` scroll-end spacer** (`shell-start-nav-scroll.css`); **viewport-driven collapse** + **drawer expand** (`shell-start-nav-reveal.css`); **static site footer** (`ShellSiteFooter`) inside main content column with **32px** bottom inset (`padding-block-end`; symmetric with start nav / overlay scroll-end); **independent column scroll** (start nav + main band) when content exceeds the viewport body

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

**Decision:** The **header** shows a compact lockup: **32px** Wikimedia mark (`public/images/developer-portal-logo-mark.svg`) plus a **two-line wordmark** via banana-i18n — `brand-wordmark-wikimedia` (top line) and **`brand-wordmark-developer-portal`** (bottom line, translatable per locale). Typography uses **Montserrat** (`--font-family-brand-wordmark`, loaded from `config/brandTypography.ts` / `nuxt.config.ts`). Links to **Get started** through `ShellHeaderBrand.vue` (`aria-label` from `app-title`). The start column does not show a logo.

**Footer (separate):** **14px mark** + single-line wordmark from the same banana keys as the header (`brand-wordmark-wikimedia`, `brand-wordmark-developer-portal`) in **Montserrat** — not the Figma **227×14px** horizontal lockup asset yet.

**Source:** `app/components/shared/ShellHeaderBrand.vue`, `config/brandTypography.ts`, `app/composables/useMainNavigationLinks.ts`, `i18n/*` (`brand-wordmark-*`).

### Start column section navigation

**Decision:** Every page mounts the **start column panel** (`.shell-side-panel.shell-side-panel--start` on the wrapper in `default.vue`). When section config defines links, the column shows a **flat** vertical section menu (no logo in the start column — brand lives in the header). When sections are **empty** (e.g. **Tools and bots**) or the route has no dedicated config, the panel still renders — only the `<nav>` is omitted.

- **Section headings** (bold) and **page links** share one list — no nested sub-menus or extra indent for items under a heading.
- **Horizontal dividers** (`--border-color-muted`) separate section groups within the menu.
- **Panel edge:** **`border-inline-end: 1px solid var(--border-color-muted)`** on **`.frontdoor-shell__side-panel--start`** (`default.vue`) when expanded — on the scrollport panel, not the grid track, so the border does not sit beside the scrollbar gutter. **`border-inline-end-width: 0`** when `.frontdoor-shell--nav-collapsed`. Supersedes the earlier `#F3F3F3` background exploration (`--fd-layout-start-panel-background-color` retained in `page-grid.css` but **unused**).
- **Full-height panel (tablet+):** the start column track is **viewport-height constrained** below the chrome band; when section nav content is taller than that area, **`.frontdoor-shell__side-panel--start`** scrolls independently (`shell-start-nav-scroll.css`: `overflow-block: auto`, `flex-shrink: 1`, `min-block-size: 0`; width fixed at 281px via `inline-size`). The grid track clips drawer motion (`overflow: hidden` on `.fd-page-grid__start`) and must not scroll alongside the panel.
- **Scroll-end inset (32px):** **`::after` block spacer** (`block-size: --spacing-200`) on the breakpoint scrollport — tablet+ **`.frontdoor-shell__side-panel--start`**, mobile **`.fd-page-grid__start`** — in `shell-start-nav-scroll.css`. Not `padding-block-end` on the inner panel wrapper. Collapsed overlay panel uses the same pattern in **`ShellCollapsedNavMenuOverlay.vue`**. Symmetric with site footer (`padding-block-end` on `.shell-site-footer`).
- **Start nav scrollbar:** **`shell-start-nav-scroll.css`** — one scrollport per breakpoint; transparent track + thin thumb only (no permanent gutter beside the panel border). WebKit scrollbar pseudos use physical `width` (API exception).
- **Fixed width** **281px** (`--fd-layout-start-panel-inline-size` = Figma **241px** + one Codex **40px** desktop grid column) for the **drawer panel** at tablet and above — **wider than Figma** side-panel spec. The **grid track** uses **`min-inline-size: 0`**; inline size is **0** (collapsed) or **281px** (expanded).
- **Responsive collapse:** when primary tabs + API Explorer link do not fit, `useShellNavigationCollapse` collapses header tabs into hamburger + breadcrumbs and hides the start track (see **Shell chrome** → Primary nav + section menu collapse).
- **Item hover:** non-selected menu item labels turn **`--color-progressive`** on hover (custom CSS — see **Codex exceptions** below).
- **Explorer mode links:** items with a **`mode`** in `config/explorerSideNav.js` navigate to `/explorer` sub-routes (`pathForExplorerMode` in `usePageSectionNav`); **`ShellSidePanelNav`** calls `navigateTo` on click. Active state follows `explorerModeFromPath()` on the current route. Items with **`enabled: false`** are hidden.
- **Exactly one** menu item shows a selected state at a time (current page). On Get started (`/`), only **Introduction** is selected.

**Content sources:**

| Primary nav | Config | Notes |
|-------------|--------|-------|
| Get started, Use content and data, Community, Contribute, Get help | `config/sectionNavigation.js` | IA from Developer Portal v2 |
| Tools and bots | `config/sectionNavigation.js` | **Empty** sections array — panel shown, no `<nav>` |
| API Explorer | `config/explorerSideNav.js` | Two sections: API Explorer (mode links — **functional**) + Overview placeholders |

**Rendering:** `usePageSectionNav()` → start panel wrapper always in `app/layouts/default.vue` (`frontdoor-shell__side-panel--start` + `shell-side-panel` + **`shell-side-panel--start`**); `ShellSidePanelNav.vue` when sections are non-empty. Labels via banana-i18n only. In the **collapsed nav overlay**, the same component is reused with optional **`omitSectionTitleMatching`** so a section heading equal to the back-control label is not shown twice (see **Shell chrome** → Collapsed overlay).

**Codex exceptions:**

1. **`CdxMenuItem` standalone** — used **outside** `CdxMenu`. Approved for this static shell list; do not reuse for floating menus without review.
2. **Section nav hover colour** — custom `:hover` CSS sets **`--color-progressive`** on non-selected item labels. Codex `CdxMenuItem` hover normally changes **background only** (`--background-color-interactive-subtle--hover`), not unselected text colour. Because items are outside `CdxMenu`, the `highlighted` prop is never toggled (parent menu normally handles `@change`); shell styles must target **`:hover`**, not `.cdx-menu-item--highlighted`. Selected items use Codex’s built-in progressive styling via `cdx-menu-item--selected`.
3. **Explorer mode navigation** — `usePageSectionNav()` resolves `to` paths; `ShellSidePanelNav` invokes `navigateTo` on click. URL construction stays in `app/utils/explorerRoute.ts` — not in the component.
4. **Start nav scrollbar (WebKit physical `width`)** — `shell-start-nav-scroll.css` uses physical **`width`** on `::-webkit-scrollbar` (API has no logical equivalent). **One scrollport per breakpoint**; transparent track + thin thumb. Border lives on the scrollport panel so it does not stack beside the scrollbar gutter.
5. **Scroll-end inset (`::after` spacer)** — **32px** (`--spacing-200`) below the last nav item via a **`::after` block** on the scrollport — not `padding-block-end` on the inner panel wrapper. In-shell: `shell-start-nav-scroll.css`. Overlay: `ShellCollapsedNavMenuOverlay.vue`. Footer: `padding-block-end` on `.shell-site-footer`.

**Status:** **Visual/IA prototype** on content routes — item links use `href="#"` with `@click.prevent`. Active state on content routes comes from `PROTOTYPE_ACTIVE_ITEM_BY_CONTENT_PATH` in `usePageSectionNav.ts`. **Explorer routes:** items with a `mode` in `config/explorerSideNav.js` resolve to real paths via `pathForExplorerMode()`; active state follows `explorerModeFromPath()` on the current route. Overview section items (no `mode`) remain placeholders.

**Superseded:** `ExplorerSideNav.vue` is no longer mounted; explorer mode routing lives in `usePageSectionNav()` + `ShellSidePanelNav`.

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

**Header chrome width (project-specific):** The header **band** spans the full viewport. Inner content (`.frontdoor-shell__chrome-inner`) uses **symmetric** **`--fd-layout-page-margin-inline-start`** on both inline edges (shared growth at ≥ 1680px with `PageGrid` inline-start). At tablet+, brand and tabs use the **same grid columns** as the start panel (`281px` + gutter + fluid body); utilities align to the inline-end of the body column inside that inset.

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

**Note:** The Codex **4 \| 16 \| 4** mental model is preserved via the main:end **16:4** ratio; the start column is **not** a fluid grid fraction — it is a **fixed 281px drawer** (prototype width wider than Figma) whose **grid track** collapses to **0** when primary nav does not fit.

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
| Header / start nav inline-start alignment | **Implemented** | `default.vue` — shared `--fd-layout-page-margin-inline-start` + start-panel grid column + `--spacing-75` content inset |
| Header chrome width lock (≥ 1680px viewport) | **Implemented** | `page-grid.css` — `--fd-layout-page-margin-inline-start` grows with viewport |
| Section nav below header | **Implemented** | Start column in `PageGrid`; header outside grid in `.frontdoor-shell__chrome-band` |
| Start column inline-end border | **Implemented** | `default.vue` — `border-inline-end` with `--border-color-muted` on `.frontdoor-shell__side-panel--start`; dividers in `ShellSidePanelNav` |
| Start nav scrollbar (single scrollport) | **Implemented** | `shell-start-nav-scroll.css` — transparent track + thin thumb; panel scroll tablet+, track scroll mobile |
| Start column width 281px | **Implemented** | `page-grid.css` — `--fd-layout-start-panel-inline-size` (Figma 241px + 40px grid column) |
| Section nav item hover (`--color-progressive`) | **Implemented** | `ShellSidePanelNav.vue` — custom `:hover` CSS; **Codex exception** (see Start column section navigation) |
| Static site footer (Figma 393:4639) | **Implemented** | `ShellSiteFooter.vue`, `config/siteFooter.ts`, inside `frontdoor-shell__content` |
| Footer legal copy (3 sentences) | **Implemented** | banana `footer-attribution-sentence-*` keys; one line per sentence |
| Footer width (main column only) | **Implemented** | Footer sibling of `.frontdoor-shell__main` — matches central page content; not main + end |
| Footer short-page bottom pin + 32px inset | **Implemented** | `.frontdoor-shell__body-scroll` scrollport; `.frontdoor-shell__content` flex column (`min-block-size: 100%`); main `flex: 1`; `padding-block-end: --spacing-200` on footer (matches start nav) |
| Start panel viewport height (tablet+) | **Implemented** | Grid row capped by `100dvh` shell; start panel fills track, scrolls when nav overflows |
| Independent column scroll (start + body) | **Implemented** | Start nav scrolls alone; `.frontdoor-shell__body-scroll` spans main + end with inline-end scrollbar |
| Header utility row collapse (256px search) | **Implemented** | `useHeaderUtilityCollapse` — `ResizeObserver`; search icon + compact language + `CdxMenuButton` |
| Primary nav tab scroll buttons hidden | **Implemented** | `shell-primary-nav-overrides.css` — **Codex exception**; overflow scrollers flicker on first paint |
| Primary nav + section menu collapse | **Implemented** | `useShellNavigationCollapse` — intrinsic width + hysteresis; hamburger + breadcrumbs; start drawer on expand |
| Start nav drawer reveal | **Implemented** | `shell-start-nav-reveal.css` — grid track push + panel slide; Codex transition tokens |
| Collapsed hamburger menu overlay | **Implemented** | `useShellCollapsedNavMenu` + `ShellCollapsedNavMenuOverlay` — backdrop-light; `cdxIconPrevious` back; `omitSectionTitleMatching`; `--spacing-50` back-to-list gap; **`::after` scroll-end spacer (`--spacing-200`)**; scroll lock |
| Primary nav tab label weight normal | **Implemented** | `shell-primary-nav-overrides.css` — **Codex exception**; selection via colour/underline only |
| Start panel scroll-end symmetry | **Implemented** | `::after` spacer (`--spacing-200`) on each scrollport — start panel (tablet+), `.fd-page-grid__start` (mobile), collapsed overlay panel; footer uses `padding-block-end` |
| Start panel always mounted | **Implemented** | `default.vue` — panel wrapper on every route; `ShellSidePanelNav` when sections exist |
| Explorer side nav mode links | **Implemented** | `usePageSectionNav` + `ShellSidePanelNav` + `explorerRoute.ts`; Overview items still placeholders |

**Responsive behaviour summary:**

| Viewport | Shell layout |
|----------|----------------|
| **&lt; 640px** | **Interim:** header band, then start panel (nav when sections exist; **max 40dvh** + scroll if long), then main (scrollport); footer inside main band |
| **640px–1119px** | **Interim:** **281px** fixed start beside fluid main column; **independent scroll** in each column when content overflows; footer in **main column only**; end panel hidden until desktop |
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
| Header brand in utility row | `ShellHeaderBrand.vue`, `developer-portal-logo-mark.svg` | 32px mark + two-line banana wordmark; **Montserrat** |
| API Explorer separate link | `.frontdoor-shell__api-explorer-link` in `default.vue` | Immediately after tabs; **24px** gap (`--spacing-150`); not a tab |
| Legacy URL redirects | `config/contentRedirects.ts` → `nuxt.config` `routeRules` | `/learn`, `/about`, `/enterprise` → 301 |
| Start column section nav | `ShellSidePanelNav`, `usePageSectionNav` | Panel always mounted; nav when sections exist; explorer **mode** links functional; **Tools and bots** empty |
| Primary nav as Codex quiet tabs | `ShellPrimaryNav`, `usePrimaryNavigationTab` | Tab panels hidden — **navigation-only** Codex exception |
| Primary nav tab scroll buttons | `shell-primary-nav-overrides.css` | **Hidden** — Codex overflow scrollers flicker on load; separate responsive approach planned |
| Primary nav tab label weight | `shell-primary-nav-overrides.css` | **Codex exception** — all labels `--font-weight-normal` (Codex defaults to bold); selection via colour/underline |
| Two-row header (utility + tabs) | `default.vue` `.frontdoor-shell__chrome` inside full-bleed band | Settings **disabled**; log in **non-functional** |
| Full-viewport header band | `.frontdoor-shell__chrome-band` in `default.vue` | Background + `--border-color-muted` bottom border span viewport; inner content centred |
| Header / start nav aligned at inline-start | Brand: `--spacing-75` inset (removed when nav collapsed); nav row: flush to chrome inner edge | Section menu items keep `--spacing-75` padding inside start column |
| Header utilities at inline-end | Body grid column + `justify-content: flex-end` | Search/settings/language/log in |
| Start column below header | Section nav in `PageGrid` start slot only | Panel always mounted; viewport-height track on tablet+ |
| Start panel scroll | `overflow-block: auto` on `.frontdoor-shell__side-panel--start` (tablet+); `overflow-y: auto` on `.fd-page-grid__start` (mobile) | `flex-shrink: 1` + `min-block-size: 0` on drawer panel; **`::after` scroll-end spacer (`--spacing-200`)** on scrollport (`shell-start-nav-scroll.css`); mobile clip via `overflow-inline: hidden` only |
| **Main column** | `.frontdoor-shell__body-scroll` | Page slot + footer; scrollbar at inline-end of main + end band |
| **End column (empty)** | Same scrollport as main | Wheel over reserved end panel scrolls central content |
| Start panel viewport height | Grid row capped by `100dvh` shell | Track fills visible body; does not grow the document |
| Start column inline-end border | `border-inline-end` on `.frontdoor-shell__side-panel--start` | `--border-color-muted` when expanded; **width 0** when collapsed; section dividers match |
| Start column width 281px | `--fd-layout-start-panel-inline-size` in `page-grid.css` | Figma 241px + one 40px Codex grid column — **deviation from Figma** |
| Section nav hover colour | `:hover` override in `ShellSidePanelNav.vue` | **Codex exception** — progressive text on non-selected items |
| Footer main column width | `ShellSiteFooter` inside `.frontdoor-shell__content` | Matches central page content; does not span end panel |
| Footer brand + legal colours | `--color-subtle` on wordmark and legal lines; `--color-progressive` on links | Figma Footer **393:4639** |
| Footer flush under main | Footer is last child in `.frontdoor-shell__content` flex column | Sits directly below page slot — no grid row between main and footer |
| Footer 32px page-bottom inset | `padding-block-end: --spacing-200` on `.shell-site-footer` | Matches start section nav scroll-end; short pages: no scrollbar; `min-block-size: 100%` on content scrollport pins footer |
| Footer width vs Figma | Main column only — not x=241 / width=1199 (main+end) | **Intentional deviation** from [Navigation 354:33034](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=354-33034) |
| Header utility row (Figma) | `.frontdoor-shell__header-top` + `ShellHeaderUtilityActions` | **24px** logo–search gap; search **256px** min triggers collapse; `CdxMenuButton` for overflow utilities |
| Interface language picker | `CdxLookup` (searchable) + `:key="direction"` | Type-to-filter over the full language catalog; autonym labels; remount on LTR ↔ RTL. See "Interface language picker" below. |
| Codex RTL sheet toggled on locale switch | `codex-rtl-styles.client.ts` | **`link.disabled`** prototype — prevents stale RTL layout on LTR locales without reload |

**Architecture reference:** `ARCHITECTURE.md` → Shell layout and chrome.

### Header (utility row + primary navigation)

**Decision:** Two-row header chrome in a **full-viewport band** (background and **`border-block-end: 1px solid var(--border-color-muted)`** edge-to-edge — same Codex token as start-column borders and site footer). Inner content is centred within Codex page margins and, when section navigation applies, aligned to the **main (+ end) columns** of the page grid:

| Row | Contents |
|-----|----------|
| **Utility (row 1)** | **Brand lockup** (`ShellHeaderBrand`), search (`CdxSearchInput`, flexes up to **640px**), settings (`CdxButton` + configure icon, **disabled** prototype), interface language (`CdxLookup`, searchable), Log in link |
| **Primary nav (row 2)** | Codex **quiet** tabs (`ShellPrimaryNav`) plus separate **API Explorer** progressive link (`cdxIconArrowNext`) |

**Width:** The outer band is **full viewport width**. `.frontdoor-shell__chrome-inner` is full width with the same **`--fd-layout-page-margin-inline-start`** as `PageGrid`. At tablet+, `.frontdoor-shell__chrome` mirrors the page grid columns (`281px` start + fluid body).

**Grid placement:** Header lives **above** `PageGrid`. Brand occupies the **start column** with **`--spacing-75`** inline-start padding when nav is expanded; **no** extra inset when collapsed (aligns with hamburger row). Primary nav / collapsed breadcrumbs occupy the full chrome width on row 2 **without** that inset.

**Padding:** `--spacing-150` block-start on chrome; `--spacing-150` gap between utility row and tab row. Symmetric viewport inset on `.frontdoor-shell__chrome-inner` (`--fd-layout-page-margin-inline-start` on both inline edges).

**Tab layout:** Quiet tab labels use **extra `--spacing-75` (12px) block-end padding** beyond Codex defaults (4px block-start, 12px inline) for alignment with the header bottom border. Tab panels are hidden — navigation only; page content renders in the main slot. **All tab labels** use **`--font-weight-normal`** — **Codex exception** (Codex quiet tabs set `font-weight: 700` on every label); the selected tab is distinguished by colour and progressive underline only. **Codex override:** quiet-tabs header **`border-bottom`** is suppressed in `app/assets/css/shell-primary-nav-overrides.css` (imported from `main.css` and re-imported after `codex.style-rtl.css` in `codex-rtl-styles.client.ts`) because `.frontdoor-shell__chrome-band` owns the single header edge (Figma layout). Codex uses a **physical** border property; both `border-block-end` and `border-bottom` are cleared with `!important`. **Tab scroll buttons** (`.cdx-tabs__prev-scroller` / `.cdx-tabs__next-scroller`) are **hidden** in the same file — they flicker on first paint before overflow measurement; header responsiveness will use a separate approach.

**Utility row layout (Figma `Header/Default`, node 284:11443; collapsed reference [Off-wiki page templates 50:2563](https://www.figma.com/design/zaMJ5QqulosJKuoHE2gCKK/Off-wiki-page-templates?node-id=50-2563)):** Row 1 is **`justify-between`** with **`gap: var(--spacing-150)` (24px)** between the brand lockup and `ShellHeaderUtilityActions` (`flex: 1 1 auto`). Search uses **`flex: 1 1 auto`**, **`max-inline-size: min(40rem, 100%)`**, and **`min-inline-size: 16rem` (256px)** on the Codex text input when expanded. Gaps within the row are **`--spacing-100` (16px)**. `useHeaderUtilityCollapse` observes the utility track with **`ResizeObserver`** and switches to compact mode below **`HEADER_UTILITY_COLLAPSE_THRESHOLD_PX`** (`config/headerChrome.ts`).

**Collapsed utility row:** Icon-only **search** button, the language button (see below), then icon-only **`CdxMenuButton`** (`cdxIconEllipsis`) for **Settings** (disabled) and **Log in**. Search button activation is **deferred**.

**Utility row layout (expanded):** Search field, settings icon button, language button, log-in text link.

**Language control is compact at all widths.** With ~575 languages to choose from (and further utilities coming, e.g. a dark-mode toggle), an always-open lookup input would crowd the top bar. So the interface-language control is a **globe + uppercase locale code** `CdxButton` at every width; clicking it opens the searchable `CdxLookup` in a **popover** anchored under the button (it does not widen the row). This replaces the earlier always-visible `CdxSelect`/input.

**Primary nav row (row 2):** `.frontdoor-shell__primary-nav-row` — quiet tabs (`flex: 0 1 auto`) and **API Explorer** link (`flex: 0 0 auto`) on the same baseline. The link sits **immediately after** the last tab with **`gap: var(--spacing-150)` (24px)** — not pushed to the inline-end of the row. Link label from `nav-api`; arrow icon uses **`--color-progressive`**. Active on `/explorer` routes; no tab selected when explorer is active.

**Primary nav + section menu collapse (Figma [Off-wiki page templates 50:2731](https://www.figma.com/design/zaMJ5QqulosJKuoHE2gCKK/Off-wiki-page-templates?node-id=50-2731)):** `useShellNavigationCollapse` observes `.frontdoor-shell__primary-nav-row` and `.frontdoor-shell__primary-nav-expanded__content` with **`ResizeObserver`**. Collapse uses intrinsic-width + **hysteresis** (`scrollWidth + 24px` to collapse, `scrollWidth + 48px` to expand). When collapsed, **`ShellCollapsedNavigation`** replaces quiet tabs; **`page-grid.css`** sets **`grid-template-columns: 0 minmax(0, 1fr)`** and **`column-gap: 0`** so the body band fills the freed space. Start panel **`border-inline-end-width: 0`**. Brand **`--spacing-75`** inline-start padding removed.

**Start drawer (expand only):** **`shell-start-nav-reveal.css`** — the grid track grows from **0 → 281px** (+ gutter), **pushing** main content; the fixed-width **281px** panel slides in from inline-start inside a clipping track (`transform: translate3d(±100%, 0, 0)`; RTL mirrored). Codex **transition** tokens: **`--transition-duration-medium`** (250ms), **`--transition-timing-function-user`** (`ease-out`). Collapse is **instant**. Section nav stays mounted when collapsed (`inert`, `aria-hidden`). **`prefers-reduced-motion: reduce`** disables transitions.

**Start nav scroll (drawer-compatible):** Tablet+ scrollport is **`.frontdoor-shell__side-panel--start`** — must **`flex-shrink: 1`** with **`min-block-size: 0`** so `overflow-block: auto` activates inside the flex-column grid track (`shell-start-nav-scroll.css`). Mobile scrollport is **`.fd-page-grid__start`** (`max-block-size: 40dvh`, `overflow-y: auto` from `page-grid.css`); inner panel **`overflow: visible`** so only one scrollbar appears. Drawer CSS uses **`overflow-inline: hidden`** only when expanded (not blanket `overflow: hidden`, which had broken vertical scroll).

**Collapsed overlay (Figma [Off-wiki page templates 25:1929](https://www.figma.com/design/zaMJ5QqulosJKuoHE2gCKK/Off-wiki-page-templates?node-id=25-1929)):** Hamburger toggles a full-viewport overlay (`ShellCollapsedNavMenuOverlay`, teleported to `<body>`, **`z-index: 20`** above header chrome). Mask: **`--background-color-backdrop-light`**. Start-side panel: **`--fd-layout-start-panel-inline-size` (281px)**, **`--background-color-base`**, **`border-inline-end: 1px solid var(--border-color-muted)`**, inline padding **`--spacing-200`** start / **`--spacing-75`** end, block padding **`--spacing-100`** start only; **32px scroll-end inset** via **`::after` spacer** on the panel scrollport (matches in-shell start nav + footer).

| Overlay element | Token / behaviour |
|-----------------|-------------------|
| Panel scroll-end inset | **`::after` block** with **`block-size: var(--spacing-200)`** (32px) on `.shell-collapsed-nav-menu-overlay__panel` — scrolls into view after the last item |
| Back control | Quiet small `CdxButton`; **`cdxIconPrevious`** (`flip-for-rtl`); visible text = active primary section label; `aria-label` from `shell-collapsed-nav-menu-back-button-label` |
| Back control → first item gap | **`gap: var(--spacing-50)`** on overlay panel flex column |
| Section list | Reuses **`ShellSidePanelNav`** (including explorer mode links via `navigateTo`); **`omitSectionTitleMatching`** hides a section heading when it equals the back label (avoids duplicating the primary section name) |
| Primary list | Flat **`CdxMenuItem`** rows (main tabs + API Explorer); selection navigates and closes overlay |
| Dismiss | Backdrop click, **Escape**, route change, or nav expand |
| Scroll lock | `html.shell-collapsed-nav-menu-open { overflow: hidden }` in **`shell-collapsed-nav-menu.css`** |

**Source:** `app/composables/useShellCollapsedNavMenu.ts`, `app/components/shared/ShellCollapsedNavMenuOverlay.vue`, `app/components/shared/ShellCollapsedNavigation.vue`, `app/assets/css/shell-collapsed-nav-menu.css`, `app/layouts/default.vue`, `i18n/*` (`shell-collapsed-nav-menu-*`).

**Utility row alignment:** Utility controls are grouped at the **inline-end** in `ShellHeaderUtilityActions`.

| Element | Behaviour |
|---------|-----------|
| Search (`CdxSearchInput`) | Flexes in the header (max **640px**); **`min-inline-size: 256px`** when expanded; collapses to icon-only when the actions track is narrower than `HEADER_UTILITY_COLLAPSE_THRESHOLD_PX` (`useHeaderUtilityCollapse`) |
| Search icon button | Shown in collapsed mode; **activation deferred** (no overlay yet) |
| Settings (`CdxButton` + configure icon) | **Disabled** prototype; inline when expanded; overflow menu when collapsed |
| Interface language (`CdxLookup`) | **Globe + uppercase code** `CdxButton` at all widths; click opens the searchable lookup in a popover. Keeps the bar compact. |
| Log in | Text link when expanded; overflow menu item when collapsed — **non-functional** prototype |
| Utility overflow menu (`CdxMenuButton`) | Icon-only (`cdxIconEllipsis`); settings + log in only when collapsed |

**Interface language picker:** The portal supports the **full Wikimedia language catalog** (~575 locales; `config/languages.ts`), not a curated few — so the picker is a **searchable `CdxLookup`**, not a `CdxSelect`. There is one language list for both content and interface; locales without content or interface strings fall back through the chain to English (see `docs/adr-language-catalog.md`). Implementation:

- **`menuItems`** — one per catalog language: `label` = **autonym** (native name), `supportingText` = English `name`, `language: { label: bcp47 }` so each autonym renders under the correct `lang` attribute (script/direction). The globe is the input's **`start-icon`** (`cdxIconLanguage`), forwarded to the inner `CdxTextInput`.
- **Filtering** — typing filters by autonym, English name, or code (case-insensitive). Results are **capped at `MAX_LANGUAGE_MENU_ITEMS` (50)** for render performance; the active language is always kept present. Typing narrows the list.
- **Trigger (all widths)** — a **globe + uppercase code** `CdxButton` (`--color-subtle`); clicking toggles a **popover** (anchored under the button, `inset-inline-end: 0`, `box-shadow-drop-medium`) containing the `CdxLookup`. Opening focuses the input; focus-out of the container, Escape, or a selection closes it. Menu-item clicks keep focus (Codex prevents blur on option mousedown), so they do not close the popover early.
- **Selection** — `@update:selected` commits the code to `selectedInterfaceLocale` (which drives locale routing via the layout), resets the input to the chosen autonym, and closes the popover.
- **BiDi** — autonyms render with per-item `lang` via the `language` field; the trigger code sits in `<bdi>`.
- **Width** — the trigger is icon-sized (`flex: 0 0 auto`), keeping top-bar room for log-in and future utilities; the popover is `18rem` / `min(18rem, 90vw)`.
- **LTR ↔ RTL switching** — `:key="direction"` remounts the lookup; `codex-rtl-styles.client.ts` enables/disables `codex.style-rtl.css` so Codex mirrored rules do not persist after switching back to an LTR interface locale (**prototype workaround** — no full reload required).
- **Known open issue (RTL expand chevron):** In Hebrew/Persian interface locales the mandatory `CdxSelect` expand indicator may not appear. Root cause: global `codex.style.css` plus toggled `codex.style-rtl.css` both apply; indicator gets conflicting physical `left`/`right` rules. Per-component Codex CSS overrides were attempted and **reverted**. See `ARCHITECTURE.md` → RTL and BiDi.

**Source:** `app/layouts/default.vue` — `.frontdoor-shell__header-top`, `.frontdoor-shell__primary-nav-row`, `.frontdoor-shell__api-explorer-link`; `app/components/shared/ShellHeaderUtilityActions.vue`, `app/composables/useHeaderUtilityCollapse.ts`, `app/composables/useShellHeaderUtilityMenu.ts`, `config/headerChrome.ts`.

**Primary navigation:** `v-model:active` bound to route via `usePrimaryNavigationTab()`; tab select calls `navigateTo()` with locale-aware paths from `useMainNavigationLinks()`. Explorer routes leave **no tab selected** (`activeNavigationId` empty).

**Status:** Visual chrome prototype aligned to [Unified Developer Front Door — header (Figma)](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=284-11443), collapsed utility reference [Off-wiki page templates 50:2563](https://www.figma.com/design/zaMJ5QqulosJKuoHE2gCKK/Off-wiki-page-templates?node-id=50-2563), collapsed nav reference [50:2731](https://www.figma.com/design/zaMJ5QqulosJKuoHE2gCKK/Off-wiki-page-templates?node-id=50-2731), and collapsed nav overlay [25:1929](https://www.figma.com/design/zaMJ5QqulosJKuoHE2gCKK/Off-wiki-page-templates?node-id=25-1929).

**Source:** `app/layouts/default.vue`, `app/components/shared/ShellPrimaryNav.vue`, `app/components/shared/ShellCollapsedNavigation.vue`, `app/components/shared/ShellCollapsedNavMenuOverlay.vue`, `app/components/shared/ShellHeaderBrand.vue`, `app/composables/usePrimaryNavigationTab.ts`, `app/composables/useShellNavigationCollapse.ts`, `app/composables/useShellNavigationBreadcrumbs.ts`, `app/composables/useShellCollapsedNavMenu.ts`, `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/shell-collapsed-nav-menu.css`, `config/shellNavigation.ts`.

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
- **Short pages:** `.frontdoor-shell__body-scroll` is the scrollport; `.frontdoor-shell__content` uses **`min-block-size: 100%`**; `.frontdoor-shell__main` uses **`flex: 1 1 auto`** so the footer band’s outer edge aligns with the shell bottom when no scrollbar is needed.
- **Long pages:** Footer follows content in normal document flow.
- **No `margin-block-end`** on the footer — **32px** bottom spacing is **`padding-block-end: var(--spacing-200)`** inside `.shell-site-footer` only (symmetric with start nav / overlay **`::after` scroll-end spacers**).

**Content (row 1):** Centred brand row — **14px** Wikimedia mark (`developer-portal-logo-mark.svg`) + single-line wordmark (`brand-wordmark-wikimedia` + `brand-wordmark-developer-portal`, Montserrat) + **Privacy policy** and **Terms of use** links.

**Content (row 2):** Centred legal attribution — **three sentences** (one per line) with an inline **Creative Commons Attribution-ShareAlike** link on the middle line.

**Visual:** `--background-color-base`, **`border-block-start`** with `--border-color-muted`, **`padding-block-start: var(--spacing-150)` (24px)**, **`padding-block-end: var(--spacing-200)` (32px)** — scroll-end symmetry with start nav / overlay **`::after` spacers**, **`padding-inline: var(--spacing-200)` (32px)**. Policy and license links use `--color-progressive`; brand wordmark and legal body text use **`--color-subtle`**.

**URLs:** External Foundation / CC links from `config/siteFooter.ts` — not constructed in components.

**i18n:** `footer-aria-label`, `footer-privacy-policy`, `footer-terms-of-use`, `footer-policy-nav-label`, `footer-attribution-sentence-*` in `i18n/*.json` + `qqq.json`. Brand wordmark reuses `brand-wordmark-wikimedia` and `brand-wordmark-developer-portal` (shared with header). Legal copy renders **one sentence per line** (three lines).

**Codex exceptions:**

1. **Footer wordmark typography** — uses **`--font-family-brand-wordmark`** (Montserrat), same as header; legal body text remains Codex sans.
2. **Footer brand asset** — Figma uses a horizontal **227×14px** lockup (mark + “WIKIMEDIA DEVELOPER PORTAL”); implementation composes **14px mark SVG + banana wordmark** until the footer logo asset is added to `public/images/`.

**Supersedes:** Previous single-line `footer-title` band with `--background-color-neutral-subtle`; interim `PageGrid` **`footer`** slot spanning main + end (reverted); interim full-width footer under the start column (reverted).

**Placement history (reverted):** See `ARCHITECTURE.md` → Site footer → Placement history. Current: footer inside `.frontdoor-shell__content` only; short-page pin via flex column inside `.frontdoor-shell__body-scroll`.

**Source:** `app/components/shared/ShellSiteFooter.vue`, `config/siteFooter.ts`, `app/layouts/default.vue` (`.frontdoor-shell__content`, `.frontdoor-shell__body-scroll`), `app/assets/css/page-grid.css`.

### Main content padding

**Decision:** Main slot (`.frontdoor-shell__main`) uses **`padding-block: var(--spacing-200)`** (32px) only — no inline-start padding. Horizontal alignment with the header utility row comes from the **24px grid gutter** between the always-mounted start panel and main columns.

**Note:** Page titles (`h1`) have **no extra top margin**; vertical rhythm comes from main padding only (aligned with explorer page title).

**Source:** `app/layouts/default.vue`, `app/assets/css/main.css`.

### Start column chrome

**Decision:** The start column wrapper (`.frontdoor-shell__side-panel--start.shell-side-panel.shell-side-panel--start`) is **always present** on every page. Padding **`--spacing-150`** block-start / **`--spacing-75`** inline-end. **Scroll-end inset (32px)** is a **`::after` spacer** on the breakpoint scrollport (`shell-start-nav-scroll.css`) — tablet+ on **`.frontdoor-shell__side-panel--start`**, mobile on **`.fd-page-grid__start`** — not `padding-block-end` on the inner wrapper (nested flex scrollports do not always extend scroll range for inner padding). Symmetric with site footer and collapsed nav overlay. **No** `padding-inline-start` — viewport-edge inset is `--fd-layout-page-margin` on `.fd-page-grid`, shared with header chrome. Both **`frontdoor-shell__side-panel--start`** and **`shell-side-panel--start`** must be on the same element — `shell-start-nav-reveal.css` drawer transforms depend on the BEM `--start` class.

**Height (tablet+):** The panel track fills the **visible shell body** below the chrome band. When section links exceed that height, **`.frontdoor-shell__side-panel--start`** scrolls with a **browser default** vertical scrollbar (`overflow-block: auto`, `overscroll-behavior: contain`). The panel **`flex-shrink`s on the block axis** (`flex-shrink: 1`, `min-block-size: 0`) inside the flex-column grid track; **281px width** is from `inline-size` tokens, not `flex-shrink: 0`.

**Edge treatment (supersedes background fill):** The start column track is **transparent**. Separation from main content uses **`border-inline-end: 1px solid var(--border-color-muted)`** on **`.frontdoor-shell__side-panel--start`** in `app/layouts/default.vue` when expanded — on the scrollport panel so the border and scrollbar share one edge. Section group dividers in **`ShellSidePanelNav`** use the same token. Border hidden when collapsed (`border-inline-end-width: 0` on the panel).

| Aspect | Detail |
|--------|--------|
| **Current** | Transparent panel + `--border-color-muted` inline-end border on scrollport + section dividers |
| **Supersedes** | `#F3F3F3` filled panel via `--fd-layout-start-panel-background-color` (exploratory surface under Codex review) |
| **Legacy token** | `--fd-layout-start-panel-background-color` remains in `page-grid.css` but is **not consumed** — retained only if design reverts to a filled panel |
| **Width** | **281px** — `calc(15.0625rem + var(--fd-layout-desktop-wide-column-width))` (Figma **241px** + one **40px** grid column); **wider than Figma** side-panel spec |

**Disclaimer:** The **281px** drawer width and **border-not-background** treatment are **prototype styling choices** from chrome exploration (May 2026). Confirm with design before treating either as final relative to [Unified Developer Front Door — Navigation (Figma)](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=225-4548). Viewport-driven collapse and hamburger overlay are **implemented**.

**Source:** `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `app/components/shared/ShellSidePanelNav.vue`, `app/assets/css/main.css` (shell side-panel font stack).

### Shell scroll regions

**Decision:** Match [Discord developer docs](https://docs.discord.com/developers/bots/overview) — **fixed chrome**, **no document scroll**, **independent column scrollports** when content overflows.

| Area | Scrollport | Overflow rule |
|------|------------|----------------|
| **Document (`body`)** | — | `overflow: hidden` — shell owns vertical scroll |
| **Shell** | `.frontdoor-shell` | `block-size: 100dvh`; `overflow: hidden` |
| **Start column** | `.frontdoor-shell__side-panel--start` (tablet+) / `.fd-page-grid__start` (mobile) | `overflow-y: auto` when section nav exceeds visible body; **`::after` scroll-end spacer (`--spacing-200`)** on the scrollport (`shell-start-nav-scroll.css`) |
| **Main + end body band** | `.frontdoor-shell__body-scroll` | `overflow-y: auto`; track extends to **viewport inline-end**; `body-columns` max-width at ≥ 1680px keeps content aligned; empty margin zone scrolls central content ([Discord docs](https://docs.discord.com/developers/bots/overview)) |
| **Main content width** | `.frontdoor-shell__content` inside body sub-grid | Footer and page slot remain **main-track width only** — not full body band |

**Scrollbar styling:** Body band (`.frontdoor-shell__body-scroll`) — browser default. **Start nav scrollport** — transparent track + thin thumb + **`::after` scroll-end spacer** in **`shell-start-nav-scroll.css`** (overlay panel spacer in **`ShellCollapsedNavMenuOverlay.vue`**; WebKit physical `width` exception documented in file header).

**Scroll chaining:** `overscroll-behavior: contain` on column scrollports so wheel/touch scroll does not propagate to the document.

**Mobile (&lt; 640px):** Stacked interim layout — start nav capped at **`max-block-size: 40dvh`** with scroll on **`.fd-page-grid__start`** when long; drawer reveal clips horizontally with **`overflow-inline: hidden`** (expanded) or **`overflow: hidden`** (collapsed). Main column uses the remaining shell body as its scrollport.

**Sticky panels:** Explorer reference shell and end-column module rail max-heights use **`--fd-layout-shell-body-block-size-estimate`** (`100dvh` minus `--fd-layout-shell-chrome-block-size-estimate`) until runtime chrome measurement replaces the estimate.

**Source:** `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `app/assets/css/shell-start-nav-scroll.css`, `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/main.css`, `app/assets/css/shell-end-panel-nav.css`, `app/components/shared/ShellCollapsedNavMenuOverlay.vue`, `app/pages/explorer/index.vue`.

---

## Typography and colour

### Design tokens

**Decision:** All first-party UI should use **Codex Wikimedia UI theme tokens** (`@wikimedia/codex-design-tokens/theme-wikimedia-ui.css`) and Codex component styles.

**Exploratory / legacy values:** `--fd-layout-start-panel-background-color` (`#F3F3F3`) was explored for a filled start panel but is **superseded** by transparent panel + `--border-color-muted` edge. The token is retained unused in `page-grid.css` for possible revert. Do not reuse the hex elsewhere without design review.

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
| *(uncommitted)* | Explorer side nav routing | `usePageSectionNav` resolves `to` + active state from `mode` / `explorerModeFromPath`; `ShellSidePanelNav` navigates via `navigateTo` |
| *(uncommitted)* | Start nav scrollbar fix | `shell-start-nav-scroll.css` — single scrollport; transparent track; border on scrollport panel |
| *(uncommitted)* | Scroll-end symmetry (32px) | `::after` spacer on start scrollport (tablet+ panel, mobile `.fd-page-grid__start`) + overlay panel; footer keeps `padding-block-end` |
| *(uncommitted)* | Start nav scroll + drawer clip | `flex-shrink: 1` on `.frontdoor-shell__side-panel--start`; mobile `overflow-inline: hidden` (not blanket `overflow: hidden`) in `shell-start-nav-reveal.css` |
| *(uncommitted)* | Shell chrome polish | Symmetric header inset; mark + Montserrat banana wordmark (header/footer); language select always shows active locale; header `CdxSelect` RTL chevron **open issue** documented |
| *(uncommitted)* | Nav collapse + drawer reveal | `useShellNavigationCollapse`, `shell-start-nav-reveal.css`, collapsed border fix |
| *(uncommitted)* | Primary nav quiet-tabs overrides | `shell-primary-nav-overrides.css` — hide tab scroll buttons; normal tab label weight |
| `0e9f156` | Shell scroll regions + body-band layout | `PageGrid` **body** slot only; `.frontdoor-shell__body-scroll`; independent start/body scroll; footer short-page pin + **48px** inset; reverted `footer` grid slot |
| `2f9fa60` | Static site footer | `ShellSiteFooter`, `config/siteFooter.ts`, banana `footer-*` keys; Figma **393:4639** |
| `38b4808` | Start column chrome | Transparent panel + `border-inline-end`; **281px** width; section nav hover (`--color-progressive`) |
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

1. **Wire content section navigation** to real content routes (replace `href="#"` placeholders and prototype active map on non-explorer pages).
2. **Search overlay** — wire collapsed utility search icon to open search UI.
3. **Align body content width with header lock** — confirm whether main/end columns should also lock at 1440px or stay fluid until Codex desktop-wide.
4. **Wire explorer side nav** to real doc routes or in-page anchors.
5. **Implement search** in header (Nuxt Content FTS5 per `ARCHITECTURE.md`).
6. **Apply opt-in filters** to module/endpoint lists and Scalar display.
7. **Mobile explorer** — dedicated small-screen module rail placement (currently stacked; start nav capped at **40dvh** with scroll when long).
8. **Reduce full reload** at explorer boundary if Nuxt/Scalar SPA transitions become stable without DOM bleed.
9. **Editorial content** for Use content and data, Community, Contribute, Get help.
10. **Instance display names** — move from English literals in `config/instances.ts` to i18n or API-sourced labels.
11. **Confirm footer width with design** — keep **main-column only** or adopt Figma [354:33034](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=354-33034) main+end span.
12. **Add footer horizontal logo asset** — replace composed 14px mark + wordmark with Figma **227×14px** lockup when asset is finalized.
13. **Codex RTL loading strategy** — evaluate alternatives to `link.disabled` toggling (e.g. `codex.style-bidi.css`, disabling LTR base when RTL is active) before production. **Blocks:** header language `CdxSelect` expand chevron in RTL (see `ARCHITECTURE.md` → RTL and BiDi).
14. **Header language select RTL chevron** — resolve without per-component Codex CSS overrides; options include bidi stylesheet, Codex-native trigger icon pattern, or relaxed header width.
15. **Replace chrome height estimate** — `--fd-layout-shell-chrome-block-size-estimate` (`11rem`) is a prototype constant; measure header band at runtime when sticky panels need exact alignment.
16. **Settings and login** — Prototype the user's dashboard and token management flows.
17. **Internationalization review** — Audit global shell and explorer UX against best practices for multilingual and BiDi interfaces.
18. **Accessibility (AA)** — Test and remediate for WCAG AA; ensure the site is fully operable via screen reader technology.
19. **Standardized shell chrome** — Replace prototype header, side navigation menus, and footer with shared standardized Wikimedia portal components.
20. **Codex loading patterns** — Replace default Nuxt skeleton/loading elements with Codex components.
21. **Codex styling review** — Audit visual styles to make sure that the correct [Codex design tokens](https://doc.wikimedia.org/codex/latest/design-tokens/overview.html) are being applied accross the site.

---

## Related files (implementation index)

| Area | Primary files |
|------|----------------|
| Site grid + chrome tokens | `app/assets/css/page-grid.css`, `app/components/shared/PageGrid.vue` |
| Primary nav + redirects | `config/mainNavigation.ts`, `config/contentRedirects.ts`, `config/remoteContentSources.ts` |
| Shell | `app/layouts/default.vue`, `app/assets/css/main.css` |
| Shell scroll regions | `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `app/assets/css/shell-start-nav-scroll.css`, `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/main.css` |
| Nav collapse + drawer | `app/composables/useShellNavigationCollapse.ts`, `app/composables/useShellNavigationBreadcrumbs.ts`, `app/composables/useShellCollapsedNavMenu.ts`, `app/components/shared/ShellCollapsedNavigation.vue`, `app/components/shared/ShellCollapsedNavMenuOverlay.vue`, `config/shellNavigation.ts`, `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/shell-collapsed-nav-menu.css` |
| Start column chrome | `app/layouts/default.vue` (scrollport border), `app/assets/css/page-grid.css` (`--fd-layout-start-panel-inline-size`), `app/assets/css/shell-start-nav-scroll.css`, `app/components/shared/ShellSidePanelNav.vue` (dividers), `app/composables/usePageSectionNav.ts` |
| Site footer | `app/components/shared/ShellSiteFooter.vue`, `config/siteFooter.ts`, `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `i18n/*` (`footer-*`) |
| Header brand | `app/components/shared/ShellHeaderBrand.vue`, `public/images/developer-portal-logo-mark.svg`, `config/brandTypography.ts` |
| Header chrome | `app/layouts/default.vue`, `app/components/shared/ShellHeaderBrand.vue`, `app/components/shared/ShellHeaderUtilityActions.vue`, `app/components/shared/ShellPrimaryNav.vue` |
| Header utility collapse | `config/headerChrome.ts`, `app/composables/useHeaderUtilityCollapse.ts`, `app/composables/useShellHeaderUtilityMenu.ts` |
| Header Codex overrides | `app/assets/css/shell-primary-nav-overrides.css`, `app/plugins/codex-rtl-styles.client.ts` |
| i18n (section nav) | `i18n/en.json`, `i18n/qqq.json` (`section-nav-*`, `section-nav-site-label`) |
| Section nav config | `config/sectionNavigation.js`, `config/explorerSideNav.js`, `app/utils/contentRoute.ts` |
| Primary nav | `config/mainNavigation.ts`, `app/composables/useMainNavigationLinks.ts` |
| Explorer page | `app/pages/explorer/index.vue` |
| Module rail | `app/components/explorer/ExplorerModuleRail.vue` |
| Project controls | `app/components/explorer/ExplorerProjectControls.vue` |
| Explorer side nav (mode links) | `usePageSectionNav.ts`, `ShellSidePanelNav.vue`, `config/explorerSideNav.js`, `app/utils/explorerRoute.ts` |
| Explorer side nav (legacy component) | `app/components/explorer/ExplorerSideNav.vue` — superseded; not mounted |
| Scalar focus | `app/composables/useExplorerScalarFocus.ts`, `app/utils/scalarOperationNavigation.ts` |
| End-panel nav align | `app/composables/useEndPanelNavAlign.ts`, `app/assets/css/shell-end-panel-nav.css` |
| Scalar + Codex visuals | `app/assets/css/main.css`, `app/assets/css/explorer-codex-overrides.css` |
