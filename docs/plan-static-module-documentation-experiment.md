# Plan: Static Module Documentation Experiment

**Status:** Phases 0a and 1 complete. Phase 2 is next.

| Phase | State | Outcome |
|---|---|---|
| 0a prerender scale test | **Done** | Passed. 150 routes in 64 s; ~113 KB per route; near-constant per-route cost. Full numbers in ADR §7.1. |
| 0b IA spike | Not run | Scope reduced — the §12 audit already settled adoption. |
| 0c validate assumption | Not run | Still recommended; ~30 requests. |
| 1 anchor vocabulary | **Done** | Found and fixed a live collision bug affecting 4 shipped endpoints. |
| 2 crawler hygiene | **Done** | `noindex` (not `Disallow` — see ADR §10), exact 150-entry sitemap with `hreflang`, origin-safe fallback. |
| 3 tier 3 machine surfaces | Not started | — |
| 4 tier 1 pages | Partial | English pages render; index page and locale axis outstanding. |
| 5 measure | Not started | — |
| 6 tier 2 | Gated | — |
**Decisions:** [`adr-static-module-documentation.md`](adr-static-module-documentation.md) — section references below (§n) point there.
**Rationale for leadership:** [`proposal-static-module-documentation.md`](proposal-static-module-documentation.md)

This plan is ordered **riskiest-question-first**, not easiest-first. Phases 0–2 are cheap
and can invalidate the design; phases 3–5 are the experiment proper; phase 6 is gated on
evidence.

Every phase states its **deliverable**, its **verification**, and its **stop condition** —
what result would mean "do not continue as planned."

---

## Phase 0 — De-risk before building

Two spikes, independent, both throwaway. Neither ships.

### 0a. Prerender scale test (no new dependency)

The question "can we prerender hundreds of i18n'd catch-all routes at acceptable cost" is a
Nuxt question, not a library question. Answer it with a stub and no new dependency.

**Build:**
- `app/pages/reference/[...module].vue` rendering something trivial from one committed spec.
- `routeRules: { '/reference/**': { prerender: true } }` (§7).
- An explicit `nitro.prerender.routes` array, generated from `GENERATED_MODULES` × a
  synthetic locale list. Scale-test at ~150 routes (10 modules × 15 locales), then repeat
  locales to reach ~750 to model 50 modules.

**Measure and record:**
- Build wall-clock, absolute and per route.
- `dist/` bytes total; HTML and `_payload.json` bytes per route separately (§7 predicts
  payload roughly doubles output).
- Peak memory during prerender.
- Whether `@nuxtjs/i18n` `prefix_except_default` produces the expected paths for a catch-all,
  and whether the root module resolves at `/reference/general` via the §8 slug functions
  (identity `-` in data, `general` in the URL) — round-trip both directions.

**Verification:** `/reference/site/v1` and `/he/reference/site/v1` exist as real files in
`dist/`, and the existing content catch-all `app/pages/[...slug].vue` is not shadowed (§8) —
check an existing content page still resolves.

**Stop condition:** if 750 routes cost more than a few minutes of build time or more than
~100 MB of output, revisit §6's "tiers share routes" decision and consider a single
catalogue page per locale instead.

**Why first:** this produces the per-route cost number that every size estimate in the ADR
currently infers rather than measures.

### 0a — result: passed

Measured 2026-08-20 at 150 routes (10 modules × 15 locales). Full table in ADR §7.1;
headlines:

- **64 s** total build, 39.2 s of it prerendering; median 312 ms per route.
- **~113 KB per route** (109 KB HTML + 3.6 KB payload), gzipping to ~19 KB.
- Extrapolated: 750 routes ≈ 82 MB and ~3.3 min — **inside** the stop condition. 2,500
  routes ≈ 295 MB and ~11 min — outside it, so locale count is the dial (§5 already turns it).
- Per-route cost is near-**constant**: a 65-operation module is only 21% heavier than
  average, because ~100 KB of every page is shared shell.

Two findings the spike was not looking for, both recorded in ADR §7.1 and §2:

- Enabling prerender makes `@nuxtjs/i18n` emit all **575** registered locales' message
  bundles (4.6 MB, fixed cost).
- Four of ten modules declare **no operation summaries**, so the projection needed a
  description fallback; two modules have no prose at all.

The spike deliberately exceeded its brief: rather than a hollow stub it renders the real
tier-1 projection, so the measured bytes are representative. That code is kept.

**Sandbox note.** `nuxt build` fails on `EACCES` reading `~/.nuxtrc`; pointing `HOME` at an
empty scratch directory works around it. Serving `.output` is not possible (`EACCES` on
`listen`), so verification is by inspecting prerendered HTML in `.output/public/`.

### 0b. Information-architecture spike (`nuxt-openapi-docs-module`)

**Scope narrowed — the adoption question is already answered.** `nuxt-openapi-docs-module`
v5.3.2 is installed as a devDependency and was audited against §12's criteria directly in
`node_modules`. **All five hard criteria fail** (no `<bdi>` anywhere in its runtime; its own
19-locale catalogues; it owns routing via `extendPages()` with a `filename`-based scheme that
cannot express `site/v1`; a flat locale list with no fallback chains; its own stylesheet and
a second syntax highlighter). See §12 for the evidence table.

So this spike is **not** an evaluation. It is purely an information-architecture reference,
and its output is a document, not code.

**Do:** point it at `config/generated/module-specs/` and render two cases —
`wikibase/v1` (65 operations, the hard case) and `site/v1` (2 operations, the trivial case).

**Extract, and only this:**
- What sections a module page needs, in what order.
- How parameters, responses and examples are laid out at operation level.
- How a 65-operation page stays navigable — the concrete open problem from §2, where
  OpenAPI `tags` are unavailable for 8 of 10 modules.
- What the trivial 2-operation case should *not* inherit from the heavy layout.

**Deliverable:** a short findings note plus an agreed page skeleton for phase 4.

**Cleanup, required:** never add it to `modules` in `nuxt.config.ts` beyond the throwaway
branch, and remove the devDependency when the note is written. It must not reach `main`.

**Reversal condition:** none realistically. Reopening §12 would need all five failures to be
cheaply fixable, which the audit says they are not.

### 0c. Optional — validate the load-bearing assumption

~30 requests: for each module, fetch its spec from 2–3 additional instances and diff against
`specSourceInstance`. Confirms or refutes source-of-truth §8 (§1).

**Not a blocker.** But it is the cheapest possible check on the assumption the entire design
rests on, and a negative result changes the design fundamentally (spec-variant grouping
rather than one page per module).

---

## Phase 1 — Anchor vocabulary

**This must land before any URL is published.** Retrofitting anchors after they are shared
and indexed is the expensive failure mode this whole design is arranged to avoid (§4).

**Build:**
- A single `anchorFor({ method, path })` emitter, in shared code importable by the generator
  and by runtime consumers (same isomorphic-purity constraint as
  `app/utils/normalizeDiscoveryModules.ts` — no I/O, no Node-only APIs).
- Round-trip test: state → anchor → state, over every operation in every committed spec.
- **Injectivity assertion**: within-module anchor uniqueness, as a hard failure.
- A regression fixture pinning the four known-collision paths in `readinglists/v0`
  (`/lists`, `/lists/`, `/lists/{id}/entries`, `/lists/{id}/entries/`) with their expected
  distinct anchors, plus `GET /v1/page/{title}` → `get_v1_page__title_`.

**Verification:** run over all 179 committed operations — 0 collisions expected (§4).
Deliberately introduce `/lists/id/x` alongside `/lists/{id}/x` in a fixture and confirm the
assertion **fails**.

**Also:** migrate the Explorer's existing anchor construction to this shared emitter so
there is genuinely one vocabulary, not two that happen to agree (§4).

**Stop condition:** none — this phase is required regardless of which tiers ship.

---

## Phase 2 — Crawler hygiene

Independently valuable and shippable before any documentation exists. It removes a liability
that exists **today** (§10).

**Build:**
- `robots.txt`: `Disallow: /explorer/direct/`, `Disallow: /explorer/q/`.
- `noindex` on Explorer routes.
- Sitemap infrastructure (empty or content-only at this stage).

**Deferred to phase 4** (needs targets to point at): `rel=canonical` from Explorer views to
static pages; module pages in the sitemap; `hreflang` alternates.

**Verification:** `curl` each rule; confirm an Explorer deep-link serves `noindex`; confirm
`robots.txt` parses.

**Why now:** 6,374 empty-shell URLs are already valid, rising to ~32,000 (§10). Cost of
acting now is near zero; cost after indexing is high.

### 2 — result: done, and the original plan was wrong

Built and verified. The substantive change is that **`Disallow` turned out to be the wrong
tool**, and the plan (following ADR §10's first revision) had prescribed it alongside
`noindex` — a self-defeating combination, since a disallowed URL is never fetched and so its
`noindex` is never read. `Disallow` also cannot keep an externally-linked URL out of the
index, and these URLs exist to be shared externally. ADR §10 now records the full reasoning;
`config/seo.ts` carries it at the point of use, and a test asserts the two directive sets
never overlap.

Delivered: `config/seo.ts` (policy), `app/utils/seoDocuments.ts` (pure builders),
`server/routes/robots.txt.get.ts`, `server/routes/sitemap.xml.get.ts`, `routeRules` noindex
headers, 13 tests.

Verified against a real build:

- `robots.txt` prerendered, `Disallow: /api/`, `Sitemap:` line present when an origin is set.
- `sitemap.xml` well-formed (parsed), **150 entries, 16 alternates each** (15 locales +
  `x-default`), self-referential alternates present.
- All four `noindex` patterns — bare and locale-prefixed — present in the built route manifest.
- With no site origin configured: warning logged, sitemap **skipped**, `robots.txt` still
  valid without its `Sitemap:` line.

**Not verified:** that a live request to `/explorer/direct/…` actually carries the header. The
sandbox denies `listen`, so this was confirmed from the build manifest instead. Worth one
`curl` before relying on it.

**Deferred as planned:** prose content pages in the sitemap (needs a build-time content-collection
query; belongs with the tier-1 index page). **Dropped:** `rel=canonical` from Explorer views —
undeliverable on an `ssr: false` route and unnecessary, since an interactive tool is not a
duplicate of a reference page (ADR §10).

---

## Phase 3 — Tier 3: machine surfaces

Cheapest real deliverable, and the one that most directly addresses AI invisibility. The
specs already exist and are committed — this is mostly serving and projection.

**Build:**
- Committed specs served at stable URLs (`/reference/<module>/openapi.json` or similar).
- `llms.txt` — index of modules with descriptions and links.
- `llms-full.txt` — the whole prose corpus (measured ~295 KB at 50 modules, §2),
  operation anchors in phase-1 format so citations link correctly.
- Raw markdown served alongside each page's HTML (near-free once phase 4 generates markdown;
  until then, generate the projection directly).

**Verification:**
- `curl` each artifact; validate JSON parses and matches the committed spec byte-for-byte.
- Confirm every anchor in `llms-full.txt` resolves against phase 1's emitter.
- Confirm `llms-full.txt` size is within one order of magnitude of the 295 KB projection —
  if not, the §2 measurement was wrong somewhere.

**Stop condition:** none. This phase stands alone even if tiers 1 and 2 never ship.

---

## Phase 4 — Tier 1: catalogue pages, English first

**Build, in order:**

1. **Generator** — reads `config/generated/module-specs/*.generated.json` plus
   `GENERATED_MODULES`, emits per-module markdown into `content/en/reference/` with:
   - module title, description, and a **summarised** instance list (§1 — never 840 links;
     group by family with counts, name the narrow cases: `wikibase/v1` on 4,
     `wikifunctions/v0` on 163)
   - one heading per operation with an **explicit `id`** from phase 1 (§4)
   - method, path, one-line summary under each heading
   - its own ownership marker, disjoint from remote-import and banana-content (§11)
2. **Prebuild wiring** — materialise into `content/`, *not* committed (§11). Confirm
   generated files do not leak into git and that `content-i18n/`-style exclusions behave.
3. **Page** — `app/pages/reference/[...module].vue`, first-party, Codex-styled, all chrome
   strings via banana-i18n (Rule 1), all spec-sourced text in `<bdi>` (Rule 2), no logic in
   the component (Rule 5).
4. **Index page** — one per locale, linking every module. This is the internal-linking hub;
   pages reachable only via sitemap rank as orphans (§10).
5. **Prerender** — `routeRules` + generated `nitro.prerender.routes` (§7), using phase 0a's
   measured costs.
6. **Complete phase 2's deferred items** — canonicals, sitemap entries, `hreflang`.

**Then the locale axis** — blocked on MediaWiki's per-language spec endpoint (§3):

7. Overlay generator: fetch spec per (module, locale), diff against English, store only
   differing strings as JSON-Pointer → string (§3). Bounded concurrency and descriptive
   `User-Agent`, mirroring `generate-module-source-of-truth`.
8. Stale-pointer diagnostic (§3).
9. Coverage computation + publishable-locale allowlist and threshold in `config/` (§5).
10. Overlay resolution through `fallbackChain`, per string (§3).

**Verification:**
- Every committed module produces a page; operation count on the page matches the spec.
- Anchors resolve; a shared `#get_v1_page__title_` link scrolls correctly.
- `dist/` contains real HTML for every route (compare against phase 0a's numbers).
- Content DB growth recorded and **within the §9 budget of ≤ 10 MB**, with the tripwire
  failing the build at that figure — not at the platform limit.
- BiDi: render a page under an RTL locale and confirm spec text is isolated.
- Sitemap lists every generated route with correct `hreflang` alternates.
- Same-page hash navigation works from a search result on the same module page — the known
  bug that becomes the dominant case here (§9 open questions).

**Stop condition:** if the content DB or build output substantially exceeds phase 0a's
projections, pause the locale axis and reconsider §6.

---

## Phase 5 — Measure

The experiment's actual purpose. Nothing is built in this phase.

**Instrument and wait:**
- Search Console: indexed page count for `/reference/**`, impressions, queries, position.
- Analytics: referral traffic to module pages; on-site search queries and click-through.
- Crawler logs: which bots fetch `/reference/**`, `llms.txt`, `llms-full.txt`, and the raw
  specs. **This is the direct test of the AI-invisibility premise** (§ open questions) —
  and the only way to verify it from inside our own infrastructure.
- Spot-check: ask several AI assistants about Wikimedia REST modules; see whether our
  documentation is reflected.

**Success criteria (from the proposal):** pages indexed and appearing for module-name
queries; measurable referral traffic; AI assistants reflecting our docs; useful on-site
module-level search results.

**Decision point:** these results gate phase 6 (§13).

---

## Phase 6 — Tier 2: full prose (gated)

Only after phase 5 justifies it. By §6 this changes **no URLs and no anchors** — it adds
content beneath headings that already exist.

**Build:**
- Extend the generator to emit operation `description`, parameters (name, in, required,
  description) and responses (code, description) under each existing heading.
- Schema trees rendered on demand, not inlined (§2) — accepting that deferred content is
  invisible to crawlers.
- Confirm FTS section-granular indexing yields per-operation search results (§9).

**Verification:** URL and anchor diff against phase 4 output must be **empty**. Content DB
against the §9 tripwire. Per-operation search results returning correct anchors.

**Stop condition:** if a module page becomes unusably heavy, group by first path segment
(§2) — noting this is undesigned, and that OpenAPI `tags` are unavailable for 8 of 10
modules.

---

## Dependency summary

| Phase | Blocked by | External blocker |
|---|---|---|
| 0a prerender spike | — | — |
| 0b IA spike | — | library install + workspace permissions |
| 0c assumption check | — | network access to sample instances |
| 1 anchor vocabulary | — | — |
| 2 crawler hygiene | — | — |
| 3 tier 3 | 1 | — |
| 4 tier 1 (English) | 0a, 1 | — |
| 4 tier 1 (locales) | 4 English | **MediaWiki per-language spec endpoint** |
| 5 measure | 3, 4 | time; Search Console access |
| 6 tier 2 | 5 | — |

Phases 0a, 0b, 1 and 2 are all independent and can run concurrently.

---

## What would make us abandon this

Recorded up front so the experiment is falsifiable:

- **Phase 0a** shows prerendering hundreds of i18n'd catch-all routes is disproportionately
  expensive → fall back to a single catalogue page per locale, losing per-module ranking.
- **Phase 0c** shows module specs genuinely differ across instances → per-module static docs
  are misleading; the design needs spec-variant grouping (§1).
- **Phase 5** shows the pages do not get indexed despite being static → the premise is wrong
  and no amount of tier-2 depth fixes it. This is the finding the staging is designed to buy
  cheaply.
- **AI crawlers turn out to execute JavaScript** → the strongest argument for this work
  weakens considerably, though the SEO and performance arguments survive.
