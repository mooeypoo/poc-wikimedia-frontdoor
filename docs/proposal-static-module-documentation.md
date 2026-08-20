# Static API Reference — Experiment Summary and Decision

**Audience:** Leadership and stakeholders. A complete account of the experiment: what we set
out to solve, what we built, what it costs, what it would cost as things grow, what lighter
alternatives exist, and what we recommend deciding.

**Companion documents:** `adr-static-module-documentation.md` (technical decisions),
`plan-static-module-documentation-experiment.md` (execution detail). This document is
self-contained; neither is required reading.

*(The filename still says "proposal" so existing links keep working.)*

> **This file is canonical.** A formatted web version was published for the current decision
> round at `https://claude.ai/code/artifact/85b91d22-9df7-428b-9889-1a9b7d53f935`. It is a
> **point-in-time snapshot and is no longer maintained** — if the two disagree, this file is
> right. Do not treat the snapshot as a second source to keep in sync; updating it would mean
> recreating its HTML from scratch, and the maintenance cost is not worth it. Republish a
> fresh snapshot if and when a later decision round needs one.

---

## Context, for readers new to this

Four terms recur throughout, and the argument does not work without them.

**Module.** Wikimedia's REST API is not one flat API; it is divided into named, versioned
groups of endpoints called modules — `site/v1`, `readinglists/v0`, `wikibase/v1` and so on.
There are **10 today and we expect around 50**. Modules are the unit this proposal documents.

**Operation.** One callable endpoint within a module (for example, "fetch a page's HTML").
There are **179 across all modules today**.

**OpenAPI specification.** A machine-readable file describing a module's operations —
parameters, responses, and whatever human-readable descriptions the module's authors wrote.
We already collect and store one per module; everything proposed here is generated from them,
so **no documentation is written by hand.**

**The API Explorer.** The portal's existing interactive documentation browser. It works well
for people, and nothing here changes it. Its limitation is that it builds itself in the
visitor's browser, which is why automated visitors — search engines, AI crawlers — see almost
nothing.

One structural fact matters throughout: a module is deployed to **roughly 840 Wikimedia
wikis**, and its operations are the same on each. That is why we document a module once rather
than once per wiki, and it is the assumption that makes the whole thing tractable.

---

## The decision, in brief

We built a working experiment. It does what we wanted. **We do not recommend shipping all of
it.**

The honest finding is that the three problems we set out to solve have **very different
costs**, and the cheapest piece solves the most valuable problem:

| Piece | Serves | Cost at 50 modules | Recommendation |
|---|---|---|---|
| Machine-readable files for AI | AI assistants, tooling | **~40 KB, no page count** | **Ship** |
| Reference pages, English | Search ranking, no-JS fallback | **50 pages, 6 MB, 13 s** | **Ship** |
| Reference pages × all languages | Speculative | 2,500 pages, 276 MB, 11 min | **Do not ship yet** |
| Full operation detail on pages | Long-tail search | Doubles page content | **Decide on evidence** |

The language dimension is **98% of the projected cost and carries the weakest evidence
behind it.** Dropping it for now turns this from a significant ongoing commitment into a
small one, while keeping almost all of the benefit.

If you read nothing else: **ship the machine-readable files and the English pages, do not
multiply by language, and revisit in a quarter with real data.**

---

## What this decision actually costs

**Important framing: this is not a decision about whether to fund building something. It is
already built.** The experiment produced working, tested code for every piece described here.
The decision is how much of it to *publish*.

| | State | Remaining work |
|---|---|---|
| Machine-readable files | Built, tested, verified | **None** |
| English reference pages | Built, tested, measured | **One index page** (~a day) so the pages link to each other; crawlers treat page sets with no internal links as orphans |
| Crawler instructions and sitemap | Built, tested | None |
| Language multiplication | Infrastructure built; translations do not exist | Blocked on MediaWiki delivering per-language specifications |
| Full operation detail | Designed, not built | Moderate — and deliberately gated on data |

Two cheap checks are recommended before publishing anything: validate the
same-on-every-wiki assumption (roughly 30 requests, described below) and answer the
documentation-overlap question in the next section.

**So the marginal cost of the recommendation is roughly one day of work plus those checks.**
That is a materially different question from the one we started with, and it should change
how much deliberation it warrants.

---

## The one question we need answered by someone outside this work

**Is this portal intended to become the canonical home for Wikimedia REST API reference?**

The REST API is already documented on mediawiki.org and elsewhere in the movement. Two
outcomes follow from the answer, and they point in opposite directions:

- **If yes, with the older pages eventually redirected here** — publish. The pages
  consolidate documentation that is currently scattered, and consolidation is exactly what
  search engines reward.
- **If no, and both sets of pages persist indefinitely** — we would be adding Wikimedia pages
  that compete with other Wikimedia pages for the same queries, splitting ranking signals
  between our own properties. We could collectively rank *worse* than any one of them does
  today. In that case the machine-readable files (option A) are still clearly worth shipping,
  but the pages are questionable.

**We cannot answer this from the code, and it is the single most consequential input to the
decision.** It belongs to whoever owns developer-documentation strategy across the movement,
not to this experiment.

---

## What we set out to solve

Three distinct needs got bundled together at the start. Separating them is what made the
cost picture clear, so they are separated here.

**1. AI coverage.** Assistants should know the Wikimedia REST API exists and how to call it.
A growing share of developers ask an assistant before they open a browser.

**2. Search visibility.** A developer searching for how to call a Wikimedia endpoint should
be shown our documentation.

**3. A lightweight path.** Someone on a slow or constrained connection, or with JavaScript
unavailable, should still be able to read the reference.

All three fail today for the same reason: the interactive API Explorer renders entirely in
the browser. An automated visitor receives an essentially empty page; content appears only
after JavaScript runs and two further requests to a wiki resolve. Search engines index that
unreliably, AI crawlers very likely not at all, and all 10 modules with their 179 operations
effectively share one address — so there is nothing for a search engine to rank.

A sitemap does not fix this. A sitemap lists addresses; it cannot put content into a page.

---

## Which piece actually serves which need

This is the core of the analysis. The pieces are not equally valuable, and they are very far
from equally expensive.

| | AI coverage | Search visibility | Lightweight path | Cost |
|---|---|---|---|---|
| **Machine-readable files** (`llms.txt`, full text corpus, raw specs) | **Fully** | Barely — one address does not rank | **Well** — 34 KB of plain text for the whole API | Negligible |
| **Reference pages, English** | Adds little | **Yes** — this is the only piece that creates rankable addresses | **Yes** — a real page, ~19 KB compressed | Small |
| **Same pages × N languages** | Nothing | Unproven | Nothing extra | **Large, multiplies** |
| **Full operation detail** | Modest | Long-tail queries | Marginal | Moderate |

Two conclusions fall out of that table.

**The AI need — arguably the most valuable of the three — is met by the cheapest piece.** A
single 34 KB text file containing every module and all 179 operations serves an assistant
*better* than hundreds of HTML pages: one request, no JavaScript, no crawl budget, no markup
to parse. This needed none of the page infrastructure.

**Search visibility genuinely requires pages, and nothing lighter substitutes.** Search
engines rank addresses. A text file, however complete, is one address. If we want to appear
for "Wikibase REST API," that content needs its own page. This is the one place where the
sceptical instinct ("surely something lighter would do") does not hold — but in English only
it is just 50 pages.

---

## What it costs as things grow

We measured a real build of 150 pages and extrapolated. Per-page cost is near-constant, which
makes these projections reliable.

| Scenario | Pages | Build output | Prerender time | Translation files |
|---|---|---|---|---|
| English, today (10 modules) | 10 | 1 MB | 3 s | — |
| English, 50 modules | 50 | 6 MB | 13 s | — |
| English, **200** modules | 200 | 22 MB | 52 s | — |
| 15 languages, 50 modules | 750 | 83 MB | 3 min | 750 |
| 50 languages, 50 modules | 2,500 | 276 MB | 11 min | 2,500 |
| **All 575 catalogue languages**, 50 modules | 28,750 | **3.1 GB** | **125 min** | 28,750 |

**More modules is a non-problem.** Growing from 10 to 50 costs 13 seconds of build time. Even
200 modules — four times what we expect — is 22 MB and under a minute. This dimension can be
ignored.

**More languages is the entire cost.** Every number that looks alarming above comes from the
language multiplier, and the last row is what happens if someone wires this to the full
language catalogue without thinking. That row is the real risk in this design: not that it
fails, but that it is one careless configuration change away from a two-hour build.

**A cost that is not bytes.** Translated specifications arrive as one file per module per
language — 2,500 files at moderate scale. Our review process for generated data is reading
the git diff. **That process does not survive 2,500 files.** The maintenance burden of the
language dimension is arguably worse than its size.

### One cost grows faster than linearly

Everything above grows in proportion to the number of languages. One thing grows with the
*square* of it, and it is the strongest single argument for keeping the language set small.

Search engines require every language version of a page to declare **every** other version,
*including itself*, and to do so **reciprocally** — if the French page declares the English
one but not vice versa, the declarations are discarded rather than partially honoured. There
is no compact way to express this. So the file that tells search engines about our pages grows
with pages **and** with declarations per page:

| Languages | Pages listed | Declarations | Resulting file |
|---|---|---|---|
| **1** | 50 | **none needed** | **~1 KB** |
| 15 | 750 | 12,000 | ~1.7 MB |
| 50 | 2,500 | 127,500 | ~17 MB |
| All 575 | 28,750 | 16,560,000 | **~2 GB** |

The last row is not merely large. The format has a hard limit of 50 MB per file, so it is
**40× over what is legal** and would have to be split across many files just to be accepted.

Two practical consequences. First, this is now handled: with a single language the
declarations are omitted entirely, and we verified that the file drops from 241 KB to **0.8
KB**. Second, if languages are ever published, these declarations should move out of that file
and onto the pages themselves — same total volume, but spread across pages instead of
concentrated in one file with a size ceiling. That is straightforward, and deliberately not
built until the language question is decided.

---

## Lighter alternatives, honestly compared

Four options, from cheapest to what we actually built.

### A. Machine-readable files only

Ship the corpus, the index, and the raw specifications. No pages at all; links point into the
existing Explorer.

- **AI coverage: fully met.**
- **Search: not met.** One address will not rank for module or endpoint queries.
- **Lightweight path: met crudely.** Plain text is very light but is not a readable page for
  a human.
- **Cost: effectively zero.** No page count, no language multiplier, no prerender step.

**This is the floor, and it is a genuinely defensible answer** if search visibility is judged
not worth pursuing.

### B. Machine-readable files plus one overview page

Add a single page listing every module and operation.

- **Search: partially met.** One strong page can rank for broad terms ("Wikimedia REST API")
  but not for a specific module or endpoint.
- **Lightweight path: met.**
- **Cost: 1 page per language. Trivial.**
- **Weakness:** a single page carrying all 179 operations is heavy, and gets heavier as
  modules grow — the one place where module growth *would* start to hurt.

### C. Machine-readable files plus English reference pages — **recommended**

What we built, minus the language multiplier.

- **All three needs met.**
- **Cost: 50 pages, 6 MB, 13 seconds** at the expected module count.
- **Weakness:** English only. Discussed below.

### D. Everything, all languages

What the experiment currently produces.

- **Cost: 2,500 pages, 276 MB, 11 minutes, 2,500 translation files** at moderate scale.
- **Weakness:** the benefit over option C is unproven, and it is the option that carries the
  3.1 GB failure mode.

---

## Why we would drop the language dimension, for now

This is the recommendation most likely to be contested, so here is the reasoning in full.

**Developers searching for API documentation search in English.** Even developers who do not
work in English generally search for technical documentation using English terms — endpoint
names, HTTP methods and parameter names are English regardless. Translated reference pages
help someone *read* the material; they do very little to help someone *find* it. Search
visibility is the need the pages exist to serve.

**Translated pages help with reading — but the Explorer already covers reading well** for
anyone with a working browser, and the translated specifications do not exist yet regardless.

**The evidence base is empty.** We have no data suggesting demand for translated API
reference. We have measured, concrete costs. Committing to a 50× multiplier against an
unmeasured benefit is the wrong order of operations.

**Near-duplicate pages carry a real penalty.** Publishing a language variant whose content is
mostly untranslated English produces near-duplicate pages at scale, which is actively harmful
for search rather than neutral. We built a translation-coverage gate for exactly this reason —
but the simpler answer is to not publish those variants yet.

**One cost grows quadratically, not linearly.** The search-engine declarations that link
language versions together grow with the square of the language count — detailed above. At the
full language catalogue that file alone would be roughly 2 GB and 40× over the format's legal
size limit. Page count is the linear cost; this is the one that bites disproportionately.

**Nothing is lost by waiting.** The infrastructure works and is tested. Turning languages on
later is a configuration change plus the translation files, not a redesign. Turning it on now
and discovering it was unnecessary means unwinding published, indexed addresses — which is
much harder.

---

## The uncertainties that matter more than cost

Cost we have measured. These we have not, and they matter more.

**Does anyone actually search for this?** We assume developers search for Wikimedia REST API
endpoints often enough to justify ranking for them. We have not validated it. Search-console
data after a small launch answers it directly, which is the main argument for shipping the
cheap version and measuring rather than debating.

**Can AI crawlers really not run JavaScript?** This is the strongest argument for the whole
effort and we cannot verify it from our own infrastructure. Crawler logs after launch are the
direct test. If it turns out they *can*, the AI argument weakens substantially — though the
search and lightweight-path arguments survive intact.

**Will the specifications ever carry enough prose?** 21 operations across two modules
(`readinglists/v0`, `specs/v0`) declare **no description at all**. Their pages are lists of
paths with nothing to index or rank. That is upstream work for the teams owning those modules,
and no amount of rendering substitutes for it. It also caps how good the lightweight reading
experience can be.

**Are the specifications the same on every wiki?** Dropping the per-wiki dimension — which is
what made this feasible at all — assumes a module behaves identically everywhere it is
deployed. Still unvalidated. Roughly 30 requests would settle it, and we recommend doing that
before publishing.

---

## If we do nothing

Worth stating, since "do nothing" is always an option and is sometimes right.

The Explorer keeps working exactly as it does today for anyone with a working browser. What
persists is: the API reference stays effectively invisible to search engines and almost
certainly absent from AI assistants; there remains no readable path for constrained
connections or JavaScript-disabled clients; and **the 6,374 empty shareable addresses stay
crawlable.**

That last item is the one thing we would argue against leaving alone. It is a pre-existing
liability created by the Explorer's shareable-link feature, it grows to roughly 32,000 as
modules are added, and the fix is already built and independent of every other decision here.
**Shipping only the crawler instructions, and nothing else, is a coherent choice.**

## How reversible is each piece?

Relevant because it determines how much a wrong decision costs.

| Piece | If we later want it gone |
|---|---|
| Machine-readable files | **Trivial.** Delete three files. Nothing links to them structurally. |
| Crawler instructions | **Trivial**, and there is no plausible reason to reverse them. |
| English reference pages | **Moderate.** Once published and indexed, removal needs redirects to avoid dead links from search results and anywhere people have linked. |
| Language multiplication | **Worst.** Every published language variant is an address that needs a redirect, multiplied by module count. This asymmetry is a substantial part of why we recommend holding it. |
| Full operation detail | **Trivial** — it adds content to existing pages rather than new addresses. |

The pattern is that **the cheap pieces are also the easily reversible ones**, and the expensive
piece is the hardest to unwind. That argues for the staged approach independently of the cost
numbers.

## What the experiment paid for regardless of this decision

Worth recording, because these are permanent gains even if nothing ships.

**We found and fixed a bug in production.** Settling how to name links to individual
operations meant testing naming schemes against live data. One module exposes both `/lists`
and `/lists/` as genuinely different endpoints, and the scheme already shipped in the Explorer
collapsed them — so **a shared link to one endpoint silently opened a different one.** Four
endpoints were affected. The code carried a comment calling such collisions "astronomically
unlikely" while they were already happening.

The transferable lesson is now in the engineering documentation: **the existing test proved the
links were reversible, not that they were unique.** All 179 operations passed while four pairs
collided, because each bad link still resolved to *an* endpoint — just the wrong one.

**We learned the specifications are thinner than assumed.** 71% of operations have a one-line
summary; two modules have no prose whatsoever. This is actionable upstream regardless of what
we publish.

**We corrected drift in our own documentation.** A test that had silently stopped running for
some time, and an authoring guide telling contributors to use a navigation setting that no
longer exists.

**We now have measured numbers** where we previously had estimates — and three of those
estimates were wrong, one by a factor of seven.

---

## Recommendation

**Ship option C, without the language multiplier:**

1. **Machine-readable files** — the corpus, index, and raw specifications. Cost is negligible,
   it closes the AI gap completely, and it is the piece we would defend even if everything else
   were dropped.
2. **English reference pages** — 50 pages at expected scale. This is the only way to get
   rankable addresses and a real no-JavaScript reading path.
3. **Crawler instructions and sitemap** — already built, and they remove a pre-existing
   liability (the Explorer's shareable links made 6,374 empty addresses valid) that is worth
   fixing whatever else is decided.
4. **Hold the language dimension.** Keep the infrastructure, publish English only.
5. **Hold full operation detail.** Decide it on measured indexing data.

Before publishing, two cheap checks: validate the same-on-every-wiki assumption (~30 requests),
and answer the question about Wikimedia's existing API documentation.

## How to decide

The choice is not really between the four options. It is between **three positions**, and each
has a clear tell.

**Position 1 — "search visibility is not worth pursuing."** Ship option A only. Defensible if
you believe developers reach Wikimedia API documentation through movement channels rather than
search, or if the duplicate-content concern against our own existing docs is judged serious.
Cost: effectively nothing. **Choose this if the answer to the Wikimedia-own-documentation
question is "both will persist."**

**Position 2 — "worth a measured attempt."** Ship option C, English only, and set a review in
one quarter. Cost is small and bounded, and the measurement answers the questions that argument
cannot. **This is our recommendation.**

**Position 3 — "commit fully."** Ship option D. We would not, on present evidence: the
incremental benefit is unmeasured and the cost multiplier is 50×.

**What to look at in a quarter**, if position 2 is chosen:

- Are the pages indexed, and do they appear for module-name searches?
- Is there measurable referral traffic from search?
- Do crawler logs show AI crawlers fetching the text corpus? (This also settles the
  JavaScript question.)
- Do the search terms people arrive on suggest demand for operation-level detail — and for any
  language other than English?

Those four answers determine whether to add full operation detail, whether to add languages,
or whether to stop. **If the pages do not get indexed at all, that is the most valuable
finding available and it costs a quarter of waiting rather than a quarter of building.**

## Who needs to weigh in

Not every question here belongs to the same people, and one of them blocks the others.

| Question | Belongs to | Blocking? |
|---|---|---|
| Is this portal the canonical home for REST API reference? | Developer-documentation strategy across the movement | **Yes** — it decides between option A and option C |
| Publish the English pages, or machine-readable files only? | Portal roadmap owners | Yes, but follows from the above |
| Ship the crawler instructions? | Portal roadmap owners | No — recommended regardless, and independently shippable |
| Add languages later? | Portal roadmap owners, on measured data | No — explicitly deferred |
| Fill in the missing operation descriptions | The teams owning `readinglists/v0` and `specs/v0` | No, but it caps the value of anything we publish for those two modules |
| Confirm specifications are identical across wikis | This team, ~30 requests | Recommended before publishing |

**Suggested sequence:** answer the canonical-home question first, because it is the one that
can change the recommendation rather than merely refine it. Everything else is either
independently shippable or explicitly deferred.

---

## Appendix: measured facts

From real builds against the 10 currently committed modules, not estimates.

| | |
|---|---|
| Modules / operations today | 10 / 179 |
| Expected modules | ~50 |
| Human-readable text in a specification | **17%** of bytes (98 KB of 590 KB) |
| Operations with a one-line summary | 71% |
| Operations with any prose at all | 79% (21 have none) |
| Modules using the standard grouping field | 2 of 10 |
| Page weight | ~109 KB, of which ~100 KB is shared site frame |
| Compressed page weight | ~19 KB |
| Build, 150 pages | 64 s total, 39 s of it page generation |
| Full text corpus | 34 KB for every module and operation |
| Wiki-and-module combinations avoided | 6,374 (~32,000 at 50 modules) |

**Two facts that shaped the design.** Human-readable text is only 17% of a specification, so
rendering the machine-readable structure was the expensive part, not the prose — that is why
pages carry prose and defer structure. And page weight is dominated by the shared site frame
rather than API content: a 65-operation module is only 21% heavier than average. Cost per page
is therefore near-constant, which is what makes the projections above trustworthy, but it also
means the floor is high and the lever for reducing size is the site frame, not the content.
