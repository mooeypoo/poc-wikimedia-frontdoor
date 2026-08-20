# Static Module Documentation — Decisions, Findings and Status

**Audience:** Leadership and stakeholders. This began as a proposal; it is now the
running summary of what we decided, what we measured, what surprised us, and what remains
genuinely uncertain. It stays deliberately high level — the technical decisions live in
[`adr-static-module-documentation.md`](adr-static-module-documentation.md) and the execution
detail in
[`plan-static-module-documentation-experiment.md`](plan-static-module-documentation-experiment.md).

*(The filename still says "proposal" so that existing links keep working.)*

**Status:** Four of seven phases complete. The machine-readable surfaces for AI assistants
are built, the crawler instructions are in place, and English module pages render. Nothing is
published to the public site yet.

---

## What we set out to do

Wikimedia exposes a REST API made up of discrete **modules** — `site/v1`,
`readinglists/v0`, `wikibase/v1`, and so on. Today the portal documents them through a
single interactive explorer. The explorer is good at what it does, but it is **invisible to
search engines and to AI assistants**, because it renders entirely in the browser.

We are adding a second, complementary surface: **static, per-module documentation pages**
generated from the OpenAPI specifications we already collect. The explorer is untouched —
this adds a fast, readable, indexable path *alongside* it.

We are doing it as a staged experiment, cheapest and riskiest questions first, so that a
negative result costs days rather than months.

---

## The problem, briefly

The explorer is a client-side application. When an automated visitor requests a page, the
server returns an essentially empty shell; content appears only after the browser runs
JavaScript and makes two further requests to the wiki. Three consequences:

- **Search engines index it unreliably.** Google does run JavaScript, but on a deferred
  second pass with a limited rendering budget. A heavy client-side app that fetches content
  from another domain is close to the worst case.
- **AI assistants very likely cannot see it at all.** The crawlers behind AI coding
  assistants generally fetch HTML without running JavaScript.
- **There is nothing to rank.** All 10 modules and 179 operations effectively live behind
  one address.

A sitemap does not fix any of this. A sitemap lists addresses; it cannot put content into a
page. Pointing a crawler at a client-only route tells it exactly where to find an empty
page.

---

## The core design decision

The intuitive fix — generate static pages for everything — explodes. Documentation could be
addressed by wiki, module and language, and the wiki dimension is brutal: roughly 840 public
wikis produce **6,374 wiki-and-module combinations** today.

| Approach | Pages today | At 50 modules × 50 languages |
|---|---|---|
| Per wiki, module and language | 6,374 × languages | ~1,600,000 |
| Per operation and language | 8,950 | ~45,000 |
| **Per module and language** | 500 | **2,500** |

We **drop the wiki dimension entirely**: document each module once and state on the page
which wikis expose it. This works because a module's capabilities come from its code, which
is the same everywhere it is deployed — an assumption we are accepting rather than proving
(see *What remains uncertain*).

We also settled two things early, precisely because they are cheap now and expensive later:
the **link-naming scheme** for operations, and the fact that the light and full versions of
each page **share the same addresses**, so shipping the light version first can never
invalidate a published link.

---

## What we are building: three tiers

**Tier 1 — the catalogue.** One page per module per language: what the module is, which
wikis expose it, and its operations with names and one-line summaries. ~64 KB of data across
50 modules.

**Tier 3 — machine-readable surfaces.** The specifications at stable addresses plus a
consolidated text index for AI assistants. Nearly free, since the specifications are already
collected — and a *better* answer for AI than HTML, because they get the whole corpus in one
request instead of crawling hundreds of pages. **Built** (see *What exists today*).

**Tier 2 — full prose, later.** The same pages, deepened with each operation's description,
parameters and responses (~295 KB across 50 modules). Decided on evidence from tiers 1
and 3 rather than assumption.

### Translation

Per-language specifications are expected from MediaWiki soon. We will **not** store a full
translated specification per module per language — at 50 modules and 50 languages that is
~150 MB of almost entirely duplicated structure. Instead we store English once plus a small
**translation overlay** per language holding only the translated strings: ~24 MB, a six-fold
saving.

The overlay also buys something a full translated file cannot express. Because translations
will arrive incomplete, an overlay lets each string fall back to English *independently*, and
gives us a per-module coverage figure we can show readers and use to decide which languages
are ready to publish. This mirrors an approach already used for translatable prose on the
portal, so it is an established pattern here rather than an invention.

---

## What measuring changed

We measured rather than estimated, and it repeatedly changed the plan.

**The text is far cheaper than expected.** Only **17%** of a specification's bytes are
human-readable text; the other 83% is machine-readable structure. Across all 10 modules, 98
KB of prose inside 590 KB of data.

**That reversed our own sizing conclusion.** An early estimate put a page at ~40 KB of
indexable text, implying a ceiling of roughly 15 languages. Measured properly it is ~6 KB per
module — the earlier figure had counted machine structure as readable text. Storage is about
seven times smaller than projected and the language ceiling far higher. **The expensive part
was never the text; it was rendering structure into every page.**

**Specifications do not group themselves.** OpenAPI has a field for subdividing large APIs.
**Eight of ten Wikimedia modules do not use it**, including both large ones. Any grouping of
a 65-operation module would be ours to invent.

**Real page weight is dominated by the page frame, not the content.** Having now built and
measured actual pages: a 65-operation module renders at 132 KB against a 109 KB average —
only 21% more. Roughly 100 KB of every page is shared site frame. Cost per page is therefore
nearly **constant**, which makes forecasting reliable but sets a high floor. If output size
ever needs reducing, the lever is the site frame, not the API content.

**The full build is affordable at experiment scale, and language count is the dial.** 150
pages build in 64 seconds. Scaled to 750 pages that is ~3 minutes and ~82 MB — comfortable.
Scaled to 2,500 it is ~11 minutes and ~295 MB, which exceeds the limit we set ourselves in
advance. That is not a blocker; it means the number of *languages* is the thing we tune, which
is exactly what the translation-coverage gate already does.

---

## What surprised us

Six things we did not go looking for. Three of them changed decisions, and two were cases of
the obvious approach being quietly wrong rather than obviously wrong — which is the kind we
care most about catching.

### We found a real bug in software already in production

While settling how to name links to individual operations, we tested three naming schemes
against live data. One module, `readinglists/v0`, exposes **both `/lists` and `/lists/`** as
genuinely different endpoints — and the scheme already shipped in the explorer collapsed them
into the same link. Four endpoints were affected.

The practical effect: **a shared link to one endpoint silently opened a different one.** The
code even carried a comment calling such collisions "astronomically unlikely" while they were
already happening.

This is fixed, and the fix leaves every link that already worked byte-for-byte unchanged.
Links shared before the fix still resolve. The generator now *fails* rather than publish two
links that claim the same address.

The transferable lesson, which we have written into the engineering docs: **the existing test
proved the links were reversible, not that they were unique.** Every one of the 179 operations
passed while four pairs collided, because each bad link still resolved to *an* endpoint — just
the wrong one. Those are different properties and both need checking.

### The off-the-shelf library fails every requirement

We evaluated `nuxt-openapi-docs-module`, a Nuxt library built for exactly this job, by
installing it and auditing its source against five of the portal's non-negotiable
requirements. **All five fail**: it ships its own interface text in its own 19-language
catalogues, contains no bidirectional-text isolation anywhere (which our right-to-left
languages require for every API-sourced string), takes over routing in a way that cannot
express a module name like `site/v1`, carries a flat language list with no fallback chains,
and brings its own visual styling plus a second syntax highlighter.

We had already hit this pattern once — the equivalent Scalar module was rejected for the same
class of reason. We are writing the renderer ourselves and keeping the library only for a
short throwaway exercise to settle what a good page layout looks like.

### Tier 1 is empty for four of ten modules

The most consequential surprise, and it qualifies the "ship the light version first"
strategy.

Tier 1 shows each operation's one-line summary. But summaries are **missing unevenly**:

| Module | Operations | Has summaries | Has descriptions |
|---|---|---|---|
| `readinglists/v0` | 18 | none | **none** |
| `specs/v0` | 3 | none | **none** |
| `growthexperiments/v0` | 10 | none | yes |
| `wikifunctions/v0` | 4 | none | yes |
| `wikibase/v1` | 65 | yes | yes |

A summary-only page would render four of ten modules as a **bare list of paths with nothing
to index or rank**. We now fall back to the first sentence of the longer description where a
summary is missing, which recovers two of those modules and lifts prose coverage from 71% to
79%.

The remaining two — 21 operations — have **no prose at all in the specification**. No amount
of rendering can invent it. That is upstream work for the teams that own those modules, and
it is a real limit on what tier 1 alone can achieve for them.

### The obvious way to hide 6,374 empty pages would not have worked

The explorer's shareable-link feature made **6,374 addresses valid today** — heading for
~32,000 as modules grow — each serving the same empty shell. Getting them out of search
results is straightforward-sounding: tell crawlers not to look.

That would have failed, quietly. The standard "do not crawl" instruction prevents *crawling*,
not *indexing*: a blocked address can still be listed in search results if anything links to
it, appearing as a bare URL with no description we can correct. And these links exist
**specifically to be shared** — that is the feature's entire purpose — so inbound links from
elsewhere are the expected case, not an edge case.

Worse, the two instructions conflict. A blocked address is never fetched, so the separate
"do not index this" instruction is never read. Following the intuitive path would have left us
believing the problem was handled while the pages accumulated in search results.

We used the opposite approach: allow the crawl, and mark the pages "do not index" so the
instruction is actually seen. It costs a little crawler traffic, and it is the only thing that
works. A test now guards against a future change reintroducing the conflict.

### We nearly published subtly wrong specification files

When exposing the raw specification files for machines to consume, the first implementation
handed them through the web framework, which quietly reformatted them — stripping the
deliberate, consistent ordering that makes changes to those files reviewable, and shrinking
each by about a quarter.

Nothing would have failed. The files were still valid; they simply were not the files we
publish and review. Caught by comparing published bytes against source bytes, which is now
part of the verification.

### The portal's own documentation had quietly drifted

Incidental, but worth reporting because it is the same class of problem. Fixing an unrelated
loading error revealed a test that had **not run at all** for some time, and behind it a
guide that told authors to use a navigation menu id that no longer exists — anyone following
it would silently get no sidebar. We corrected the guide and the test. We also found a
duplicated translation key in the English interface file, which we have flagged rather than
touched.

---

## What we have built so far

| Phase | Status |
|---|---|
| Link-naming scheme, with uniqueness enforced | **Done** — including the production bug fix |
| Build-and-scale measurement | **Done** — 150 real pages built and inspected |
| Crawler instructions and sitemap | **Done** — liability removed, 150-entry sitemap |
| Machine-readable surfaces for AI | **Done** — index, full corpus, raw specifications |
| Catalogue pages, all languages | English rendering works; index page and languages outstanding |
| Measure indexing and traffic | Not started |
| Full prose | Gated on evidence |

**What exists today.** Module pages render with real content: module identity, a summarised
deployment list (never 840 links — grouped by project family, with the interesting narrow
cases named), and one addressable heading per operation. Right-to-left languages render
correctly and all interface text goes through the portal's translation system.

Alongside them, three surfaces built for machines rather than people:

- A **34 KB text file containing every module and all 179 operations**, so an AI assistant can
  read the entire API reference in a single request — no JavaScript, no crawling hundreds of
  pages. This is the most direct answer to the invisibility problem we started with.
- A short **index file** listing every module with its operation and wiki counts.
- Each module's **raw specification** at a stable address, byte-for-byte identical to the file
  we review internally, for tooling that wants the complete detail our pages deliberately
  omit.

Every one of the 179 links in the AI corpus was verified to land on a real heading on a real
page — which also confirms that pages, corpus and index all agree on how an operation is
named.

**One thing we need before publishing.** The sitemap and the AI files are lists of absolute
web addresses, so they need the site's public URL configured in the deployment environment.
Until it is set they are deliberately **skipped** rather than published with a guessed
address, because a sitemap of wrong addresses is worse than none — crawlers act on them. The
build warns when it is missing.

---

## What we are deliberately giving up

**Operation-level search ranking.** Putting a module's operations on one page means they
compete for a single search result rather than ranking independently. That is the direct cost
of reducing 45,000 pages to 2,500, and we think it is clearly the right trade — but it raises
the importance of the sitemap and of clean page structure. Our own on-site search does not
have this limitation; it indexes per section.

**Certainty that every module behaves identically everywhere.** See below.

---

## What remains uncertain

Stated plainly, because these are the things that could still change the conclusion.

**Whether a module really is identical on every wiki.** This assumption is what lets us drop
the 840-wiki dimension, and it is still unvalidated. If it is false for some module, that
module's page would be subtly wrong for the wikis where it differs. Validating it is cheap —
roughly 30 requests — and we recommend doing it.

**Whether AI crawlers really cannot run JavaScript.** This is the strongest argument for the
whole effort and we cannot verify it from inside our own infrastructure. Crawler logs after
launch are the direct test.

**Whether static pages actually get indexed.** The entire point. If they do not, that finding
matters more than anything the later phases would have told us — which is why the cheap phases
come first.

**How much prose the specifications will ever have.** 21 operations have none today. If that
does not improve upstream, those modules stay thin regardless of what we build.

**Whether the explorer's 6,374 empty addresses were already indexed.** The instructions to
keep them out of search results are now in place, and they work going forward. If any were
already listed before we acted, they will drop out as crawlers revisit — but we cannot see
how many there were, and search-console data after launch is the only way to find out.

---

## What success looks like

Within a reasonable window after the first pages and machine surfaces ship:

- Module pages are indexed and appear for module-name searches.
- Referral traffic arrives at module pages from search.
- AI assistants asked about Wikimedia REST modules cite or reflect our documentation.
- On-site search returns useful module-level results.

If the pages index well and draw traffic, the fuller version is clearly justified — it is the
same pages with more content, at a now well-understood cost. If they do not index at all, we
will have learned the most important thing for a fraction of the effort.
