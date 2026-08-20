# ADR: Static Module Documentation

**Status:** Partially implemented. Tiers 1 and 3 are the accepted experiment scope; tier 2 is designed here but deliberately gated on tier-1 evidence (§13).

| Decision | State |
|---|---|
| §4 anchor vocabulary | **Implemented** — `app/utils/explorerOperationAnchor.ts` + uniqueness assertion; fixed a live collision bug |
| §8 route shape and `general` slug | **Implemented** — `config/referenceRoutes.ts`, `app/pages/reference/[...module].vue` |
| §7 prerender via `routeRules` | **Implemented and measured** — see §7.1 |
| §2 prose-inline projection | **Implemented** — `server/api/reference/[...module].get.ts`, incl. the description fallback |
| §1 instance summarisation | **Implemented** — family histogram, never 840 links |
| §3 translation overlays | **Not started** — blocked on MediaWiki's per-language spec endpoint |
| §5 coverage-gated locales | **Placeholder** — `REFERENCE_EXPERIMENT_LOCALES` (15 locales) stands in until overlays exist |
| §9 search / content collection | **Not started** |
| §10 machine surfaces + crawler hygiene | **Not started** |
| §12 library spike (0b) | **Audit done** (all five criteria fail); IA spike not run |
**Scope:** Statically rendered, search-engine- and AI-indexable reference documentation for Wikimedia REST API modules, generated from the committed OpenAPI specs, one page per module per publishable locale, with per-operation anchors. Plus machine-readable surfaces (raw specs, `llms.txt`). The runtime API Explorer is unchanged and remains the interactive surface.

**Related:**
- `docs/adr-module-source-of-truth.md` — supplies the committed per-module specs (`config/generated/module-specs/*.generated.json`), the module→instance map, and the `specSourceInstance` selection this ADR consumes. Its §8 "spec identical across instances" assumption is load-bearing here (§1).
- `docs/adr-explorer-deep-linking.md` — §8 defines the operation anchor format this ADR adopts verbatim and promotes to a single shared vocabulary (§4); §10's deferred endpoint index becomes the tier-2 search escape hatch (§9).
- `docs/adr-multilingual-search.md` — §3 locale partitioning by path prefix and §5 "do not switch to `nuxt generate`" both constrain this design (§7, §9).
- `docs/adr-translatable-prose-content.md` — the English-source-plus-message-catalogue pattern that §3's translation overlays mirror; §8 ownership markers must stay disjoint (§11).
- `docs/adr-language-catalog.md` — the locale set and fallback chains overlay resolution walks (§3).
- `AGENTS.md` → Absolute rules 1 (banana-i18n only), 2 (BiDi isolation), 3 (`@scalar/nuxt` precedent), 4 (explorer is client-only), 6 (config in `config/`).

---

## Problem

The Explorer is client-only by Absolute Rule 4 (`routeRules: { '/explorer/**': { ssr: false } }`). Every explorer URL therefore serves an empty shell; content appears only after Vue boots, Scalar loads, and two sequential cross-origin fetches resolve (`/discovery`, then the module's `specUrl`). Three consequences:

1. **Unreliable search-engine indexing.** Googlebot renders JavaScript, but on a deferred second pass with a rendering budget. A heavy client app whose content arrives from another origin is close to the worst case for that path.
2. **Probable total invisibility to AI crawlers.** GPTBot, ClaudeBot, PerplexityBot and CCBot are, as far as we can establish, HTML fetchers that do not execute JavaScript. If so, our API reference is absent from AI-assistant corpora entirely. *(Verify periodically; crawler behaviour is a moving target.)*
3. **No ranking unit.** 10 modules and 179 operations resolve to effectively one address. `docs/adr-explorer-deep-linking.md` solved *addressability* (`/explorer/direct/enwiki/site/v1` is a real URL) but not *indexability*, because those routes are still `ssr: false`.

A sitemap does not solve any of this. A sitemap is a URL list; it cannot inject content into a response. Pointing a crawler at a client-only route tells it precisely where to find an empty page. Sitemaps are the discovery layer *on top of* content that only server-rendered or prerendered HTML can supply.

**Measured baseline** (from the committed specs, 10 modules):

| Metric | Value |
|---|---|
| Operations | 179 (mean 17.9/module; range 2 for `site/v1` → 65 for `wikibase/v1`) |
| English spec JSON | 590 KB |
| Translatable text within it | 98 KB (**17%**) |
| (instance, module) pairs | 6,374 across 840 instances |
| Modules using OpenAPI `tags` | 2 of 10 (only `campaignevents/v0` meaningfully) |

---

## 1. Module granularity; the instance dimension is dropped

**Decision:** Documentation is addressed by **module × locale**. There are no per-instance pages. Each module page states which instances expose it, derived from `GENERATED_MODULES[].instances`.

**Rationale — the cross product:**

| Addressing | Today | @ 50 modules × 50 locales |
|---|---|---|
| instance × module × locale | 6,374 × locales | ~1.6M — infeasible |
| module × operation × locale | 8,950 | ~45,000 — untenable |
| **module × locale** | 500 | **2,500** — unremarkable |

**Consequence — an accepted risk.** This rests on `docs/adr-module-source-of-truth.md` §8: a module's spec is identical on every instance sharing its versioned name. That is recorded there as *not yet validated*. Static per-module docs lean on it harder than the Explorer does — the Explorer always shows the live spec for the instance you picked, so divergence is invisible; a static page asserts the module's shape everywhere it appears. **We proceed on the assumption deliberately.** Validation is cheap (~30 requests: sample 2–3 instances per module and diff) and is recommended, not required, before shipping.

**Consequence — instance display needs summarisation.** The distribution is bimodal: six modules on 840 instances, `campaignevents/v0` on 815, then `growthexperiments/v0` 352, `wikifunctions/v0` 163, `wikibase/v1` 4. A module page must never render 840 links. Summarise by project family with a count, and name the exceptions — the *narrow* modules are the informative ones. This is the "present-on-N + exceptions" representation the source-of-truth ADR already floats as a fallback.

---

## 2. Prose is inline; schema trees are deferred

**Decision:** A module page renders operation **prose** — `summary`, `description`, parameter names and descriptions, response codes and descriptions — directly into the static HTML. Deep request/response **schema trees** are not inlined; they are rendered on demand.

**Rationale:** Measured tier sizes at 50 modules make the split obvious:

| Tier | Content | 10 modules | @ 50 modules |
|---|---|---|---|
| 1 | module info + method/path/summary | 13 KB | **64 KB** |
| 2 | + operation description, params, responses | 59 KB | **295 KB** |
| 3 | full spec incl. schema trees | 590 KB | **2.9 MB** |

Schema structure is 83% of spec bytes and is the least useful material for indexing. Excluding it is what makes every other number in this ADR affordable: 2,500 routes × prose-only HTML is tens of MB of build output, where inlining schemas projected to hundreds of MB.

**This corrects an earlier estimate.** An initial guess of ~40 KB indexable text per module page (implying ~2 MB of content DB per locale and a ~15-locale ceiling) counted schema text as indexable. The measured figure is ~6 KB of prose per module, so the content DB is roughly 7× smaller and the locale ceiling far higher than first projected.

**Named trade-off:** anything deferred out of the HTML is invisible to crawlers. This is an explicit "robots and search get the prose; humans can expand the schema" decision, not an oversight.

**Measured caveat — the prose is not all there.** Across the committed specs, **71% of operations declare a `summary` but 79% declare a `description`**, and the gap is uneven:

| Module | Ops | With `summary` | With `description` |
|---|---|---|---|
| `readinglists/v0` | 18 | **0** | **0** |
| `specs/v0` | 3 | **0** | **0** |
| `growthexperiments/v0` | 10 | **0** | 10 |
| `wikifunctions/v0` | 4 | **0** | 4 |
| `-` (root) | 48 | 31 | 31 |
| `wikibase/v1` | 65 | 65 | 65 |

A summary-only tier-1 projection would therefore render four of ten modules as a **bare list of paths with no indexable prose at all**. So tier 1 falls back to the first sentence of `description` when `summary` is absent, which recovers `growthexperiments/v0` and `wikifunctions/v0` and lifts prose coverage from 71% to 79%.

`readinglists/v0` and `specs/v0` have neither, and no projection can invent prose. Those 21 operations are a **spec-content gap to raise upstream**, not a rendering problem — and they are a genuine limit on what tier 1 alone can achieve, since a page of bare paths has little to rank for.

**Consequence:** OpenAPI `tags` cannot be used to subdivide oversized modules — 8 of 10 modules are untagged, including both large ones (`wikibase/v1` 65 ops, root `-` 48 ops). If a page proves too heavy even prose-only, grouping must be invented (first path segment is the obvious candidate). Not done now.

---

## 3. Translations are overlay catalogues, not translated specs

**Decision:** Store the English spec verbatim (already done) plus, per locale, an **overlay catalogue** mapping **JSON Pointer → translated string**, covering only translatable fields (`summary`, `description`, `title`). Full translated specs are never committed.

```
config/generated/module-spec-i18n/<module>/<locale>.generated.json
  { "/paths/~1v1~1page~1{title}/get/summary": "…", … }
```

**Rationale:**
- **Size.** Translatable text is 17% of spec bytes. Full translated specs at 50 modules × 50 locales ≈ 150 MB of near-duplicate structure; overlays ≈ 24 MB. A 6× saving on the axis that grows fastest.
- **Partial fallback is expressible.** MediaWiki translations will arrive incomplete. A 40%-translated full spec cannot distinguish "English because that is the source" from "untranslated" — so it cannot fall back per string. An overlay resolves each pointer independently through the locale's `fallbackChain` from `config/languages.ts`, ultimately to English.
- **Coverage becomes data.** Overlay hit-rate per (module, locale) is a first-class number: it drives §5's publishability gate, and can surface to readers.
- **Established pattern.** Structurally the same as `docs/adr-translatable-prose-content.md` — English source authored once, translations as a separate catalogue, expanded at generate time. Reusing the shape beats inventing a second one.

**Generation:** when MediaWiki's per-language spec endpoint lands, the generator fetches spec-per-(module, locale) — 50 × 50 = 2,500 polite, bounded-concurrency requests, the same shape as the existing 841-request phase-1 sweep — diffs each against English, and stores only differing strings. Expensive fetch occasionally; cheap storage forever.

**Consequence — pointer rot.** Regenerating the English spec can orphan overlay pointers. The generator MUST report unresolvable pointers as a diagnostic rather than silently dropping translations. Overlay regeneration is independently runnable, mirroring the existing `--specs-only` phase split.

---

## 4. One anchor vocabulary — and a live collision bug fixed on the way

**Correction to this ADR's first revision.** It said "adopt §8's format unchanged," on the basis of a collision test run against the format as *described in prose* by `docs/adr-explorer-deep-linking.md` §8. The **shipped** implementation (`app/utils/explorerOperationAnchor.ts`) was not that format: it additionally trimmed leading and trailing separators (`.replace( /^_+|_+$/g, '' )`). Running the real function over the committed specs produced **4 collisions**, in production data, today:

```
readinglists/v0   get_lists              ← GET  /lists   and  GET  /lists/
readinglists/v0   post_lists             ← POST /lists   and  POST /lists/
readinglists/v0   get_lists_id_entries   ← GET  /lists/{id}/entries   and  …/entries/
readinglists/v0   post_lists_id_entries  ← POST /lists/{id}/entries   and  …/entries/
```

The code comment asserted such collisions were "astronomically unlikely." They were already happening: an Explorer deep link to `POST /lists/` silently focused `POST /lists`. **So this was a live bug in shipped deep-linking, not a hypothetical for the new docs surface.**

**Decision — preserve a trailing slash, and only a trailing slash.** Lowercase method, `_`, path with non-alphanumeric runs collapsed to `_`, leading and trailing separators trimmed — **except that a path ending in `/` keeps one trailing underscore**:

```
GET /v1/page/{title}          →   get_v1_page_title            (unchanged)
GET /lists                    →   get_lists                    (unchanged)
GET /lists/                   →   get_lists_                   (new — was ambiguous)
GET /lists/{id}/entries       →   get_lists_id_entries         (unchanged)
GET /lists/{id}/entries/      →   get_lists_id_entries_        (new — was ambiguous)
```

**Rationale for that specific rule.** The naive fix — stop trimming entirely — also changes every path ending in `}`, which is most of them, churning nearly all existing anchors. But a trailing `}` *closes a parameter inside the final segment*, whereas a trailing `/` *adds an empty segment*; only the latter is a structural difference between two distinct OpenAPI paths. Keying on it fixes all four collisions while leaving **every currently-working anchor byte-identical**. Verified by test over all 179 committed operations: anchors differ from the legacy format if and only if the path ends in `/`.

**Decision — resolution is legacy-tolerant.** `findOperationByAnchor` tries the current format first, then the legacy format, so links shared before this change still resolve. Current-format-first matters: for the four affected paths a legacy anchor is ambiguous, and an unambiguous link must never be resolved by an ambiguous rule. Only the 4 previously-broken anchors change meaning, and they had no correct meaning to preserve.

It is produced by **one function in the generator** and consumed by five surfaces: heading `id`s in generated markdown, tier-1 catalogue links, the tier-2 endpoint search index `deepLink`, the Explorer deep-link hash, and `llms.txt` output.

**Rationale — verified against the corpus, not assumed.** Candidate formats tested against all 179 committed operations:

| Format | Example | Within-module collisions |
|---|---|---|
| **trailing-slash-preserving (adopted)** | `get_v1_page_title` / `get_lists_` | **0** |
| shipped format (trimmed) | `get_v1_page_title` | **4 — the live bug** |
| hyphen slug | `get-v1-page-title` | 4 |
| brace-marked | `get-v1-page-by-title` | 4 |

**The trailing underscore is load-bearing.** It reads like sloppiness to be tidied; tidying it is precisely what broke four real endpoints. Do not "clean up" this format.

Path character census across all operations: `{` and `}` ×194 each, `_` ×133, `-` ×6, `.` ×1, uppercase ×5. The literal underscores are why collapsing runs is delicate; the uppercase is why lowercasing is lossy in principle.

**Decision — injectivity is enforced, not hoped for.** The format is collision-free on today's corpus but not by construction: `{id}` and a literal segment `id` both normalize to `_id_`, so `/lists/{id}/x` and `/lists/id/x` would collide. Neither exists today; both are plausible. **The generator asserts within-module anchor uniqueness and fails on collision.** Uniqueness is only required per module (anchors are page-scoped), which is verified to hold.

**Decision — never let `github-slugger` decide.** Generated markdown MUST carry explicit heading `id`s. Nuxt Content slugs headings with `github-slugger`, which **deduplicates by appending `-1`/`-2`** — document-order dependent, and it fires immediately on the `/lists` vs `/lists/` pair. That failure mode is worse than a collision because it does not fail: anchors silently change when an operation is added or sort order shifts, breaking every shared link. Explicit ids remove the slugger's vote.

**Consequence:** pinned by the round-trip test §8 already requires (state → anchor → state), plus the new injectivity assertion. Both run in the generator's test suite.

---

## 5. The publishable locale set is coverage-gated, not catalogue-driven

**Decision:** A (module, locale) page is generated only when that overlay's coverage meets a threshold (starting value **70%**), and the locale is on an explicit allowlist in `config/`. `SUPPORTED_LANGUAGES` (575 entries) is *not* the publishable set.

**Rationale:** Generating 575 locales of mostly-English pages produces near-duplicate content at scale — an active SEO liability, not neutral filler. Coverage-gating makes the set self-limiting today and self-growing as translations land, with no hand-maintained list to rot. The threshold is policy, so it lives in `config/` per Absolute Rule 6.

**Consequence:** two independent coverage levels coexist on one page — interface chrome via banana-i18n (5 locales today), body prose via overlay (whatever MediaWiki has). A page can have translated chrome and English body, or the reverse. This needs a deliberate UI treatment, not an accident.

---

## 6. Tiers 1 and 2 share one route set

**Decision:** Tier 1 and tier 2 are the **same routes, same anchors, same URLs** — they differ only in content depth. Tier 1 emits each operation as a real heading (with its §4 id) carrying method, path and summary. Tier 2 adds description, parameters and responses *under those existing headings*.

**Rationale:** This is the whole payoff of settling §4 now. Shipping tier 1 first publishes URLs and anchors that get shared and indexed; tier 2 must not invalidate them. Modelling the tiers as one route set at two depths makes the upgrade a pure content change — zero URL churn, zero anchor churn, no redirects, no re-indexing penalty.

**Consequence:** tier 1 is ~50 × locales routes, not a single catalogue page per locale. That is a deliberate cost increase (a dozen routes → hundreds) bought for permanent URL stability. §2's sizing makes it affordable.

**Note:** a separate cross-module **index** page (per locale) is still needed as the internal-linking hub — see §10.

---

## 7. Prerender via `routeRules` inside `nuxt build`; do not switch to `nuxt generate`

**Decision:** Emit real static files for these routes only:

```ts
routeRules: { '/reference/**': { prerender: true } }
```

Everything else keeps today's SSR-on-Netlify behaviour. The generator also emits an explicit `nitro.prerender.routes` list (module × publishable locale), because catch-all routes cannot be crawler-discovered by Nitro.

**Rationale:** Nuxt hybrid rendering gives genuine on-disk HTML per route without a build-mode change. `docs/adr-multilingual-search.md` §5's prohibition targets prerendering *the whole site* at ~400-locale scale; it does not apply to an explicitly enumerated subset, and this ADR does not reopen it. Emitting the route list from the generator keeps the cross product materialised in exactly one place.

### 7.1 Measured (phase 0a), not estimated

Built 2026-08-20 on this repo: **150 routes** (10 committed modules × 15 locales), `nuxt build` with `routeRules: { '/reference/**': { prerender: true } }`.

| Metric | Measured |
|---|---|
| Total build, clean | **64 s** |
| Prerender phase | **39.2 s** |
| Per-route render | median **312 ms**, min 5 ms, max 15.2 s (first route pays cold start) |
| Peak build RSS | **4.83 GB** |
| Reference HTML | 15.99 MB total — avg **109 KB**, max 132 KB (`wikibase/v1`, 65 ops) |
| Reference payloads | 0.53 MB total — avg **3.6 KB** |
| gzip ratio | **0.18** → ≈19 KB per page over the wire |
| Total `.output/public` | 31 MB |

**Three corrections to figures this ADR previously estimated:**

1. **`_payload.json` does not "roughly double" output.** It is **3%** of HTML (3.6 KB against 109 KB), because the payload carries the tier-1 projection while the HTML carries the rendered shell.
2. **Per-route cost is ~113 KB, not the ~70 KB assumed.** Extrapolation was low by ~60%.
3. **Page weight is dominated by the shared shell, not by spec content.** A 65-operation module is 132 KB against a 109 KB average — only 21% more — so roughly 100 KB of every page is inlined CSS and app shell. Per-route cost is therefore near-**constant**, which makes extrapolation reliable but sets a high floor. *If output size ever needs reducing, the lever is shell weight, not spec projection.*

**Extrapolated to 50 modules × 50 locales (2,500 routes):** ≈273 MB HTML + ≈9 MB payloads + ≈12 MB fixed ≈ **295 MB**, and ≈11 min of prerender. That exceeds the plan's stop condition ("more than a few minutes or ~100 MB → revisit §6"), while **750 routes lands at ≈82 MB and ≈3.3 min, comfortably inside it.** So the route set is safe at experiment scale and the locale count is the dial — which is precisely what §5's coverage gate turns.

**Side effect worth knowing: enabling any prerendering makes `@nuxtjs/i18n` prerender its message endpoint for every registered locale** — 575 files, 4.6 MB, as `/_i18n/<hash>/<locale>`. It is a fixed one-time cost that does not scale with modules, but it is why the build reported "Prerendered 876 routes" for 151 requested (150 HTML + 150 payloads + 575 i18n + 1 content DB). Nothing else escaped scope: **0 content pages were prerendered**, so the reference route did not capture the content catch-all.

**Consequence:** output lands on the CDN as static assets, not in the function bundle, so §9's budget is unaffected by any of the above.

---

## 8. Route shape

**Decision:** `app/pages/reference/[...module].vue`, a catch-all whose tail segments carry the module name verbatim — the same no-percent-encoding technique as `docs/adr-explorer-deep-linking.md` §1, because module names contain `/`:

```
/reference/site/v1                  (en, prefix_except_default)
/he/reference/site/v1
/reference/site/v1#get_v1_page__title_
```

**Decision — the root module is slugged `general`.** Discovery reports one module with an empty id, keyed `-` in the source of truth (source-of-truth §4). `/reference/-` is legal but reads as a typo and is hostile to anyone reading a URL aloud or in a search result. Its documentation route is therefore **`/reference/general`**.

This is a **URL-slug concern only**. Module identity stays `-` throughout the data layer — `modules.generated.ts`, spec filenames, overlay paths, the source-of-truth accessors. Nothing about the generated data changes.

The mapping lives in `config/` per Absolute Rule 6, as a bidirectional pair of pure functions (`moduleNameToSlug` / `slugToModuleName`) rather than an inline special case, so a future second alias needs no new mechanism. Defaulting to identity means only `-` → `general` is table-driven today.

**Consequence — a knowing divergence.** The Explorer's deep-link grammar continues to carry the raw module name (`/explorer/direct/<instance>/-`), because that grammar is already published and §4's whole argument is that published URLs do not get rewritten. So the root module is `-` in Explorer URLs and `general` in reference URLs. This is recorded deliberately rather than discovered later; the shared slug functions are available if we later choose to align the Explorer too, which would be a separate, deliberate URL migration.

**Consequence:** this page must take routing precedence over the existing content catch-all `app/pages/[...slug].vue`. Verify explicitly — a silent shadow here fails as a 404 or, worse, as a content page.

---

## 9. Search: generated markdown into the content collection

**Decision:** Tier-2 module docs are generated as **markdown in the Nuxt Content collection**, so `useSearchCollection('content')` indexes them with no new search machinery. Tier 1 alone provides only module-level search; that is an accepted interim state.

**Rationale:** The collection buys FTS5 search, `docs/adr-multilingual-search.md` §3 locale partitioning by path prefix, the English-fallback result section, the sidebar, on-this-page TOC and prev/next — all existing, all free. And Nuxt Content's FTS builder indexes **per section**, with ids of the form `/{locale}/{slug}#{anchor}`, so one markdown file per module yields **per-operation search results**. Internal search is section-granular even though the page is one file.

**Sizing, and an explicit budget.** Tier-2 prose is ~295 KB per locale at 50 modules; 15 locales ≈ 4.4 MB of content DB. The constraint is that the DB ships inside the Netlify function bundle (~50 MB zipped / ~250 MB unzipped — confirm against current Netlify docs).

**Decision — budget well below the limit, do not approach it.** The experiment targets **≤ 10 MB of content DB growth**, roughly a fifth of the zipped ceiling, and a build-time tripwire fails the build at that figure rather than at the platform limit. Rationale: the ceiling is shared with everything else in the server bundle, the failure mode at the limit is a broken deploy rather than a degraded page, and headroom is what lets module count and locale count grow without a re-architecture. A tripwire set *at* the limit converts a sizing question into an outage.

**Consequence:** if projected growth would exceed the budget, the locale count is reduced (§5) or the endpoint-index escape hatch below is taken — the budget is never raised to accommodate the content.

**Escape hatch, unchanged:** if the DB does become binding, fall back to `docs/adr-explorer-deep-linking.md` §10's per-locale endpoint index (MiniSearch, lazily fetched, ~200 KB per locale, only the active locale plus English ever loaded). That work is already specified; this ADR only adds a locale axis to it. Not built now.

**Named SEO trade-off:** search engines index URLs, not anchors. A module's operations compete for one result, where per-operation pages would rank independently. That is the cost of §1's route reduction, accepted knowingly — and it raises the stakes on §10.

---

## 10. Machine surfaces and crawler hygiene (tier 3)

**Decision — machine surfaces.** Serve the already-committed specs at stable URLs, plus an `llms.txt` index and a consolidated `llms-full.txt` prose dump, and expose each page's raw markdown alongside its HTML.

**Rationale:** For AI consumers a single content-bearing text artifact is *better* than hundreds of HTML pages — one fetch, no crawl budget, no HTML parsing. This is where the earlier "AI sitemap" instinct is correct: an XML sitemap cannot carry content, but `llms.txt` can. At §2's measured sizes the whole prose corpus is ~295 KB, comfortably one file. Anchors in it use §4's vocabulary, so an AI citing an operation emits a working link.

**Decision — discovery.** Add `robots.txt` and a sitemap over the generated route list, with `hreflang` alternates between locale variants. Neither `robots.txt` nor a sitemap exists in the repo today.

**Rationale:** Pages reachable only via a sitemap are treated as orphans and rank poorly, so the cross-module index page (§6) is the internal-linking hub, not decoration. `hreflang` requires each locale variant to be a distinct crawlable URL with real translated content — which §3 and §7 are what make possible.

**Decision — remove an existing liability.** `Disallow` `/explorer/direct/` and `/explorer/q/`, add `noindex` to Explorer routes, and emit `rel=canonical` from an Explorer view to the corresponding static page.

**Rationale:** The deep-link grammar made **6,374 `/explorer/direct/<instance>/<module>` URLs legal today** (~32,000 at 50 modules), plus `/q/` variants — every one serving an identical empty client-only shell. Sharing those links is the feature's purpose, so crawlers will find them. That is a large thin-content and near-duplicate surface, and once the static docs exist, two URL families describe the same operation. This is cheap now and much harder after those addresses are indexed. **It is worth doing independently of the rest of this ADR.**

---

## 11. Generated docs are a fourth content pathway

**Decision:** Generated module docs are a distinct content pathway alongside hand-authored markdown, remote import (`docs/adr-remote-content-fetching.md`) and banana-content prose (`docs/adr-translatable-prose-content.md`). It carries its **own ownership marker**, disjoint from the others, and owns the `reference/` subtree exclusively.

**Rationale:** `docs/adr-translatable-prose-content.md` §8 establishes that a path is owned by exactly one pathway. Three generators writing into `content/<locale>/` need disjoint markers or a regen wipes another's output.

**Consequence:** generated docs are **not committed** — unlike the specs and overlays, which are. They are materialised into `content/` by a prebuild step from committed inputs. Committing 50 modules × 15 locales of derived markdown would add tens of MB of pure derivation to review on every regen. The *inputs* (specs, overlays) stay committed and diff-reviewed, per the established regen-and-review workflow.

---

## 12. `nuxt-openapi-docs-module` is not adopted as the renderer

**Decision:** Write the renderer first-party over the committed specs. Use `nuxt-openapi-docs-module` only for a throwaway information-architecture spike.

**Rationale — verified against the installed source, v5.3.2.** This was originally reasoned from priors; the package is now installed (as a devDependency, spike-only) and every criterion below was checked against `node_modules/nuxt-openapi-docs-module/dist/`. **All five fail.**

| Criterion | Verdict | Evidence in v5.3.2 |
|---|---|---|
| Absolute Rule 1 — banana-i18n owns chrome | **Fail** | Ships its own catalogues: `dist/runtime/lang/{ar,bn,de,en,es,fr,…}.json` (19 locales) plus `localize` / `locales` module options. Satisfying Rule 1 means replacing its entire i18n layer. |
| Absolute Rule 2 — BiDi isolation | **Fail** | **Zero `<bdi>` occurrences** anywhere in `dist/runtime/`. The single `direction: rtl` (`blocks/OpenApiRouteHeader.vue`) is a CSS truncation trick, not language support. Every summary and description we render is an external string. |
| Route ownership (§8) | **Fail** | Calls `extendPages()` and registers its own routes: `/{path}`, `/{path}/{filename}/:type`, `/{path}/{filename}/:type/:mathod`. Route identity is `filename`, so a module name containing `/` (`site/v1`) does not map onto the scheme, and the tail-segment technique is unavailable. |
| Locale model (§3, §5) | **Fail** | `locales?: string[]` — a flat list parallel to `@nuxtjs/i18n`, with no fallback-chain concept and no per-string coverage. |
| Codex design system | **Fail** | Own layout, own component tree (`OpenApiHeader/Menu/Route/Auth/Components`), own compiled stylesheet, and `highlight.js` as a direct dependency — a second syntax highlighter alongside the repo's Shiki. |
| *(sixth)* honours `prerender: true` | Neutral | Hooks `nitro:config` only to push `publicAssets`. Its routes carry dynamic params, so they are not Nitro-discoverable and would need an explicit route list regardless — the same work as §7 does for our own page. |

Two incidental quality signals, recorded because they bear on maintenance risk rather than on the decision: the published route pattern contains a typo (`:mathod`), and the bundled locale set includes `ch`, which is not a valid language code.

**Consequence:** §12 stands on evidence, not expectation. The package remains installed as a devDependency purely for the phase-0b information-architecture spike and is removed afterwards; it is never added to `modules` in `nuxt.config.ts`.

**Rationale for building it ourselves:** the spec → page projection is a pure function over JSON already committed; the discovery parser exists (`app/utils/normalizeDiscoveryModules.ts`); Codex has the primitives. The cost is bounded and the result satisfies all five constraints by construction.

---

## 13. Tier 2 is gated on tier-1 evidence

**Decision:** Tiers 1 and 3 ship first. Tier 2 is designed here (§2, §6, §9) but built only after tier-1 indexing and traffic data justify it.

**Rationale:** Tier 1 + tier 3 is ~1 MB of data and fully answers the riskiest question — *does making these pages static make them discoverable?* If tier-1 pages do not index, that finding matters far more than anything tier 2 would have shown, and is obtained for a fraction of the effort. If they do index, tier 2 is the same pages with more content at a measured cost. §6 guarantees the upgrade costs no URL churn either way.

---

## Corrections to existing documentation

| Document | Section | Required update |
|---|---|---|
| `AGENTS.md` | Absolute rules / config inventory | Note `config/generated/module-spec-i18n/` overlays, the publishable-locale allowlist and coverage threshold, and that `reference/` in `content/` is generator-owned (fourth pathway, §11). |
| `ARCHITECTURE.md` | "API explorer architecture" / directory structure | Add the static reference surface as a distinct, prerendered read path alongside the client-only Explorer; note they share the §4 anchor vocabulary. |
| `docs/TECH_DECISIONS.md` | Site architecture / Search | Record that `/reference/**` is prerendered inside `nuxt build` via `routeRules` (§7) — this does *not* reopen `adr-multilingual-search.md` §5 — and that generated module docs enter the FTS `content` collection (§9). |
| `docs/adr-multilingual-search.md` | §2 (Scalar/OpenAPI excluded from search) | Note that OpenAPI content becomes searchable via generated markdown (§9), not by indexing Scalar — the §2 deferral is satisfied by a different route than it anticipated. |
| `docs/adr-explorer-deep-linking.md` | §8, §10 | Note that the anchor format is promoted to a shared vocabulary with generator-enforced injectivity (§4), and that §10's endpoint index is now the tier-2 search escape hatch rather than the primary plan. |
| `docs/adr-module-source-of-truth.md` | §8 open question | Note that static module docs consume the spec-identical-across-instances assumption more strongly than the Explorer does (§1). |
| `docs/guide/` | new | A companion guide (mirroring `docs/guide/explorer-deep-linking.md`) once implemented. |
| `package.json` | `scripts` | Overlay generation and doc materialisation entry points; see the plan document. |

---

## Implementation steps

Detailed, phased steps live in
[`plan-static-module-documentation-experiment.md`](plan-static-module-documentation-experiment.md).
Summary of ordering, riskiest-first:

1. ~~**Spike A — prerender scale test.**~~ **Done** — §7.1. Went further than a stub: the page renders the real tier-1 projection, so the measured bytes are representative rather than notional.
2. **Spike B — IA reference.** `nuxt-openapi-docs-module` against the committed specs. Scope now reduced to information architecture only, since the §12 audit already answered the adoption question. Throwaway.
3. ~~**Anchor vocabulary.**~~ **Done** — §4. Single emitter, round-trip test, uniqueness assertion, legacy-tolerant resolver, and a fix for the live collision bug it uncovered.
4. **Crawler hygiene.** `robots.txt`, `noindex`, canonicals, sitemap, `hreflang` (§10). Shippable independently, and removes a liability that exists today.
5. **Tier 3.** Raw specs at stable URLs, `llms.txt`, `llms-full.txt` (§10).
6. **Tier 1 completion.** Cross-module index page, then overlays and coverage-gated locales once the per-language spec endpoint exists (§3, §5, §6).
7. **Tier 2.** Gated on §13.

*(Crawler hygiene moved ahead of tier 3: it is independent of everything else and the 6,374 empty-shell URLs it addresses are already crawlable.)*

---

## Open questions / risks

- **Spec-identical-across-instances (§1).** Inherited from source-of-truth §8, still unvalidated, and load-bearing for the entire design. Accepted deliberately; ~30-request validation recommended.
- **Runtime routing is unverified.** The sandbox denies `listen` on every port (`EACCES`), so `.output/server` could not be served and no route was exercised over HTTP. Verified statically instead: `/reference/**` is present in the built route manifest, all 150 pages prerendered with correct content, and **zero** content pages were prerendered — so the reference catch-all demonstrably did not capture content routes at prerender time. Still unconfirmed at runtime: that `app/pages/[...slug].vue` continues to serve content paths, and that an unknown module returns 404 rather than a blank page. **Confirm both before publishing any URL.**
- **Prose coverage caps tier 1 (§2).** 21 operations across `readinglists/v0` and `specs/v0` have neither `summary` nor `description`. The description fallback cannot help them. This is upstream spec work, and until it happens those two modules' pages carry no indexable prose — which is a real limit on the tier-1-first strategy, not a rendering defect.
- **`_i18n` prerender cost (§7.1).** Enabling prerender makes `@nuxtjs/i18n` emit its message endpoint for all 575 registered locales (575 files, 4.6 MB). Fixed cost, does not scale with modules, but it will grow if the locale catalogue does. If it becomes unwanted, it needs an explicit `nitro.prerender.ignore` rule — not attempted.
- **Peak build memory (§7.1).** 4.83 GB RSS at 150 routes. Most of it is the Vite/Nitro build rather than prerendering, but it is close enough to common CI limits to be worth watching as the route count grows.
- **Spec reads are filesystem-based.** `server/api/reference/[...module].get.ts` reads spec JSON from `config/generated/module-specs/` with `node:fs`. That is correct during prerender (project directory present) but would fail in a runtime-rendered deployment where those files are not bundled. Acceptable while the routes are prerendered; needs server assets or a build-time projection before any runtime rendering is relied on.
- **Oversized module pages (§2).** `wikibase/v1` (65 ops) and root `-` (48 ops) have no `tags` to split on. If prose-only weight is still too high, grouping by first path segment is the fallback — undesigned.
- **Overlay pointer rot (§3).** Needs a stale-pointer diagnostic. Unbuilt.
- **Per-language spec endpoint does not exist yet.** §3's generator cannot run until MediaWiki ships it. Tier 1 English-only is unblocked; the locale axis is not. Confirm the parameter shape before building the fetcher.
- **Content DB in the function bundle (§9).** Measured comfortable, but it grows with modules × locales. The ≤ 10 MB budget and its tripwire are required, not optional — and the budget is deliberately a fraction of the platform ceiling so growth never becomes a deploy failure.
- **Same-page hash navigation (§9).** `docs/search-implementation-guide.md` records a known issue: a search result resolving to `/#section` on the current page scrolls but does not register as a navigation. This design makes that the *dominant* case. The documented workaround (strip the anchor from `to`, scroll programmatically) must actually be implemented. Native fragment links in prerendered HTML are unaffected — this is post-hydration only.
- **AI crawler JS execution.** The premise that AI crawlers do not run JavaScript is our strongest argument and is not something we can verify from inside the sandbox. Re-check before treating it as settled.
- **Root module slug — settled.** `/reference/general`, via bidirectional slug functions in `config/`; module identity stays `-` in all data (§8). The resulting `-`-vs-`general` divergence with Explorer deep-link URLs is accepted and recorded.
- **Two coverage levels on one page (§5).** Chrome and body translate independently; needs a UI treatment.
- **Netlify limits.** Function-bundle figures (~50 MB zipped / ~250 MB unzipped) are from memory. Worth confirming, but the §9 budget is set low enough (≤ 10 MB) that the exact ceiling is not load-bearing — which is the point of budgeting well below it.
- **`nuxt-openapi-docs-module` audit is version-pinned.** The §12 evidence is against v5.3.2. It is not a moving dependency for us — it is removed after the phase-0b spike — but a future revisit would need re-auditing rather than citing this table.
