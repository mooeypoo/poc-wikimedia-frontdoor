# ADR: Explorer Deep-Linking and Endpoint Search

**Status:** PR 1 (deep-linking) implemented; PR 2 (endpoint search) pending. Deferred within PR 1: cross-module Back/Forward re-focus, and scroll-spy hash updates (both need follow-up; see Open questions). The transient non-curated-instance picker option (§5) is implemented.
**Scope:** A shareable, bidirectional URL scheme for the community API Explorer — path-based deep-links that carry the selected wiki instance, module, and operation, and that update live as the user drives the SPA — plus a keyword search over API endpoints that resolves each result to one of those deep-links. Delivered as **two pull requests**: PR 1 (deep-linking) and PR 2 (endpoint search), which depends on PR 1's URL scheme.

**Related:**
- `docs/adr-module-source-of-truth.md` — supplies the module→instance resolution (`specSourceInstance`) and the per-module OpenAPI specs (`config/generated/module-specs/*.generated.json`) that the quick-link resolver and the search index consume. Its §"Derived index, deferred not rejected" anticipated exactly this endpoint index.
- `app/composables/useExplorerScalarFocus.ts` / `app/utils/scalarOperationNavigation.ts` — the existing **imperative** scroll-to-operation engine (`eventBus.emit('scroll-to:nav-item', …)`) that deep-linking reuses rather than replacing.
- `app/utils/explorerRoute.ts` — the path↔mode parser this ADR extends from a single optional segment to a catch-all grammar.
- `app/composables/useExplorerBootstrap.ts` / `server/api/explorer-bootstrap.get.ts` — the live discovery + module-selection state that the URL now hydrates from and writes back to.
- `config/instances.ts` — the curated instance list, extended here to reconcile one id and to accept fleet-resolved instances.

---

## Problem

The community Explorer holds all of its meaningful state **in memory, invisible to the URL**: `selectedWikiInstanceId` (`useState`), `selectedModuleName` and `pendingOperationTarget` (refs in `useExplorerBootstrap`). Only the coarse *mode* (`community` / `enterprise-full` / `enterprise-custom`) is encoded, as a path segment in `app/pages/explorer/[[view]].vue`. Consequences:

1. **Nothing is shareable.** A user who has navigated to a specific operation on a specific wiki cannot send that view to anyone; the link resolves to the default Explorer.
2. **No entry point for search.** We want keyword search to surface individual API endpoints and, on click, drop the user *directly* onto that operation in the Explorer. With no addressable URL for "instance + module + operation," there is nothing for a search result to link to.

We also already have, unused at runtime, exactly the data a resolver needs: the module source of truth (`config/moduleSourceOfTruth.ts`) maps every module to the instances that expose it and to a deterministic representative instance, and stores each module's full spec — the raw material for both a module→instance default and an endpoint index.

Two facts shape the design:

- **The Explorer does not use Scalar's native hash routing.** It disables Scalar's sidebar and scrolls imperatively via `useExplorerScalarFocus`, because Scalar's own hash handling is unreliable (e.g. [scalar#5514](https://github.com/scalar/scalar/issues/5514), where scrolling drops the hash). The URL hash on the Explorer route is therefore **free and unused** — we can own it outright.
- **The live Explorer only knows the six curated instances** in `config/instances.ts`, and `/api/explorer-bootstrap` resolves `baseUrl` only from that list. A deep-link that names any other wiki (directly, or via a quick-link resolving to a non-curated `specSourceInstance`) cannot load until bootstrap can resolve `baseUrl` fleet-wide.

---

## 1. Path-based URL grammar, not query parameters

**Decision:** Deep-links are **path segments**, not query parameters. The operation stays in the **hash fragment**. `app/pages/explorer/[[view]].vue` (optional single segment, `:view?`) becomes a **catch-all** `app/pages/explorer/[...view].vue` (`:view(.*)*`), which still matches the bare `/explorer` and matches arbitrarily deep paths. The first segment after `/explorer/` is a reserved discriminator:

| URL | Meaning |
|---|---|
| `/explorer` | community, default instance (unchanged) |
| `/explorer/enterprise` | enterprise-full (unchanged) |
| `/explorer/enterprise-custom` | enterprise-custom (unchanged) |
| `/explorer/direct/<instance>/<module…>#<operation>` | **verbose** deep-link |
| `/explorer/q/<module…>#<operation>` | **quick** deep-link |

`<instance>` is a single segment (the dbname). `<module…>` is the **tail** — because discovery module names contain a slash and version (`site/v1`), they occupy the last one-or-more segments verbatim, with no encoding: `/explorer/direct/enwiki/site/v1`. Parsing is unambiguous: after `direct/<instance>/`, join the remaining segments as the module name; after `q/`, join everything. `direct` and `q` join `enterprise`/`enterprise-custom` as reserved first segments — no real family or module is named those.

**Rationale:**
- **No `%2F` encoding.** The query-param alternative (`?module=site%2Fv1`) forced percent-encoding of the module slash; path segments carry it naturally. This is the decisive advantage.
- **Reads as a resource path**, matching how API docs are expected to be linked, and mode is *already* a path segment — query params would have split the state across two mechanisms.

**Consequence:** `app/utils/explorerRoute.ts` (`explorerModeFromPath`, `pathForExplorerMode`, `isExplorerRoutePath`) is rewritten to parse and emit this richer grammar. The catch-all is covered by the existing `'/explorer/**': { ssr: false }` route rule. The page derives mode from the path, not a param value, so no downstream consumer breaks.

---

## 2. Own the hash; do not enable Scalar's native routing

**Decision:** The Explorer continues to **not** use Scalar's `pathRouting` / hash routing. We parse the operation from `window.location.hash` on load, set `pendingOperationTarget`, and let the existing `useExplorerScalarFocus` engine scroll. We write the hash ourselves on operation change.

**Rationale:** Two systems writing `window.location.hash` fight each other, and Scalar's is the buggy one ([scalar#5514](https://github.com/scalar/scalar/issues/5514)). Owning the hash also means **our anchor format is independent of Scalar's `generateOperationSlug`** — we never have to match Scalar's slug, because we translate our anchor to Scalar's internal nav id at runtime (§8), not the reverse.

**Interaction with the internal-sidebar experiment.** The above holds only when Scalar's own sidebar is off (the manual `ExplorerModuleRail`). When `EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR` is enabled — the current build — Scalar's sidebar **and its native hash routing are active**, and Scalar owns the operation hash in its own `#{METHOD}{path}` format: it scrolls to and selects the operation from the hash on load. So deep-linking is **mode-aware**: with the sidebar on it owns only the **path** (instance + module), does not read an operation anchor into the intent, and must never write or strip the operation hash — it preserves Scalar's hash while the path is unchanged and clears it only when the module/instance changes (`useExplorerDeepLink` / `useExplorerDeepLinkSync` gate on the flag). Our own slug-format hash and imperative `useExplorerScalarFocus` engine apply only in the sidebar-off (module-rail) mode. Whichever mode is active, the URL reflects state — path from us, operation hash from whichever component owns it.

---

## 3. Instance identity in the URL is the dbname; reconcile the curated outlier

**Decision:** The `<instance>` segment is the wiki **dbname** (`enwiki`, `commonswiki`, `wikidatawiki`), matching the generated fleet registry and real Wikimedia ids. The curated list in `config/instances.ts` currently uses the non-standard id `wikidata`; it is **renamed to `wikidatawiki`** so the id space is consistent everywhere (URL, curated list, fleet registry, source of truth).

**Rationale:** An earlier proposal used `<lang>/<family>` for friendlier URLs, but the sitematrix family code for Wikipedia is `wiki` (not `wikipedia`), so the friendly form needed an alias table and read oddly for specials (`en/commons`). The dbname is the single canonical, directly reversible identifier with no mapping layer. Consistency requires eliminating the lone `wikidata`/`wikidatawiki` discrepancy.

**Consequence:** Audit for hardcoded `'wikidata'` references before renaming (the `selectedWikiInstanceId` default is `WIKI_INSTANCES[0]` = `enwiki`, so the default is unaffected).

---

## 4. Fleet-wide `baseUrl` resolution for non-curated instances

**Decision:** Instance resolution in `server/api/explorer-bootstrap.get.ts` (and any client mirror) resolves `baseUrl` in two tiers: **curated first** (`config/instances.ts`, which carries UI policy — `dir`, `language`, display), then **fleet fallback** (`getWikiInstanceById` from `config/moduleSourceOfTruth.ts`, over `config/generated/wikiInstances.generated.ts`). Any public, open wiki in the fleet becomes loadable.

**Rationale:** Both a verbose `/direct/frwiktionary/…` link and a quick link resolving to a non-curated `specSourceInstance` name wikis outside the curated six. Without fleet fallback, most deep-links cannot load — this is a hard requirement of the scheme, not an option. The two `getWikiInstanceById` functions (curated vs. generated) are distinct; the resolver tries curated, then generated.

---

## 5. Transient switcher option for a deep-linked non-curated instance

**Decision:** When a deep-link loads an instance not in the curated `WIKI_INSTANCES`, the instance switcher (`ExplorerProjectControls`) **injects that instance as a transient, selected option**, built from the fleet registry entry (which carries `id`, `displayName`, `baseUrl`, `dir`, `language`). It is not persisted into the curated list.

**Rationale:** Otherwise the switcher cannot represent the current selection and would silently misreport state. Injecting a transient option is the minimal fix; a full fleet-backed instance picker is deliberately **out of scope** here and left as separate UX work.

---

## 6. Quick links resolve, then canonicalize to the verbose form

**Decision:** A `/q/<module…>` link is always translated by the system into concrete state and then **rewritten** (via `router.replace`) to the full `/direct/<instance>/<module…>` URL, where `<instance>` is the module's resolved default — `getModuleByName(name).specSourceInstance` from the source of truth. `/q/` is an *input* shorthand; the address bar always ends up showing the unambiguous verbose form.

**Rationale:** Quick links are convenient to author but ambiguous to share (the resolved instance is implicit and could change as the fleet evolves). Canonicalizing on load makes every shared/copied URL explicit and stable. `replace` (not `push`) ensures Back does not return to the transient `/q/` URL.

---

## 7. Bidirectional URL ↔ state sync; logical history

**Decision:** State and URL are kept in sync in both directions:
- **On load:** parse the path (instance, module) and hash (operation) → set `selectedWikiInstanceId`, `selectedModuleName`, `pendingOperationTarget` **before/at bootstrap**, so the existing loading overlay (`isScalarSwitching`) shows immediately and the focus engine scrolls once Scalar is ready.
- **On change:** picking a new instance from the dropdown, switching modules, or selecting an endpoint writes the URL. A "programmatic set in progress" guard prevents the load→write→load feedback loop.

**History semantics** are chosen so users can backtrack through operations:
- **Endpoint selection → `router.push`** (Back returns to the previously viewed operation).
- **Instance or module change → `router.replace`** (these reset the operation; they should not litter history), as does the `/q/`→`/direct/` canonicalization (§6).

**Granularity:** URL updates are **click-/selection-driven**, not scroll-driven. The hash updates when an operation is explicitly selected; the path updates when the instance or module changes. Scroll-spy (updating the hash as the user scrolls through operations) is **deferred** — it is materially more work and Scalar's own scroll/hash coupling is the buggy path we are avoiding.

---

## 8. Operation anchor format

**Decision:** The operation anchor is a stable, URL-safe slug derived from the operation's **HTTP method and path** — `operationId` is not always present, method+path always is. Working format: `{method}_{path}` with `/` and `{}`/other unsafe characters normalized (e.g. `GET /v1/page/{title}` → `#get_v1_page__title_`). At runtime the anchor is translated to Scalar's internal nav id (`{document}/tag/{tag}/{METHOD}{path}`) by the existing `app/utils/scalarOperationNavigation.ts`, which resolves the tag from the loaded spec/sidebar — so the anchor itself carries no Scalar-specific detail.

**Rationale:** Because we own the hash (§2), the anchor need only be **reversible to (method, path)** and stable across regenerations; it does not need to match Scalar's slugging. The same normalization is used to compute `deepLink` for search records (§10), guaranteeing PR 1 and PR 2 agree byte-for-byte. The exact character-normalization table is finalized in implementation and covered by a round-trip test.

---

## 9. Graceful fallback for invalid or mismatched links

**Decision:** Malformed or stale deep-links degrade rather than error, always with a `CdxMessage` telling the user what fallback occurred:

| Situation | Behavior |
|---|---|
| Module not present on the requested instance's live discovery | Load the requested instance with **its default module** (the one a fresh load selects); drop the operation; show a `CdxMessage`. |
| Instance unknown / unresolvable (not curated, not in fleet) | Load the **default system state** (`enwiki`, default module); show a `CdxMessage`. |
| Operation anchor not found in the loaded spec | Load the module with no operation focused; the focus engine already tolerates a missing target (it retries then gives up). |
| Quick link successfully expanded to the `direct` form (§6) | Not an error, but the URL changed under the user; show an informational `CdxMessage` ("this shortcut link was expanded to its full address"). |

**Notices must survive the URL rewrite.** Every case above **adjusts the URL** (`router.replace`), which can remount the explorer page and tear down component-local state. The notice is therefore held in an **app-scoped `useState` channel** (`useExplorerDeepLinkNotice`), set immediately before the URL changes and read by whichever page instance renders next — so it survives a remount (and resets on a full document load / on leaving the explorer). It is written by the deep-link composables (instance-fallback, quick-unresolved, quick-canonicalized) and the bootstrap (module-fallback, operation-missing), cleared on user dismiss and on a user-initiated module selection. As a complementary optimization, `app/app.vue` keys `NuxtPage` on the explorer **mode path** (not the full path) so in-explorer URL updates avoid the remount/flash entirely (Scalar still remounts via `scalarReferenceKey`; mode switches and leaving the explorer still remount). See §7.

**Rationale:** Deep-links are hand-editable and outlive deployments; a mismatched instance+module or a removed endpoint must never blank the page. This mirrors the existing "unknown trailing segment → community" tolerance already in `explorerModeFromPath`. The team asked that **any** URL adjustment — fallback or quick→direct expansion — be surfaced to the user, since the address bar changing without explanation is confusing.

---

## 10. Endpoint search is a generated index over the committed specs (PR 2)

**Decision:** Endpoint search does **not** hand-maintain an endpoint→keyword mapping. A generator derives an **endpoint index from `config/generated/module-specs/*.generated.json`** — one record per operation:

```
{ module, instance: specSourceInstance, method, path, summary, description, tags[], deepLink }
```

where `deepLink` is the §1/§6/§8 URL for that operation. **The index regenerates as part of the same `npm run generate-module-source-of-truth` workflow** (or an equivalent step chained to it), so it can never drift from the specs it is derived from. Optional hand-authored keywords may layer on top later without changing the pipeline.

Endpoints are **not** markdown, so they do not enter the Nuxt Content FTS5 `content` collection. Instead a small client-side index (MiniSearch or Fuse.js) is searched **in parallel** with the existing content search inside `app/composables/useContentSearch.ts`, and rendered as a distinct **"API endpoints"** group in `app/components/shared/SearchResults.vue`, each result a `NuxtLink` to its `deepLink`. This keeps endpoint ranking and English-only endpoint text separate from the locale-partitioned content search. Scale is tiny (10 modules, a few hundred operations), so the index can even be prebuilt to JSON at build time.

**Rationale:** The source-of-truth ADR (§"Derived index, deferred not rejected") explicitly deferred this index to "generate from the committed specs when a consumer needs it." This is that consumer. Generating from the specs — rather than a manual list — is the only option that stays correct as modules change, provided regeneration is wired to the same script (the stated acceptance condition).

---

## 11. Scope boundaries

**Decision:** This ADR covers the **community** Explorer only. `/explorer/enterprise` and `/explorer/enterprise-custom` are **untouched** — they remain reserved first segments with today's behavior (a single static spec, no instance/module/operation to address). Operation-level deep-linking within enterprise is out of scope.

**Rationale:** Enterprise has no instance/module selection to encode; adding operation-level deep-linking there is independent work with its own spec source. Keeping PR 1 community-only bounds the change.

---

## Corrections to existing documentation

| Document | Required update |
|---|---|
| `ARCHITECTURE.md` — "API explorer architecture" | Document the deep-link URL grammar (`/explorer/direct/…`, `/explorer/q/…`), the URL↔state sync, and fleet-wide instance resolution as distinct from the curated list. |
| `docs/TECH_DECISIONS.md` — "Wiki instances" / "Discovery and spec resolution" | Note that bootstrap now resolves `baseUrl` fleet-wide (curated → generated fallback), and that the curated `wikidata` id is renamed `wikidatawiki`. |
| `config/instances.ts` | Reflect the `wikidata` → `wikidatawiki` rename. |
| `package.json` — `scripts` | (PR 2) Ensure the endpoint-index generation runs within/after `generate-module-source-of-truth`. |

---

## Implementation steps — PR 1 (deep-linking)

### Step 1 — Routing grammar
1. Rename `app/pages/explorer/[[view]].vue` → `app/pages/explorer/[...view].vue` (catch-all); verify `/explorer`, `/explorer/enterprise`, `/explorer/enterprise-custom` still resolve.
2. Rewrite `app/utils/explorerRoute.ts` to parse `direct` / `q` (plus existing modes) and to build `/direct/<instance>/<module…>` paths. Add pure parse/serialize helpers with unit tests (round-trip: state → path → state).

### Step 2 — Instance id reconciliation (§3)
1. Rename curated `wikidata` → `wikidatawiki` in `config/instances.ts`; audit and update any hardcoded references.

### Step 3 — Fleet-wide instance resolution (§4)
1. In `server/api/explorer-bootstrap.get.ts`, resolve `baseUrl` curated-first, then via `config/moduleSourceOfTruth.ts` `getWikiInstanceById`.
2. Mirror the same resolution wherever the client needs instance metadata (display name, dir).

### Step 4 — URL → state on load (§7, §6, §8)
1. On Explorer mount, parse instance + module (path) and operation (hash).
2. Resolve `/q/`: look up `specSourceInstance`; `router.replace` to the `/direct/` form.
3. Set `selectedWikiInstanceId`, `selectedModuleName`, `pendingOperationTarget` before bootstrap; ensure the loading overlay shows on cold load.
4. Translate the operation anchor → Scalar nav id via `scalarOperationNavigation`; reuse `useExplorerScalarFocus` to scroll.

### Step 5 — State → URL on change (§7)
1. Watchers write the URL: `push` on endpoint selection, `replace` on instance/module change; clear the operation hash on instance/module change (§11 of decisions / open-question 11).
2. Add a re-entrancy guard so URL-driven sets do not trigger URL writes.
3. Inject a transient selected option into `ExplorerProjectControls` for non-curated instances (§5).

### Step 6 — Fallbacks (§9)
1. Module-not-on-instance → default module + `CdxMessage`.
2. Unknown instance → default system + `CdxMessage`.
3. Missing operation anchor → module with no focus (already tolerated).

### Step 7 — Docs
Apply the documentation corrections above (excluding the PR-2 `package.json` row).

---

## PR 2 outline — endpoint search (depends on PR 1)

1. Generator emits the endpoint index from `config/generated/module-specs/*.generated.json`, wired into `generate-module-source-of-truth` (so it regenerates with the specs — the acceptance condition of §10). `deepLink` uses PR 1's canonical URL + anchor.
2. Client MiniSearch/Fuse index over the endpoint records; searched in parallel with the content FTS inside `app/composables/useContentSearch.ts`.
3. "API endpoints" result group in `app/components/shared/SearchResults.vue`, each a `NuxtLink` to its `deepLink`.
4. Tests: index generation from a fixture spec, search relevance, and click-through URL correctness.

---

## Open questions / risks

- **Operation-anchor normalization table.** The exact character mapping (`/`, `{`, `}`, casing) is finalized in Step 1/Step 4 and pinned by a round-trip test. Independent of Scalar's slugging (§2/§8), so no external dependency.
- **Fleet-resolution trust.** A non-curated instance loaded via deep-link relies on live discovery answering for that wiki; the source-of-truth run showed 840/841 wikis answer discovery. A wiki that fails discovery falls through to §9's fallback.
- **Transient switcher option lifetime.** Whether the injected option persists for the session or only until the user picks a curated instance is an implementation detail; default is session-scoped and replaced on the next explicit selection.
- **Scroll-spy deferral.** If product later wants the hash to track free scrolling (not just clicks), that is a follow-up; it must be built independently of Scalar's buggy scroll/hash coupling.
- **Spec-identical-across-instances assumption (inherited).** A `/q/` link shows `specSourceInstance`'s spec; if a module's spec genuinely differs on the user's intended instance, a verbose `/direct/<instance>/…` link is the escape hatch. This is the same unvalidated assumption flagged in `docs/adr-module-source-of-truth.md` §8.
