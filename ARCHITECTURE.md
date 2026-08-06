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

The explorer route (`/explorer/**`) and the account route (`/account`, `/*/account`) are configured as `ssr: false` in `nuxt.config.ts`. They are never pre-rendered. Everything else is pre-rendered via `nuxt generate`.

---

## Directory structure

```
/
├── app/                        # Nuxt 4 app directory
│   ├── pages/
│   │   ├── index.vue           # Landing page (static, pre-rendered)
│   │   ├── account.vue         # Account: client-only gate or dashboard (ssr: false)
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
│   │       ├── ShellHeaderBrand.vue    # Header brand (mark + Montserrat wordmark + Prototype chip; no focus outline)
│   │       ├── WikimediaLogoMark.vue   # Commons Wikimedia logo (currentColor) for header/footer
│   │       ├── ShellHeaderUtilityActions.vue  # Search, settings→color-theme popover, language, Log in / username→account
│   │       ├── ShellSidePanelNav.vue   # Start-column section menu (when sections exist)
│   │       └── ShellPrimaryNav.vue     # Header primary nav quiet tabs
│   ├── composables/            # All shared logic; see Composables section below
│   ├── plugins/
│   │   ├── banana-i18n.js      # Registers banana-i18n globally; provides $i18n
│   │   ├── oauth-handoff.client.ts  # Hydrates OAuth session on boot: one-shot sessionStorage handoff, else refresh-token cookie
│   │   └── explorer-route-navigation.client.ts  # Full reload across /explorer boundary
│   ├── utils/
│   │   ├── localeAwarePath.ts   # Locale-prefixed paths (account, content)
│   │   ├── openUrlInNewTab.ts    # Client-only helper for Meta-Wiki / doc links opened from composables
│   │   ├── accountTokenSecret.ts # Masking helpers for account API key secrets
│   │   ├── oauthHandoff.ts      # sessionStorage key for callback → destination token handoff
│   │   ├── explorerRoute.ts     # isExplorerRoutePath() for layout and plugins
│   │   ├── landingRoute.ts      # isLandingRoutePath() for frontdoor-shell--landing
│   │   ├── contentRoute.ts      # Main-nav id from route path (explorer → `apis`); locale prefix stripping
│   │   └── parseNavigationCardChips.ts # MDC chip attribute → CdxInfoChip props (label-only / award in NavigationCard)
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
│   ├── explorerOptIn.ts        # Opt-in checkbox tokens, defaults, beta/internal module gates
│   ├── auth.ts                 # Account path, Meta-Wiki OAuth URLs, prototype defaults
│   ├── tokenManagement.ts      # Placeholder API key seeds + Reset fake secret generators (not real Meta data)
│   ├── explorerProjectPicker.ts # Explorer project + language picker ids and wiki instance mapping
│   ├── explorerInternalSidebarExperiment.ts # Community Explorer: Scalar native sidebar (PR #40); gates legacy module rail
│   ├── explorerModuleRail.ts   # Legacy module-rail inline endpoint scroll cap (unused while native sidebar is on)
│   ├── explorerSurfaces.ts     # Explorer surface tokens + Test Request gutter / shell-clamp deadband; 4px radius shared by controls / account / NavigationCard / CodeBlock / CodeTabs / Highlight / Test Request dialog
│   ├── navigationCardIcons.ts  # Allowlisted Codex icon names for NavigationCard MDC props
│   ├── navigationCardTitleLogos.ts # Allowlisted brand title logos (gerrit/github/gitlab) for NavigationCard
│   ├── wikiInstanceTestWikis.ts # Production → test wiki mapping + display-name keys for write-request warning
│   ├── scalarWriteHttpMethods.ts # HTTP methods treated as write requests in the Test Request modal
│   ├── scalarClientWriteWarnings.ts # Plain HTML probe flag for modal injection debugging
│   ├── moduleSourceOfTruth.ts  # Accessor over the generated module source of truth (FK joins)
│   ├── generated/              # Committed generated data (regen-and-diff, never hand-edited)
│   │   ├── wikiInstances.generated.ts  # Public wiki fleet registry
│   │   ├── modules.generated.ts        # Unique REST modules → instance-id lists
│   │   └── module-specs/               # Per-module full OpenAPI specs (JSON)
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
│   ├── generate-language-catalog.mjs  # Regenerates config/languages.generated.ts
│   └── generate-module-source-of-truth.mjs  # Regenerates config/generated/ (fleet, modules, specs)
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
| `useExplorerBootstrap(instance)` | Aggregated explorer bootstrap (modules with `headingTitle`, `moduleDescription`, operations, spec URLs, selection, Scalar switch state) via `/api/explorer-bootstrap`; exposes **`selectedEndpointOperationId`** / pending operation target for deep-link and (legacy) rail focus via `useExplorerScalarFocus` |
| `useExplorerOptInFilteredModules(...)` | Filters bootstrap module lists by opt-in checkboxes (beta prefixes + `*-internal` path segments); exposes visible selection/spec URL; reconciles selection when a gated module is hidden |
| `useExplorerOptInCheckboxGroup(beta, internal)` | Maps opt-in boolean refs to Codex checkbox group values (`config/explorerOptIn.ts` tokens) |
| `useExplorerProjectLanguagePicker(instanceId)` | Project + language combobox state; maps picker selections to wiki instance ids (`config/explorerProjectPicker.ts`); syncs with `selectedWikiInstanceId` from `useDirection()` |
| `useExplorerModuleSelect(visibleModules, …)` | REST API module `CdxSelect` menu items and selection bridge; discovery order after opt-in filter; `label` + version-only `supportingText` + `description`; `resolveModuleSelectOptionDisplay` for audience warning chips (Codex exception #14); `default-label`, `menu-config`; calls `selectModule` with `source: 'module-select'` |
| `useMainNavigationLinks()` | Shell primary nav labels (banana) and locale-aware paths; **APIs** tab → catalog `/apis`; explorer `/explorer` stays never locale-prefixed (`i18n: false`) |
| `usePrimaryNavigationTab()` | Active primary nav tab id from current route (`apis` on explorer); **empty** when `getMainNavigationIdFromPath` is null (home `/`, `/account`, other unmatched routes) so no tab appears selected; pairs with `ShellPrimaryNav` |
| `useShellNavigationCollapse(navRowRef, expandedNavContentRef)` | Whether primary tabs and the start-column section menu are collapsed into the header hamburger + breadcrumb row; `ResizeObserver` with hysteresis (`config/shellNavigation.ts`); also `isNavDrawerExpanding` for gated drawer CSS (viewport expand only — not landing / `sidebar: false` route changes) |
| `useShellCollapsedNavMenu({ isNavigationCollapsed, hasSectionNavigation })` | Full-screen collapsed navigation overlay: open/close, section vs primary view, Escape / route / uncollapse dismiss |
| `useShellNavigationBreadcrumbs()` | Primary and section labels for `ShellCollapsedNavigation` breadcrumbs (primary crumb uses active tab label, including **APIs** on explorer) |
| `usePageSectionNav()` | Resolves start-column section navigation for the current route; always returns a navigation source (sections may be empty). Honours `sidebar` frontmatter via `useContentPageSidebar` (`false` hides/collapses start column — used for `/account`). **APIs** section (`apis`: catalog + explorer) from `config/explorerSideNav.js`; other content IA from `config/sectionNavigation.js`; fallback `section-nav-site-label` when no config entry. APIs items: `mode` → `pathForExplorerMode()` / `explorerModeFromPath()`; `href` → content routes; `enabled: false` omitted. Layout always mounts `.shell-side-panel`; `ShellSidePanelNav` when sections are non-empty (stays mounted when nav collapsed — `inert` / `aria-hidden`) |
| `useExplorerMode()` | Reactive explorer mode (`community`, `enterprise-full`, `enterprise-custom`) from the current route via `explorerModeFromPath()` |
| `useEnterpriseExplorer()` | Spec URL and Scalar overrides for the Scalar-bearing enterprise mode (`enterprise-full`) |
| `useEndPanelNavAlign(alignAnchor, endPanel, scrollClamp?, heightMatch?)` | Aligns end-column page navigation with a main-column anchor; optional fourth argument sets `--frontdoor-end-panel-nav-max-block-size` from a height-match element (explorer: omit height-match — viewport CSS fallback; natural-height Scalar shell) |
| `useExplorerModuleRailPlacement()` | **Legacy** (unused while `EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR` is true): module rail Teleport target / layout mode |
| `useExplorerModuleRailInlineEndpointScrollCap(scrollport, endpointList, …)` | **Legacy** (unused while native sidebar is on): inline rail endpoint scrollport cap |
| `useContentLocale()` | Current content locale, falling back per the configured chain |
| `useDirection()` | Current text direction ('ltr' or 'rtl') based on active language / wiki instance config |
| `useColorMode()` | Site light / dark / auto (`fd-theme--*`); localStorage + FOUC script; preferences popover radios call `setMode` only |
| `useAccountPath()` | Locale-aware path for the account dashboard (`buildLocaleAwarePath` in `app/utils/localeAwarePath.ts`) |
| `usePrototypeAuthSession()` | Placeholder key seeding after OAuth login; wraps `prototypeAuthSession` store (**does not grant `/account` access**; key tables remain placeholders until Meta list APIs land) |
| `useAccountDashboardPage()` | Account access gate (OAuth-only), logged-out gate + dashboard banana labels (incl. per-section Meta CTA labels), sign-out; composes token dashboard + Reset dialog |
| `useDeveloperTokenDashboard()` | **Placeholder** API key list state/view-models (not live Meta data); `onOpenMetaConsumerRegistration` → `META_OAUTH2_CONSUMER_REGISTRATION_URL`; locale-aware in-app auth learn-more paths via `resolveContentHref` (same-tab `NuxtLink`, inlined in the section description paragraph); confirm-reset regenerates placeholders via Pinia. **Delete is not shown** until Meta/backend revoke lands |
| `useAccountResetApiKeyDialog()` | Reset dialog state (`CdxDialog`): confirm → success (Figma `626:7921` / `633:7695`); success Client ID / secret / refresh token are **placeholders**; real reset backend pending |
| `useCopyWithCopiedTooltip()` | Clipboard copy + brief focus/blur so `CdxTooltip` shows “Copied!” (Reset success quiet copy; keeps trigger mounted) |
| `useShellAuthNavigation()` | Shell header session control: OAuth `login`/`logout`, username, locale-aware `/account` path, `header-auth-link-aria` |
| `useShellHeaderUtilityMenu()` | Collapsed utility `CdxMenuButton` items; exports `SHELL_HEADER_UTILITY_MENU_VALUE` (settings→preferences popover handled in parent; username→account; log in/out) |
| `useScalarClientWriteEndpointWarnings(scalarInterface)` | Injects write-request production **`CdxMessage`** into the Scalar Test Request modal **only** after `.scalar-address-bar`; removes stray warning hosts (e.g. under Response Headers); `$2` test-wiki link is mocked until test instances are discoverable |
| `useScalarClientWriteRequestConfirmDialog()` | **Mock** Codex confirm before Scalar address-bar Send on write methods; disable via `SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED` in `config/scalarClientWriteWarnings.ts` |
| `useScalarClientModalBackgroundScrollLock(scalarShellRef, scalarInterface)` | Test Request UI exploration: scrolls shell into view on open, toggles `--client-modal-open` CSS, sets `--fd-explorer-test-request-shell-block-size` from dialog `scrollHeight` + gutter (`ResizeObserver`, deadband / skip collapsed heights from `config/explorerSurfaces.ts`) so page scroll cannot continue into specs; clears clamp when `scalarInterface` is nulled or replaced (spec remount); while open, sets dialog `inert` on outside-shell pointerdown so Scalar’s focus-trap cannot dismiss header preferences `CdxPopover`; restores shell height + page scroll + clears `inert` on close |

**Account dashboard** (`app/pages/account.vue`):

#### Access — logged-out gate (product decision)

Unauthenticated visits to `/account` (including manually appending `/account` to the URL) show the **logged-out gate** ([Figma 1001:18723](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=1001-18723)), not the dashboard. This is the **end-state product decision**, not a temporary experiment.

| Element | Behaviour |
|---------|-----------|
| Title | banana `account-logged-out-title` — “User dashboard” |
| Body | banana `account-logged-out-description` — prompt to log in for credentials / API keys |
| Log in | Progressive primary `CdxButton`; starts the **same** Meta OAuth + PKCE flow as the header Log in link (`useShellAuthNavigation` / `useOAuthSession.login`), with `returnTo` = locale-aware account path (`useAccountPath`) so post-auth lands on the dashboard |
| Create an account | Prompt banana `account-logged-out-create-account-prompt` + Codex Link (`--color-link*` mixin) label `account-logged-out-create-account-link` → `WIKIMEDIA_CREATE_ACCOUNT_URL` in `config/auth.ts` (`https://auth.wikimedia.org/metawiki/wiki/Special:CreateAccount`). Opens in a new tab. **Suppresses `:visited`** (keep unvisited / hover / active). **Mock outbound only** — Front Door does not handle post-registration return, session handoff, or closing that flow; users return and use Log in |
| Footer | **Shell** `ShellSiteFooter` (not a page-local footer). **Logged-out gate only:** `AccountLoggedOutGate` grows (`min-block-size: 100%` / flex) so short gate content pins the footer to the viewport bottom. Logged-in dashboard is a **separate root** with Figma Content gaps (`--spacing-200` title / logout; **Personal → OAuth** **`--spacing-250` (40px)**; section inner `--spacing-150`) — never shares the gate’s fill / `gap: 0` styles. `/account` is **`ssr: false`** so post-login handoff does not SSR the gate into the dashboard tree |
| Primary nav | **No** selected tab — `/account` is outside the primary IA (`getMainNavigationIdFromPath` → null; `usePrimaryNavigationTab` → `''`). Do not fall back to the first tab (Get started) |
| Access rule | Dashboard (placeholder key cards) only when `useOAuthSession().isLoggedIn` is true |

UI: `AccountLoggedOutGate.vue`. Gate labels, Create an account URL, and `onAccountPageLogin` live in `useAccountDashboardPage`.

#### Logged-in dashboard (Figma node `966:21207`)

#### Prototype placeholders — not real API keys (pending backend)

**The personal and application API key rows on `/account` are not real credentials.** Front Door does **not** retrieve OAuth consumers, developer tokens, client secrets, or refresh tokens from Meta-Wiki or any other backend. What users see is **seed / generated placeholder data** from `config/tokenManagement.ts` held in `stores/prototypeDeveloperTokens.ts`, for **usability testing** of layout and flows only.

| Surface | Reality today | Pending |
|---------|---------------|---------|
| Key list cards (names, meta, Client ID) | Placeholder seed rows; **Client secret not shown** on cards | Backend (and Meta) APIs to **list** real keys for the signed-in user |
| Reset confirm → success dialog (Client ID / Client secret / Refresh token) | Newly **generated placeholders** (`createPrototypeClientSecret` / `createPrototypeRefreshToken`); client id kept from the seed row | Backend to **reset / re-issue** real credentials and return live values |
| Delete | **Not shown** in the UI (revoke/delete flow unavailable) | Backend to **revoke / delete** real keys, then reintroduce Delete on list cards |
| Section CTAs (“Create API token” / “Request new OAuth client”) | Each section has a progressive outlined `CdxButton` + `cdxIconLinkExternal` that opens `META_OAUTH2_CONSUMER_REGISTRATION_URL` (`config/auth.ts`) in a new tab; does not populate the local list with a real key | Wire approval / list sync after Meta registration |

Do **not** treat copied “secrets” from the Reset success dialog as usable against production or test wikis. OAuth **login** (username in the header) is a real Meta session; that is separate from these fake key tables. Placeholder rows are seeded only after OAuth login via `usePrototypeAuthSession` — they are not shown on the logged-out gate.

- **Start column:** Hidden via `content-sidebar.global` middleware publishing `sidebar: false` for `/account` (and locale-prefixed equivalents) so `isSidebarHidden` collapses the grid track — no empty section nav.
- **Title:** banana `account-page-title-before` + `<bdi>` username + `account-page-title-after` (English: `{username}’s dashboard`). Username is the Meta OAuth username only.
- **Sections:** Personal API keys and Application API keys — each section intro is **heading → one paragraph** (description sentence + “Learn more about …” link, no block gap) above the cards. Learn-more links are **in-app** `NuxtLink`s (same tab, no external icon) to Front Door authentication sections: personal → `/apis/authentication#personal-api-tokens` (`MEDIAWIKI_OWNER_ONLY_CONSUMERS_DOC_URL`); OAuth → `/apis/authentication#oauth-authorization-code-flow` (`MEDIAWIKI_OAUTH_FOR_DEVELOPERS_DOC_URL`); locale-prefixed via `resolveContentHref` in `useDeveloperTokenDashboard`. Codex `CdxButton` (quiet **Reset** only on cards — **Delete is not shown** until Meta/backend revoke lands). Below the list or empty-state message in each section: progressive outlined (`action="progressive"` `weight="normal"`) CTA + `cdxIconLinkExternal` — Personal **Create API token** (`account-create-api-token-button`); OAuth **Request new OAuth client** (`account-request-new-oauth-client-button`); both call `onOpenMetaConsumerRegistration` → `META_OAUTH2_CONSUMER_REGISTRATION_URL` in a new tab (same URL; `aria-label` via `externalLinkAccessibleLabel`; does not insert a key into the local placeholder list). Application cards show Client ID only (**no** Client secret on the card — secret is Reset-dialog-only; **no** write-token `CdxMessage`). List-element cards (`.account-token-list-item__card` via `AccountTokenListItemLayout`) use `--background-color-neutral-subtle` and exploratory **4px** border radius via **`--fd-explorer-controls-surface-border-radius`** from `page-grid.css` / `config/explorerSurfaces.ts` (not a Codex token; Codex `--border-radius-base` is 2px; under consideration as a future system default — same token as explorer project controls / module rail). Interface copy from banana; **placeholder** row fields from `config/tokenManagement.ts` are external (BiDi-isolated).
- **Vertical rhythm:** `.account-page` column gap is **`--spacing-200` (32px)** between title, sections, and logout. Adjacent Personal → OAuth sections use **`--spacing-250` (40px)** total (page gap plus `.account-page__section + .account-page__section` remainder in `account.vue`). Inner section stack (intro / list or empty / Meta CTA) stays **`--spacing-150`**; intro itself is heading + **one** description/learn-more paragraph (`--spacing-75` between heading and that paragraph only). See `DESIGN_REQUIREMENTS.md` → Account dashboard.
- **Reset confirmation:** Quiet Reset opens `AccountResetApiKeyDialog` (`CdxDialog`). Confirm step (Figma `626:7921`) warns; primary Reset regenerates **placeholder** secrets via `useDeveloperTokenDashboard` → `prototypeDeveloperTokens.regenerate*` (`createPrototypeClientSecret` / `createPrototypeRefreshToken` in `config/tokenManagement.ts`; client id preserved) and advances to the success step (Figma `633:7695`). Success UI: intro + three rows (**Client ID**, **Client secret**, **Refresh token**) in a subtle panel (`--background-color-neutral-subtle`, exploratory **4px** radius via **`--fd-explorer-controls-surface-border-radius`** — same as list-element cards / explorer surfaces; not a Codex token; under consideration as a future system default; `--spacing-75` padding; `--spacing-50` between rows; **label above value**, copy top-aligned with value) with bold banana labels (`--font-weight-bold`), BiDi-isolated monospace values (`dir="ltr"`), quiet copy (`AccountResetCredentialCopyButton` → `useCopyWithCopiedTooltip` + `CdxTooltip` “Copied!”; button must not remount after click), and inline warning `CdxMessage`. Section stack uses `--spacing-100` (16px) between intro, credential list, and warning. **Done** / close dismisses. Open/step/credential state lives in `useAccountResetApiKeyDialog`. **Credentials shown after Reset are not real.**
- **Sign out:** Destructive `CdxButton` — clears OAuth + placeholder session and navigates home.

**Account token list UI** (`app/components/account/`): `AccountDeveloperTokenList` / `AccountOAuthConsumerList` render Figma “List-element” cards via `AccountTokenListItemLayout` (header row with title + quiet Reset; **no Delete** until revoke backend; personal cards show Issued | Status | Permissions; application cards add description, Client ID (`dir="ltr"`), and meta — **no** Client secret on the card, **no** write-token `CdxMessage`). Card chrome: `--background-color-neutral-subtle` + exploratory **4px** radius (`--fd-explorer-controls-surface-border-radius`). Client secret appears only in the Reset success dialog (users cannot reveal it from the list). `AccountResetApiKeyDialog` wraps Codex `CdxDialog` (confirm then success); success rows use `AccountResetCredentialCopyButton` (quiet `cdxIconCopy` + stable mount + `CdxTooltip`).

---

## Shell section navigation (start column)

The **start column** is **always mounted** on every page. At tablet+, the grid track is normally **281px** wide when navigation is expanded; it collapses to **0** width when primary nav does not fit (see **Responsive navigation collapse** below). It shows a **route-aware section menu** when config defines sections; otherwise the panel renders **empty** (e.g. **Tools and bots**). The **APIs** primary section (`apis`) — catalog `/apis` (section overview, like `/get-started`), `/apis/…`, and explorer `/explorer` / `/explorer/…` — always uses `config/explorerSideNav.js`. The start-column section heading for explorer mode links remains **API Explorer** (`explorer-side-nav-api-explorer-title`). Routes without a section config entry still get an empty panel (`section-nav-site-label`).

**Link behaviour:** On **content routes** under other primary tabs, section items resolve `to` from `href` when set (otherwise placeholders). On the **APIs** section menu, items with **`mode`** resolve via `pathForExplorerMode()` / `explorerModeFromPath()`; items with **`href`** resolve via `resolveContentHref()` and activate when the locale-agnostic path matches; items with **`enabled: false`** are omitted; items with neither `mode` nor `href` remain placeholders. `ShellSidePanelNav` calls **`navigateTo(item.to)`** on click when `to` is set — URL resolution stays in the composable; the component only handles the click. See `DESIGN_REQUIREMENTS.md` → Start column section navigation.

```
Route path
    ↓
getMainNavigationIdFromPath()     ← app/utils/contentRoute.ts
    (explorer → `apis`; `/apis` (+ children) → `apis`)
    ↓
usePageSectionNav()
    ├── `apis` (catalog or explorer) → config/explorerSideNav.js
    │     (filter enabled; mode → pathForExplorerMode; href → content)
    └── other main nav id → config/sectionNavigation.js (sections may be empty)
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

**Codex exception — `CdxMenuItem` outside `CdxMenu`.** `ShellSidePanelNav` renders `CdxMenuItem` **outside** a floating `CdxMenu`. Codex documents menu items as menu-only; this is an intentional shell-chrome exception approved for the side panel (static list, not a dropdown) and for the collapsed overlay primary list in **`ShellCollapsedNavMenuOverlay`**. (Legacy **`ExplorerModuleRail`** endpoint rows used the same pattern; that rail is not mounted while Scalar’s native sidebar is on — PR #40.) Optional prop **`omitSectionTitleMatching`** suppresses a section heading when the collapsed overlay back control already shows that label. See `DESIGN_REQUIREMENTS.md` → Start column section navigation.

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

**Expanded (drawer on widen).** `app/assets/css/shell-start-nav-reveal.css` animates the element with class **`shell-side-panel--start`** (must be present on the start panel wrapper in `default.vue`) **only** while **`.frontdoor-shell--nav-drawer-expanding`** is set (`useShellNavigationCollapse` → true for `SHELL_NAV_DRAWER_EXPAND_DURATION_MS` after collapsed → expanded):

1. **Grid track** grows `0` → `281px` + gutter restored — **pushes** `.fd-page-grid__body`.
2. **Fixed-width panel** (281px) slides in from inline-start inside the clipping track (`transform: translate3d(±100%, 0, 0)` → `0`; RTL mirrored).
3. **Border** width `0` → `1px` on **`.frontdoor-shell__side-panel--start`** (scrollport panel, not the grid track).

Codex **transition** tokens: `--transition-duration-medium` (250ms), `--transition-timing-function-user` (`ease-out`). `prefers-reduced-motion: reduce` disables transitions. Collapse does **not** animate. **Route / `sidebar: false` changes are also instant** — platform landing and other `sidebar: false` pages use a zero-width start track like collapse, but must not reuse the drawer expand transition when navigating to/from them (content must not slide to make room for section nav).

**Drawer vs scroll (do not conflate).** Drawer animation requires a **clipping track** and fixed **281px** panel width, but must not disable the section-nav **scrollport**. Rules:

| Viewport | Scroll container | Drawer clip |
|----------|----------------|-------------|
| **Tablet+** | `.frontdoor-shell__side-panel--start` (`overflow-block: auto`, `flex-shrink: 1`, `min-block-size: 0`) | `.fd-page-grid__start` (`overflow: hidden`); panel `transform` slide |
| **Mobile** | `.fd-page-grid__start` (`overflow-y: auto`, `max-block-size: 40dvh`) | `overflow-inline: hidden` when expanded; `overflow: hidden` when collapsed |

**Collapsed overlay (click).** When collapsed, the hamburger toggles **`ShellCollapsedNavMenuOverlay`** (`useShellCollapsedNavMenu`) — teleported to `<body>`, **`z-index: 20`** (above `.frontdoor-shell__chrome-band` at **10**). Full-viewport **`--background-color-backdrop-light`** mask; start-side panel at **`--fd-layout-start-panel-inline-size` (281px)** with **`border-inline-end`** (`--border-color-muted`), **`padding-block-start: --spacing-100`**, **`::after` scroll-end spacer (`--spacing-200`)** on the panel scrollport (symmetric with in-shell start nav). **Section view (default when sections exist):** quiet small back `CdxButton` with **`cdxIconPrevious`** (`flip-for-rtl`) showing the active primary section label; **`gap: var(--spacing-50)`** between back control and first menu item; **`ShellSidePanelNav`** reuses start-column links with **`omitSectionTitleMatching`** so the primary section heading is not duplicated. **Primary view:** flat `CdxMenuItem` list of main tabs (including **APIs** → `/apis`) — same **Codex exception** as `ShellSidePanelNav`. Selection calls `navigateTo()` from `default.vue` then closes the overlay. **Dismiss:** backdrop click, Escape, route change, or nav expand. Document scroll lock: `html.shell-collapsed-nav-menu-open` in `shell-collapsed-nav-menu.css`. Figma [25:1929](https://www.figma.com/design/zaMJ5QqulosJKuoHE2gCKK/Off-wiki-page-templates?node-id=25-1929).

**Source:** `app/composables/useShellCollapsedNavMenu.ts`, `app/composables/useShellNavigationCollapse.ts`, `app/composables/useShellNavigationBreadcrumbs.ts`, `app/components/shared/ShellCollapsedNavigation.vue`, `app/components/shared/ShellCollapsedNavMenuOverlay.vue`, `app/assets/css/shell-collapsed-nav-menu.css`, `app/assets/css/shell-start-nav-reveal.css`, `config/shellNavigation.ts`, `app/layouts/default.vue`, `i18n/*` (`shell-collapsed-nav-menu-*`).

---

## Scalar native endpoint sidebar (API Explorer)

**Decision (PR [#40](https://github.com/mooeypoo/poc-wikimedia-frontdoor/pull/40)):** Community Explorer does **not** use the custom end-column **module rail** (`ExplorerModuleRail`). Endpoint browsing is Scalar’s built-in operation sidebar (`showSidebar: true` via `EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR` in `config/explorerInternalSidebarExperiment.ts` and `config/scalar.ts`).

**Layout.**

```
REST API module select (CdxSelect) → selectedModuleName
       ↓
useExplorerOptInFilteredModules → visibleSelectedModule / visibleOpenApiSpecUrl
       ↓
useScalarConfig → ApiReference (showSidebar: true)
       ↓
Scalar native sidebar lists operations for the loaded OpenAPI document
```

On `/explorer` when the flag is on, the shell adds **`frontdoor-shell--explorer-internal-sidebar`**: the end column is collapsed and the main column (project controls + Scalar reference) takes the full body width (`app/layouts/default.vue`). Enterprise modes already relied on Scalar’s sidebar; community now matches that pattern for endpoints.

**Surfaces.** **`ExplorerProjectControls`** uses **`--fd-explorer-controls-surface-background-color`** / **`--fd-explorer-controls-surface-border-radius`** from `config/explorerSurfaces.ts` (shared with account cards, NavigationCard, CodeBlock / CodeTabs, Highlight, Test Request dialog). The former rail no longer shares that surface in the live UI.

**Deep-link / operation focus.** URL and bootstrap deep-links still set a pending operation target; **`useExplorerScalarFocus`** scrolls the Scalar reference panel to the matching operation (same resolution helpers as before). Everyday endpoint navigation is owned by Scalar’s sidebar — not a frontdoor `CdxMenuItem` list.

**Legacy module rail (not product UX).** `ExplorerModuleRail.vue`, `useExplorerModuleRailPlacement`, `useExplorerModuleRailInlineEndpointScrollCap`, and `config/explorerModuleRail.ts` remain in the tree for rollback (`EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR = false`). Do not document or extend that path as the current Explorer experience. See `DESIGN_REQUIREMENTS.md` → Scalar native endpoint sidebar.

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
            └── .frontdoor-shell__side-panel--end   ← reserved space (desktop+); collapsed on community Explorer when Scalar native sidebar is on
```

**Page grid (tablet+).** Two outer tracks: **start** + **body**. The body band contains a **main:end** sub-grid (`4fr | 1fr` at desktop) in `default.vue`. The site footer lives **inside** `.frontdoor-shell__content` (main track only). **`.frontdoor-shell__body-scroll`** is the vertical scrollport for main + end — scrollbar at the **inline-end** edge of the body band; wheel over the empty end column scrolls central content (Discord-style). On short pages, `.frontdoor-shell__content` uses **`min-block-size: 100%`** plus column flex so the footer sits on the shell bottom. See **Site footer** and **Shell scroll regions** below.

**Landing shell exception:** When `isLandingRoutePath(route.path)` is true, `default.vue` adds **`frontdoor-shell--landing`**: drop page-grid / body-scroll horizontal insets, collapse the end column, and set body-columns **`max-inline-size: none`** so section backgrounds paint full viewport width. Content measure stays inside landing inners (`LANDING_CONTENT_MAX_INLINE_SIZE`). See **Platform landing / home** under Markdown content pages.

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
| `--fd-explorer-controls-surface-background-color` | `var(--background-color-neutral-subtle)` (`config/explorerSurfaces.ts`) | Explorer project controls background (theme-aware) |
| `--fd-explorer-controls-surface-border-radius` | `4px` (`config/explorerSurfaces.ts`) | Shared exploratory corner radius for explorer project controls, account list-element cards, Reset credentials panel, **`NavigationCard`**, **`.fd-highlight`**, **`CodeBlock`**, **`CodeTabs`**, and the Explorer **Test Request** dialog (not a Codex token — Codex `--border-radius-base` is 2px; under consideration as a future system default) |
| `--fd-explorer-test-request-modal-padding` | `var(--spacing-250)` / `EXPLORER_TEST_REQUEST_MODAL_GUTTER_PX` | Test Request dialog gutter (set under `--client-modal-open`) |
| `--fd-explorer-test-request-shell-block-size` | runtime (dialog `scrollHeight` + gutter × 2) | Shell height while Test Request is open; applied by scoped explorer page CSS |
| `HEADER_UTILITY_COLLAPSE_THRESHOLD_PX` | `560px` (`config/headerChrome.ts`) | `ResizeObserver` threshold for compact utility row (search min + controls + **16px** search→preferences + **8px**×2 remaining gaps) |
| `HEADER_LANGUAGE_MENU_VISIBLE_ITEM_LIMIT` | `7` (`config/headerChrome.ts`) | Codex `visibleItemLimit` for interface-language `CdxLookup` menu (scroll after seven rows) |
| `HEADER_LANGUAGE_MENU_ITEM_RENDER_CAP` | `50` (`config/headerChrome.ts`) | Max language options passed to `CdxLookup` before typing narrows further |
| `--fd-layout-body-columns-max-inline-size` | `calc(1679px cap − margins − start − gutter)` | Main:end sub-grid max width at ≥ 1680px (expanded start nav) |
| `--fd-layout-body-columns-collapsed-max-inline-size` | `calc(1679px cap − margins)` | Main:end sub-grid max width at ≥ 1680px when start nav collapsed |

**Page grid slots:** `PageGrid` exposes **`start`** and default **`body`** slots only (no `end` or `footer` grid tracks). The end panel and site footer are composed inside the **body** slot in `default.vue` (`.frontdoor-shell__body-scroll` → `.frontdoor-shell__body-columns`).

Media queries in `page-grid.css` and `default.vue` use **px literals** aligned to Codex tokens (`640px`, `1120px`, `1680px`) plus the project **`1440px`** chrome lock, because custom properties are unreliable inside `@media` conditions in many browsers.

### Shell chrome components

| Component | Role | Config / composable |
|-----------|------|---------------------|
| `ShellHeaderUtilityActions.vue` | Utility row (search, settings→preferences / color theme, language, Log in or username→`/account`; responsive collapse) | `useShellAuthNavigation`, `useShellHeaderUtilityMenu`, `useColorMode`, `useContentSearch`, `config/headerChrome.ts`, `config/colorMode.ts` |
| `ShellHeaderBrand.vue` | Header brand (32px inlined Wikimedia mark + two-line banana wordmark in Montserrat) + label-only warning **Prototype** `CdxInfoChip` (`--spacing-50` after lockup; Figma 1238:24310); home link is mark+wordmark only; **no focus/active outline** on the link (Codex exception #6) | `useMainNavigationLinks()`, `WikimediaLogoMark`, `CdxInfoChip`, `config/brandTypography.ts` |
| `ShellSidePanelNav.vue` | Flat section menu in start column (mounted when sections exist) | `usePageSectionNav()` (`to`, `isActive`); `navigateTo` on click when `to` set; optional `omitSectionTitleMatching` in collapsed overlay |
| `ShellSiteFooter.vue` | Static site footer (main column band) | `config/siteFooter.ts` |
| `ShellCollapsedNavigation.vue` | Collapsed header nav (hamburger + breadcrumbs) | `useShellNavigationBreadcrumbs()`; emits menu toggle; `aria-expanded` when overlay open |
| `ShellCollapsedNavMenuOverlay.vue` | Full-screen collapsed nav overlay (section + primary views) | Props + events from `default.vue`; `ShellSidePanelNav`; `useShellCollapsedNavMenu` state |
| `ShellPrimaryNav.vue` | Codex quiet tabs for primary nav | `usePrimaryNavigationTab()`, `useMainNavigationLinks()` |

**APIs primary tab.** Quiet tab in `ShellPrimaryNav` (`id: apis`, message key `nav-api` → “APIs”, path `/apis` / `API_CATALOG_NAVIGATION_PATH`). `getMainNavigationIdFromPath()` returns **`apis`** for `/apis` (+ children) and for `/explorer` (+ children) so the tab stays selected in both the catalog and the explorer. The explorer destination remains never locale-prefixed (`i18n: false`; `API_EXPLORER_NAVIGATION_PATH`). The start-column section heading on explorer routes remains **API Explorer** (`explorer-side-nav-api-explorer-title`).

**Tab re-selection:** Clicking the already-selected primary tab returns to that section’s landing path (e.g. `/get-started` from a Get started child, `/apis` from `/apis/…` or `/explorer`). Codex `CdxTabs` does not emit `update:active` for a no-op re-select, so `ShellPrimaryNav` listens for clicks on the active tab and re-emits `navigation-select`. Mount-time `v-model` sync is ignored so the explorer does not bounce to the catalog on load. `handlePrimaryNavigationSelect` no-ops only when the route is already the tab’s landing `to`.

### Codex exceptions (shell chrome)

1. **`ShellSidePanelNav`** — renders `CdxMenuItem` **outside** a floating `CdxMenu`. Codex documents menu items as menu-only; approved for this static side-panel list and for the collapsed overlay primary list in **`ShellCollapsedNavMenuOverlay`**. **Additional override (start nav):** non-selected items use custom `:hover` CSS for **`--color-progressive`** text (see **Shell section navigation** — hover colour). **Not** used for explorer **`CdxSelect`** / **`CdxCombobox`** menus — those use Codex’s internal `CdxMenu` and must keep native hover / highlighted / selected behaviour (see **REST API module select** → Codex interaction). Legacy **`ExplorerModuleRail`** endpoint rows used the same outside-`CdxMenu` pattern; that rail is not mounted while Scalar’s native sidebar is on (PR #40). Optional prop **`omitSectionTitleMatching`** suppresses a section heading when the collapsed overlay back control already shows that label. **Navigation:** explorer mode items navigate via **`navigateTo(item.to)`** where `to` is resolved in **`usePageSectionNav()`** — the component does not construct URLs.
2. **`ShellPrimaryNav`** — `CdxTabs` **navigation-only** (tab panels hidden via CSS); route changes via `navigateTo()` on `navigation-select`. Quiet-tabs **header bottom border suppressed** via `shell-primary-nav-overrides.css` (imported from `main.css` after `codex.style-bidi.css`) — `.frontdoor-shell__chrome-band` owns the single header edge (`border-block-end: 1px solid var(--border-color-muted)`) per Figma. **Tab scroll buttons** (`.cdx-tabs__prev-scroller` / `.cdx-tabs__next-scroller`) are **hidden** in the same file — Codex shows them on overflow and they **flicker on first paint** before intersection observers settle; shell chrome will use a separate responsive approach. **Tab label weight:** all labels **`--font-weight-normal`** — Codex sets **700** on every quiet-tab label by default; selected state uses colour/underline only.
3. **Start column edge** — **`border-inline-end`** with `--border-color-muted` on **`.frontdoor-shell__side-panel--start`** when expanded (scrollport panel, not grid track); section dividers in **`ShellSidePanelNav`** use the same token; **`border-inline-end-width: 0`** when collapsed. **Not** the earlier `#F3F3F3` exploratory surface (token retained but unused). See `DESIGN_REQUIREMENTS.md` → Start column chrome.
4. **Start column width** — **281px** drawer panel (Figma 241px + one Codex 40px grid column); grid track width is **0 or 281px** via collapse. **Deviation from Figma** side-panel spec; prototype widening only.
5. **Start nav scrollbar (WebKit physical `width`)** — **`shell-start-nav-scroll.css`** styles `::-webkit-scrollbar` with physical **`width`** because the pseudo-element API has no logical equivalent. **Single scrollport per breakpoint** (panel tablet+, grid track mobile). Transparent track + thin thumb; body band keeps browser-default scrollbars. **Scroll-end inset:** **`::after` block spacer** (`--spacing-200`) on each scrollport — see **Shell section navigation** (scroll-end inset). See **Shell scroll regions**.
6. **`ShellHeaderBrand` wordmark + Prototype chip** — **Montserrat** via `--font-family-brand-wordmark` (Google Fonts, `config/brandTypography.ts`); banana-i18n `brand-wordmark-wikimedia` + **`brand-wordmark-developer-portal`** (translatable). Mark: inlined **`WikimediaLogoMark`** ([Commons Wikimedia-logo_black.svg](https://upload.wikimedia.org/wikipedia/commons/8/8b/Wikimedia-logo_black.svg) with `currentColor` / `--color-base` for light+dark — not `<img>`, which cannot inherit colour). After the lockup: warning **`CdxInfoChip`** label `brand-prototype-chip-label` (**Prototype**); **`--spacing-50` (8px)** gap; **label-only** (hide `.cdx-info-chip__icon--vue` — Codex forces icons on `warning`); chip outside the home `NuxtLink` (Figma 1238:24310). Codex **`v-tooltip`** on a host `<span>` (`brand-prototype-chip-tooltip`: “Test prototype. For internal use only”). **No outline on `:focus` / `:focus-visible` / `:active` / router-active** on the link — product quiet-chrome exception (`ShellHeaderBrand.vue`); `aria-label` from `app-title` remains. Do not reintroduce a focus ring without updating `DESIGN_REQUIREMENTS.md` → Brand logo.
7. **Search field** — `CdxSearchInput` in `ShellHeaderUtilityActions` (`flex: 1 1 auto`, max **40rem**, **256px** min when expanded). `useHeaderUtilityCollapse` (`ResizeObserver` on the utility track) switches to compact mode below `HEADER_UTILITY_COLLAPSE_THRESHOLD_PX` (`config/headerChrome.ts`): search icon, compact language select (icon + code), and `CdxMenuButton` for settings/log in. Collapsed search activation is **deferred**. **Utility option spacing:** `column-gap: var(--spacing-50)` (8px) between options; search → preferences is **`--spacing-100` (16px)** via an extra search-wrap `margin-inline-end`. Brand + utilities share a vertical centerline. **Color theme preferences:** see **Color theme preferences (shell)** below — quiet settings gear (or collapsed menu Settings) opens a content-only `CdxPopover`; former header `CdxToggleButtonGroup` removed.
8. **Interface language `CdxLookup`** — globe + uppercase code `CdxButton` mounts `.shell-header-utility-actions__language-popover` (`v-if`) wrapping the whole Lookup (input + native menu). **`clearable`** enables Codex TextInput clear (attr fallthrough; filter only — committed locale unchanged). **`menu-config.renderInPlace: true`** keeps the menu in the Lookup DOM; first-party CSS then cancels Floating UI **absolute placement** and viewport **`maxHeight`** (those pull the menu out of the popover box and can show “as many rows as fit the screen” when Codex’s `visibleItemLimit` measure races on open). Overrides do **not** restyle Codex menu chrome, TextInput, clear, or start-icon, and do **not** add vertical gap between input and menu (flush / Codex default). Physical **`max-height: none`** appears only to clear Floating UI’s inline physical style. Fallback **`max-block-size`** on `.cdx-menu__listbox` (~7 supportingText rows) if measure has not run. Open waits for popover layout (double `requestAnimationFrame`) before focusing the input. **`visibleItemLimit: 7`** / render cap **50** from `config/headerChrome.ts`. Direction chrome for clearable/start-icon comes from **`codex.style-bidi.css`**, not per-component CSS. See **Interface locale picker** and `DESIGN_REQUIREMENTS.md` → Interface language picker.
9. **`ShellSiteFooter` wordmark** — **Montserrat** via `--font-family-brand-wordmark`; banana-i18n `brand-wordmark-wikimedia` + **`brand-wordmark-developer-portal`** (shared with header, single horizontal line).
10. **`ShellSiteFooter` brand lockup** — Figma uses a horizontal **227×14px** lockup; shell composes **14px inlined `WikimediaLogoMark` + translatable wordmark parts** (`currentColor` / `--color-subtle`) until the footer logo asset ships.
11. **`CdxPopover` arrow/body seam** — Codex places `.cdx-popover__arrow` with Floating UI `top: -9px` (bottom-* placements), which leaves the panel’s top `border` visible across the pointer base. Shared global class **`fd-cdx-popover--arrow-seam-fix`** in `app/assets/css/shell-codex-overrides.css` nudges the arrow to **`top: -8px`** and sets **`box-shadow: none`** so the arrow fill covers that border. Physical **`top`** clears Floating UI’s inline physical style; global CSS is required because `CdxPopover` teleports to `<body>`. Used by header preferences and explorer opt-in help. See **Color theme preferences (shell)**.
12. **`CdxDialog` title/body type** — Dialog titles are `<h2 class="cdx-dialog__header__title">`. Global `h2` rules in `main.css` (margin / line-height) also match that element and can make teleported dialogs look oversized vs the [Codex Dialog demo](https://doc.wikimedia.org/codex/latest/components/demos/dialog.html). `shell-codex-overrides.css` re-asserts Codex title (`--font-size-x-large` / `--line-height-x-large`, zero margin) and body (`--font-size-medium` / `--line-height-medium`) on `.cdx-dialog`.
13. **Write-request confirm dialog (explorer)** — Three product deviations from default `CdxDialog`, all in `explorer-codex-overrides.css` / `ScalarClientWriteRequestConfirmDialog`:
    - **Actions:** Codex footers use `flex-direction: row-reverse` (progressive primary at the **end** of the pair). Keep the action **group end-aligned**, but swap order within the pair: progressive **Confirm** left of neutral **Cancel** (`flex-direction: row` + `justify-content: end`; column stack unchanged below 640px). Rationale: Confirm is harder to hit by habit (reduces accidental live writes) while the footer still reads as end-aligned actions.
    - **Containment:** Teleport `target="#explorer-reference-panel"` (dialog component is a **sibling** of that panel — Vue Teleport cannot target an ancestor of the Teleport source). Backdrop overridden from Codex viewport-`fixed` / `100vw` / `100vh` to `position: absolute; inset: 0` so the overlay circumscribes the Scalar embed only. Physical `width` / `height` / `top` / `left` / `right` / `max-width` / `max-height` clears are required to beat Codex rules (documented in AGENTS.md rule 8).
    - **Title size:** `--font-size-large` (18px) instead of Codex / shell exception #12 `--font-size-x-large` (20px). Body remains `#12` / Codex `--font-size-medium` (16px).
    See **Write-request confirm dialog**.
14. **API to explore audience chips** — Default Codex MenuItem layout can only put audience markers in subtle `supportingText`. Product needs **warning** `CdxInfoChip`s (**beta** / **internal**) beside the module name, with **version** remaining as `supportingText`. `ExplorerProjectControls` therefore uses `CdxSelect` `#menu-item` and `#label` slots with `ExplorerModuleSelectOptionContent`, which recreates Codex `cdx-menu-item__*` text classes and inserts the chips. Chips are **label-only**: Codex forces icons on `warning` status (null `icon` ignored), so `.cdx-info-chip__icon--vue` is hidden in CSS (same pattern as NavigationCard). Hover / highlighted / selected colours stay native Codex (no MenuItem state CSS overrides). Menu teleports to `<body>`, so option layout CSS is unscoped on that component. See **REST API module select**.

### Color theme preferences (shell)

The header **settings** control opens a **preferences** popover for site color theme ([Figma 49:2029](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=49-2029)). Theme persistence and `html.fd-theme--*` classes stay in **`useColorMode`** / **`config/colorMode.ts`** / the FOUC script in `nuxt.config.ts` — the popover only calls `setMode`.

| Surface | Behaviour |
|---------|-----------|
| Trigger (expanded) | Quiet `CdxButton` + `cdxIconConfigure` (`weight="quiet"`); `aria-expanded` tracks popover open state |
| Trigger (collapsed) | Overflow `CdxMenuButton` **Settings** item (`SHELL_HEADER_UTILITY_MENU_VALUE.settings`); popover anchors to the menu button (acceptable while the menu closes) |
| Popover | `CdxPopover` (`placement="bottom-end"`) with class **`fd-cdx-popover--arrow-seam-fix`**; **content only** — no title bar or close button; dismiss via outside click / Escape; **stays open** after a radio selection. **Arrow/body seam:** shared override in `shell-codex-overrides.css` (`top: -8px`, no arrow shadow) — Codex exception #11 |
| Field | `CdxField` with `is-fieldset`; legend banana `color-mode-group-label` (“Color theme”) |
| Radios | `CdxRadio` for each entry in `COLOR_THEME_PREFERENCE_OPTIONS` — **Light → Dark → System default** (`light` / `dark` / `auto`); labels banana `color-mode-*-label` |

**Utility option spacing (expanded):**

| Pair | Token | Size |
|------|-------|------|
| Search → preferences | `--spacing-100` (`column-gap` + search-wrap `margin-inline-end: --spacing-50`) | 16px |
| Preferences → language | `--spacing-50` (`column-gap`) | 8px |
| Language → session | `--spacing-50` (`column-gap`) | 8px |

Collapsed overflow uses the same **8px** `column-gap` between search icon, language, and menu. Collapse threshold gap estimates in `config/headerChrome.ts` must stay aligned with these values.

**Config:** `COLOR_MODES` (storage / class enumeration: `light`, `auto`, `dark`), `COLOR_THEME_PREFERENCE_OPTIONS` (UI order), `COLOR_MODE_STORAGE_KEY`, `DEFAULT_COLOR_MODE` (`auto`) in `config/colorMode.ts`. Dark token overrides: `app/assets/css/color-modes.css`.

**Source:** `app/components/shared/ShellHeaderUtilityActions.vue`; `app/assets/css/shell-codex-overrides.css` (`fd-cdx-popover--arrow-seam-fix`, preferences body padding); `app/composables/useColorMode.ts`; `app/composables/useShellHeaderUtilityMenu.ts`; `config/colorMode.ts`; `i18n/*` (`color-mode-*`).

### Interface locale picker (shell)

The header interface-language control in `ShellHeaderUtilityActions` switches the banana-i18n interface locale (`$setInterfaceLocale`, Vue I18n `locale`). The portal language catalog is the full Wikimedia set (~575; `config/languages.ts`); locales without content or interface strings fall back through the chain to English (see `docs/adr-language-catalog.md`).

**Display pattern:**

| Surface | Behaviour |
|---------|-----------|
| Trigger | Quiet `CdxButton` — `cdxIconLanguage` + uppercase BCP 47 code in `<bdi>` ([Button with icon](https://doc.wikimedia.org/codex/latest/components/demos/button.html#with-icon); native gap/color/typography, no first-party icon/label overrides) |
| Popover | `.shell-header-utility-actions__language-popover` (`v-if`) wraps the full `CdxLookup` (input + menu in normal flow, flush — no added gap) |
| Menu | Native Codex `CdxMenu` chrome; **7** visible rows then scroll (`visibleItemLimit`); Floating UI viewport `maxHeight` / absolute placement cancelled so the popover can contain the menu; CSS listbox fallback cap if measure races; up to **50** items rendered until typing narrows |
| Clear | Codex TextInput **`clearable`** via Lookup attr fallthrough — clears the filter input only; committed interface locale unchanged until a menu selection |

**Open / close:** Clicking the trigger mounts the popover, waits for layout, then focuses the Lookup input (so `visibleItemLimit` can measure). Focus-out of the language control, Escape, or a selection closes it. Menu-item clicks keep focus (Codex prevents blur on option mousedown), so they do not close the popover early.

**BiDi:** Autonyms use Codex MenuItem `language` for correct `lang`; trigger code is `<bdi>`-isolated.

**Routing:** On content routes, changing locale navigates via `switchLocalePath()` when the path differs. On `/explorer`, locale updates in place without URL prefix change — see `DESIGN_REQUIREMENTS.md` → Interface locale on explorer.

**Direction changes:** `:key="direction"` on the lookup remounts the control when interface locale flips LTR ↔ RTL. Codex direction chrome follows `<html dir>` via `codex.style-bidi.css` (see **RTL and BiDi** below).

**Config:** `HEADER_LANGUAGE_MENU_VISIBLE_ITEM_LIMIT` / `HEADER_LANGUAGE_MENU_ITEM_RENDER_CAP` in `config/headerChrome.ts`.

**Utility row layout (row 1):** `.frontdoor-shell__header-top` / `.frontdoor-shell__chrome-utility-band` is **`justify-between`**: `ShellHeaderBrand` (inline-start) and `ShellHeaderUtilityActions` (inline-end, `flex: 1 1 auto`). **Gap between logo and utilities: `var(--spacing-150)` (24px).** Brand and utilities are **vertically centered** on the row (`align-items` / `align-self: center`). Expanded utilities: search (`flex: 1 1 auto`, **256px** min, max **40rem**), **quiet** settings, compact language trigger (globe + code), log in — with **`column-gap: var(--spacing-50)` (8px)** between options and **`--spacing-100` (16px)** between search and preferences (`margin-inline-end` on the search wrap). Collapsed: search icon button + language trigger + `CdxMenuButton` (`cdxIconEllipsis`), **8px** gap. See `DESIGN_REQUIREMENTS.md` → Shell chrome.

**Primary nav row (row 2):** `.frontdoor-shell__primary-nav-row` — quiet tabs (`flex: 0 1 auto`, intrinsic width) plus the **API Explorer** progressive link (`flex: 0 0 auto`) on the same baseline, **24px** (`--spacing-150`) after the last tab. See `DESIGN_REQUIREMENTS.md` → Shell chrome.

**Source:** `app/layouts/default.vue` (`selectedInterfaceLocale`); `app/components/shared/ShellHeaderUtilityActions.vue`; `config/headerChrome.ts`; `config/colorMode.ts` (preferences radio order).
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
| Settings button | **Implemented** — preferences popover / color theme (`useColorMode`); see **Color theme preferences (shell)** |
| Log in link | **Functional** Meta OAuth + PKCE (see Header auth) |
| Brand logo SVG | **32px inlined `WikimediaLogoMark`** ([Commons](https://upload.wikimedia.org/wikipedia/commons/8/8b/Wikimedia-logo_black.svg), `currentColor`) **+ banana wordmark** (Montserrat) **+ label-only Prototype warning chip**; not single-path lockup |
| Primary nav + start column collapse | **Implemented** — `useShellNavigationCollapse`; hamburger + breadcrumbs; start drawer on expand (`shell-start-nav-reveal.css`) |
| Collapsed hamburger menu overlay | **Implemented** — `useShellCollapsedNavMenu`; `ShellCollapsedNavMenuOverlay`; backdrop-light; `cdxIconPrevious` back; `omitSectionTitleMatching`; **`::after` scroll-end spacer (`--spacing-200`)**; `shell-collapsed-nav-menu.css` scroll lock |
| Header container-query search collapse | **Implemented** | `ShellHeaderUtilityActions` — 256px search min; `CdxMenuButton` for settings/log in |
| Collapsed search button activation | **Deferred** | Icon visible; overlay/expansion behaviour not defined |
| Header vs body width at ≥ 1440px | Inner header locks to grid content width at 1440px; page grid caps at 1680px — **may need alignment** |
| Codex direction CSS | **`codex.style-bidi.css`** globally (`nuxt.config.ts`) — `[dir]`-scoped; replaces LTR+RTL sheet toggle |
| Interface language `CdxLookup` | **Implemented** — globe + code trigger; popover wraps Lookup; `clearable`; `visibleItemLimit: 7` / render cap **50**; Floating UI cancel so popover contains menu (Codex exception #8); no TextInput chrome overrides |

Functional in prototype: interface language `CdxLookup`, content search (`useContentSearch` + `SharedSearchResults`), primary nav tab routing, **explorer start-column mode links** (`usePageSectionNav` + `ShellSidePanelNav`).

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

The Vue component is mounted in `app/pages/explorer/[[view]].vue` inside a **`<ClientOnly>`** wrapper (required by `AGENTS.md`). The implementation uses `ExplorerScalarReference.client.vue`, which imports `@scalar/api-reference` and is only ever rendered on the client-only `/explorer` route (`ssr: false`). Optional path segment selects **enterprise mode** (`/explorer/enterprise`, `/explorer/enterprise-custom`) — see **Explorer modes and start-column routing** below.

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

**Default module:** On bootstrap and when opt-in hides the current module, **`resolveFirstExplorerRailModule()`** (`app/utils/explorerModuleOptInFilter.ts`) picks the first module **without `hasSpecError`** in discovery order, using **`DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS`** from `config/explorerOptIn.ts` on initial load (beta **on**, internal **off**). Internal-audience modules such as `discord/v0-internal` are therefore excluded from the default select and Scalar target. This keeps the select default and Scalar spec aligned.

Select menu labels use each module’s **`headingTitle`** (external string) via `isolatePickerLabel()`. Stored value is the discovery **module name** (for example `-`, `readinglists/v0`, `attribution/v0-beta`, `discord/v0-internal` when internal opt-in is on).

**Menu item description:** Summary in Codex MenuItem **`description`**. Extracted from each module spec’s OpenAPI **`info.description`** during bootstrap (`normalizeOpenApiModuleDescription(moduleDescription, moduleName)` in `app/utils/explorerModuleDescription.ts`); not truncated — long text wraps in the dropdown. Configured **suffix strip patterns** in `config/explorerModuleDescriptions.ts` (`EXPLORER_MODULE_DESCRIPTION_OPENAPI_SUFFIX_STRIP_PATTERNS`, for example `site/v1` access boilerplate and `attribution/v0-beta` docs / framework links) run after markdown normalization. Curated banana-i18n fallbacks in the same config file when the spec omits a description. Display strings use `isolatePickerLabel()` for BiDi isolation.

**Project controls row 2 spacing:** REST API module **`CdxSelect`** and Opt-in fieldset sit in **`.explorer-project-controls__module-row`** with **`column-gap: var(--spacing-150)`** (24px) and **`row-gap: var(--spacing-100)`** when wrapped. See `DESIGN_REQUIREMENTS.md` → REST API module select + opt-in.

**Menu item supporting text:** Version only — isolated `versionChipLabel` via **`formatExplorerModuleSelectSupportingText()`** (`app/utils/explorerModuleRailHeading.ts`). Trailing `-beta` / `-internal` audience suffixes are stripped from the version label because those audiences render as warning chips instead.

**Menu item audience chips (Codex exception #14):** Beta and internal modules show warning **`CdxInfoChip`**s beside the module name (banana `explorer-module-beta-chip-label` / `explorer-module-internal-chip-label`) via custom Select slots in `ExplorerProjectControls` / `ExplorerModuleSelectOptionContent`. Chips are **label-only** — hide `.cdx-info-chip__icon--vue` under `.explorer-module-select-option__audience-chip` (Codex forces icons on `warning` and ignores null `icon`; same pattern as NavigationCard catalog chips). Beta when `showBetaChip` or `isExplorerBetaOptInModule()`; internal when `isExplorerInternalOptInModule()` (e.g. `discord/v0-internal`). Module title and version use `<bdi>`; chip labels are banana interface strings (no `<bdi>`).

**Codex Select configuration:** **`default-label`** from banana-i18n `explorer-module-placeholder`. **`menu-config`**: `{ boldLabel: true, hideDescriptionOverflow: false }` — descriptions wrap to multiple lines in the dropdown ([Codex Select demos](https://doc.wikimedia.org/codex/latest/components/demos/select.html)). Menu item state (hover background, keyboard **`highlighted`**, **`selected`** progressive text) is owned by Codex; **`app/assets/css/main.css`** may only adjust floating-menu **z-index** and list-style resets under `.explorer-page` — **do not** override `.cdx-menu-item__content` or highlighted/selected colours (regression fixed after descriptions landed).

Endpoint browsing for the loaded module is Scalar’s native sidebar (`showSidebar: true`). Deep-links may still call `selectModule` with an optional operation focus target.

### Spec resolution flow

```
User selects: wiki instance (project + language picker) + REST module (API to explore select)
       ↓
useExplorerBootstrap → GET /api/explorer-bootstrap?wikiInstanceId=…
       ↓
Server: discovery → fetch each module OpenAPI spec → modules[] with specUrl, operations, headingTitle, moduleDescription
       ↓
useExplorerOptInFilteredModules → visibleModules, visibleOpenApiSpecUrl
       ↓
useScalarConfig(visibleOpenApiSpecUrl)   ← reactive Scalar configuration (showSidebar: true)
       ↓
<ApiReference :configuration="scalarConfig" />  ← Scalar native sidebar lists operations
```

Per-module language-level spec fallback (`useSpecUrl` + `config/languages.js`) is reserved for a later phase; community explorer uses discovery spec URLs as returned for the selected instance.

**Offline module source of truth (distinct from the runtime flow above).** The `generate-module-source-of-truth` script runs this same discovery flow offline across the whole public fleet to produce committed data in `config/generated/` — the fleet registry, the unique modules and which instances expose each, and each module's full OpenAPI spec — consumed via `config/moduleSourceOfTruth.ts`. It feeds future features (a module registry, LLM entrypoints, search/sitemap discoverability), not the live explorer, which still resolves specs at runtime. See `docs/adr-module-source-of-truth.md`.

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

When `Object.assign` is insufficient (route-boundary entry, recovery from a stuck mount), the explorer page remounts `ExplorerScalarReference` using `:key="scalarReferenceKey"` (route path + instance + module + mode + spec URL). It is keyed on `route.path`, **not** `route.fullPath`, so deep-link operation-hash writes do not remount Scalar (see Deep-linking). This is an explicit, documented exception to config-only updates — see `AGENTS.md` failure signals.

On that remount the page sets **`isScalarReady = false`** and **`scalarInterface = null`**. Clearing the interface handle is required so `useScalarClientModalBackgroundScrollLock` releases Test Request shell-clamp state: Scalar often tears down the client modal without emitting `ui:close:client-modal`, which otherwise left `--fd-explorer-test-request-shell-block-size` at gutter-only height (~80px) after switching **API to explore**.

### Scalar operation focus (deep-link / pending target)

Everyday endpoint navigation uses **Scalar’s native sidebar**. Front Door still drives programmatic focus when bootstrap (or a deep-link) sets a **pending operation target** — for example landing on a module+operation URL. That path is application behaviour: bootstrap holds the target; **`useExplorerScalarFocus`** navigates Scalar once the spec is mounted.

```
Deep-link / selectModule(…, { operationTarget })
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
scrollOperationIntoView() — .frontdoor-shell__body-scroll (natural-height specs)
```

**Resolution strategy.** Scalar assigns each operation a navigation id (typically `{document}/tag/{tag}/{METHOD}{path}` or `{document}/{METHOD}{path}`). `scalarOperationNavigation.ts` mirrors that id generation (GitHub slugger for segments) and searches, in order: the workspace navigation tree exposed by `ApiReference`, sidebar items, then the DOM under the Scalar shell. Candidates are tried until an element with a matching `id` exists.

**Timing and retries.** Operations are lazy-loaded in Scalar; the target node may not exist immediately after a spec switch. `useExplorerScalarFocus` polls every 100ms for up to 5s, re-emitting `scroll-to:nav-item` and scrolling **`.frontdoor-shell__body-scroll`**.

**Triggers.** Focus runs when:

- A pending operation target is set and Scalar is already ready
- Scalar finishes switching modules (`isScalarSwitching` false → true transition)
- `ApiReference` exposes `eventBus` / workspace handles (`@interface-ready` on `ExplorerScalarReference`)

**Same-module targets.** Focusing another operation in the **already active** module does not reload the spec (`selectModule` skips `startScalarSwitch` when the module name is unchanged).

**UI reference.** Scalar sidebar behaviour is product-owned by `@scalar/api-reference`. Implementation: `useExplorerScalarFocus.ts`, `app/utils/scalarOperationNavigation.ts`, `tests/scalarOperationNavigation.test.mjs`. Legacy rail click → focus is dormant while `EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR` is true.

### Scalar shell overflow and resize

**`.explorer-page__scalar-shell`** (`app/pages/explorer/[[view]].vue`):

| Axis | Behaviour |
|------|-----------|
| **Block** | `overflow-block: visible` — specs grow with content (no sticky faux-iframe height lock). Vertical scroll is **`.frontdoor-shell__body-scroll`**. |
| **Inline** | `overflow-inline: clip` — contain horizontal bleed after resize |

**Rationale.** Product trial: present Scalar without a height-capped “iframe” shell so scrolling the Explorer page scrolls the full spec. Scalar introduction rows and sample **`pre`** blocks use Tailwind **`w-fit`** / **`nowrap`** and can exceed the shell width after a viewport resize; **`overflow-inline: clip`** contains that bleed while preserving a normal **`border`** on all four sides.

**Codex overrides** (`app/assets/css/explorer-codex-overrides.css`): **`.scalar-app`** uses **`min-inline-size: 0`** and **`max-inline-size: 100%`**; introduction **`.introduction-card-item`** rows and sample **`pre` / `pre code`** cap width with **`overflow-inline: auto`** so wide curl snippets scroll inside the sample instead of widening the page.

**UI reference.** `DESIGN_REQUIREMENTS.md` → Scalar shell containment.

### Scalar Test Request modal sticky headers

**Issue.** In Scalar’s API client modal (`.scalar-client`), section titles use `.request-response-header` with `sticky top-0` and `bg-b-1` but **no z-index** (`@scalar/api-client` `ViewLayoutSection`). Request/response body siblings (`position: relative`) paint over the sticky title on scroll, so the endpoint name looks transparent and overlaps parameter rows.

**Workaround.** `app/assets/css/explorer-codex-overrides.css` sets `z-index: 1` on `.explorer-page .scalar-client .request-response-header`, keeping Scalar’s opaque `bg-b-1` background. Scoped to the Test Request modal only.

**FRAGILITY:** Class names are Scalar Tailwind / component classes — re-verify on `@scalar/api-client` / `@scalar/api-reference` upgrades.

**UI reference.** `DESIGN_REQUIREMENTS.md` → Scalar shell containment.

### Scalar Test Request modal (natural height)

**Issue.** Specs use **natural height** (page scroll). Scalar’s `ApiClientModal` defaults to viewport caps (`90svh` / `h-dvh`), a full-viewport exit layer (`100vw` / `100vh`), and a close control nested in the modal header (`fixed top-2 right-2`). The modal mounts inside `.explorer-page__scalar-shell` (`transform: translateZ(0)` containing block).

**Product intent (UI exploration).** Improve the flow of consulting OpenAPI specs and interacting with the Test Request sandbox on the same Explorer page:

- Test Request modal **grows with its content** — no viewport height cap. Tall modals scroll with **`.frontdoor-shell__body-scroll`**.
- **`.scalar-app-exit`** dims the **entire Scalar reference panel** (`.scalar.scalar-app` / shell), not only the dialog box.
- Dialog sits in a **`--spacing-250` (40px)** gutter (`EXPLORER_TEST_REQUEST_MODAL_GUTTER_PX` / `--fd-explorer-test-request-modal-padding`); **`.app-exit-button`** sits in the block-start / inline-end gutter with **4px** (`--spacing-25`) inset from `.scalar.scalar-app`.
- Dialog corner radius uses exploratory **4px** **`--fd-explorer-controls-surface-border-radius`** (shared with explorer controls / account cards — not a Codex token).
- While open, **shell block size = dialog `scrollHeight` + vertical gutter** (40px × 2) via **`--fd-explorer-test-request-shell-block-size`**, with **`overflow-block: clip`** so page scroll cannot continue into the OpenAPI document under the overlay. Content above the shell and the site footer remain reachable. Closing restores natural-height specs scroll.
- **Spec remount while Test Request is open:** Changing module / instance / mode remounts `ExplorerScalarReference` (`scalarReferenceKey`). The page nulls **`scalarInterface`**; the scroll-lock composable clears the open class and shell-height CSS variable (without forcing page-scroll restore). Do not rely on Scalar emitting `ui:close:client-modal` during remount.
- **Documented exception — shell clip while Test Request is open:** scoped `explorer/[[view]].vue` sets shell **`block-size` / `max-block-size` / `min-block-size: 0` / `overflow-block: clip`**. Unscoped `explorer-codex-overrides.css` cannot beat `[data-v-*]` for those properties. Height matches the dialog, so this does **not** create a second scrollbar inside Test Request (unlike viewport-capping the shell).

**Workaround.** `useScalarClientModalBackgroundScrollLock(scalarShellRef, scalarInterface)` (wired from `app/pages/explorer/[[view]].vue`) + overlay CSS in `explorer-codex-overrides.css` + **scoped** shell clamp in `[[view]].vue`:

| Mechanism | Role |
|-----------|------|
| Scalar `ui:open:client-modal` / `ui:close:client-modal` | Primary open/close signal — **no** body-wide MutationObserver (that freezes the explorer tab during Scalar mount). Remount cleanup does **not** wait for `ui:close` (see shell height clamp) |
| Scroll page so shell top is in view; restore page `scrollTop` on close | Modal mounts at the shell top — bring it into view. Remount-forced clear skips scroll restore so module switching does not jump the page |
| Shell height clamp (`ResizeObserver` on dialog) | Sets **`--fd-explorer-test-request-shell-block-size`** from dialog **`scrollHeight`** + block gutter; updates ignored below **`EXPLORER_TEST_REQUEST_SHELL_BLOCK_SIZE_UPDATE_THRESHOLD_PX`** (`config/explorerSurfaces.ts`) to avoid 1px/s feedback loops; ignores collapsed dialog heights (&lt; gutter) so remount teardown cannot clamp to ~80px. Clamp + **`overflow-block: clip`** live in **scoped** `explorer/[[view]].vue` styles. Spec remount: page sets **`scalarInterface = null`** on `scalarReferenceKey` change; composable clears open class + CSS variable |
| Dialog missing after open | If `[role="dialog"]` never appears within the mount-frame budget, release the clamp (same remount / teardown failure mode) |
| Overlay / container geometry | `.scalar.scalar-app` and `.scalar-container` use **`height: auto`** (not `100%` of shell) with **`min-height: 100%`** so dialog measurement is not circular; container **`padding: var(--spacing-250)`**; exit absolute to the container (not `100vw`/`100vh`); overlay **`z-index: 10000`**; clears Scalar **`90svh` / `h-dvh` / `calc(100% - 120px)`** |
| Close control + dialog chrome | Close button fixed at block-start / inline-end with **4px** (`--spacing-25`) inset from `.scalar.scalar-app` (Scalar stock `p-2` size); dialog **`border-radius: var(--fd-explorer-controls-surface-border-radius)`** + **`overflow: hidden`** on the dialog only (clips square `.bg-b-1` children) |
| Dialog `inert` while shell chrome is used | Scalar `useFocusTrap` (`allowOutsideClick: true`) still reclaims focus on `focusin`, which immediately dismisses header **preferences** `CdxPopover`. Capture-phase `pointerdown` outside `.explorer-page__scalar-shell` sets **`inert`** on `.scalar-client[role="dialog"]`. Cleared on shell pointerdown (with `elementFromPoint` retarget to `.app-exit-button` — inert skips hit-testing on the close control), when preferences are dismissed after a theme change, or when the modal closes |

**Does not** freeze `.frontdoor-shell__body-scroll` with `overflow: hidden` or viewport-cap the modal; page scroll remains the travel mechanism for tall sandboxes, content above the shell, and the site footer.

**FRAGILITY:** Depends on `.scalar-client[role="dialog"]`, Scalar modal class names (`.scalar-container`, `.scalar-app-layout`, `.scalar-app-exit`, `.app-exit-button`), Tailwind height utilities, scoped vs unscoped CSS specificity for the shell clamp, Scalar’s focus-trap behaviour, and remount emitting (or not) `ui:close:client-modal` — re-verify on `@scalar/api-client` upgrades.

**UI reference.** `DESIGN_REQUIREMENTS.md` → Scalar shell containment → Test Request UI exploration.

### Explorer modes and start-column routing

Enterprise explorer experiences share the unified start column with community mode. Mode is encoded in the URL (`app/utils/explorerRoute.ts`):

| Mode | URL path | Main content |
|------|----------|--------------|
| `community` | `/explorer` | Community Scalar explorer (`useExplorerBootstrap`) |
| `enterprise-full` | `/explorer/enterprise` | Full enterprise Scalar spec (`useEnterpriseExplorer`) |
| `enterprise-custom` | `/explorer/enterprise-custom` | Custom tag-driven viewer (`ExplorerEnterpriseCustom`, `useEnterpriseSpecOutline`) |

**Enterprise spec source:** The Enterprise OpenAPI spec is bundled in the repo at `server/assets/wme-api.yaml` and served from the local system — `server/api/enterprise-spec.get.ts` reads it via Nitro server-asset storage (`useStorage('assets:server')`) and returns YAML for Scalar; `server/api/enterprise-spec-parsed.get.ts` reads the same asset and returns the tag-grouped JSON outline for the custom viewer. There is no remote fetch (the previous upstream endpoint is no longer available).

**Side nav:** `config/explorerSideNav.js` lists sections and items; items with a **`mode`** field are wired by **`usePageSectionNav()`** → **`ShellSidePanelNav`**. Active state and paths are derived from the route — not from `isActive` flags in config. **`ExplorerSideNav.vue`** is superseded and not mounted. **`useExplorerMode()`** exposes the reactive mode for the explorer page and breadcrumbs.

**SPA note:** Sub-routes under `/explorer/*` stay within the explorer boundary; the full-reload plugin in `explorer-route-navigation.client.ts` applies only when entering or leaving `/explorer` from content routes.

### Route boundary navigation

The explorer route uses `ssr: false`. Client-side Vue Router transitions **to or from** `/explorer` can leave Scalar DOM in the shell or prevent ApiReference from mounting. Two mitigations work together:

1. **`app/plugins/explorer-route-navigation.client.ts`** — `router.beforeEach` calls `window.location.assign()` when crossing the explorer boundary (full document navigation). Skips the router’s **initial** navigation (`from.matched.length === 0`) and skips when `window.location.pathname` already matches the target (avoids full-reload loops on hard load / same-URL assign).
2. **`app/app.vue`** — `<NuxtPage :page-key="resolvePageKey" />` remounts the page component across route boundaries. Within the explorer the key is the **mode path** (`/explorer`, `/explorer/enterprise`, `/explorer/enterprise-custom`), so a single page instance persists across in-explorer deep-link URL updates (quick→direct canonicalization, instance/module/operation changes) and their notices are not torn down; non-explorer routes key on `fullPath`, so leaving the explorer still remounts. See Deep-linking.

**APIs tab vs explorer:** The primary **APIs** tab lands on `/apis` but stays selected on `/explorer`. Re-clicking **APIs** from explorer (or an `/apis/…` page) navigates to the catalog overview; mount-time tab sync is ignored so load does not bounce through this plugin. `ShellSidePanelNav` does not re-navigate when a mode item’s `to` is already the current path (community → `/explorer`).

`app/utils/explorerRoute.ts` provides `isExplorerRoutePath()`, `explorerModeFromPath()`, and `pathForExplorerMode()` for the layout, explorer page (teleport disable on exit), side nav (`usePageSectionNav`), and the route-boundary plugin.

Bootstrap for the explorer starts in `useExplorerBootstrap` **`onMounted`** (after hydration), not from an immediate watcher, so `/api/explorer-bootstrap` does not hang on SPA entry.

**Dev — Vite `optimizeDeps.include`:** First navigation into `/explorer` (and other cold client mounts) can trigger Vite dependency discovery (`@scalar/api-reference`, Codex, `banana-i18n`, `markdown-it` from Enterprise custom mode, …). That invalidates `/_nuxt/pages/explorer/[[view]].vue` mid-load and surfaces as **500 / Failed to fetch dynamically imported module**. Those packages are listed under `vite.optimizeDeps.include` in `nuxt.config.ts` so they pre-bundle at `nuxt dev` startup. If the error returns after cache clears or new deps, hard-refresh or restart `npm run dev`; extend the include list when Vite logs “discovered new dependencies at runtime”.

### Deep-linking

Community explorer state (wiki instance, module, operation) is addressable via **path-based deep-link URLs**, so a view is shareable and gives the planned endpoint search a link target. Enterprise modes are unaffected. See `docs/adr-explorer-deep-linking.md`.

- **Grammar** (community only): `/explorer/direct/<instance>/<module…>#<operation>` (verbose — explicit instance) and `/explorer/q/<module…>#<operation>` (quick — instance resolved from the module source of truth, then canonicalized to the `direct` form). The module name is the multi-segment tail (`site/v1`); the operation is a readable anchor slug (e.g. `#get_v1_page_title`). The page is a catch-all route (`app/pages/explorer/[...view].vue`); the grammar is parsed/built by `app/utils/explorerRoute.ts`, and `direct` / `q` join `enterprise` / `enterprise-custom` as reserved first segments.
- **We own the hash** — Scalar's native hash routing stays off. On load, `useExplorerDeepLink` parses the URL (before bootstrap) and hands `useExplorerBootstrap` a module/operation intent; the operation anchor is resolved against the loaded module's operations (`app/utils/explorerOperationAnchor.ts`) and scrolled via the existing imperative focus engine. `scalarReferenceKey` keys on `route.path` (not `route.fullPath`), so writing the operation hash never remounts Scalar (see Reactive spec switching).
- **State ↔ URL** — `useExplorerDeepLinkSync` reflects selection into the URL (`push` on a newly focused operation so Back steps through operations, `replace` on instance/module change; the hash clears on any instance/module change). Same-module Back/Forward re-focuses; cross-module Back is a documented follow-up.
- **Fleet instances** — a deep-link may name any public, open wiki. `server/api/explorer-bootstrap.get.ts` resolves `baseUrl` curated-first (`config/instances.ts`), then via the generated fleet registry (`config/moduleSourceOfTruth.ts`); quick links resolve their representative instance through `server/api/explorer-quick-resolve.get.ts`. A non-curated instance is surfaced in the project picker as a transient selected option labelled with its display name (`isPickerRepresentableInstance`, `useExplorerProjectLanguagePicker`).
- **Fallbacks** — a deep-link that cannot fully resolve degrades with a dismissible `CdxMessage`: module-not-on-instance → default module; unknown instance → default wiki (`enwiki`); unmatched operation anchor → module without focus.

### Opt-in module visibility

Project controls expose **Wikimedia project** (project + language comboboxes), **API to explore** (`CdxSelect`, message key `explorer-rest-api-module-label`), **Beta APIs and endpoints**, and **Internal APIs and endpoints** checkboxes (defaults: beta **on**, internal **off** — `DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS` in `config/explorerOptIn.ts`). Bootstrap still fetches every discovery module server-side; filtering is **client-side** in `useExplorerOptInFilteredModules` via `filterExplorerBootstrapModulesByOptIn()` (`app/utils/explorerModuleOptInFilter.ts`). Gate rules live in `config/explorerOptIn.ts` (AGENTS rule 6): beta uses configured name prefixes; internal uses the MediaWiki REST audience convention that a discovery path segment ends with `-internal` (see `content/en/apis/stability.md`).

```
includeBetaEndpoints / includeInternalEndpoints (explorer page refs)
       ↓
useExplorerOptInFilteredModules
       ↓
filterExplorerBootstrapModulesByOptIn(modules, { includeBetaEndpoints, includeInternalEndpoints })
       ↓
isExplorerBetaOptInModule(name)?  ← config/explorerOptIn.ts (prefix `attribution/`)
isExplorerInternalOptInModule(name)?  ← path segment ends with `-internal` (e.g. `discord/v0-internal`)
       ↓
visibleModules → REST API module select (**API to explore**)
visibleSelectedModule / visibleOpenApiSpecUrl → Scalar (native sidebar lists endpoints)
```

When the active module becomes hidden (for example Attribution API with beta off, or Discord Preview API with internal off), **`resolveFirstExplorerRailModule()`** selects the first remaining healthy module in **discovery order** through `useExplorerBootstrap.selectModule()`. Bootstrap initial selection uses the same helper with **`DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS`** (beta **on**, internal **off**), so `*-internal` modules stay out of the **API to explore** menu until the internal checkbox is checked.

**Scope note:** Opt-in currently gates **module** visibility (which specs appear in the select / Scalar). Filtering individual operations inside a selected OpenAPI document is not implemented yet.

Module **`headingTitle`** from bootstrap (`resolveExplorerModuleRailHeading` in `app/utils/explorerModuleRailHeading.ts`) feeds **API to explore** labels (and the legacy rail heading if restored). In **API to explore**, audience markers are warning InfoChips (Codex exception #14) and version is MenuItem **`supportingText`** (suffixes `-beta` / `-internal` stripped, for example `0.1.0-internal` → `v0.1.0`).

### Scalar plugin layer

The `ApiReferencePlugin` API accepts Vue components natively. Plugins are registered on the `<ApiReference>` component's `plugins` prop. Codex components and banana-i18n work inside plugins without any bridge pattern.

Two mechanisms:
- **`views`**: inject a Vue component at `content.end` (after the Models section). Use for: token display panel, instance/language context notice, fallback language notice.
- **`extensions`**: inject a Vue component tied to an `x-*` vendor extension field in the spec. Use for: per-endpoint or per-operation metadata. Requires the spec to contain the `x-*` field — only possible if the spec is under our control or can be augmented at fetch time.

**Write-request production warning (Test Request modal).** For write HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE` — `config/scalarWriteHttpMethods.ts`) on wiki instances with a mapped test wiki (`config/wikiInstanceTestWikis.ts`), the explorer injects a production **`CdxMessage`** **only under the address bar** in Scalar’s Test Request modal. Write requests hit the **production** wiki; there is no checkbox and no URL rewrite to a test wiki. The warning’s `$2` test-wiki display name (e.g. Test Wikipedia) is a progressive link that is currently a **mock** (`preventDefault`) until test wikis are selectable via discovery.

Placement uses **DOM injection** after `.scalar-address-bar` (not ClientPlugin `components.request` / `components.response` view slots). Scalar’s response plugin slot renders immediately under **Response Headers** after Send — that path must not show this warning. `explorerMapConfigPlugins.client.ts` therefore registers only request-hook ClientPlugins; `ScalarClientWriteEndpointWarning` no-ops unless `slotKey === 'address-bar'`; and each modal scan calls `removeStrayWriteWarningHosts()` to drop any host nodes outside `.scalar-client-write-endpoint-warning-mount`.

```
Write endpoint opened in Test Request modal
    ↓
useScalarClientWriteEndpointWarnings
    ├── removeStrayWriteWarningHosts() (drop hosts outside address-bar mount)
    └── injectAddressBarWarning() → mount after .scalar-address-bar
            └── ScalarClientWriteEndpointWarning.vue (slotKey: address-bar)
```

**Placement and layout.** `resolveScalarClientModalAddressBarWarningPlacement.ts` inserts the mount node as the **next sibling** after `.scalar-address-bar`. `syncScalarClientModalAddressBarWarningInlineAlignment()` measures the URL field’s inline-start offset and sets `--fd-scalar-address-bar-inline-align-offset` so the warning aligns with the address bar input. **`app/assets/css/explorer-codex-overrides.css`** sets `order: 10000` on `.scalar-address-bar + .scalar-client-write-endpoint-warning-mount` below Scalar’s `lg` breakpoint where the address bar uses `order-last` (9999) — without this, flex order can place the warning above the URL row on narrow viewports. At `lg+`, `order` resets but the mount remains full-width on its own row.

**Copy and BiDi.** Interface strings use banana-i18n (`explorer-scalar-write-endpoint-warning`, `explorer-scalar-write-test-wiki-name-*` via `getTestWikiDisplayNameMessageKey()`). The warning message splits on `$1` (production wiki **display name** from `config/instances.ts`) and `$2` (test wiki **display name**) via `splitMessageAtTwoPositionalParameters()` in `getInterfaceMessageTemplate.ts` so each segment can be wrapped in `<bdi>`; `$2` is rendered as a progressive link (navigation mocked). Production display names are external config strings; test-wiki names are interface strings.

**Plain HTML probe.** `SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE` in `config/scalarClientWriteWarnings.ts` swaps the Vue mount for a plain HTML banner when debugging address-bar DOM injection without Codex.

**Write-request confirm dialog (mock).** When `SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED` is true, `useScalarClientWriteRequestConfirmDialog` capture-phase intercepts the address-bar **Send** button for write HTTP methods and opens `ScalarClientWriteRequestConfirmDialog` (`CdxDialog`). Title: `explorer-scalar-write-confirm-title` (`$1` = production wiki display name, FSI/PDI in the title string). Body: `explorer-scalar-write-confirm-body` with `$1` in `<bdi>`. **Actions:** end-aligned group like the default Dialog; within the pair, progressive **Confirm** left of neutral **Cancel** — **Codex exception #13** (`row` + `justify-content: end`; Codex default is `row-reverse` with primary at the end of the pair). **Containment:** `CdxDialog` `target="#explorer-reference-panel"`; the dialog component is a **sibling** of that panel (Vue Teleport cannot target an ancestor of the Teleport source). `explorer-codex-overrides.css` overrides the Codex viewport-fixed backdrop to `position: absolute; inset: 0` inside that panel (physical `width` / `height` / `top` / `left` / `right` / `max-width` / `max-height` clears — see AGENTS.md rule 8) so the overlay covers only the Scalar reference embed (not the full shell). **Type:** title `--font-size-large` (18px) — product size vs Codex Dialog / shell override #12 x-large (20px); body stays Codex `--font-size-medium` (16px). Labels via `resolveInterfaceMessage` / `getInterfaceMessageTemplate` (empty `<html lang="">` on explorer `i18n: false` is handled by `resolveActiveInterfaceLocale`). Confirm re-clicks Send once; Cancel / close does not send. **Undo:** set the flag to `false`.

---

## OAuth session

Wikimedia OAuth 2.0 uses Authorization Code flow with PKCE (public client). Full sequence: `docs/adr-wikimedia-oauth-authentication.md`.

The flow:
1. User clicks **Log in** in `ShellHeaderUtilityActions` (or the collapsed utility menu), or the progressive **Log in** button on the logged-out `/account` gate (`AccountLoggedOutGate` → `useAccountDashboardPage.onAccountPageLogin`)
2. `useOAuthSession().login(returnTo)` navigates to `GET /api/auth/oauth/login?returnTo=…` (header defaults to the current route; account gate passes the locale-aware account path)
3. Nitro stores PKCE verifier + state in an encrypted HttpOnly session cookie, then 302s to Meta’s authorize endpoint with `code_challenge`
4. Meta redirects to `/oauth/callback?code=…&state=…` (Vue page — not a Nitro route)
5. The page `POST`s to `/api/auth/oauth/exchange`; Nitro validates state, exchanges the code (PKCE verifier from the cookie), fetches the profile, writes the `refresh_token` into the persistent `oauth-session` cookie (see **Session persistence** below), and returns `{ username, accessToken, expiresAt, returnTo }`
6. Callback stashes the payload in `sessionStorage` (`oauthHandoff`) and `window.location.replace(returnTo)`; `oauth-handoff.client.ts` hydrates `oauthSession` Pinia once and clears the handoff key
7. `useOAuthSession()` / `useShellAuthNavigation()` expose session state to the shell: header shows **username only** as a progressive `NuxtLink` to locale-aware `/account` (`header-auth-link-aria` for the accessible name)

**Session persistence (ADR §8.6).** The access token is in-memory only (Pinia), so every full app re-boot — a reload, or entering the `ssr: false` `/account`/`/explorer` routes — starts with an empty store. To keep the user logged in across those boots (the header username showing but `/account` rendering the logged-out gate was the symptom before this), the **refresh token** is sealed in the HttpOnly encrypted `oauth-session` cookie (`server/utils/oauthSession.ts`) and never exposed to browser JS:
- On boot, `oauth-handoff.client.ts` uses the one-shot handoff right after login; on any other boot it `POST`s `/api/auth/oauth/session`, which mints a fresh access token from the cookie's refresh token, **rotates** the refresh token back into the cookie, and returns the in-memory payload. It awaits this only on `/account` (first paint branches on login state); elsewhere it restores in the background.
- `useOAuthSession().logout()` clears the store and `POST`s `/api/auth/oauth/logout` to clear the cookie, so a later reload does not silently restore the session.

Requires `NUXT_OAUTH_COOKIE_SECRET` and `NUXT_PUBLIC_OAUTH_CLIENT_ID`. Callback URL must match the consumer registration for the request origin (production: `https://wikifrodo.netlify.app/oauth/callback`; localhost only if registered separately). Deploy-preview hostnames are not registered — end-to-end login is verified on production or local, not arbitrary PR previews.

---

## RTL and BiDi

### Layout direction

The `<html>` element's `dir` attribute is set reactively in `app/layouts/default.vue` using `useDirection()`, which reads interface locale direction from `config/languages.js`.

**Codex stylesheet:** Global styles load via `nuxt.config.ts` as Codex’s experimental **`codex.style-bidi.css`**, which scopes physical LTR/RTL rules under `[dir=ltr]` / `[dir=rtl]`. Shell `dir` on `<html>` (from `useDirection()`) therefore selects the correct Codex icon/padding edges at runtime — including `CdxTextInput` / `CdxLookup` **clearable** and start-icon placement — without stacking `codex.style.css` + `codex.style-rtl.css`.

**Why bidi (not dual sheets):** Codex direction sheets are meant to **replace** each other. The previous prototype loaded the LTR sheet always and toggled the RTL mirror on top; with both active, conflicting physical `left`/`right` (and padding) left the Lookup clear control on the wrong edge in RTL, overlapping input text. **Do not** reintroduce stacked LTR + RTL Codex sheets. Quiet-tabs chrome overrides remain in `shell-primary-nav-overrides.css` (imported from `main.css` after the bidi sheet).

**Language Lookup remount:** Header `CdxLookup` uses `:key="direction"` so the control re-renders when direction changes. First-party Lookup CSS overrides only cancel Floating UI menu placement (Codex exception #8) — they do **not** restyle the TextInput, clear control, or start icon.

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

**Documented exception — interface language Lookup Floating UI cancel.** `ShellHeaderUtilityActions` puts the native `CdxMenu` in normal flow inside `.shell-header-utility-actions__language-popover` by cancelling Floating UI absolute placement and viewport `maxHeight`. Physical **`max-height: none`** is used only to clear Floating UI’s inline physical style; first-party spacing does not add a gap between input and menu. Do **not** override TextInput / **`clearable`** / start-icon chrome. See **Codex exceptions (shell chrome)** #8 and `AGENTS.md` rule 8.

**Documented pattern — Codex direction CSS.** Load a **single** Codex sheet: experimental **`codex.style-bidi.css`** in `nuxt.config.ts` (`[dir=ltr]` / `[dir=rtl]`). Do **not** stack `codex.style.css` + `codex.style-rtl.css` (breaks clearable and other physical edges on runtime locale switch). See **RTL and BiDi** above.

**Documented pattern — scroll-end inset on nav scrollports.** Start section nav and the collapsed overlay reserve **32px** below the last item via a **`::after` block spacer** (`block-size: var(--spacing-200)`) on the scrollport element — not `padding-block-end` on a nested wrapper. See **Shell section navigation** (scroll-end inset) and `AGENTS.md` rule 8.

**What we do not do.**
- Do not ship a separate first-party `app.rtl.css` and toggle stylesheets at runtime — that defeats Nuxt 4 CSS code-splitting and HMR.
- Do not stack Codex LTR + RTL mirror sheets; use `codex.style-bidi.css` (or one direction sheet per request) instead.
- Do not write physical properties in first-party CSS "for clarity" and rely on a build-time flipper. Logical properties are clearer, faster, and avoid broad unintended mirroring.

---

## Configuration files

All project-level configuration lives in `config/`. Files are documented with a file-level JSDoc block describing their purpose and the effect of each key.

| File | Contains |
|---|---|
| `config/instances.ts` | Wiki instance IDs, display names, base URLs, explicit `dir`, content language codes |
| `config/languages.js` | Language codes, explicit `dir` declarations, fallback chains |
| `config/mainNavigation.ts` | Primary shell navigation order, banana message keys, locale-agnostic paths; `API_CATALOG_NAVIGATION_PATH` (`/apis`) for the **APIs** tab landing; `API_EXPLORER_NAVIGATION_PATH` (`/explorer`) for the explorer (`i18n: false`) |
| `config/contentRedirects.ts` | Legacy content URL **301** redirects merged into `nuxt.config.ts` `routeRules` |
| `config/sectionNavigation.js` | Content-page left-rail section groups and items (banana message keys only; keyed by main nav id) |
| `config/explorerSideNav.js` | Explorer left-rail sections and placeholder links (banana message keys only) |
| `config/explorerOptIn.ts` | Codex checkbox values, beta-gated module name prefixes (`attribution/`), `isExplorerBetaOptInModule()`, `isExplorerInternalOptInModule()` (`*-internal` path segments), `DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS` |
| `config/explorerProjectPicker.ts` | Explorer project + language picker ids, defaults, and mapping to wiki instance ids |
| `config/explorerModuleDescriptions.ts` | Banana fallback keys when OpenAPI `info.description` is absent; **`EXPLORER_MODULE_DESCRIPTION_OPENAPI_SUFFIX_STRIP_PATTERNS`** removes configured trailing boilerplate after bootstrap normalization (for example Site API `site/v1`) |
| `config/explorerSurfaces.ts` | Shared exploratory surface tokens (Codex `--background-color-neutral-subtle`, 4px radius) — mirrored as `--fd-explorer-controls-surface-*` in `page-grid.css`; radius also used by account list-element cards, Reset credentials panel, NavigationCard, Highlight, CodeBlock, CodeTabs, and Test Request dialog |
| `config/headerChrome.ts` | Header utility collapse threshold (gap estimates: search→preferences **16px**, other options **8px**); interface-language `CdxLookup` `visibleItemLimit` (**7**) and menu item render cap (**50**). Lookup **`clearable`** is a Codex prop on the component, not a config constant. |
| `config/scalar.js` | Scalar component defaults (theme, layout, enabled features) |
| `config/brandTypography.ts` | Brand wordmark font URL (`BRAND_WORDMARK_FONT_STYLESHEET_URL` for Google Fonts Montserrat in `nuxt.config.ts`) |
| `config/landingSurfaces.ts` | Platform home: light/dark **`LANDING_BAND_GRADIENTS`** (`apis` / `join` dark `#233566` → `#101418`; `apps` uses Codex base), **`LANDING_CONTENT_MAX_INLINE_SIZE`** (`62.5rem` / 1000px), **`LANDING_HERO_GLOBE_COLOR`**, **`LANDING_AWARD_CHIP`** (light purple100 fill / purple600 text; dark inverted → `--fd-landing-award-chip-*-light` / `*-dark`), **`LANDING_ASSETS`** (incl. `heroDither` / `heroDitherDark`, app screenshots), `LANDING_API_ARTICLE_PREVIEWS` |
| `config/navigationCardIcons.ts` | Allowlisted Codex icon names for `::navigation-card` `leading-icon` / related MDC props (`userGroup`, `labFlask`, `userTalk`, `code`, …) |
| `config/navigationCardTitleLogos.ts` | Allowlisted brand title logos (`gerrit`, `github`, `gitlab`, `wikimediaEnterprise`) |
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

**Primary navigation IA:** Tabs include Get started, **APIs** (catalog `/apis`; explorer keeps the tab selected), Contribute, Community, Get help, plus remote primary merges from `REMOTE_CONTENT_SOURCES`. Start-column explorer section heading remains **API Explorer**. See `DESIGN_REQUIREMENTS.md` → Information architecture.

**Route → nav id:** `app/utils/contentRoute.ts` → `getMainNavigationIdFromPath()` returns **`apis`** on explorer routes, matches other `MAIN_NAVIGATION_ITEMS` and remote sources with `navEntry.target === 'primary'`, and strips locale prefixes before matching.

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

Prose pages are Markdown files in `content/[locale]/`. The catch-all route `app/pages/[...slug].vue` fetches the appropriate file via `useLocalizedContentPage()` and passes it to `<ContentRenderer>` inside **`.fd-content-page`**. The platform home (`content/[locale]/index.md`) is rendered by `app/pages/index.vue` inside **`.fd-content-page.fd-landing-page`** (landing surfaces in `app/assets/css/landing-page.css`; MDC wrappers `LandingHero`, `LandingBand`, `LandingSection`, `LandingApiDemo`, `LandingArticlePreview`, `LandingSectionCta`; surface tokens / preview copy in `config/landingSurfaces.ts`). Nuxt Content handles parsing (micromark → unified AST) and rendering. Shiki provides syntax highlighting automatically for all fenced code blocks.

### Content typography (Codex style guide)

Markdown page titles and section headings follow the Codex [typography style guide](https://doc.wikimedia.org/codex/latest/style-guide/typography.html), scoped under `.fd-content-page` in `app/assets/css/main.css` (so explorer / shell chrome keep their own heading rules):

| Element | Codex style | Tokens |
|---------|-------------|--------|
| `h1` | Heading 1 | `--font-family-serif`, `--font-size-xxx-large`, `--font-weight-normal`, `--line-height-xxx-large` |
| `h2` | Heading 2 | `--font-family-serif`, `--font-size-xx-large`, `--font-weight-normal`, `--line-height-xx-large` |
| `h3` | Heading 3 | `--font-family-base`, `--font-size-x-large`, `--font-weight-bold`, `--line-height-x-large` |

**Section spacing:** Content-page `h2` overrides the global heading `margin-block-start` (`--spacing-150` / 24px) with **`--spacing-250` (40px)**. Implemented as `.fd-content-page :where(h2) { margin-block-start: var(--spacing-250); }`. `margin-block-end` remains **`--spacing-75`**. Do not change this for one-off pages — it is the documentation section rhythm for all `.fd-content-page` routes. Product decision: `DESIGN_REQUIREMENTS.md` → Content page typography.

**Get started landing** (`content/en/get-started.md`): section `---` horizontal rules between `h2` blocks are omitted (no visual `<hr>` dividers). Topic destinations under each `h2` use `:::navigation-card-grid` + `::navigation-card` (whole-card links; no “Learn more” prose links; title + description only — no icons, chips, or supporting-text on that page). The quick-start CTA at the top uses `::highlight` (progressive-subtle panel — see Highlight below).

#### Platform landing / home

**Route:** `/` (and locale homes such as `/fr`) via `app/pages/index.vue` + `content/[locale]/index.md` (`sidebar: false`). Wrapper classes: **`.fd-content-page.fd-landing-page`**.

**Shell exception (`frontdoor-shell--landing`):** Detected by `isLandingRoutePath()` (`app/utils/landingRoute.ts`) — matches `/` or a single segment that is a `SUPPORTED_LANGUAGES` code (not `/get-started`). On that shell class (`default.vue`):

- Drop `.fd-page-grid` `padding-inline-start` and `.frontdoor-shell__body-scroll` `padding-inline-end`
- Collapse the end column; set `.frontdoor-shell__body-columns` to a single track with **`max-inline-size: none`** (overrides the ≥ 1680px body-columns lock)
- Section wrappers (`.landing-hero`, `.landing-band`, `.landing-section`) use **`inline-size: 100%`** so **backgrounds paint full viewport width**
- Home uses `sidebar: false` (zero-width start track). Navigating to/from landing must **not** run the start-drawer expand animation — see **Responsive navigation collapse and start drawer** (`.frontdoor-shell--nav-drawer-expanding` gate)

**Content measure:** Centered inners use **`--fd-landing-content-max-inline-size`** set from **`LANDING_CONTENT_MAX_INLINE_SIZE`** (`62.5rem` / **1000px**) in `config/landingSurfaces.ts` via inline style on `.fd-landing-page` in `index.vue` (config source of truth — AGENTS rule 6). Inline padding uses **`--fd-layout-page-margin`**.

**Typography / chrome exceptions** (`.fd-landing-page` in `landing-page.css`, override `.fd-content-page` serif Heading 1/2):

| Element | Landing treatment |
|---------|-------------------|
| Hero `h1` | Monospace, bold, centered; **`font-size: 2rem`** (exploratory — not a Codex `--font-size-*` token; xxx-large is 1.75rem) |
| Hero intro `p` | **`--font-size-x-large`** (Codex) in `LandingHero.vue` (scoped `:deep(p)` — not `landing-page.css` `:where`, which loses on specificity) |
| `h2` | Base (sans) stack, bold; `margin-block-start: 0` (bands own vertical padding) |
| Heading anchors | Not rendered (`ProseHeading` skips anchors when `isLandingRoutePath`) |
| Section `h2` → content | **`--spacing-150` (24px)** end margin; next sibling start margin zeroed |
| All home links | No `:visited` colour (hero prose, card supporting-text, section CTAs) — keep link / progressive hover / active only (`landing-page.css`) |
| Hero prose links | No ProseA external icon |
| `hr` | Hidden (no Markdown `---` dividers) |

**MDC structure** (`content/en/index.md`):

| Block | Role |
|-------|------|
| `:::landing-hero` | Full-bleed dither + H1 / intro / `::app-button` + ascii globe |
| `:::landing-section` | “What would you like to do?” + 3-up cards (leading icons / Enterprise `title-logo`) |
| `:::landing-band{variant="apis\|apps\|join"}` | Full-bleed band; `apis` / `join` = Figma gradient stops from config; `apps` = `--background-color-base`; community app cards use Portrait-card media (`media` + **`--spacing-75` (12px)** image inset — Codex Portrait card not shipped yet, [T310632](https://phabricator.wikimedia.org/T310632) / [Figma](https://www.figma.com/design/KoDuJMadWBXtsOtzGS4134/Codex?node-id=13072-136634)) + optional `chips="award:…"` + `hide-external-icon` |
| `:::landing-api-demo` | Two-column demo: intro + `:::code-block` curl + Codex `CdxCard` article previews from `LANDING_API_ARTICLE_PREVIEWS` (desktop: example column stretches to stacked cards; auto space between intro `p` and `h3` + code-block) |
| `::landing-section-cta` | Quiet progressive section link + trailing arrow (always `cdxIconArrowNext`, including external Toolhub CTA — not the external glyph) |

**Assets:** Committed under `public/images/landing/` (`LANDING_ASSETS`) — hero dither (light + dark) / ascii globe, API article-preview thumbs, and community-app screenshots (`app-lexica` / `app-paulina` / `app-listen`). Do not invent replacements; call out still-missing assets (e.g. true bitonal dither texture — current dither SVGs are soft radial gradient exports from Figma).

**Hero dark mode:** `LandingHero` binds `--fd-landing-hero-dither-light` / `--fd-landing-hero-dither-dark` from config. `landing-page.css` swaps to `hero-dither-dark.svg` under `html.fd-theme--dark` and `html.fd-theme--auto` + `prefers-color-scheme: dark` (same pattern as `color-modes.css`). Dark export ([Figma 1202:27291](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=1202-27291)): bottom-center `#3366CC` @ 60% → `#1B223D` → `#101418`. Hero `background-color: var(--background-color-base)` so the translucent progressive stop composites correctly.

**APIs / join band dark mode:** `LandingBand` binds light + dark stops from `LANDING_BAND_GRADIENTS`. Dark APIs ([1202:27489](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=1202-27489)) and dark join ([1202:28482](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=1202-28482)): both `#233566` → `#101418` (Codex light `background-color-progressive--active` → `background-color-inverted`). Hex is intentional — do not use `var(--background-color-inverted)` under dark theme (that token flips to `#f8f9fa`). Gradient axis uses physical **`to bottom`** — `linear-gradient` has no shipped logical sides (`to block-end` invalidates the rule).

**Hero ascii globe:** Figma / current exports are an **RGBA PNG** (`hero-ascii-globe.png`), not SVG — painted as a CSS **`mask-image`** with fill from `LANDING_HERO_GLOBE_COLOR` (light `#202122`, dark `#eaecf0` / Codex dark `color-base`) so dark mode stays readable on the blue dither. The PNG alpha was contrast-boosted for mask use; if design ships a true SVG, prefer inlining with `currentColor` (same pattern as `WikimediaLogoMark`).

**MDC nesting:** Nested landing containers must use **increasing colon counts** on outer wrappers (Nuxt Content / MDC rule) — e.g. `:::::landing-band` → `::::landing-api-demo` → `:::code-block`. Same-level `:::` openers close the previous container and can leave orphan `:::` markers as visible paragraphs.

**Codex exception — landing API `CdxCard` border:** `LandingArticlePreview` wraps Codex `CdxCard` but adds a resting **`--border-color-muted`** border and exploratory **4px** radius (`--fd-explorer-controls-surface-border-radius`). Stock Card chrome does not provide that framed tile look on the API band; do not apply this override to other `CdxCard` usages without a documented exception.

**API preview thumbnail preload:** Codex `CdxThumbnail` (inside `CdxCard`) shows a placeholder until `onMounted` + `Image.onload`. `app/pages/index.vue` emits `<link rel="preload" as="image">` for each `LANDING_API_ARTICLE_PREVIEWS` `thumbnailSrc` so those requests start with the document and Codex’s later `new Image()` hits cache — keeps Codex Card, avoids a custom `<img>` bypass.

**Award InfoChip dark mode:** `LANDING_AWARD_CHIP` light = purple100 fill / purple600 text+icon; dark = inverted. Bound as `--fd-landing-award-chip-*-light` / `*-dark` on `.fd-landing-page`. `landing-page.css` paints `.navigation-card__chip--award` with the dark vars under `fd-theme--*` (same split as hero globe). Do **not** reassign the light custom property in the stylesheet — inline style on `.fd-landing-page` would win.

**Product decision:** `DESIGN_REQUIREMENTS.md` → Platform landing / home. Figma Latest [1179:23177](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=1179-23177). Metrics row in Figma is **hidden** — not implemented.

**API catalog** (`content/en/apis.md`): section overview for the primary **APIs** tab (`API_CATALOG_NAVIGATION_PATH` `/apis` — same landing role as `/get-started`). Start-column menu is `SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID.apis` in `config/sectionNavigation.js` (shared with `/apis/…` and explorer). Structure (v0): intro `::highlight` → Quick start; **Wikimedia APIs** via `::api-catalog-wikimedia-section` (Recommended chip + project filter + cards); **Wikimedia Enterprise APIs** / **Classic APIs** `:::navigation-card-grid`s with optional `CdxInfoChip` rows (see Navigation card → Info chips); stacked **API best practices** `::highlight` panels (Attribution, Authentication, Rate limits). Mixed internal (`/explorer`, `/apis/…`) and external cards; external cards keep writer-authored `supporting-text`. Deferred: end-column page nav, curated per-API destinations (many Wikimedia cards temporarily link to `/explorer`). See `DESIGN_REQUIREMENTS.md` → API catalog.

**Build for communities** (`content/en/get-started/build-for-communities.md`): same internal-card pattern — page intro, then one `:::navigation-card-grid` (Use wiki content, Access open data, Build tools and bots, Build on-wiki features). Card `url`s match `config/sectionNavigation.js` For communities items (`/get-started/wiki-content`, `/get-started/open-data`, `/get-started/tools-and-bots`, `/get-started/on-wiki`). Internal card and section-nav destinations must have a corresponding Markdown file under `content/<locale>/` or Nuxt Content returns **404** (e.g. `content/en/get-started/on-wiki.md` mockup for Build on-wiki features).

**Use wiki content** (`content/en/get-started/wiki-content.md`): three `##` sections each with a `:::navigation-card-grid`. Explore APIs cards link to `/explorer` (internal, no supporting-text). High-volume section mixes an internal Enterprise card (`/get-started/wikimedia-enterprise`) with an external Meta-Wiki dumps card (`supporting-text="Read more on Meta-Wiki"`). Tutorials: Quick start and Browse all tutorials are internal (`/get-started/quick-start`, `/get-started/tutorials`); **Get featured content** is external ([Picture of the day viewer](https://www.mediawiki.org/wiki/Special:MyLanguage/API:Picture_of_the_day_viewer)) with `supporting-text="Read more on mediawiki.org"` (title trailing icon omitted).

**Access open data** (`content/en/get-started/open-data.md`): intro then an untitled card grid (three external Meta-Wiki / Wikidata cards with writer-authored supporting-text), then `## Explore APIs` (internal **Lift Wing API** → `/explorer`), `## High-volume and commercial access` (Enterprise internal + Meta-Wiki dumps), `## Learn with tutorials` ([Compare page metrics](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/tutorials/compare-page-metrics.html) external with `supporting-text="Read the docs"` + Browse all tutorials internal). **External supporting-text labels always keep the technical writer’s copy** from the source Markdown (do not invent new link labels).

**Tools and bots** (`content/en/get-started/tools-and-bots.md`): keep each `##` section intro as prose, then a `:::navigation-card-grid`. Most cards are external with writer-authored supporting-text (Toolhub, mediawiki.org, Wikitech, Wikidata). **Use APIs and data sources** cards link to `/explorer` (internal, no supporting-text) — titles **MediaWiki REST API** and **Lift Wing API**. **Run scripts in your browser** uses card `url` → Wikitech PAWS + supporting-text “Read more on Wikitech”, and links the word **PAWS** in the description (default slot) to `https://hub-paws.wmcloud.org/`. Duplicate “Build your first tool” cards are kept in Get started and Learn with tutorials.

**Get started API card titles (current ecosystem):** Until discovery modules are listed as first-class destinations and some solutions are renamed for broader accessibility, Explore / Use APIs cards use **current product names** as they exist today (e.g. **Lift Wing API**, not a generic “Machine Learning API”). Prefer writer/product-accurate titles over aspirational or umbrella labels. See `AGENTS.md` → Navigation card authoring playbook.

**About Wikimedia Enterprise** (`content/en/get-started/wikimedia-enterprise.md`): intro ends the SLA sentence with a full stop; the high-volume access sentence + **Get started with Wikimedia Enterprise** CTA (no arrow, new line) sit in `::highlight` (`https://enterprise.wikimedia.com`). Body sections remain **prose** (not navigation cards): Explore use cases bullets + commercial-use-cases link; Download / On-demand / Realtime `##` sections with writer links; Get started for free + Free access for Wikimedia communities.

**Bulk data for research** (`content/en/get-started/data-for-research.md`), **Featured apps** (`featured-apps.md`), and **Browse by programming language** (`by-language.md`): mockup stubs so Get started / section-nav links resolve (same pattern as `on-wiki.md` / `tutorials.md`). **Browse repositories** on `by-language.md` uses external cards with allowlisted **`title-logo`** (`gerrit` / `github` / `gitlab`) plus writer supporting-text — see Navigation card → Title logos.

**Commercial use cases** (`content/en/get-started/commercial-use-cases.md`): Markdown under `.fd-content-page` (Codex Heading 1–3). Card conversion not applied yet.

**External supporting-text copy:** When converting prose “Read more on …” / “Visit …” links into card `supporting-text`, **always preserve the existing label text** authored by the technical writer. Do not rewrite those strings.

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
| `ProseH2.vue` … `ProseH6.vue` | `CdxIcon` + `cdxIconLink` | Overrides default heading rendering; heading text is plain text, icon appears on hover via CSS. Default `@nuxtjs/mdc` wraps the full heading text in `<a>` — these components replace that with the icon-alongside pattern. Visual size/weight for `h2` on content pages comes from `.fd-content-page` rules in `main.css` (Codex Heading 2). |
| `ProseA.vue` | `CdxIcon` + `cdxIconLinkExternal` | Overrides all `<a>` in prose; adds icon when `href` is external; external links default to `target="_blank"` + `rel="noopener noreferrer"`. Link colours/states come from Codex Link tokens on `.frontdoor-shell__main a` in `main.css` (`--color-link*`). On `.fd-landing-page`, hero hides the external icon and **all** home links suppress `:visited` via `landing-page.css` |
| `Callout.vue` | `CdxMessage` (`type`: `notice` / `warning` / `error` / `success`) | `::callout{type="warning"}` block — see **Callouts** below |
| `Highlight.vue` | — (shared `.fd-highlight` surface) | `::highlight` block — see **Highlight** below |
| `SectionHeading.vue` | `CdxInfoChip` + `ProseHeading` | `::section-heading{title="…" chip="…"}` — see **Section heading** below |
| `ApiCatalogWikimediaSection.vue` | `CdxField` + `CdxCombobox` + `SectionHeading` + `NavigationCard` | `::api-catalog-wikimedia-section` — see **API catalog project filter** below |
| `NavigationCard.vue` | Custom card chrome + `CdxIcon` / `CdxInfoChip` (inspired by `CdxCard`) | `::navigation-card{…}` — see **Navigation card** below |
| `NavigationCardGrid.vue` | — | `:::navigation-card-grid` (optional `columns="2"` for two-up rows, e.g. landing Join) wrapping `::navigation-card` — equal-height rows; default max **3** columns at desktop |
| `CodeBlock.vue` | — | `:::code-block` — single bordered code panel (same chrome as code tabs, no tab header; exploratory **4px** radius; soft-wrap; `dir="ltr"`); see **Code block** below |
| `CodeTabs.vue` + `CodeTab.vue` | `CdxTabs` (`framed`) + `CdxTab` | `::::code-tabs` / `:::code-tab{label="…"}` block — see **Code tabs** below |
| `AppButton.vue` | `CdxButton` (`action="progressive"` `weight="primary"`) + optional `CdxIcon` end icon | `::app-button{href="…" label="…" size="large" icon-end="arrowNext"}` — `/…` paths always `navigateTo` (path wins over MDC `external` / `external=""`); absolute `http(s):` (or `external` on non-path hrefs) open in a new tab; label BiDi-isolated. Real Codex button chrome so shell prose-link colours cannot wash out inverted label text |
| `LandingHero.vue` | — | `:::landing-hero` — dither + globe; intro `p` **`--font-size-x-large`** (scoped); H1 type in `landing-page.css` (exploratory **2rem**). See **Platform landing / home** |
| `LandingBand.vue` | — | `:::landing-band{variant="apis\|apps\|join"}` |
| `LandingSection.vue` | — | `:::landing-section` |
| `LandingApiDemo.vue` | — | `:::landing-api-demo{explore-href explore-label}` — desktop example column stretches to stacked preview cards; `h3` `margin-block-start: auto` spaces intro vs `h3` + code-block |
| `LandingArticlePreview.vue` | `CdxCard` + thumbnail | Used by `LandingApiDemo` (not authored in Markdown); landscape Codex [Card](https://doc.wikimedia.org/codex/latest/components/demos/card.html). **Codex exception:** muted resting border + exploratory **4px** radius (stock Card has no framed border in this surface) — see Platform landing |
| `LandingSectionCta.vue` | `CdxIcon` + `cdxIconArrowNext` | `::landing-section-cta{href label}` — arrow for internal and external; external still `target="_blank"` |
| `Include.vue` | — | `::include{file="./_partials/…"}` — locale-relative content inclusion |
| `Partial.vue` | — | `::partial{name="…"}` — allowlisted shared partials (`config/sharedPartials.ts`); see remote-content ADR §11 |
| `Attribution.vue` | `CdxIcon` + `cdxIconLogoWikimedia` | `::attribution{…}` — CC BY-SA footer for wiki-imported pages |

#### Navigation card

`NavigationCard.vue` is Front Door’s vertical **content / navigation card** — not a thin wrapper around stock `CdxCard`. It follows Figma variant A ([Content card 79:4339](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=79-4339)) for Get started and other Markdown documentation pages.

**Agent playbook:** When converting or authoring destination tiles, follow **`AGENTS.md` → Navigation card authoring playbook**. That section defines the two required styles (same component):

| Style | When | Signature | Reference Markdown |
|-------|------|-----------|--------------------|
| **Internal** | Same-origin path (`/get-started/…`, `/explorer`, …) | `url` + `title` + `description` only — **no** `supporting-text` | `get-started.md`, `build-for-communities.md` |
| **External** | Off-platform `https://…` | `url` + `title` + `description` + **`supporting-text`** (writer label; external icon on that link) | `about-wikimedia.md`; external cards on `open-data.md` / `tools-and-bots.md` |
| **Platform home (exception)** | Persona / join on `index.md` | Internal `url` **with** writer `supporting-text`; apps band = Portrait `media` + optional `award:` chips + `hide-external-icon` | `content/en/index.md` — see **Platform landing / home** |

Mixed pages apply the table **per card**. Empty former links → ask or omit `url` (non-clickable). New internal paths need a matching `content/<locale>/` file.

| Aspect | Stock `CdxCard` | `NavigationCard` |
|--------|-----------------|------------------|
| Layout | Horizontal (optional thumbnail / start icon) | Vertical stack; optional Portrait **`media`** screenshot (landing apps) |
| Background | Base (white) | Neutral-subtle via `--fd-explorer-controls-surface-background-color` |
| Border | Present | Transparent by default; **`--border-color-subtle`** on hover when linked |
| Radius | `--border-radius-base` (2px) | `--fd-explorer-controls-surface-border-radius` (exploratory **4px**) |
| Typography | — | Title, description, and supporting-text use Codex base **`--font-size-medium`** / **`--line-height-medium`** (title bold) |
| Supporting text | Codex Card supporting-text slot | Optional `supportingText` / `#supporting-text`; with `url`, prop text is a **Codex Link** to the same destination ([Link mixin](https://doc.wikimedia.org/codex/latest/components/mixins/link.html) via `--color-link*` tokens — hover/active/visited/focus, not progressive-only). **Platform landing exception:** `.fd-landing-page` suppresses `:visited` (unvisited / hover / active only). External icon on that link for off-platform destinations (`color: inherit`) unless `hideExternalIcon`; title trailing icon omitted when supporting-text is present. **Preserve technical-writer labels** when converting from prose — do not rewrite supporting-text copy |
| Title logos | — | Optional `titleLogo` / MDC `title-logo` — allowlisted monochrome brand marks (`gerrit`, `github`, `gitlab`, **`wikimediaEnterprise`**) in `config/navigationCardTitleLogos.ts`; SVG sources under `public/images/navigation-card-logos/`. Sources: [Gerrit](https://gerrit.wikimedia.org/r/static/wikimedia-codereview-logo.cache.svg), [GitHub Octicons](https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg), [GitLab](https://upload.wikimedia.org/wikipedia/commons/3/35/GitLab_icon.svg), Wikimedia Enterprise mark from Figma Latest (1179:23269) — brand fills remapped to `currentColor`. Sized to **`--size-icon-medium`**; inherits title **`--color-base`** (dark mode via tokens). When a text `title` is also set, the logo renders before the title (landing commercial card). Not Codex icons — brand marks are a documented exception. Demos: `by-language.md` → Browse repositories; `content/en/index.md` → Enterprise persona card |
| Bottom alignment | — | In equal-height grids, supporting-text uses **`margin-block-start: auto`** inside a flex-growing copy block so links share a baseline across the row. **Minimum** **`--spacing-50` (8px)** from the description via **`padding-block-start`** on `.navigation-card__supporting-text` (so the gap never collapses below 8px when free space is zero) |
| Click target | Optional card link | **Stretched link** over the card when `url` is set (whole-card click). Description and supporting-text links sit above it via `z-index` + `pointer-events` — valid HTML, **no nested `<a>`**. ProseA external icons are suppressed inside card descriptions |

**Props / slots:** `url`, `title`, `titleLogo`, `description`, `supportingText`, `topIcon` / `leadingIcon` (Codex `Icon` or allowlisted name from `config/navigationCardIcons.ts`), `media` (public image path for Portrait-card screenshot; **`--spacing-75` (12px)** inset — Codex Portrait card not shipped, [T310632](https://phabricator.wikimedia.org/T310632) / [Figma](https://www.figma.com/design/KoDuJMadWBXtsOtzGS4134/Codex?node-id=13072-136634)), `chips` (Vue array or MDC pipe-separated string; `award:Label` → star + purple Coolest Tool chip), `hideExternalIcon`, `external`; slots `#title`, `#description`, **default** (Markdown description inside grids), `#supporting-text`, `#top-icon`, `#leading-icon`, `#chips`.

**Grid:** `NavigationCardGrid.vue` (`:::navigation-card-grid`) — CSS grid with `align-items: stretch`; cards use `block-size: 100%` / `min-block-size: 100%` so each row matches the tallest card. Card body and copy blocks are flex columns (`flex: 1`) so supporting-text can pin to the bottom of the card. Column counts match Codex shell breakpoints (**1** &lt; 640px, **2** ≥ 640px tablet, **3** ≥ 1120px desktop) using the same px literals as `page-grid.css` (CSS custom properties are unreliable in `@media`). **`--spacing-100` (16px)** `margin-block` separates the card row from adjacent intro copy **and** following prose. Under `.fd-content-page`, adjoining `p` / `ul` / `ol` margins are zeroed so that 16px does not collapse away. Non-card MDC wrappers use `display: contents` so cards are the grid items. For Markdown (e.g. inline links) inside a grid card, put the Markdown in the card’s **default slot** — not `#description`. MDC named slots do not nest under `:::navigation-card-grid` and cause a parse failure (page omitted from the collection → 404).

**Info chips:** Optional `CdxInfoChip` row under the description (`chips` prop or `#chips` slot). Parsed by `app/utils/parseNavigationCardChips.ts`:

| MDC form | Result |
|----------|--------|
| `chips="Bots and tools\|Wikimedia APIs"` | Labels with default status `subtle` |
| `chips="notice:All projects\|success:Stable\|warning:Beta"` | `status:label` segments (`StatusType` prefix must be valid) |
| `chips="award:Coolest Tool Award 2026"` | Landing Coolest Tool chip — `cdxIconStar` + purple100/600 via `LANDING_AWARD_CHIP` (dark: inverted fill/text; not a Codex `StatusType`) |

**API catalog conventions** (`content/en/apis.md`): `notice` = scope, `success` = Stable / Check stability…, `warning` = Beta — stock Codex status colours. Get started overview cards omit chips.

**Label-only (approved exception):** Catalog chips and explorer **API to explore** audience chips must not show Codex status icons. `CdxInfoChip` forces icons for `warning` / `error` / `success` and ignores a null `icon` prop for those statuses, so first-party CSS hides `.cdx-info-chip__icon--vue` under `.navigation-card__chips` and `.explorer-module-select-option__audience-chip` (documented inline in the SFCs). Do not invent a second chip component or re-colour chips outside Codex statuses without updating `DESIGN_REQUIREMENTS.md`. See `AGENTS.md` → Content components (approved exception) and Codex exceptions #14.

**BiDi / i18n:** Title, description, supporting-text, and chip labels from props are wrapped in `<bdi>` (content / external strings). No banana-i18n keys in the card chrome itself — labels are authored in per-locale Markdown. First-party card/grid CSS uses logical properties (`inline-size`, `margin-block-*`, `block-size`, `min-block-size`).

**MDC authoring examples:**

```md
:::navigation-card-grid
::navigation-card{url="/get-started/wiki-content" title="Use wiki content" description="Access articles…"}
::
::navigation-card{url="https://meta.wikimedia.org/wiki/Special:MyLanguage/Wikimedia_projects" title="Explore projects" description="…" supporting-text="Read more on Meta-Wiki"}
::
::navigation-card{url="https://www.mediawiki.org/wiki/Special:MyLanguage/Wikibase" title="Wikibase and Wikidata" supporting-text="Read more on mediawiki.org"}
Wikibase powers [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page).
::
::navigation-card{url="/explorer" title="MediaWiki REST API" description="…" chips="notice:All projects|success:Check stability at endpoint level"}
::
:::
```

**Content vs banana-i18n:** Title, description, supporting-text, and chip labels are **content** — authored in per-locale Markdown and wrapped in `<bdi>`. They are not banana-i18n interface strings. Banana remains for true chrome (nav labels, buttons, errors). This matches `docs/TECH_DECISIONS.md` (interface → banana-i18n; content → Nuxt Content locales) and avoids duplicating page copy into `i18n/*.json`.

**External destinations:** Absolute `http(s):` URLs (or `external`) open in a new tab. The external-link icon appears on **supporting-text** when that prop is set; otherwise on the title row. Internal `/…` paths use `NuxtLink` with no external icon and no supporting-text. When converting existing “Read more on …” prose links into `supporting-text`, **always keep the writer’s label text**.

**Helpers:** `config/navigationCardIcons.ts` (allowlisted Codex icon names for MDC), `config/navigationCardTitleLogos.ts` (allowlisted brand title logos), `app/utils/parseNavigationCardChips.ts` (pipe-separated chip attribute → `CdxInfoChip` props).

**Demos:** `content/en/index.md` (platform home — persona/join with internal supporting-text exception; Portrait app cards + `award:` chips); `content/en/get-started.md` and `content/en/get-started/build-for-communities.md` (internal whole-card links, no icons/chips/supporting-text; destinations include `wiki-content`, `open-data`, `tools-and-bots`, `on-wiki`); `content/en/apis.md` (API catalog — chips + mixed internal/external; best practices as `::highlight`); `content/en/get-started/wiki-content.md`, `open-data.md`, and `tools-and-bots.md` (mixed internal `/explorer` + external writer-authored supporting-text; tools-and-bots also links PAWS in a description default slot); `content/en/get-started/wikimedia-enterprise.md` (`::highlight` intro CTA; body sections are prose, not cards); mockup stubs `on-wiki.md`, `tutorials.md`, `data-for-research.md`, `featured-apps.md`, `by-language.md`; `content/en/get-started/about-wikimedia.md` (external cards with bottom-aligned supporting-text links + external icon on supporting-text; one description uses the default slot for a Wikidata inline link).

#### Section heading

`SectionHeading.vue` (`::section-heading`) renders a prose `h2` (via `ProseHeading` — hover anchor) with an optional inline Codex **`CdxInfoChip`**. Props: `title` (required), `chip`, `status` (default `notice`), `id` (optional; otherwise slugified from `title` with `github-slugger`), `level` (default `2`). Title and chip labels are content strings in `<bdi>` (not banana-i18n). Status icons are hidden (same catalog exception as navigation-card chips). Also composed inside `ApiCatalogWikimediaSection`.

```md
::section-heading{title="Wikimedia APIs" chip="Recommended" status="notice"}
::
```

#### API catalog project filter

`ApiCatalogWikimediaSection.vue` (`::api-catalog-wikimedia-section`) is a **client-interactive island** on the still-static `/apis` Markdown page: the route stays SSG (not `ssr: false`, not wrapped in `<ClientOnly>`). Pre-render shows the default **Any** filter (all cards); hydration enables show/hide without a full SPA catalog route.

It renders:

1. Header row — Wikimedia APIs + Recommended (`SectionHeading`; `title` / `chip` are **content** props from Markdown) and **Filter by project** (`CdxField` + `CdxCombobox`, Figma 1183:31958). Restores content **`h2`** block-start rhythm via `margin-block-start: var(--spacing-150)` on the header (heading margin is zeroed so the filter can share the row). Heading cluster and filter are **`flex: 0 0 auto`** with **`gap: var(--spacing-150)`** (24px) and **`flex-wrap`**: when the space between the Recommended chip and the filter label would drop below 24px, the filter wraps below the heading. Combobox **`inline-size` / `min-inline-size: var(--size-1600)`** (Codex 16rem / 256px) with **`flex: 0 0 auto`** so flex layout cannot shrink it (a previous `min( var(--size-1600), 100% )` collapsed against a `min-inline-size: 0` parent). Inner Codex input wrappers fill that width.
2. Optional intro (default slot — Markdown)
3. Filtered `NavigationCardGrid` of cards from `config/apiCatalogWikimedia.ts`

**Composable:** `useApiCatalogProjectFilter()` — banana field / option / empty labels, `isolatePickerLabel()` on menu item labels, selected filter id, Codex Combobox label↔id bridge, visible cards. No fetch or URL construction in the Vue component.

**Filter options (banana):** Any, Wikidata / Wikibase, Wikifunctions, Wikimedia Commons, Wikipedia.

**Visibility (product):** Resolved only in `config/apiCatalogWikimedia.ts` via `isApiCatalogCardVisibleForProjectFilter()` (AGENTS rule 6 — no show/hide logic in the Vue component).

| `visibility.kind` | Behaviour |
|-------------------|-----------|
| `universal` | Shown for **Any** and every project **except** optional `excludeProjectIds` |
| `projects` | Shown for **Any** and the listed `projectIds` only |

Current exclusions / project-specific cards:

| Card | Rule |
|------|------|
| Attribution API | `universal` + exclude **Wikifunctions** |
| Lift Wing API | `universal` + exclude **Wikifunctions**, **Wikimedia Commons** |
| GrowthExperiments API | `universal` + exclude **Wikifunctions**, **Wikimedia Commons** |
| Commons analytics API | `projects`: Commons |
| Wikifunctions API | `projects`: Wikifunctions |
| Wikibase GraphQL / REST | `projects`: Wikidata |

Scope InfoChip labels are **content** in config (`notice`): **All projects** (broad coverage), **Multi-project** (subset / not every filter project), or a named project. **All projects** includes MediaWiki REST, Wikimedia REST APIs, ReadingLists, CampaignEvents, Device / Edit / Editor / Media file / Page view analytics, and **Math API** (placed immediately before Wikifunctions). Attribution / Lift Wing / GrowthExperiments keep **Multi-project**. New catalog cards belong in this config array (with `url: '/explorer'` when the destination is the explorer), not as a hand-authored `:::navigation-card-grid` on `/apis`.

Wikipedia currently has no exclusive cards — selecting it shows universal cards that do not exclude Wikipedia.

**i18n split:** Filter chrome → banana-i18n (`api-catalog-filter-*`). Section heading title / chip → content (MDC props). Card title / description / chips / supporting-text → English content in config (v0; per-locale card catalogs can follow).

```md
::api-catalog-wikimedia-section{title="Wikimedia APIs" chip="Recommended"}
Discover our curated selection of production-ready APIs…
::
```

#### Highlight

`Highlight.vue` (`::highlight`) wraps Markdown in the shared **`.fd-highlight`** surface for progressive CTAs / featured blurbs on prose pages (and reusable elsewhere, e.g. an API catalog).

**Not a callout:** Status / alert copy stays `Callout` → `CdxMessage` (`notice` / `warning` / `error` / `success`). Highlight is a **non-status** progressive-subtle panel. Codex has no equivalent surface without message chrome — this is an intentional bespoke exception to “prefer Codex widgets” for content components.

| Token / behaviour | Value |
|-------------------|--------|
| Background | `--background-color-progressive-subtle` |
| Border | none |
| Radius | `--fd-explorer-controls-surface-border-radius` (exploratory **4px**) |
| Padding | `--spacing-75` (**12px**) |
| Block margin | `--spacing-100` (vertical rhythm vs adjacent prose; see DESIGN_REQUIREMENTS) |

CSS lives in `app/assets/css/main.css` so Vue templates may apply `class="fd-highlight"` without the MDC wrapper. Nested paragraphs reset top/bottom margin so single-line CTAs sit flush in the padding; consecutive paragraphs use `--spacing-50` between them.

Highlight copy is **page content** (per-locale Markdown or Vue slots) — not banana-i18n interface strings. The name is independent of code syntax highlighting (Shiki / `mw-highlight`).

**Demo:** `content/en/get-started.md` — quick-start CTA (“Ready to start using Wikimedia APIs? …” with arrow, single paragraph). Also `content/en/get-started/wikimedia-enterprise.md` — high-volume access blurb + **Get started with Wikimedia Enterprise** as a **second paragraph** inside the highlight (**no** arrow; `https://enterprise.wikimedia.com`). Enterprise **body** sections are prose (not cards). Also `content/en/apis.md` — catalog Quick start highlight and stacked API best-practice highlights (Attribution, Authentication, Rate limits).

#### Callouts

`Callout.vue` wraps Codex **`CdxMessage`**. Optional `#title` named slot content is Markdown; MDC already emits a `<p>`, so the component must **not** wrap the title in another `<p>` or `<strong>` (invalid nesting misaligned the status icon from the title). When a title is present:

- The first child paragraph of `.cdx-message__content` is bolded via CSS (Codex multiline message pattern).
- `.cdx-message__content` uses `align-self: flex-start` so the icon aligns with the title row (Codex centers content for single-line messages by default).

Imported wiki message boxes map to `::callout{type=…}` via the remote-content conversion registry (`docs/adr-remote-content-fetching.md`).

#### Code block

`CodeBlock.vue` is the standalone (non-tabbed) code module. It reuses the same bordered panel chrome as framed **Code tabs** — muted border, exploratory **4px** radius (`--fd-explorer-controls-surface-border-radius`), `--background-color-base`, and `--spacing-75` padding on `pre` — without a `CdxTabs` header.

**MDC:** `:::code-block` wrapping a normal fenced code block (Shiki highlighting, line numbers, and diffs still apply). Use a language tag present in `nuxt.config.ts` `content.build.markdown.highlight.langs` (e.g. `bash` / `shell` for curl — not an unknown tag, or highlighting is skipped). The wrapper pins `dir="ltr"` because code / shell / curl samples are inherently LTR. Long lines **soft-wrap** inside the panel (`white-space: pre-wrap`); authors still use `\` + indent for intentional multi-line commands.

**When to use:** One sample (landing API curl, a single language example). Prefer **Code tabs** when authors need language or variant switching.

**Demo / polish surface:** `content/en/index.md` (API band) and `content/en/use-content-and-data.md` → Code block.

#### Code tabs

`CodeTabs.vue` + `CodeTab.vue` wrap Codex **`CdxTabs`** with the **`framed`** prop. Codex documents framed tabs for use inside a bordered module ([Tabs component](https://doc.wikimedia.org/codex/latest/components/demos/tabs.html)); quiet (default) tabs are reserved for shell chrome (`ShellPrimaryNav`). Panel border / radius / `pre` padding tokens match **Code block** — keep them in sync when polishing.

**Why framed:** Tabbed code blocks are self-contained modules on prose pages, not page-level navigation. Framed tabs supply the gray header row, white selected-tab label, and content panel chrome without reimplementing tab interaction states.

**MDC bridge:** `CdxTabs` requires direct `CdxTab` children. MDC nests `:::code-tab` blocks inside `::::code-tabs`, so `CodeTab` registers each panel (label + default-slot render function) during `setup()` via `provide`/`inject`; `CodeTabs` renders `CdxTab` panels from that registry. A hidden `<slot />` mount point keeps registration SSR-safe (registration must not wait for `onMounted`).

**Styling exceptions** (documented; tab header metrics remain Codex-owned):

| Rule | Token / value | Rationale |
|---|---|---|
| Module border | `1px solid var(--border-color-muted)` | Muted module edge per Codex framed-tabs-in-a-box pattern |
| Module radius | `var(--fd-explorer-controls-surface-border-radius)` (**4px**) | Matches CodeBlock / NavigationCard / explorer surfaces (not Codex 2px base) |
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
| Shell scroll regions | `app/layouts/default.vue`, `app/assets/css/page-grid.css`, `app/assets/css/shell-start-nav-scroll.css` (scrollport + scroll-end `::after` spacers), `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/shell-end-panel-nav.css` (legacy end-panel / rail scrollport), `app/assets/css/main.css` |
| Nav collapse + drawer | `app/composables/useShellNavigationCollapse.ts`, `app/composables/useShellNavigationBreadcrumbs.ts`, `app/composables/useShellCollapsedNavMenu.ts`, `app/components/shared/ShellCollapsedNavigation.vue`, `app/components/shared/ShellCollapsedNavMenuOverlay.vue`, `config/shellNavigation.ts`, `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/shell-collapsed-nav-menu.css` |
| Section menu component | `app/components/shared/ShellSidePanelNav.vue` |
| Explorer side nav routing | `app/composables/usePageSectionNav.ts`, `app/utils/explorerRoute.ts`, `config/explorerSideNav.js` |
| Explorer page + modes | `app/pages/explorer/[[view]].vue`, `app/composables/useExplorerMode.ts`, `app/composables/useEnterpriseExplorer.ts`, `config/enterpriseExplorer.ts` |
| Explorer project controls | `app/components/explorer/ExplorerProjectControls.vue`, `app/components/explorer/ExplorerModuleSelectOptionContent.vue` (label-only audience warning chips; Codex exception #14), `app/composables/useExplorerProjectLanguagePicker.ts`, `app/composables/useExplorerModuleSelect.ts`, `config/explorerProjectPicker.ts`, `config/instances.ts`, `config/explorerModuleDescriptions.ts`, `config/explorerSurfaces.ts`, `app/utils/explorerModuleOptInFilter.ts`, `app/utils/explorerModuleRailHeading.ts`, `app/utils/explorerModuleDescription.ts`, `tests/explorerModuleRailHeading.test.mjs`, `app/assets/css/main.css` (explorer picker menu stacking only), `app/assets/css/page-grid.css` (`--fd-explorer-controls-surface-*`), `i18n/*` (`explorer-module-beta-chip-label`, `explorer-module-internal-chip-label`) |
| Explorer Scalar sidebar + module select metadata | `config/explorerInternalSidebarExperiment.ts`, `config/scalar.ts` (`showSidebar`), `app/layouts/default.vue` (`frontdoor-shell--explorer-internal-sidebar`), `app/utils/explorerModuleRailHeading.ts`, `app/utils/explorerEndpointLabels.ts`, `app/utils/explorerModuleDescription.ts`, `config/explorerSurfaces.ts`, `app/pages/explorer/[[view]].vue`, `tests/explorerModuleDescription.test.mjs` (legacy rail: `ExplorerModuleRail.vue` + placement/scroll-cap composables — not mounted when flag is true) |
| Explorer bootstrap + opt-in | `server/api/explorer-bootstrap.get.ts` (OpenAPI fetch, `moduleDescription` via `normalizeOpenApiModuleDescription`), `app/composables/useExplorerBootstrap.ts`, `app/composables/useExplorerOptInFilteredModules.ts`, `app/composables/useExplorerOptInCheckboxGroup.ts`, `app/utils/explorerModuleOptInFilter.ts`, `config/explorerOptIn.ts` (`isExplorerBetaOptInModule`, `isExplorerInternalOptInModule`), `tests/explorerModuleOptInFilter.test.mjs` |
| Write-request production warning (Test Request modal) | `app/components/explorer/scalar/ScalarClientWriteEndpointWarning.vue`, `app/composables/useScalarClientWriteEndpointWarnings.ts`, `app/utils/resolveScalarClientModalAddressBarWarningPlacement.ts`, `app/utils/createScalarWriteEndpointWarningElement.ts`, `app/utils/findOpenScalarClientModal.ts`, `app/utils/getInterfaceMessageTemplate.ts`, `app/scalar/explorerMapConfigPlugins.client.ts` (hooks only — no warning view slots), `config/wikiInstanceTestWikis.ts`, `config/scalarWriteHttpMethods.ts`, `config/scalarClientWriteWarnings.ts`, `app/assets/css/explorer-codex-overrides.css`, `i18n/*` (`explorer-scalar-write-endpoint-warning`, `explorer-scalar-write-test-wiki-name-*`) |
| Test Request modal sticky section titles | `app/assets/css/explorer-codex-overrides.css` (`.explorer-page .scalar-client .request-response-header { z-index: 1 }`) — see **Scalar Test Request modal sticky headers** |
| Test Request modal natural height + scroll clamp | `app/composables/useScalarClientModalBackgroundScrollLock.ts`, `config/explorerSurfaces.ts` (`EXPLORER_TEST_REQUEST_*`), `app/pages/explorer/[[view]].vue` (scoped shell clamp; null `scalarInterface` on `scalarReferenceKey` remount), `app/assets/css/explorer-codex-overrides.css` (overlay `height: auto`, gutter, clear `90svh` / `h-dvh`) — see **Scalar Test Request modal (natural height)** |
| Write-request confirm dialog (Test Request Send, mock) | `app/components/explorer/scalar/ScalarClientWriteRequestConfirmDialog.vue`, `app/composables/useScalarClientWriteRequestConfirmDialog.ts`, `config/scalarClientWriteWarnings.ts` (`SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED`), `app/assets/css/explorer-codex-overrides.css` (containment + actions + title 18px; Codex exception #13), `app/pages/explorer/[[view]].vue` (`#explorer-reference-panel` sibling mount), `app/utils/resolveInterfaceMessage.ts` / `resolveActiveInterfaceLocale.ts` / `getInterfaceMessageTemplate.ts`, `i18n/*` (`explorer-scalar-write-confirm-*`) |
| Enterprise custom viewer | `app/components/explorer/ExplorerEnterpriseCustom.vue`, `app/composables/useEnterpriseSpecOutline.ts`, `server/api/enterprise-spec*.ts` |
| Header chrome | `app/components/shared/ShellHeaderBrand.vue`, `app/components/shared/ShellHeaderUtilityActions.vue`, `app/components/shared/ShellPrimaryNav.vue`, `app/assets/css/shell-primary-nav-overrides.css`, `app/assets/css/shell-codex-overrides.css` (`fd-cdx-popover--arrow-seam-fix`, preferences body padding), `app/composables/useColorMode.ts`, `config/colorMode.ts`, `app/assets/css/color-modes.css` |
| Header auth (Log in / username→account) | `app/composables/useShellAuthNavigation.ts`, `app/composables/useShellHeaderUtilityMenu.ts` (`SHELL_HEADER_UTILITY_MENU_VALUE`), `app/composables/useOAuthSession.ts`, `app/stores/oauthSession.js` |
| OAuth PKCE flow | `server/api/auth/oauth/login.get.ts`, `server/api/auth/oauth/exchange.post.ts`, `app/pages/oauth/callback.vue`, `app/plugins/oauth-handoff.client.ts`, `app/utils/oauthHandoff.ts`, `docs/adr-wikimedia-oauth-authentication.md` |
| OAuth session persistence (refresh-token cookie) | `server/utils/oauthSession.ts`, `server/api/auth/oauth/session.post.ts`, `server/api/auth/oauth/logout.post.ts`, `app/plugins/oauth-handoff.client.ts`, `app/composables/useOAuthSession.ts`, `docs/adr-wikimedia-oauth-authentication.md` §8.6 |
| Account dashboard | `app/pages/account.vue`, `app/components/account/*` (incl. `AccountLoggedOutGate.vue`, `AccountTokenListItemLayout.vue`, `AccountOAuthConsumerListItem.vue`, `AccountResetApiKeyDialog.vue`, `AccountResetCredentialCopyButton.vue`), `app/composables/useAccountDashboardPage.ts`, `app/composables/useDeveloperTokenDashboard.ts`, `app/composables/useAccountResetApiKeyDialog.ts`, `app/composables/useCopyWithCopiedTooltip.ts`, `app/composables/usePrototypeAuthSession.ts`, `stores/prototypeDeveloperTokens.ts`, `config/tokenManagement.ts`, `config/auth.ts`, `config/explorerSurfaces.ts` / `app/assets/css/page-grid.css` (shared exploratory **4px** radius), `app/middleware/content-sidebar.global.ts` |
| Primary nav + redirects | `config/mainNavigation.ts`, `config/contentRedirects.ts`, `app/composables/useMainNavigationLinks.ts`, `app/composables/usePrimaryNavigationTab.ts` |
| Route → nav id | `app/utils/contentRoute.ts`, `app/utils/explorerRoute.ts` |
| Interface strings (section nav) | `i18n/en.json`, `i18n/qqq.json` (`section-nav-*`, `section-nav-site-label`) |
| Interface strings (collapsed nav overlay) | `i18n/*` (`shell-collapsed-nav-menu-*`, `shell-collapsed-nav-label`) |
| Interface strings (account / header auth) | `i18n/*` (`account-*` incl. `account-logged-out-*`, `header-account-label`, `header-auth-link-aria`, `header-login-label`, `header-logout-label`) |
| Interface strings (color theme preferences) | `i18n/*` (`color-mode-group-label`, `color-mode-light-label`, `color-mode-dark-label`, `color-mode-auto-label`, `header-settings-label`) |

---

## Experiment 1 notes

The current implementation is Experiment 1 from the project design document: verifying Scalar multi-spec reactivity in Nuxt 4 using real Wikimedia endpoints. The experiment includes the full discovery flow — `useExplorerBootstrap` aggregates `/api/explorer-bootstrap` (discovery + per-module spec fetch), the REST API module select populates from the live response, and module selection drives Scalar via `visibleOpenApiSpecUrl`. Endpoint browsing uses **Scalar’s native sidebar** (PR #40; `EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR`). Wiki instance selection uses the project + language picker (`useExplorerProjectLanguagePicker`, `config/explorerProjectPicker.ts`). Spec URLs are read directly from the discovery response and passed to Scalar. Write-request Test Request modals include the production **`CdxMessage`** (address-bar only; mocked test-wiki link) documented under **Scalar plugin layer → Write-request production warning**. Full feature scope is described in `AGENTS.md`. The experiment does not include per-module language-level spec selection, OAuth, wiki content sync, Markdown content pages, or search. It establishes the foundational scaffold for the explorer surface and confirms the core runtime spec-switching mechanism — including RTL shell direction switching — before the remaining experiments build on it.