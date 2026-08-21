# Static API Reference — Experiment Summary and Decision

**Audience:** Leadership and stakeholders. A complete account of the experiment: what we set
out to solve, what we prototyped, what it would cost to build for production, what it would cost
as things grow, what lighter alternatives exist, and what we recommend deciding.

**Why this sits in the developer guide.** Unlike its neighbours here, this is not guidance on how
to build something. It is the record of an experiment: we prototyped every piece described here,
measured it, and use those measurements to recommend building **most** of it properly and
**rejecting** one part outright.

**A prototype is not a product.** The code written during the experiment exists to answer
questions — it is not a maintainable surface, and the recommendation is not "promote this branch."
Effort estimates throughout assume building a production version, informed by what the prototype
established. What the experiment durably produced is the *measurements*, the *failure modes*, and
the *design decisions* — not the implementation.

Closely related: [ai-agents-accessibility.md](ai-agents-accessibility.md) covers the static
discovery layer for AI agents from the guidance side; the machine-readable surfaces described
here are one concrete implementation of that idea.

**Companion documents:** [`../adr-static-module-documentation.md`](../adr-static-module-documentation.md)
(technical decisions), [`../plan-static-module-documentation-experiment.md`](../plan-static-module-documentation-experiment.md)
(execution detail). This document is self-contained; neither is required reading.

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

## The recommendation

**Build a permanently English-only static reference surface, and serve every other language
through the interactive Explorer.**

| Piece | Decision | Effort to build properly | Running cost at 50 modules |
|---|---|---|---|
| Machine-readable files for AI and tooling | **Build** | **S** | ~40 KB, no page count |
| Crawler instructions and sitemap | **Build** | **S** | Negligible; fixes an existing liability |
| Reference pages, **English only** | **Build** | **M** | 50 pages, 6 MB, 13 s |
| Full operation detail on pages | **Build when the page design holds** | **M** | +4% page weight — see below |
| Reference pages × other languages | **Do not build** | — | 2,500 pages, 276 MB, and it does not build |

*Sizes are for building a production version: **S = days, M = weeks**. Everything here was
prototyped during the experiment, which is where the measurements come from — but a prototype is
not a maintainable surface, so the estimates assume building it again properly rather than
promoting this code. See [What this would cost to build properly](#what-this-would-cost-to-build-properly).*

**The static surface is English-only by design, not by deferral.** That is the substantive
conclusion of this document, and the reasoning is short enough to state here:

- The static surface exists for exactly **three jobs**: search visibility, AI coverage, and a
  readable fallback for people who cannot run the Explorer. **Translation improves none of the
  first two, and is actively counterproductive for AI** — fifty translations of the same API
  reference add no information to a corpus while diluting it.
- **Language coverage for readers is the Explorer's job**, and the Explorer already does it.
  The static pages are not the portal's translation story; they are its machine-readable and
  no-JavaScript story.
- Translating the static surface is **not affordable at scale**: it multiplies pages fifty-fold,
  grows the search-engine annotation file quadratically to roughly 2 GB — forty times over the
  format's legal limit — and **exceeds the build memory ceiling that already aborted one build.**
  A configuration that does not build is not a roadmap item.

Being canonical for REST API documentation does not change this. Canonical status is an
obligation to document the API well in every language the portal supports — which the Explorer
and the translatable-content pathway deliver. It is not an obligation for every surface to be
translated, and the static surface is the one where translation costs the most and returns the
least.

The rest of this document explains how we reached that, including the alternatives we
considered and rejected and the measurements that changed our minds along the way.

---

## What is actually on a reference page

Two levels of detail come up repeatedly below, and the difference between them decides what a
reader can actually *do*. Concretely:

### The catalogue level — what the prototype produces

Per module: its name and description, which wikis expose it (summarised by project family, never
840 links), a link to the raw specification, and then one entry per operation:

```
GET  /v1/page/{title}
     Fetch a page's content and metadata.

POST /v1/page
     Create a new page.
```

**What a reader gets:** a scannable answer to *"what endpoints exist, and roughly what does each
one do?"* Every operation is addressable, so a link can point at one.

**What a reader cannot do:** make a call. There are no parameters, no indication of what comes
back, and no status codes. To actually use an endpoint they must go to the Explorer or read the
raw specification themselves.

### What "full operation detail" would add

The same entries, deepened with each operation's full description, its parameters, and its
documented responses:

```
GET  /v1/page/{title}
     Fetch a page's content and metadata. Returns the current
     revision unless a revision id is supplied.

     Parameters
       title      path,  required   Page title, percent-encoded
       redirect   query             Whether to follow redirects

     Responses
       200  Page content and metadata
       404  Page not found
```

**What this changes:** the page becomes usable on its own. A reader can construct a request
without leaving it. Across the specs there are **2.2 parameters and 2.0 documented responses per
operation** on average, so this is a real body of content, not a garnish.

**What still would not be there:** the full request and response *schemas* — the nested field
structures. Those are 83% of a specification's bytes and the least useful material for search or
for a first read, so they stay in the raw specification and the Explorer. That is a deliberate
line, not an omission.

### So the three levels are

| Level | Answers | Where it would live | State |
|---|---|---|---|
| Catalogue | What endpoints exist? | Reference pages | Prototyped and measured |
| Full detail | How do I call one? | The same pages, deepened | Designed, not prototyped |
| Complete schemas | What exactly comes back? | Raw specification and the Explorer | Specifications already committed; the Explorer is in production |

### The cost is smaller than it looks

The intuition is that full detail roughly doubles a page. **Measurement says otherwise.**
Catalogue prose is ~1.3 KB per module page; full detail takes it to ~5.9 KB. That is 4.6× the
*prose* — but page weight is dominated by the shared site frame, so on a 109 KB page it is an
increase of about **4%**.

Which means the reason to think carefully about it is **not** cost:

- **It is what makes the no-JavaScript job actually work.** At the catalogue level, a reader who
  cannot run the Explorer learns that an endpoint exists and then has nowhere to go but a raw JSON
  file. Full detail is the difference between a signpost and a usable page. Of the three jobs, this
  is the one it most clearly completes.
- **It is where long-tail search lives.** "How do I get page HTML from the Wikipedia API" matches
  parameter and description prose, not endpoint names.
- **It needs design work, and page length is the real risk.** `wikibase/v1` has **65 operations**.
  Sixty-five operations each carrying a description, two parameters and two responses is a very
  long page, and making that navigable is genuine interface work rather than a data change.

So the honest position is: **worth doing, cheap in bytes, gated on design effort and on whether
search data shows anyone looking for it** — not gated on budget.

---

## What this would cost to build properly

**Important framing about what "built" means here.** Everything described in this document was
built during the experiment, and that is where the measurements come from — they are observed,
not projected. But the experiment is a **prototype**, written to answer questions rather than to
be maintained. A production version would be built again, properly: designed interfaces,
accessibility review, tests written for maintenance rather than for proving a point, and data
generated at build time rather than served by a route that only works during a build.

So the useful question is not "how much is left?" but **"how much effort is each piece if we
build it for real?"** Rough sizes, with the convention that **S = days, M = weeks, L = a month or
more**:

| Piece | Effort to build properly | What drives the size |
|---|---|---|
| Machine-readable files | **S** | A pure transformation over data we already commit. No interface, no design, no localisation. The projection logic is the substance and it is shared with everything else. |
| Crawler instructions and sitemap | **S** | Small, well-understood artefacts. Most of the cost is deciding policy once, which this document has already done. |
| English reference pages | **M** | The data plumbing is small; the **interface** is the bulk — page design, the module index, navigation for long modules, accessibility, and the design review any public page needs. |
| Full operation detail | **M** | Parameter and response presentation, and making a 65-operation page navigable. Interface work, not data work. |
| Language multiplication | **Not costed** | Rejected — and it does not build at scale, so a size would be misleading. |

**What the experiment removes from those estimates** is the discovery risk, which is usually the
expensive part: the sizes above are for building something whose shape, cost and failure modes are
already known. The design decisions are made, the constraints are measured, and the traps are
documented. That is what the prototype bought.

Two cheap checks are recommended before publishing anything: validate the same-on-every-wiki
assumption (roughly 30 requests, described below), and — because these pages replace existing
documentation rather than supplementing it — identify any endpoint where the hand-written material
being migrated says more than the specification does.

**The recommendation therefore costs roughly S + S + M**, plus those checks: the machine-readable
files and the crawler artefacts are small and well-defined, and the pages are a genuine but
bounded interface project.

---

## The settled premise: this portal is the canonical home

**Decided, and not in question here:** the Front Door portal is *the* place for direct REST API
documentation. The material currently on mediawiki.org and scattered elsewhere in the movement
is to be migrated here. Migration will take a while, but the destination is agreed.

This settles what would otherwise be the largest open question. Adding pages here does **not**
split ranking signals between competing Wikimedia properties, because the other pages are not a
permanent parallel — they are a migration backlog. Consolidating scattered documentation into
one canonical location is precisely what search engines reward.

It has two consequences worth being explicit about.

**It strengthens the case for pages.** The duplicate-content risk was the main argument for
shipping only the machine-readable files and no pages at all. With that gone, the option of
having no addressable pages for the canonical API documentation is hard to defend.

**It raises the bar on prose quality.** A supplement may be thin; canonical documentation may
not. Twenty-one operations across two modules have **no description at all** in their
specifications, so a generated page for those is a bare list of paths. If the hand-written
material being migrated says more about those endpoints than the specification does, replacing
it with a generated page would **lose** information. That is a migration blocker for those two
modules, not merely a quality note — and it is upstream specification work, since no amount of
rendering invents prose.

**What it does not oblige is a translated static surface.** Canonical status means the API is
documented well in the languages the portal supports; the Explorer and the translatable-content
pathway are how the portal does that. It does not follow that every surface must be translated,
and the static surface is the one where translation costs the most and returns the least. This is
argued in full under *Why the static surface is English-only*.

### The check that this makes matter

**Where does hand-written endpoint documentation say more than the specification does?** Each
such case is either upstream specification work or content that must be authored here rather than
generated. Worth doing per module before the corresponding pages replace anything.

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
| **Full operation detail** | Modest — raw specs already carry it | **Long-tail queries** | **Completes it** — the only level a reader can act on | +4% page weight, plus design work |

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

### First, how the page count is even tractable

This design is affordable only because of **three structural decisions**, each of which removed a
multiplier. It is worth seeing them together, because each was a reasonable-sounding option at the
start and each could be reintroduced by a reasonable-sounding request later.

Pages required at 50 modules (~895 operations, ~31,900 wiki-and-module combinations):

| How documentation is addressed | 1 language | 15 | 50 | All 575 |
|---|---|---|---|---|
| Per **wiki**, per module, per language | 32,000 | 478,000 | **1,600,000** | **18,300,000** |
| Per module, per **operation**, per language | 895 | 13,400 | 44,750 | 515,000 |
| **Per module, per language** *(chosen)* | **50** | 750 | 2,500 | 28,750 |

**What we gave up to get to the bottom row.**

- **Documenting per wiki.** A module is deployed to roughly 840 wikis, so addressing documentation
  per wiki produces ~31,900 wiki-and-module combinations before language is even considered.
  Dropped by documenting each module **once** and listing which wikis expose it — which rests on
  the assumption that a module behaves identically everywhere, still unvalidated (see
  *uncertainties*). This single decision is a **637×** reduction.
- **A page per operation.** Each of ~895 operations could have had its own address. Dropped in
  favour of one page per module with an addressable anchor per operation — so operations are still
  linkable, just not separately indexable. An **18×** reduction, and the one real cost is that a
  module's operations compete for a single search result.

Together those took the worst case from **18.3 million pages to 28,750**, and choosing English
takes it to **50**. That is roughly a **366,000-fold** difference between the most granular
addressing and the recommendation.

### Why this matters beyond arithmetic

**Each multiplier can come back through a plausible request**, and none of them announce
themselves as scale decisions:

- *"Can we show which endpoints are available on Commons specifically?"* → reintroduces the wiki
  dimension. 637×.
- *"Each endpoint should have its own URL so it ranks on its own."* → reintroduces per-operation
  pages. 18×.
- *"Let's translate the reference."* → up to 575×.

**On the language number specifically.** This document uses 50 languages as its working figure,
but the portal formally supports far more — the generated catalogue currently holds **575**. It is
genuinely unlikely that most of them would ever have translated API specifications, and there is a
natural brake: only languages with real translation coverage would be worth publishing, and
translation coverage is the thing we would gate on.

But **the natural brake is on translations, not on configuration.** The number of published
languages is a list in a config file. Nothing about the build objects to that list growing, and
the failure mode is not a warning — it is a two-hour build producing 3.1 GB, an illegal sitemap,
and, before either of those, an out-of-memory abort. The 575-language column is not a forecast. It
is there to show that the distance between "reasonable" and "impossible" is one edit.

### Then, the measured costs

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

### D. Everything, all languages — rejected

What the experiment as built currently produces, and what the recommendation removes.

- **Cost: 2,500 pages, 276 MB, 11 minutes, 2,500 translation files** at moderate scale.
- **Why rejected:** it serves none of the surface's three jobs meaningfully better than option C
  — nothing for search discovery, actively worse for the AI corpus, and it only helps the
  narrowest case. Against that it pushes the search-engine annotation file forty times past its
  legal size limit and **exceeds the build-memory ceiling that already aborted one build**. As
  specified, it does not build.

---

## Why the static surface is English-only

This is the conclusion most likely to be challenged, so here is the full reasoning. It rests on
matching each of the surface's three jobs against what translation actually contributes.

### Job by job, what translation adds

**Search visibility: almost nothing.** Developers search for technical documentation using
English terms — endpoint names, HTTP methods and parameter names are English regardless of the
reader's language. Translated pages help someone *read*; they do very little to help someone
*find*. And publishing a variant whose content is mostly untranslated English creates
near-duplicate pages at scale, which is actively harmful for search rather than neutral filler.

**AI coverage: worse than nothing.** The machine-readable corpus is one file containing every
module and operation. Fifty translations of it add **no information** — they are the same facts
restated — while diluting the corpus and creating ambiguity about which copy is authoritative.
Assistants also translate at inference time. English-only is the better artefact here, not a
compromised one.

**Fallback for constrained clients: some, and this is the only real case.** A reader on a slow
connection who cannot run the Explorer *and* who reads a language other than English is served
by a translated static page and by nothing else. This is a genuine gap, and it is the narrowest
of the three.

### Why we still do not translate for that third case

**The Explorer is the portal's translation story, and it already works.** Language coverage for
people reading documentation is delivered by the interactive surface and the translatable-content
pathway. The static surface exists to be machine-readable and to work without JavaScript — not
to be the portal's localisation layer. Duplicating localisation into it means paying the largest
possible cost for the smallest of its three jobs.

**It is not affordable, and that is measured rather than assumed.** Translating the static
surface multiplies pages fifty-fold, grows the search-engine annotation file quadratically to
roughly 2 GB — forty times over the format's legal file-size limit — and **exceeds the build
memory ceiling that already aborted one build at 180 pages**. This is not a cost to schedule; it
is a configuration that does not currently build.

**If that narrow gap ever needs closing, the full matrix is the wrong instrument.** Cheaper
options exist and should be considered first: translating a single overview page rather than
every module page, translating summaries only, or simply letting a non-English reader fall back
to the English static page, which is what happens today. **A fifty-fold page multiplication is a
very expensive answer to a narrow need**, and the narrowness is the point.

### What canonical status does and does not oblige

Being the canonical home for REST API documentation is an obligation to **document the API well
in the languages the portal supports** — met by the Explorer and the translatable-content
pathway. It is not an obligation for **every surface** to be translated. Search engines and AI
crawlers do not read in Hebrew; they read what we publish. The static surface serves them, plus
the fallback case, and English serves all three adequately.

The honest residue: a non-English reader on a poor connection is less well served than an
English one. We are accepting that, knowingly, because closing it via the static surface costs
fifty times more than the surface itself and does not build.

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
modules are added, and the fix is small (S), well understood from the experiment, and
independent of every other decision here.
**Shipping only the crawler instructions, and nothing else, is a coherent choice.**

## How reversible is each piece?

Relevant because it determines how much a wrong decision costs.

| Piece | If we later want it gone |
|---|---|
| Machine-readable files | **Trivial.** Delete three files. Nothing links to them structurally. |
| Crawler instructions | **Trivial**, and there is no plausible reason to reverse them. |
| English reference pages | **Effectively a commitment.** Removal needs redirects for every indexed address — and as the canonical home for this documentation, there is nowhere sensible to redirect *to*. Treat this as a decision to live with rather than a reversible trial. |
| Language multiplication | **Hardest.** Every published variant is an address needing a redirect, multiplied by module count. Also the least reversible in practice: withdrawing a translation readers already have is worse than never having shipped it. |
| Full operation detail | **Trivial** — it adds content to existing pages rather than new addresses. |

Two patterns worth noting. **The cheap pieces are also the easily reversible ones**, which
argues for the staged approach independently of cost. And because this portal is the canonical
home, "publish and see" is not quite the right frame for the pages: there is no fallback
destination for the canonical documentation of an API, so publishing them is a commitment rather
than a trial. That asymmetry is a further reason not to publish the language variants — the least
reversible piece is also the least valuable.

## What the experiment paid for regardless of this decision

These are the durable output — they survive whether or not anything is built for production, and
they are what makes the effort estimates above estimates rather than guesses. **This, rather than
the code, is what a prototype is for.**

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

## What to ship, in order

**Option C, permanently English:**

1. **Machine-readable files** (S) — the corpus, index, and raw specifications. Small, no
   interface work, closes the AI gap completely, and the piece we would defend even if
   everything else were dropped.
2. **English reference pages** (M) — 50 pages at expected scale. The only way to get rankable
   addresses and a real no-JavaScript reading path. The data work is small; the interface and
   design work is the bulk of the M.
3. **Crawler instructions and sitemap** (S) — they remove a pre-existing liability (the
   Explorer's shareable links made 6,374 empty addresses valid) that is worth fixing whatever
   else is decided.
4. **Do not translate the static surface.** English only, permanently, with language coverage
   for readers delivered by the Explorer. Not a deferral — translating it serves none of the
   surface's three jobs well, and does not build at scale.
5. **Add full operation detail once the page design holds 65 operations.** It is the level at
   which a no-JavaScript reader can actually construct a call, and it costs ~4% of page weight —
   so the gate is interface work and search evidence, not cost.

Before publishing, two cheap checks: validate the same-on-every-wiki assumption (~30 requests),
and identify endpoints where the documentation being migrated says more than the specification
does, since a generated page must not lose information.

## How to decide

The choice is not really between the four options. It is between **three positions**, and each
has a clear tell.

**Position 1 — "search visibility is not worth pursuing."** Build option A only (S). **The
canonical-home decision largely removed the support for this.** Its strongest argument was the
risk of competing with Wikimedia's own existing documentation, which is now a migration backlog
rather than a permanent rival. What remains is only the belief that developers never reach API
documentation through search — a much weaker claim, and one that publishing cheaply would test
directly. Hard to defend now: it means the canonical home for REST API documentation has no
addressable pages.

**Position 2 — "English static surface, Explorer for languages."** Build option C, permanently
English. Cost is bounded and known — roughly S + S + M — it gets canonical pages existing in the shortest time, and
it assigns each need to the surface that serves it best: machines and no-JavaScript readers to
the static pages, translated reading to the Explorer. **This is our recommendation.**

**Position 3 — "translate the static surface too."** Ship option D. We would not. It serves
none of the three jobs meaningfully better — translation adds nothing to search discovery,
actively dilutes the AI corpus, and only helps the narrowest case — while multiplying pages
fifty-fold, pushing the search-engine annotation file forty times past its legal size limit,
and **exceeding a build-memory ceiling that has already aborted a build.** This is not a matter
of sequencing: as specified it does not build, and the payoff for making it build is the
smallest of the three.

**What to look at in a quarter**, if position 2 is chosen:

- Are the pages indexed, and do they appear for module-name searches?
- Is there measurable referral traffic from search?
- Do crawler logs show AI crawlers fetching the text corpus? (This also settles the
  JavaScript question.)
- Do the search terms people arrive on suggest demand for operation-level detail — and for any
  language other than English?

Those answers determine how far to take full operation detail, and whether to stop. They do not
reopen the language question — that one is settled on grounds search data cannot change. **If the
pages do not get indexed at all, that is the most valuable finding available, and it costs a
quarter of waiting rather than a quarter of building.**

## Who needs to weigh in

Not every question here belongs to the same people, and one of them blocks the others.

| Question | Belongs to | Blocking? |
|---|---|---|
| ~~Is this portal the canonical home for REST API reference?~~ | — | **Settled: yes.** No longer open |
| Publish the English pages now? | Portal roadmap owners | Yes — the main remaining decision |
| Ship the crawler instructions? | Portal roadmap owners | No — recommended regardless, and independently shippable |
| Is the Explorer's language coverage adequate for readers of the migrated docs? | Whoever owns the migration | No for the static surface, but it is where the translation obligation actually lands |
| Where does existing hand-written endpoint documentation exceed the specifications? | The migration effort | **Yes, per module** — generated pages must not lose information for those endpoints |
| Fill in the missing operation descriptions | The teams owning `readinglists/v0` and `specs/v0` | Yes for those two modules, as canonical documentation |
| Watch the build-memory ceiling as modules grow | This team | No now, but it is the constraint that fails first |
| Confirm specifications are identical across wikis | This team, ~30 requests | Recommended before publishing |

**Suggested sequence:** publish English now — it is the shortest path to canonical pages
existing, and nothing here blocks it. The migration questions (prose parity per module, whether
the Explorer's language coverage suffices for the readers being moved) can proceed alongside,
module by module, and neither gates the first publish.

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
