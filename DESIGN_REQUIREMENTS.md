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
- **Shell chrome layout** (`design-chrome` branch): header width locks at **1440px** while the page grid remains fluid until **1680px** — asymmetry is intentional for header exploration; body alignment at wide viewports is **unresolved**
- **`display: contents`** on layout wrappers for header grid placement — approved for exploration; revisit for a11y if needed

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

### Brand logo

**Decision:** The start column shows a **Wikimedia Developer Portal** wordmark (`public/images/developer-portal-logo.svg`, 153×48) above the section menu. The logo links to **Get started** (localized home path) via `ShellBrandLogo.vue`.

**Status:** **Prototype asset** — temporary SVG wordmark for chrome exploration; not final brand guidance.

**Source:** `app/components/shared/ShellBrandLogo.vue`, `app/composables/useMainNavigationLinks.ts`.

### Start column section navigation

**Decision:** On every route that maps to a primary nav item, the start column shows a **flat** vertical section menu below the logo:

- **Section headings** (bold) and **page links** share one list — no nested sub-menus or extra indent for items under a heading.
- **Horizontal dividers** (`--border-color-subtle`) separate section groups within the menu.
- **No `border-inline-end`** on the start column (panel edge is background-only).
- **Fixed width** **241px** (`--fd-layout-start-panel-inline-size`) at tablet and above; collapse into the header is **deferred** until responsive chrome work.
- **Exactly one** menu item shows a selected state at a time (current page). On Get started (`/`), only **Introduction** is selected.

**Content sources:**

| Primary nav | Config | Notes |
|-------------|--------|-------|
| Get started, Learn, Enterprise, Community, Contribute, Get help, About | `config/sectionNavigation.js` | IA from Developer Portal v2 |
| API Explorer | `config/explorerSideNav.js` | Two sections: API Explorer + Overview placeholders |

**Rendering:** `usePageSectionNav()` → `ShellSidePanelNav.vue` in `app/layouts/default.vue`. Labels via banana-i18n only.

**Codex exception:** `CdxMenuItem` is used **standalone** (not inside `CdxMenu`). Approved for this static shell list; do not reuse for floating menus without review.

**Status:** **Visual/IA prototype only.** All item links use `href="#"` with `@click.prevent`. Active state comes from `PROTOTYPE_ACTIVE_ITEM_BY_CONTENT_PATH` in `usePageSectionNav.ts` (content routes) or `isActive` in `explorerSideNav.js` (explorer). Wiring to real content routes is future work.

**Superseded:** `ExplorerSideNav.vue` is no longer mounted; explorer uses the shared side panel component.

**Design reference:** [Unified Developer Front Door — side panel (Figma)](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=334-5128)

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

**Header chrome width (project-specific):** Below **1440px** viewport, the header bar is **fluid** within Codex page margins. At **≥ 1440px**, the header **`max-inline-size` locks** (1135px at desktop margins — see `--fd-layout-chrome-max-inline-size` in `page-grid.css`). **This is not a Codex breakpoint.** The rest of the page grid remains fluid until the Codex **1680px** desktop-wide cap unless future work aligns body content to the header lock.

**Desktop wide behaviour:** At viewports wider than 1679px, the **page content block keeps the same width** as at 1679px; only the **outer start and end margins increase**. Main and end columns share remaining space in a **16:4** ratio (`4fr` / `1fr` grid tracks).

**Rationale:** Aligns with Codex layout tokens and Wikimedia portal conventions; wide screens avoid over-long line lengths in the main column.

### Shell column distribution (desktop)

On **desktop** and **desktop wide**, the implemented shell uses a **fixed start panel** plus fluid main and end columns:

| Area | Width | Role |
|------|-------|------|
| **Start** | **241px fixed** | Brand logo + section navigation (`ShellBrandLogo`, `ShellSidePanelNav`) |
| **Main** | **4fr** (≈16/20 of remainder) | Header utilities, primary nav, page content |
| **End** | **1fr** (≈4/20 of remainder) | Reserved on all pages; on `/explorer`, API Explorer **module rail** (teleported to `#explorer-end-panel`) |

On **desktop** and **desktop wide**, both side columns are **always present** in the grid. Non-explorer routes keep the end column as empty reserved space for future page-level navigation.

**Column gutters:** Uniform **`--fd-layout-grid-gutter`** (`--spacing-150`, **24px** at tablet and desktop) between all grid columns, including between the start panel and main column.

**Note:** The Codex **4 \| 16 \| 4** mental model is preserved via the main:end **16:4** ratio; the start column is **not** a fluid grid fraction — it is locked to the Figma side-panel width until responsive collapse is implemented.

**Source (prototype):** `app/assets/css/page-grid.css`, `app/components/shared/PageGrid.vue`.

**Breakpoints:** Media queries use [Codex breakpoint tokens](https://doc.wikimedia.org/codex/latest/design-tokens/breakpoint.html) from `theme-wikimedia-ui.css` (e.g. `--min-width-breakpoint-tablet`, `--max-width-breakpoint-desktop`). JavaScript `matchMedia` helpers: `app/utils/codexBreakpointMediaQuery.ts`.

### Implementation status

| Design spec | Status | Implementation |
|-------------|--------|------------------|
| Mobile 320px–639px (4-col tokens, 16px gutter/margins, stacked) | **Implemented** | `page-grid.css` — `--spacing-100` page margin and gutter |
| Tablet 640px–1119px (fixed start + fluid main, 24px gutter/margins) | **Interim** | `page-grid.css` — `241px` start + `1fr` main; end panel hidden until desktop |
| Desktop 1120px–1679px (fixed start + 4fr \| 1fr main:end, 32px margins) | **Implemented** | `page-grid.css` — `--spacing-200` page margin; both side panels on sides, always reserved |
| Desktop wide ≥ 1680px (fixed 1679px shell, fixed start + 16:4 main:end) | **Implemented** | `page-grid.css` — `@media (min-width: 1680px)`, `--max-width-breakpoint-desktop` cap |
| Header chrome fluid width (&lt; 1440px viewport) | **Implemented** | `default.vue` — `display: contents` grid placement; chrome spans col 2 (tablet) or cols 2–3 (desktop) |
| Header chrome width lock (≥ 1440px viewport) | **Implemented** | `page-grid.css` + `default.vue` — `--fd-layout-chrome-max-inline-size`; **not** a Codex token |
| Header bottom border meets start panel | **Implemented** | `default.vue` — negative `margin-inline-start` + gutter `padding-inline-start` on chrome (tablet+) |
| Main content horizontal alignment (no inline-start padding) | **Implemented** | `default.vue` — `.frontdoor-shell__main` block padding only; aligns via grid gutter inset on chrome |

**Responsive behaviour summary:**

| Viewport | Shell layout |
|----------|----------------|
| **&lt; 640px** | **Interim:** main first, then start (brand + section nav); end panel hidden — full side-panel responsive deferred |
| **640px–1119px** | **Interim:** **241px** fixed start + fluid main; end panel hidden until desktop |
| **≥ 1120px** | Fixed **241px** start + **4fr \| 1fr** main:end (both side panels on sides, all routes); **no** start-column edge border |
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
| Start column brand + section nav | `ShellBrandLogo`, `ShellSidePanelNav`, `usePageSectionNav` | Logo SVG is **prototype**; nav links are **`href="#"`** placeholders |
| Primary nav as Codex quiet tabs | `ShellPrimaryNav`, `usePrimaryNavigationTab` | Tab panels hidden — **navigation-only** Codex exception |
| Two-row header (utility + tabs) | `default.vue` `.frontdoor-shell__chrome` | Settings **disabled**; log in **non-functional** |
| Header spans main + end band | `display: contents` grid hoisting in `default.vue` | **`display: contents`** — revisit for a11y if needed |
| Header border meets start panel | Negative margin + gutter padding on chrome | Tablet+ side-by-side layout only |
| Main content gutter alignment | No `padding-inline-start` on `.frontdoor-shell__main` | Aligns via chrome content inset, not duplicate padding |
| Header fluid below 1440px | Chrome spans content band within page margins | Respects Codex `--fd-layout-page-margin` per breakpoint |
| Header locks at ≥ 1440px | `--fd-layout-chrome-max-inline-size` | **Not a Codex breakpoint**; body grid stays fluid until 1680px cap |
| Start column no edge border | Removed `border-inline-end` on start panel | Background-only separation |
| Quiet tabs duplicate border removed | CSS override in `ShellPrimaryNav` | Chrome owns single bottom edge |

**Architecture reference:** `ARCHITECTURE.md` → Shell layout and chrome.

### Header (utility row + primary navigation)

**Decision:** Two-row header chrome spanning the **full content band** (main + end columns on desktop) within Codex page margins, with a bottom border on the full chrome block:

| Row | Contents |
|-----|----------|
| **Utility** | Search (`CdxSearchInput`, max **640px**), settings (`CdxButton` + configure icon, **disabled** prototype), interface language (`CdxSelect`), Log in link |
| **Primary nav** | Codex **quiet** tabs (`CdxTabs` + `CdxTab`, `framed={false}`) via `ShellPrimaryNav` |

**Width:** Below **1440px** viewport, chrome is **fluid** — it spans from the start-panel inline edge to the page inline-end (respecting Codex page margins per breakpoint). At **≥ 1440px**, chrome **`max-inline-size` locks** at `--fd-layout-chrome-max-inline-size` (**1135px** with current tokens: 1440 − 64px desktop margins − 241px start panel). Wider viewports grow **outer margins only** for the header bar; the bar itself does not widen.

**Disclaimer:** The **1440px** lock applies to **header chrome only**. The page grid (`PageGrid`) remains fluid between 1440px and 1679px and caps at **1679px** at Codex desktop-wide (≥ 1680px). Header and body width may **diverge** on viewports between 1440px and 1679px until product confirms whether body content should also lock at 1440px.

**Grid placement:** On tablet and above, `.frontdoor-shell__content` and `.fd-page-grid__main` use **`display: contents`** so `.frontdoor-shell__chrome` is a direct grid item. The page grid uses **`grid-template-rows: auto 1fr auto`**. Side panels span all rows (`grid-row: 1 / -1`).

**Padding:** `--spacing-150` block-start; **`--fd-layout-grid-gutter` inline-start** on header content (tablet+, equals 24px at desktop). `--spacing-200` inline-end; `--spacing-150` gap between utility row and tab row.

**Start panel connection:** On tablet and above, negative `margin-inline-start` pulls `.frontdoor-shell__chrome` across the grid gutter so its **bottom border meets the start panel**. Content padding equals the gutter width so tabs and search align with main-column content below.

**Tab layout:** Quiet tab labels use **extra `--spacing-75` (12px) block-end padding** beyond Codex defaults (4px block-start, 12px inline) for alignment with the header bottom border. Tab panels are hidden — navigation only; page content renders in the main slot. **Codex override:** the quiet-tabs header bottom border is removed (`ShellPrimaryNav`) because `.frontdoor-shell__chrome` already draws the single header edge (Figma layout).

**Utility row alignment:** Controls are grouped at the **inline-end** (search grows up to 640px, then settings, language, log in).

| Element | Behaviour |
|---------|-----------|
| Search (`CdxSearchInput`) | Functional when header container fits the field; interim container query collapses to icon-only below ~640px — **full header responsive deferred** |
| Search icon button | Shown when container &lt; ~640px; **disabled** prototype |
| Settings (`CdxButton` + configure icon) | **Disabled** prototype |
| Interface language (`CdxSelect`) | **Functional** — switches interface locale; on explorer, does not change URL |
| Log in | Text link (`--color-progressive`), `@click.prevent` — **non-functional** prototype |

**Primary navigation:** `v-model:active` bound to route via `usePrimaryNavigationTab()`; tab select calls `navigateTo()` with locale-aware paths from `useMainNavigationLinks()`.

**Status:** Visual chrome prototype aligned to [Unified Developer Front Door — header (Figma)](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=336-12667). Header responsive collapse deferred.

**Source:** `app/layouts/default.vue`, `app/components/shared/ShellPrimaryNav.vue`, `app/composables/usePrimaryNavigationTab.ts`.

### Primary navigation row (superseded)

**Previous decision:** Horizontal `NuxtLink` list with `router-link-active` styling. **Superseded** by Codex quiet tabs above.

### Footer

**Decision:** Footer band with **neutral subtle** background and centred small text in the **main column** (grid row 3, column 2 at tablet+).

**Pinning:** On **mobile** (&lt; 640px), footer uses flex **`margin-block-start: auto`** inside `.frontdoor-shell__content`. On **tablet+**, footer pinning uses the page grid row layout (`grid-template-rows: auto 1fr auto`) with **`align-self: end`** on the footer grid item.

**Disclaimer:** Footer does **not** span the end column or the full content band — only the main column. Full-width footer alignment with header chrome is **future work** if required by final design.

### Main content padding

**Decision:** Main slot (`.frontdoor-shell__main`) uses **`padding-block: var(--spacing-200)`** (32px) only — no inline-start padding. Horizontal alignment with the header content comes from the **24px grid gutter** between start and main columns (same inset as chrome content padding).

**Note:** Page titles (`h1`) have **no extra top margin**; vertical rhythm comes from main padding only (aligned with explorer page title).

**Source:** `app/layouts/default.vue`, `app/assets/css/main.css`.

### Start column chrome

**Decision:** The start column (`.shell-side-panel`) uses **`--background-color-neutral-subtle`**, padding **`--spacing-150`** top / **`--spacing-100`** bottom / **`--spacing-200`** inline-start / **`--spacing-75`** inline-end. A subtle divider separates the logo from the section menu when navigation is shown.

**Status:** Prototype styling aligned to [Unified Developer Front Door (Figma)](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=334-5128). Responsive collapse deferred.

**Source:** `app/layouts/default.vue`, `app/assets/css/main.css` (shell side-panel font stack).

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

1. **Wire section navigation** to real content routes (replace `href="#"` placeholders and prototype active map).
2. **Collapse start column** into header on small viewports (responsive chrome).
3. **Align body content width with header lock** — header caps at 1440px viewport width; page grid caps at 1680px (1679px). Confirm whether main/end columns should also lock at 1440px or stay fluid until Codex desktop-wide.
4. **Wire explorer side nav** to real doc routes or in-page anchors.
5. **Implement search** in header (Nuxt Content FTS5 per `ARCHITECTURE.md`).
6. **Apply opt-in filters** to module/endpoint lists and Scalar display.
7. **Mobile explorer** — dedicated small-screen module rail placement (currently stacked, start column hidden).
8. **Reduce full reload** at explorer boundary if Nuxt/Scalar SPA transitions become stable without DOM bleed.
9. **Editorial content** for Learn, Enterprise, Community, Contribute, Get help.
10. **Instance display names** — move from English literals in `config/instances.ts` to i18n or API-sourced labels.
11. **Review `display: contents`** shell pattern for accessibility-tree and focus-management impact.

---

## Related files (implementation index)

| Area | Primary files |
|------|----------------|
| Site grid + chrome tokens | `app/assets/css/page-grid.css`, `app/components/shared/PageGrid.vue` |
| Shell | `app/layouts/default.vue`, `app/assets/css/main.css` |
| Start column chrome | `app/components/shared/ShellBrandLogo.vue`, `app/components/shared/ShellSidePanelNav.vue`, `app/composables/usePageSectionNav.ts` |
| Header chrome | `app/layouts/default.vue`, `app/components/shared/ShellPrimaryNav.vue`, `app/composables/usePrimaryNavigationTab.ts` |
| Section nav config | `config/sectionNavigation.js`, `config/explorerSideNav.js`, `app/utils/contentRoute.ts` |
| Primary nav | `config/mainNavigation.ts`, `app/composables/useMainNavigationLinks.ts` |
| Explorer page | `app/pages/explorer/index.vue` |
| Module rail | `app/components/explorer/ExplorerModuleRail.vue` |
| Project controls | `app/components/explorer/ExplorerProjectControls.vue` |
| Explorer side nav (legacy) | `app/components/explorer/ExplorerSideNav.vue` — superseded by `ShellSidePanelNav` |
| Scalar focus | `app/composables/useExplorerScalarFocus.ts`, `app/utils/scalarOperationNavigation.ts` |
| End-panel nav align | `app/composables/useEndPanelNavAlign.ts`, `app/assets/css/shell-end-panel-nav.css` |
| Scalar + Codex visuals | `app/assets/css/main.css`, `app/assets/css/explorer-codex-overrides.css` |
