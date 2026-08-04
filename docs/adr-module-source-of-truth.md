# ADR: Module Source of Truth

**Status:** Implemented — `scripts/generate-module-source-of-truth.mjs` (phases 1 & 2), generated data under `config/generated/`, accessor `config/moduleSourceOfTruth.ts`
**Scope:** A generated, fleet-wide picture of the REST API modules Wikimedia exposes: which unique modules exist, which wiki instances each is present on, and the full OpenAPI spec of each module. Produced by a standalone, occasionally-run maintenance script and committed as reviewed data.

**Related:**
- `docs/adr-language-catalog.md` — the pattern this ADR mirrors (maintenance script → committed `*.generated.ts` → regen-and-diff; not a build step).
- `docs/adr-remote-content-fetching.md` — precedent for a standalone fetch script that tolerates per-item failure and never fails the build.
- `docs/TECH_DECISIONS.md` §"Discovery and spec resolution" — the runtime discovery flow this generator reuses at fleet scale.
- `app/composables/useDiscovery.ts` — the existing discovery-payload normalization the generator must share, not fork.

---

## Problem

The portal currently knows about modules **only at runtime, only for the six curated instances** in `config/instances.ts`. Each explorer session fetches `{baseUrl}/w/rest.php/specs/v0/discovery` for the selected instance and reads that instance's module list live. There is no persisted, fleet-wide answer to three questions:

1. **What is the complete set of unique REST API modules that exist across all Wikimedia wikis?** (Expected to be ~20.)
2. **For each module, which wiki instances actually expose it?**
3. **What does each module actually offer** — endpoints, parameters, request/response shapes, summaries, descriptions?

Several planned features need those answers as static, reviewable data rather than live fetches:

- A **module registry** (human- and machine-readable index of every module).
- **LLM entrypoints / instructions** — a stable manifest an assistant can read to know what modules and endpoints exist.
- **Search and sitemap discoverability** — enumerating modules and endpoints as indexable surfaces.

None of these can hang off a per-session, per-instance runtime fetch. They need a committed source of truth, regenerated occasionally and reviewed via git diff — exactly the model `docs/adr-language-catalog.md` established for the language list.

Two facts make this tractable:

1. **The `/discovery` endpoint already returns everything phase 1 needs** per instance: each module's `name`, `title`, `version`, and `specUrl`. `useDiscovery.ts` already normalizes the two payload shapes it comes in (a `modules` array, or an object keyed by module id).
2. **`action=sitematrix`** on any Wikimedia wiki enumerates the full fleet (~900 public wikis) with the base URL, dbname, language, direction, and state flags for each — the seed list for the sweep and the raw material for the instance registry.

---

## 1. Generated, not hand-maintained; not a build step

**Decision:** A single standalone script — `scripts/generate-module-source-of-truth.mjs` — fetches from Wikimedia APIs and writes committed generated files. It is a **maintenance tool**, run deliberately and reviewed via git diff:

```
npm run generate-module-source-of-truth
git diff config/*.generated.ts
```

**Rationale / consequences (mirroring the language catalog):**
- It is **not** wired into `build` / `generate`. Regenerating is a reviewed act, never part of deploy.
- Requests send a descriptive `User-Agent` per the [Wikimedia User-Agent policy](https://meta.wikimedia.org/wiki/User-Agent_policy), matching the constant style already used in `scripts/generate-language-catalog.mjs` and `server/api/discovery.get.ts`.
- Output files are **committed, not gitignored** — the git diff of a regen *is* the "has the fleet changed?" review workflow.

---

## 2. Seed the fleet from `sitematrix`, filtered to public + open

**Decision:** The instance universe is `action=sitematrix` on a stable wiki (default `https://meta.wikimedia.org/w/api.php`, overridable). From its response we take language-grouped `site[]` entries **and** the `specials[]` array, then **filter out** any wiki flagged `closed`, `private`, or `fishbowl`. Only public, open wikis are swept and recorded.

**Rationale:** sitematrix is the canonical fleet enumeration. Closed/private/fishbowl wikis either won't answer discovery or shouldn't appear in a public developer portal's source of truth. The filter *defines the universe*, so it is stated explicitly here and echoed in the script header.

**Consequence:** The set of wikis is itself a moving target (wikis open and close). The generated instance registry (§3) therefore carries a generation timestamp and count so drift is visible in the diff.

---

## 3. Three normalized generated files

**Decision:** The source of truth is **three** committed generated artifacts under a dedicated **`config/generated/`** subfolder, normalized so every fact is stored exactly once and each is independently consumable and searchable:

| Artifact | Keyed by | Holds | Produced by |
|---|---|---|---|
| `config/generated/wikiInstances.generated.ts` | instance `id` (the dbname) | fleet metadata: `displayName`, `baseUrl`, `dir`, `language`, `family` | sitematrix sweep |
| `config/generated/modules.generated.ts` | full discovery name (`site/v1`) | `base`, `version`, `title`, `specSourceInstance`, `specUrl`, `specFile` (pointer into the specs dir), `instances: string[]` (sorted instance ids) | phase 1 (discovery sweep) |
| `config/generated/module-specs/<name>.generated.json` | one file per module | the **full OpenAPI spec, verbatim** (paths, operations, params, request/response schemas, summaries, descriptions, `components`) | phase 2 (one spec per module) |

**Generated output lives under `config/generated/`.** A dedicated subfolder makes the manual-vs-generated boundary obvious at a glance and gives regenerated data one home. The `.generated` suffix is kept even inside the folder — redundant but cheap insurance: a file self-identifies in an import line, diff, or search result regardless of location, and tooling can glob `**/*.generated.*`. Existing generated files (`config/languages.generated.ts`) are **not** moved as part of this ADR; relocating them into `config/generated/` is a clean mechanical follow-up when desired.

**`modules.generated.ts` stores full, sorted lists of instance _ids_ — never embedded instance objects.** The ids are foreign keys into `wikiInstances.generated.ts`. A picker loads the instance registry; a module-registry / LLM / sitemap consumer loads the module file and joins on id only when it needs display metadata.

**The third artifact stores the full spec, not a distilled endpoint list.** A bare `method + path` list is too thin for the real consumers — an LLM manifest, endpoint search, and the registry all need summaries, parameters, and request/response shapes. Storing the full spec makes every projection (endpoint list, param docs, LLM manifest, search text, examples) **derivable later without re-sweeping**. It is stored as **JSON, one file per module** (not a `.ts` export): specs are large and deeply nested, so per-file JSON keeps regen diffs localized, is consumed directly by Scalar / any OpenAPI parser, and never bloats the module list. English-only specs are acceptable. Specs are stored **verbatim with `$ref`s unresolved** — that is the authoritative form; parsers resolve refs. Module names contain `/` (`site/v1`), so the filename uses a safe transform (`site-v1`).

**No precomputed endpoint index.** Consumers derive endpoint lists from the committed specs at build time. If a runtime consumer later needs a fast, small index, it can be generated *from the committed specs* — cheaply, with no re-sweep — and added then. We do not speculatively duplicate spec data now.

**Rationale:**
- **Normalization.** Embedding instance metadata inside every module would duplicate ~900 metadata objects across ~18 ubiquitous modules — tens of thousands of lines that churn whenever any wiki's sitename changes. Storing ids once, metadata once, kills that.
- **Separation of concerns and cadence.** The instance registry changes when the fleet changes; the module→instance map changes when deployments change; specs change when module code changes. The split keeps each diff meaningful and lets specs (phase 2) be regenerated independently of the expensive fleet sweep (§5).
- **Runtime is untouched.** The explorer keeps fetching the *live* spec from discovery's `specUrl`; the committed spec is a reviewed snapshot for offline consumers, not a runtime dependency. Same philosophy as the language catalog.
- Consistent with the existing generated-data-vs-policy split (`languages.generated.ts` = data; `languages.ts` = curated policy). See §10.

**Costs named honestly:**
- Because instance lists are stored in full (a deliberate decision — the compact "ubiquity + exceptions" alternative was rejected for literalness/searchability), a ubiquitous module carries a ~900-id array; `modules.generated.ts` will be large. Normalization to ids minimizes this; "present-on-N + exceptions" is the documented fallback if it proves unwieldy (see Open questions).
- The committed specs are a few MB of JSON and a **snapshot that drifts from live**. Mitigated by per-module files + pretty-printing with **stable key ordering** so diffs are semantic, not reshuffles; the drift is the point — the diff is the review.

---

## 4. Module identity is the full discovery name

**Decision:** Modules are keyed by the **full, versioned discovery name exactly as `/discovery` reports it** — `site/v1`, `readinglists/v0`, `attribution/v0-beta`. `base` (`site`) and `version` (`v1`) are stored as **derived** fields for grouping, not used as the key.

**Rationale:** The versioned name is the identity the explorer, spec URLs, and beta/internal opt-in rules already use (`config/explorerOptIn.ts` matches on `attribution/`; `config/explorerModuleDescriptions.ts` keys on `site/v1`). Keying by base name would collapse `v0` / `v1` / `v0-beta` — distinctions that map to different specs and different endpoints. A base grouping is cheap to derive; the reverse is lossy.

**Root module (empty id).** Discovery reports one module — "REST endpoints not associated with a module" (title *MediaWiki REST API*) — with an **empty** `moduleId`. An empty key is fragile and yields an empty spec filename, so the generator adopts the identifier Wikimedia itself uses for it: its spec path is `/module/-`, so it is keyed `-`. This is done in the generator, not the shared `normalizeDiscoveryModules` helper, to avoid changing the runtime explorer's handling of that entry.

---

## 5. Two-phase pipeline, one script, phases independently runnable

**Decision:** One script, two phases:

- **Phase 1 — fleet sweep (expensive, ~900 requests).** For every in-scope instance, fetch `/discovery`, normalize modules (§7), and invert into the module→instances map. Writes `wikiInstances.generated.ts` and `modules.generated.ts`.
- **Phase 2 — spec capture (cheap, ~20 requests).** For each unique module, pick one **representative instance** (§8), fetch its full OpenAPI spec, and write it verbatim to `config/generated/module-specs/<name>.generated.json`.

The two phases are **independently runnable via flags** so refreshing specs never requires re-sweeping the fleet:
- default: run both;
- `--skip-specs`: phase 1 only;
- `--specs-only`: phase 2 only, reading the existing `modules.generated.ts`.

**Rationale:** Phase 2 costs ~20 spec fetches; phase 1 costs ~900 discovery fetches. Decoupling the run — while keeping one script — gives the "refresh specs independently" benefit without a runtime dependency between the artifacts.

---

## 6. Correctness: absent ≠ failed

**Decision:** A discovery fetch that **fails** (timeout, 5xx, network error, wiki without the endpoint) must **never** be recorded as "this instance has no modules." Failure and absence are distinct:

- Failed instances are collected into a **failure set**, retried with backoff (§7), and any still-unresolved ones are recorded in an output **metadata block** rather than silently dropping out of every module's instance list.
- Only a *successful* discovery response that omits a module counts as that module being absent from that instance.

Each generated file carries a metadata header: generation timestamp, source API, counts (instances swept / succeeded / failed, unique modules found), and the list of unresolved failed instances.

**Rationale:** Conflating failure with absence corrupts the source of truth with false negatives — a transient timeout would silently erase a module from a wiki. At ~900 requests, transient failures are guaranteed, so this distinction is the single biggest correctness requirement. (Timestamps are fine here — this is a plain Node script, unlike Workflow scripts where `Date.now()` is unavailable.)

---

## 7. Politeness and throughput

**Decision:** The sweep is a good API citizen:
- Descriptive `User-Agent` on every request (§1).
- **Bounded concurrency** — a small worker pool (default 4, `MODULE_SOT_CONCURRENCY` override), never a ~900-way `Promise.all` flood.
- **Retry with backoff** for transient failures before an instance lands in the unresolved failure set.
- Reuses `useDiscovery.ts`'s two-shape normalization rather than forking a second parser (extract the pure normalization function so both the composable and the script import it).

---

## 8. Deterministic output and representative-instance selection

**Decision — determinism:** Everything is serialized deterministically — modules by name, instance-id lists ascending, instance registry by id, and each committed OpenAPI spec written with **stable key ordering** (recursively sorted keys) so a regen diff reflects real spec changes, not JSON reshuffling.

**Rationale:** Non-deterministic ordering across ~900 async responses is the default, and it makes the committed diff — the entire review mechanism — worthless. Sorting is mandatory, not cosmetic.

**Decision — representative instance (phase 2):** For each module, the spec is fetched from a single instance chosen by a **deterministic preference order** (e.g. `mediawiki` → `enwiki` → `commonswiki` → first-sorted id that has the module). The chosen id is recorded as `specSourceInstance` on the module entry in `modules.generated.ts`.

**Assumption stated explicitly:** a module's endpoints are treated as **identical across every instance that shares that module identity** (same versioned name ⇒ same code ⇒ same spec). This is why one representative fetch suffices. If this proves false for any module, that is a finding to record, not silently average away (see Open questions).

---

## 9. Configurability balance

**Decision:** Mirror `generate-language-catalog.mjs` exactly — **in-file constants** for stable values (endpoint paths, User-Agent, concurrency default, representative-instance preference order, output paths), plus a **handful of env overrides** for what one would actually vary:

| Env var | Purpose |
|---|---|
| `SITEMATRIX_API` | override the fleet-enumeration wiki (default meta) |
| `MODULE_SOT_CONCURRENCY` | worker-pool size for the sweep |
| `MODULE_SOT_LIMIT` | cap instances swept — for fast local testing against a few wikis |

No config-file-driven abstraction, no plugin layer. One legible `.mjs` of named functions. The sibling script proves this is enough; anything more would trade legibility for flexibility we don't need.

---

## 10. Relationship to `config/instances.ts`

**Decision:** The generated fleet registry does **not** replace or merge into `config/instances.ts`. `instances.ts` remains the **hand-curated** list of the instances the explorer chooses to surface (policy). `wikiInstances.generated.ts` is generated fleet **data**. A future change may let the curated list reference or subset the generated fleet, but they stay distinct artifacts — the same generated-data-vs-curated-policy split as `languages.generated.ts` vs `languages.ts`.

---

## 11. The discovery parser is shared and isomorphic; the source of truth is not

**The distinction that governs the parser.** Discovery normalization (`normalizeDiscoveryModules`) and the committed source of truth are *different things* and must not be conflated:

- **The parser is a pure, isomorphic transformation** that runs live in three environments: the browser/SSR (the client `useDiscovery` composable), the Nitro server on **every wiki-instance/language switch** (`server/api/explorer-bootstrap.get.ts` re-fetches that instance's live `/discovery` on each change), and plain Node (the offline generator). It is on a hot, per-switch path — not backend-only.
- **The source of truth is a committed, offline snapshot.** The explorer never consults it on an instance switch; it always reloads live from the selected instance's `/discovery`. The snapshot feeds static/reference consumers (module registry, LLM entrypoints, search/sitemap), not the live picker.

**Decision — share the transformation, never the data.** The live reload and the offline generation transform the *same* discovery payloads, so they must normalize **identically**, or the committed snapshot could disagree with what a live reload shows for the same instance (e.g. differing module identity). Therefore normalization is a single shared function; the two data paths (live fetch vs committed snapshot) stay completely separate. Sharing the parser is the correct unit of reuse; sharing the data would be wrong (it would serve stale snapshots on a switch).

**Constraint — the parser stays pure and isomorphic.** Because it runs in the browser, the server, and Node, `app/utils/normalizeDiscoveryModules.ts` must have **no I/O, no Node-only APIs, no heavy dependencies** (today: zero imports). All fetching and file writing happens *around* it, in the generator and the bootstrap route — never inside it.

**Resolution — one parser (implemented).** There were previously three normalizer variants: the shared util (`useDiscovery` + generator), a *richer* private copy in `server/api/explorer-bootstrap.get.ts` (with `resolveDiscoveryModuleName`, which derives a name from the spec URL when discovery's name is empty — the root "unassociated endpoints" module `/module/-` becomes `-`), and the generator's own `canonicalModuleName` reaching the same `-` a third way. The richer server logic is now promoted into the single shared `app/utils/normalizeDiscoveryModules.ts`; the server bootstrap imports it (≈140 duplicated lines removed), and the generator drops `canonicalModuleName`.

**Behavior preserved, verified.** A differential test ran the new shared parser, the old server normalizer, and the old generator path over live discovery from 15 diverse instances (including object- and array-shaped payloads and the root module): **byte-identical on all three, every instance.** So the bootstrap/instance-switch hot path is unchanged and the committed `config/generated/` data is unchanged (no regeneration needed). The one runtime delta is `useDiscovery`'s root-module name (`""` → `-`), which renders nowhere — its `useWikiModules` → `useSpecUrl` chain has no consumers.

---

## Corrections to existing documentation

| Document | Section | Required update |
|---|---|---|
| `AGENTS.md` | Rule 6 (all configuration in `config/`) | Note the dedicated `config/generated/` subfolder for regenerated data, holding the new artifacts (`wikiInstances.generated.ts`, `modules.generated.ts`, `module-specs/*.generated.json`) produced by `generate-module-source-of-truth`, alongside the existing `config/languages.generated.ts` precedent (not yet moved). |
| `ARCHITECTURE.md` | "API explorer architecture" / directory structure | Note the fleet-wide module source of truth as generated data distinct from runtime discovery, and from the curated `config/instances.ts`. |
| `docs/TECH_DECISIONS.md` | "Discovery and spec resolution" / "Wiki instances" | Note that the same discovery flow is run fleet-wide, offline, by the generator to produce the committed source of truth; runtime discovery is unchanged. |
| `package.json` | `scripts` | Add `"generate-module-source-of-truth": "node scripts/generate-module-source-of-truth.mjs"`. |

---

## Implementation steps

### Step 1 — Shared normalization (non-breaking refactor)
Extract the pure discovery-module normalization from `app/composables/useDiscovery.ts` into an importable helper (`app/utils/normalizeDiscoveryModules.ts`) so the composable and the generator share one parser for both payload shapes. *All three consumers — the composable, the generator, and the `explorer-bootstrap` server route — now share this one parser (§11).*

### Step 2 — Phase 1: fleet sweep
1. Fetch + filter sitematrix (§2) → instance list; write `wikiInstances.generated.ts`.
2. Bounded-concurrency sweep of `/discovery` (§7), with failure set + retry/backoff (§6).
3. Invert to module→instance-id map, keyed by full discovery name (§4), full sorted id lists (§3).
4. Write `modules.generated.ts` with metadata block; sort deterministically (§8).

### Step 3 — Phase 2: spec capture
1. For each module pick the representative instance (§8), fetch its full OpenAPI spec.
2. Write it verbatim (`$ref`s unresolved, keys recursively sorted) to `config/generated/module-specs/<safe-name>.generated.json`; record `specSourceInstance` / `specFile` on the module entry.

### Step 4 — Wire-up + docs
Add the npm script; apply the documentation corrections above; document the regen-and-diff workflow in the script header.

---

## Results (first full run, 2026-07-20)

The premise held: **841** public/open instances swept, **840** succeeded, **1** failed (`sourceswiki` / wikisource.org — its discovery endpoint hangs; `curl` also gets no response). **10** unique modules found, with genuinely differentiated coverage — core modules on ~840 wikis, but `growthexperiments/v0` on 352, `wikifunctions/v0` on 163, `wikibase/v1` on just 4. `modules.generated.ts` is ~108K; the 10 committed specs total ~600K (largest: the root `-` module at 221K, 44 paths). The one failure is recorded in metadata, never as module-absence — the §6 correctness property, observed working.

## Open questions / risks

- **`modules.generated.ts` size — settled for now.** ~108K / ~6.5K lines with full id lists; large but reviewable. The "present-on-N + exceptions" representation remains the documented fallback if it grows unwieldy as the fleet does.
- **Discovery availability — measured.** 840/841 expose `/w/rest.php/specs/v0/discovery`; the lone failure is an unresponsive endpoint (not a 404). The failure set (§6) handled it correctly. No wiki returned 404 in the first run.
- **Spec-identical-across-instances assumption (§8).** If any module's spec genuinely differs between instances that share its versioned name, the single representative fetch is wrong for those instances. Consider a cheap validation pass (sample a second instance and diff) before trusting it broadly. *Not yet validated.*
- **Committed spec size — measured.** ~600K across 10 files; comfortable. Revisit only if the module count or spec sizes grow substantially.
- **Derived index, deferred not rejected.** Consumers parse the committed specs for endpoint data. If a runtime consumer (e.g. portal search) needs a fast small index, generate it *from the committed specs* then — no re-sweep needed. Not built speculatively now.
- **Beta / internal operations.** Specs are stored verbatim, so beta/internal operations are captured as-is; visibility gating stays a consumer concern (the explorer already handles it via `config/explorerOptIn.ts`). No filtering at generation time.
- **Regeneration cadence and drift.** No automation is proposed; regen is manual. If the fleet or module set drifts faster than manual regens, consider a scheduled job that opens a diff for review (out of scope here).
- **Cross-file joins for consumers.** *Done:* `config/moduleSourceOfTruth.ts` provides `getWikiInstanceById`, `getModuleByName`, `getModuleInstances` (the FK join), and `getModulesForInstance`. Spec JSON is loaded by consumers directly (load strategy differs between build-time and runtime), so no spec accessor is provided yet.
- **sitematrix vs siteinfo enrichment.** sitematrix gives base URL, dbname, language, dir, sitename. If pickers need more (e.g. per-wiki logo, project family), a second enrichment call per instance may be needed — deferred until a consumer requires it.
