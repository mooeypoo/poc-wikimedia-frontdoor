# AGENTS.md — Front Door Developer Portal

This file instructs AI coding agents working on the Front Door project. Read it in full before writing any code. The rules here are not preferences — they are requirements derived from architectural decisions documented in [`ARCHITECTURE.md`](ARCHITECTURE.md) and UI/UX decisions in [`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md).

---

## Related documentation

Use the right document for the kind of work you are doing:

| Document | Consult for |
|----------|-------------|
| **`AGENTS.md`** (this file) | Non-negotiable implementation rules — always follow |
| **[`ARCHITECTURE.md`](ARCHITECTURE.md)** | System structure, data flow, composables, route boundaries, discovery, technical constraints |
| **[`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md)** | **UI/UX:** Codex layout system (2-panel desktop grid, breakpoints, margins), shell chrome, site navigation IA, API Explorer layout (side nav, project controls, module rail), typography, loading/empty states, prototype vs final behaviour |

**Read [`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md) before changing** anything that affects what users see or how they move through the shell: `app/layouts/`, `app/components/shared/`, shell layout CSS (`app/assets/css/page-grid.css`, `shell-end-panel-nav.css`), explorer UI components, or site-wide visual patterns. Implement to match recorded decisions there (e.g. desktop **4 \| 16 \| 4** grid, end-panel nav aligned via `useEndPanelNavAlign`) unless the user explicitly requests a design change.

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
- **Search:** Lunr.js with `lunr-languages`
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
- Language definitions with explicit `dir` declarations
- Language fallback chains
- OAuth client ID and endpoint URLs
- Scalar configuration defaults
- Wiki content sync sources

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

See `ARCHITECTURE.md` → "CSS direction strategy" for the full rationale.

---

## Code quality rules

### DRY

If the same logic appears in more than one place, extract it. Repeated patterns become composables (if stateful/reactive) or utility functions (if pure). Repeated template structures become components parameterised by props.

### Composable naming

Composables live in `composables/` and are named with the `use` prefix describing what they provide:

- `useSpecUrl(instance, language, module)` — resolves an OpenAPI spec URL
- `useWikiModules(instance)` — fetches and caches modules for a given instance
- `useLocaleWithFallback(requestedLocale)` — resolves the best available locale
- `useOAuthSession()` — provides token state and auth actions
- `useDiscovery(instance)` — fetches and parses the /discovery endpoint

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
- [ ] Any new string key added to the UI has a corresponding entry in the banana message files

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

Use the following set for the picker. This covers: different projects, LTR and RTL languages, and different API surfaces.

```js
/**
 * config/instances.js
 *
 * Defines the wiki instances available in the Front Door explorer.
 *
 * Each entry declares the instance ID, display label i18n key, base URL,
 * and text direction. It does NOT contain spec URLs — those are fetched
 * at runtime from each instance's /w/rest.php/discovery endpoint by
 * useDiscovery(instance). No spec URL is ever hardcoded or interpolated here.
 *
 * The `dir` field must be declared explicitly — do not infer from
 * language code at runtime.
 */
export const WIKI_INSTANCES = [
  {
    id: 'enwiki',
    label: 'English Wikipedia',
    baseUrl: 'https://en.wikipedia.org',
    dir: 'ltr',
    language: 'en',
  },
  {
    id: 'arwiki',
    label: 'Arabic Wikipedia',
    baseUrl: 'https://ar.wikipedia.org',
    dir: 'rtl',
    language: 'ar',
  },
  {
    id: 'frwiki',
    label: 'French Wikipedia',
    baseUrl: 'https://fr.wikipedia.org',
    dir: 'ltr',
    language: 'fr',
  },
  {
    id: 'hewiki',
    label: 'Hebrew Wikipedia',
    baseUrl: 'https://he.wikipedia.org',
    dir: 'rtl',
    language: 'he',
  },
  {
    id: 'wikidata',
    label: 'Wikidata',
    baseUrl: 'https://www.wikidata.org',
    dir: 'ltr',
    language: 'en',
  },
  {
    id: 'mediawiki',
    label: 'MediaWiki.org',
    baseUrl: 'https://www.mediawiki.org',
    dir: 'ltr',
    language: 'en',
  },
]
```

This set is chosen deliberately:
- **enwiki / frwiki / mediawiki**: LTR, different projects — tests that spec switching works across typical cases
- **arwiki / hewiki**: RTL — tests that switching to an RTL-language instance does not corrupt the shell direction or break BiDi isolation
- **wikidata**: Different API surface (Wikibase REST API, not MediaWiki Core REST API) — tests that Scalar handles structurally different specs cleanly

---

### In scope

- Minimal Nuxt 4 project scaffold with correct directory structure per `ARCHITECTURE.md`
- Scalar installed as `@scalar/api-reference` (not `@scalar/nuxt`)
- A single explorer page at `/explorer` with `ssr: false`
- A `<ClientOnly>` wrapper mounting `ApiReference` with a reactive configuration object
- `useDiscovery(instance)` composable — fetches `{baseUrl}/w/rest.php/discovery` for the selected instance and returns the list of available modules with their spec URLs as provided by the response
- `useWikiModules(instance)` composable — wraps `useDiscovery`, extracts the module list, caches per instance
- An instance picker populated from `config/instances.js` (six instances)
- A module picker populated from the discovery response for the selected instance — lists all available modules, uses the spec URL exactly as returned by discovery
- Scalar re-renders against the spec URL from discovery when either instance or module selection changes
- Verification that reactive config update (via `Object.assign` or equivalent) re-renders Scalar without full component teardown
- Verification that switching between LTR and RTL instances correctly updates the shell `dir` attribute
- banana-i18n installed as a Nuxt plugin; all picker labels and UI strings go through banana
- At least one Codex component used (e.g. `CdxSelect` for both pickers)
- Basic RTL: `dir` attribute on `<html>` set reactively from the selected instance's `dir` in `config/instances.js`
- Instance names and module names in pickers wrapped in `<bdi>`

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

- All six instances load their spec in Scalar without errors
- Switching between instances re-renders Scalar cleanly, within ~500ms, no Vue reactivity warnings
- Switching to arwiki or hewiki correctly sets `dir="rtl"` on the shell; switching back sets `dir="ltr"`
- Instance display names in the picker are wrapped in `<bdi>`
- If `Object.assign` is required as a workaround for Scalar reactivity, it is documented with an inline comment

### Failure signals to report

- If any instance's spec URL pattern cannot be confirmed: document findings and fall back to Petstore placeholder for that entry, clearly labelled
- If spec switching requires full component remount (`v-if` + `:key`): document this explicitly — the fallback is acceptable but must be noted
- If Scalar fails to render a structurally different spec (e.g. Wikidata's Wikibase API vs MediaWiki Core): document the failure mode and whether it is a Scalar limitation or a spec validity issue