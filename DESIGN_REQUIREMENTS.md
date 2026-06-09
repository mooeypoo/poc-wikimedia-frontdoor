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
- Shell header with search, settings, language, and account link
- Primary site navigation below the header
- API Explorer page layout, module rail, project controls, loading states
- Scalar visual alignment with Codex tokens

**Explicitly prototype / not final:**

- The site is not yet fully responsive
- Search and settings controls are present but **disabled** or non-functional; the account link navigates to `/account`
- API Explorer page's **left side nav** links use `href="#"` and do not route anywhere
- Learn, Enterprise, Community, Contribute, and Get help pages are **empty Markdown stubs**
- Opt-in filters (beta / internal endpoints) are **UI only** — not wired to spec filtering
- Full reload when crossing `/explorer` boundary (UX trade-off for reliability; see `ARCHITECTURE.md`)

---

## Information architecture

### Primary site navigation

**Decision:** Eight top-level items in this order, exposed in the shell header below the utility row:

| Order | Label (en) | Route | Notes |
|------:|------------|-------|--------|
| 1 | Get started | `/` (locale-prefixed when not default) | Former “Home”; content unchanged |
| 2 | Learn | `/learn` | Empty stub page |
| 3 | API Explorer | `/explorer` | No locale prefix (`i18n: false`) |
| 4 | Enterprise | `/enterprise` | Empty stub |
| 5 | Community | `/community` | Empty stub |
| 6 | Contribute | `/contribute` | Empty stub |
| 7 | Get help | `/get-help` | Empty stub |
| 8 | About | `/about` | Existing about content |

**Source:** `config/mainNavigation.ts`, labels via banana-i18n (`nav-*` keys).

**Rationale:** Mirrors a full developer-portal IA while keeping explorer outside locale-prefixed routing.

### Brand link

**Decision:** Application title in the **left grid column** links to **Get started** (localized home path), not a separate “home” label.

### API Explorer left navigation (side nav)

**Decision:** On `/explorer` only, the start column shows a **two-section** vertical nav:

1. **API Explorer** — single active item: “Wikimedia API modules”
2. **Overview** — placeholder links (access policy, rate limits, authentication, licensing, stability, changelog, libraries/SDKs)

**Source:** `config/explorerSideNav.js`.

**Status:** Visual/IA mock only. Links do not navigate; `isActive` is config-driven for the modules item only.

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

**Desktop wide behaviour:** At viewports wider than 1679px, the **page content block keeps the same width** as at 1679px; only the **outer start and end margins increase**. Column width on the 24-column grid is **40px** at this breakpoint (Codex spec).

**Rationale:** Aligns with Codex layout tokens and Wikimedia portal conventions; wide screens avoid over-long line lengths in the main column.

### Shell column distribution (desktop, 24-column grid)

On **desktop** and **desktop wide**, the implemented shell uses a **4 + 16 + 4** column split within the 24-column grid:

| Area | Span | Role |
|------|------|------|
| **Start** | 4 cols | Brand; on `/explorer`, left documentation side nav; reserved on all other pages for future section navigation |
| **Main** | 16 cols | Header utilities, primary nav, page content |
| **End** | 4 cols | Reserved on all pages; on `/explorer`, API Explorer **module rail** (teleported to `#explorer-end-panel`) |

On **desktop** and **desktop wide**, both side columns are **always present** in the grid (**4 + 16 + 4**). Non-explorer routes keep the end column as empty reserved space for future page-level navigation.

**Source (prototype):** `app/assets/css/page-grid.css`, `app/components/shared/PageGrid.vue`.

**Breakpoints:** Media queries use [Codex breakpoint tokens](https://doc.wikimedia.org/codex/latest/design-tokens/breakpoint.html) from `theme-wikimedia-ui.css` (e.g. `--min-width-breakpoint-tablet`, `--max-width-breakpoint-desktop`). JavaScript `matchMedia` helpers: `app/utils/codexBreakpointMediaQuery.ts`.

### Implementation status

| Design spec | Status | Implementation |
|-------------|--------|------------------|
| Mobile 320px–639px (4-col tokens, 16px gutter/margins, stacked) | **Implemented** | `page-grid.css` — `--spacing-100` page margin and gutter |
| Tablet 640px–1119px (8-col, 2 \| 6, 24px gutter/margins) | **Interim** | `page-grid.css` — start + main only; end panel hidden until desktop |
| Desktop 1120px–1679px (24-col fluid, 4 \| 16 \| 4, 32px margins) | **Implemented** | `page-grid.css` — `--spacing-200` page margin; both side panels on sides, always reserved |
| Desktop wide ≥ 1680px (fixed 1679px shell, 24 × 40px tracks) | **Implemented** | `page-grid.css` — `@media (min-width: 1680px)`, `--max-width-breakpoint-desktop` cap |

**Responsive behaviour summary:**

| Viewport | Shell layout |
|----------|----------------|
| **&lt; 640px** | **Interim:** main first, then start (brand); end panel hidden — full side-panel responsive deferred |
| **640px–1119px** | **Interim:** 8-column **2 \| 6** (start + main); end panel hidden until desktop |
| **≥ 1120px** | 24-column grid: **4 \| 16 \| 4** (both side panels on sides, all routes); start column `border-inline-end` |
| **≥ 1680px** | Same column spans; grid box **max 1679px** centered; column tracks **40px** fixed |

**Note:** `@media` conditions in `page-grid.css` use **px literals** aligned to Codex breakpoint tokens (`640px`, `1120px`, `1680px`) because custom properties are unreliable in media query conditions.

### Explorer layout (module rail and reference panel)

**Decision:** On `/explorer`, the **end** column hosts a teleported **module rail** (`#explorer-end-panel`). The **main** column holds project controls and the Scalar reference panel.

**Below desktop (&lt; 1120px):** Side panels use the interim layout above; module rail and full 2-panel placement are **desktop-only** until side-panel responsive behaviour is implemented.

**Wide (≥ 960px on explorer page):** Reference panel and Scalar shell use sticky, viewport-height scrolling as documented in **API Explorer page layout** below.

---

## Shell chrome

### Header (utility row)

**Decision:** Fixed **4rem** header row containing:

| Element | Behaviour |
|---------|-----------|
| Search (`CdxSearchInput`) | Shown when header container ≥ ~640px; **disabled** prototype |
| Search icon button | Shown when container &lt; ~640px (Codex field hidden); **disabled** |
| Settings (`CdxButton` + configure icon) | **Disabled** prototype |
| Interface language (`CdxSelect`) | **Functional** — switches interface locale; on explorer, does not change URL |
| Log in | Text link, `@click.prevent` — **non-functional** prototype |

**Responsive pattern:** CSS container query on `frontdoor-header` at `max-width: var(--max-width-breakpoint-mobile)` collapses full search to icon-only.

**Source:** `app/layouts/default.vue`.

### Primary navigation row

**Decision:** Horizontal link list directly under the header, **16px** gap (`--spacing-100`), wrap on small widths. Active route uses `router-link-active` (bold + emphasized colour).

**Typography:** `--font-size-medium`, `--line-height-small`; explicit Codex sans stack on nav links (avoids Arial fallback on Windows).

### Footer

**Decision:** Full-width footer band with **neutral subtle** background, centred small text, pinned to bottom of shell column via flex (`margin-block-start: auto`).

### Main content padding

**Decision:** Main slot uses **`padding-block: var(--spacing-200)`** (32px). Page titles (`h1`) have **no extra top margin**; vertical rhythm comes from main padding only (aligned with explorer page title).

**Source:** `app/layouts/default.vue`, `app/assets/css/main.css`.

---

## Typography and colour

### Design tokens

**Decision:** All first-party UI uses **Codex Wikimedia UI theme tokens** (`@wikimedia/codex-design-tokens/theme-wikimedia-ui.css`) and Codex component styles.

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

1. **Wire explorer side nav** to real doc routes or in-page anchors.
2. **Implement search** in header (Lunr per `ARCHITECTURE.md`).
3. **Apply opt-in filters** to module/endpoint lists and Scalar display.
4. **Mobile explorer** — dedicated small-screen module rail placement (currently stacked, start column hidden).
5. **Reduce full reload** at explorer boundary if Nuxt/Scalar SPA transitions become stable without DOM bleed.
6. **Editorial content** for Learn, Enterprise, Community, Contribute, Get help.
7. **Instance display names** — move from English literals in `config/instances.ts` to i18n or API-sourced labels.

---

## Related files (implementation index)

| Area | Primary files |
|------|----------------|
| Site grid | `app/assets/css/page-grid.css`, `app/components/shared/PageGrid.vue` |
| Shell | `app/layouts/default.vue`, `app/assets/css/main.css` |
| Primary nav | `config/mainNavigation.ts`, `app/composables/useMainNavigationLinks.ts` |
| Explorer page | `app/pages/explorer/index.vue` |
| Module rail | `app/components/explorer/ExplorerModuleRail.vue` |
| Project controls | `app/components/explorer/ExplorerProjectControls.vue` |
| Explorer side nav | `app/components/explorer/ExplorerSideNav.vue`, `config/explorerSideNav.js` |
| Scalar focus | `app/composables/useExplorerScalarFocus.ts`, `app/utils/scalarOperationNavigation.ts` |
| End-panel nav align | `app/composables/useEndPanelNavAlign.ts`, `app/assets/css/shell-end-panel-nav.css` |
| Scalar + Codex visuals | `app/assets/css/main.css`, `app/assets/css/explorer-codex-overrides.css` |
