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
│   │   ├── account.vue         # Account: logged-out gate or OAuth dashboard (+ placeholder keys)
│   │   ├── oauth/
│   │   │   └── callback.vue    # OAuth callback page (exchange + sessionStorage handoff)
│   │   ├── explorer/
│   │   │   └── [[view]].vue    # Explorer page (client-only, enterprise sub-routes)
│   │   └── [...slug].vue       # Catch-all for Markdown content pages
│   ├── components/
│   │   ├── account/            # Account UI (logged-out gate, API key cards, Reset CdxDialog, Meta links)
│   │   ├── explorer/           # Components used only in the explorer
│   │   ├── content/            # Components used only in content pages
│   │   └── shared/             # Components used across both surfaces
│   │       ├── PageGrid.vue            # Shell responsive grid wrapper
│   │       ├── ShellHeaderBrand.vue    # Header brand (32px mark + Montserrat banana wordmark)
│   │       ├── ShellHeaderUtilityActions.vue  # Search, settings, language, Log in / username→account
│   │       ├── ShellSidePanelNav.vue   # Start-column section menu (when sections exist)
│   │       └── ShellPrimaryNav.vue     # Header primary nav quiet tabs
│   ├── composables/            # All shared logic; see Composables section below
│   ├── plugins/
│   │   ├── banana-i18n.js      # Registers banana-i18n globally; provides $i18n
│   │   ├── oauth-handoff.client.ts  # Reads one-shot sessionStorage OAuth payload into Pinia
│   │   └── explorer-route-navigation.client.ts  # Full reload across /explorer boundary
│   ├── utils/
│   │   ├── localeAwarePath.ts   # Locale-prefixed paths (account, content)
│   │   ├── openUrlInNewTab.ts    # Client-only helper for Meta-Wiki / doc links opened from composables
│   │   ├── accountTokenSecret.ts # Masking helpers for account API key secrets
│   │   ├── oauthHandoff.ts      # sessionStorage key for callback → destination token handoff
│   │   ├── explorerRoute.ts     # isExplorerRoutePath() for layout and plugins
│   │   └── contentRoute.ts      # Main-nav id from route path; locale prefix stripping
│   ├── middleware/
│   │   └── content-sidebar.global.ts  # Content `sidebar` frontmatter; forces `/account` sidebar off
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
│   ├── auth.ts                 # Account path, Meta-Wiki OAuth URLs, prototype defaults
│   ├── tokenManagement.ts      # Placeholder API key seeds + Reset fake secret generators (not real Meta data)
│   ├── explorerProjectPicker.ts # Explorer project + language picker ids and wiki instance mapping
│   ├── explorerModuleRail.ts   # Inline module rail endpoint scroll cap constant
│   ├── explorerSurfaces.ts     # Explorer project controls + module rail surface tokens (neutral-subtle bg, 4px radius)
│   ├── wikiInstanceTestWikis.ts # Production → test wiki URL mapping for write-request modal
│   ├── scalarWriteHttpMethods.ts # HTTP methods treated as write requests in the Test Request modal
│   ├── scalarClientWriteWarnings.ts # Plain HTML probe flag for modal injection debugging
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
├── scripts/                        # Maintenance scripts (run on demand, not by build)
│   ├── fetch-remote-content.mjs    # Fetches remote/on-wiki content → writes to content/
│   ├── lib/
│   │   └── wikiContentConversion.mjs  # Parsoid HTML → MDC Markdown (unified pipeline)
│   └── generate-language-catalog.mjs  # Regenerates config/languages.generated.ts
│
├── stores/                     # Pinia stores
│   ├── prototypeAuthSession.ts # Placeholder key-table owner seed (after OAuth; not access control)
│   ├── prototypeDeveloperTokens.ts  # In-memory placeholder API key lists; Reset regenerates fakes
│   └── oauthSession.js         # In-memory OAuth session (username, accessToken, expiresAt)
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

**Does not contain:** Fetch calls, URL construction, fallback logic, business rules. Pure helpers for labels, BiDi, and a11y live in `app/utils/` (for example `explorerEndpointLabels.ts`, `explorerModuleOptInFilter.ts`, `explorerModuleRailHeading.ts`, `bidiLabel.ts`).

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
| `useExplorerBootstrap(instance)` | Aggregated explorer bootstrap (modules with `headingTitle`, `moduleDescription`, operations, spec URLs, selection, Scalar switch state) via `/api/explorer-bootstrap`; exposes **`selectedEndpointOperationId`** for module rail `:selected` state |
| `useExplorerOptInFilteredModules(...)` | Filters bootstrap module lists by opt-in checkboxes; exposes visible selection/spec URL; reconciles selection when a gated module is hidden |
| `useExplorerOptInCheckboxGroup(beta, internal)` | Maps opt-in boolean refs to Codex checkbox group values (`config/explorerOptIn.ts` tokens) |
| `useExplorerProjectLanguagePicker(instanceId)` | Project + language combobox state; maps picker selections to wiki instance ids (`config/explorerProjectPicker.ts`); syncs with `selectedWikiInstanceId` from `useDirection()` |
| `useExplorerModuleSelect(visibleModules, …)` | REST API module `CdxSelect` menu items and selection bridge; discovery order after opt-in filter; `label` + `supportingText` (beta/version) + `description` (OpenAPI or config fallback); `default-label`, `menu-config`; calls `selectModule` with `source: 'module-select'` |
| `useMainNavigationLinks()` | Shell primary nav labels (banana) and locale-aware paths; explicit `/explorer` path |
| `usePrimaryNavigationTab()` | Active primary nav tab id from current route; pairs with `ShellPrimaryNav` |
| `useShellNavigationCollapse(navRowRef, expandedNavContentRef)` | Whether primary tabs and the start-column section menu are collapsed into the header hamburger + breadcrumb row; `ResizeObserver` with hysteresis (`config/shellNavigation.ts`) |
| `useShellCollapsedNavMenu({ isNavigationCollapsed, hasSectionNavigation })` | Full-screen collapsed navigation overlay: open/close, section vs primary view, Escape / route / uncollapse dismiss |
| `useShellNavigationBreadcrumbs()` | Primary and section labels for `ShellCollapsedNavigation` breadcrumbs |
| `usePageSectionNav()` | Resolves start-column section navigation for the current route; always returns a navigation source (sections may be empty). Honours `sidebar` frontmatter via `useContentPageSidebar` (`false` hides/collapses start column — used for `/account`). Content IA from `config/sectionNavigation.js`, explorer from `config/explorerSideNav.js`; fallback `section-nav-site-label` when no config entry. Explorer items with `mode` resolve `to` via `pathForExplorerMode()` and `isActive` via `explorerModeFromPath()`; `enabled: false` items are omitted. Content routes use prototype active map only. Layout always mounts `.shell-side-panel`; `ShellSidePanelNav` when sections are non-empty (stays mounted when nav collapsed — `inert` / `aria-hidden`) |
| `useExplorerMode()` | Reactive explorer mode (`community`, `enterprise-full`, `enterprise-limited`, `enterprise-custom`) from the current route via `explorerModeFromPath()` |
| `useEnterpriseExplorer(mode)` | Spec URL and Scalar overrides for Scalar-bearing enterprise modes (`enterprise-full`, `enterprise-limited`) |
| `useEndPanelNavAlign(alignAnchor, endPanel, scrollClamp?, heightMatch?)` | Aligns end-column page navigation with a main-column anchor; optional fourth argument sets `--frontdoor-end-panel-nav-max-block-size` from a height-match element (explorer: **`.explorer-page__scalar-shell`**) |
| `useExplorerModuleRailPlacement()` | Resolves module rail Teleport target and layout mode: end column (≥ 1120px) vs inline below project controls (< 1120px) |
| `useExplorerModuleRailInlineEndpointScrollCap(scrollport, endpointList, …)` | On inline layout when the endpoint panel is expanded and endpoint count exceeds `EXPLORER_MODULE_RAIL_INLINE_MAX_VISIBLE_ENDPOINTS` (`config/explorerModuleRail.ts`), measures the first N row block size and sets `--explorer-module-rail-inline-endpoint-scroll-max-block-size` on the scrollport |
| `useContentLocale()` | Current content locale, falling back per the configured chain |
| `useDirection()` | Current text direction ('ltr' or 'rtl') based on active language / wiki instance config |
| `useAccountPath()` | Locale-aware path for the account dashboard (`buildLocaleAwarePath` in `app/utils/localeAwarePath.ts`) |
| `usePrototypeAuthSession()` | Placeholder key seeding after OAuth login; wraps `prototypeAuthSession` store (**does not grant `/account` access**; key tables remain placeholders until Meta list APIs land) |
| `useAccountDashboardPage()` | Account access gate (OAuth-only), logged-out gate + dashboard banana labels, sign-out; composes token dashboard + Reset dialog |
| `useDeveloperTokenDashboard()` | **Placeholder** API key list state/view-models (not live Meta data), Meta-Wiki request URLs from `config/auth.ts`, idle Delete handlers; confirm-reset regenerates placeholders via Pinia |
| `useAccountResetApiKeyDialog()` | Reset dialog state (`CdxDialog`): confirm → success (Figma `626:7921` / `633:7695`); success Client ID / secret / refresh token are **placeholders**; real reset backend pending |
| `useCopyWithCopiedTooltip()` | Clipboard copy + brief focus/blur so `CdxTooltip` shows “Copied!” (Reset success quiet copy; keeps trigger mounted) |
| `useShellAuthNavigation()` | Shell header session control: OAuth `login`/`logout`, username, locale-aware `/account` path, `header-auth-link-aria` |
| `useShellHeaderUtilityMenu()` | Collapsed utility `CdxMenuButton` items (settings, username→account, log in/out) |
| `useScalarClientWriteEndpointWarnings(scalarInterface, selectedWikiInstanceId)` | Injects write-request **`CdxCheckbox`** and production **`CdxMessage`** into the Scalar Test Request modal (DOM mount after `.scalar-address-bar` + `ClientPlugin` slots); resets preference on modal open |
| `useScalarWriteRequestTestWiki(scalarConfiguration)` | Registers Scalar `onBeforeRequest` to rewrite write HTTP methods to the mapped test wiki when the modal checkbox is checked (`config/wikiInstanceTestWikis.ts`) |
| `useScalarWriteRequestAddressBarSync(scalarInterface, selectedWikiInstanceId)` | Debounced sync of the modal address bar server URL with checkbox state via Scalar `server:update:server` events |

**Account dashboard** (`app/pages/account.vue`):

#### Access — logged-out gate (product decision)

Unauthenticated visits to `/account` (including manually appending `/account` to the URL) show the **logged-out gate** ([Figma 1001:18723](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=1001-18723)), not the dashboard. This is the **end-state product decision**, not a temporary experiment.

| Element | Behaviour |
|---------|-----------|
| Title | banana `account-logged-out-title` — “Account dashboard” |
| Body | banana `account-logged-out-description` — prompt to log in for credentials / API keys |
| Log in | Progressive primary `CdxButton`; starts the **same** Meta OAuth + PKCE flow as the header Log in link (`useShellAuthNavigation` / `useOAuthSession.login`), with `returnTo` = locale-aware account path (`useAccountPath`) so post-auth lands on the dashboard |
| Footer | **Shell** `ShellSiteFooter` (not a page-local footer). Main column grows (`min-block-size: 100%` / flex) so short gate content still pins the footer to the viewport bottom |
| Access rule | Dashboard (placeholder key cards) only when `useOAuthSession().isLoggedIn` is true |

UI: `AccountLoggedOutGate.vue`. Gate labels and `onAccountPageLogin` live in `useAccountDashboardPage`.

#### Logged-in dashboard (Figma node `966:21207`)

#### Prototype placeholders — not real API keys (pending backend)

**The personal and application API key rows on `/account` are not real credentials.** Front Door does **not** retrieve OAuth consumers, developer tokens, client secrets, or refresh tokens from Meta-Wiki or any other backend. What users see is **seed / generated placeholder data** from `config/tokenManagement.ts` held in `stores/prototypeDeveloperTokens.ts`, for **usability testing** of layout and flows only.

| Surface | Reality today | Pending |
|---------|---------------|---------|
| Key list cards (names, meta, masked secret) | Placeholder seed rows | Backend (and Meta) APIs to **list** real keys for the signed-in user |
| Reset confirm → success dialog (Client ID / Client secret / Refresh token) | Newly **generated placeholders** (`createPrototypeClientSecret` / `createPrototypeRefreshToken`); client id kept from the seed row | Backend to **reset / re-issue** real credentials and return live values |
| Delete | **Idle** (no-op) | Backend to **revoke / delete** real keys |
| “Request new API key” | Opens Meta registration URL (outbound link only); does not populate the local list with a real key | Wire approval / list sync after Meta registration |

Do **not** treat copied “secrets” from the Reset success dialog as usable against production or test wikis. OAuth **login** (username in the header) is a real Meta session; that is separate from these fake key tables. Placeholder rows are seeded only after OAuth login via `usePrototypeAuthSession` — they are not shown on the logged-out gate.

- **Start column:** Hidden via `content-sidebar.global` middleware publishing `sidebar: false` for `/account` (and locale-prefixed equivalents) so `isSidebarHidden` collapses the grid track — no empty section nav.
- **Title:** banana `account-page-title-before` + `<bdi>` username + `account-page-title-after` (English: `{username}’s dashboard`). Username is the Meta OAuth username only.
- **Sections:** Personal API keys and Application API keys — Codex `CdxButton` (quiet Reset / destructive quiet Delete — **idle**, no-op click; progressive “Request new API key”), `CdxMessage` write-token notice on application cards. Interface copy from banana; **placeholder** row fields from `config/tokenManagement.ts` are external (BiDi-isolated).
- **Reset confirmation:** Quiet Reset opens `AccountResetApiKeyDialog` (`CdxDialog`). Confirm step (Figma `626:7921`) warns; primary Reset regenerates **placeholder** secrets via `useDeveloperTokenDashboard` → `prototypeDeveloperTokens.regenerate*` (`createPrototypeClientSecret` / `createPrototypeRefreshToken` in `config/tokenManagement.ts`; client id preserved) and advances to the success step (Figma `633:7695`). Success UI: intro + three rows (**Client ID**, **Client secret**, **Refresh token**) with bold banana labels (`--font-weight-bold`), BiDi-isolated monospace values (`dir="ltr"`), quiet copy (`AccountResetCredentialCopyButton` → `useCopyWithCopiedTooltip` + `CdxTooltip` “Copied!”; button must not remount after click), and inline warning `CdxMessage`. Section stack uses `--spacing-100` (16px) between intro, credential list, and warning. **Done** / close dismisses. Open/step/credential state lives in `useAccountResetApiKeyDialog`. **Credentials shown after Reset are not real.**
- **Sign out:** Destructive `CdxButton` — clears OAuth + placeholder session and navigates home.

**Account token list UI** (`app/components/account/`): `AccountDeveloperTokenList` / `AccountOAuthConsumerList` render Figma “List-element” cards (header row with title + actions; personal cards show Issued | Status | Permissions; application cards add description, Client ID, masked secret, meta, write-token notice). Secret masking is computed in `useDeveloperTokenDashboard` (`maskSecretValue`), not in the list-item component. `AccountResetApiKeyDialog` wraps Codex `CdxDialog` (confirm then success); success rows use `AccountResetCredentialCopyButton` (quiet `cdxIconCopy` + stable mount + `CdxTooltip`).

---

## Shell section navigation (start column)

The **start column** is **always mounted** on every page. At tablet+, the grid track is normally **281px** wide when navigation is expanded; it collapses to **0** width when primary nav does not fit (see **Responsive navigation collapse** below). It shows a **route-aware section menu** when config defines sections; otherwise the panel renders **empty** (e.g. **Tools and bots**). **API Explorer** uses `config/explorerSideNav.js` via `isExplorerRoutePath()` — not via a primary-nav tab id. Routes without a section config entry still get an empty panel (`section-nav-site-label`).

**Link behaviour:** On **content routes**, section items are **prototype placeholders** (`to: null` → `href="#"`); active state comes from `PROTOTYPE_ACTIVE_ITEM_BY_CONTENT_PATH` in `usePageSectionNav.ts`. On **explorer routes**, items with a `mode` in `config/explorerSideNav.js` resolve **`to`** via `pathForExplorerMode()` in `app/utils/explorerRoute.ts`; **`isActive`** follows `explorerModeFromPath()` on the current route; items with **`enabled: false`** are omitted. Overview items (no `mode`) remain placeholders. `ShellSidePanelNav` calls **`navigateTo(item.to)`** on click when `to` is set — URL resolution stays in the composable; the component only handles the click. See `DESIGN_REQUIREMENTS.md` → Start column section navigation.

```
Route path
    ↓
isExplorerRoutePath()?  → yes → config/explorerSideNav.js
    ↓ no                      (filter enabled; mode → pathForExplorerMode)
getMainNavigationIdFromPath()     ← app/utils/contentRoute.ts
    (null on /explorer; matches remote primary-nav sources by localPath)
    ↓
usePageSectionNav()
    └── main nav id → config/sectionNavigation.js (sections may be empty)
    ↓
banana-i18n labels + resolved to + single global active item
    ↓
.shell-side-panel (always) + ShellSidePanelNav (when sections.length > 0)
    └── navigateTo(to) when item.to is set; else href="#" placeholder
```

**Rendering.** `app/layouts/default.vue` always mounts the start panel wrapper with classes **`frontdoor-shell__side-panel--start`**, **`shell-side-panel`**, and **`shell-side-panel--start`** (all three are required — block-start padding on `.shell-side-panel`, scroll-end spacer on the breakpoint scrollport in `shell-start-nav-scroll.css`, and `shell-start-nav-reveal.css` drawer rules all target the BEM `--start` suffix). `SharedShellSidePanelNav` renders when `navigationSections` is non-empty and remains in the DOM when navigation is collapsed (`inert` + `aria-hidden` on the panel wrapper). The layout calls `usePageSectionNav()` only — components do not read config or resolve routes directly. **`ShellSidePanelNav`** receives pre-resolved `to` paths and invokes **`navigateTo`** on item click when `to` is non-null (explorer mode links and collapsed-overlay reuse).

**Scroll-end inset (symmetry).** Start section nav, collapsed nav overlay, and site footer all reserve **32px** (`var(--spacing-200)`) below the last visible item. Footer inset uses **`padding-block-end`** on **`.shell-site-footer`** (`ShellSiteFooter.vue`). Start nav and overlay use a **`::after` block spacer** on the **scrollport** element — not `padding-block-end` on a nested wrapper — because nested flex + `overflow: auto` does not always extend scroll range for padding on inner panels (mobile scrollport is **`.fd-page-grid__start`**; tablet+ scrollport is **`.frontdoor-shell__side-panel--start`**; overlay scrollport is **`.shell-collapsed-nav-menu-overlay__panel`**). Spacer rules live in **`shell-start-nav-scroll.css`** (in-shell) and **`ShellCollapsedNavMenuOverlay.vue`** (overlay). Supersedes the earlier **48px** (`--spacing-300`) footer-only inset from Figma Footer **393:4639** — prototype choice for column symmetry.

**Panel height (tablet+).** The start column track is **viewport-height constrained** below the chrome band (grid row `minmax(0, 1fr)` inside a `100dvh` shell). When section nav content exceeds that height, **`.frontdoor-shell__side-panel--start`** scrolls with **`overflow-block: auto`** (`shell-start-nav-scroll.css`). Horizontal overflow is **`overflow-inline: hidden`** on the panel; the grid track (`.fd-page-grid__start`) clips during drawer motion with **`overflow: hidden`** only — it must not scroll alongside the panel.

**Scrollport mechanics (tablet+).** `.fd-page-grid__start` is a **flex column** track; the drawer panel is **`flex: 1 1 auto`**, **`min-block-size: 0`**, **`flex-shrink: 1`**. Block-axis shrink must stay enabled so the panel height is bounded by the grid row — otherwise content grows past the viewport and is clipped by the track without a scrollbar. **281px inline size** is fixed via **`inline-size` / `min-inline-size` / `max-inline-size`** on the panel, not via `flex-shrink: 0` (which only affects the flex main axis = block size in a column flex). The main + end body band scrolls in **`.frontdoor-shell__body-scroll`** — see **Shell scroll regions** below.

**Mobile scroll.** `.fd-page-grid__start` caps at **`max-block-size: 40dvh`** with **`overflow-y: auto`** (`page-grid.css`). `shell-start-nav-reveal.css` clips drawer motion with **`overflow-inline: hidden`** only (not `overflow: hidden` on the expanded track — that had suppressed vertical scroll). When **`.frontdoor-shell--nav-collapsed`**, the start track uses **`overflow: hidden`** plus **`max-block-size: 0`**.

**Panel edge (not background).** The start column track is **transparent**; separation from main content uses **`border-inline-end: 1px solid var(--border-color-muted)`** on **`.frontdoor-shell__side-panel--start`** in `default.vue` when expanded — on the **scrollport panel**, not the grid track, so the border does not stack beside the scrollbar gutter. Section group dividers in **`ShellSidePanelNav`** use the same token. When **`.frontdoor-shell--nav-collapsed`**, **`border-inline-end-width: 0`** on the panel (scoped rule in `default.vue`). Border width transitions on expand with the drawer (`--transition-duration-medium`). This **supersedes** the earlier `#F3F3F3` panel background exploration. The legacy token `--fd-layout-start-panel-background-color` remains in `page-grid.css` but is **not consumed** — retained only if design reverts to a filled panel. See `DESIGN_REQUIREMENTS.md` → Start column chrome.

**Codex exception — `CdxMenuItem` outside `CdxMenu`.** `ShellSidePanelNav` renders `CdxMenuItem` **outside** a floating `CdxMenu`. Codex documents menu items as menu-only; this is an intentional shell-chrome exception approved for the side panel (static list, not a dropdown), for the collapsed overlay primary list in **`ShellCollapsedNavMenuOverlay`**, and for **`ExplorerModuleRail`** endpoint rows. Optional prop **`omitSectionTitleMatching`** suppresses a section heading when the collapsed overlay back control already shows that label. See `DESIGN_REQUIREMENTS.md` → Start column section navigation and Module rail.

**Codex exception — section nav hover colour.** Non-selected menu items use custom CSS (`:hover`) to set label text to **`--color-progressive`**. Codex `CdxMenuItem` hover normally only changes **background** (`--background-color-interactive-subtle--hover`); it does not turn unselected item text progressive. Additionally, when used outside `CdxMenu`, the `highlighted` prop is never toggled (the parent menu normally handles `@change` events), so shell styles must use **`:hover`**, not `.cdx-menu-item--highlighted`. Selected items keep Codex’s built-in `--color-progressive` via `cdx-menu-item--selected`. Implemented in `ShellSidePanelNav.vue`.

**Superseded component.** `app/components/explorer/ExplorerSideNav.vue` is retained as a reference but **not mounted**; explorer sections are rendered through **`ShellSidePanelNav`** with routes and active state resolved in **`usePageSectionNav()`** (`pathForExplorerMode`, `explorerModeFromPath`, `enabled` filtering).

**Primary navigation.** `ShellPrimaryNav` uses Codex quiet tabs for route switching. Tab panels are hidden (`display: none` on `.cdx-tabs__content`) because page content lives in the main column — navigation-only usage, documented in `DESIGN_REQUIREMENTS.md`.

**Fixed width.** The start **drawer panel** uses `--fd-layout-start-panel-inline-size` (**281px** = Figma side panel **241px** + one Codex desktop grid column **40px**) from `page-grid.css`. The **grid track** uses **`min-inline-size: 0`** so its inline size is controlled by `grid-template-columns` (0 or 281px) — not a fixed min on the cell. This is a **prototype deviation** from the Figma side-panel width.

### Responsive navigation collapse and start drawer

When the primary nav row (quiet tabs + API Explorer link) does not fit, **`useShellNavigationCollapse`** sets **`.frontdoor-shell--nav-collapsed`** on the shell root.

**Measurement.** `ResizeObserver` on `.frontdoor-shell__primary-nav-row` and `.frontdoor-shell__primary-nav-expanded__content` (intrinsic `max-content` width). Hysteresis in `config/shellNavigation.ts`:

| Transition | Rule |
|------------|------|
| **Collapse** (expanded → collapsed) | `scrollWidth + 24px > clientWidth` |
| **Expand** (collapsed → expanded) | `scrollWidth + 48px ≤ clientWidth` |

**Collapsed (instant).** `ShellCollapsedNavigation` replaces visible quiet tabs (expanded row kept in DOM, `visibility: hidden`, for measurement). Start grid track → **`grid-template-columns: 0 minmax(0, 1fr)`**, **`column-gap: 0`**. Start panel **`border-inline-end-width: 0`**. Brand loses **`--spacing-75`** inline-start padding (aligns with hamburger row). Section nav panel: **`inert`** + **`aria-hidden`**.

**Expanded (drawer on widen).** `app/assets/css/shell-start-nav-reveal.css` animates the element with class **`shell-side-panel--start`** (must be present on the start panel wrapper in `default.vue`):

1. **Grid track** grows `0` → `281px` + gutter restored — **pushes** `.fd-page-grid__body`.
2. **Fixed-width panel** (281px) slides in from inline-start inside the clipping track (`transform: translate3d(±100%, 0, 0)` → `0`; RTL mirrored).
3. **Border** width `0` → `1px` on **`.frontdoor-shell__side-panel--start`** (scrollport panel, not the grid track).

Codex **transition** tokens: `--transition-duration-medium` (250ms), `--transition-timing-function-user` (`ease-out`). `prefers-reduced-motion: reduce` disables transitions. Collapse does **not** animate.

**Drawer vs scroll (do not conflate).** Drawer animation requires a **clipping track** and fixed **281px** panel width, but must not disable the section-nav **scrollport**. Rules:

| Viewport | Scroll container | Drawer clip |
|----------|----------------|-------------|
| **Tablet+** | `.frontdoor-shell__side-panel--start` (`overflow-block: auto`, `flex-shrink: 1`, `min-block-size: 0`) | `.fd-page-grid__start` (`overflow: hidden`); panel `transform` slide |
| **Mobile** | `.fd-page-grid__start` (`overflow-y: auto`, `max-block-size: 40dvh`) | `overflow-inline: hidden` when expanded; `overflow: hidden` when collapsed |

**Collapsed overlay (click).** When collapsed, the hamburger toggles **`ShellCollapsedNavMenuOverlay`** (`useShellCollapsedNavMenu`) — teleported to `<body>`, **`z-index: 20`** (above `.frontdoor-shell__chrome-band` at **10**). Full-viewport **`--background-color-backdrop-light`** mask; start-side panel at **`--fd-layout-start-panel-inline-size` (281px)** with **`border-inline-end`** (`--border-color-muted`), **`padding-block-start: --spacing-100`**, **`::after` scroll-end spacer (`--spacing-200`)** on the panel scrollport (symmetric with in-shell start nav). **Section view (default when sections exist):** quiet small back `CdxButton` with **`cdxIconPrevious`** (`flip-for-rtl`) showing the active primary section label; **`gap: var(--spacing-50)`** between back control and first menu item; **`ShellSidePanelNav`** reuses start-column links with **`omitSectionTitleMatching`** so the primary section heading is not duplicated. **Primary view:** flat `CdxMenuItem` list (main tabs + API Explorer) — same **Codex exception** as `ShellSidePanelNav`. Selection calls `navigateTo()` from `default.vue` then closes the overlay. **Dismiss:** backdrop click, Escape, route change, or nav expand. Document scroll lock: `html.shell-collapsed-nav-menu-open` in `shell-collapsed-nav-menu.css`. Figma [25:1929](https://www.figma.com/design/zaMJ5QqulosJKuoHE2gCKK/Off-wiki-page-templates?node-id=25-1929).

**Source:** `app/composables/useShellCollapsedNavMenu.ts`, `app/composables/useShellNavigationCollapse.ts`, `app/composables/useShellNavigationBreadcrumbs.ts`, `app/components/shared/ShellCollapsedNavigation.vue`, `app/components/shared/ShellCollapsedNavMenuOverlay.vue`, `app/assets/css/shell-collapsed-nav-menu.css`, `app/assets/css/shell-start-nav-reveal.css`, `config/shellNavigation.ts`, `app/layouts/default.vue`, `i18n/*` (`shell-collapsed-nav-menu-*`).

---

## End column module rail (API Explorer)

On desktop, the grid **end column** (`#explorer-end-panel` in `app/layouts/default.vue`) hosts the community **module rail** when instance bootstrap succeeds. Enterprise modes hide the rail and leave the end column reserved-empty.

**Data and selection.**

```
REST API module select (CdxSelect) → selectedModuleName
       ↓
useExplorerOptInFilteredModules → visibleSelectedModule
       ↓
ExplorerModuleRail (teleported via useExplorerModuleRailPlacement)
       ↓  ≥ 1120px → #explorer-end-panel  |  < 1120px → #explorer-module-rail-anchor (below project controls)
       ↓
@endpoint-click → selectModule(moduleName, { source: 'endpoint-item', operationTarget })
       ↓
selectedEndpointOperationId → ExplorerModuleRail :selected on matching CdxMenuItem
```

The rail lists **endpoints for `visibleSelectedModule` only** — not every discovered module. Module selection for Scalar is driven by the REST API module select; the rail is an endpoint browser for the active module. Spec URLs are never constructed in the rail; bootstrap already resolved them from discovery.

**Component boundary.** `ExplorerModuleRail.vue` is presentational: it receives `selectedModule`, `selectedEndpointOperationId`, and emits `endpoint-click`. The explorer page owns bootstrap state, opt-in filtering, and `useExplorerScalarFocus`. Endpoint labels, accessible names, and operation-id resolution come from `app/utils/explorerEndpointLabels.ts` (`resolveEndpointOperationId()` bridges endpoint clicks to bootstrap `selectedEndpointOperationId`). Inline scrollport capping (`useExplorerModuleRailInlineEndpointScrollCap`) runs inside the rail component because it measures internal scrollport and endpoint-list DOM refs.

**Rendering.**

- Surfaces: **`ExplorerProjectControls`** and **`ExplorerModuleRail`** share **`--fd-explorer-controls-surface-background-color`** (`var(--background-color-neutral-subtle)`) and **`--fd-explorer-controls-surface-border-radius`** (4px) from `page-grid.css` / `config/explorerSurfaces.ts`.
- Heading: selected module **`headingTitle`** in `<bdi>` at **`--font-size-medium`** (no beta/version chips in the rail header).
- Endpoint rows: **`CdxMenuItem`** outside `CdxMenu` — same Codex shell exception as **`ShellSidePanelNav`**. Default slot renders HTTP method (`dir="ltr"`, method colours) + path (`<bdi>`); `:label` supplies the accessible name; **`:selected`** binds to **`selectedEndpointOperationId`**. Non-selected **path** hover uses **`--color-progressive`**; HTTP method tags **keep semantic colours** on hover and when selected. Selected rows override Codex **`progressive-subtle`** background to **transparent** (path colour only).
- Scroll divider: when **`.explorer-module-rail__endpoint-scrollport`** has `scrollTop > 0`, a sticky **`.explorer-module-rail__scroll-divider`** (real DOM element, not `::before`) pins a **`--border-color-subtle`** line at the scrollport top; end-column insets with **`margin-inline: var(--spacing-75)`**, inline layout via rail **`padding-inline: var(--spacing-50)`**.
- Method + path layout: inline flow — method `white-space: nowrap`; path follows on the same line and wraps only when needed.

**Layout and scroll (wide viewports, ≥ 1120px).**

```
useEndPanelNavAlign(
  scalarShellRef,           // align anchor (top edge)
  explorerEndPanelElement,  // #explorer-end-panel mount
  scalarShellRef,           // sticky inset scroll clamp
  scalarShellRef            // height cap → --frontdoor-end-panel-nav-max-block-size
)
```

- Classes: **`frontdoor-end-panel-nav`** + **`explorer-module-rail`** (`app/assets/css/shell-end-panel-nav.css`).
- Rail **block size follows content**; **`max-block-size`** is capped to **`.explorer-page__scalar-shell`** measured height.
- When endpoints exceed the cap, **`.explorer-module-rail__endpoint-scrollport`** scrolls internally; the module heading stays visible.
- Scrollbar: thin thumb + transparent track (Firefox `scrollbar-width` / `scrollbar-color`; WebKit pseudo-elements — physical **`width: 6px`** exception, documented alongside start nav in **Shell scroll regions**).

**Layout and scroll (narrow viewports, < 1120px).** The end column is hidden (`display: none` on `.frontdoor-shell__side-panel--end`). The rail **teleports** to `#explorer-module-rail-anchor` in the main column, **16px** (`--spacing-100`) below project controls. It renders as a **collapsible** panel (module heading + expand/collapse control; endpoint list hidden until expanded). See `useExplorerModuleRailPlacement()` and Figma [477:4968](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=477-4968).

- **≤ `EXPLORER_MODULE_RAIL_INLINE_MAX_VISIBLE_ENDPOINTS` (7) endpoints:** expanded panel block size follows content; no scrollport cap.
- **> 7 endpoints:** `useExplorerModuleRailInlineEndpointScrollCap` measures the block size spanning the first seven **`CdxMenuItem`** rows and sets **`--explorer-module-rail-inline-endpoint-scroll-max-block-size`** on **`.explorer-module-rail__endpoint-scrollport`** (class **`explorer-module-rail__endpoint-scrollport--inline-capped`**). Additional endpoints scroll inside the scrollport with the same thin scrollbar as the wide layout.
- Row cap constant: **`config/explorerModuleRail.ts`**. Remeasures on expand/collapse, module change, resize, and endpoint-list `ResizeObserver` updates.

**Teleport mounting.** Inline layout targets **`#explorer-module-rail-anchor`** in `app/pages/explorer/[[view]].vue`. Vue `<Teleport>` resolves its target when the rail first mounts; if the anchor is absent, the rail is not rendered and Vue logs a target warning. The anchor therefore stays in the DOM whenever **`isCommunityMode`** is true; only **`ExplorerProjectControls`** is gated on **`!isInstanceBootstrapping`**. Resizing across the 1120px breakpoint remounts the rail via **`:key="layoutMode"`** and masks the issue on desktop → tablet transitions; a missing anchor on first paint at tablet widths was the original failure mode.

**UI reference.** `DESIGN_REQUIREMENTS.md` → Module rail. Operation focus flow: **Module rail → Scalar operation focus** below.

---

## Shell layout and chrome

The default layout (`app/layouts/default.vue`) mounts the application shell inside `PageGrid` (`app/components/shared/PageGrid.vue`). Layout tokens and breakpoint rules live in `app/assets/css/page-grid.css`. Visual and interaction decisions are recorded in `DESIGN_REQUIREMENTS.md` → Shell chrome.

### Grid structure

```
.frontdoor-shell
├── .frontdoor-shell__chrome-band     ← full viewport width (background + `--border-color-muted` bottom border)
│   └── .frontdoor-shell__chrome-inner   ← full width; same inline-start inset as PageGrid
│       └── .frontdoor-shell__chrome     ← utility row + primary nav (+ API Explorer link)
└── .frontdoor-shell__page-grid (PageGrid)
    ├── .fd-page-grid__start        ← start panel always mounted; 281px track when expanded, 0 when collapsed; clips drawer
    │       └── .frontdoor-shell__side-panel--start  ← scrollport (tablet+); inline-end border; ::after scroll-end spacer
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
| **Start column** | `.frontdoor-shell__side-panel--start` (tablet+) or `.fd-page-grid__start` (mobile stacked) | When section nav content exceeds visible body height; **`::after` scroll-end spacer (`--spacing-200`)** on the scrollport; **one scrollport only** (`shell-start-nav-scroll.css`) |
| **Main column** | `.frontdoor-shell__body-scroll` (viewport-bleed inline-end) | Scrollbar at **viewport inline-end**; main + end content width locked at desktop wide |

**Start nav scrollbar:** **`shell-start-nav-scroll.css`** — transparent track + thin thumb (`--color-placeholder`) on the start scrollport only. Prevents a permanent gutter stacking beside the panel **`border-inline-end`**. WebKit scrollbar pseudos use physical `width` (API exception). Body band scrollport keeps browser-default styling.

**Mechanism:** Chrome band is **`flex-shrink: 0`**. Page grid is **`flex: 1; min-block-size: 0`**. Column tracks use **`min-block-size: 0; overflow: hidden`** on the grid cell; inner scrollports use **`overflow-y: auto`** / **`overflow-block: auto`** and **`overscroll-behavior: contain`**. The start drawer panel must **`flex-shrink: 1`** inside the flex-column track so `overflow-block: auto` can form a scrollport (see **Responsive navigation collapse and start drawer**). Sticky explorer panels and end-column nav max-heights use **`--fd-layout-shell-body-block-size-estimate`** (`100dvh` minus a chrome height estimate in `page-grid.css`).

**Source:** `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `app/assets/css/shell-start-nav-scroll.css`, `app/assets/css/main.css`, `app/components/shared/ShellCollapsedNavMenuOverlay.vue` (overlay scroll-end spacer).

**Rendering.** The layout calls composables for navigation state only (`usePrimaryNavigationTab`, `usePageSectionNav`, `useContentSearch`, etc.). Components in the start column and header receive resolved props — they do not fetch data or read route config directly.

### Header chrome placement

The header lives **outside** `PageGrid` in a **full-bleed band** (`.frontdoor-shell__chrome-band`: `inline-size: 100vw`, centred breakout via `margin-inline-start: calc(50% - 50vw)`, **`border-block-end: 1px solid var(--border-color-muted)`**). Inner content (`.frontdoor-shell__chrome-inner`) uses **symmetric** `--fd-layout-page-margin-inline-start` on both inline edges (matches `PageGrid` inline-start inset; body band below still bleeds inline-end via `.frontdoor-shell__body-scroll`).

**Inline-start alignment (Figma [Navigation 225:4548](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=225-4548)):** At tablet+, `.frontdoor-shell__chrome` uses the **same grid columns** as `PageGrid` (`281px` start + fluid body, shared gutter). Brand sits in the start column with **`--spacing-75`** inline-start padding when expanded; padding is **removed** when `.frontdoor-shell--nav-collapsed` so the logo aligns with the collapsed hamburger row. Primary nav / collapsed breadcrumbs span **both columns** (`grid-column: 1 / -1`) **without** that inset. Utility actions sit in the body column with **`justify-content: flex-end`**. Start-column collapse and drawer expand — see **Responsive navigation collapse and start drawer** above.

The **start column** holds section navigation **below** the header band only. At desktop, main and end share the content row; the footer is inside the main column (`frontdoor-shell__content`).

**Mobile (&lt; 640px):** Stacked interim layout — start panel (always mounted; nav when sections exist; **max 40dvh** + scroll if long), then **body scrollport** (main + footer). Header and start panel use **`--spacing-100` (16px)** inline padding to match mobile page margins. On short pages, **`.frontdoor-shell__content`** uses **`min-block-size: 100%`** inside the body scrollport so the footer band sits on the shell bottom with **32px** inner inset (see **Site footer**). Primary nav + start column also collapse when the nav row is too narrow (same `useShellNavigationCollapse` flag); mobile drawer uses block-size + vertical slide in `shell-start-nav-reveal.css`.

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
| `--fd-layout-page-margin-inline-start` | `--fd-layout-page-margin` / grows at ≥ 1680px | Shared inset: `.frontdoor-shell__chrome-inner` (both edges), `.fd-page-grid` (inline-start) |
| `--fd-layout-page-margin` | `--spacing-100` / `--spacing-150` / `--spacing-200` by breakpoint | Inline-end inset: `.frontdoor-shell__body-scroll` only |
| `--fd-layout-grid-gutter` | `--spacing-100` (mobile) / `--spacing-150` (tablet+) | Gaps between grid columns |
| `--fd-layout-grid-max-inline-size` | Codex `--max-width-breakpoint-desktop` (1679px) | Whole grid cap at ≥ 1680px |
| `--fd-layout-chrome-lock-viewport-inline-size` | 1440px (90rem) | Header width lock reference (**not Codex**) |
| `--fd-layout-grid-content-max-inline-size` | `calc(1440px lock − 2×desktop margin)` | Header inner `max-inline-size` at ≥ 1440px |
| `--fd-layout-chrome-max-inline-size` | `calc(lock − 2×desktop margin − start panel)` | Legacy content-band width (main + end only); superseded by full-bleed header |
| `--fd-layout-shell-chrome-block-size-estimate` | `11rem` | Chrome height estimate for sticky panel max-heights |
| `--fd-layout-shell-body-block-size-estimate` | `calc(100dvh − chrome estimate)` | Visible shell body below chrome band |
| `--fd-header-search-input-min-inline-size` | `16rem` (256px) | Search field minimum when utility row is expanded |
| `--fd-explorer-controls-surface-background-color` | `var(--background-color-neutral-subtle)` (`config/explorerSurfaces.ts`) | Explorer project controls + module rail background (theme-aware) |
| `--fd-explorer-controls-surface-border-radius` | `4px` (`config/explorerSurfaces.ts`) | Explorer project controls + module rail corner radius (exploratory; Codex `--border-radius-base` is 2px) |
| `HEADER_UTILITY_COLLAPSE_THRESHOLD_PX` | `576px` (`config/headerChrome.ts`) | `ResizeObserver` threshold for compact utility row |
| `--fd-layout-body-columns-max-inline-size` | `calc(1679px cap − margins − start − gutter)` | Main:end sub-grid max width at ≥ 1680px (expanded start nav) |
| `--fd-layout-body-columns-collapsed-max-inline-size` | `calc(1679px cap − margins)` | Main:end sub-grid max width at ≥ 1680px when start nav collapsed |

**Page grid slots:** `PageGrid` exposes **`start`** and default **`body`** slots only (no `end` or `footer` grid tracks). The end panel and site footer are composed inside the **body** slot in `default.vue` (`.frontdoor-shell__body-scroll` → `.frontdoor-shell__body-columns`).

Media queries in `page-grid.css` and `default.vue` use **px literals** aligned to Codex tokens (`640px`, `1120px`, `1680px`) plus the project **`1440px`** chrome lock, because custom properties are unreliable inside `@media` conditions in many browsers.

### Shell chrome components

| Component | Role | Config / composable |
|-----------|------|---------------------|
| `ShellHeaderUtilityActions.vue` | Utility row (search, settings, language, Log in or username→`/account`; responsive collapse) | `useShellAuthNavigation`, `useShellHeaderUtilityMenu`, `useContentSearch`, `config/headerChrome.ts` |
| `ShellHeaderBrand.vue` | Header brand (32px mark + two-line banana wordmark in Montserrat); links to Get started | `useMainNavigationLinks()`, `config/brandTypography.ts` |
| `ShellSidePanelNav.vue` | Flat section menu in start column (mounted when sections exist) | `usePageSectionNav()` (`to`, `isActive`); `navigateTo` on click when `to` set; optional `omitSectionTitleMatching` in collapsed overlay |
| `ShellSiteFooter.vue` | Static site footer (main column band) | `config/siteFooter.ts` |
| `ShellCollapsedNavigation.vue` | Collapsed header nav (hamburger + breadcrumbs) | `useShellNavigationBreadcrumbs()`; emits menu toggle; `aria-expanded` when overlay open |
| `ShellCollapsedNavMenuOverlay.vue` | Full-screen collapsed nav overlay (section + primary views) | Props + events from `default.vue`; `ShellSidePanelNav`; `useShellCollapsedNavMenu` state |
| `ShellPrimaryNav.vue` | Codex quiet tabs for primary nav | `usePrimaryNavigationTab()`, `useMainNavigationLinks()` |

**API Explorer header link.** Not a tab. `default.vue` renders a `NuxtLink` to `API_EXPLORER_NAVIGATION_PATH` (`/explorer` from `config/mainNavigation.ts`) **immediately after** the quiet tab list in `.frontdoor-shell__primary-nav-row`. Tabs use **`flex: 0 1 auto`** (intrinsic width) so the link follows the last tab, not the inline-end of the row. **`gap: var(--spacing-150)` (24px)** between the last tab and the link. Uses `cdxIconArrowNext` (`--color-progressive` on the icon). Active state when `isExplorerRoutePath()`; no primary tab is selected on explorer routes (`getMainNavigationIdFromPath` returns `null`).

### Codex exceptions (shell chrome)

1. **`ShellSidePanelNav`** — renders `CdxMenuItem` **outside** a floating `CdxMenu`. Codex documents menu items as menu-only; approved for this static side-panel list, for the collapsed overlay primary list in **`ShellCollapsedNavMenuOverlay`**, and for **`ExplorerModuleRail`** endpoint rows (default slot for method + path; `:label` for accessible name). **Additional override (start nav):** non-selected items use custom `:hover` CSS for **`--color-progressive`** text (see **Shell section navigation** — hover colour). **Module rail differs:** only the **path** turns progressive on hover; HTTP method tags keep semantic colours; selected endpoint rows use **`:selected`** with progressive path and **transparent** background (no Codex progressive-subtle fill). **Not** used for explorer **`CdxSelect`** / **`CdxCombobox`** menus — those use Codex’s internal `CdxMenu` and must keep native hover / highlighted / selected behaviour (see **REST API module select** → Codex interaction). Optional prop **`omitSectionTitleMatching`** suppresses a section heading when the collapsed overlay back control already shows that label. **Navigation:** explorer mode items navigate via **`navigateTo(item.to)`** where `to` is resolved in **`usePageSectionNav()`** — the component does not construct URLs.
2. **`ShellPrimaryNav`** — `CdxTabs` **navigation-only** (tab panels hidden via CSS); route changes via `navigateTo()` on `navigation-select`. Quiet-tabs **header bottom border suppressed** via `shell-primary-nav-overrides.css` (re-imported after dynamic `codex.style-rtl.css` load) — `.frontdoor-shell__chrome-band` owns the single header edge (`border-block-end: 1px solid var(--border-color-muted)`) per Figma. **Tab scroll buttons** (`.cdx-tabs__prev-scroller` / `.cdx-tabs__next-scroller`) are **hidden** in the same file — Codex shows them on overflow and they **flicker on first paint** before intersection observers settle; shell chrome will use a separate responsive approach. **Tab label weight:** all labels **`--font-weight-normal`** — Codex sets **700** on every quiet-tab label by default; selected state uses colour/underline only.
3. **Start column edge** — **`border-inline-end`** with `--border-color-muted` on **`.frontdoor-shell__side-panel--start`** when expanded (scrollport panel, not grid track); section dividers in **`ShellSidePanelNav`** use the same token; **`border-inline-end-width: 0`** when collapsed. **Not** the earlier `#F3F3F3` exploratory surface (token retained but unused). See `DESIGN_REQUIREMENTS.md` → Start column chrome.
4. **Start column width** — **281px** drawer panel (Figma 241px + one Codex 40px grid column); grid track width is **0 or 281px** via collapse. **Deviation from Figma** side-panel spec; prototype widening only.
5. **Start nav scrollbar (WebKit physical `width`)** — **`shell-start-nav-scroll.css`** styles `::-webkit-scrollbar` with physical **`width`** because the pseudo-element API has no logical equivalent. **Single scrollport per breakpoint** (panel tablet+, grid track mobile). Transparent track + thin thumb; body band keeps browser-default scrollbars. **Scroll-end inset:** **`::after` block spacer** (`--spacing-200`) on each scrollport — see **Shell section navigation** (scroll-end inset). See **Shell scroll regions**.
6. **`ShellHeaderBrand` wordmark** — **Montserrat** via `--font-family-brand-wordmark` (Google Fonts, `config/brandTypography.ts`); banana-i18n `brand-wordmark-wikimedia` + **`brand-wordmark-developer-portal`** (translatable). Mark: `developer-portal-logo-mark.svg`.
7. **Search field** — `CdxSearchInput` in `ShellHeaderUtilityActions` (`flex: 1 1 auto`, max **40rem**, **256px** min when expanded). `useHeaderUtilityCollapse` (`ResizeObserver` on the utility track) switches to compact mode below `HEADER_UTILITY_COLLAPSE_THRESHOLD_PX` (`config/headerChrome.ts`): search icon, compact language select (icon + code), and `CdxMenuButton` for settings/log in. Collapsed search activation is **deferred**.
8. **Interface language `CdxSelect`** — menu items omit per-item `icon` props (text-only dropdown). The closed select shows **`cdxIconLanguage`** via the Codex **`#label` scoped slot**, not `defaultIcon` (which Codex only applies when no selection is made). **`default-label`** and the `#label` slot both bind the active locale name from banana-i18n (`interface-language-{code}`) — never the placeholder string. Menu labels use **`isolateLabel()`** (Unicode FSI/PDI) because option-like rendering targets cannot include `<bdi>` tags — see `AGENTS.md` BiDi isolation rule. **`:key="direction"`** remounts the control when interface direction changes (pairs with RTL stylesheet toggle in `codex-rtl-styles.client.ts`). **RTL expand chevron:** known open issue when dual Codex stylesheets are active — see **RTL and BiDi** below; do not override Codex select internals.
9. **`ShellSiteFooter` wordmark** — **Montserrat** via `--font-family-brand-wordmark`; banana-i18n `brand-wordmark-wikimedia` + **`brand-wordmark-developer-portal`** (shared with header, single horizontal line).
10. **`ShellSiteFooter` brand lockup** — Figma uses a horizontal **227×14px** lockup; shell composes **14px `developer-portal-logo-mark.svg` + translatable wordmark parts** until the footer logo asset ships.

### Interface locale picker (shell)

The header **`CdxSelect`** in `app/layouts/default.vue` switches the banana-i18n interface locale (`$setInterfaceLocale`, Vue I18n `locale`). Supported values: `en`, `es`, `fr`, `he`, `fa` (prototype subset).

**Display pattern (Figma header):**

| Surface | Icon | Label |
|---------|------|-------|
| Closed select (trigger) | Yes — `cdxIconLanguage` via `#label` slot | Active locale name from banana-i18n (`interface-language-{code}`); never the placeholder string |
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

**Short-page pin:** On viewports shorter than the content, the footer band’s **bottom edge** aligns with the shell bottom and legal copy sits **32px** above that edge (`padding-block-end: --spacing-200`). Mechanism: **`.frontdoor-shell__body-scroll`** is the body-band scrollport; **`.frontdoor-shell__content`** is a **column flex** container with **`min-block-size: 100%`**; `.frontdoor-shell__main` uses **`flex: 1 1 auto`**. When content is short, no scrollbar appears and flex growth pins the footer. When content is long, the body scrollport shows a browser default scrollbar at the **inline-end** edge of the main + end band. No separate footer grid row and **no margin** below the footer element.

**Legal copy:** Three banana-i18n sentences (one per line) with an inline CC BY-SA link on the middle line. Brand wordmark and legal body use **`--color-subtle`**; policy and license links use **`--color-progressive`**.

**Figma deviation (width):** Figma [Navigation 354:33034](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=354-33034) places the footer at **x=241**, **width=1199** (main + end). Implementation keeps the footer **main-column width only** — it does not span the end panel.

**Codex exceptions:** Footer brand uses **Montserrat** via `--font-family-brand-wordmark` (same as header). Footer lockup is **14px mark SVG + composed banana wordmark**, not the Figma **227×14px** horizontal lockup asset (not yet in `public/images/`).

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
| Start column edge | Transparent panel + `border-inline-end` on scrollport (`--border-color-muted`); section dividers match; legacy `#F3F3F3` background token unused |
| Start nav scrollbar | `shell-start-nav-scroll.css` — single scrollport per breakpoint; transparent track + thin thumb |
| Start column width | **281px** (Figma 241px + 40px grid column) — prototype deviation |
| Section nav hover | Custom `:hover` progressive text on non-selected `CdxMenuItem` — Codex exception (see above) |
| Site footer | `ShellSiteFooter` inside `frontdoor-shell__content`; **main column width only** (Figma deviation — does not span end panel); **32px** bottom inset (`padding-block-end: --spacing-200`; matches start nav / overlay **`::after` scroll-end spacers**); short-page pin via content flex column inside body scrollport |
| Shell column scroll | `body { overflow: hidden }`; independent scroll on `.frontdoor-shell__side-panel--start` (tablet+) and `.fd-page-grid__start` (mobile) + `.frontdoor-shell__body-scroll`; drawer panel `flex-shrink: 1` (Discord-style docs reference) |
| Primary nav tab scroll buttons | **Hidden** in `shell-primary-nav-overrides.css` — Codex overflow affordances flicker on first paint |
| Primary nav tab label weight | **Normal** for all tabs — Codex exception; selected tab uses colour/underline only |
| Footer brand lockup | 14px mark + translatable `brand-wordmark-*` (Montserrat) — not Figma horizontal footer logo asset yet |
| Section nav links | Content routes: `href="#"` placeholders; active state from prototype map. Explorer mode items: real routes via `pathForExplorerMode()` in `usePageSectionNav.ts` |
| Search icon button (narrow header) | **Disabled** prototype |
| Settings button | **Disabled** prototype |
| Log in link | **Non-functional** (`@click.prevent`) |
| Brand logo SVG | **32px `developer-portal-logo-mark.svg` + banana wordmark** (Montserrat); not single-path lockup |
| Primary nav + start column collapse | **Implemented** — `useShellNavigationCollapse`; hamburger + breadcrumbs; start drawer on expand (`shell-start-nav-reveal.css`) |
| Collapsed hamburger menu overlay | **Implemented** — `useShellCollapsedNavMenu`; `ShellCollapsedNavMenuOverlay`; backdrop-light; `cdxIconPrevious` back; `omitSectionTitleMatching`; **`::after` scroll-end spacer (`--spacing-200`)**; `shell-collapsed-nav-menu.css` scroll lock |
| Header container-query search collapse | **Implemented** | `ShellHeaderUtilityActions` — 256px search min; `CdxMenuButton` for settings/language/log in |
| Collapsed search button activation | **Deferred** | Icon visible; overlay/expansion behaviour not defined |
| Header vs body width at ≥ 1440px | Inner header locks to grid content width at 1440px; page grid caps at 1680px — **may need alignment** |
| Codex RTL stylesheet toggle | **`link.disabled`** on injected `codex.style-rtl.css` — prototype workaround for locale switching without reload; revisit if Codex exposes direction-aware components |
| Header language `CdxSelect` expand chevron (RTL) | **Open** — dual LTR + RTL Codex sheets hide `.cdx-select-vue__indicator`; see **RTL and BiDi** → known open issue |

Functional in prototype: interface language `CdxSelect`, content search (`useContentSearch` + `SharedSearchResults`), primary nav tab routing, **explorer start-column mode links** (`usePageSectionNav` + `ShellSidePanelNav`).

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

The Vue component is mounted in `app/pages/explorer/[[view]].vue` inside a **`<ClientOnly>`** wrapper (required by `AGENTS.md`). The implementation uses `ExplorerScalarReference.client.vue`, which imports `@scalar/api-reference` and is only ever rendered on the client-only `/explorer` route (`ssr: false`). Optional path segment selects **enterprise mode** (`/explorer/enterprise`, `/explorer/enterprise-limited`, `/explorer/enterprise-custom`) — see **Explorer modes and start-column routing** below.

### Project and language picker

Community explorer bootstrap is keyed by a **wiki instance id** (`enwiki`, `eswiki`, …). The shell exposes two comboboxes (project + language) that resolve to that id — the page does not store project and language as separate bootstrap parameters.

```
User selects: Project (Wikipedia | Commons | Wikidata) + Language (en | es | he | fa)
       ↓
useExplorerProjectLanguagePicker(selectedWikiInstanceId)
       ↓
config/explorerProjectPicker.ts → resolveExplorerWikiInstanceId(projectId, languageCode)
  ├── wikipedia + en|es|he|fa → enwiki | eswiki | hewiki | fawiki
  ├── commons → commonswiki (language combobox disabled)
  └── wikidata → wikidata (language combobox disabled)
       ↓
selectedWikiInstanceId updated → useExplorerBootstrap(instance) re-runs
       ↓
config/instances.ts → baseUrl, dir for shell direction and discovery fetch
```

Picker labels are banana-i18n interface strings (`explorer-project-*`, `explorer-project-language-*`). Combobox `selected` values match translated labels; menu items pass through `isolatePickerLabel()` for BiDi. Reverse sync: `parseExplorerWikiInstanceSelection(wikiInstanceId)` restores combobox state when instance id changes externally.

### REST API module select

Community explorer **module selection** (which OpenAPI spec Scalar loads) is driven by a **`CdxSelect`** in project controls. Options come from **`visibleModules`** — bootstrap modules in discovery order after **`filterExplorerBootstrapModulesByOptIn()`**.

```
User selects: REST API module (CdxSelect in ExplorerProjectControls)
       ↓
useExplorerModuleSelect(visibleModules, selectedModuleName, selectModule, …)
       ↓
useExplorerBootstrap.selectModule(moduleName, { source: 'module-select' })
       ↓
visibleOpenApiSpecUrl → useScalarConfig → Scalar reload (when module name changes)
```

**Default module:** On bootstrap and when opt-in hides the current module, **`resolveFirstExplorerRailModule()`** (`app/utils/explorerModuleOptInFilter.ts`) picks the first module **without `hasSpecError`** in discovery order, using **`DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS`** from `config/explorerOptIn.ts` on initial load. This keeps the select default and Scalar spec aligned.

Select menu labels use each module’s **`headingTitle`** (external string) via `isolatePickerLabel()`. Stored value is the discovery **module name** (for example `-`, `readinglists/v0`, `attribution/v0-beta`).

**Menu item description:** Summary in Codex MenuItem **`description`**. Extracted from each module spec’s OpenAPI **`info.description`** during bootstrap (`normalizeOpenApiModuleDescription(moduleDescription, moduleName)` in `app/utils/explorerModuleDescription.ts`); not truncated — long text wraps in the dropdown. Configured **suffix strip patterns** in `config/explorerModuleDescriptions.ts` (`EXPLORER_MODULE_DESCRIPTION_OPENAPI_SUFFIX_STRIP_PATTERNS`, for example `site/v1` access boilerplate and `attribution/v0-beta` docs / framework links) run after markdown normalization. Curated banana-i18n fallbacks in the same config file when the spec omits a description. Display strings use `isolatePickerLabel()` for BiDi isolation.

**Project controls row 2 spacing:** REST API module **`CdxSelect`** and Opt-in fieldset sit in **`.explorer-project-controls__module-row`** with **`column-gap: var(--spacing-150)`** (24px) and **`row-gap: var(--spacing-100)`** when wrapped. See `DESIGN_REQUIREMENTS.md` → REST API module select + opt-in.

**Menu item supporting text:** Each option may include Codex MenuItem **`supportingText`** — beta and version metadata formatted by **`formatExplorerModuleSelectSupportingText()`** in `app/utils/explorerModuleRailHeading.ts`. Beta uses banana-i18n `explorer-module-beta-chip-label`; version uses isolated `versionChipLabel` (external). Omitted when neither applies.

**Codex Select configuration:** **`default-label`** from banana-i18n `explorer-module-placeholder`. **`menu-config`**: `{ boldLabel: true, hideDescriptionOverflow: false }` — descriptions wrap to multiple lines in the dropdown ([Codex Select demos](https://doc.wikimedia.org/codex/latest/components/demos/select.html)). Menu item state (hover background, keyboard **`highlighted`**, **`selected`** progressive text) is owned by Codex; **`app/assets/css/main.css`** may only adjust floating-menu **z-index** and list-style resets under `.explorer-page` — **do not** override `.cdx-menu-item__content` or highlighted/selected colours (regression fixed after descriptions landed).

The end-column **module rail** lists endpoints for **`visibleSelectedModule`** only; endpoint clicks call `selectModule` with optional operation focus.

### Spec resolution flow

```
User selects: wiki instance (project + language picker) + REST module (select or endpoint click in rail)
       ↓
useExplorerBootstrap → GET /api/explorer-bootstrap?wikiInstanceId=…
       ↓
Server: discovery → fetch each module OpenAPI spec → modules[] with specUrl, operations, headingTitle, moduleDescription
       ↓
useExplorerOptInFilteredModules → visibleModules, visibleOpenApiSpecUrl
       ↓
useScalarConfig(visibleOpenApiSpecUrl)   ← reactive Scalar configuration
       ↓
<ApiReference :configuration="scalarConfig" />
```

Per-module language-level spec fallback (`useSpecUrl` + `config/languages.js`) is reserved for a later phase; community explorer uses discovery spec URLs as returned for the selected instance.

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
scrollOperationIntoView() inside .explorer-page__scalar-shell (overflow-block: auto; overflow-inline: clip from 960px)
```

**Resolution strategy.** Scalar assigns each operation a navigation id (typically `{document}/tag/{tag}/{METHOD}{path}` or `{document}/{METHOD}{path}`). `scalarOperationNavigation.ts` mirrors that id generation (GitHub slugger for segments) and searches, in order: the workspace navigation tree exposed by `ApiReference`, sidebar items, then the DOM under the Scalar shell. Candidates are tried until an element with a matching `id` exists.

**Timing and retries.** Operations are lazy-loaded in Scalar; the target node may not exist immediately after a spec switch. `useExplorerScalarFocus` polls every 100ms for up to 5s, re-emitting `scroll-to:nav-item` and scrolling the **Scalar shell container** (not only `document`) so sticky layout, **`overflow-block: auto`**, and `overscroll-behavior: contain` behave correctly.

**Triggers.** Focus runs when:

- The user selects an endpoint (pending target set, Scalar already ready)
- Scalar finishes switching modules (`isScalarSwitching` false → true transition)
- `ApiReference` exposes `eventBus` / workspace handles (`@interface-ready` on `ExplorerScalarReference`)

**Same-module clicks.** Selecting another endpoint in the **already active** module does not reload the spec (`selectModule` skips `startScalarSwitch` when the module name is unchanged), so focus can run immediately without waiting for a spec swap.

**UI reference.** Visual layout of the rail and endpoint rows is described in `DESIGN_REQUIREMENTS.md` → Module rail. Implementation: `useEndPanelNavAlign.ts`, `app/assets/css/shell-end-panel-nav.css`, `useExplorerScalarFocus.ts`, `ExplorerModuleRail.vue`, `tests/scalarOperationNavigation.test.mjs`.

### Scalar shell overflow and resize

**`.explorer-page__scalar-shell`** (`app/pages/explorer/[[view]].vue`):

| Breakpoint | Block axis | Inline axis |
|------------|------------|-------------|
| **&lt; 960px** | `overflow-block: hidden` | `overflow-inline: clip` |
| **≥ 960px** (sticky reference panel) | `overflow-block: auto` | `overflow-inline: clip` |

**Rationale.** Scalar introduction rows and sample **`pre`** blocks use Tailwind **`w-fit`** / **`nowrap`** and can exceed the shell width after a viewport resize (especially desktop main + end columns). Horizontal bleed previously painted over the shell **`border`** on the inline-end edge. **`overflow-inline: clip`** contains that bleed while preserving a normal **`border`** on all four sides (an inset **`box-shadow`** frame was rejected — it is clipped on the block axis when the shell scrolls). Vertical scrolling stays on the block axis only.

**Codex overrides** (`app/assets/css/explorer-codex-overrides.css`): **`.scalar-app`** uses **`min-inline-size: 0`** and **`max-inline-size: 100%`**; introduction **`.introduction-card-item`** rows and sample **`pre` / `pre code`** cap width with **`overflow-inline: auto`** so wide curl snippets scroll inside the sample instead of widening the shell scrollport.

**UI reference.** `DESIGN_REQUIREMENTS.md` → Scalar shell containment.

### Explorer modes and start-column routing

Enterprise explorer experiences share the unified start column with community mode. Mode is encoded in the URL (`app/utils/explorerRoute.ts`):

| Mode | URL path | Main content |
|------|----------|--------------|
| `community` | `/explorer` | Community Scalar explorer (`useExplorerBootstrap`) |
| `enterprise-full` | `/explorer/enterprise` | Full enterprise Scalar spec (`useEnterpriseExplorer`) |
| `enterprise-limited` | `/explorer/enterprise-limited` | Limited enterprise Scalar spec |
| `enterprise-custom` | `/explorer/enterprise-custom` | Custom tag-driven viewer (`ExplorerEnterpriseCustom`, `useEnterpriseSpecOutline`) |

**Side nav:** `config/explorerSideNav.js` lists sections and items; items with a **`mode`** field are wired by **`usePageSectionNav()`** → **`ShellSidePanelNav`**. Active state and paths are derived from the route — not from `isActive` flags in config. **`ExplorerSideNav.vue`** is superseded and not mounted. **`useExplorerMode()`** exposes the reactive mode for the explorer page and breadcrumbs.

**SPA note:** Sub-routes under `/explorer/*` stay within the explorer boundary; the full-reload plugin in `explorer-route-navigation.client.ts` applies only when entering or leaving `/explorer` from content routes.

### Route boundary navigation

The explorer route uses `ssr: false`. Client-side Vue Router transitions **to or from** `/explorer` can leave Scalar DOM in the shell or prevent ApiReference from mounting. Two mitigations work together:

1. **`app/plugins/explorer-route-navigation.client.ts`** — `router.beforeEach` calls `window.location.assign()` when crossing the explorer boundary (full document navigation).
2. **`app/app.vue`** — `<NuxtPage :page-key="resolvePageKey" />` remounts the page component on every route change.

`app/utils/explorerRoute.ts` provides `isExplorerRoutePath()`, `explorerModeFromPath()`, and `pathForExplorerMode()` for the layout, explorer page (teleport disable on exit), side nav (`usePageSectionNav`), and the route-boundary plugin.

Bootstrap for the explorer starts in `useExplorerBootstrap` **`onMounted`** (after hydration), not from an immediate watcher, so `/api/explorer-bootstrap` does not hang on SPA entry.

### Opt-in module visibility

Project controls expose **Wikimedia project** (project + language comboboxes), **REST API module** (`CdxSelect`), **Beta modules and endpoints**, and **Internal modules and endpoints** checkboxes (defaults: both opt-in flags off). Bootstrap still fetches every discovery module server-side; filtering is **client-side** in `useExplorerOptInFilteredModules` via `filterExplorerBootstrapModulesByOptIn()` (`app/utils/explorerModuleOptInFilter.ts`).

```
includeBetaEndpoints / includeInternalEndpoints (explorer page refs)
       ↓
useExplorerOptInFilteredModules
       ↓
filterExplorerBootstrapModulesByOptIn(modules, { includeBetaEndpoints, … })
       ↓
isExplorerBetaOptInModule(name)?  ← config/explorerOptIn.ts (prefix `attribution/`)
       ↓
visibleModules → REST API module select
visibleSelectedModule → ExplorerModuleRail (endpoint list)
visibleSelectedModule / visibleOpenApiSpecUrl → Scalar
```

When the active module becomes hidden (for example Attribution API with beta off), **`resolveFirstExplorerRailModule()`** selects the first remaining healthy module in **discovery order** through `useExplorerBootstrap.selectModule()`. Bootstrap initial selection uses the same helper with **`DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS`**. Internal opt-in rules are reserved until internal module ids are defined in config.

The reference panel `h2` and module rail heading use `headingTitle` from bootstrap (`resolveExplorerModuleRailHeading` in `app/utils/explorerModuleRailHeading.ts`); beta and version chips appear on the reference panel and as REST API module select **`supportingText`** via `formatExplorerModuleSelectSupportingText()`. Version chips strip a trailing `-beta` from discovery versions (for example `0.1.0-beta` → `v0.1.0`).

### Scalar plugin layer

The `ApiReferencePlugin` API accepts Vue components natively. Plugins are registered on the `<ApiReference>` component's `plugins` prop. Codex components and banana-i18n work inside plugins without any bridge pattern.

Two mechanisms:
- **`views`**: inject a Vue component at `content.end` (after the Models section). Use for: token display panel, instance/language context notice, fallback language notice.
- **`extensions`**: inject a Vue component tied to an `x-*` vendor extension field in the spec. Use for: per-endpoint or per-operation metadata. Requires the spec to contain the `x-*` field — only possible if the spec is under our control or can be augmented at fetch time.

**Write-request test wiki (Test Request modal).** For write HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE` — `config/scalarWriteHttpMethods.ts`) on wiki instances with a mapped test wiki (`config/wikiInstanceTestWikis.ts`), the explorer injects a **`CdxCheckbox`** and optional production **`CdxMessage`** into Scalar’s Test Request modal. This is **not** a Scalar `ClientPlugin` alone — the address-bar slot uses **DOM injection** because Scalar’s modal header (`.t-app__top-container`) is flex-wrapped and the checkbox must sit immediately below the address bar.

```
Write endpoint opened in Test Request modal
    ↓
useScalarClientWriteEndpointWarnings
    ├── resetScalarWriteRequestTestWikiPreference() (checkbox default: checked)
    ├── injectAddressBarWarning() → mount after .scalar-address-bar
    │       └── ScalarClientWriteEndpointWarning.vue (slotKey: address-bar)
    └── ClientPlugin slots for request/response views (same component, other slotKeys)
    ↓
isTestWikiEnabledForWriteRequests (shared ref in explorerScalarWriteRequestContext.ts)
    ├── useScalarWriteRequestTestWiki → onBeforeRequest URL rewrite when checked
    └── useScalarWriteRequestAddressBarSync → address bar server URL via eventBus
```

**Placement and layout.** `resolveScalarClientModalAddressBarWarningPlacement.ts` inserts the mount node as the **next sibling** after `.scalar-address-bar`. `syncScalarClientModalAddressBarWarningInlineAlignment()` measures the URL field’s inline-start offset and sets `--fd-scalar-address-bar-inline-align-offset` so checkbox and warning align with the address bar input. **`app/assets/css/explorer-codex-overrides.css`** sets `order: 10000` on `.scalar-address-bar + .scalar-client-write-endpoint-warning-mount` below Scalar’s `lg` breakpoint where the address bar uses `order-last` (9999) — without this, flex order can place controls above the URL row on narrow viewports. At `lg+`, `order` resets but the mount remains full-width on its own row.

**Copy and BiDi.** Interface strings use banana-i18n (`explorer-scalar-write-test-wiki-toggle-*`, `explorer-scalar-write-endpoint-warning`). The warning message splits on `$1` (production wiki display name) and `$2` (test wiki hostname) via `splitMessageAtTwoPositionalParameters()` in `getInterfaceMessageTemplate.ts` so each segment can be wrapped in `<bdi>`; hostnames use `dir="ltr"` and monospace styling.

**Codex checkbox checkmark.** Scalar’s Tailwind preflight can break Codex checkbox pseudo-elements inside the teleported modal. `explorer-codex-overrides.css` re-asserts checkmark layout for `.scalar-client-write-endpoint-controls` (same pattern as `.explorer-project-controls`).

**Plain HTML probe.** `SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE` in `config/scalarClientWriteWarnings.ts` swaps the Vue mount for a plain HTML banner when debugging slot injection without Codex.

---

## OAuth session

Wikimedia OAuth 2.0 uses Authorization Code flow with PKCE (public client). Full sequence: `docs/adr-wikimedia-oauth-authentication.md`.

The flow:
1. User clicks **Log in** in `ShellHeaderUtilityActions` (or the collapsed utility menu), or the progressive **Log in** button on the logged-out `/account` gate (`AccountLoggedOutGate` → `useAccountDashboardPage.onAccountPageLogin`)
2. `useOAuthSession().login(returnTo)` navigates to `GET /api/auth/oauth/login?returnTo=…` (header defaults to the current route; account gate passes the locale-aware account path)
3. Nitro stores PKCE verifier + state in an encrypted HttpOnly session cookie, then 302s to Meta’s authorize endpoint with `code_challenge`
4. Meta redirects to `/oauth/callback?code=…&state=…` (Vue page — not a Nitro route)
5. The page `POST`s to `/api/auth/oauth/exchange`; Nitro validates state, exchanges the code (PKCE verifier from the cookie), fetches the profile, and returns `{ username, accessToken, expiresAt, returnTo }`
6. Callback stashes the payload in `sessionStorage` (`oauthHandoff`) and `window.location.replace(returnTo)`; `oauth-handoff.client.ts` hydrates `oauthSession` Pinia once and clears the handoff key
7. `useOAuthSession()` / `useShellAuthNavigation()` expose session state to the shell: header shows **username only** as a progressive `NuxtLink` to locale-aware `/account` (`header-auth-link-aria` for the accessible name)

Requires `NUXT_OAUTH_COOKIE_SECRET` and `NUXT_PUBLIC_OAUTH_CLIENT_ID`. Callback URL must match the consumer registration for the request origin (production: `https://wikifrodo.netlify.app/oauth/callback`; localhost only if registered separately). Deploy-preview hostnames are not registered — end-to-end login is verified on production or local, not arbitrary PR previews.

---

## RTL and BiDi

### Layout direction

The `<html>` element's `dir` attribute is set reactively in `app/layouts/default.vue` using `useDirection()`, which reads interface locale direction from `config/languages.js`.

**Codex RTL stylesheet:** LTR base styles load globally via `nuxt.config.ts` (`codex.style.css`). The client plugin `app/plugins/codex-rtl-styles.client.ts` injects `codex.style-rtl.css` via a persistent `<link id="fd-codex-rtl-stylesheet">` when `direction === 'rtl'` and sets **`link.disabled = true`** when direction returns to `ltr`. Without toggling, Codex components (e.g. header `CdxSelect`) keep mirrored physical layout after switching from Hebrew/Persian back to an LTR interface locale until a full reload.

**Disclaimer:** This relies on Codex’s global RTL mirror sheet (physical property overrides), not per-component `dir`. It is a **prototype workaround** for runtime locale switching. Third-party quiet-tabs borders are suppressed in `app/assets/css/shell-primary-nav-overrides.css`, re-imported when RTL is enabled so rules load after `codex.style-rtl.css`.

**Known open issue — header `CdxSelect` expand chevron in RTL:** With `codex.style.css` always loaded and `codex.style-rtl.css` toggled on for RTL interface locales, both stylesheets apply at once. Codex mirror sheets are intended to **replace** the LTR bundle, not stack on it. For `.cdx-select-vue__indicator`, the LTR sheet sets `right: 12px` and the RTL sheet sets `left: 12px` without clearing the other edge, which hides the mandatory expand chevron in the header language select. The header also constrains the control to **8–11rem** while Codex’s default select `min-width` is **256px**, and the closed trigger uses a custom `#label` slot with an in-flow globe icon (not Codex’s `--has-start-icon` / `defaultIcon` path). **Do not add per-component overrides on Codex select internals** — attempted fixes were reverted. Revisit via one of: `codex.style-bidi.css` (single `[dir]`-aware bundle), disabling the LTR base sheet when RTL is active, adopting Codex’s documented icon-on-trigger pattern, relaxing header width, or an upstream Codex fix.

**Language select remount:** Header `CdxSelect` uses `:key="direction"` so the closed control re-renders when direction changes.

### BiDi isolation rule

Any string not produced by banana-i18n must be wrapped in `<bdi>`. This is enforced at review time. The categories requiring isolation are:

- Wiki instance names and project names
- REST module names and descriptions from OpenAPI specs
- Language names from data sources
- Wikimedia usernames (header account link; account page title)
- Account API key seed/API fields (names, descriptions, status, permissions, dates, client ids)
- Any user-generated or user-supplied content
- Article titles, page names, or namespace names from any wiki
- Any string whose language is not statically known at component-write time

Strings from banana-i18n are safe to render without isolation — their direction matches the interface direction by definition. Account Reset dialog chrome (`account-reset-dialog-*`, client-id/secret field labels) is interface text and does not require `<bdi>`; revealed credential **values** in the success step do (with intentional `dir="ltr"`).

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

**Documented exception — start nav WebKit scrollbar pseudos.** `app/assets/css/shell-start-nav-scroll.css` styles `::-webkit-scrollbar` with physical **`width`** because that pseudo-element API has no logical equivalent. See **Shell scroll regions** and `DESIGN_REQUIREMENTS.md` → Start column section navigation.

**Documented pattern — scroll-end inset on nav scrollports.** Start section nav and the collapsed overlay reserve **32px** below the last item via a **`::after` block spacer** (`block-size: var(--spacing-200)`) on the scrollport element — not `padding-block-end` on a nested wrapper. See **Shell section navigation** (scroll-end inset) and `AGENTS.md` rule 8.

**What we do not do.**
- Do not ship a separate `app.rtl.css` and toggle stylesheets at runtime — that defeats Nuxt 4 CSS code-splitting and HMR.
- Do not write physical properties in first-party CSS "for clarity" and rely on a build-time flipper. Logical properties are clearer, faster, and avoid broad unintended mirroring.

---

## Configuration files

All project-level configuration lives in `config/`. Files are documented with a file-level JSDoc block describing their purpose and the effect of each key.

| File | Contains |
|---|---|
| `config/instances.ts` | Wiki instance IDs, display names, base URLs, explicit `dir`, content language codes |
| `config/languages.js` | Language codes, explicit `dir` declarations, fallback chains |
| `config/mainNavigation.ts` | Primary shell navigation order, banana message keys, locale-agnostic paths; `API_EXPLORER_NAVIGATION_PATH` for the header link (not a tab) |
| `config/contentRedirects.ts` | Legacy content URL **301** redirects merged into `nuxt.config.ts` `routeRules` |
| `config/sectionNavigation.js` | Content-page left-rail section groups and items (banana message keys only; keyed by main nav id) |
| `config/explorerSideNav.js` | Explorer left-rail sections and placeholder links (banana message keys only) |
| `config/explorerOptIn.ts` | Codex checkbox values, beta-gated module name prefixes (`attribution/`), `isExplorerBetaOptInModule()`, `DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS` |
| `config/explorerProjectPicker.ts` | Explorer project + language picker ids, defaults, and mapping to wiki instance ids |
| `config/explorerModuleDescriptions.ts` | Banana fallback keys when OpenAPI `info.description` is absent; **`EXPLORER_MODULE_DESCRIPTION_OPENAPI_SUFFIX_STRIP_PATTERNS`** removes configured trailing boilerplate after bootstrap normalization (for example Site API `site/v1`) |
| `config/explorerSurfaces.ts` | Explorer control surface tokens (Codex `--background-color-neutral-subtle`, 4px radius) — mirrored as `--fd-explorer-controls-surface-*` in `page-grid.css` |
| `config/scalar.js` | Scalar component defaults (theme, layout, enabled features) |
| `config/brandTypography.ts` | Brand wordmark font URL (`BRAND_WORDMARK_FONT_STYLESHEET_URL` for Google Fonts Montserrat in `nuxt.config.ts`) |
| `config/siteFooter.ts` | Footer policy and license link URLs |

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

### Shiki transformer features

`@shikijs/transformers` is a transitive dependency of `@nuxt/content`. Line numbers use a project-specific transformer plus CSS counters; line highlighting and diffs use `transformerMetaHighlight()` / `transformerNotationDiff()` wired in `nuxt.config.ts` (see demo page).

| Feature | Mechanism |
|---|---|
| Line numbers | Custom meta transformer + CSS counters in `main.css` |
| Line highlighting (`{3-5}` in code fence meta) | `transformerMetaHighlight()` |
| Diff annotations (`// [!code ++]` / `// [!code --]`) | `transformerNotationDiff()` |

### MDC content components

`@nuxt/content` ships MDC (Markdown Components): any `.vue` file placed in `app/components/content/` is auto-registered and callable from Markdown using `::component-name` block syntax. All content components must use **Codex** (`@wikimedia/codex`) — already installed — wherever an appropriate widget exists.

| File | Codex widget(s) | Markdown syntax |
|---|---|---|
| `ProseH2.vue` … `ProseH6.vue` | `CdxIcon` + `cdxIconLink` | Overrides default heading rendering; heading text is plain text, icon appears on hover via CSS. Default `@nuxtjs/mdc` wraps the full heading text in `<a>` — these components replace that with the icon-alongside pattern |
| `ProseA.vue` | `CdxIcon` + `cdxIconLinkExternal` | Overrides all `<a>` in prose; adds icon when `href` is external |
| `Callout.vue` | `CdxMessage` (`type`: `notice` / `warning` / `error` / `success`) | `::callout{type="warning"}` block — see **Callouts** below |
| `CodeTabs.vue` + `CodeTab.vue` | `CdxTabs` (`framed`) + `CdxTab` | `::::code-tabs` / `:::code-tab{label="…"}` block — see **Code tabs** below |
| `AppButton.vue` | Progressive button styling (NuxtLink / `<a>`) | `::app-button{href="…" label="…"}` inline |
| `Include.vue` | — | `::include{file="./_partials/…"}` — locale-relative content inclusion |
| `Partial.vue` | — | `::partial{name="…"}` — allowlisted shared partials (`config/sharedPartials.ts`); see remote-content ADR §11 |
| `Attribution.vue` | `CdxIcon` + `cdxIconLogoWikimedia` | `::attribution{…}` — CC BY-SA footer for wiki-imported pages |

#### Callouts

`Callout.vue` wraps Codex **`CdxMessage`**. Optional `#title` named slot content is Markdown; MDC already emits a `<p>`, so the component must **not** wrap the title in another `<p>` or `<strong>` (invalid nesting misaligned the status icon from the title). When a title is present:

- The first child paragraph of `.cdx-message__content` is bolded via CSS (Codex multiline message pattern).
- `.cdx-message__content` uses `align-self: flex-start` so the icon aligns with the title row (Codex centers content for single-line messages by default).

Imported wiki message boxes map to `::callout{type=…}` via the remote-content conversion registry (`docs/adr-remote-content-fetching.md`).

#### Code tabs

`CodeTabs.vue` + `CodeTab.vue` wrap Codex **`CdxTabs`** with the **`framed`** prop. Codex documents framed tabs for use inside a bordered module ([Tabs component](https://doc.wikimedia.org/codex/latest/components/demos/tabs.html)); quiet (default) tabs are reserved for shell chrome (`ShellPrimaryNav`).

**Why framed:** Tabbed code blocks are self-contained modules on prose pages, not page-level navigation. Framed tabs supply the gray header row, white selected-tab label, and content panel chrome without reimplementing tab interaction states.

**MDC bridge:** `CdxTabs` requires direct `CdxTab` children. MDC nests `:::code-tab` blocks inside `::::code-tabs`, so `CodeTab` registers each panel (label + default-slot render function) during `setup()` via `provide`/`inject`; `CodeTabs` renders `CdxTab` panels from that registry. A hidden `<slot />` mount point keeps registration SSR-safe (registration must not wait for `onMounted`).

**Styling exceptions** (documented; tab header metrics remain Codex-owned):

| Rule | Token / value | Rationale |
|---|---|---|
| Module border | `1px solid var(--border-color-muted)` | Muted module edge per Codex framed-tabs-in-a-box pattern |
| Module radius | `var(--border-radius-base)` | Matches Codex framed tab label corner radius |
| Code padding | `var(--spacing-75)` (12px) on `pre` | Inset code inside the white content panel |
| Inactive panels | `v-show` via `CdxTab` | Panels stay in the DOM for find-in-page across tabs |

### Page-layer features

| Feature | Status |
|---|---|
| Next / Previous navigation | Implemented in `[...slug].vue` — reads `page.prev` / `page.next` frontmatter; `NuxtLink` + `CdxIcon` arrows (`cdxIconArrowPrevious` / `cdxIconArrowNext`, `flip-for-rtl`) |

### File inclusion

**Locale-relative includes:** `app/components/content/Include.vue` resolves `::include{file="./…"}` against the current page locale and route, then renders via `ContentRenderer`. Demo: `content/en/use-content-and-data.md` → `./_partials/api-note.md`.

**Shared (portal-authored) partials:** `::partial{name}` via `Partial.vue` + `config/sharedPartials.ts` allowlist — used by imported wiki pages and authored content; see Remote content fetching below and ADR §11.

### Demo page

`content/en/use-content-and-data.md` exercises markdown rendering features with inline status notes. Use it as the acceptance test surface when changing content components or Shiki configuration.

---

## Remote content fetching

Content import is handled by `scripts/fetch-remote-content.mjs`, reading sources from `config/remoteContentSources.ts`. Two strategies:
1. `markdown-url` — fetch raw Markdown from a URL.
2. `mediawiki-translated-page` — fetch a MediaWiki page and all its translation subpages: discover locales via the Translate extension's `messagegroupstats`, fetch each locale's Parsoid HTML (`/w/rest.php/v1/page/{title}/html`), and convert to MDC Markdown with the unified/rehype/remark pipeline in `scripts/lib/wikiContentConversion.mjs` (code-with-language and message-box→`::callout` mapping; CC BY-SA attribution footer). Writes `content/[locale]/[localPath].md`.

**Decoupled from the build.** The fetcher is a **standalone command** (`npm run fetch-remote-content`); `build` / `generate` do not run it. A developer (or scheduled job) runs it, reviews the resulting git diff, and commits — so imported content is **committed** (not gitignored) and builds are deterministic and network-free.

**Wipe-and-recreate lifecycle.** Every run first deletes all previously-imported files (frontmatter `remoteImport: true`) and prunes emptied locale dirs, then recreates them — so removed sources, changed slugs/locales, and dropped translations leave no orphan. Authored content has no marker and is never touched. Output is idempotent (no volatile fields), so an unchanged page produces no diff. A failed fetch writes an empty placeholder (no stale-copy fallback); the build never fails.

**Conversion registry & shared partials.** HTML→MDC mapping is a registry of conversions: content conversions (message-box→`::callout`, fenced code with language) gated per source by `componentMapping`, plus a structural one — **shared partials**. A wiki page marks an insertion point with an empty `<div class="frontdoor-partial" data-partial="name">`; the converter replaces it with a `::partial{name}` directive. The partial's content is portal-authored (`content/_partials/shared/<name>.md`, committed, never fetched/wiped) and rendered by `app/components/content/Partial.vue`, which resolves the name against the allowlist in `config/sharedPartials.ts` — the security boundary for wiki-driven names. See `docs/adr-remote-content-fetching.md` (§8, §10, §11) for the full decision record.

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

Supported instances are defined in `config/instances.ts`. The community explorer picker exposes three **projects** (Wikipedia, Wikimedia Commons, Wikidata) and four **Wikipedia languages** (English, Spanish, Hebrew, Farsi), resolved to six wiki instance ids:

| ID | Base URL | Direction | Picker path |
|---|---|---|---|
| `enwiki` | `https://en.wikipedia.org` | LTR | Wikipedia + English |
| `eswiki` | `https://es.wikipedia.org` | LTR | Wikipedia + Spanish |
| `hewiki` | `https://he.wikipedia.org` | RTL | Wikipedia + Hebrew |
| `fawiki` | `https://fa.wikipedia.org` | RTL | Wikipedia + Farsi |
| `commonswiki` | `https://commons.wikimedia.org` | LTR | Wikimedia Commons |
| `wikidata` | `https://www.wikidata.org` | LTR | Wikidata |

Available modules and their spec URLs for each instance are read from these endpoints at runtime. `config/instances.ts` contains only base URLs and metadata — no spec URLs. Picker labels and defaults live in `config/explorerProjectPicker.ts` and `i18n/*` (`explorer-project-*`, `explorer-project-language-*`).

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
| Start column (always mounted) | `app/layouts/default.vue` (`.frontdoor-shell__side-panel--start.shell-side-panel.shell-side-panel--start`), `app/composables/usePageSectionNav.ts`, `config/sectionNavigation.js`, `config/explorerSideNav.js` |
| Start column edge + width | `app/layouts/default.vue` (scrollport border), `app/assets/css/shell-start-nav-scroll.css`, `app/components/shared/ShellSidePanelNav.vue` (dividers), `app/assets/css/page-grid.css` (`--fd-layout-start-panel-inline-size`) |
| Site footer | `app/components/shared/ShellSiteFooter.vue`, `config/siteFooter.ts`, `app/layouts/default.vue` (`.frontdoor-shell__content`, `.frontdoor-shell__body-scroll`), `app/assets/css/page-grid.css`, `i18n/*` (`footer-*`) |
| Shell scroll regions | `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `app/assets/css/shell-start-nav-scroll.css` (scrollport + scroll-end `::after` spacers), `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/shell-end-panel-nav.css` (module rail scrollport), `app/assets/css/main.css` |
| Nav collapse + drawer | `app/composables/useShellNavigationCollapse.ts`, `app/composables/useShellNavigationBreadcrumbs.ts`, `app/composables/useShellCollapsedNavMenu.ts`, `app/components/shared/ShellCollapsedNavigation.vue`, `app/components/shared/ShellCollapsedNavMenuOverlay.vue`, `config/shellNavigation.ts`, `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/shell-collapsed-nav-menu.css` |
| Section menu component | `app/components/shared/ShellSidePanelNav.vue` |
| Explorer side nav routing | `app/composables/usePageSectionNav.ts`, `app/utils/explorerRoute.ts`, `config/explorerSideNav.js` |
| Explorer page + modes | `app/pages/explorer/[[view]].vue`, `app/composables/useExplorerMode.ts`, `app/composables/useEnterpriseExplorer.ts`, `config/enterpriseExplorer.ts` |
| Explorer project controls | `app/components/explorer/ExplorerProjectControls.vue`, `app/composables/useExplorerProjectLanguagePicker.ts`, `app/composables/useExplorerModuleSelect.ts`, `config/explorerProjectPicker.ts`, `config/instances.ts`, `config/explorerModuleDescriptions.ts`, `config/explorerSurfaces.ts`, `app/utils/explorerModuleOptInFilter.ts`, `app/utils/explorerModuleRailHeading.ts`, `app/utils/explorerModuleDescription.ts`, `app/assets/css/main.css` (explorer picker menu stacking only), `app/assets/css/page-grid.css` (`--fd-explorer-controls-surface-*`) |
| Explorer module rail + select metadata | `app/components/explorer/ExplorerModuleRail.vue`, `app/composables/useExplorerModuleRailPlacement.ts`, `app/utils/explorerModuleRailHeading.ts`, `app/utils/explorerEndpointLabels.ts`, `app/utils/explorerModuleDescription.ts`, `app/composables/useEndPanelNavAlign.ts`, `app/assets/css/shell-end-panel-nav.css`, `config/explorerSurfaces.ts`, `app/pages/explorer/[[view]].vue` (`#explorer-module-rail-anchor`), `tests/explorerModuleDescription.test.mjs` |
| Explorer bootstrap + opt-in | `server/api/explorer-bootstrap.get.ts` (OpenAPI fetch, `moduleDescription` via `normalizeOpenApiModuleDescription`), `app/composables/useExplorerBootstrap.ts`, `app/composables/useExplorerOptInFilteredModules.ts`, `config/explorerOptIn.ts` |
| Write-request test wiki (Test Request modal) | `app/components/explorer/scalar/ScalarClientWriteEndpointWarning.vue`, `app/composables/useScalarClientWriteEndpointWarnings.ts`, `app/composables/useScalarWriteRequestTestWiki.ts`, `app/composables/useScalarWriteRequestAddressBarSync.ts`, `app/utils/explorerScalarWriteRequestContext.ts`, `app/utils/resolveScalarClientModalAddressBarWarningPlacement.ts`, `app/utils/applyTestWikiToggleToServerUrl.ts`, `app/utils/getInterfaceMessageTemplate.ts`, `config/wikiInstanceTestWikis.ts`, `config/scalarWriteHttpMethods.ts`, `config/scalarClientWriteWarnings.ts`, `app/assets/css/explorer-codex-overrides.css` |
| Enterprise custom viewer | `app/components/explorer/ExplorerEnterpriseCustom.vue`, `app/composables/useEnterpriseSpecOutline.ts`, `server/api/enterprise-spec*.ts` |
| Header chrome | `app/components/shared/ShellHeaderBrand.vue`, `app/components/shared/ShellHeaderUtilityActions.vue`, `app/components/shared/ShellPrimaryNav.vue`, `app/assets/css/shell-primary-nav-overrides.css` |
| Header auth (Log in / username→account) | `app/composables/useShellAuthNavigation.ts`, `app/composables/useShellHeaderUtilityMenu.ts`, `app/composables/useOAuthSession.ts`, `app/stores/oauthSession.js` |
| OAuth PKCE flow | `server/api/auth/oauth/login.get.ts`, `server/api/auth/oauth/exchange.post.ts`, `app/pages/oauth/callback.vue`, `app/plugins/oauth-handoff.client.ts`, `app/utils/oauthHandoff.ts`, `docs/adr-wikimedia-oauth-authentication.md` |
| Account dashboard | `app/pages/account.vue`, `app/components/account/*` (incl. `AccountLoggedOutGate.vue`, `AccountResetApiKeyDialog.vue`, `AccountResetCredentialCopyButton.vue`), `app/composables/useAccountDashboardPage.ts`, `app/composables/useDeveloperTokenDashboard.ts`, `app/composables/useAccountResetApiKeyDialog.ts`, `app/composables/useCopyWithCopiedTooltip.ts`, `app/composables/usePrototypeAuthSession.ts`, `stores/prototypeDeveloperTokens.ts`, `config/tokenManagement.ts`, `config/auth.ts`, `app/middleware/content-sidebar.global.ts` |
| Primary nav + redirects | `config/mainNavigation.ts`, `config/contentRedirects.ts`, `app/composables/useMainNavigationLinks.ts`, `app/composables/usePrimaryNavigationTab.ts` |
| Route → nav id | `app/utils/contentRoute.ts`, `app/utils/explorerRoute.ts` |
| Interface strings (section nav) | `i18n/en.json`, `i18n/qqq.json` (`section-nav-*`, `section-nav-site-label`) |
| Interface strings (collapsed nav overlay) | `i18n/*` (`shell-collapsed-nav-menu-*`, `shell-collapsed-nav-label`) |
| Interface strings (account / header auth) | `i18n/*` (`account-*` incl. `account-logged-out-*`, `header-account-label`, `header-auth-link-aria`, `header-login-label`, `header-logout-label`) |

---

## Experiment 1 notes

The current implementation is Experiment 1 from the project design document: verifying Scalar multi-spec reactivity in Nuxt 4 using real Wikimedia endpoints. The experiment includes the full discovery flow — `useExplorerBootstrap` aggregates `/api/explorer-bootstrap` (discovery + per-module spec fetch), the REST API module select and end-column module rail (endpoints for the selected module) populate from the live response, and module selection drives Scalar via `visibleOpenApiSpecUrl`. Wiki instance selection uses the project + language picker (`useExplorerProjectLanguagePicker`, `config/explorerProjectPicker.ts`). Spec URLs are read directly from the discovery response and passed to Scalar. Write-request Test Request modals include the test-wiki **`CdxCheckbox`**, production warning, and URL rewrite path documented under **Scalar plugin layer → Write-request test wiki**. Full feature scope is described in `AGENTS.md`. The experiment does not include per-module language-level spec selection, OAuth, wiki content sync, Markdown content pages, or search. It establishes the foundational scaffold for the explorer surface and confirms the core runtime spec-switching mechanism — including RTL shell direction switching — before the remaining experiments build on it.