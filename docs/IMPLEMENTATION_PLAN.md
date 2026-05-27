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

---

## Experiment 2 (Placeholder)

### Planned Focus
OAuth 2.0 + PKCE integration and token usage in explorer flows.

### Planned Outputs
- Auth callback handling
- Token persistence model
- Explorer auth injection strategy
- Security and secret-boundary validation

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
