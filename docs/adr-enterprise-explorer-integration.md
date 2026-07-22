# ADR: Enterprise API Explorer Integration

**Status:** All phases (A–F) complete; pending browser sign-off on C1/E1/F1–F5 QA checklists. **Superseded in part — see the Update (2026-07-22) note below.**
**Scope:** API Explorer page — Enterprise mode toggle, configurable Scalar rendering, Enterprise OpenAPI spec integration, plus a custom (non-Scalar) tag-driven Enterprise viewer

---

## Update (2026-07-22): Limited mode removed; spec served locally

After experimenting with three Enterprise sidebar entries, two conclusions
supersede parts of the original ADR below. The historical narrative (Phases A–F,
§7 gap analysis, the decision log entries dated 2026-06-xx) is retained as the
record of *why* each mode was built; where it conflicts with the two points
here, **this note wins**.

1. **The `enterprise-limited` mode ("Limited Enterprise API" — path D-a, Scalar
   with hide flags) is removed.** Only two Enterprise sidebar entries remain: the
   full Scalar experience (`enterprise-full`) and the custom non-Scalar viewer
   (`enterprise-custom`). The removal deletes: the `enterprise-limited` side-nav
   entry, `ENTERPRISE_LIMITED_SCALAR_OVERRIDES` from `config/enterpriseExplorer.ts`,
   the `enterprise-limited` arm of the `ExplorerMode` union and of
   `explorerRoute.ts` (segment + mode mapping), the `mode` parameter of
   `useEnterpriseExplorer()` (only the full overrides remain), and the
   `explorer-side-nav-enterprise-apis-limited` i18n key in every locale + qqq.
   The `enabled` toggle still governs the two surviving entries.

2. **The Enterprise OpenAPI spec is served from the local system, not fetched
   from a remote endpoint.** The spec is committed at `server/assets/wme-api.yaml`
   and read through Nitro's server-asset storage (`useStorage('assets:server')`)
   by both server routes. This makes the §8.10 CORS finding and the "server-side
   proxy for a remote URL" framing obsolete: `/api/enterprise-spec` and
   `/api/enterprise-spec-parsed` no longer perform any outbound fetch, carry no
   User-Agent, and cannot fail with an upstream `502` — they return `500` only if
   the bundled asset is missing. `ENTERPRISE_SPEC_URL` still points at
   `/api/enterprise-spec` so Scalar's consumption is unchanged. Server-assets
   (over a relative `fs` path) is chosen so the file is included in the Netlify
   serverless bundle; `config/` is reserved for build-time TS/JS modules, not
   runtime-served data.

---

## 1. Problem statement

The Unified Front Door API Explorer currently serves one audience: community developers interacting with the Wikimedia MediaWiki REST API across wiki instances.  A second audience exists — researchers and developers who need both community APIs (for discovery) and Enterprise APIs (for content delivery, where HTML is more convenient).  The Explorer must support surfacing Enterprise API endpoints without conflating them with the free/open community APIs.

Two operational product and technical constraints bound this work:

- **Operational product separation**: Enterprise APIs require a distinct, toggled experience due to operational product concerns.  The integration must be toggled, not blended.
- **Undecided design**: Product acknowledges the final Enterprise experience is still TBD, with a spectrum from "extreme limited info" (endpoint list + links to Enterprise docs) to "full API Explorer" (interactive Scalar with the Enterprise spec).  The implementation must accommodate both ends without committing to either prematurely.

---

## 2. Scope of this ADR

This ADR does the following:

- Documents the current state of every system the Enterprise integration would touch
- Proposes architectural decisions for how Enterprise mode fits into the existing explorer
- Surfaces all open ambiguities and assigns them to decision-makers
- Provides a level-of-effort breakdown for implementation

This ADR does **not**:

- Make final product decisions about which Enterprise experience to ship
- Include final designs (pending from product)
- Authorize implementation (see §9 for prerequisites)

---

## 3. Enterprise spec

> **Superseded by the Update (2026-07-22) note.** The spec is no longer fetched
> from the remote URL below; it is committed at `server/assets/wme-api.yaml` and
> served from the local system. The architectural points about not routing it
> through discovery and it having no per-wiki variation still hold. The original
> text is kept for context.

**Original source (no longer reachable):** `https://api.enterprise.wikimedia.com/spec/spec.yaml`

This is a static OpenAPI YAML.  It is not fetched via the Wikimedia MediaWiki discovery endpoint (`/w/rest.php/specs/v0/discovery`) and does not follow the multi-instance, multi-module model of the community APIs.

**What this means architecturally:**

- The Enterprise spec **must not** go through `/server/api/explorer-bootstrap.get.ts` — that route is scoped to wiki instances and the discovery protocol.
- The spec has no per-wiki variation.  The consumed URL (`ENTERPRISE_SPEC_URL`) belongs in config; the spec document itself is a bundled server asset (`server/assets/wme-api.yaml`), not runtime discovery.
- The existing remote content fetching infrastructure (`/scripts/fetch-remote-content.mjs` and `config/remoteContentSources.ts`) imports Markdown prose pages via a standalone, pre-committed fetch step (not the build).  The Enterprise spec is a separate concern: it is served by `/api/enterprise-spec` (read from the local asset) and consumed at runtime by Scalar (passed as `spec.url`).

**Proposed config location:** A new `config/enterpriseExplorer.ts` file following the existing `config/scalar.ts` and `config/instances.ts` conventions:

```ts
// config/enterpriseExplorer.ts

/** Externally-hosted Enterprise OpenAPI spec URL. */
export const ENTERPRISE_SPEC_URL = 'https://api.enterprise.wikimedia.com/spec/spec.yaml'

/** Enterprise-specific Scalar configuration overrides. */
export const ENTERPRISE_SCALAR_CONFIGURATION_OVERRIDES = {
  // Populated depending on which experience mode is chosen (see §7)
}
```

---

## 4. Current state of every touched system

### 4.1 Explorer side nav (`config/explorerSideNav.js` + `ExplorerSideNav.vue`)

The left-hand nav of the Explorer page is a static, config-driven list of sections and items.  Every item is currently a non-functional `href="#"` placeholder with `@click.prevent`.  The only item in the "API Explorer" section is "Wikimedia API modules", rendered as permanently `isActive: true`.

The `isActive` flag is a static boolean in the config object.  There is no runtime state that drives which nav item is active — the component always renders the single item as active regardless of application state.

**What the Enterprise requirement needs:** A second item "Enterprise APIs" under the same "API Explorer" section, plus click handling that switches the explorer into enterprise mode.  This requires:

1. Making nav items emit events (or mutate shared state) on click
2. The `isActive` flag must become **dynamic** — computed from application state rather than hardcoded in config
3. The Explorer page must respond to the active nav item by switching its mode

This is the most structurally invasive change in this entire feature.

### 4.2 Explorer page (`app/pages/explorer/index.vue`)

The Explorer page is client-only (`ssr: false`) and renders a three-column layout:

- Left: `ExplorerSideNav` (always present)
- Center: `ExplorerScalarReference.client` (always present)
- Right: `ExplorerModuleRail` (wiki modules, always present in community mode)

The page currently has one mode: community API explorer.  It runs `useExplorerBootstrap()` unconditionally on mount, which fetches the discovery endpoint, enumerates modules, and prepares Scalar configuration.

**What Enterprise mode requires of the page:**

- A reactive `explorerMode` state value: `'community' | 'enterprise'`
- Conditional rendering: `ExplorerModuleRail` and `ExplorerProjectControls` are community-specific and should not appear in enterprise mode
- `useExplorerBootstrap()` should only run in community mode
- Scalar configuration should switch to enterprise overrides when in enterprise mode

### 4.3 Scalar configuration (`config/scalar.ts` + `useScalarConfig.ts`)

The current `SCALAR_DEFAULT_CONFIGURATION` has the following relevant properties:

```ts
{
  hideDownloadButton: false,
  hideTestRequestButton: false,
  showDeveloperTools: 'never',
  layout: 'modern',
  theme: 'default',
  showSidebar: false,  // ← Our module rail replaces Scalar's own sidebar
  // ...
}
```

The "extreme limited" Enterprise experience requires changing at minimum:

- `hideTestRequestButton: true` — disables the "Try it" / "Test request" button
- `hideDownloadButton: true` — disables spec download
- Potentially showing Scalar's own sidebar (`showSidebar: true`) instead of our custom module rail, since tags grouping is a native Scalar capability

**Known limitation:** The product requirements list several UI elements to hide in "extreme limited" mode that go beyond the currently documented Scalar configuration properties:

- Schema and response example box
- Parameter sections
- "Responses" section
- "Client libraries" section and per-endpoint code previews

Whether Scalar supports hiding these elements via configuration properties requires verification against the installed Scalar version (`@scalar/api-reference`).  This is a **hard dependency** on a Scalar capability audit before the limited mode can be implemented.  See §9.1.

### 4.4 Module rail (`ExplorerModuleRail.vue`)

The module rail is a custom component that lists MediaWiki modules discovered from a specific wiki instance.  It is tightly coupled to the community discovery flow.

**For Enterprise:** The Enterprise spec uses OpenAPI `tags` (reportedly Snapshot, On-demand, Realtime) as a grouping mechanism rather than separate module specs.  Options:

A. **Hide the module rail entirely** in enterprise mode and enable Scalar's built-in sidebar (`showSidebar: true`), which natively renders tags as section headers.
B. **Replace the module rail** with an enterprise-specific variant that reads tags from the Enterprise spec and renders them as accordion items, forwarding focus to Scalar sections on click.
C. **Extend the module rail** to optionally render tag groups instead of module groups.

Option A is the lowest effort and cleanest separation.  Option B preserves the UI consistency at higher cost.  Option C introduces conditional complexity to a component that currently has clean, single-responsibility behavior.

**Recommendation:** Option A for the initial implementation.  Option B or C can be revisited after the product experience is confirmed.

### 4.5 Project controls (`ExplorerProjectControls.vue`)

The project controls panel contains:

- **Wikimedia project** fieldset — project combobox (Wikipedia, Wikimedia Commons, Wikidata) and language combobox (English, Spanish, Hebrew, Farsi; disabled for Commons/Wikidata); resolves to wiki instance ids via `config/explorerProjectPicker.ts`
- **API to explore** select — lists opt-in-filtered bootstrap modules sorted alphabetically by `headingTitle` (`useExplorerModuleSelect`); default is the first healthy module in **discovery** order (`resolveFirstExplorerRailModule`); menu items show beta/version chip metadata via Codex MenuItem **`supportingText`**
- Opt-in checkboxes (**Beta APIs and endpoints** default on; **Internal APIs and endpoints** default off)

Neither of these applies to the Enterprise API, which is a single global API with no per-wiki variation.  In enterprise mode, the project controls panel should be hidden entirely.

### 4.6 Bootstrap composable (`useExplorerBootstrap.ts`)

This composable fetches `/api/explorer-bootstrap`, which calls the Wikimedia discovery endpoint for the selected wiki instance and returns module + endpoint data.  It is wiki-instance-specific.

Enterprise has no bootstrap in this sense — the spec URL is static and known at config time.  A separate, minimal composable `useEnterpriseExplorer` is appropriate:

```ts
// app/composables/useEnterpriseExplorer.ts
import { ENTERPRISE_SPEC_URL } from '../../config/enterpriseExplorer'
import { SCALAR_DEFAULT_CONFIGURATION, ... } from '../../config/scalar'

export function useEnterpriseExplorer() {
  const specUrl = computed( () => ENTERPRISE_SPEC_URL )
  // Returns scalar config, loading state (trivial — no async fetch needed)
  return { specUrl }
}
```

---

## 5. Proposed architecture: Explorer mode switching

The Explorer page gains a single reactive state value: `explorerMode`.

### 5.1 State

```ts
type ExplorerMode = 'community' | 'enterprise-full' | 'enterprise-limited' | 'enterprise-custom'
```

This state is managed on the Explorer page itself (not in a Pinia store — it is page-local and does not need to survive navigation away from the Explorer).

All three Enterprise modes share the same spec source (the `/api/enterprise-spec` proxy).  `enterprise-full` and `enterprise-limited` consume it as YAML directly inside Scalar; `enterprise-custom` consumes a server-parsed JSON projection of it (see §7.4 and §10 Phase F).  The first two differ only in which Scalar configuration overrides are applied; the third bypasses Scalar entirely and renders a custom tag-driven viewer.

### 5.2 Side nav configuration change

`config/explorerSideNav.js` gains three new items under "API Explorer" — one per Enterprise mode:

```js
{
  id: 'api-explorer',
  titleMessageKey: 'explorer-side-nav-api-explorer-title',
  items: [
    {
      id: 'wikimedia-api-modules',
      messageKey: 'explorer-side-nav-wikimedia-api-modules',
      mode: 'community',
      enabled: true
    },
    {
      id: 'enterprise-apis',
      messageKey: 'explorer-side-nav-enterprise-apis',
      mode: 'enterprise-full',
      enabled: true   // ← set false to remove from nav without touching any component
    },
    {
      id: 'enterprise-apis-limited',
      messageKey: 'explorer-side-nav-enterprise-apis-limited',
      mode: 'enterprise-limited',
      enabled: true   // ← set false to remove from nav without touching any component
    },
    {
      id: 'enterprise-apis-custom',
      messageKey: 'explorer-side-nav-enterprise-apis-custom',
      mode: 'enterprise-custom',
      enabled: true   // ← set false to remove from nav without touching any component
    }
  ]
}
```

**The `enabled` flag** is the primary on/off control for each Enterprise entry.  Setting it to `false` removes the item from the rendered nav immediately — no component change, no composable change, no route change.  This is the mechanism for disabling either mode when operationally required without a code review or deployment.

The `isActive` flag is removed from config entirely.  `ExplorerSideNav.vue` accepts a prop `activeMode: ExplorerMode` and computes `isActive` per item from `item.mode === activeMode`.  Items with `enabled: false` are filtered out before rendering.

### 5.3 Side nav event emission

`ExplorerSideNav.vue` emits a `mode-change` event when a nav item is clicked:

```ts
const emit = defineEmits<{
  'mode-change': [ mode: ExplorerMode ]
}>()
```

The Explorer page listens to this event and updates its local `explorerMode` ref.

### 5.4 Explorer page conditional rendering

The Explorer page renders different content based on `explorerMode`:

```vue
<!-- Project controls: community only -->
<ExplorerProjectControls v-if="explorerMode === 'community'" ... />

<!-- Module rail: community only -->
<ExplorerModuleRail v-if="explorerMode === 'community'" ... />

<!-- Enterprise: no module rail; Scalar sidebar enabled instead -->
```

Scalar configuration differs per mode:

- Community: `SCALAR_DEFAULT_CONFIGURATION` (current behavior, unchanged)
- Enterprise full: `SCALAR_DEFAULT_CONFIGURATION` merged with `ENTERPRISE_FULL_SCALAR_OVERRIDES` from `config/enterpriseExplorer.ts` — at minimum `showSidebar: true` to expose the tag-grouped sidebar
- Enterprise limited: `SCALAR_DEFAULT_CONFIGURATION` merged with `ENTERPRISE_LIMITED_SCALAR_OVERRIDES` from `config/enterpriseExplorer.ts` — all available hide flags applied (populated after the §9.1 audit)
- Enterprise custom: **no Scalar** — the Scalar reference panel slot is replaced by `ExplorerEnterpriseCustom.vue`, which reads a server-parsed JSON projection of the spec and renders a single-select tag sidebar + endpoint detail panel.  See §7.4 and Phase F

---

## 6. Level of effort

### 6.1 Phase A: Prerequisites (Engineering, ~3–5 hours, no code)

| Task | Effort |
|---|---|
| Fetch and inspect Enterprise spec — CORS, tags, Bearer security scheme | 30 min |
| Audit `@scalar/api-reference` type definitions for all hide/show config flags | 2–4 hrs |

**Output:** Answers to §8.5, §8.6, §8.10; complete table of available Scalar hide flags for §7.

### 6.2 Phase B: Infrastructure — mode switching (Engineering, ~2 days)

Shared prerequisite for both Enterprise modes.  Neither Enterprise entry need be enabled (`enabled: true`) until Phase C/D is verified.

| Task | Effort | File(s) |
|---|---|---|
| `config/enterpriseExplorer.ts` — spec URL, `ENTERPRISE_FULL_SCALAR_OVERRIDES`, `ENTERPRISE_LIMITED_SCALAR_OVERRIDES` (stubs), JSDoc | XS | New file |
| `config/explorerSideNav.js` — add `mode` + `enabled` fields; add two Enterprise entries; remove static `isActive` | XS | `config/explorerSideNav.js` |
| `ExplorerSideNav.vue` — filter by `enabled`, compute `isActive` from `activeMode` prop, emit `mode-change` | S | `ExplorerSideNav.vue` |
| `app/pages/explorer/index.vue` — `explorerMode` state, `mode-change` handler, conditional rendering of rail + controls | M | `app/pages/explorer/index.vue` |
| `useEnterpriseExplorer.ts` — return spec URL + per-mode Scalar config | S | New composable |
| Wire enterprise Scalar config in Explorer page per mode | S | `app/pages/explorer/index.vue` |
| i18n keys for both Enterprise labels across all locale files | XS | `i18n/*.json` |

**Subtotal: ~2 days**

### 6.3 Phase C: Full Enterprise mode QA (Engineering, ~1 day)

| Task | Effort |
|---|---|
| QA — spec loads, all endpoints visible in Scalar sidebar | S |
| QA — tags render as sidebar section headers | S |
| QA — Bearer token can be entered; test requests succeed | M |
| Layout adjustments for two-column enterprise view | S–M |

**Subtotal: ~1 day**

### 6.4 Phase D: Limited Enterprise mode (Engineering, ~2–5 days, depends on Phase A)

| Task | Effort | Notes |
|---|---|---|
| Apply discovered hide flags to `ENTERPRISE_LIMITED_SCALAR_OVERRIDES` | S | Config-only if Scalar supports all required elements |
| QA — each required UI element is absent | S | |
| Custom `ExplorerEnterpriseEndpointList.vue` component | L | Only if Scalar cannot hide enough natively |

**Subtotal: ~2 days (config-only path) to ~5 days (custom component path)**

### 6.5 Total range

| Scenario | Estimated effort |
|---|---|
| Phase A + B (toggle infrastructure, both entries built, both `enabled: false` by default) | ~3 days |
| Phase A + B + C (full enterprise mode live and verified) | ~4 days |
| Phase A + B + C + D config-only limited mode | ~6 days |
| Phase A + B + C + D custom component limited mode | ~9 days |
| Phase F (custom Enterprise mode `enterprise-custom`, additive on top of A–E) | ~2.5–3 days |

### 6.6 Phase F (custom Enterprise mode) — detailed estimate

Additive to Phases A–E; does not change effort for existing modes.

| Task | Effort | File(s) |
|---|---|---|
| Extend `ExplorerMode` + routing helpers | XS | `app/utils/explorerRoute.ts`, `app/composables/useEnterpriseExplorer.ts`, `config/explorerSideNav.js` |
| Side-nav entry + i18n in 5 locales + qqq | XS | `config/explorerSideNav.js`, `i18n/*.json` |
| Server-parsed spec endpoint (YAML→JSON, tag grouping) | S | `server/api/enterprise-spec-parsed.get.ts`, `server/api/enterprise-spec.get.ts` (export upstream URL) |
| `useEnterpriseSpecOutline` composable | S | `app/composables/useEnterpriseSpecOutline.ts` |
| `ExplorerEnterpriseCustom.vue` (tablist sidebar + endpoint panel + Markdown rendering) | M–L | `app/components/explorer/ExplorerEnterpriseCustom.vue` |
| Page wiring in `[[view]].vue` (mode branch, render swap) | S | `app/pages/explorer/[[view]].vue` |
| QA: deep-link, hash fragment, RTL, a11y tablist keyboard | S | — |

**Subtotal: ~2.5–3 days**

---

## 7. Scalar configuration properties for limited mode — gap analysis

**Audit date:** 2026-06-09 — `@scalar/api-reference` installed version, `dist/` type declarations inspected directly.

### 7.1 Available hide/show flags (complete list)

| Config property | Type | Effect |
|---|---|---|
| `hideClientButton` | `boolean` | Hides the global "Client libraries" button/panel |
| `hiddenClients` | `true \| string[] \| Record<string, boolean \| string[]>` | Hides all (`true`) or specific HTTP client code snippets per endpoint |
| `hideTestRequestButton` | `boolean` | Hides the "Test request" / "Try it" button |
| `hideDownloadButton` | `boolean` | Hides the spec download button |
| `hideModels` | `boolean` | Hides the global Models / Schemas section |
| `hideSearch` | `boolean` | Hides the search bar |
| `hideDarkModeToggle` | `boolean` | Hides the dark/light mode toggle |
| `showSidebar` | `boolean` | Shows/hides the Scalar sidebar (we use `true` for enterprise modes) |
| `showDeveloperTools` | `'never' \| 'always' \| 'localhost'` | Controls developer tools panel |
| `customCss` | `string` | Injects arbitrary CSS — usable as an escape hatch (see §7.2) |

### 7.2 Gap analysis against product requirements for limited mode

| Required element to hide | Scalar config flag | Verdict |
|---|---|---|
| "Client libraries" section (global) | `hideClientButton: true` | ✅ Supported |
| Per-endpoint code snippets | `hiddenClients: true` | ✅ Supported |
| "Test request" button | `hideTestRequestButton: true` | ✅ Supported |
| Spec download button | `hideDownloadButton: true` | ✅ Supported |
| Global Models / Schema section | `hideModels: true` | ✅ Supported |
| Per-endpoint parameter sections | **No config flag** | ❌ Not supported via config |
| Per-endpoint "Responses" section | **No config flag** | ❌ Not supported via config |
| Inline request/response schema boxes | **No config flag** | ❌ Not supported via config |

### 7.3 Conclusion: limited mode cannot be fully achieved by config alone

The three unsupported elements (parameters, responses, inline schemas) are structural to Scalar's per-endpoint rendering.  There is no configuration flag to suppress them.

**Three paths forward, and how they are deployed:**

**Path D-a — Config-only (partial):** Apply all supported hide flags.  Parameters, responses, and inline schemas remain visible.  This may be acceptable if the product's working definition of "limited" is refined to match what config can actually deliver.

**Path D-b — CSS injection via `customCss`:** Scalar accepts a `customCss` string that is injected into the rendered document.  CSS selectors could visually hide parameter/response sections.  This is fragile — it depends on Scalar's internal DOM structure and class names, which can change across Scalar version upgrades.  Suitable as a short-term workaround; not recommended for long-term maintenance.

**Path D-c — Custom component:** Build a non-Scalar Vue component that reads the Enterprise spec and renders a minimal endpoint list.  Highest-effort path, but the only one that fully satisfies the "extreme limited info" requirement.  Now also the foundation of the new `enterprise-custom` mode (see §7.4).

**Decision (revisited 2026-06-11):** Path **D-a** ships as the `enterprise-limited` mode (already complete — see Phase D in §10).  Path D-a is retained for that entry — limited mode keeps the Scalar-with-hide-flags rendering.  In addition, a separate `enterprise-custom` mode (the third Enterprise sidebar entry) is added that implements path **D-c** as its own self-contained, non-Scalar viewer.  Paths D-a and D-c now coexist as two independent Enterprise modes; the user picks via the side nav.  Path D-b is not adopted.

### 7.4 Path D-c as the `enterprise-custom` mode (new)

**Decision (2026-06-11):** A third Enterprise sidebar entry — "Enterprise (Custom)" — is added.  Internal mode id `enterprise-custom`; public URL `/explorer/enterprise-custom`.  The mode bypasses Scalar entirely and renders a custom Vue component that reads a server-parsed projection of the Enterprise OpenAPI spec.

**UI shape:**

- A two-pane layout that lives inside the existing Explorer center column (the Scalar reference panel slot).  The page's start column (Explorer side nav) and end column (module rail in community mode) are unchanged from the other Enterprise modes — module rail and project controls remain hidden, matching §5.4.
- **Inline-start pane — tag sidebar:** vertical list of OpenAPI tags from the spec.  Single-select, with `role="tablist"`; each tag is a `role="tab"` button.  Mimics Scalar's sidebar visually but with our own a11y semantics (selection, not collapse).
- **Inline-end pane — endpoint detail panel:** for the currently selected tag, lists every operation tagged with it.  Each row shows method badge + path (monospace, `dir="ltr"` on the method), the operation `summary`, and the operation `description` rendered as Markdown.  The panel has `role="tabpanel"` associated with the selected sidebar tab.

**Data flow (server-parsed JSON):**

- Add `/server/api/enterprise-spec-parsed.get.ts`.  It fetches the same upstream YAML used by the existing `/api/enterprise-spec` proxy (the URL constant lives in one place — the existing proxy file — and the new route imports it), parses YAML server-side, and returns JSON of the shape:

  ```ts
  type EnterpriseSpecOutline = {
    tags: Array<{
      name: string                  // OpenAPI tag id (slug-safe)
      displayName: string           // x-displayName or name
      description?: string          // OpenAPI tag description (Markdown)
    }>
    operationsByTag: Record<string, Array<{
      operationId?: string
      method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'
      path: string                  // e.g. /v2/articles/{name}
      summary?: string
      description?: string          // Markdown — rendered client-side
    }>>
  }
  ```

- Operations carry their primary tag (first entry in `tags[]`); operations without a tag are grouped under a synthetic `__untagged__` bucket and surfaced as the last sidebar entry only when non-empty.  Tag ordering follows the spec's root-level `tags:` array (if present), with any tags discovered only inside operations appended after.

- The composable `useEnterpriseSpecOutline()` calls the new endpoint with `$fetch`, returns `{ tags, operationsByTag, isLoading, hasError, errorMessage }`.  Component-level fetch is forbidden by AGENTS.md rule §5 — the component reads from the composable only.

**Why server-side parsing:**

- Keeps the YAML parser off the client bundle.
- Respects the engine/data-layer separation in ARCHITECTURE.md.
- The existing `/api/enterprise-spec` proxy is untouched, so the other two Enterprise modes (which feed Scalar raw YAML) are unaffected.
- The two routes share one source-of-truth constant for the upstream URL by importing it from the existing proxy file.

**Summary / description resolution (implementation note):**

OpenAPI 3.0 §4.7.9.2 permits `summary` and `description` at the path-item level as well as the operation level.  The Enterprise spec relies on the path-item level for most endpoints; reading only operation-level fields produced rows with no documentation in the custom viewer.  The parser therefore reads operation-level first and falls back to path-item level when the operation does not carry its own values.  When neither level has the field, the property stays `undefined` and the template skips rendering — no placeholder text.

**Markdown rendering for `description`:**

- Use a small client-side Markdown renderer (e.g. `marked` or `markdown-it`) inside the component, OR delegate to Nuxt Content's `<ContentRenderer>` if it can render an arbitrary string without a route-bound file.  Choice deferred to Phase F Step F4; the composable layer is unaffected — descriptions stay strings until they reach the component.
- All rendered Markdown output is wrapped in a single `<bdi>` boundary so spec-derived strings stay BiDi-isolated per AGENTS.md rule §2.

**Hash-based tag deep-linking:**

- The active tag lives in the URL as `#tag=<tag-name>` (URI-encoded).  This is shareable but does not require expanding the optional-dynamic route shape.
- On mount, the component reads `route.hash`; if `#tag=<name>` resolves to a known tag, that tag is selected.  Otherwise it falls back to the first tag.
- Tag selection updates the hash via `router.replace({ hash })` (no extra history entry per click).  Browser back/forward across selections is intentionally not implemented in this phase.

**Layout placement (re §8.4):**

- In Enterprise modes, the right end column is reserved-empty per §5.4 (`ExplorerModuleRail` is hidden).  This stays true for `enterprise-custom`.
- The two-pane structure of the custom viewer is **internal** to the center column — it does not consume the end column.  This keeps the page-level grid identical across the three Enterprise modes.
- Pane proportions are an internal CSS-grid concern of the component (initial proposal: tag sidebar `minmax(12rem, 14rem)`, endpoint panel `minmax(0, 1fr)`).  Below the explorer's wide breakpoint (`min-width: 960px` — see DESIGN_REQUIREMENTS Reference panel wide rule), the two panes stack with the tag sidebar above.

**Page-level wiring in `[[view]].vue`:**

- Add a third branch: when `explorerMode === 'enterprise-custom'`, the page does NOT instantiate `useEnterpriseExplorer` (which currently only handles full/limited) and does NOT mount `ExplorerScalarReference`.  Instead it mounts `ExplorerEnterpriseCustom` in the reference-panel slot.
- `useEnterpriseExplorer`'s `Ref<'enterprise-full' | 'enterprise-limited'>` parameter type is unchanged; `enterprise-custom` does not flow through that composable at all.
- `scalarReferenceKey` is unaffected; `isScalarReady` / `isScalarSwitching` are gated on community mode + the Scalar-bearing Enterprise modes only.
- Page title still reuses the side-nav i18n key for the active mode (`explorer-side-nav-enterprise-apis-custom`).

**Out of scope for this phase:**

- "Try it" / request execution.  No request UI in the custom mode.
- Per-endpoint deep-linking inside a tag (only the tag is in the URL hash).
- Search/filter across endpoints inside the panel.
- OAuth or Bearer token entry.

---

## 8. Ambiguities and open questions

### 8.1 Resolved: both modes ship as separately toggled nav entries

**Decision:** Both "Enterprise APIs" (full mode) and "Limited Enterprise API" (limited mode) are added to the side nav config simultaneously, each with `enabled: true` initially in development and `enabled: false` until Product approves each for public exposure.  Neither needs to be exposed to end users until it is ready.

Setting `enabled: false` on either entry removes it from the rendered nav immediately — no component change, no composable change, no code review required.  This makes launch timing for each mode an operational config decision rather than an architectural constraint.

This resolves the "which mode ships first" question from the original requirements.

### 8.2 Product: Operational requirements for side-by-side placement

The requirements identify operational product concerns around presenting Enterprise alongside community APIs.  This ADR assumes a toggleable mode (the user must explicitly click "Enterprise APIs" to enter enterprise mode) is sufficient separation, but this has not been confirmed.

**Decision needed from:** Product
**Implementation impact:** If stronger separation is required (separate route, separate page, interstitial before entry), the architecture in §5 changes.

### 8.3 Resolved: enterprise modes get sub-route deep-links; community stays at `/explorer`

**Decision:** Each Enterprise mode gets its own sub-route under the Explorer page.  Community remains at the bare `/explorer` path so the existing entry point and all inbound links are unaffected.

| URL | Resolved mode |
|---|---|
| `/explorer` | `community` (default) |
| `/explorer/enterprise` | `enterprise-full` |
| `/explorer/enterprise-limited` | `enterprise-limited` |
| `/explorer/enterprise-custom` | `enterprise-custom` |
| `/explorer/enterprise-custom#tag=<tag>` | `enterprise-custom` with `<tag>` pre-selected in the sidebar (see §7.4) |

Any unknown trailing segment falls through to community — a stale or mistyped deep-link renders the default Explorer rather than 404-ing.  An unknown `#tag=` fragment falls through to the first available tag.

**Implementation shape:**

- A single Vue Router record serves all three paths via Nuxt's optional-dynamic file-based routing: the page lives at `app/pages/explorer/[[view]].vue` (renamed from `index.vue`).  This maps to `/explorer/:view?` in the router and matches `/explorer`, `/explorer/enterprise`, and `/explorer/enterprise-limited` natively — no `definePageMeta({ alias })` needed (which was unreliable in dev mode).  Navigating between paths is a same-route transition: no Scalar full remount, no SSR cycle.
- The mode is **derived** from `route.path` (single source of truth).  `useExplorerMode()` returns a computed mode that recomputes whenever the route changes.  No setter is exposed — the side-nav uses `NuxtLink` for navigation, so router.push is handled by the framework and the URL stays the source of truth in both directions (visible href, middle-click, right-click → copy link all work).
- The `explorer-route-navigation.client.ts` plugin's full-reload trigger is scoped to crossing the Explorer boundary.  With `isExplorerRoutePath` updated to match `/explorer` and `/explorer/<segment>`, switching between modes stays client-side; only entering/leaving the Explorer entirely still forces a reload.
- The page's `definePageMeta({ i18n: false })` is preserved — Enterprise sub-routes are not locale-prefixed (matching the existing Explorer behavior).

**Why sub-route over query param:** Stronger separation in the URL (a sub-path reads as a distinct destination, a query param reads as a modifier).  Consistent with how product describes the modes operationally — separate experiences, not toggled views.  Both modes get equally first-class URLs.

**URL ↔ mode segment mapping:** Public URL uses the shorter `enterprise` for the primary entry; the internal mode identifier remains `enterprise-full`.  This keeps the URL ergonomic without renaming the internal mode taxonomy.  See `app/utils/explorerRoute.ts` for the canonical mapping.

### 8.4 UX: What happens to the layout in enterprise mode?

When switching to enterprise mode, the module rail and project controls disappear.  This changes the three-column layout to effectively two columns (left nav + center Scalar panel).  The DESIGN_REQUIREMENTS.md specifies a `4 + 16 + 4` column split for the three-column explorer layout.  Enterprise mode may warrant a wider center column (`4 + 20` or simply `4 + 16` with the right column absent).

**Decision needed from:** Design
**Implementation impact:** CSS grid column spans on the Explorer page.

### 8.5 Resolved: Enterprise spec tags — more granular than product described

**Finding (Step A1):** The spec at `https://api.enterprise.wikimedia.com/spec/spec.yaml` declares **9 tags**, not the 3 groupings product described ("Snapshot, On-demand, Realtime").  The actual tags and their groupings are:

| Tag name | Product group |
|---|---|
| `codes` | Metadata |
| `languages` | Metadata |
| `projects` | Metadata |
| `namespaces` | Metadata |
| `snapshots` | Snapshot API |
| `structured-snapshots` | (BETA) Structured Contents Snapshot API |
| `articles` | On-demand API |
| `structured-contents` | (Beta) Structured Contents On-demand API |
| `batches` | Realtime Batch API |

All operations in the spec carry `tags:` fields.  Scalar's sidebar will render all 9 tag groups — which is more granular than the 3 groups product anticipated.

**Impact:** The sidebar experience will show 9 sections, not 3.  This may be desirable (fine-grained navigation), but Product should confirm the expectation.  Scalar provides `tagsSorter: 'alpha'` or a custom sort function, and `defaultOpenFirstTag` / `defaultOpenAllTags` to control initial expansion state — all usable in `ENTERPRISE_FULL_SCALAR_OVERRIDES`.

### 8.6 Resolved: Bearer token security scheme — declared and applied globally

**Finding (Step A1):** The Enterprise spec declares `bearerAuth` correctly at `components.securitySchemes`:

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

The top-level `security: [{ bearerAuth: [] }]` applies it globally to all operations.  Scalar will surface a Bearer token input in its auth panel automatically — no custom auth overlay is needed.

**Remaining open question:** Whether test requests from the browser succeed end-to-end depends on CORS preflight behavior for authenticated requests.  This is verified in Step C1, not Step A1.  A OPTIONS preflight for a request with an `Authorization` header may behave differently from a plain GET, even if the spec itself is proxied.

### 8.7 Technical: ExplorerScalarFocus composable — compatibility with enterprise mode

`useExplorerScalarFocus` manages the poll-based focus mechanism that scrolls Scalar to a selected endpoint when the user clicks in the module rail.  This composable reads Scalar's internal sidebar items to resolve operation IDs.

In enterprise mode with Scalar's own sidebar (`showSidebar: true`), the module rail is hidden and no focus-from-rail mechanism is needed.  However, the focus composable is wired at the page level and would still run.  This is harmless if it receives no input, but the initialization path should be guarded to avoid spurious polling.

### 8.8 Technical: Static `isActive` removal — regression risk

Removing `isActive` from the config and making it computed from `explorerMode` is a clean improvement but is a structural change to both the config schema and the component.  The existing unit tests (if any) for `ExplorerSideNav.vue` will need updating.

**Note:** There are currently no operational routes in the side nav.  The change is low regression risk in practice, but requires care to avoid breaking the static `isActive` rendering that currently exists.

### 8.9 Product: Should Enterprise account creation be linked from the Explorer?

Requirements note "Account creation remains on the Enterprise website."  Should the Enterprise mode surface a prominent link/CTA to the Enterprise registration page?  This affects the UI layout in enterprise mode but is unspecified.

### 8.10 Resolved: CORS — spec requires a server-side proxy

**Finding (Step A1):** The response from `https://api.enterprise.wikimedia.com/spec/spec.yaml` contains **no CORS headers**:

```
HTTP/2 200
content-type: text/yaml; charset=utf-8
x-request-id: ...
server: istio-envoy
```

There is no `Access-Control-Allow-Origin` header.  The spec cannot be fetched directly by the browser.  Scalar will fail silently or throw a CORS error if given this URL as `spec.url`.

**Decision:** A server-side proxy route is required — `/server/api/enterprise-spec.get.ts` — following the same pattern as `/server/api/discovery.get.ts`.  The route fetches the spec from the Enterprise server and forwards the response.  `ENTERPRISE_SPEC_URL` in `config/enterpriseExplorer.ts` must point to this proxy route (`/api/enterprise-spec`), not to the external URL directly.

**Implementation impact (Step B1):** The proxy route must be created in Phase B alongside `config/enterpriseExplorer.ts`.  The config constant `ENTERPRISE_SPEC_URL` is set to `/api/enterprise-spec` from the start.  The external URL is an internal constant in the proxy route, not exported.

---

## 9. Prerequisites before implementation begins

The following must be resolved before implementation work starts, in priority order:

### 9.1 Resolved: Scalar capability audit complete (see §7)

All configuration flags enumerated from `@scalar/api-reference` type declarations.  Limited mode cannot be fully achieved by config alone — parameters, responses, and inline schemas have no hide flags.  Three paths identified in §7.3; Product to choose.

### 9.2 Resolved: Enterprise spec verification complete (see §8.5, §8.6, §8.10)

- **CORS:** No CORS headers — server proxy required (added to Phase B as Step B1a)
- **Tags:** 9 tags present, all operations tagged; more granular than product described
- **Bearer auth:** Correctly declared and globally applied

### 9.3 Resolved: both modes are built and toggled via config

The `enabled` flag in `config/explorerSideNav.js` (see §5.2) handles launch timing for each mode independently.  Both modes are implemented; both entries start as `enabled: false` in production config until Product approves each for launch.  No product decision about ordering is required before implementation begins.

### 9.4 Operational sign-off: adequacy of toggle separation (blocking for go-live)

Product to confirm that a user-initiated mode toggle (clicking "Enterprise APIs" in the side nav) satisfies operational product requirements for separation between Enterprise and community APIs.

**Who:** Product
**When:** Before the Enterprise entry appears in the nav to any user

### 9.5 Design: layout for enterprise mode (desirable before implementation)

Design to provide:
- Layout specification for two-column enterprise mode (no module rail)
- Whether a disclaimer or registration CTA is needed in the enterprise view
- Whether the mode label ("Enterprise APIs") triggers any onboarding/explainer

**Who:** Design
**When:** Before UI implementation; can be done in parallel with infrastructure work

---

## 10. Step-by-step implementation plan

Each step has a defined verification criterion.  Steps within the same phase are independent and can be parallelized; steps across phases are ordered.

---

### Phase A: Prerequisites — no code, unblocks everything

#### Step A1 — Verify the Enterprise spec ✅ Complete

**Findings:**
- **CORS:** ❌ No `Access-Control-Allow-Origin` header. Spec cannot be browser-fetched. Server proxy required — added to Phase B as Step B1a.
- **Tags:** ✅ 9 tags present, all operations tagged. Groups: Metadata (codes, languages, projects, namespaces), Snapshot API (snapshots, structured-snapshots), On-demand API (articles, structured-contents), Realtime Batch API (batches). More granular than product's "3 APIs" description — Product confirmation needed (§8.5).
- **Auth:** ✅ `bearerAuth` HTTP Bearer scheme declared at `components.securitySchemes`, applied globally via top-level `security:`. Scalar will surface auth input natively.

Full findings recorded in §8.5, §8.6, §8.10.

---

#### Step A2 — Scalar capability audit ✅ Complete

**Findings:** All configuration flags enumerated from `@scalar/api-reference` dist type declarations (`@scalar/types/dist/api-reference/api-reference-configuration.d.ts`).

**Supported hide flags:**
- `hideClientButton: true` — hides global client libraries button
- `hiddenClients: true` — hides all per-endpoint code snippets
- `hideTestRequestButton: true` — hides "Test request" button
- `hideDownloadButton: true` — hides spec download
- `hideModels: true` — hides global Models/Schemas section
- `hideSearch: true` — hides search
- `customCss: string` — CSS escape hatch (see Path D-b in §7.3)

**Not supported:**
- Per-endpoint parameter sections — no flag
- Per-endpoint "Responses" section — no flag
- Inline request/response schema boxes — no flag

**Conclusion:** Limited mode cannot be fully achieved by config alone. Three paths documented in §7.3. Full findings in §7.

---

### Phase B: Infrastructure — mode switching

#### Step B1 — Create `config/enterpriseExplorer.ts` and proxy route (Engineering, ~2 hours)

**What:**

**B1a — Server proxy route** (required due to Step A1 CORS finding):
Create `/server/api/enterprise-spec.get.ts` following the pattern of `/server/api/discovery.get.ts`.  The route fetches the spec from the external URL and forwards the response body with `content-type: text/yaml`.  The external URL is an internal constant in this route file — not exported, not in `config/`.

**B1b — Config file:**
Create `/config/enterpriseExplorer.ts`:
- `ENTERPRISE_SPEC_URL = '/api/enterprise-spec'` — points to the proxy, never the external URL
- `ENTERPRISE_FULL_SCALAR_OVERRIDES` — `{ showSidebar: true }` (stub; expanded in Step C1)
- `ENTERPRISE_LIMITED_SCALAR_OVERRIDES` — all supported hide flags applied; path D decision pending (stub until Phase D)

```ts
export const ENTERPRISE_SPEC_URL = '/api/enterprise-spec'

export const ENTERPRISE_FULL_SCALAR_OVERRIDES = {
  showSidebar: true
}

export const ENTERPRISE_LIMITED_SCALAR_OVERRIDES = {
  showSidebar: true,
  hideTestRequestButton: true,
  hideDownloadButton: true,
  hideClientButton: true,
  hiddenClients: true as const,
  hideModels: true
  // parameters / responses / inline schemas: path D decision pending (see §7.3)
}
```

**Verify:**
- [ ] `GET /api/enterprise-spec` returns `200` with `content-type: text/yaml` and the spec body
- [ ] TypeScript compiles, config is importable
- [ ] No external URL appears outside the proxy route file

---

#### Step B2 — Extend `config/explorerSideNav.js` (Engineering, ~30 min)

**What:**
- Add `mode` field (string) to the `ExplorerSideNavItem` JSDoc typedef
- Add `enabled` field (boolean) to the typedef
- Update the existing "Wikimedia API modules" entry: add `mode: 'community'`, `enabled: true`
- Remove static `isActive` from all entries
- Add two new entries: `enterprise-full` and `enterprise-limited`, both `enabled: true`

**Verify:**
- [ ] JSDoc types updated
- [ ] Both Enterprise entries present in the config array
- [ ] No `isActive` field anywhere in the file

---

#### Step B3 — Update `ExplorerSideNav.vue` (Engineering, ~2 hours)

**What:**
- Accept `activeMode` prop typed as `'community' | 'enterprise-full' | 'enterprise-limited'`
- In `navigationSections` computed: filter `items` to `enabled !== false` before mapping
- For items with a `mode` field, render a `<NuxtLink>` whose `to` is `pathForExplorerMode( mode )` (see Step B6.5).  Items without a `mode` remain inert placeholders.
- Compute `isActive` per item as `item.mode === activeMode`; active styling and `aria-current="page"` apply to that item only

**Verify:**
- [ ] With `activeMode='community'` (default): "Wikimedia API modules" renders with active styling; Enterprise entries render without
- [ ] Each Enterprise nav item is an `<a href="/explorer/...">` (not `href="#"`); middle-click opens in a new tab; right-click → copy link yields the sub-route URL
- [ ] Clicking "Enterprise APIs" navigates to `/explorer/enterprise`; clicking "Limited Enterprise API" navigates to `/explorer/enterprise-limited`
- [ ] Active styling follows the route — after navigation the destination item is the only one with `--active`
- [ ] Setting `enabled: false` on any entry in config causes it to disappear from rendered nav
- [ ] Accessibility: `aria-current="page"` present only on the active item

---

#### Step B4 — Create `useEnterpriseExplorer.ts` composable (Engineering, ~1 hour)

**What:**
Create `app/composables/useEnterpriseExplorer.ts`:
- Accepts `mode: Ref<'enterprise-full' | 'enterprise-limited'>`
- Returns `specUrl` computed from `ENTERPRISE_SPEC_URL`
- Returns `scalarOverrides` computed from the appropriate overrides object in `config/enterpriseExplorer.ts` based on `mode`

```ts
export function useEnterpriseExplorer( mode: Ref<'enterprise-full' | 'enterprise-limited'> ) {
  const specUrl = computed( () => ENTERPRISE_SPEC_URL )
  const scalarOverrides = computed( () =>
    mode.value === 'enterprise-full'
      ? ENTERPRISE_FULL_SCALAR_OVERRIDES
      : ENTERPRISE_LIMITED_SCALAR_OVERRIDES
  )
  return { specUrl, scalarOverrides }
}
```

**Verify:**
- [ ] TypeScript compiles
- [ ] `specUrl` returns the correct URL regardless of mode
- [ ] `scalarOverrides` returns the full overrides object for `enterprise-full` and the limited object for `enterprise-limited`

---

#### Step B5 — Update Explorer page (`[[view]].vue`) (Engineering, ~3 hours)

**What:**
- Derive `explorerMode` from the current route via `useExplorerMode()` (single source of truth — see Step B6.5)
- Gate `useExplorerBootstrap()` with `isCommunityMode` so the community discovery fetch only fires in community mode
- Conditionally render: `<ExplorerProjectControls v-if="isCommunityMode" />`
- Conditionally render: `<ExplorerModuleRail v-if="isCommunityMode" />`
- **Build the Scalar configuration per mode rather than mutating a shared reactive object.**  Community keeps `useScalarConfig( openApiSpecUrl, ... )`; enterprise builds a fresh computed config that merges `SCALAR_DEFAULT_CONFIGURATION` with the active enterprise overrides and the proxy spec URL.  An `activeScalarConfiguration` computed picks the right one based on `isCommunityMode`.  Cross-mode mutation of a single reactive config produced Scalar's "Document not found in configList" warning during transitions (the old ApiReference instance saw the new URL before unmount); separate per-mode configs avoid that race.
- Page title binds to the active mode (reuses the matching `explorer-side-nav-*` translation key so wording stays in sync with the side nav).  Community description is suppressed in enterprise modes since the existing text is community-specific.
- Add an `isScalarReady` page-local ref that resets to `false` whenever the `scalarReferenceKey` changes (mode switch, module switch, wiki instance change) and is set to `true` from the shared `onScalarLoaded` handler.  The Scalar shell shows a loading overlay until `isScalarReady` is true, so the spinner persists across all three modes through the spec fetch.

**Verify:**
- [ ] Default state: community mode, module rail visible, project controls visible, community bootstrap runs
- [ ] Click "Enterprise APIs" → module rail disappears, project controls disappear, bootstrap does not re-run
- [ ] Scalar loads the Enterprise spec URL (confirm in browser network tab) — no "Document not found in configList" warning during transition
- [ ] Page H1 changes to "Enterprise APIs" / "Limited Enterprise API" / "Wikimedia API modules" depending on the active mode
- [ ] Loading overlay (spinner + label) covers the Scalar shell on every mode entry until Scalar's `onLoaded` fires; clears as soon as the spec finishes rendering
- [ ] Click "Wikimedia API modules" → community layout fully restores, community bootstrap resumes for selected instance
- [ ] Click "Limited Enterprise API" → same layout as enterprise-full (module rail hidden); Scalar loads with limited overrides
- [ ] No spurious network calls to `/api/explorer-bootstrap` when in enterprise mode

---

#### Step B6.5 — URL representation for Enterprise modes (Engineering, ~1 hour)

**What:**
Add sub-route deep-links so each Enterprise mode is directly addressable (see §8.3).  Routes are registered via Nuxt's file-based optional-dynamic routing: the page is named `[[view]].vue`, which maps to `/explorer/:view?` — matching `/explorer`, `/explorer/enterprise`, and `/explorer/enterprise-limited` natively.  Side-nav navigation is driven by `NuxtLink` so the URL is the source of truth in both directions (visible `href`, middle-click, copy link).

- `app/utils/explorerRoute.ts` — broaden `isExplorerRoutePath` to match `/explorer` and `/explorer/<segment>`; add `explorerModeFromPath( path )` and `pathForExplorerMode( mode )` helpers.  Unknown trailing segments fall through to community.
- `app/composables/useExplorerMode.ts` — derive `explorerMode` from `route.path` (single source of truth).  No setter is exposed; the side-nav navigates directly.
- `app/components/explorer/ExplorerSideNav.vue` — items with a `mode` render as `<NuxtLink :to="pathForExplorerMode(mode)">`; items without a mode remain inert placeholders.  Active state is computed from `activeMode === mode` so it updates as soon as the route changes.
- `app/layouts/default.vue` — drop the `@mode-change` handler (the nav no longer emits).
- `app/pages/explorer/[[view]].vue` — renamed from `index.vue`; the optional-dynamic filename is the route registration (no `alias` in `definePageMeta` needed).

**Verify:**
- [ ] `GET /explorer` lands in community mode (default)
- [ ] `GET /explorer/enterprise` lands in enterprise-full mode directly (no community flash)
- [ ] `GET /explorer/enterprise-limited` lands in enterprise-limited mode directly
- [ ] `GET /explorer/garbage` falls through to community
- [ ] Clicking nav items pushes the corresponding URL and updates `route.path`
- [ ] Browser back/forward correctly traverses mode changes
- [ ] Crossing into/out of `/explorer*` still triggers a full reload (per the navigation plugin); switching between modes does NOT reload

---

#### Step B7 — i18n keys (Engineering, ~30 min)

**What:**
Add two message keys to all `i18n/*.json` locale files:
- `explorer-side-nav-enterprise-apis` — label for the full Enterprise mode nav entry
- `explorer-side-nav-enterprise-apis-limited` — label for the limited Enterprise mode nav entry

**Verify:**
- [ ] Nav renders correct English labels for both entries
- [ ] No missing-key warnings in browser console
- [ ] Keys exist in every locale file listed in `config/languages.ts`

---

### Phase C: Full Enterprise mode verification

#### Step C1 — Populate `ENTERPRISE_FULL_SCALAR_OVERRIDES` and QA (Engineering, ~1 day)

**What:**
Using findings from Step A1:
- Set `showSidebar: true` in `ENTERPRISE_FULL_SCALAR_OVERRIDES`
- If CORS required a proxy: add `/server/api/enterprise-spec.get.ts` route that proxies the spec URL (analogous to `/server/api/discovery.get.ts`), and update `ENTERPRISE_SPEC_URL` to point to the local proxy
- Run QA against the live spec

**Verify:**
- [ ] All endpoints from the Enterprise spec appear in Scalar's sidebar
- [ ] Tags render as sidebar section headers (Snapshot, On-demand, Realtime, or whatever the spec declares)
- [ ] Scalar's auth panel surfaces a Bearer token input field
- [ ] Entering a valid Bearer token and clicking "Test request" on an endpoint returns a non-401 response (requires a valid test token)
- [ ] Switching back to community mode fully restores community layout with no residual Enterprise state
- [ ] No `console.error` during mode switch in either direction

---

### Phase D: Limited Enterprise mode

#### Step D1 — Populate `ENTERPRISE_LIMITED_SCALAR_OVERRIDES` (Engineering, ~1–3 days)

**What:**
Using findings from Step A2:
- Apply every available Scalar hide flag for the required elements to `ENTERPRISE_LIMITED_SCALAR_OVERRIDES` in `config/enterpriseExplorer.ts`
- If any required element cannot be hidden by config alone, build `ExplorerEnterpriseEndpointList.vue` — a custom component that renders the Enterprise spec's paths as a static list with method badges, path, and summary text; no Scalar instance rendered in this mode

**Verify (config-only path):**
- [ ] "Test request" button is absent
- [ ] Client library code preview is absent (both global section and per-endpoint)
- [ ] Schema / response example box is absent
- [ ] Parameter sections are absent
- [ ] "Responses" section is absent
- [ ] Endpoint paths and summaries are still visible

**Verify (custom component path, if required):**
- [ ] All endpoints render with method badge, path, and summary
- [ ] No Scalar instance is rendered in limited mode
- [ ] Clicking an endpoint shows its summary (or links to Enterprise documentation, if link strategy is decided — see §8.9)

---

### Phase E: Toggle and cleanup verification

#### Step E1 — Confirm enabled flag toggles work end-to-end

**What:**
Manually set `enabled: false` on each Enterprise entry in turn and confirm behavior.

**Verify (after Phase D is live):**
- [ ] Setting `enterprise-full` entry `enabled: false` → that nav item disappears; other Enterprise entries still present
- [ ] Setting `enterprise-limited` entry `enabled: false` → that nav item disappears; other Enterprise entries still present
- [ ] Setting all Enterprise entries to `enabled: false` → side nav renders with only "Wikimedia API modules"; no console errors; community mode unaffected
- [ ] Restoring all to `enabled: true` → all entries reappear

**Verify (after Phase F is live — extends E1):**
- [ ] Setting `enterprise-custom` entry `enabled: false` → that nav item disappears; Scalar-bearing Enterprise entries unaffected
- [ ] With `enterprise-custom` enabled and the other two disabled → only the custom entry appears under "API Explorer"; clicking it lands in the custom view

---

### Phase F: Custom Enterprise mode (path D-c) — `enterprise-custom`

Independent of Phase D's `enterprise-limited` mode (which stays as path D-a, Scalar with hide flags).  Phase F adds a third side-nav entry that opens a non-Scalar tag-driven viewer.  Steps F2–F5 can be implemented in order; F1 is a small prerequisite and can ship alongside F2.  Phase E's checklist is extended (see above) to cover the third `enabled` toggle once F2 lands.

---

#### Step F1 — Extend ExplorerMode and routing (Engineering, ~1 hour)

**What:**
- Add `'enterprise-custom'` to the `ExplorerMode` type in `app/composables/useEnterpriseExplorer.ts` (the canonical type) and to the JSDoc typedef in `config/explorerSideNav.js`.
- Add `ENTERPRISE_CUSTOM_SEGMENT = 'enterprise-custom'` to `app/utils/explorerRoute.ts`.
- Extend `explorerModeFromPath()` to map `/explorer/enterprise-custom` → `'enterprise-custom'` (placed alongside the existing full/limited checks; unknown segments still fall through to community).
- Extend `pathForExplorerMode()` to return `/explorer/enterprise-custom` for the new mode.
- No new page file — the existing `app/pages/explorer/[[view]].vue` optional-dynamic route already covers the new sub-route.

**Verify:**
- [ ] `pathForExplorerMode( 'enterprise-custom' )` returns `/explorer/enterprise-custom`
- [ ] `explorerModeFromPath( '/explorer/enterprise-custom' )` returns `'enterprise-custom'`
- [ ] `useExplorerMode()` returns `'enterprise-custom'` when the route is `/explorer/enterprise-custom`
- [ ] TypeScript compiles across all consumers of `ExplorerMode`

---

#### Step F2 — Side nav entry + i18n (Engineering, ~30 min)

**What:**
- Add a fourth item to the `api-explorer` section of `config/explorerSideNav.js`: `id: 'enterprise-apis-custom'`, `messageKey: 'explorer-side-nav-enterprise-apis-custom'`, `mode: 'enterprise-custom'`, `enabled: true`.
- Add the message key `explorer-side-nav-enterprise-apis-custom` to every locale file in `i18n/` (`en.json`, `es.json`, `fa.json`, `fr.json`, `he.json`) and a documentation entry to `qqq.json`.

**Verify:**
- [ ] Three Enterprise entries appear in the rendered side nav (one is the new "Enterprise (Custom)")
- [ ] Setting `enabled: false` on the new entry removes it without code change
- [ ] No missing-key warnings in browser console
- [ ] `aria-current="page"` follows the active route across all four entries

---

#### Step F3 — Server-parsed spec endpoint (Engineering, ~3 hours)

**What:**
- Add `/server/api/enterprise-spec-parsed.get.ts`.  Source the upstream URL by importing the constant from the existing `/server/api/enterprise-spec.get.ts` (export it from there; one source of truth).
- Install `yaml` as a server-side dependency (no client bundle impact).
- The handler:
  1. Fetches the upstream YAML with the existing user-agent header.
  2. Parses YAML → JS object.
  3. Walks `paths.*.<method>` extracting `{ operationId, method, path, summary, description, tags }` for each operation.  Methods are restricted to a known whitelist (`get`, `post`, `put`, `patch`, `delete`, `head`, `options`); anything else is dropped.
  4. Builds `operationsByTag` by primary tag; operations without tags go to `__untagged__`.
  5. Builds `tags` from spec-root `tags:` (preserving order), then appends any tag found in operations but not in the root list.  `__untagged__` is appended last only when non-empty.
  6. Returns JSON with `content-type: application/json` and `cache-control: public, max-age=300`.
- On upstream failure: throw the same `502` shape as the existing proxy.

**Verify:**
- [ ] `GET /api/enterprise-spec-parsed` returns 200 with `content-type: application/json`
- [ ] Response shape matches `EnterpriseSpecOutline` (see §7.4)
- [ ] All operations from the upstream YAML are present in exactly one tag bucket
- [ ] Tag ordering reflects the spec's root `tags:` order, with extras appended

---

#### Step F4 — Composable + custom component (Engineering, ~1–1.5 days)

**What:**
- `app/composables/useEnterpriseSpecOutline.ts` — calls `$fetch('/api/enterprise-spec-parsed')`, exposes `{ tags, operationsByTag, isLoading, hasError, errorMessage }`.  No URL construction (path is the proxy route, treated as opaque); full JSDoc.
- `app/components/explorer/ExplorerEnterpriseCustom.vue`:
  - Consumes `useEnterpriseSpecOutline()`.
  - Reads `route.hash` on mount; selects the matching tag or falls back to the first non-empty tag.
  - Sidebar: `role="tablist"`, vertical `aria-orientation="vertical"`; each tag is a button with `role="tab"`, `aria-selected`, and `tabindex` per the active-tab pattern.  Tag display name in `<bdi>`.
  - Detail panel: `role="tabpanel"`, `aria-labelledby` the selected tab's id.  Each row contains method (LTR, monospace, method-coloured per DESIGN_REQUIREMENTS §Endpoint rows), path (`<bdi>`, monospace), summary (`<bdi>`), description rendered as Markdown inside a single `<bdi>`.
  - Selection updates `route.hash` via `router.replace({ hash: '#tag=' + encodeURIComponent(name) })`.
  - Loading state uses the same spinner pattern as the Scalar shell (reuses `.explorer-page__scalar-loading-indicator` class via shared CSS, OR replicates locally with logical-property CSS).
  - Error state uses `CdxMessage type="error"` with the upstream error message in `<bdi>`.
- Markdown renderer: decision between (a) Nuxt Content `<ContentRenderer>` for arbitrary strings, (b) `markdown-it` minimal config.  Whichever is chosen, output is sanitized (no raw HTML execution from external spec strings) and wrapped in `<bdi>`.

**Verify:**
- [ ] Sidebar lists every tag from the spec, in spec order, in `<bdi>`
- [ ] Selecting a tag swaps the detail panel to that tag's endpoints; method colours match DESIGN_REQUIREMENTS
- [ ] Method tokens render `dir="ltr"` even in an RTL interface
- [ ] Descriptions render Markdown (links, lists, code spans, fenced code) cleanly
- [ ] `aria-selected` and `aria-labelledby` wiring is correct in screen reader output
- [ ] Keyboard: ←/↑/→/↓ traverse tabs, Home/End jump (standard WAI-ARIA tab pattern); Enter/Space selects
- [ ] No Vue reactivity warnings, no `console.error`
- [ ] Component never calls `$fetch` directly (all data flows through the composable)

---

#### Step F5 — Page wiring + layout polish (Engineering, ~3 hours)

**What:**
- In `app/pages/explorer/[[view]].vue`:
  - Add `isCustomEnterpriseMode = computed( () => explorerMode.value === 'enterprise-custom' )`.
  - Gate `useEnterpriseExplorer( enterpriseMode )` so it only runs for full/limited (current behaviour for community is already gated; extend the same shape).
  - Replace the `ExplorerScalarReference` slot when `isCustomEnterpriseMode` is true: render `<ExplorerEnterpriseCustom />` in lieu of the Scalar shell.  Reuse the existing `.explorer-page__reference-panel` wrapper (border, sticky behaviour ≥ 960px) so the visual frame matches.
  - Keep `selectedModule` / `wikiDisplayName` rendering gated on `isCommunityMode` (already the case for the chip).
  - `isScalarReady` / `isScalarSwitching` overlays are unused in custom mode; the component owns its own loading state.
- Page title for the custom mode uses `explorer-side-nav-enterprise-apis-custom`.
- Verify the existing crossing-boundary plugin still works: `isExplorerRoutePath` already matches `/explorer/<segment>` so no change needed there.
- Verify `useExplorerScalarFocus` is unaffected (it is page-scoped but receives no input in Enterprise modes).

**Verify:**
- [ ] Default state: community mode unchanged
- [ ] Clicking "Enterprise APIs" → Scalar-full mode (unchanged)
- [ ] Clicking "Limited Enterprise API" → Scalar with hide flags (unchanged)
- [ ] Clicking "Enterprise (Custom)" → no Scalar in the DOM; custom component renders
- [ ] Direct deep-link to `/explorer/enterprise-custom` → custom component renders without a community flash
- [ ] `/explorer/enterprise-custom#tag=articles` → "articles" tab is selected on first render
- [ ] Switching between the three Enterprise modes does not leave Scalar artifacts when leaving the custom mode (custom mode never mounts Scalar in the first place)
- [ ] Switching from Custom back to Community fully restores the community layout
- [ ] RTL: with interface language `he` or `fa`, the tag sidebar moves to the inline-start side; method tokens stay LTR; everything still BiDi-isolated
- [ ] Setting `enterprise-custom`'s `enabled: false` in config removes the entry; deep-link to `/explorer/enterprise-custom` still resolves to the mode (the route is the source of truth, not the nav) — Product to confirm whether this is desired or whether the route should also be gated

---

### Summary checklist

| Step | Phase | Status | Estimated effort |
|---|---|---|---|
| A1 — Spec verification | A | ✅ Complete | — |
| A2 — Scalar audit | A | ✅ Complete | — |
| B1a — Enterprise spec proxy route | B | ✅ Complete | — |
| B1b — `config/enterpriseExplorer.ts` | B | ✅ Complete | — |
| B2 — Side nav config | B | ✅ Complete | — |
| B3 — `ExplorerSideNav.vue` | B | ✅ Complete | — |
| B4 — `useEnterpriseExplorer.ts` | B | ✅ Complete | — |
| B5 — Explorer page wiring | B | ✅ Complete | — |
| B6.5 — URL representation (sub-route deep-links) | B | ✅ Complete | — |
| B7 — i18n keys | B | ✅ Complete | — |
| C1 — Full mode QA | C | ✅ Complete (pending browser sign-off) | — |
| D1 — Limited mode (path D-a, see §7.3) | D | ⛔ Removed 2026-07-22 (see Update note) | — |
| E1 — Toggle verification | E | ✅ Complete (pending browser sign-off; now covers 2 entries) | — |
| F1 — Extend ExplorerMode + routing | F | ✅ Complete | — |
| F2 — Side nav entry + i18n | F | ✅ Complete | — |
| F3 — Server-parsed spec endpoint | F | ✅ Complete (path-item summary/description fallback added) | — |
| F4 — Composable + custom component | F | ✅ Complete (pending browser sign-off) | — |
| F5 — Page wiring + layout polish | F | ✅ Complete (pending browser sign-off) | — |

---

## 11. Configuration and file locations (proposed)

Following ARCHITECTURE.md and AGENTS.md conventions:

> Reflects the current state after the Update (2026-07-22) note — two Enterprise
> modes (`enterprise-full`, `enterprise-custom`) and a locally-served spec.

| What | Where |
|---|---|
| Enterprise spec URL + Scalar overrides | `config/enterpriseExplorer.ts` (`ENTERPRISE_SPEC_URL`, `ENTERPRISE_FULL_SCALAR_OVERRIDES`) |
| Enterprise spec document (bundled, served locally) | `server/assets/wme-api.yaml` |
| Side nav with Enterprise items (full, custom) | `config/explorerSideNav.js` (extended) |
| Mode enum type (`community` / `enterprise-full` / `enterprise-custom`) | `app/composables/useEnterpriseExplorer.ts` |
| Mode state | `app/composables/useExplorerMode.ts` (derived from route; no setter — nav uses NuxtLink) |
| Mode ↔ URL path mapping | `app/utils/explorerRoute.ts` |
| Sub-route deep-link registration | File-based optional-dynamic route — `app/pages/explorer/[[view]].vue` |
| Enterprise composable (Scalar-bearing mode) | `app/composables/useEnterpriseExplorer.ts` |
| Enterprise spec outline composable (custom mode) | `app/composables/useEnterpriseSpecOutline.ts` (Phase F) |
| Server route (YAML, for Scalar — reads the local asset) | `server/api/enterprise-spec.get.ts` |
| Server endpoint (JSON outline, for custom mode — reads the local asset) | `server/api/enterprise-spec-parsed.get.ts` (Phase F) |
| Custom Enterprise viewer component | `app/components/explorer/ExplorerEnterpriseCustom.vue` (Phase F) |
| i18n labels | `i18n/*.json` — keys: `explorer-side-nav-enterprise-apis`, `explorer-side-nav-enterprise-apis-custom` |

---

## 12. Decision log

| Decision | Status | Owner |
|---|---|---|
| Which Scalar UI elements can be hidden in limited mode | ✅ Resolved — see §7 | — |
| CORS proxy required for Enterprise spec | ✅ Resolved — proxy route in Phase B | — |
| Bearer auth mechanism | ✅ Resolved — native Scalar auth panel | — |
| Both modes ship as toggled nav entries | ✅ Resolved — see §8.1 | — |
| Full vs. limited mode first | ✅ Resolved — both built, `enabled` flag controls exposure | — |
| Enterprise spec tags (9 vs. 3 expected) | Open — confirm expectation | Product |
| Limited mode path (D-a config / D-b CSS / D-c custom component) | ✅ Resolved — `enterprise-limited` stays on D-a (Scalar with hide flags); D-c implemented separately as the new `enterprise-custom` mode (see §7.4) | Product (2026-06-11) |
| Add a third `enterprise-custom` mode (path D-c, non-Scalar tag viewer) | ✅ Resolved 2026-06-11 — see §7.4 + Phase F | Product / Engineering |
| Sidebar interaction in custom mode (single-select vs. accordion) | ✅ Resolved 2026-06-11 — single-select tablist | Product |
| Endpoint description rendering in custom mode | ✅ Resolved 2026-06-11 — Markdown | Product |
| Spec parsing location for custom mode | ✅ Resolved 2026-06-11 — server-side endpoint returning JSON | Engineering |
| Active-tag deep-linking in custom mode | ✅ Resolved 2026-06-11 — hash fragment `#tag=<name>` | Product |
| URL representation of enterprise mode | ✅ Resolved — sub-route per mode (`/explorer/enterprise`, `/explorer/enterprise-limited`, `/explorer/enterprise-custom`); community stays at `/explorer` | Engineering (§8.3) |
| Custom mode: gate route when nav entry is disabled? | Open — does setting `enabled: false` on `enterprise-custom` also need to redirect `/explorer/enterprise-custom`? | Product |
| Enterprise layout specification | Open | Design (§9.5) |
| Operational separation adequacy | Open | Product (§9.4) |
| Registration CTA in enterprise view | Open | Design / Product (§8.9) |
| Remove `enterprise-limited` mode (keep `enterprise-full` + `enterprise-custom`) | ✅ Resolved 2026-07-22 — see Update note | Product / Engineering |
| Enterprise spec source: remote fetch vs. local bundled asset | ✅ Resolved 2026-07-22 — bundled at `server/assets/wme-api.yaml`, served via Nitro server-asset storage; remote endpoint no longer used | Engineering |

---

## Appendix A: Files that will change

| File | Nature of change |
|---|---|
| `server/assets/wme-api.yaml` | **New file (2026-07-22)** — the Enterprise OpenAPI spec, committed and served from the local system (replaces the remote fetch) |
| `server/api/enterprise-spec.get.ts` | New file (Phase B) — spec route for Scalar.  Originally a proxy for the remote URL (CORS workaround, see §8.10); **2026-07-22: now reads the bundled `server/assets/wme-api.yaml` via `useStorage('assets:server')` and exports `readEnterpriseSpecYaml()` for reuse by the parsed endpoint** |
| `server/api/enterprise-spec-parsed.get.ts` | **New file (Phase F)** — server-side YAML→JSON conversion, returns `{tags, operationsByTag}` for the custom mode.  2026-07-22: reads the local asset via `readEnterpriseSpecYaml()` (no upstream fetch) |
| `config/explorerSideNav.js` | Phase B: add Enterprise items with `mode` + `enabled` fields; remove static `isActive`.  Phase F: add the `enterprise-custom` item.  2026-07-22: remove the `enterprise-limited` item |
| `config/enterpriseExplorer.ts` | New file (Phase B) — `ENTERPRISE_SPEC_URL` (local route path), `ENTERPRISE_FULL_SCALAR_OVERRIDES`.  2026-07-22: `ENTERPRISE_LIMITED_SCALAR_OVERRIDES` removed |
| `app/components/explorer/ExplorerSideNav.vue` | Phase B: accept `activeMode` prop, filter by `enabled`, render mode-bearing items as `NuxtLink` to their sub-route, compute `isActive` dynamically.  Phase F: no change — new entry uses the existing pattern |
| `app/components/explorer/ExplorerEnterpriseCustom.vue` | **New file (Phase F)** — tag-driven custom viewer (tablist sidebar + endpoint detail panel with Markdown descriptions) |
| `app/pages/explorer/[[view]].vue` | Phase B: optional-dynamic route, `explorerMode` derivation, conditional rendering of rail + controls, per-mode Scalar config.  Phase F: add `enterprise-custom` branch that mounts `ExplorerEnterpriseCustom` instead of `ExplorerScalarReference` |
| `app/composables/useEnterpriseExplorer.ts` | Phase B: returns spec URL + per-mode Scalar overrides.  Phase F: extend `ExplorerMode` union with `'enterprise-custom'`.  2026-07-22: drop `'enterprise-limited'` from the union and the `mode` parameter — only the full overrides remain |
| `app/composables/useEnterpriseSpecOutline.ts` | **New file (Phase F)** — fetches `/api/enterprise-spec-parsed`, exposes reactive `{tags, operationsByTag, isLoading, hasError, errorMessage}` |
| `app/composables/useExplorerMode.ts` | Phase B: derives mode from `route.path` (read-only).  Phase F: no change — new mode resolved via `explorerModeFromPath` |
| `app/utils/explorerRoute.ts` | Phase B: broadened `isExplorerRoutePath`; added `explorerModeFromPath` and `pathForExplorerMode` helpers.  Phase F: add `ENTERPRISE_CUSTOM_SEGMENT` and route it in the helpers.  2026-07-22: remove `ENTERPRISE_LIMITED_SEGMENT` and its mapping |
| `i18n/en.json` (and other locales) | Phase B: two new keys.  Phase F: third key `explorer-side-nav-enterprise-apis-custom` in all 5 locales + qqq documentation.  2026-07-22: remove `explorer-side-nav-enterprise-apis-limited` from all locales + qqq |
| `ARCHITECTURE.md` | Document four-mode explorer switching pattern, `enabled` toggle mechanism, spec proxy + parsed-outline pattern |
| `package.json` | Phase F: add `yaml` dependency (server-side only) |

## Appendix B: Files that will NOT change

| File | Reason |
|---|---|
| `server/api/explorer-bootstrap.get.ts` | Enterprise uses static spec, no bootstrap needed |
| `server/api/discovery.get.ts` | Enterprise does not use MediaWiki discovery |
| `app/composables/useExplorerBootstrap.ts` | Community-only; untouched (already gated by `isCommunityMode`) |
| `config/instances.ts` | No per-wiki variation for Enterprise |
| `app/components/explorer/ExplorerModuleRail.vue` | Hidden in all Enterprise modes (incl. custom), component itself unchanged |
| `app/components/explorer/ExplorerProjectControls.vue` | Hidden in all Enterprise modes (incl. custom), component itself unchanged |
| `app/components/explorer/ExplorerScalarReference.client.vue` | Custom mode bypasses Scalar entirely; the component is unchanged and continues to serve community / enterprise-full |
| `app/plugins/explorer-route-navigation.client.ts` | `isExplorerRoutePath` already matches `/explorer/<segment>`; no boundary change needed for the new sub-route |
| `scripts/fetch-remote-content.mjs` | Enterprise spec is a bundled server asset served at runtime, not part of the build-time content fetch |
