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
│   ├── composables/            # All shared logic; see Composables section below
│   ├── plugins/
│   │   ├── banana-i18n.js      # Registers banana-i18n globally; provides $i18n
│   │   └── explorer-route-navigation.client.ts  # Full reload across /explorer boundary
│   ├── utils/
│   │   └── explorerRoute.ts    # isExplorerRoutePath() for layout and plugins
│   ├── app.vue                 # NuxtPage :page-key for route remounts
│   └── layouts/
│       └── default.vue         # Shell layout; primary nav; sets dir on <html>
│
├── config/                     # Project-level configuration (not Nuxt config)
│   ├── instances.ts            # Wiki instance definitions and base URLs
│   ├── languages.js            # Supported languages with explicit dir declarations
│   ├── mainNavigation.ts       # Primary shell nav order and paths
│   ├── explorerSideNav.js      # Explorer left-rail section structure (banana keys)
│   ├── explorerOptIn.ts        # Explorer opt-in checkbox input values
│   └── scalar.js               # Scalar component defaults
│
├── content/                    # Nuxt Content Markdown source
│   ├── en/                     # English content (index, learn, about, …)
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
| `useExplorerScalarFocus(...)` | Resolves Scalar nav ids and scrolls/focuses a module-rail endpoint after spec load (see Module rail → Scalar operation focus) |
| `useEndPanelNavAlign(...)` | Aligns end-column page navigation with a main-column anchor (explorer project controls; reusable for future section menus) |
| `useContentLocale()` | Current content locale, falling back per the configured chain |
| `useDirection()` | Current text direction ('ltr' or 'rtl') based on active language / wiki instance config |

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

The `<html>` element's `dir` attribute is set reactively in `app/layouts/default.vue` using `useDirection()`, which reads from `config/languages.js`. The Codex RTL stylesheet is loaded conditionally:

```vue
<script setup>
const { direction } = useDirection()
useHead({
  htmlAttrs: { dir: direction },
  link: direction.value === 'rtl'
    ? [{ rel: 'stylesheet', href: '/codex.style-rtl.css' }]
    : []
})
</script>
```

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
| `config/mainNavigation.ts` | Primary shell navigation order, banana message keys, locale-agnostic paths |
| `config/explorerSideNav.js` | Explorer left-rail sections and placeholder links (banana message keys only) |
| `config/explorerOptIn.ts` | Codex checkbox values for beta/internal endpoint filters |
| `config/scalar.js` | Scalar component defaults (theme, layout, enabled features) |

Environment-specific values use Nuxt `runtimeConfig`:
- `runtimeConfig.public.*` — values safe to expose to the client (OAuth client ID, API base URLs)
- `runtimeConfig.*` — server-only values (OAuth client secret)

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

`content/en/learn.md` exercises every feature listed above with inline status notes (works today / not yet configured / not yet implemented). Use it as the acceptance test surface when implementing any item in this section.

---

## Wiki content sync

On-wiki pages with translations (policy, descriptions) are fetched at build time by `scripts/sync-wiki-content.js`. The script:
1. Reads sync targets from `config/wikiContentSources.js`
2. Calls the MediaWiki Action API (`action=parse`) for each page and language
3. Converts HTML output to Markdown using Turndown
4. Writes files to `content/[locale]/[path].md`

The script is run as part of the build pipeline before `nuxt generate`. It is idempotent — running it multiple times produces the same output.

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

## Experiment 1 notes

The current implementation is Experiment 1 from the project design document: verifying Scalar multi-spec reactivity in Nuxt 4 using real Wikimedia endpoints. The experiment includes the full discovery flow — `useDiscovery` fetches `/w/rest.php/discovery` per instance, `useWikiModules` exposes the module list, and the module picker populates from the live response. Spec URLs are read directly from the discovery response and passed to Scalar. Full feature scope is described in `AGENTS.md`. The experiment does not include language-level spec selection, OAuth, wiki content sync, Markdown content pages, or search. It establishes the foundational scaffold for the explorer surface and confirms the core runtime spec-switching mechanism — including RTL shell direction switching — before the remaining experiments build on it.