# AGENTS.md — Front Door Developer Portal

This file instructs AI coding agents working on the Front Door project. Read it in full before writing any code. The rules here are not preferences — they are requirements derived from architectural decisions documented in [`ARCHITECTURE.md`](ARCHITECTURE.md) and UI/UX decisions in [`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md).

---

## Related documentation

Use the right document for the kind of work you are doing:

| Document | Consult for |
|----------|-------------|
| **`AGENTS.md`** (this file) | Non-negotiable implementation rules — always follow |
| **[`ARCHITECTURE.md`](ARCHITECTURE.md)** | System structure, data flow, composables, route boundaries, discovery, technical constraints |
| **[`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md)** | UI/UX: Codex layout system, shell chrome, site navigation IA, API Explorer layout, typography, loading/empty states |
| **[`.agents/skills/`](.agents/skills/)** | Codex agent skills (components, tokens, icons, usage, design principles, bidirectionality, layout, content) — summaries of the [Codex style guide](https://doc.wikimedia.org/codex/latest/style-guide/overview.html); subordinate to this file and `DESIGN_REQUIREMENTS.md` |

**Read [`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md) before changing** anything that affects what users see or how they move through the shell: `app/layouts/`, `app/components/shared/`, shell layout CSS (`app/assets/css/page-grid.css`, `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/shell-start-nav-scroll.css`, `app/assets/css/shell-collapsed-nav-menu.css`, `app/assets/css/shell-end-panel-nav.css`), explorer UI components, or site-wide visual patterns. Implement to match recorded decisions there (e.g. desktop **4 \| 16 \| 4** grid, end-panel nav aligned via `useEndPanelNavAlign`) unless the user explicitly requests a design change.

**Precedence:** If **`DESIGN_REQUIREMENTS.md`** conflicts with this file, **`AGENTS.md` wins**. For technical behaviour (SSR, discovery, composable boundaries), prefer **`ARCHITECTURE.md`**. For visual and interaction behaviour, prefer **`DESIGN_REQUIREMENTS.md`**.

---

## What this project is

Front Door is the Wikimedia REST API developer portal. It serves a language surface that includes English, French, Spanish, Hebrew, Persian, Urdu, and many other languages across multiple wiki instances. It is not a typical LTR-English documentation site. Treat every assumption about language, text direction, and spec availability as something that must be explicitly handled, not assumed.

The project is a **hybrid static + dynamic application**:
- Prose pages (policy, guides, landing pages) are pre-rendered Markdown content served statically.
- The API explorer is a fully client-side SPA, never pre-rendered, that fetches OpenAPI specs at runtime.

These two surfaces have different rules. Know which one you are working on.

---

## Technology stack

- **Framework:** Nuxt 4 with Nuxt Content
- **UI components:** Codex (Wikimedia design system) — `@wikimedia/codex`, GPL-2.0+
- **Interface translation:** banana-i18n exclusively — registered as a global Nuxt plugin
- **Content translation:** per-locale Markdown directories via Nuxt Content
- **API explorer:** `@scalar/api-reference` Vue component — used directly, NOT via `@scalar/nuxt`
- **Auth:** Wikimedia OAuth 2.0 with PKCE — session state in Pinia
- **Search:** `@nuxt/content` FTS5 via `useSearchCollection`; locale partitioning handled in `useContentSearch`
- **State management:** Pinia
- **CSS direction:** native CSS logical properties for first-party CSS; no global CSS flipping layer for third-party explorer styles in the current phase

Do not introduce additional frameworks, UI libraries, or i18n systems. If you believe an exception is warranted, stop and explain why before writing code.

---

## Absolute rules

These are non-negotiable. Do not work around them, do not treat them as suggestions.

### 1. banana-i18n is the only interface i18n system

Every string that appears in the UI as interface text — labels, button text, nav items, error messages, placeholders, ARIA labels, tooltips — comes from banana-i18n. No exceptions.

Do not use:
- Hardcoded English strings in templates or components (except in code comments)
- `vue-i18n` / `$t()` for interface strings
- Any other translation library for UI text

`@nuxtjs/i18n` may be present for content locale routing only. It does not own any user-visible strings.

If you are writing a component and reach for a string, ask: does this string come from banana? If not, make it do so.

### 2. BiDi isolation is mandatory for all external strings

Any string that is not a hardcoded interface string translated through banana-i18n must be wrapped in `<bdi>` tags in templates.

"External string" means: anything sourced from an API, a wiki, an OpenAPI spec, a config file value displayed in the UI, a user input, or a language/instance name from data.

```vue
<!-- ✅ Correct -->
<span>{{ $i18n( 'explorer-instance-label' ) }}: <bdi>{{ wikiInstance.displayName }}</bdi></span>
<bdi>{{ module.name }}</bdi>
<bdi>{{ languageOption.nativeName }}</bdi>

<!-- ❌ Wrong — external string without isolation -->
<span>{{ wikiInstance.displayName }}</span>
```

When HTML is not available (e.g. inside an attribute value), use `unicode-bidi: isolate` via CSS or Unicode FSI/PDI characters. If you are unsure whether a string needs isolation, isolate it.

### 3. The `@scalar/nuxt` module is not used

Scalar is integrated via the `@scalar/api-reference` Vue component directly, inside a `<ClientOnly>` wrapper on the explorer page. The Nuxt module only supports a single static spec and is not suitable for this project's multi-spec, runtime-resolved use case.

Do not install or configure `@scalar/nuxt`.

### 4. The explorer route is client-only

The explorer page must never be server-rendered or pre-rendered. It is configured in `nuxt.config.ts` as:

```ts
routeRules: {
  '/explorer/**': { ssr: false }
}
```

Do not add SSR or SSG behaviour to the explorer route. Do not move OpenAPI spec fetching to the server layer.

### 5. No logic in Vue components

Components render and handle user interaction. They do not:
- Fetch data directly (use composables)
- Construct URLs (use composables or config)
- Contain business logic or conditional rules about instances, languages, or modules
- Manage Pinia stores directly (use composables that encapsulate store access)

If you find yourself writing a `fetch()` or `$fetch()` call inside a `<script setup>` block in a component, move it to a composable.

### 6. All configuration goes in config files

Values that are likely to change, are environment-dependent, or represent project-level decisions belong in `config/`. This includes:
- Supported wiki instances and their base URLs
- Explorer project + language picker options and wiki instance mapping (`config/explorerProjectPicker.ts`)
- Explorer opt-in checkbox defaults and beta-gated module rules (`config/explorerOptIn.ts`)
- REST API module select description fallbacks when OpenAPI omits `info.description`, and per-module OpenAPI suffix strip patterns (`config/explorerModuleDescriptions.ts`)
- Inline collapsible module rail visible endpoint row cap (`config/explorerModuleRail.ts`)
- Explorer control surface tokens for project controls and module rail (`config/explorerSurfaces.ts`)
- Test wiki base URL mapping for write-request experimentation (`config/wikiInstanceTestWikis.ts`)
- Write HTTP methods and Scalar Test Request modal warning flags (`config/scalarWriteHttpMethods.ts`, `config/scalarClientWriteWarnings.ts`)
- Language definitions with explicit `dir` declarations
- Language fallback chains
- OAuth client ID and endpoint URLs
- Scalar configuration defaults
- Remote content sources (Markdown, HTML, or MediaWiki API URLs fetched at build time; see `config/remoteContentSources.ts`)

Do not hardcode these values anywhere else in the codebase. If a component or composable needs a config value, it imports from `config/`.

### 7. Direction is declared, never inferred

The `dir` property of each supported language is explicitly declared in `config/languages.js`. Do not write code that infers text direction from a language code or BCP 47 tag at runtime. Use the declared value from config.

### 8. CSS uses logical properties; no global CSS flipping layer

All CSS authored in this project — SFC `<style>` blocks, layout styles, Nuxt Content prose styles, anything we write — uses **CSS logical properties** (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `border-inline-end`, `text-align: start`, `inline-size`, etc.) instead of their physical counterparts. The browser handles direction flipping automatically from the `dir` attribute on `<html>`.

Do not add a global PostCSS RTL flipping layer at this stage. Explorer content is primarily API-facing and often LTR-dominant; forcing third-party explorer CSS to flip globally can produce incorrect UI behaviour. Direction-sensitive values inside explorer content must be handled by explicit `dir` usage and BiDi isolation (`<bdi>` for external strings).

Do not:
- Ship a separate `*.rtl.css` and swap stylesheets at runtime
- Write physical properties in first-party CSS and rely on a build-time flipper — use logical properties
- Assume the Scalar explorer should mirror all chrome direction changes; keep explorer direction decisions explicit and content-driven

**Documented exception:** WebKit `::-webkit-scrollbar` pseudos in `app/assets/css/shell-start-nav-scroll.css` use physical **`width`** — the API has no logical equivalent. See `ARCHITECTURE.md` → Shell scroll regions and `DESIGN_REQUIREMENTS.md` → Start column section navigation.

**Scroll-end inset on nav scrollports:** Start section nav and the collapsed nav overlay reserve **32px** below the last item via a **`::after` block spacer** (`block-size: var(--spacing-200)`) on the **scrollport** element — not `padding-block-end` on a nested wrapper (nested flex + `overflow: auto` does not always extend scroll range). In-shell rules: `app/assets/css/shell-start-nav-scroll.css` (tablet+ **`.frontdoor-shell__side-panel--start`**, mobile **`.fd-page-grid__start`**). Overlay: `ShellCollapsedNavMenuOverlay.vue`. Site footer keeps **`padding-block-end`** on **`.shell-site-footer`**. See `ARCHITECTURE.md` → Shell section navigation (scroll-end inset).

**Explorer picker menus (`CdxSelect` / `CdxCombobox`):** Under `.explorer-page`, `app/assets/css/main.css` may only raise floating-menu **z-index** and reset list markers. **Do not** override Codex `CdxMenuItem` hover, keyboard **`highlighted`**, or **`selected`** styles — those menus use Codex’s internal `CdxMenu`. Standalone **`CdxMenuItem`** rows (module rail endpoints, start-column section nav) follow separate documented shell exceptions. See `DESIGN_REQUIREMENTS.md` → REST API module select + opt-in (Codex interaction).

See `ARCHITECTURE.md` → "CSS direction strategy" for the full rationale.

### 9. Content components use Codex

Vue components placed in `app/components/content/` are auto-registered as MDC components and callable from Markdown. When building or modifying these components, use Codex widgets wherever a suitable one exists. Do not introduce bespoke styling for things Codex already covers (buttons, messages/callouts, tabs, icons).

- Use `CdxIcon` + `cdxIconLink` in `ProseH2.vue` … `ProseH6.vue` for heading anchor icons. The default `@nuxtjs/mdc` heading component wraps the full heading text in `<a>` — the override renders heading text as plain text and places a `CdxIcon` link alongside it, shown on hover via CSS.
- Use `CdxMessage` for callout/alert boxes — its `type` prop covers `notice`, `warning`, and `error` variants.
- Use `CdxTabs` + `CdxTab` for tabbed code groups.
- Use `CdxButton` for inline call-to-action buttons.
- Use `CdxIcon` with the appropriate `cdxIcon*` constant for decorative icons (e.g. `cdxIconLinkExternal` on external links).

All other rules apply inside content components: banana-i18n for interface strings, `<bdi>` for external strings, CSS logical properties.

For the full feature status and implementation plan see `ARCHITECTURE.md` → "Markdown content pages" and `docs/TECH_DECISIONS.md` → "Markdown content pages".

---

## Code quality rules

### DRY

If the same logic appears in more than one place, extract it. Repeated patterns become composables (if stateful/reactive) or utility functions (if pure). Repeated template structures become components parameterised by props.

### Composable naming

Composables live in `composables/` and are named with the `use` prefix describing what they provide:

- `useExplorerProjectLanguagePicker(instanceId)` — project + language combobox state; maps to wiki instance id via `config/explorerProjectPicker.ts`
- `useExplorerModuleSelect(visibleModules, …)` — REST API module `CdxSelect` menu items (`label`, `supportingText`, `description`), `menu-config`, `default-label`, and selection bridge for project controls
- `useWikiModules(instance)` — fetches and caches modules for a given instance
- `useLocaleWithFallback(requestedLocale)` — resolves the best available locale
- `useOAuthSession()` — provides token state and auth actions
- `useDiscovery(instance)` — fetches and parses the /discovery endpoint
- `useExplorerModuleRailPlacement()` — module rail Teleport target and layout mode (end column vs inline)
- `useExplorerModuleRailInlineEndpointScrollCap(scrollport, endpointList, …)` — inline rail endpoint scrollport cap (`config/explorerModuleRail.ts`)
- `useScalarClientWriteEndpointWarnings(scalarInterface, selectedWikiInstanceId)` — injects write-request checkbox and production warning into the Scalar Test Request modal
- `useScalarWriteRequestTestWiki(scalarConfiguration)` — rewrites outbound write requests to the mapped test wiki when the modal checkbox is checked
- `useScalarWriteRequestAddressBarSync(scalarInterface, selectedWikiInstanceId)` — keeps the modal address bar server URL aligned with the test-wiki checkbox

### Documentation

Every exported function, composable, and class must have a JSDoc block. No exceptions.

The docblock must include:
- A one-sentence description of what it does
- `@param` entries for every parameter, with type and description
- `@returns` with type and description
- Any non-obvious side effects, watchers established, or cleanup behaviour

```js
/**
 * Resolves the OpenAPI spec URL for a given wiki instance, language, and module.
 *
 * Queries the instance's /discovery endpoint to find the matching module,
 * then returns the spec URL for the requested language. Falls back through
 * the language fallback chain defined in config/languages.js if the
 * requested language is not available for the given module.
 *
 * @param {Ref<string>} instance  - Reactive wiki instance ID (e.g. 'enwiki')
 * @param {Ref<string>} language  - Reactive BCP 47 language tag
 * @param {Ref<string>} module    - Reactive REST module name from /discovery
 * @returns {{ specUrl: ComputedRef<string | null>, isLoading: Ref<boolean>, hasError: Ref<boolean> }}
 */
export function useSpecUrl( instance, language, module ) { ... }
```

Inline comments are required for:
- Any non-obvious logic
- Workarounds (must include a brief explanation of why the workaround is needed)
- Bespoke MediaWiki-specific behaviour
- Edge cases in language fallback or spec resolution

### Variable naming

Use full, descriptive names. Domain terms use their full form.

| Do not use | Use instead |
|---|---|
| `inst` | `wikiInstance` |
| `lang` | `selectedLanguage` |
| `mod` | `restModule` |
| `spec` | `openApiSpecUrl` |
| `cb` | `onOAuthCallback` |
| `res` | `discoveryResponse` |
| `cfg` | `scalarConfiguration` |
| `fallback` | `languageFallbackChain` |

Booleans: `isLoading`, `hasError`, `isAuthenticated`, `shouldShowFallbackNotice`
Boolean functions: `isSpecAvailable()`, `hasTokenExpired()`, `canMakeRequest()`
Event handler props: `onInstanceChange`, `onLanguageSelect`, `onAuthComplete`

---

## RTL and BiDi checklist

Before marking any component complete, verify:

- [ ] Layout, spacing, and shell/explorer UI patterns match [`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md) when the change is user-visible
- [ ] All interface strings go through banana-i18n
- [ ] All external strings (from APIs, specs, config data shown in UI) are wrapped in `<bdi>`
- [ ] First-party CSS uses logical properties (`margin-inline-*`, `padding-inline-*`, `inset-inline-*`, `text-align: start/end`, etc.) — no `left`/`right` physical properties in CSS we author
- [ ] CSS does not pin `direction` (to `ltr` or `rtl`) unless that direction is genuinely required for the content. Most elements should inherit direction from the UI. Pin direction only with intent — for example, an input that accepts URLs, file paths, code, or other inherently LTR content should be `dir="ltr"` even when the surrounding UI is RTL; an input that accepts Arabic or Hebrew names should be `dir="rtl"` even when the UI is LTR. When in doubt, prefer `dir="auto"` over a hardcoded direction. Any intentional direction pin must be accompanied by a brief comment explaining why.
- [ ] Explorer-specific direction choices are explicit; do not rely on global CSS flipping for Scalar
- [ ] The component works correctly when the interface language is Arabic or Hebrew (RTL layout)
- [ ] The component works correctly when the interface is LTR but the displayed wiki instance is an RTL-language wiki
- [ ] Search inputs use `dir="auto"` or equivalent dynamic direction binding
- [ ] Start nav / collapsed overlay scroll-end inset uses **`::after` spacer on the scrollport** (`shell-start-nav-scroll.css`, `ShellCollapsedNavMenuOverlay.vue`) — not `padding-block-end` on nested wrappers
- [ ] Explorer **`CdxSelect`** / **`CdxCombobox`** floating menus use native Codex MenuItem interaction states — no custom hover / highlighted / selected CSS on `.explorer-page` (`main.css` z-index + list-style only)
- [ ] **Module rail** standalone **`CdxMenuItem`** rows: path uses **`--color-progressive`** on hover and when selected; HTTP method tags keep semantic colours (do not blanket progressive on hover/selected); selected rows have **no** Codex progressive-subtle background fill
- [ ] Scalar Test Request modal write-request **`CdxCheckbox`** uses banana-i18n labels; production wiki display name and test wiki hostname are wrapped in `<bdi>` (hostname also `dir="ltr"` with monospace styling)

---

## What to do when you are uncertain

**If a requirement is ambiguous:** Stop. Write a comment in the code with `// QUESTION:` describing the ambiguity, implement the most conservative interpretation, and flag it in your response. Do not make silent assumptions.

**If a third-party library behaves unexpectedly:** Document it with an inline comment explaining what was expected, what actually happens, and the workaround used. Include a link to the relevant issue if one exists.

**If you need to deviate from these rules:** Explain why before writing the code. The rules exist for specific reasons documented in [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md) — if the reason no longer applies, the rule can be revisited, but that is a decision, not a default.

---

## Experiment 1 scope (current task)

The current task is Experiment 1 from the design document: verifying that Scalar's `@scalar/api-reference` Vue component can switch between multiple specs at runtime inside a Nuxt 4 `<ClientOnly>` wrapper, using real Wikimedia API endpoints.

---

### Real endpoints to use

The experiment uses a curated set of real Wikimedia REST API endpoints spanning different projects and languages. This tests that spec switching works across genuinely different specs, not just trivial URL swaps.

#### Confirmed base API URLs

The MediaWiki Core REST API follows this pattern for all Wikimedia wikis:
```
{wiki_base}/w/rest.php/v1/
```

The Wikibase REST API (Wikidata and Wikibase instances) uses:
```
https://www.wikidata.org/w/rest.php/wikibase/v1
```

#### Spec URL pattern and discovery

Spec URLs are **never hardcoded or interpolated**. They are always derived at runtime from the `/discovery` endpoint of each wiki instance:

```
{wiki_base}/w/rest.php/discovery
```

The discovery response lists all REST modules available for that instance, including the spec URL for each. The agent must call `/discovery` for each configured instance and use the spec URLs exactly as returned — no pattern construction, no guessing module names.

`module` is always the literal `moduleType` segment in the path (i.e. `specs/v0/module/{name}/{version}`), but this is an implementation detail of what discovery returns — the code should not reconstruct this pattern. It should read the spec URL directly from the discovery response and pass it to Scalar.

Example discovery response structure (approximate):
```json
{
  "modules": [
    {
      "name": "growthexperiments",
      "version": "v0",
      "specUrl": "/w/rest.php/specs/v0/module/growthexperiments/v0"
    },
    ...
  ]
}
```

The `useDiscovery(instance)` composable fetches this endpoint, caches the result, and returns the list of available modules with their spec URLs. The `useSpecUrl(instance, moduleName)` composable selects the matching entry. Neither constructs a URL from parts.

#### Instances and languages to test

The community explorer uses a **project + language** picker (`ExplorerProjectControls.vue`, `useExplorerProjectLanguagePicker`) that resolves to wiki instance ids in `config/explorerProjectPicker.ts`. Instance metadata lives in `config/instances.ts`:

```ts
/**
 * config/instances.ts — wiki instances referenced by the picker mapping.
 *
 * Spec URLs are never stored here; they come from each instance's
 * /w/rest.php/discovery endpoint at runtime.
 */
export const WIKI_INSTANCES = [
  { id: 'enwiki',  baseUrl: 'https://en.wikipedia.org',      dir: 'ltr', language: 'en' }, // Wikipedia + English
  { id: 'eswiki',  baseUrl: 'https://es.wikipedia.org',      dir: 'ltr', language: 'es' }, // Wikipedia + Spanish
  { id: 'hewiki',  baseUrl: 'https://he.wikipedia.org',      dir: 'rtl', language: 'he' }, // Wikipedia + Hebrew
  { id: 'fawiki',  baseUrl: 'https://fa.wikipedia.org',      dir: 'rtl', language: 'fa' }, // Wikipedia + Farsi
  { id: 'commonswiki', baseUrl: 'https://commons.wikimedia.org', dir: 'ltr', language: 'en' }, // Wikimedia Commons
  { id: 'wikidata', baseUrl: 'https://www.wikidata.org',      dir: 'ltr', language: 'en' }, // Wikidata
]
```

**Picker UI (banana-i18n):** Project — Wikipedia (default), Wikimedia Commons, Wikidata. Language — English (default), Spanish, Hebrew, Farsi; **disabled** when Commons or Wikidata is selected.

This set is chosen deliberately:
- **enwiki / eswiki**: LTR Wikipedia in two content languages
- **hewiki / fawiki**: RTL Wikipedia — tests that switching instance `dir` in `config/instances.ts` updates shell direction without breaking BiDi isolation
- **commonswiki**: Different Wikimedia project (MediaWiki Core REST API on Commons)
- **wikidata**: Different API surface (Wikibase REST API, not MediaWiki Core) — tests that Scalar handles structurally different specs cleanly

---

### In scope

- Minimal Nuxt 4 project scaffold with correct directory structure per `ARCHITECTURE.md`
- Scalar installed as `@scalar/api-reference` (not `@scalar/nuxt`)
- A single explorer page at `/explorer` with `ssr: false`
- A `<ClientOnly>` wrapper mounting `ApiReference` with a reactive configuration object
- `useDiscovery(instance)` composable — fetches `{baseUrl}/w/rest.php/discovery` for the selected instance and returns the list of available modules with their spec URLs as provided by the response
- `useWikiModules(instance)` composable — wraps `useDiscovery`, extracts the module list, caches per instance
- Project + language pickers (`CdxCombobox` in a fieldset) populated from `config/explorerProjectPicker.ts`; selections resolve to wiki instance ids in `config/instances.ts` via `useExplorerProjectLanguagePicker`
- REST API module select (`CdxSelect`) populated from opt-in-filtered bootstrap modules in discovery order via `useExplorerModuleSelect`; default module is the first healthy entry in discovery order (`resolveFirstExplorerRailModule`); menu options include **`description`** (OpenAPI `info.description` at bootstrap, with config fallbacks and configured suffix stripping), beta/version metadata in MenuItem **`supportingText`**, **`default-label`**, and Codex **`menu-config`** (`boldLabel`, `hideDescriptionOverflow: false` for wrapping). Explorer picker menus must use native Codex MenuItem interaction states — do not override hover / highlighted / selected CSS on `.explorer-page`
- End-column **module rail** (`ExplorerModuleRail`) lists endpoints for the **selected REST API module** only; endpoint rows use **`CdxMenuItem`** (same shell pattern as `ShellSidePanelNav`); **`--fd-explorer-controls-surface-*`** background and border radius on project controls and rail (`config/explorerSurfaces.ts`); selected endpoint indicated via **`CdxMenuItem` `:selected`** (progressive path, no progressive-subtle fill); sticky scroll divider when the endpoint list scrolls; rail top aligns with **`.explorer-page__scalar-shell`** via `useEndPanelNavAlign` on desktop (≥ 1120px); below 1120px the rail teleports inline below project controls (`useExplorerModuleRailPlacement`) with **`--spacing-100`** gap and a collapsible endpoint panel; when expanded with more than **`EXPLORER_MODULE_RAIL_INLINE_MAX_VISIBLE_ENDPOINTS`** (7) endpoints, **`useExplorerModuleRailInlineEndpointScrollCap`** caps the scrollport to seven visible rows with internal scroll
- Scalar re-renders against the spec URL from discovery when instance (project/language), REST module select, or endpoint selection changes
- Verification that reactive config update (via `Object.assign` or equivalent) re-renders Scalar without full component teardown
- Verification that switching to an RTL wiki instance (`hewiki`, `fawiki`) correctly sets `dir="rtl"` on the shell from `config/instances.ts`; switching back sets `dir="ltr"`
- banana-i18n installed as a Nuxt plugin; all picker labels and UI strings go through banana
- Codex components for explorer controls (`CdxCombobox`, `CdxSelect`, `CdxField`, `CdxCheckbox`, …)
- Basic RTL: `dir` attribute on `<html>` set reactively from the selected instance's `dir` in `config/instances.ts`
- Picker menu labels use BiDi isolation (`isolatePickerLabel()`); module names in the rail wrapped in `<bdi>`
- **Write-request test wiki (Test Request modal):** for write HTTP methods on instances with a mapped test wiki (`config/wikiInstanceTestWikis.ts`), a **`CdxCheckbox`** below the modal address bar routes requests to the test wiki when checked (default checked); unchecking shows a **`CdxMessage`** production warning and sends write requests to the production wiki. Implemented via DOM injection + Scalar `ClientPlugin` slots — see `ARCHITECTURE.md` → Write-request test wiki

### Out of scope for Experiment 1

- Language-level spec selection (per-instance per-language specs — next phase)
- Full OAuth integration (Experiment 2)
- Wiki content pull (Experiment 3)
- Nuxt Content / Markdown pages
- Full language fallback logic
- Search
- Production-ready styling

---

### Success signals

- All six wiki instances load their spec in Scalar without errors
- Switching project, language, or instance re-renders Scalar cleanly, within ~500ms, no Vue reactivity warnings
- Switching to `hewiki` or `fawiki` correctly sets `dir="rtl"` on the shell; switching back sets `dir="ltr"`
- Language combobox is disabled when Wikimedia Commons or Wikidata is selected
- REST API module select defaults to the first healthy module in discovery order (after opt-in filter)
- Module rail heading and endpoint paths use `<bdi>`; HTTP method tags use `dir="ltr"`; picker menu labels and module descriptions use BiDi isolation (`isolatePickerLabel()`); REST API module select uses native Codex menu hover, keyboard highlight, and selected styling (no custom `.cdx-menu-item` state overrides on the explorer page); module rail endpoint rows use documented standalone-`CdxMenuItem` exceptions (progressive path on hover/selected, semantic method colours preserved, transparent selected background); project controls module row uses **`column-gap: var(--spacing-150)`** (24px) between REST API module select and Opt-in fieldset; inline collapsible rail shows at most seven endpoint rows before the endpoint scrollport scrolls internally; sticky scroll divider when endpoint list is scrolled
- Write-request Test Request modal: **`CdxCheckbox`** appears below the address bar for POST/PUT/PATCH/DELETE when a test wiki is mapped; unchecked state shows production warning naming the active wiki instance and test wiki hostname; checked state rewrites requests and the address bar URL to the test wiki
- If `Object.assign` is required as a workaround for Scalar reactivity, it is documented with an inline comment

### Failure signals to report

- If any instance's spec URL pattern cannot be confirmed: document findings and fall back to Petstore placeholder for that entry, clearly labelled
- If spec switching requires full component remount (`v-if` + `:key`): document this explicitly — the fallback is acceptable but must be noted
- If Scalar fails to render a structurally different spec (e.g. Wikidata's Wikibase API vs MediaWiki Core): document the failure mode and whether it is a Scalar limitation or a spec validity issue