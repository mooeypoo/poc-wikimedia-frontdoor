# Proposal: Static, Indexable Documentation for Wikimedia REST API Modules

**Audience:** Leadership and stakeholders. This document explains the problem, why we
reached the design we did, what we measured along the way, and what we propose to try.
It contains no implementation detail — that lives in
[`adr-static-module-documentation.md`](adr-static-module-documentation.md) (decisions) and
[`plan-static-module-documentation-experiment.md`](plan-static-module-documentation-experiment.md)
(execution).

---

## Summary

Wikimedia exposes a REST API made up of discrete **modules** — `site/v1`,
`readinglists/v0`, `wikibase/v1`, and so on. Today the portal documents them through a
single interactive explorer. That explorer is good at what it does, but it is **invisible
to search engines and to AI assistants**, because it renders entirely in the browser.

We propose adding a second, complementary surface: **static, per-module documentation
pages** generated from the OpenAPI specifications we already collect. The explorer stays
exactly as it is — this adds a fast, readable, indexable path *alongside* it, not instead
of it.

We propose doing this as a staged experiment. The first stage is small (roughly 1 MB of
data, one page per module per language) and answers the question that matters: does making
these pages static actually make Wikimedia's API discoverable to the tools developers use
to find APIs?

---

## The problem: good documentation nobody can find

The API explorer is a client-side application. When any automated visitor requests an
explorer page, the server returns an essentially empty HTML shell; the real content only
appears after the browser runs JavaScript, boots the explorer, and makes two further
network requests to the wiki.

That has three consequences:

**Search engines index it unreliably.** Google does execute JavaScript, but on a deferred
second pass with a limited rendering budget. A heavy client-side application that must
fetch its content from another domain before rendering is close to the worst case.

**AI assistants very likely cannot see it at all.** The crawlers that build the corpora
behind AI coding assistants generally fetch HTML and parse it without running JavaScript.
If that holds, our API documentation is entirely absent from the tools a growing share of
developers now use as their first stop. *(This is worth re-verifying periodically — crawler
behaviour changes.)*

**There is nothing to rank.** All 10 modules and 179 operations effectively live behind
one address. A search engine cannot return "the Wikibase REST API" as a result when that
content has no address of its own.

The net effect: a developer searching for how to call a Wikimedia REST endpoint is
unlikely to be shown our documentation, however good it is.

---

## Why the obvious approach failed

The intuitive fix is to generate static pages for everything. We rejected that early,
because the page count explodes. Documentation could be addressed along three
dimensions — which wiki, which module, which language — and the wiki dimension is brutal:
Wikimedia has roughly 840 public wikis, producing **6,374 wiki-and-module combinations**
today.

| Approach | Pages today | Projected at 50 modules × 50 languages |
|---|---|---|
| One page per wiki, module and language | 6,374 × languages | **~1.6 million** |
| One page per operation and language | 8,950 | **~45,000** |
| **One page per module and language** | 500 | **2,500** |

The first is impossible. The second is painful. The third is unremarkable — comparable to
any mid-sized documentation site.

The way to reach the third row is to **drop the wiki dimension entirely**: document each
module once, and state on the page which wikis expose it. That works because a module's
capabilities come from its code, which is the same everywhere it is deployed. We are
accepting that as an assumption rather than proving it (see *Risks*).

---

## What measuring changed

Rather than design from intuition, we measured the specifications we already have
committed. Four findings changed the plan — two of them reversed an earlier conclusion.

**1. The text is far cheaper than expected.** Only **17%** of a specification's bytes are
human-readable text (summaries, descriptions, titles); the other 83% is machine-readable
schema structure. Across all 10 modules, that is 98 KB of prose inside 590 KB of JSON.

**2. Which reversed our sizing conclusion.** An early estimate put a documentation page at
~40 KB of indexable text, implying a page-count and storage ceiling that limited us to
roughly 15 languages. The measured figure is ~6 KB per module — the earlier estimate had
counted schema structure as readable text. Under the design we actually chose, storage is
about seven times smaller than projected, and the language ceiling is far higher than we
first believed. **The expensive part was never the text; it was rendering schema
structure into every page.**

**3. Specifications do not group themselves.** OpenAPI has a `tags` field intended for
subdividing large APIs. We found **8 of 10 Wikimedia modules use no tags at all**. So for
the two largest modules — `wikibase/v1` with 65 operations and the root module with 48 —
there is no ready-made way to split them into smaller pages. Any grouping would be ours to
invent.

**4. Real URL collisions exist in live data.** The `readinglists/v0` module exposes both
`/lists` and `/lists/` as *distinct* endpoints. Two of the three link-naming schemes we
evaluated silently merged them, producing four broken links. This is precisely the class of
bug that is cheap to prevent now and very expensive to fix after links are published and
indexed. We chose the scheme that survives, and we will make the generator fail loudly
rather than silently merge.

---

## What we propose: three tiers, shared addresses

We propose three complementary surfaces. Critically, **tiers 1 and 2 use the same URLs** —
they differ only in how much detail each page carries. That means we can ship the light
version first and deepen it later without ever changing or breaking a published link.

**Tier 1 — the catalogue.** One page per module per language: what the module is, which
wikis expose it, and a list of its operations with names and one-line summaries. Roughly
**64 KB of data** across 50 modules. This is the layer that makes Wikimedia's API surface
navigable and gives search engines something to rank.

**Tier 3 — machine-readable surfaces.** The specifications served at stable addresses,
plus an `llms.txt` index and a single consolidated text dump. This is nearly free — the
specifications are already collected and committed — and it is a *better* answer for AI
assistants than HTML, because they receive the whole corpus in one request rather than
crawling hundreds of pages.

**Tier 2 — full prose, later.** The same pages as tier 1, deepened with each operation's
full description, parameters and responses (about **295 KB** across 50 modules). This is
what makes on-site search genuinely useful and what lets us rank for specific developer
questions rather than only module names.

We propose **building tiers 1 and 3 first**, then deciding on tier 2 with evidence from
Search Console and analytics rather than assumption.

### Translation

We support a very large number of interface languages, and per-language specifications are
expected from MediaWiki soon. We will **not** store a full translated specification per
module per language — at 50 modules and 50 languages that is roughly 150 MB of almost
entirely duplicated structure.

Instead we store the English specification once plus a small **translation overlay** per
language containing only the translated strings — about 24 MB in total, a six-fold saving.
This also buys something a full translated file cannot express: because translations will
arrive incomplete, an overlay lets each individual string fall back to English
independently, and gives us a per-module translation coverage figure we can show to readers
and use to decide which languages are ready to publish.

This mirrors the approach already used for translatable prose content on the portal, so it
is an established pattern here rather than a new invention.

---

## What we are deliberately giving up

**Operation-level search ranking.** By putting a module's operations on one page with
in-page links, all of that module's operations compete for a single search result rather
than ranking independently. This is the direct cost of reducing 45,000 pages to 2,500, and
we think it is clearly the right trade — but it is a real cost, and it raises the
importance of the sitemap and of clean page structure.

Our own on-site search does *not* have this limitation: it indexes per section, so a search
for an endpoint returns that endpoint, not just its module.

**A third-party rendering library.** We evaluated `nuxt-openapi-docs-module`, an
off-the-shelf Nuxt library built for exactly this job, by installing it and auditing its
source against five of the portal's non-negotiable requirements. **All five fail.** It ships
its own interface text in its own 19-language catalogues, contains no bidirectional-text
isolation anywhere in its runtime (which our right-to-left languages require for every
API-sourced string), takes over routing in a way that cannot express a module name like
`site/v1`, carries a flat language list with no fallback chains, and brings its own visual
styling and a second syntax highlighter rather than the Wikimedia design system. We have hit
this before: the equivalent Scalar module was rejected for the same class of reason.

We propose using it for a **short throwaway spike** to settle what a good module page
should look like, and writing the renderer ourselves. The transformation from
specification to page is a straightforward, well-understood piece of work.

---

## Risks we are accepting, and one we are fixing

**We assume a module behaves identically on every wiki that exposes it.** This is what lets
us drop the 840-wiki dimension, and it is currently unvalidated (it is already recorded as
an open risk in our source-of-truth design). If it turns out to be false for some module,
that module's static page would be subtly wrong for the wikis where it differs. We are
proceeding on the assumption deliberately; validating it later is cheap (roughly 30 requests)
and we recommend doing so.

**Displaying "which wikis expose this" needs care.** Six of our ten modules are on 840
wikis. That cannot be a list of 840 links; it needs summarising by project family, with the
interesting cases called out — `wikibase/v1` is on just 4 wikis, `wikifunctions/v0` on 163.

**Translations can drift from the specifications they annotate.** When a specification is
regenerated, overlay entries may point at strings that no longer exist. The generator must
report these rather than silently dropping translations.

**One risk we should fix regardless of this proposal.** The explorer's shareable-link
feature made **6,374 distinct URLs** valid today — rising to roughly 32,000 as the module
count grows — every one of which currently serves the same empty shell. If crawlers
discover them, and they will once people start sharing them, that is a very large
low-quality surface pointing at our domain. This work should include the crawler
instructions and canonical-link hygiene to prevent it. That is cheap now and much harder
after those addresses are indexed.

---

## What success looks like

The experiment is worth continuing if, within a reasonable window after tiers 1 and 3 ship:

- The module pages are indexed, and appear for module-name searches.
- Referral traffic arrives at module pages from search.
- AI assistants asked about Wikimedia REST modules cite or reflect our documentation.
- On-site search returns useful module-level results.

If tier 1 pages index well and draw traffic, tier 2 is clearly justified — it is the same
pages with more content, at a well-understood cost. If they do not index at all, that is a
much more important finding than anything tier 2 would have told us, and we will have
learned it for a fraction of the effort.

---

## Cost and sequencing

The staging is deliberate: each stage is independently useful, and the cheap stages answer
the riskiest questions first.

| Stage | What it delivers | Rough scale |
|---|---|---|
| Validate assumption + spike page design | Confidence, and an agreed page layout | Small |
| Tier 3 — machine surfaces | AI and tooling discoverability | Small; specs already exist |
| Tier 1 — catalogue pages | Indexable, rankable, navigable module pages | Moderate; ~1 MB of data |
| Crawler and canonical hygiene | Removes an existing liability | Small |
| Tier 2 — full prose | Long-tail search, strong on-site search | Moderate; decided on evidence |

The two decisions we recommend locking now, because they are cheap now and expensive later,
are the **link-naming scheme** (settled: see the ADR) and **the fact that tiers 1 and 2
share addresses**. Everything else can be revisited with evidence.
