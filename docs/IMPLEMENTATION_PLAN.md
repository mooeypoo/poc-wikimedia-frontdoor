# Front Door Implementation Plan

This document tracks the implementation plan in execution order. It is structured so each experiment can be expanded later without rewriting earlier decisions.

## Basics (Foundation)

### Purpose
Establish architecture, conventions, and shared building blocks that all experiments depend on.

### Core Constraints
- The project is hybrid:
  - Static shell and prose content (Nuxt Content)
  - Dynamic API explorer (client-only route)
- UI strings must use banana-i18n.
- Content translation is handled through localized Markdown content.
- External strings must be BiDi-isolated in templates.
- First-party CSS must use logical properties.
- Spec URLs must come from discovery responses, never hardcoded.

### Canonical Stack
- Nuxt 4 + Nuxt Content
- Codex (`@wikimedia/codex`) for UI components
- banana-i18n for UI messages
- Scalar (`@scalar/api-reference`) for OpenAPI rendering
- Pinia for session/state where needed

### Package Guidance
- Use banana-i18n for interface translation.
- Keep Scalar integration on `@scalar/api-reference` (do not use `@scalar/nuxt`).
- Use `@nuxtjs/i18n` only if locale-prefixed routing is needed for content; do not use it for UI string rendering.

### Directory Conventions
- All app implementation code lives under `app/`.
- Composables live in `app/composables/`.
- Plugins live in `app/plugins/`.
- Pages and components stay in `app/pages/` and `app/components/`.
- Project-level configuration remains in `config/`.

### i18n Baseline
- Create `i18n/en.json` and `i18n/qqq.json` immediately.
- Add test locales such as `i18n/fr.json` and `i18n/he.json`.
- UI can fall back to English messages when locale keys are missing.

### Observability Baseline (Experimental)
- Add lightweight client-side diagnostics for discovery and spec switching:
  - selected instance
  - discovery fetch status
  - module count
  - selected module
  - normalized spec URL
  - Scalar update path (`Object.assign` vs remount fallback)
  - shell direction updates
- Keep logs debug-focused and non-blocking.

---

## Experiment 1 - Scalar Multi-Spec Reactivity

### Objective
Validate runtime spec switching in Nuxt 4 using Scalar inside a client-only explorer route, including LTR/RTL shell direction behavior.

### Primary Test Instances
- English Wikipedia
- Spanish Wikipedia
- Hebrew Wikipedia
- Farsi Wikipedia
- Commons Wiki

### Recommended Additional Stress-Test Instance
- Wikidata (optional but strongly recommended) to test structurally different API surfaces.

### Scope
- Add explorer route as client-only.
- Add discovery-driven instance/module selection.
- Fetch discovery from `{baseUrl}/w/rest.php/specs/v0/discovery` per selected instance.
- Pass discovery-provided spec URLs to Scalar.
- Re-render Scalar when selection changes.
- Update shell direction based on selected instance direction.
- Ensure explorer controls are Codex-based and UI strings are banana-i18n.

### Out of Scope
- Full OAuth flow
- Language-level spec selection and fallback chains for specs
- Search
- Wiki content sync pipeline
- Production-hardening of visual design

### Implementation Steps
1. Add configuration files:
   - `config/instances.js`
   - `config/languages.js`
   - `config/scalar.js`
2. Add i18n plugin and message files:
   - `app/plugins/banana-i18n.ts`
   - `i18n/en.json`, `i18n/qqq.json`, `i18n/fr.json`, `i18n/he.json`
3. Add composables in `app/composables/`:
   - `useDiscovery`
   - `useWikiModules`
   - `useSpecUrl`
   - `useScalarConfig`
   - `useDirection`
4. Build explorer UI page:
   - `app/pages/explorer/index.vue`
   - Use Codex selects for instance/module pickers
   - Wrap external display strings with BiDi isolation in template output
5. Update shell direction logic in `app/layouts/default.vue`:
   - drive `<html dir>` reactively from selected context
6. Add experimental diagnostics logging hooks for discovery/spec switching.

### Absolute vs Relative specUrl Handling
Discovery may return spec URLs in either form:
- Relative path (example: `/w/rest.php/specs/...`)
- Absolute URL (example: `https://example.org/w/rest.php/specs/...`)

Handling rule:
- Normalize by resolving against the selected instance base URL.
- Preserve absolute URLs as-is.
- Do not construct spec paths from patterns.

### Verification Checklist
- Each configured instance returns discovery data.
- Module picker updates from live discovery response.
- Scalar spec changes when instance/module changes.
- No blocking Vue reactivity warnings during switch.
- RTL instance selection updates shell direction to `rtl`.
- Switching back to LTR instance restores shell direction to `ltr`.
- Error states are visible and include debug breadcrumbs.

### Failure Handling (Experiment)
- If discovery fails for an instance, keep the explorer route alive and show a warning state.
- If Scalar does not react to config mutation:
  - record event in diagnostics log
  - use controlled remount fallback
  - document it as a known Experiment 1 limitation

### Open Questions Before Implementation
- Confirm final instance list for Experiment 1 (whether Wikidata is included).
- Confirm whether locale-prefixed routes are needed now or deferred.
- Confirm whether shell localization migration is included in this experiment or split to a dedicated stage.

### Explorer Loading Redesign Checklist (Instance-Bootstrap + Module-Switch)

This checklist defines the implementation for the revised explorer loading behavior.
It is aligned with AGENTS.md and ARCHITECTURE.md constraints:

- Keep explorer route client-only.
- Keep data/business logic in composables and server routes, not in page components.
- Use banana-i18n for all new interface strings.
- Keep external strings BiDi-isolated in templates.
- Keep first-party CSS logical-property based.
- Keep Scalar integration on @scalar/api-reference, not @scalar/nuxt.

#### A. State model and ownership

- [ ] Add an explorer orchestration composable (single source of truth), e.g. `useExplorerBootstrap()`.
- [ ] Define explicit loading domains:
   - [ ] `instanceBootstrapState`: `idle | loading | ready | error`
   - [ ] `scalarSwitchState`: `idle | switching`
- [ ] Add a request generation token so stale async work from a previous instance selection cannot mutate current UI state.
- [ ] Keep selection state in one place:
   - [ ] `selectedWikiInstanceId`
   - [ ] `selectedModuleName`
   - [ ] `expandedModuleNames` or equivalent accordion state

Acceptance criteria:
- [ ] Instance switch cannot display stale module lists.
- [ ] Module switch cannot be overwritten by an older in-flight response.

#### B. Server-side data path for instance bootstrap

- [ ] Add an aggregated instance bootstrap endpoint under `server/api/` that:
   - [ ] fetches discovery for selected instance
   - [ ] normalizes module entries
   - [ ] fetches each module's OpenAPI spec
   - [ ] extracts endpoint summaries per module
   - [ ] returns one payload containing wiki metadata, modules, endpoint summaries, and module spec URLs
- [ ] Add bounded concurrency for module spec fetching (do not fire all requests at once).
- [ ] Keep strict instance/spec URL validation checks used by existing routes.
- [ ] Add per-instance cache with TTL for bootstrap payloads.
- [ ] Keep or deprecate `module-operations.get.ts` intentionally; avoid duplicate long-term pathways.

Acceptance criteria:
- [ ] One instance bootstrap request yields all sidebar modules with endpoint lists.
- [ ] Endpoint extraction works for both array and object-shaped discovery payloads.
- [ ] Partial upstream failures are represented per-module without crashing full payload.

#### C. Composable refactor

- [ ] Move bootstrap orchestration out of `app/pages/explorer/index.vue` into composables.
- [ ] Keep `useDiscovery` as discovery-normalization helper or absorb it into bootstrap composable with a clear migration note.
- [ ] Replace on-demand per-module endpoint fetch calls in component with preloaded module endpoint data from composable state.
- [ ] Expose composable API for the page:
   - [ ] `isInstanceBootstrapping`
   - [ ] `isScalarSwitching`
   - [ ] `modulesWithEndpoints`
   - [ ] `selectedModule`
   - [ ] `selectModule( moduleName )`
   - [ ] `retryInstanceBootstrap()`

Acceptance criteria:
- [ ] Explorer page contains no fetch logic.
- [ ] Page uses composable outputs only for rendering and interaction.

#### D. Wide-screen UX behavior

- [ ] During instance bootstrap:
   - [ ] replace explorer interface with full-page loading animation
   - [ ] hide both sidebar and Scalar content until bootstrap completes
- [ ] After bootstrap:
   - [ ] sidebar header displays selected wiki name
   - [ ] sidebar renders each module with an accordion endpoint list
   - [ ] first module is auto-selected and visibly marked selected
- [ ] Module selection triggers (all equivalent):
   - [ ] click module title
   - [ ] open module accordion
   - [ ] click any module endpoint row
- [ ] On module selection:
   - [ ] show Scalar-only loading mask
   - [ ] switch Scalar spec to selected module
   - [ ] remove Scalar-only mask when Scalar load is ready

Acceptance criteria:
- [ ] Instance switch shows full-page loader until module/endpoints data is ready.
- [ ] Module switch shows loader only over Scalar area.
- [ ] Sidebar remains interactive post-bootstrap.

#### E. Narrow-screen UX behavior

- [ ] Keep module selection via Codex select on narrow screens.
- [ ] Use selected module from the same shared state model as desktop.
- [ ] On narrow-screen module change:
   - [ ] switch Scalar to selected module
   - [ ] prefer Scalar's internal loading indicator when sufficient
   - [ ] do not duplicate loading overlays if Scalar already provides clear load feedback
- [ ] Keep endpoint list behavior explicitly defined for narrow screens (either selected-module summary or none); document chosen behavior.

Acceptance criteria:
- [ ] Narrow-screen module select updates Scalar consistently.
- [ ] No double-spinners over Scalar.

#### F. i18n, BiDi, and direction guarantees

- [ ] Add banana-i18n message keys for all new loading states, labels, and errors in:
   - [ ] `i18n/en.json`
   - [ ] `i18n/es.json`
   - [ ] `i18n/fr.json`
   - [ ] `i18n/he.json`
   - [ ] `i18n/qqq.json`
- [ ] Wrap external strings in `<bdi>` (module names, wiki names, endpoint summaries).
- [ ] Keep intentional `dir="ltr"` on API paths and document why.
- [ ] Preserve reactive shell direction behavior from selected context.

Acceptance criteria:
- [ ] No hardcoded interface strings in templates.
- [ ] RTL/LTR switching remains correct in shell and explorer controls.

#### G. Scalar integration details

- [ ] Keep `showSidebar: false` in scalar config defaults.
- [ ] Continue in-place reactive config updates (`Object.assign`) unless Scalar behavior changes.
- [ ] Add explicit diagnostics events for:
   - [ ] bootstrap start/success/error
   - [ ] module select trigger source (title/accordion/endpoint/select)
   - [ ] Scalar switch start/ready/error
- [ ] Define Scalar ready signal strategy:
   - [ ] preferred: concrete render/ready event if available
   - [ ] fallback: deterministic post-config timing strategy

Acceptance criteria:
- [ ] No full component remount needed for normal module switches.
- [ ] Scalar loading state transitions are observable in diagnostics.

#### H. Error handling and retries

- [ ] Instance bootstrap hard failure:
   - [ ] show blocking error view with retry action
- [ ] Partial module failure during bootstrap:
   - [ ] keep explorer usable
   - [ ] mark affected modules as unavailable
   - [ ] expose retry path for failed module metadata/spec extraction
- [ ] Module switch failure:
   - [ ] keep previous Scalar content or show explicit module error state
   - [ ] do not leave indefinite spinner

Acceptance criteria:
- [ ] All failure paths end in a stable, actionable UI state.

#### I. Performance and resilience checks

- [ ] Verify bounded concurrency value against real module counts for configured instances.
- [ ] Add lightweight payload-size logging in diagnostics for bootstrap route.
- [ ] Cache invalidation policy documented (TTL, instance keying, refresh behavior).
- [ ] Ensure no repeated full bootstrap calls from redundant watchers.

Acceptance criteria:
- [ ] Re-selecting same instance uses cached data when valid.
- [ ] Instance switch does not trigger duplicate bootstrap requests.

#### J. Validation and rollout

- [ ] Add/adjust composable-level tests for:
   - [ ] first module default selection
   - [ ] stale request cancellation behavior
   - [ ] trigger-source-equivalent module selection
- [ ] Manual verification matrix:
   - [ ] all configured instances
   - [ ] desktop wide-screen flow
   - [ ] narrow-screen flow
   - [ ] RTL instance selection
- [ ] Build validation: `npm run build:netlify`.
- [ ] Update TECH_DECISIONS/DECISIONS doc with final chosen behavior where needed.

Acceptance criteria:
- [ ] Build passes and explorer behavior matches revised loading contract.

#### K. Ambiguities to resolve before coding

- [x] Confirm strict bootstrap gate:
   - [x] block until all module specs are fetched, OR
   - [ ] unblock after first module + sidebar metadata, then complete remaining module fetch in background
- [x] Confirm when Scalar-only loader should be custom vs Scalar-native on desktop.
- [x] Confirm whether endpoint row click should only select module or also deep-link to operation in Scalar.
- [x] Confirm expected narrow-screen endpoint visibility (selected-module endpoint list vs select-only).

#### K1. Decision Table (Approve Before Implementation)

Use this table to lock decisions before coding starts. `Recommended default` is aligned with current architecture constraints and expected UX.

| Topic | Option A | Option B | Recommended default | Chosen value |
|---|---|---|---|---|
| Instance bootstrap gate | Block until discovery + all module specs + endpoint summaries are loaded | Unblock after discovery + first selected module; continue loading remaining modules in background | Option A | [x] A  [ ] B |
| Desktop module-switch loader | Custom Scalar-area loader owned by Front Door | Rely only on Scalar native loading | Option A | [x] A  [ ] B |
| Narrow-screen module-switch loader | Always show Front Door loader | Prefer Scalar native loading; only add Front Door loader if Scalar feedback is insufficient | Option B | [ ] A  [x] B |
| Endpoint click behavior | Select module only | Select module and deep-link/open matching operation in Scalar | Option A | [ ] A  [x] B |
| Narrow-screen endpoint visibility | Show selected-module endpoint list beneath module select | Select-only UI (no endpoint list on narrow) | Option A | [x] A  [ ] B |
| Partial module failures during bootstrap | Fail whole instance bootstrap | Keep instance usable, mark failed modules unavailable with retry | Option B | [ ] A  [x] B |
| Cache policy for instance bootstrap payload | No cache | In-memory per-instance cache with TTL and explicit refresh path | Option B | [ ] A  [x] B |
| Scalar readiness signal | Heuristic timeout after config update | Event-driven readiness if available; deterministic fallback timeout if not | Option B | [ ] A  [x] B |

Implementation guard:
- [x] Do not begin implementation until each row has an explicit chosen value.

Default resolution rule:
- If no explicit choice is recorded, implement the recommended default and note that in the PR summary.

Definition of ready-to-implement:
- [x] All ambiguity items above are explicitly decided.

---

## Experiment 2 - OAuth 2.0 + PKCE

### Objective
Implement Wikimedia OAuth 2.0 with PKCE for the explorer while keeping token handling isolated from UI components and aligned with security boundaries.

### Scope
- Add login/logout flow for Wikimedia OAuth 2.0 Authorization Code + PKCE.
- Handle OAuth callback and code exchange through server-side endpoints.
- Store session state in Pinia through a dedicated auth composable.
- Inject authorization headers into explorer requests through composables, not components.
- Preserve client-only explorer behavior and current bootstrap/module flow.

### Out of Scope
- Cross-device session sync.
- Long-term refresh token rotation policy hardening beyond experiment goals.
- Final production UX polish for auth prompts.

### Implementation Steps
1. Add auth configuration in `config/`:
   - OAuth client id
   - authorization/token endpoints
   - redirect URI and scopes
2. Add server routes under `server/api/`:
   - auth start (PKCE verifier/challenge generation)
   - auth callback exchange
   - auth session clear/revoke helper (if available)
3. Add composables and store integration:
   - `useOAuthSession()` for auth state and actions
   - Pinia-backed session state for access token metadata
4. Integrate explorer auth usage:
   - route-level auth controls in `app/pages/explorer/index.vue`
   - request header injection in composables that perform API calls
5. Add banana-i18n strings for auth labels, errors, and status messages.
6. Add diagnostics events for auth lifecycle transitions.

### Verification Checklist
- [ ] OAuth start redirects to Wikimedia auth endpoint with PKCE challenge.
- [ ] OAuth callback exchanges code successfully and returns a usable session state.
- [ ] Explorer requests include auth headers only when authenticated.
- [ ] Logout clears local session state and stops header injection.
- [ ] Error states are visible for denied consent, expired code, and exchange failures.
- [ ] `npm run build:netlify` passes.

### Security Checklist
- [ ] PKCE verifier never appears in client logs.
- [ ] Tokens are not printed in diagnostics events.
- [ ] Callback route validates expected state and origin.
- [ ] No token parsing or crypto logic is implemented inside Vue components.

---

## Experiment 3 (Placeholder)

### Planned Focus
Content synchronization and locale fallback strategy for Markdown content.

### Planned Outputs
- Content source mapping
- Build-time pull/transform process
- Locale fallback behavior matrix
- UX notices for fallback content

---

## Change Management
- Keep this file updated whenever experiment scope or assumptions change.
- Record unresolved ambiguities before coding.
- Document accepted workarounds with clear triggers and rollback criteria.
