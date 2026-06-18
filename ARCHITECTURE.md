# ARCHITECTURE.md — Front Door Developer Portal

This document describes the architecture of the Front Door project: how it is structured, why key decisions were made, and how the main concerns are separated. Read this alongside `AGENTS.md`, which describes behavioural rules for working in the codebase, and `DESIGN_REQUIREMENTS.md`, which records UI/UX decisions.

For the full decision history and comparative analysis, see the project design document.

---

## The core problem this architecture solves

Wikimedia's REST API spec surface is a **hypercube**:

- Multiple REST modules per wiki instance, discoverable via `/w/rest.php/discovery`
- Multiple wiki instances, each with their own `/discovery` endpoint
- Each instance × module combination exists in multiple languages
- Language coverage varies per instance

A conservative count yields ~400 OpenAPI specs for Wikipedia alone, plus additional specs per project and language. Static site generation — building HTML from specs at deploy time — is not viable at this scale. The architecture is therefore **hybrid**: static for prose content, fully dynamic for spec rendering.

---

## High-level structure

```
Front Door
├── Static shell (Nuxt 4 + Nuxt Content)
│   ├── Prose pages (policy, guides, landing)  ← pre-rendered at build time
│   ├── banana-i18n                             ← authoritative for ALL interface strings
│   ├── Codex components                        ← Wikimedia design system throughout
│   └── Per-locale Markdown content             ← content translation, limited language set
│
└── API Explorer (client-side SPA)
    ├── @scalar/api-reference                   ← OpenAPI rendering + sandbox
    ├── Runtime spec resolution                 ← instance + language + module → spec URL
    ├── Wikimedia OAuth 2.0 + PKCE              ← session state in Pinia
    └── Scalar plugin layer                     ← Vue components injected into explorer UI
```

The explorer route (`/explorer/**`) is configured as `ssr: false` in `nuxt.config.ts`. It is never pre-rendered. Everything else is pre-rendered via `nuxt generate`.

---

## Directory structure

```
/
├── app/                        # Nuxt 4 app directory
│   ├── pages/
│   │   ├── index.vue           # Landing page (static, pre-rendered)
│   │   ├── explorer/
│   │   │   └── index.vue       # Explorer page (client-only, ssr: false)
│   │   └── [...slug].vue       # Catch-all for Markdown content pages
│   ├── components/
│   │   ├── explorer/           # Components used only in the explorer
│   │   ├── content/            # Components used only in content pages
│   │   └── shared/             # Components used across both surfaces
│   │       ├── PageGrid.vue            # Shell responsive grid wrapper
│   │       ├── ShellHeaderBrand.vue    # Header brand (`dev-portal-logo.svg` lockup)
│   │       ├── ShellSidePanelNav.vue   # Start-column section menu (when sections exist)
│   │       └── ShellPrimaryNav.vue     # Header primary nav quiet tabs
│   ├── composables/            # All shared logic; see Composables section below
│   ├── plugins/
│   │   ├── banana-i18n.js      # Registers banana-i18n globally; provides $i18n
│   │   └── explorer-route-navigation.client.ts  # Full reload across /explorer boundary
│   ├── utils/
│   │   ├── explorerRoute.ts    # isExplorerRoutePath() for layout and plugins
│   │   └── contentRoute.ts     # Main-nav id from route path; locale prefix stripping
│   ├── app.vue                 # NuxtPage :page-key for route remounts
│   └── layouts/
│       └── default.vue         # Shell layout: full-bleed header band; always-on start panel; section nav
│
├── config/                     # Project-level configuration (not Nuxt config)
│   ├── instances.ts            # Wiki instance definitions and base URLs
│   ├── languages.js            # Supported languages with explicit dir declarations
│   ├── mainNavigation.ts       # Primary shell nav order, paths, API explorer link constant
│   ├── contentRedirects.ts     # Legacy URL 301 redirects (learn, about, enterprise)
│   ├── sectionNavigation.js    # Content-page left-rail sections (keyed by main nav id)
│   ├── explorerSideNav.js      # Explorer left-rail section structure (banana keys)
│   ├── explorerOptIn.ts        # Explorer opt-in checkbox input values
│   └── scalar.js               # Scalar component defaults
│
├── content/                    # Nuxt Content Markdown source
│   ├── en/                     # English content (index, use-content-and-data, …)
│   ├── ar/                     # Arabic content (where available)
│   └── [locale]/               # Per-locale Markdown directories
│
├── i18n/                       # banana-i18n message files
│   ├── en.json
│   ├── ar.json
│   └── [locale].json
│
├── scripts/                    # Build-time and maintenance scripts
│   └── sync-wiki-content.js    # Fetches on-wiki translations → writes to content/
│
├── stores/                     # Pinia stores
│   └── oauthSession.js         # OAuth token state and session management
│
└── nuxt.config.ts              # Nuxt configuration; routeRules; runtimeConfig
```

---

## The three layers

The codebase is separated into three layers with narrow interfaces between them. Violating this separation is a code quality issue.

### Layer 1: Engine / data layer

**Where:** `app/composables/`, `scripts/`, Nuxt server routes (`server/`)

**Responsibility:** Fetching, resolving, transforming. This layer knows about:
- The MediaWiki REST API and Action API
- The `/discovery` endpoint structure
- How to construct a spec URL from an instance + language + module triple
- The language fallback chain
- OAuth token exchange
- Wiki content fetching and Markdown conversion

**Does not know about:** Vue component structure, Nuxt routing, how results are displayed.

**Returns:** Typed data structures and reactive refs. Never returns markup.

### Layer 2: Business logic / configuration layer

**Where:** `config/`, `app/composables/` that encode project rules

**Responsibility:** Project-specific decisions:
- Which wiki instances are supported
- Which languages are supported, and in which direction
- What the fallback chain is for each language
- Default selections on first load
- Scalar feature configuration

**Does not know about:** Component structure, fetch implementation details.

### Layer 3: UI layer

**Where:** `app/components/`, `app/pages/`

**Responsibility:** Rendering data and handling user interaction. Calls composables to get reactive data. Renders it using Codex components. Passes user actions back up via events or composable actions.

**Does not contain:** Fetch calls, URL construction, fallback logic, business rules. Pure helpers for labels, BiDi, and a11y live in `app/utils/` (for example `explorerEndpointLabels.ts`, `bidiLabel.ts`).

---

## Composables reference

All composables live in `app/composables/` and follow the `use` naming convention. Each must have a full JSDoc block.

| Composable | Provides |
|---|---|
| `useDiscovery(instance)` | Fetches and caches the raw `/w/rest.php/discovery` response for a given instance; all module and spec URL data flows from here |
| `useWikiModules(instance)` | Wraps `useDiscovery`; returns the reactive list of available modules with their spec URLs exactly as provided by discovery |
| `useSpecUrl(instance, moduleName)` | Selects the spec URL for a named module from the discovery response; never constructs URLs from parts |
| `useLocaleWithFallback(requestedLocale)` | Best available locale given the fallback chain in config |
| `useOAuthSession()` | Token state, auth initiation, token display data; wraps the Pinia oauthSession store |
| `useScalarConfig(specUrl)` | Reactive Scalar configuration object for a given spec URL; handles Object.assign update pattern |
| `useExplorerBootstrap(instance)` | Aggregated explorer bootstrap (modules, selection, Scalar switch state) via `/api/explorer-bootstrap` |
| `useWikiInstancePicker(instanceId)` | Wiki combobox menu items and display-name ↔ instance-id bridge for Codex controls |
| `useMainNavigationLinks()` | Shell primary nav labels (banana) and locale-aware paths; explicit `/explorer` path |
| `usePrimaryNavigationTab()` | Active primary nav tab id from current route; pairs with `ShellPrimaryNav` |
| `useShellNavigationCollapse(navRowRef, expandedNavContentRef)` | Whether primary tabs and the start-column section menu are collapsed into the header hamburger + breadcrumb row; `ResizeObserver` with hysteresis (`config/shellNavigation.ts`) |
| `useShellNavigationBreadcrumbs()` | Primary and section labels for `ShellCollapsedNavigation` breadcrumbs |
| `usePageSectionNav()` | Resolves start-column section navigation for the current route; always returns a navigation source (sections may be empty). Content IA from `config/sectionNavigation.js`, explorer from `config/explorerSideNav.js`; fallback `section-nav-site-label` when no config entry. Layout always mounts `.shell-side-panel`; `ShellSidePanelNav` when sections are non-empty (stays mounted when nav collapsed — `inert` / `aria-hidden`). Prototype active states only |
| `useExplorerScalarFocus(...)` | Resolves Scalar nav ids and scrolls/focuses a module-rail endpoint after spec load (see Module rail → Scalar operation focus) |
| `useEndPanelNavAlign(...)` | Aligns end-column page navigation with a main-column anchor (explorer project controls; reusable for future section menus) |
| `useContentLocale()` | Current content locale, falling back per the configured chain |
| `useDirection()` | Current text direction ('ltr' or 'rtl') based on active language / wiki instance config |

---

## Shell section navigation (start column)

The **start column** is **always mounted** on every page. At tablet+, the grid track is normally **281px** wide when navigation is expanded; it collapses to **0** width when primary nav does not fit (see **Responsive navigation collapse** below). It shows a **route-aware section menu** when config defines sections; otherwise the panel renders **empty** (e.g. **Tools and bots**). **API Explorer** uses `config/explorerSideNav.js` via `isExplorerRoutePath()` — not via a primary-nav tab id. Routes without a section config entry still get an empty panel (`section-nav-site-label`). This is **chrome prototype** behaviour: links do not navigate to real destinations yet, and active/selected states are driven by a prototype map or config flags — not by deep content routing.

```
Route path
    ↓
isExplorerRoutePath()?  → yes → config/explorerSideNav.js
    ↓ no
getMainNavigationIdFromPath()     ← app/utils/contentRoute.ts
    (null on /explorer; matches remote primary-nav sources by localPath)
    ↓
usePageSectionNav()
    └── main nav id → config/sectionNavigation.js (sections may be empty)
    ↓
banana-i18n labels + single global active item
    ↓
.shell-side-panel (always) + ShellSidePanelNav (when sections.length > 0)
```

**Rendering.** `app/layouts/default.vue` always mounts the start panel (`.shell-side-panel`); `SharedShellSidePanelNav` renders when `navigationSections` is non-empty and remains in the DOM when navigation is collapsed (`inert` + `aria-hidden` on the panel wrapper). The layout calls `usePageSectionNav()` only — components do not read config or resolve routes directly.

**Panel height (tablet+).** The start column track is **viewport-height constrained** below the chrome band (grid row `minmax(0, 1fr)` inside a `100dvh` shell). When section nav content exceeds that height, **`.frontdoor-shell__side-panel--start`** scrolls with **`overflow-block: auto`** (browser default scrollbar). Horizontal overflow is **`overflow-inline: hidden`** so drawer animation does not spill labels into the main column. The main + end body band scrolls in **`.frontdoor-shell__body-scroll`** — see **Shell scroll regions** below.

**Panel edge (not background).** The start column track is **transparent**; separation from main content uses **`border-inline-end: 1px solid var(--border-color-subtle)`** on `.fd-page-grid__start` in `default.vue` when expanded. When **`.frontdoor-shell--nav-collapsed`**, **`border-inline-end-width: 0`** on the track (scoped rule in `default.vue` — a zero-width cell must not paint a 1px edge). Border width transitions on expand with the drawer (`--transition-duration-medium`). This **supersedes** the earlier `#F3F3F3` panel background exploration. The legacy token `--fd-layout-start-panel-background-color` remains in `page-grid.css` but is **not consumed** — retained only if design reverts to a filled panel. See `DESIGN_REQUIREMENTS.md` → Start column chrome.

**Codex exception — `CdxMenuItem` outside `CdxMenu`.** `ShellSidePanelNav` renders `CdxMenuItem` **outside** a floating `CdxMenu`. Codex documents menu items as menu-only; this is an intentional shell-chrome exception approved for the side panel (static list, not a dropdown). See `DESIGN_REQUIREMENTS.md` → Start column section navigation.

**Codex exception — section nav hover colour.** Non-selected menu items use custom CSS (`:hover`) to set label text to **`--color-progressive`**. Codex `CdxMenuItem` hover normally only changes **background** (`--background-color-interactive-subtle--hover`); it does not turn unselected item text progressive. Additionally, when used outside `CdxMenu`, the `highlighted` prop is never toggled (the parent menu normally handles `@change` events), so shell styles must use **`:hover`**, not `.cdx-menu-item--highlighted`. Selected items keep Codex’s built-in `--color-progressive` via `cdx-menu-item--selected`. Implemented in `ShellSidePanelNav.vue`.

**Superseded component.** `app/components/explorer/ExplorerSideNav.vue` is retained but **not mounted** by the layout; explorer sections are rendered through the shared `ShellSidePanelNav` path above.

**Primary navigation.** `ShellPrimaryNav` uses Codex quiet tabs for route switching. Tab panels are hidden (`display: none` on `.cdx-tabs__content`) because page content lives in the main column — navigation-only usage, documented in `DESIGN_REQUIREMENTS.md`.

**Fixed width.** The start **drawer panel** uses `--fd-layout-start-panel-inline-size` (**281px** = Figma side panel **241px** + one Codex desktop grid column **40px**) from `page-grid.css`. The **grid track** uses **`min-inline-size: 0`** so its inline size is controlled by `grid-template-columns` (0 or 281px) — not a fixed min on the cell. This is a **prototype deviation** from the Figma side-panel width.

### Responsive navigation collapse and start drawer

When the primary nav row (quiet tabs + API Explorer link) does not fit, **`useShellNavigationCollapse`** sets **`.frontdoor-shell--nav-collapsed`** on the shell root.

**Measurement.** `ResizeObserver` on `.frontdoor-shell__primary-nav-row` and `.frontdoor-shell__primary-nav-expanded__content` (intrinsic `max-content` width). Hysteresis in `config/shellNavigation.ts`:

| Transition | Rule |
|------------|------|
| **Collapse** (expanded → collapsed) | `scrollWidth + 24px > clientWidth` |
| **Expand** (collapsed → expanded) | `scrollWidth + 48px ≤ clientWidth` |

**Collapsed (instant).** `ShellCollapsedNavigation` replaces visible quiet tabs (expanded row kept in DOM, `visibility: hidden`, for measurement). Start grid track → **`grid-template-columns: 0 minmax(0, 1fr)`**, **`column-gap: 0`**. Start track **`border-inline-end-width: 0`**. Brand loses **`--spacing-75`** inline-start padding (aligns with hamburger row). Section nav panel: **`inert`** + **`aria-hidden`**.

**Expanded (drawer on widen).** `app/assets/css/shell-start-nav-reveal.css` animates:

1. **Grid track** grows `0` → `281px` + gutter restored — **pushes** `.fd-page-grid__body`.
2. **Fixed-width panel** (281px) slides in from inline-start inside the clipping track (`transform: translate3d(±100%, 0, 0)` → `0`; RTL mirrored).
3. **Border** width `0` → `1px` on the track.

Codex **transition** tokens: `--transition-duration-medium` (250ms), `--transition-timing-function-user` (`ease-out`). `prefers-reduced-motion: reduce` disables transitions. Collapse does **not** animate.

**Deferred:** hamburger button opens a menu/drawer on click (Figma [50:2731](https://www.figma.com/design/zaMJ5QqulosJKuoHE2gCKK/Off-wiki-page-templates?node-id=50-2731)) — collapse is viewport-driven only.

**Source:** `app/composables/useShellNavigationCollapse.ts`, `app/composables/useShellNavigationBreadcrumbs.ts`, `app/components/shared/ShellCollapsedNavigation.vue`, `app/assets/css/shell-start-nav-reveal.css`, `config/shellNavigation.ts`, `app/layouts/default.vue`.

## Shell layout and chrome

The default layout (`app/layouts/default.vue`) mounts the application shell inside `PageGrid` (`app/components/shared/PageGrid.vue`). Layout tokens and breakpoint rules live in `app/assets/css/page-grid.css`. Visual and interaction decisions are recorded in `DESIGN_REQUIREMENTS.md` → Shell chrome.

### Grid structure

```
.frontdoor-shell
├── .frontdoor-shell__chrome-band     ← full viewport width (background + bottom border)
│   └── .frontdoor-shell__chrome-inner   ← full width; same inline-start inset as PageGrid
│       └── .frontdoor-shell__chrome     ← utility row + primary nav (+ API Explorer link)
└── .frontdoor-shell__page-grid (PageGrid)
    ├── .fd-page-grid__start        ← start panel always mounted; 281px track when expanded, 0 when collapsed; inline-end border
    └── .fd-page-grid__body         ← `.frontdoor-shell__body-scroll` (main + end scrollport)
        └── .frontdoor-shell__body-columns (main:end 16:4 at desktop)
            ├── .frontdoor-shell__content → .frontdoor-shell__main (page slot) + ShellSiteFooter
            └── .frontdoor-shell__side-panel--end   ← module rail / reserved space (desktop+)
```

**Page grid (tablet+).** Two outer tracks: **start** + **body**. The body band contains a **main:end** sub-grid (`4fr | 1fr` at desktop) in `default.vue`. The site footer lives **inside** `.frontdoor-shell__content` (main track only). **`.frontdoor-shell__body-scroll`** is the vertical scrollport for main + end — scrollbar at the **inline-end** edge of the body band; wheel over the empty end column scrolls central content (Discord-style). On short pages, `.frontdoor-shell__content` uses **`min-block-size: 100%`** plus column flex so the footer sits on the shell bottom. See **Site footer** and **Shell scroll regions** below.

**Shell scroll regions.** Reference: [Discord developer docs](https://docs.discord.com/developers/bots/overview) — fixed chrome, independent column scrollports.

| Region | Scroll container | When scrollbar appears |
|--------|------------------|------------------------|
| **Document** | None (`body { overflow: hidden }`) | Never — shell owns vertical scroll |
| **Shell** | `.frontdoor-shell` (`block-size: 100dvh`, `overflow: hidden`) | Never |
| **Start column** | `.frontdoor-shell__side-panel--start` (tablet+) or `.fd-page-grid__start` (mobile stacked) | When section nav content exceeds visible body height |
| **Main column** | `.frontdoor-shell__body-scroll` (viewport-bleed inline-end) | Scrollbar at **viewport inline-end**; main + end content width locked at desktop wide |

**Mechanism:** Chrome band is **`flex-shrink: 0`**. Page grid is **`flex: 1; min-block-size: 0`**. Column tracks use **`min-block-size: 0; overflow: hidden`**; inner scrollports use **`overflow-y: auto`** and **`overscroll-behavior: contain`** (browser default scrollbar styling only — no custom scrollbar CSS). Sticky explorer panels and end-column nav max-heights use **`--fd-layout-shell-body-block-size-estimate`** (`100dvh` minus a chrome height estimate in `page-grid.css`).

**Source:** `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `app/assets/css/main.css`.

**Rendering.** The layout calls composables for navigation state only (`usePrimaryNavigationTab`, `usePageSectionNav`, `useContentSearch`, etc.). Components in the start column and header receive resolved props — they do not fetch data or read route config directly.

### Header chrome placement

The header lives **outside** `PageGrid` in a **full-bleed band** (`.frontdoor-shell__chrome-band`: `inline-size: 100vw`, centred breakout via `margin-inline-start: calc(50% - 50vw)`). Inner content (`.frontdoor-shell__chrome-inner`) uses the **same inline-start inset** as `.fd-page-grid` via `--fd-layout-page-margin-inline-start` (full width — not independently centred with a narrower `max-inline-size`).

**Inline-start alignment (Figma [Navigation 225:4548](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=225-4548)):** At tablet+, `.frontdoor-shell__chrome` uses the **same grid columns** as `PageGrid` (`281px` start + fluid body, shared gutter). Brand sits in the start column with **`--spacing-75`** inline-start padding when expanded; padding is **removed** when `.frontdoor-shell--nav-collapsed` so the logo aligns with the collapsed hamburger row. Primary nav / collapsed breadcrumbs span **both columns** (`grid-column: 1 / -1`) **without** that inset. Utility actions sit in the body column with **`justify-content: flex-end`**. Start-column collapse and drawer expand — see **Responsive navigation collapse and start drawer** above.

The **start column** holds section navigation **below** the header band only. At desktop, main and end share the content row; the footer is inside the main column (`frontdoor-shell__content`).

**Mobile (&lt; 640px):** Stacked interim layout — start panel (always mounted; nav when sections exist; **max 40dvh** + scroll if long), then **body scrollport** (main + footer). Header and start panel use **`--spacing-100` (16px)** inline padding to match mobile page margins. On short pages, **`.frontdoor-shell__content`** uses **`min-block-size: 100%`** inside the body scrollport so the footer band sits on the shell bottom with **48px** inner inset (see **Site footer**). Primary nav + start column also collapse when the nav row is too narrow (same `useShellNavigationCollapse` flag); mobile drawer uses block-size + vertical slide in `shell-start-nav-reveal.css`.

### Chrome width

**Fluid width (viewport &lt; 1440px):** Header band is full viewport; inner content grows with the centred shell up to page margins.

**Locked width (viewport ≥ 1680px):** `--fd-layout-page-margin-inline-start` grows so the grid content block stays centred at the Codex desktop cap (`1679px`). Header and `PageGrid` share this token — no separate header `max-inline-size` lock at 1440px.

**Main content alignment:** `.frontdoor-shell__main` uses **`padding-block: var(--spacing-200)`** only — no inline-start padding. Main column content aligns with the header utility row via the grid gutter between start and main columns.

**Disclaimer — 1440px vs Codex desktop-wide:** **`1440px` is a project-specific breakpoint** (Figma shell chrome), not a Codex design token. The **page grid** still caps at **1679px** (`--max-width-breakpoint-desktop`) at **≥ 1680px**. Whether body content should also lock at 1440px is **unresolved** — see `DESIGN_REQUIREMENTS.md` → Open questions.

### Layout CSS tokens (shell)

| Token | Value / source | Purpose |
|-------|----------------|---------|
| `--fd-layout-start-panel-inline-size` | 281px (`calc(15.0625rem + 2.5rem)`) | Fixed start column width (Figma 241px + one 40px grid column) |
| `--fd-layout-start-panel-background-color` | `#f3f3f3` | **Legacy / unused** — superseded by transparent panel + inline-end border; retained for possible revert |
| `--fd-layout-page-margin-inline-start` | `--fd-layout-page-margin` / grows at ≥ 1680px | Shared inline-start inset: `.frontdoor-shell__chrome-inner`, `.fd-page-grid` |
| `--fd-layout-page-margin` | `--spacing-100` / `--spacing-150` / `--spacing-200` by breakpoint | Inline-end inset: `.frontdoor-shell__chrome-inner`, `.frontdoor-shell__body-scroll` |
| `--fd-layout-grid-gutter` | `--spacing-100` (mobile) / `--spacing-150` (tablet+) | Gaps between grid columns |
| `--fd-layout-grid-max-inline-size` | Codex `--max-width-breakpoint-desktop` (1679px) | Whole grid cap at ≥ 1680px |
| `--fd-layout-chrome-lock-viewport-inline-size` | 1440px (90rem) | Header width lock reference (**not Codex**) |
| `--fd-layout-grid-content-max-inline-size` | `calc(1440px lock − 2×desktop margin)` | Header inner `max-inline-size` at ≥ 1440px |
| `--fd-layout-chrome-max-inline-size` | `calc(lock − 2×desktop margin − start panel)` | Legacy content-band width (main + end only); superseded by full-bleed header |
| `--fd-layout-shell-chrome-block-size-estimate` | `11rem` | Chrome height estimate for sticky panel max-heights |
| `--fd-layout-shell-body-block-size-estimate` | `calc(100dvh − chrome estimate)` | Visible shell body below chrome band |
| `--fd-header-search-input-min-inline-size` | `16rem` (256px) | Search field minimum when utility row is expanded |
| `HEADER_UTILITY_COLLAPSE_THRESHOLD_PX` | `576px` (`config/headerChrome.ts`) | `ResizeObserver` threshold for compact utility row |
| `--fd-layout-body-columns-max-inline-size` | `calc(1679px cap − margins − start − gutter)` | Main:end sub-grid max width at ≥ 1680px (expanded start nav) |
| `--fd-layout-body-columns-collapsed-max-inline-size` | `calc(1679px cap − margins)` | Main:end sub-grid max width at ≥ 1680px when start nav collapsed |

**Page grid slots:** `PageGrid` exposes **`start`** and default **`body`** slots only (no `end` or `footer` grid tracks). The end panel and site footer are composed inside the **body** slot in `default.vue` (`.frontdoor-shell__body-scroll` → `.frontdoor-shell__body-columns`).

Media queries in `page-grid.css` and `default.vue` use **px literals** aligned to Codex tokens (`640px`, `1120px`, `1680px`) plus the project **`1440px`** chrome lock, because custom properties are unreliable inside `@media` conditions in many browsers.

### Shell chrome components

| Component | Role | Config / composable |
|-----------|------|---------------------|
| `ShellHeaderUtilityActions.vue` | Utility row (search, settings, language, log in; responsive collapse) | `useShellHeaderUtilityMenu`, `useContentSearch`, `config/headerChrome.ts` |
| `ShellHeaderBrand.vue` | Header brand (`dev-portal-logo.svg` lockup, 32px height); links to Get started | `useMainNavigationLinks()` |
| `ShellSidePanelNav.vue` | Flat section menu in start column (mounted when sections exist) | `usePageSectionNav()` |
| `ShellSiteFooter.vue` | Static site footer (main column band) | `config/siteFooter.ts` |
| `ShellCollapsedNavigation.vue` | Collapsed header nav (hamburger + breadcrumbs) | `useShellNavigationBreadcrumbs()` |
| `ShellPrimaryNav.vue` | Codex quiet tabs for primary nav | `usePrimaryNavigationTab()`, `useMainNavigationLinks()` |

**API Explorer header link.** Not a tab. `default.vue` renders a `NuxtLink` to `API_EXPLORER_NAVIGATION_PATH` (`/explorer` from `config/mainNavigation.ts`) **immediately after** the quiet tab list in `.frontdoor-shell__primary-nav-row`. Tabs use **`flex: 0 1 auto`** (intrinsic width) so the link follows the last tab, not the inline-end of the row. **`gap: var(--spacing-150)` (24px)** between the last tab and the link. Uses `cdxIconArrowNext` (`--color-progressive` on the icon). Active state when `isExplorerRoutePath()`; no primary tab is selected on explorer routes (`getMainNavigationIdFromPath` returns `null`).

### Codex exceptions (shell chrome)

1. **`ShellSidePanelNav`** — renders `CdxMenuItem` **outside** a floating `CdxMenu`. Codex documents menu items as menu-only; approved for this static side-panel list. **Additional override:** non-selected items use custom `:hover` CSS for `--color-progressive` text (see **Shell section navigation** — hover colour).
2. **`ShellPrimaryNav`** — `CdxTabs` **navigation-only** (tab panels hidden via CSS); route changes via `navigateTo()` on `navigation-select`. Quiet-tabs **header bottom border suppressed** via `shell-primary-nav-overrides.css` (re-imported after dynamic `codex.style-rtl.css` load) — `.frontdoor-shell__chrome-band` owns the single header edge per Figma. **Tab scroll buttons** (`.cdx-tabs__prev-scroller` / `.cdx-tabs__next-scroller`) are **hidden** in the same file — Codex shows them on overflow and they **flicker on first paint** before intersection observers settle; shell chrome will use a separate responsive approach. **Tab label weight:** all labels **`--font-weight-normal`** — Codex sets **700** on every quiet-tab label by default; selected state uses colour/underline only.
3. **Start column edge** — **`border-inline-end`** with `--border-color-subtle` on `.fd-page-grid__start` when expanded; **`border-inline-end-width: 0`** when collapsed. **Not** the earlier `#F3F3F3` exploratory surface (token retained but unused). See `DESIGN_REQUIREMENTS.md` → Start column chrome.
4. **Start column width** — **281px** drawer panel (Figma 241px + one Codex 40px grid column); grid track width is **0 or 281px** via collapse. **Deviation from Figma** side-panel spec; prototype widening only.
5. **`ShellHeaderBrand`** — single **`dev-portal-logo.svg`** lockup (32px height, paths not live text) so typography does not follow user system fonts; `aria-label` from banana `app-title` only.
6. **Search field** — `CdxSearchInput` in `ShellHeaderUtilityActions` (`flex: 1 1 auto`, max **40rem**, **256px** min when expanded). `useHeaderUtilityCollapse` (`ResizeObserver` on the utility track) switches to compact mode below `HEADER_UTILITY_COLLAPSE_THRESHOLD_PX` (`config/headerChrome.ts`): search icon, compact language select (icon + code), and `CdxMenuButton` for settings/log in. Collapsed search activation is **deferred**.
7. **Interface language `CdxSelect`** — menu items omit per-item `icon` props (text-only dropdown). The closed select shows **`cdxIconLanguage`** via the Codex **`#label` scoped slot**, not `defaultIcon` (which Codex only applies when no selection is made). Menu labels use **`isolateLabel()`** (Unicode FSI/PDI) because option-like rendering targets cannot include `<bdi>` tags — see `AGENTS.md` BiDi isolation rule. **`:key="direction"`** remounts the control when interface direction changes (pairs with RTL stylesheet toggle in `codex-rtl-styles.client.ts`).
8. **`ShellSiteFooter` wordmark typography** — Figma Footer **393:4639** specifies **Montserrat**; shell uses Codex **`--font-family-sans-stack`** until brand fonts ship. Header brand uses **`dev-portal-logo.svg`** (outlined paths, not live text).
9. **`ShellSiteFooter` brand lockup** — Figma uses a horizontal **227×14px** lockup; shell composes **14px `developer-portal-logo-mark.svg` + banana `footer-brand-wordmark`** until the footer logo asset ships.

### Interface locale picker (shell)

The header **`CdxSelect`** in `app/layouts/default.vue` switches the banana-i18n interface locale (`$setInterfaceLocale`, Vue I18n `locale`). Supported values: `en`, `es`, `fr`, `he`, `fa` (prototype subset).

**Display pattern (Figma header):**

| Surface | Icon | Label |
|---------|------|-------|
| Closed select (trigger) | Yes — `cdxIconLanguage` via `#label` slot | Selected language name or placeholder |
| Dropdown menu items | No | Language name only |

**BiDi:** Labels are passed through `isolateLabel()` so mixed-direction language names remain stable inside Codex menu rendering without HTML `<bdi>` wrappers.

**Routing:** On content routes, changing locale navigates via `switchLocalePath()` when the path differs. On `/explorer`, locale updates in place without URL prefix change — see `DESIGN_REQUIREMENTS.md` → Interface locale on explorer.

**Direction changes:** `:key="direction"` on the select remounts the control when interface locale flips LTR ↔ RTL. Codex RTL stylesheet toggling is handled by `codex-rtl-styles.client.ts` (see **RTL and BiDi** below).

**Utility row layout (row 1):** `.frontdoor-shell__header-top` is **`justify-between`**: `ShellHeaderBrand` (inline-start) and `ShellHeaderUtilityActions` (inline-end, `flex: 1 1 auto`). **Gap between logo and utilities: `var(--spacing-150)` (24px).** Expanded utilities: search (`flex: 1 1 auto`, **256px** min, max **40rem**), settings, language select (**8–11rem**), log in. Collapsed: search icon button + `CdxMenuButton` (`cdxIconEllipsis`). See `DESIGN_REQUIREMENTS.md` → Shell chrome.

**Primary nav row (row 2):** `.frontdoor-shell__primary-nav-row` — quiet tabs (`flex: 0 1 auto`, intrinsic width) plus the **API Explorer** progressive link (`flex: 0 0 auto`) on the same baseline, **24px** (`--spacing-150`) after the last tab. See `DESIGN_REQUIREMENTS.md` → Shell chrome.

**Source:** `app/layouts/default.vue` (`languageMenuItems`, `selectedInterfaceLocale`, `#label` slot, `.frontdoor-shell__api-explorer-link`).

### Site footer

Static footer band (`ShellSiteFooter.vue`) rendered inside `.frontdoor-shell__content` in `default.vue` (sibling of `.frontdoor-shell__main`).

**Width:** Matches the **main column** / central page content — same inline size as `.frontdoor-shell__content`. Does **not** span the end panel at desktop and does **not** extend under the start navigation column.

**Short-page pin:** On viewports shorter than the content, the footer band’s **bottom edge** aligns with the shell bottom and legal copy sits **48px** above that edge (`padding-block-end: --spacing-300`). Mechanism: **`.frontdoor-shell__body-scroll`** is the body-band scrollport; **`.frontdoor-shell__content`** is a **column flex** container with **`min-block-size: 100%`**; `.frontdoor-shell__main` uses **`flex: 1 1 auto`**. When content is short, no scrollbar appears and flex growth pins the footer. When content is long, the body scrollport shows a browser default scrollbar at the **inline-end** edge of the main + end band. No separate footer grid row and **no margin** below the footer element.

**Legal copy:** Three banana-i18n sentences (one per line) with an inline CC BY-SA link on the middle line. Brand wordmark and legal body use **`--color-subtle`**; policy and license links use **`--color-progressive`**.

**Figma deviation (width):** Figma [Navigation 354:33034](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=354-33034) places the footer at **x=241**, **width=1199** (main + end). Implementation keeps the footer **main-column width only** — it does not span the end panel.

**Codex exceptions:** (1) Figma specifies **Montserrat** for the footer wordmark; shell uses **`--font-family-sans-stack`** until brand fonts ship (same as `ShellHeaderBrand`). (2) Footer brand is **14px mark SVG + banana wordmark**, not the Figma **227×14px** horizontal lockup asset (not yet in `public/images/`).

**Supersedes:** In-main-column `footer-title` band with `--background-color-neutral-subtle`; interim `PageGrid` **`footer`** slot spanning main + end (reverted); interim full-width footer bleed under the start column (reverted). Current placement: footer inside `.frontdoor-shell__content` only.

**Placement history (reverted interim work):** During chrome exploration, footer placement was tried in three forms before the current layout:

| Attempt | Mechanism | Why reverted |
|---------|-----------|--------------|
| `PageGrid` **`footer`** slot, `grid-column: 2 / -1` | Footer grid row below main + end | Superseded by body-band scrollport (`0e9f156`); footer moved into `.frontdoor-shell__content` |
| Full-width bleed (`margin-inline` negative on footer) | Footer under start nav column | Does not match Figma — start nav must stay full-height beside main + footer band |
| `grid-template-rows: 1fr auto` on outer `PageGrid` | Pin footer with grid row gap | Replaced by **flex column** on `.frontdoor-shell__content` (`min-block-size: 100%`, main `flex: 1`) inside `.frontdoor-shell__body-scroll` |

**Source:** `app/components/shared/ShellSiteFooter.vue`, `config/siteFooter.ts`, `app/layouts/default.vue` (`.frontdoor-shell__content`, `.frontdoor-shell__body-scroll`), `app/assets/css/page-grid.css`.

### Prototype / non-final shell behaviour

The following are **intentional placeholders** in the design-chrome exploration — not production-ready features:

| Area | Status |
|------|--------|
| Empty start panel (e.g. Tools and bots) | Panel always mounted; `ShellSidePanelNav` omitted when `sections` is empty |
| Start column edge | Transparent panel + `border-inline-end` (`--border-color-subtle`); legacy `#F3F3F3` background token unused |
| Start column width | **281px** (Figma 241px + 40px grid column) — prototype deviation |
| Section nav hover | Custom `:hover` progressive text on non-selected `CdxMenuItem` — Codex exception (see above) |
| Site footer | `ShellSiteFooter` inside `frontdoor-shell__content`; **main column width only** (Figma deviation — does not span end panel); **48px** bottom inset (`padding-block-end: --spacing-300`); short-page pin via content flex column inside body scrollport |
| Shell column scroll | `body { overflow: hidden }`; independent `overflow-y: auto` on start panel + `.frontdoor-shell__body-scroll` (Discord-style docs reference) |
| Primary nav tab scroll buttons | **Hidden** in `shell-primary-nav-overrides.css` — Codex overflow affordances flicker on first paint |
| Primary nav tab label weight | **Normal** for all tabs — Codex exception; selected tab uses colour/underline only |
| Footer brand lockup | 14px mark SVG + banana wordmark — not Figma horizontal footer logo asset yet |
| Section nav links | `href="#"` with `@click.prevent`; active state from prototype map in `usePageSectionNav.ts` |
| Search icon button (narrow header) | **Disabled** prototype |
| Settings button | **Disabled** prototype |
| Log in link | **Non-functional** (`@click.prevent`) |
| Brand logo SVG | **`dev-portal-logo.svg`** — single SVG lockup in header (32px height); avoids system-font wordmark drift |
| Primary nav + start column collapse | **Implemented** — `useShellNavigationCollapse`; hamburger + breadcrumbs; start drawer on expand (`shell-start-nav-reveal.css`) |
| Collapsed hamburger menu panel | **Deferred** — button visible; click interaction not wired |
| Header container-query search collapse | **Implemented** | `ShellHeaderUtilityActions` — 256px search min; `CdxMenuButton` for settings/language/log in |
| Collapsed search button activation | **Deferred** | Icon visible; overlay/expansion behaviour not defined |
| Header vs body width at ≥ 1440px | Inner header locks to grid content width at 1440px; page grid caps at 1680px — **may need alignment** |
| Codex RTL stylesheet toggle | **`link.disabled`** on injected `codex.style-rtl.css` — prototype workaround for locale switching without reload; revisit if Codex exposes direction-aware components |

Functional in prototype: interface language `CdxSelect`, content search (`useContentSearch` + `SharedSearchResults`), primary nav tab routing.

---

## i18n architecture

### Interface strings: banana-i18n only

banana-i18n is registered in `app/plugins/banana-i18n.ts` and provides `$i18n()` globally across all Vue components. It is the **only** system that may produce user-visible interface strings.

Message files live in `i18n/[locale].json` using MediaWiki message format (supports CLDR plurals, gender, named parameters).

`@nuxtjs/i18n` may be present for **content locale routing only** — it handles URL locale prefixes (e.g. `/ar/policy`). It owns no user-visible strings. Never call `$t()` for interface text.

### Content translation: Nuxt Content per-locale directories

Markdown content for prose pages lives in `content/[locale]/`. Nuxt Content queries the appropriate locale directory based on the current route locale. Language fallback (requesting content in a locale that has no file) is handled in the page component's `queryContent()` call, falling back through the chain defined in `config/languages.js`.

### Explorer internal strings: accepted exception

Scalar renders its own internal UI strings (button labels, response section headers, etc.) outside the Nuxt component tree. These do not go through banana-i18n. This is the one documented exception: it is third-party developer tooling UI, not our interface. It is noted here explicitly so it is not mistaken for an oversight.

---

## API explorer architecture

### Why `@scalar/api-reference` directly

The `@scalar/nuxt` module supports only a single spec configured at build time. This project requires runtime resolution of specs across hundreds of instance + language + module combinations. The module is therefore not used.

The Vue component is mounted in `app/pages/explorer/index.vue` inside a **`<ClientOnly>`** wrapper (required by `AGENTS.md`). The implementation uses `ExplorerScalarReference.client.vue`, which imports `@scalar/api-reference` and is only ever rendered on the client-only `/explorer` route (`ssr: false`).

### Spec resolution flow

```
User selects: wiki instance + language + module
       ↓
useWikiModules(instance)        ← fetches /discovery, returns available modules
       ↓
useSpecUrl(instance, language, module)
       ↓
  Is spec available in requested language?
  ├── Yes → return spec URL directly
  └── No  → walk languageFallbackChain from config/languages.js
            ├── Fallback found → return fallback spec URL + set fallbackNotice flag
            └── No fallback available → return null + set hasError flag
       ↓
useScalarConfig(specUrl)        ← builds reactive Scalar configuration object
       ↓
<ApiReference :configuration="scalarConfig" />
```

### Reactive spec switching

Scalar's configuration is a `reactive()` object. When the spec URL changes, the config is updated via `Object.assign()` rather than replacing the ref. This is a known requirement of the current `@scalar/api-reference` Vue component — direct ref replacement does not trigger a re-render.

```js
// In useScalarConfig:
// Object.assign is required here — replacing the reactive object reference
// does not trigger Scalar's internal re-render. This is a Scalar-specific
// constraint, not a general Vue pattern.
Object.assign( scalarConfig, { spec: { url: newSpecUrl } } )
```

If a future Scalar version changes this behaviour, update the composable and remove this comment.

When `Object.assign` is insufficient (route-boundary entry, recovery from a stuck mount), the explorer page remounts `ExplorerScalarReference` using `:key="scalarReferenceKey"` (instance + module + spec URL). This is an explicit, documented exception to config-only updates — see `AGENTS.md` failure signals.

### Module rail → Scalar operation focus

The right-hand **module rail** lists endpoints from bootstrap data. Selecting an endpoint must scroll the **Scalar reference panel** to the matching OpenAPI operation. This is application behaviour (not Scalar configuration): the rail emits a selection, bootstrap state holds a pending target, and a composable drives Scalar navigation once the spec is mounted.

```
User clicks endpoint in ExplorerModuleRail
       ↓
useExplorerBootstrap.selectModule(module, { operationTarget })
       ↓
pendingOperationTarget set (method, path, operationId, primaryTag, …)
       ↓
If module changed → startScalarSwitch (spec reload); else keep current spec
       ↓
useExplorerScalarFocus (when !isScalarSwitching && !isInstanceBootstrapping)
       ↓
resolveScalarOperationNavigationId()  ← app/utils/scalarOperationNavigation.ts
  ├── Match workspace store / sidebarItems from ApiReference
  ├── Fall back to DOM id candidates (Scalar generateId pattern)
  └── Document slug from config/scalar.ts (SCALAR_DOCUMENT_SLUG)
       ↓
scalarInterface.eventBus.emit('scroll-to:nav-item', { id })
       ↓
scrollOperationIntoView() inside .explorer-page__scalar-shell (overflow: auto)
```

**Resolution strategy.** Scalar assigns each operation a navigation id (typically `{document}/tag/{tag}/{METHOD}{path}` or `{document}/{METHOD}{path}`). `scalarOperationNavigation.ts` mirrors that id generation (GitHub slugger for segments) and searches, in order: the workspace navigation tree exposed by `ApiReference`, sidebar items, then the DOM under the Scalar shell. Candidates are tried until an element with a matching `id` exists.

**Timing and retries.** Operations are lazy-loaded in Scalar; the target node may not exist immediately after a spec switch. `useExplorerScalarFocus` polls every 100ms for up to 5s, re-emitting `scroll-to:nav-item` and scrolling the **Scalar shell container** (not only `document`) so sticky layout and `overscroll-behavior: contain` behave correctly.

**Triggers.** Focus runs when:

- The user selects an endpoint (pending target set, Scalar already ready)
- Scalar finishes switching modules (`isScalarSwitching` false → true transition)
- `ApiReference` exposes `eventBus` / workspace handles (`@interface-ready` on `ExplorerScalarReference`)

**Same-module clicks.** Selecting another endpoint in the **already active** module does not reload the spec (`selectModule` skips `startScalarSwitch` when the module name is unchanged), so focus can run immediately without waiting for a spec swap.

**UI reference.** Visual layout of the rail and endpoint rows is described in `DESIGN_REQUIREMENTS.md` → Module rail. Implementation: `useExplorerScalarFocus.ts`, `ExplorerModuleRail.vue`, `tests/scalarOperationNavigation.test.mjs`.

### Route boundary navigation

The explorer route uses `ssr: false`. Client-side Vue Router transitions **to or from** `/explorer` can leave Scalar DOM in the shell or prevent ApiReference from mounting. Two mitigations work together:

1. **`app/plugins/explorer-route-navigation.client.ts`** — `router.beforeEach` calls `window.location.assign()` when crossing the explorer boundary (full document navigation).
2. **`app/app.vue`** — `<NuxtPage :page-key="resolvePageKey" />` remounts the page component on every route change.

`app/utils/explorerRoute.ts` provides `isExplorerRoutePath()` for the layout, explorer page (teleport disable on exit), and the plugin.

Bootstrap for the explorer starts in `useExplorerBootstrap` **`onMounted`** (after hydration), not from an immediate watcher, so `/api/explorer-bootstrap` does not hang on SPA entry.

### Scalar plugin layer

The `ApiReferencePlugin` API accepts Vue components natively. Plugins are registered on the `<ApiReference>` component's `plugins` prop. Codex components and banana-i18n work inside plugins without any bridge pattern.

Two mechanisms:
- **`views`**: inject a Vue component at `content.end` (after the Models section). Use for: token display panel, instance/language context notice, fallback language notice.
- **`extensions`**: inject a Vue component tied to an `x-*` vendor extension field in the spec. Use for: per-endpoint or per-operation metadata. Requires the spec to contain the `x-*` field — only possible if the spec is under our control or can be augmented at fetch time.

---

## OAuth session

Wikimedia OAuth 2.0 uses Authorization Code flow with PKCE.

The flow:
1. User clicks "Login with Wikimedia" in the shell
2. Shell redirects to `meta.wikimedia.org/w/rest.php/oauth2/authorize` with `code_challenge`
3. Wikimedia redirects back to `/oauth/callback` in the app
4. The callback route exchanges the `code` for a token via a Nuxt server route (keeps `client_secret` server-side)
5. Token is stored in the `oauthSession` Pinia store
6. `useOAuthSession()` composable exposes token state to both the shell (for display) and the Scalar wrapper (for pre-filling auth)

The OAuth callback route (`server/routes/oauth/callback.ts`) is a Nuxt server route, not a Vue page. It handles the code exchange and redirects back to the explorer with session state set.

---

## RTL and BiDi

### Layout direction

The `<html>` element's `dir` attribute is set reactively in `app/layouts/default.vue` using `useDirection()`, which reads interface locale direction from `config/languages.js`.

**Codex RTL stylesheet:** LTR base styles load globally via `nuxt.config.ts` (`codex.style.css`). The client plugin `app/plugins/codex-rtl-styles.client.ts` injects `codex.style-rtl.css` via a persistent `<link id="fd-codex-rtl-stylesheet">` when `direction === 'rtl'` and sets **`link.disabled = true`** when direction returns to `ltr`. Without toggling, Codex components (e.g. header `CdxSelect`) keep mirrored physical layout after switching from Hebrew/Persian back to an LTR interface locale until a full reload.

**Disclaimer:** This relies on Codex’s global RTL mirror sheet (physical property overrides), not per-component `dir`. It is a **prototype workaround** for runtime locale switching. Third-party quiet-tabs borders are suppressed in `app/assets/css/shell-primary-nav-overrides.css`, re-imported when RTL is enabled so rules load after `codex.style-rtl.css`.

**Language select remount:** Header `CdxSelect` uses `:key="direction"` so the closed control re-renders when direction changes.

### BiDi isolation rule

Any string not produced by banana-i18n must be wrapped in `<bdi>`. This is enforced at review time. The categories requiring isolation are:

- Wiki instance names and project names
- REST module names and descriptions from OpenAPI specs
- Language names from data sources
- Any user-generated or user-supplied content
- Article titles, page names, or namespace names from any wiki
- Any string whose language is not statically known at component-write time

Strings from banana-i18n are safe to render without isolation — their direction matches the interface direction by definition.

### Known gap: Scalar spec content

Strings rendered by Scalar from OpenAPI spec content (parameter names, descriptions, schema property names, example values) are not BiDi-isolated by Scalar. This is a known limitation. Mitigation: broad `unicode-bidi: isolate` CSS applied to Scalar's content containers. An upstream issue should be filed with Scalar requesting per-string isolation. See the design document for full details.

### CSS direction strategy

Front Door currently uses a single explicit strategy for direction-aware CSS.

**Native CSS logical properties (first-party CSS).**
All CSS authored in this project — component `<style>` blocks, layout styles, Nuxt Content prose styles, anything we write — uses CSS logical properties exclusively. This is the default and preferred mechanism.

| Do not use | Use instead |
|---|---|
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` |
| `padding-left` / `padding-right` | `padding-inline-start` / `padding-inline-end` |
| `left` / `right` | `inset-inline-start` / `inset-inline-end` |
| `border-left` / `border-right` | `border-inline-start` / `border-inline-end` |
| `text-align: left` / `right` | `text-align: start` / `end` |
| `float: left` / `right` | `float: inline-start` / `inline-end` |
| `width` (when block-axis aware) | `inline-size` |

The browser flips logical properties automatically based on the `dir` attribute on `<html>` (set reactively in `app/layouts/default.vue`). No build step, no runtime cost, no duplicated stylesheets, works inside scoped SFC styles. Browser support is universal in the baseline we target.

**Explorer (Scalar) direction policy.**
We intentionally do not run a global CSS RTL flipper over third-party explorer styles in the current phase. The explorer renders API-oriented content that is frequently LTR-dominant (paths, parameters, identifiers, examples). Global flipping can degrade readability and produce incorrect UI mirroring.

Instead:
- The application shell follows interface direction via `<html dir>`.
- Explorer direction choices are explicit and component-level where needed (`dir="ltr"`, `dir="rtl"`, `dir="auto"`).
- External dynamic strings remain BiDi-isolated with `<bdi>`.

**Overrides and exceptions.**
Direction overrides are explicit in templates and components:

- For Vue components: set `dir="ltr"`, `dir="rtl"`, or `dir="auto"` on the element when its content requires a specific direction regardless of the interface direction (URL inputs, file paths, code, identifier-like content → `ltr`; an Arabic/Hebrew name input → `rtl`; user-supplied free text → `auto`). Each intentional pin carries a brief code comment explaining why.

**What we do not do.**
- Do not ship a separate `app.rtl.css` and toggle stylesheets at runtime — that defeats Nuxt 4 CSS code-splitting and HMR.
- Do not write physical properties in first-party CSS "for clarity" and rely on a build-time flipper. Logical properties are clearer, faster, and avoid broad unintended mirroring.

---

## Configuration files

All project-level configuration lives in `config/`. Files are documented with a file-level JSDoc block describing their purpose and the effect of each key.

| File | Contains |
|---|---|
| `config/instances.js` | Wiki instance IDs, display name i18n keys, base URLs |
| `config/languages.js` | Language codes, explicit `dir` declarations, fallback chains |
| `config/mainNavigation.ts` | Primary shell navigation order, banana message keys, locale-agnostic paths; `API_EXPLORER_NAVIGATION_PATH` for the header link (not a tab) |
| `config/contentRedirects.ts` | Legacy content URL **301** redirects merged into `nuxt.config.ts` `routeRules` |
| `config/sectionNavigation.js` | Content-page left-rail section groups and items (banana message keys only; keyed by main nav id) |
| `config/explorerSideNav.js` | Explorer left-rail sections and placeholder links (banana message keys only) |
| `config/explorerOptIn.ts` | Codex checkbox values for beta/internal endpoint filters |
| `config/scalar.js` | Scalar component defaults (theme, layout, enabled features) |

Environment-specific values use Nuxt `runtimeConfig`:
- `runtimeConfig.public.*` — values safe to expose to the client (OAuth client ID, API base URLs)
- `runtimeConfig.*` — server-only values (OAuth client secret)

### Legacy content redirects

Removed or renamed markdown routes are handled by **`config/contentRedirects.ts`**, which builds Nuxt **`routeRules`** entries (HTTP **301**) merged in `nuxt.config.ts`:

| Legacy path | Redirect target |
|-------------|-----------------|
| `/learn` | `/use-content-and-data` |
| `/about` | `/` (home) |
| `/enterprise` | `/` (home) |

Each mapping is duplicated for locale prefixes (`es`, `fr`, `he`, `fa`), e.g. `/fr/learn` → `/fr/use-content-and-data`, `/fr/about` → `/fr`. **About** and **Enterprise** markdown files are removed from `content/`; only redirects remain for old bookmarks.

**Primary navigation IA (v2, Figma node 284:11443):** Tabs — Get started, Use content and data, Tools and bots, Contribute, Community, Get help, plus **Remote MD** merged from `REMOTE_CONTENT_SOURCES`. **API Explorer** is a header link only. See `DESIGN_REQUIREMENTS.md` → Information architecture.

**Route → nav id:** `app/utils/contentRoute.ts` → `getMainNavigationIdFromPath()` returns `null` on explorer routes, matches `MAIN_NAVIGATION_ITEMS` and remote sources with `navEntry.target === 'primary'`, and strips locale prefixes before matching.

### Netlify deployment

Production deploys use the Nitro **`netlify`** preset (`npm run build:netlify`). In `nuxt.config.ts`, `compatibilityDate` must be **≥ `2024-05-07`** so Nitro does not emit the legacy CommonJS handler that breaks on Netlify Functions 2.0. See `netlify.toml` — do not set `[functions] node_bundler = "esbuild"`; bundling is declared in the generated ESM function config.

---

## Search

Per-language full-text search uses **Nuxt Content FTS5** via `useSearchCollection( 'content' )`. No separate index build step is required — Nuxt Content maintains an SQLite FTS5 index automatically. The `useContentSearch( query, activeLocale )` composable handles locale partitioning: results are split into a locale bucket and an English fallback bucket by path prefix on the client side.

The search input uses `dir="auto"` to handle RTL query input correctly. All result text (titles, snippets) is wrapped in `<bdi>` for BiDi isolation.

See `docs/adr-multilingual-search.md` for the full decision record and `docs/search-implementation-guide.md` for the implementation recipe.

---

## Markdown content pages

### Rendering pipeline

Prose pages are Markdown files in `content/[locale]/`. The catch-all route `app/pages/[...slug].vue` fetches the appropriate file via `useLocalizedContentPage()` and passes it to `<ContentRenderer>`. Nuxt Content handles parsing (micromark → unified AST) and rendering. Shiki provides syntax highlighting automatically for all fenced code blocks.

### What works today without configuration

| Feature | Mechanism |
|---|---|
| Syntax highlighting | Shiki — bundled with `@nuxt/content`, automatic |
| Heading anchor IDs + link icon | Auto-generated by `@nuxt/content` via `github-slugger`; icon shown on hover |
| Expandable sections | Native HTML `<details>` / `<summary>` in Markdown |
| Standard Markdown | Bold, italic, tables, lists, blockquotes, inline code |

### Shiki transformer features — need `nuxt.config.ts` change

`@shikijs/transformers` is already installed as a transitive dependency of `@nuxt/content`. No new package is needed — add transformers to `content.highlight.transformers` in `nuxt.config.ts`:

| Feature | Transformer |
|---|---|
| Line numbers | `transformerMetaLineNumbers()` |
| Line highlighting (`{3-5}` in code fence meta) | `transformerMetaHighlight()` |
| Diff annotations (`// [!code ++]` / `// [!code --]`) | `transformerNotationDiff()` |

### MDC component features — need new Vue files

`@nuxt/content` ships MDC (Markdown Components): any `.vue` file placed in `app/components/content/` is auto-registered and callable from Markdown using `::component-name` block syntax. All new content components must use **Codex** (`@wikimedia/codex`) — already installed — wherever an appropriate widget exists.

| File | Codex widget(s) | Markdown syntax |
|---|---|---|
| `ProseH2.vue` … `ProseH6.vue` | `CdxIcon` + `cdxIconLink` | Overrides default heading rendering; heading text is plain text, icon appears on hover via CSS. Default `@nuxtjs/mdc` wraps the full heading text in `<a>` — these components replace that with the icon-alongside pattern |
| `ProseA.vue` | `CdxIcon` + `cdxIconLinkExternal` | Overrides all `<a>` in prose; adds icon when `href` is external |
| `Callout.vue` | `CdxMessage` (`type`: `notice` / `warning` / `error`) | `::callout{type="warning"}` block |
| `CodeTabs.vue` + `CodeTab.vue` | `CdxTabs` + `CdxTab` | `::::code-tabs` / `:::code-tab{label="…"}` block |
| `AppButton.vue` | `CdxButton` | `::app-button{href="…" label="…"}` inline |

### Page-layer features — need `[...slug].vue` update

| Feature | Change |
|---|---|
| Next / Previous navigation | Read `page.prev` / `page.next` frontmatter fields; render `CdxButton` links with `cdxIconArrowPrevious` / `cdxIconArrowNext` |

### File inclusion — needs verification

MDC ships a built-in `Include` component via `@nuxtjs/mdc`. The syntax is `::include{file="./path/to/file.md"}`. This needs end-to-end testing to confirm path resolution works correctly against the `content/[locale]/` directory structure.

### Demo page

`content/en/use-content-and-data.md` exercises every feature listed above with inline status notes (works today / not yet configured / not yet implemented). Use it as the acceptance test surface when implementing any item in this section.

---

## Remote content fetching

Build-time content fetching is handled by `scripts/fetch-remote-content.mjs`. The script:
1. Reads remote sources from `config/remoteContentSources.ts`
2. Fetches content from configured remote URLs according to each source's `strategy`
3. Phase 1 (`strategy: 'markdown-url'`) fetches raw Markdown directly
4. Phase 2 (`strategy: 'html-url'` and `strategy: 'mediawiki-action-api'`) will convert HTML to Markdown using Turndown (not yet a dependency)
5. Writes files to `content/[locale]/[path].md`

The script is run as part of the build pipeline before `nuxt generate` and `nuxt build`. It is idempotent and graceful: fetch failures do not fail the build. A stale copy is kept if available; otherwise an empty placeholder is written. See `docs/adr-remote-content-fetching.md` for the full decision record.

---

## Real API endpoints

### Base URL pattern

All Wikimedia wikis follow the same MediaWiki Core REST API base URL pattern:
```
https://{language}.{project}.org/w/rest.php/v1/
```

The Wikibase REST API (Wikidata) uses a different path:
```
https://www.wikidata.org/w/rest.php/wikibase/v1
```

### Instance registry

Supported instances are defined in `config/instances.js`. The initial set for Experiment 1 covers six instances across different projects and LTR/RTL directions:

| ID | Base URL | Direction | Discovery endpoint |
|---|---|---|---|
| `enwiki` | `https://en.wikipedia.org` | LTR | `https://en.wikipedia.org/w/rest.php/discovery` |
| `arwiki` | `https://ar.wikipedia.org` | RTL | `https://ar.wikipedia.org/w/rest.php/discovery` |
| `frwiki` | `https://fr.wikipedia.org` | LTR | `https://fr.wikipedia.org/w/rest.php/discovery` |
| `hewiki` | `https://he.wikipedia.org` | RTL | `https://he.wikipedia.org/w/rest.php/discovery` |
| `wikidata` | `https://www.wikidata.org` | LTR | `https://www.wikidata.org/w/rest.php/discovery` |
| `mediawiki` | `https://www.mediawiki.org` | LTR | `https://www.mediawiki.org/w/rest.php/discovery` |

Available modules and their spec URLs for each instance are read from these endpoints at runtime. `config/instances.js` contains only base URLs and metadata — no spec URLs.

### Spec URLs and discovery

Spec URLs are **never hardcoded or interpolated**. They are always read at runtime from the discovery endpoint of each wiki instance:

```
{wiki_base}/w/rest.php/discovery
```

The discovery response lists all REST modules available for that instance, including the spec URL for each module. The code reads spec URLs directly from this response and passes them to Scalar. No URL construction from parts, no module name assumptions.

`module` is always the literal type segment in the spec URL path (i.e. `specs/v0/module/{name}/{version}`), but this is an internal detail of what discovery returns — the application treats spec URLs as opaque strings sourced from discovery, not as patterns to construct.

The `useDiscovery(instance)` composable is the single point of access for this data. It fetches the discovery endpoint, caches the result per instance, and returns the full module list. `useWikiModules(instance)` wraps it to expose just the module list to the UI layer. Neither composable constructs a spec URL from parts.

This approach means the application automatically reflects any changes to available modules or spec URLs on any instance without any code changes — the source of truth is always the live discovery endpoint.

---

## Related files (implementation index)

Shell chrome and layout work on the `design-chrome` branch is documented in **`DESIGN_REQUIREMENTS.md`** (visual/IA decisions) and this file (structure and data flow). Key implementation paths:

| Area | Primary files |
|------|----------------|
| Site grid + layout tokens | `app/assets/css/page-grid.css`, `app/components/shared/PageGrid.vue` |
| Shell layout | `app/layouts/default.vue`, `app/assets/css/main.css` |
| Start column (always mounted) | `app/layouts/default.vue` (`.shell-side-panel`), `app/composables/usePageSectionNav.ts`, `config/sectionNavigation.js`, `config/explorerSideNav.js` |
| Start column edge + width | `app/layouts/default.vue` (border), `app/assets/css/page-grid.css` (`--fd-layout-start-panel-inline-size`) |
| Site footer | `app/components/shared/ShellSiteFooter.vue`, `config/siteFooter.ts`, `app/layouts/default.vue` (`.frontdoor-shell__content`, `.frontdoor-shell__body-scroll`), `app/assets/css/page-grid.css`, `i18n/*` (`footer-*`) |
| Shell scroll regions | `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/main.css` |
| Nav collapse + drawer | `app/composables/useShellNavigationCollapse.ts`, `app/composables/useShellNavigationBreadcrumbs.ts`, `app/components/shared/ShellCollapsedNavigation.vue`, `config/shellNavigation.ts`, `app/assets/css/shell-start-nav-reveal.css` |
| Section menu component | `app/components/shared/ShellSidePanelNav.vue` |
| Header chrome | `app/components/shared/ShellHeaderBrand.vue`, `app/components/shared/ShellHeaderUtilityActions.vue`, `app/components/shared/ShellPrimaryNav.vue`, `app/assets/css/shell-primary-nav-overrides.css` |
| Primary nav + redirects | `config/mainNavigation.ts`, `config/contentRedirects.ts`, `app/composables/useMainNavigationLinks.ts`, `app/composables/usePrimaryNavigationTab.ts` |
| Route → nav id | `app/utils/contentRoute.ts`, `app/utils/explorerRoute.ts` |
| Interface strings (section nav) | `i18n/en.json`, `i18n/qqq.json` (`section-nav-*`, `section-nav-site-label`) |

---

## Experiment 1 notes

The current implementation is Experiment 1 from the project design document: verifying Scalar multi-spec reactivity in Nuxt 4 using real Wikimedia endpoints. The experiment includes the full discovery flow — `useDiscovery` fetches `/w/rest.php/discovery` per instance, `useWikiModules` exposes the module list, and the module picker populates from the live response. Spec URLs are read directly from the discovery response and passed to Scalar. Full feature scope is described in `AGENTS.md`. The experiment does not include language-level spec selection, OAuth, wiki content sync, Markdown content pages, or search. It establishes the foundational scaffold for the explorer surface and confirms the core runtime spec-switching mechanism — including RTL shell direction switching — before the remaining experiments build on it.