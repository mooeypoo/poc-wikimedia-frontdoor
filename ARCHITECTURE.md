# ARCHITECTURE.md — Front Door Developer Portal

This document describes the architecture of the Front Door project: how it is structured, why key decisions were made, and how the main concerns are separated. Read this alongside `AGENTS.md`, which describes behavioural rules for working in the codebase.

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
│   │   └── banana-i18n.js      # Registers banana-i18n globally; provides $i18n
│   └── layouts/
│       └── default.vue         # Shell layout; sets dir attribute on <html>
│
├── config/                     # Project-level configuration (not Nuxt config)
│   ├── instances.js            # Wiki instance definitions and base URLs
│   ├── languages.js            # Supported languages with explicit dir declarations
│   └── scalar.js               # Scalar component defaults
│
├── content/                    # Nuxt Content Markdown source
│   ├── en/                     # English content
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

**Where:** `composables/`, `scripts/`, Nuxt server routes (`server/`)

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

**Where:** `config/`, composables that encode project rules

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

**Does not contain:** Fetch calls, URL construction, fallback logic, business rules.

---

## Composables reference

All composables live in `composables/` and follow the `use` naming convention. Each must have a full JSDoc block.

| Composable | Provides |
|---|---|
| `useDiscovery(instance)` | Fetches and caches the raw `/w/rest.php/discovery` response for a given instance; all module and spec URL data flows from here |
| `useWikiModules(instance)` | Wraps `useDiscovery`; returns the reactive list of available modules with their spec URLs exactly as provided by discovery |
| `useSpecUrl(instance, moduleName)` | Selects the spec URL for a named module from the discovery response; never constructs URLs from parts |
| `useLocaleWithFallback(requestedLocale)` | Best available locale given the fallback chain in config |
| `useOAuthSession()` | Token state, auth initiation, token display data; wraps the Pinia oauthSession store |
| `useScalarConfig(specUrl)` | Reactive Scalar configuration object for a given spec URL; handles Object.assign update pattern |
| `useContentLocale()` | Current content locale, falling back per the configured chain |
| `useDirection()` | Current text direction ('ltr' or 'rtl') based on active language config |

---

## i18n architecture

### Interface strings: banana-i18n only

banana-i18n is registered in `plugins/banana-i18n.js` and provides `$i18n()` globally across all Vue components. It is the **only** system that may produce user-visible interface strings.

Message files live in `i18n/[locale].json` using MediaWiki message format (supports CLDR plurals, gender, named parameters).

`@nuxtjs/i18n` may be present for **content locale routing only** — it handles URL locale prefixes (e.g. `/ar/policy`). It owns no user-visible strings. Never call `$t()` for interface text.

### Content translation: Nuxt Content per-locale directories

Markdown content for prose pages lives in `content/[locale]/`. Nuxt Content queries the appropriate locale directory based on the current route locale. Language fallback (requesting content in a locale that has no file) is handled in the page component's `queryContent()` call, falling back through the chain defined in `config/languages.js`.

### Explorer internal strings: accepted exception

Scalar renders its own internal UI strings (button labels, response section headers, etc.) outside the Nuxt component tree. These do not go through banana-i18n. This is the one documented exception: it is third-party developer tooling UI, not our interface. It is noted here explicitly so it is not mistaken for an oversight.

---

## API explorer architecture

### Why `@scalar/api-reference` directly

The `@scalar/nuxt` module supports only a single spec configured at build time. This project requires runtime resolution of specs across hundreds of instance + language + module combinations. The module is therefore not used. The Vue component is imported and mounted directly in `app/pages/explorer/index.vue` inside a `<ClientOnly>` wrapper.

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

The `<html>` element's `dir` attribute is set reactively in `layouts/default.vue` using `useDirection()`, which reads from `config/languages.js`. The Codex RTL stylesheet is loaded conditionally:

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

---

## Configuration files

All project-level configuration lives in `config/`. Files are documented with a file-level JSDoc block describing their purpose and the effect of each key.

| File | Contains |
|---|---|
| `config/instances.js` | Wiki instance IDs, display name i18n keys, base URLs |
| `config/languages.js` | Language codes, explicit `dir` declarations, fallback chains |
| `config/scalar.js` | Scalar component defaults (theme, layout, enabled features) |

Environment-specific values use Nuxt `runtimeConfig`:
- `runtimeConfig.public.*` — values safe to expose to the client (OAuth client ID, API base URLs)
- `runtimeConfig.*` — server-only values (OAuth client secret)

---

## Search

Per-language full-text search is implemented using Lunr.js with `lunr-languages`. A separate index is built per locale during `nuxt generate`. The search input uses `dir="auto"` to handle RTL query input correctly.

Languages not supported by Lunr's stemmer list fall back to the default (language-agnostic) stemmer. This is documented in the search composable.

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