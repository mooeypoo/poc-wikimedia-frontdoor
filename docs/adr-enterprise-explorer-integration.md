# ADR: Enterprise API Explorer Integration

**Status:** Proposed — pending design sign-off and ambiguity resolution (see §9)
**Scope:** API Explorer page — Enterprise mode toggle, configurable Scalar rendering, Enterprise OpenAPI spec integration

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

**Source:** `https://api.enterprise.wikimedia.com/spec/spec.yaml`

This is a static, externally hosted OpenAPI YAML.  It is not fetched via the Wikimedia MediaWiki discovery endpoint (`/w/rest.php/specs/v0/discovery`) and does not follow the multi-instance, multi-module model of the community APIs.

**What this means architecturally:**

- The Enterprise spec **must not** go through `/server/api/explorer-bootstrap.get.ts` — that route is scoped to wiki instances and the discovery protocol.
- The spec URL is a single stable external URL with no per-wiki variation.  It belongs in config, not in runtime discovery.
- The existing remote content fetching infrastructure (`/scripts/fetch-remote-content.mjs` and `config/remoteContentSources.ts`) handles Markdown prose pages at build time.  The Enterprise spec is fetched at runtime by Scalar (passed as `spec.url`).  These are separate concerns and should stay separate.

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

- Wiki instance combobox (selecting enwiki, eswiki, etc.)
- Opt-in checkboxes (beta/internal endpoints)

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
type ExplorerMode = 'community' | 'enterprise-full' | 'enterprise-limited'
```

This state is managed on the Explorer page itself (not in a Pinia store — it is page-local and does not need to survive navigation away from the Explorer).

Both Enterprise modes share the same spec URL.  They differ only in which Scalar configuration overrides are applied (see §5.4 and `config/enterpriseExplorer.ts`).

### 5.2 Side nav configuration change

`config/explorerSideNav.js` gains two new items under "API Explorer" — one per Enterprise mode:

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

---

## 7. Scalar configuration properties for limited mode — gap analysis

The following UI elements are listed in the product requirements as candidates for hiding in "extreme limited" mode.  Their current status in the Scalar configuration API is as follows:

| UI element | Scalar config property | Status |
|---|---|---|
| "Client libraries" section (global) | `hideClientButton`? | **Unverified** — needs audit of installed version |
| Per-endpoint code preview ("Client libraries") | Unknown | **Unverified** |
| "Test request" button | `hideTestRequestButton: true` | ✅ Supported (already in defaults) |
| Schema and response example box | Unknown | **Unverified** |
| Parameter sections | Unknown | **Unverified** |
| "Responses" section | Unknown | **Unverified** |
| Download spec button | `hideDownloadButton: true` | ✅ Supported (already in defaults) |

**Action required (§9.1):** A targeted audit of the installed `@scalar/api-reference` package's configuration type definitions and changelog is needed before limited mode can be scoped.  This is a prerequisite — if Scalar cannot hide the required elements, a custom component is the fallback, which significantly increases effort.

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

### 8.3 UX: Should enterprise mode have a URL representation?

Currently the Explorer page is a single route (`/explorer`).  Should enterprise mode be at `/explorer` with a query param (`?mode=enterprise`), or a sub-route (`/explorer/enterprise`), or purely in-memory state?

URL representation allows:
- Deep-linking directly to the Enterprise view
- Browser back/forward working correctly when switching modes

In-memory state means:
- Simpler implementation (no routing changes)
- No shareable URL for the Enterprise view

**Decision needed from:** Product / Engineering
**Recommendation:** Use a query param (`?view=enterprise`) — minimal routing change, preserves shareability, consistent with how the Explorer page already handles no sub-routes.

### 8.4 UX: What happens to the layout in enterprise mode?

When switching to enterprise mode, the module rail and project controls disappear.  This changes the three-column layout to effectively two columns (left nav + center Scalar panel).  The DESIGN_REQUIREMENTS.md specifies a `4 + 16 + 4` column split for the three-column explorer layout.  Enterprise mode may warrant a wider center column (`4 + 20` or simply `4 + 16` with the right column absent).

**Decision needed from:** Design
**Implementation impact:** CSS grid column spans on the Explorer page.

### 8.5 Technical: Scalar sidebar shows Enterprise tags — but which tags?

The product requirement states "Enterprise has one spec per API (Snapshot, On-demand, Realtime), which mimics the current behavior for API modules."  This implies the Enterprise spec YAML already uses OpenAPI `tags` correctly.  However, this has not been verified against the live spec.

**Action required:** Load `https://api.enterprise.wikimedia.com/spec/spec.yaml` and confirm:
- Tags exist in the spec (`tags:` top-level array populated)
- All operations are tagged
- Tag names match expected groupings (Snapshot, On-demand, Realtime)

**Implementation impact:** If tags are absent or incorrect in the spec, Scalar's sidebar will render a flat endpoint list.  Tagging would require either forking the spec (not desirable) or a custom grouping overlay.

### 8.6 Technical: Authorization — Bearer token input mechanism

Product states: "If a user already has an Enterprise account, they may request their token credentials and embed them in subsequent calls."

Scalar provides a built-in authentication panel for APIs that declare security schemes.  If the Enterprise spec declares `bearerAuth` (HTTP Bearer token) as a security scheme, Scalar will surface an auth input automatically.

**Action required:** Confirm the Enterprise spec declares a Bearer token security scheme:
```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

If declared, Scalar handles the auth input natively.  If not, either the spec needs updating (not our repo) or a custom auth overlay is required.

**Also ambiguous:** The requirement states "if an auth header is provided, confirm that requests can be successfully made."  This implies a verification step, not just a UI step — CORS policy, preflight handling, and Scalar's proxy behavior all affect whether test requests from the browser succeed against `api.enterprise.wikimedia.com`.

### 8.7 Technical: ExplorerScalarFocus composable — compatibility with enterprise mode

`useExplorerScalarFocus` manages the poll-based focus mechanism that scrolls Scalar to a selected endpoint when the user clicks in the module rail.  This composable reads Scalar's internal sidebar items to resolve operation IDs.

In enterprise mode with Scalar's own sidebar (`showSidebar: true`), the module rail is hidden and no focus-from-rail mechanism is needed.  However, the focus composable is wired at the page level and would still run.  This is harmless if it receives no input, but the initialization path should be guarded to avoid spurious polling.

### 8.8 Technical: Static `isActive` removal — regression risk

Removing `isActive` from the config and making it computed from `explorerMode` is a clean improvement but is a structural change to both the config schema and the component.  The existing unit tests (if any) for `ExplorerSideNav.vue` will need updating.

**Note:** There are currently no operational routes in the side nav.  The change is low regression risk in practice, but requires care to avoid breaking the static `isActive` rendering that currently exists.

### 8.9 Product: Should Enterprise account creation be linked from the Explorer?

Requirements note "Account creation remains on the Enterprise website."  Should the Enterprise mode surface a prominent link/CTA to the Enterprise registration page?  This affects the UI layout in enterprise mode but is unspecified.

### 8.10 Technical: CORS / network access for the Enterprise spec

The Enterprise spec at `https://api.enterprise.wikimedia.com/spec/spec.yaml` is fetched by Scalar directly from the browser (not proxied through the Front Door server, unlike the community discovery flow).  If the Enterprise spec server does not return appropriate CORS headers, Scalar will fail to load it in the browser.

**Action required:** Verify CORS headers on `api.enterprise.wikimedia.com/spec/spec.yaml` before committing to browser-side spec loading.  If CORS is blocked, the spec must be proxied through a new server route (similar to `/server/api/discovery.get.ts`).

---

## 9. Prerequisites before implementation begins

The following must be resolved before implementation work starts, in priority order:

### 9.1 Scalar capability audit (blocking for limited mode)

Load the installed version of `@scalar/api-reference` and enumerate all available configuration properties.  Specifically confirm whether the following can be hidden via config:

- Schema / response examples
- Parameter sections
- "Responses" section
- Client library code preview per endpoint

**Who:** Engineering
**When:** Before limited-mode implementation is scoped
**Output:** List of supported hide flags, or confirmation that a custom component is required

### 9.2 Enterprise spec verification (blocking for all implementation)

Load `https://api.enterprise.wikimedia.com/spec/spec.yaml` and confirm:

- CORS allows browser-side fetch (or decide to proxy)
- Tags are present and correctly represent Snapshot/On-demand/Realtime
- Bearer token security scheme is declared

**Who:** Engineering (30-minute task)
**When:** Immediately

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

#### Step A1 — Verify the Enterprise spec (Engineering, ~30 min)

**What:**
1. Fetch `https://api.enterprise.wikimedia.com/spec/spec.yaml` from a browser and from `curl` with `--head` to inspect response headers.
2. Check `Access-Control-Allow-Origin` header — if absent or restricted, a proxy route is required.
3. Open the YAML and check for a top-level `tags:` array; verify all `paths` operations carry `tags:` fields.
4. Check `components.securitySchemes` for a Bearer HTTP scheme.

**Verify:**
- [ ] CORS: spec is browser-fetchable without a proxy, OR decision is made to proxy through `/server/api/enterprise-spec.get.ts`
- [ ] Tags: `tags:` array exists and matches expected groupings (Snapshot, On-demand, Realtime, or current actual values)
- [ ] Auth: Bearer security scheme is declared and applied to operations

**Output:** Document findings inline in §8.5, §8.6, §8.10 of this ADR.  Unblocks all subsequent steps.

---

#### Step A2 — Scalar capability audit (Engineering, ~2–4 hours)

**What:**
1. Open `node_modules/@scalar/api-reference/dist/` (or the package's TypeScript types) and enumerate the full configuration interface.
2. Record every property that begins with `hide` or affects rendering of: client code examples, schema boxes, parameter sections, response sections.
3. Test each candidate flag against a local Scalar instance with the Enterprise spec URL.

**Verify:**
- [ ] §7 table is fully populated — every "Unverified" row is resolved to a specific flag name or "Not supported"
- [ ] If any required element cannot be hidden by config alone, the custom component path is explicitly acknowledged

**Output:** Updated §7 table.  Determines whether Phase D is 2 days or 5 days.

---

### Phase B: Infrastructure — mode switching

#### Step B1 — Create `config/enterpriseExplorer.ts` (Engineering, ~1 hour)

**What:**
Create `/config/enterpriseExplorer.ts` with:
- `ENTERPRISE_SPEC_URL` constant
- `ENTERPRISE_FULL_SCALAR_OVERRIDES` — stub object (will be populated in Step C1)
- `ENTERPRISE_LIMITED_SCALAR_OVERRIDES` — stub object (will be populated in Step D1)
- JSDoc on each export

```ts
export const ENTERPRISE_SPEC_URL = 'https://api.enterprise.wikimedia.com/spec/spec.yaml'

/** Scalar overrides for the full Enterprise experience. */
export const ENTERPRISE_FULL_SCALAR_OVERRIDES = {
  showSidebar: true
}

/** Scalar overrides for the limited Enterprise experience. */
export const ENTERPRISE_LIMITED_SCALAR_OVERRIDES = {
  showSidebar: true,
  hideTestRequestButton: true,
  hideDownloadButton: true
  // remaining flags populated after Step A2 audit
}
```

**Verify:**
- [ ] TypeScript compiles with no errors
- [ ] Config is importable from a composable

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
- Compute `isActive` per item as `item.mode === props.activeMode`
- Wire click handler on each item: `emit('mode-change', item.mode)`
- Remove `@click.prevent` no-op; replace with actual handler
- Update `defineEmits` to declare `'mode-change': [mode: ExplorerMode]`

**Verify:**
- [ ] With `activeMode='community'` (default): "Wikimedia API modules" renders with active styling; Enterprise entries render without
- [ ] Clicking "Enterprise APIs" emits `mode-change` with value `'enterprise-full'`
- [ ] Clicking "Limited Enterprise API" emits `mode-change` with value `'enterprise-limited'`
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

#### Step B5 — Update Explorer page (`index.vue`) (Engineering, ~3 hours)

**What:**
- Add `explorerMode` ref: `const explorerMode = ref<ExplorerMode>('community')`
- Pass `activeMode` prop to `ExplorerSideNav`: `:activeMode="explorerMode"`
- Handle `@mode-change` event: `(mode) => { explorerMode.value = mode }`
- Wrap `useExplorerBootstrap()` call (and its reactive effects) so it only runs when `explorerMode.value === 'community'`
- Guard `useExplorerScalarFocus` init similarly — no-op when mode is enterprise
- Conditionally render: `<ExplorerProjectControls v-if="explorerMode === 'community'" />`
- Conditionally render: `<ExplorerModuleRail v-if="explorerMode === 'community'" />`
- When `explorerMode` is an enterprise value, instantiate `useEnterpriseExplorer` and pass its `specUrl` and `scalarOverrides` into the Scalar config

**Verify:**
- [ ] Default state: community mode, module rail visible, project controls visible, community bootstrap runs
- [ ] Click "Enterprise APIs" → module rail disappears, project controls disappear, bootstrap does not re-run
- [ ] Scalar loads the Enterprise spec URL (confirm in browser network tab)
- [ ] Click "Wikimedia API modules" → community layout fully restores, community bootstrap resumes for selected instance
- [ ] Click "Limited Enterprise API" → same layout as enterprise-full (module rail hidden); Scalar loads with limited overrides
- [ ] No spurious network calls to `/api/explorer-bootstrap` when in enterprise mode

---

#### Step B6 — i18n keys (Engineering, ~30 min)

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

**Verify:**
- [ ] Setting `enterprise-full` entry `enabled: false` → that nav item disappears; limited entry still present
- [ ] Setting `enterprise-limited` entry `enabled: false` → that nav item disappears; full entry still present
- [ ] Setting both to `enabled: false` → side nav renders with only "Wikimedia API modules"; no console errors; community mode unaffected
- [ ] Restoring both to `enabled: true` → both entries reappear

---

### Summary checklist

| Step | Phase | Blocking | Estimated effort |
|---|---|---|---|
| A1 — Spec verification | A | Yes (unblocks all) | 30 min |
| A2 — Scalar audit | A | Yes (unblocks D) | 2–4 hrs |
| B1 — `config/enterpriseExplorer.ts` | B | No | 1 hr |
| B2 — Side nav config | B | No | 30 min |
| B3 — `ExplorerSideNav.vue` | B | After B2 | 2 hrs |
| B4 — `useEnterpriseExplorer.ts` | B | After B1 | 1 hr |
| B5 — Explorer page wiring | B | After B3, B4 | 3 hrs |
| B6 — i18n keys | B | No | 30 min |
| C1 — Full mode QA | C | After A1, B5 | 1 day |
| D1 — Limited mode overrides | D | After A2, B5 | 1–3 days |
| E1 — Toggle verification | E | After C1, D1 | 30 min |

---

## 11. Configuration and file locations (proposed)

Following ARCHITECTURE.md and AGENTS.md conventions:

| What | Where |
|---|---|
| Enterprise spec URL + Scalar overrides | `config/enterpriseExplorer.ts` |
| Side nav with Enterprise item | `config/explorerSideNav.js` (extended) |
| Mode enum type | `app/composables/useEnterpriseExplorer.ts` or `app/types/explorer.ts` |
| Mode state + switching logic | `app/pages/explorer/index.vue` |
| Enterprise composable | `app/composables/useEnterpriseExplorer.ts` |
| i18n labels | `i18n/*.json` — keys: `explorer-side-nav-enterprise-apis`, `explorer-side-nav-enterprise-apis-limited` |

---

## 12. Decisions deferred from this ADR

| Decision | Deferred to |
|---|---|
| Which Scalar UI elements can be hidden in limited mode | Step A2 audit |
| URL representation of enterprise mode | Product/Engineering (§8.3) |
| Enterprise layout specification | Design (§9.5) |
| Operational separation adequacy | Product (§9.4) |
| Registration CTA in enterprise view | Design/Product (§8.9) |
| Bearer token CORS proxy decision | Engineering post Step A1 |

---

## Appendix A: Files that will change

| File | Nature of change |
|---|---|
| `config/explorerSideNav.js` | Add two Enterprise items with `mode` + `enabled` fields; remove static `isActive` |
| `config/enterpriseExplorer.ts` | New file — spec URL, `ENTERPRISE_FULL_SCALAR_OVERRIDES`, `ENTERPRISE_LIMITED_SCALAR_OVERRIDES` |
| `app/components/explorer/ExplorerSideNav.vue` | Accept `activeMode` prop, filter by `enabled`, emit `mode-change`, compute `isActive` dynamically |
| `app/pages/explorer/index.vue` | Add `explorerMode` state, `mode-change` handler, conditional rendering of rail + controls, conditional Scalar config |
| `app/composables/useEnterpriseExplorer.ts` | New file — returns spec URL + per-mode Scalar overrides |
| `i18n/en.json` (and other locales) | Two new message keys: `explorer-side-nav-enterprise-apis`, `explorer-side-nav-enterprise-apis-limited` |
| `ARCHITECTURE.md` | Document three-mode explorer switching pattern and `enabled` toggle mechanism |

## Appendix B: Files that will NOT change

| File | Reason |
|---|---|
| `server/api/explorer-bootstrap.get.ts` | Enterprise uses static spec, no bootstrap needed |
| `server/api/discovery.get.ts` | Enterprise does not use MediaWiki discovery |
| `app/composables/useExplorerBootstrap.ts` | Community-only; untouched |
| `config/instances.ts` | No per-wiki variation for Enterprise |
| `app/components/explorer/ExplorerModuleRail.vue` | Hidden in enterprise mode, but component is unchanged |
| `scripts/fetch-remote-content.mjs` | Enterprise spec is runtime-fetched by Scalar, not build-time fetched |
