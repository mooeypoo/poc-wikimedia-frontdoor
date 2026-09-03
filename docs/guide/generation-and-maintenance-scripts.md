# Generation and maintenance scripts

The portal is fed by a handful of standalone scripts in [scripts/](../../scripts/)
that pull data and content from Wikimedia, transform it, and commit the result.
At the core are the *source-of-truth* generators: the list of wiki instances, the
language catalog with its fallback chains, and the fleet-wide map of REST API
modules. Around them sit the content importer and a few supporting tools. None of
this runs at build time or at runtime – each script is run deliberately, writes a
committed file, and is reviewed as a git diff before it lands.

This guide is for developers of the product, not just the prototype. It covers
what each script does, what you can use directly today, and what is better treated
as reference – a pattern to borrow rather than a finished artifact to depend on.
For the decisions behind each dataset, follow the linked ADRs; this document
stays at the level of shape and intent.

## What these scripts have in common

Before the individual scripts, it helps to see the shared shape. Every
source-of-truth generator in [scripts/](../../scripts/) follows the same principles,
and new ones should too.

**A maintenance tool, not a build step.** You run these deliberately, review the
diff, and commit. `npm run build` consumes whatever is already committed and
never reaches the network. This keeps builds reproducible and offline, and makes
every dataset change an explicit, reviewable event rather than an invisible
consequence of a deploy.

**Generated data and hand-authored policy are separate layers.** The generated
file carries a `GENERATED FILE – DO NOT EDIT BY HAND` header and is overwritten
wholesale on every run. Anything a human decides – a pinned fallback, a corrected
label, a curated subset – lives in a companion module that layers on top. So
[config/languages.ts](../../config/languages.ts) merges overrides onto
[config/languages.generated.ts](../../config/languages.generated.ts), and
[config/moduleSourceOfTruth.ts](../../config/moduleSourceOfTruth.ts) is an accessor
over the generated fleet and module registries. Never edit a generated file
directly; the next regeneration will silently discard the edit.

**Wikimedia API etiquette is non-negotiable.** Every script sends a descriptive
`User-Agent` identifying the portal and its repository, per the
[User-Agent policy](https://meta.wikimedia.org/wiki/User-Agent_policy). Scripts
that sweep many endpoints also honor `429 Retry-After` and bound their
concurrency. If you write a new generator, copy this behavior – it is the
difference between being a good fleet citizen and being rate-limited.

**Output is deterministic and diff-friendly.** Entries are sorted by a stable
key, object keys are sorted where order is not semantically meaningful, and
metadata (source API, generation time, counts) is recorded alongside the data.
The point is that a regeneration with no upstream change produces no diff, so a
real diff always means a real change worth reviewing.

**Absence is only ever inferred from success.** For anything swept across the
fleet, a failed fetch is never recorded as "this instance has nothing." Failures
are retried, and if still unresolved, recorded as failures in the output
metadata – distinct from a successful response that legitimately omits something.
This is the single most important correctness rule in the module sweep, and it
generalizes to any future fleet-wide collection.

## The datasets at a glance

| Dataset | Script | Generated output | Consumed through | ADR |
| --- | --- | --- | --- |
| Language catalog | [generate-language-catalog.mjs](../../scripts/generate-language-catalog.mjs) | [config/languages.generated.ts](../../config/languages.generated.ts) | [config/languages.ts](../../config/languages.ts) | [adr-language-catalog.md](../adr-language-catalog.md) |
| Wiki fleet (instances) | [generate-module-source-of-truth.mjs](../../scripts/generate-module-source-of-truth.mjs) | [config/generated/wikiInstances.generated.ts](../../config/generated/wikiInstances.generated.ts) | [config/moduleSourceOfTruth.ts](../../config/moduleSourceOfTruth.ts) | [adr-module-source-of-truth.md](../adr-module-source-of-truth.md) |
| REST API modules + specs | [generate-module-source-of-truth.mjs](../../scripts/generate-module-source-of-truth.mjs) | [config/generated/modules.generated.ts](../../config/generated/modules.generated.ts) and [config/generated/module-specs/](../../config/generated/module-specs/) | [config/moduleSourceOfTruth.ts](../../config/moduleSourceOfTruth.ts) | [adr-module-source-of-truth.md](../adr-module-source-of-truth.md) |
| Endpoint search index | [generate-module-source-of-truth.mjs](../../scripts/generate-module-source-of-truth.mjs) | [config/generated/endpointSearchIndex.generated.ts](../../config/generated/endpointSearchIndex.generated.ts) | [config/endpointSearch.ts](../../config/endpointSearch.ts) | [adr-explorer-deep-linking.md](../adr-explorer-deep-linking.md) §10 |
| Scalar interface strings | [generate-scalar-localization.mjs](../../scripts/generate-scalar-localization.mjs) | [config/generated/scalarLocalization.generated.ts](../../config/generated/scalarLocalization.generated.ts) and [i18n/explorer-scalar/](../../i18n/explorer-scalar/) | [app/scalar/scalarLocalization.ts](../../app/scalar/scalarLocalization.ts) | [adr-scalar-interface-localization.md](../adr-scalar-interface-localization.md) |

Two scripts, four datasets: the instances, the modules, and the endpoint index
all come out of the same run, because you cannot know which modules exist
without first enumerating the wikis that expose them, and you cannot index
endpoints without the specs those modules point at.

## The language catalog

[generate-language-catalog.mjs](../../scripts/generate-language-catalog.mjs) produces
the full Wikimedia language catalog – every selectable content language with its
text direction, autonym, English name, BCP 47 tag, and a resolved fallback
chain. This is the single source of truth for language direction and fallback
across the whole portal.

It joins two MediaWiki API queries on the language `code`:

- `meta=siteinfo&siprop=languages` is the *spine* – the set of selectable
  content languages.
- `meta=languageinfo` is the *enrichment* – direction, autonym, name, BCP 47,
  and the MediaWiki fallback list, fetched with continuation until exhausted.

The one piece of real logic is the fallback chain. Rather than trust the raw
MediaWiki fallbacks, the script guarantees a shape the portal can rely on: the
language itself first, then its fallbacks, then a terminal `en`, deduplicated in
order.

```
buildFallbackChain(code, mediawikiFallbacks):
    ordered  = [code, ...mediawikiFallbacks, 'en']
    return ordered with duplicates removed, keeping first occurrence

buildCatalog(spine, enrichment):
    for each language in spine:
        info = enrichment[language.code] or {}
        emit {
            code,
            dir:          info.dir == 'rtl' ? 'rtl' : 'ltr',
            fallbackChain: buildFallbackChain(code, info.fallbacks),
            autonym:      info.autonym or spine name or code,
            bcp47:        spine bcp47 or info bcp47 or code,
            name:         info.name or spine name or code
        }
    sort by code
```

After building, it warns about any fallback code that is not itself a catalog
entry. The chain still works (a missing locale is skipped), but a dangling code
signals drift worth a human glance.

You can override the source wiki with `CATALOG_WIKI_API`; it defaults to
mediawiki.org. Run it with `npm run generate-language-catalog` and review
`git diff config/languages.generated.ts`.

**Use it directly.** The generated catalog is production-shaped, and the
overrides layer in [config/languages.ts](../../config/languages.ts) is exactly where
product decisions about specific languages belong. There is nothing prototype
about this dataset.

## The wiki fleet and the module map

[generate-module-source-of-truth.mjs](../../scripts/generate-module-source-of-truth.mjs)
is the larger script. It answers two questions at once: which public, open wikis
exist, and which REST API modules each of them exposes — and then derives a
searchable endpoint index from the answers. It runs in three phases that are
independently runnable, so refreshing specs never forces a full re-sweep of the
fleet.

### Phase 1 – enumerate and sweep

```
sitematrix = fetch action=sitematrix
instances  = flatten sitematrix, keeping only public + open wikis
             (not closed, private, or fishbowl), sorted by id (dbname)

for each instance, with bounded concurrency:
    try:
        modules = fetch  <instance.baseUrl>/w/rest.php/specs/v0/discovery
        record modules under instance.id
    on failure:
        retry with backoff; honor 429 Retry-After
        if still failing: record the id as FAILED (never as "no modules")

invert (instance -> modules) into (module -> sorted instance ids)
for each module: pick a deterministic representative instance for its spec
```

This yields two generated files:

- [config/generated/wikiInstances.generated.ts](../../config/generated/wikiInstances.generated.ts)
  – the fleet registry: each instance's id, display name, base URL, direction,
  language, and family.
- [config/generated/modules.generated.ts](../../config/generated/modules.generated.ts)
  – unique modules keyed by full discovery name (for example `site/v1`), each
  carrying the sorted list of instance ids that expose it. Those ids are foreign
  keys into the fleet registry.

The representative instance is chosen deterministically: a small preference list
(mediawiki.org, English Wikipedia, Commons, Meta, Wikidata) tried in order, then
the first instance alphabetically that has the module. Determinism is what keeps
the spec files stable across runs.

### Phase 2 – capture specs

```
for each module, with bounded concurrency:
    spec = fetch module.specUrl on its representative instance
    write module-specs/<name>.generated.json  (keys sorted deeply, $refs left intact)
```

Each module's full OpenAPI spec is written verbatim under
[config/generated/module-specs/](../../config/generated/module-specs/), with `$ref`s
unresolved and object keys recursively sorted for a clean diff. `$ref`
resolution is deliberately left to consumers, since the right strategy differs
between build time and runtime.

Treat this spec capture as experimental. The committed JSON is a point-in-time
snapshot from a single representative instance, so it is best used as a
quick-reference index – powering search, listings, and metadata about which
modules and operations exist – rather than as the authoritative spec a feature
renders or validates against. For the real, current spec, resolve it live from
the instance. Depending on how the Explorer and search evolve, this phase may end
up unnecessary and could be dropped; do not build hard dependencies on the
snapshot's contents. Phase 1 (the instance and module registries) does not carry
this caveat – it is the source of truth for *which* modules exist where.

### Phase 3 – derive the endpoint search index

```
for each module that has a captured spec:
    nav = Scalar.createNavigation(documentSlug, spec)   # Scalar's own traversal
    for each operation in nav:
        record = { module, instance, method, path, summary, …, deepLink }
    write endpointSearchIndex.generated.ts
```

The last phase is purely local — it performs no network I/O and reads only what
phases 1 and 2 already committed. It produces
[config/generated/endpointSearchIndex.generated.ts](../../config/generated/endpointSearchIndex.generated.ts):
one record per REST API operation, each carrying a `deepLink` that opens the
community Explorer on that exact endpoint. This is what powers the "API
endpoints" group in the site search panel.

Two details are load-bearing and easy to break if you touch this phase:

- **The operation hash is built by Scalar's own id builders**, not by us. Scalar
  owns the URL hash in the shipping Explorer, so a deep link has to spell the
  operation the way Scalar does. The builder imports `createNavigation` from
  `@scalar/workspace-store` and `makeHrefFromId` from `@scalar/api-reference`
  rather than reproducing their slugging. If a Scalar upgrade changes the format,
  this file changes and `tests/endpointSearchIndex.test.mjs` fails — which is the
  intended alarm, not a flaky test. The Scalar version the hashes were built
  against is recorded in the file's metadata.
- **Traversal is driven by Scalar's navigation tree, not by `spec.paths`.** That
  is what keeps operations Scalar hides (`x-internal`, `x-scalar-ignore`) out of
  the index, so a search result can never link to an operation that will not
  render. The run warns when the two counts disagree.

Modules whose spec could not be captured contribute no records and are listed in
the metadata as `modulesWithoutSpec` — never silently dropped, on the same
principle phase 1 applies to failed discovery: absence of data is not evidence of
absence.

The pure builder lives in
[scripts/lib/endpointSearchIndex.mjs](../../scripts/lib/endpointSearchIndex.mjs)
so the drift test can call it directly.

### Running it

All three phases run by default:

```bash
npm run generate-module-source-of-truth   # phase 1 + 2 + 3
```

Flags and environment overrides worth knowing:

- `--skip-specs` runs phases 1 + 3; `--specs-only` runs phases 2 + 3 against the
  already-committed module registry; `--index-only` runs phase 3 alone. They are
  mutually exclusive. Note that phase 3 runs in *every* mode — the index is
  derived from both the registry and the specs, so leaving it behind would let it
  describe an older capture. It is local and cheap, so this costs nothing.
- `--index-only` is the one to reach for after a dependency bump, to see whether
  Scalar's hash format moved.
- `MODULE_SOT_LIMIT` caps the number of instances swept – essential for fast
  local iteration. A limited run is labeled `limited: true` in its metadata and
  warns loudly; never commit a limited run as the real source of truth.
- `MODULE_SOT_CONCURRENCY` sizes the worker pool (default 4).
- `SITEMATRIX_API` overrides the enumeration endpoint (default meta.wikimedia.org).

Consume the result through [config/moduleSourceOfTruth.ts](../../config/moduleSourceOfTruth.ts),
which resolves the instance-id foreign keys so callers never re-implement the
cross-file joins. Do not read the generated files directly from feature code.

## Using these directly versus as reference

The framing that matters for product developers:

**Use directly, as-is.** The two scripts and their committed outputs are ready
to depend on. The language catalog and the module/fleet registries are the real
source of truth, and their accessor and overrides layers are the intended
extension points. Regenerate, review the diff, commit – that is the whole
workflow.

**Treat as reference – the reusable patterns.** Independently of the datasets,
these scripts contain machinery worth copying into any future generator: the
bounded-concurrency worker pool, the retry-with-backoff that honors
`Retry-After`, the deep key-sorting serializer, the generated-header plus
metadata convention, and above all the failure-is-not-absence discipline. When
the portal grows a fourth source-of-truth dataset, start from these, not from a
blank file.

**Treat as reference – the curated instance subset.** Note the distinction
between the generated fleet in
[config/generated/wikiInstances.generated.ts](../../config/generated/wikiInstances.generated.ts)
(the full public, open fleet) and the small hand-curated list in
[config/instances.ts](../../config/instances.ts) that the Explorer currently drives
from. The curated list is a prototype convenience – a short, known-good set for
development. The generated fleet is the source of truth the product should
migrate toward. Reconciling the two is an open task, not a settled design (see
below).

## Content import

[fetch-remote-content.mjs](../../scripts/fetch-remote-content.mjs) is not a
source-of-truth generator, but it follows the same philosophy – a standalone
command decoupled from the build that wipes and recreates what it owns – and it
is the script that connects Wikimedia's translated documentation to the portal's
localized routing. It reads its source list from
[config/remoteContentSources.ts](../../config/remoteContentSources.ts) and handles
two strategies:

- `markdown-url` – fetch one raw Markdown file from a URL into a single locale.
- `mediawiki-translated-page` – fetch a translatable MediaWiki page *and all its
  translation subpages*, one Markdown file per locale.

The translated-page strategy is the important one. A page authored with the
Translate extension exists as a source page plus one `/<locale>` subpage per
translation. The script discovers which locales exist (and are complete enough)
from the Translate extension's `messagegroupstats`, fetches the Parsoid HTML for
each locale's subpage, converts it to MDC-compatible Markdown (see the conversion
library below), and writes it into the content tree keyed by locale:

```
discover locales:
    stats = query messagegroupstats for page-<title>
    keep locales whose translated/total >= minTranslatedPercent
    always include the source locale (en)

for each locale, with bounded concurrency:
    html = fetch Parsoid HTML for <title>/<locale>   (source locale: <title>/en or <title>)
    body = convertWikiHtmlToMarkdown(html)
    write content/<locale>/<localPath>.md
        with frontmatter: title, sourceUrl, sourceWiki, sourceRevision,
                          license, remoteImport: true
        and a CC BY-SA ::attribution footer
```

**This does plug into Nuxt's folder-based, route-based translations.** Writing to
`content/<locale>/<slug>.md` is exactly the layout Nuxt Content and
`@nuxtjs/i18n` route on – the locale folders under
[content/](../../content/) (`en`, `fr`, `he`, `pt-br`, …) are the same locale set
Nuxt i18n is configured with from `SUPPORTED_LANGUAGES`. So a translated page
fetched into `content/fr/…` is served at its `/fr/…` route and participates in
the locale switcher with no extra wiring. Missing locales fall back through the
language catalog's chain to English, the same as authored content.

The one seam to watch – and to implement against as needed – is *locale-code
reconciliation*. The script trusts the wiki's translation locale codes verbatim
and does not reconcile them against the portal's configured locale set. In
practice they align, because both are MediaWiki language codes, but nothing
enforces it: a translation in a locale the portal does not configure would land
as a file with no route to serve it, and any code that differed between the wiki
and the [language catalog](../../config/languages.ts) would misfile silently.
There is no per-locale validation or normalization step today. If the portal ever
imports from a wiki whose translation locales diverge from the catalog, that
mapping needs to be added here.

Lifecycle notes that make the output safe to commit and review:

- **Wipe then recreate.** Every run first deletes all files carrying the
  `remoteImport: true` marker, then regenerates from current config, so removed
  sources, renamed slugs, and dropped translations never leave orphans.
  Hand-authored content has no marker and is never touched.
- **Idempotent.** No wall-clock field is written, so an unchanged upstream page
  re-fetches to byte-identical output and produces no diff. Content version is
  carried by `sourceRevision`.
- **Fault-tolerant per file.** A failed fetch writes an empty placeholder (no
  stale-copy fallback) that the operator catches in the diff – do not commit
  placeholders.

For the how-to of adding sources, see
[content-import-guide.md](../content-import-guide.md); for the decisions,
[adr-remote-content-fetching.md](../adr-remote-content-fetching.md).

### The conversion library

[scripts/lib/wikiContentConversion.mjs](../../scripts/lib/wikiContentConversion.mjs)
is the dependency that does the actual HTML-to-Markdown work, exposed as
`convertWikiHtmlToMarkdown( html, options )`. It runs Parsoid HTML through the
unified/rehype/remark toolchain already present via `@nuxt/content`
(`rehype-parse` → `rehype-remark` → `remark-gfm` → `remark-stringify`) rather than
Turndown, which cannot be installed in this environment.

Its job is to reduce a full wiki page to clean, content-only MDC Markdown:

- **Strips noise** – scripts, styles, the language bar, table of contents,
  navboxes, edit-section links, and other non-content navigation.
- **Maps a conservative safe set of components** – MediaWiki/Codex message boxes
  become `::callout{type=…}`, syntax-highlighted blocks become fenced code with
  their language preserved (read from `mw-highlight-lang-*`), and registered
  shared-partial placeholders become `::partial{name=…}` directives.
- **Absolutizes links and images** against the source wiki so nothing points at a
  relative wiki path.

One deliberate boundary worth knowing: shared-partial placeholders are checked
against an allowlist (`isRegisteredSharedPartial`), and an unregistered name is
dropped with a warning. That allowlist is the security boundary – imported HTML
cannot inject an arbitrary partial. When you extend the converter, keep new
component mappings on the same conservative footing.

## Translatable prose content

The third producer of files under `content/`, alongside hand authoring and the
remote importer: short pages whose source language is authored once with
translatable segments marked inline, and whose per-locale files are generated
from banana message catalogues.

It follows the same philosophy as everything else here — a deliberate command,
committed output, wipe-and-recreate by an ownership marker, deterministic and
byte-identical on an unchanged re-run — with one difference worth knowing: it
makes **no network calls**, so the reproducibility argument that keeps the other
scripts out of the build does not apply to it. It is still a standalone command;
promoting it to a `prebuild` hook is a deliberate open decision.

It is also not a script in [scripts/](../../scripts/). The mechanism lives in
[packages/banana-content/](../../packages/banana-content/), a self-contained
workspace package, driven by
[banana-content.config.json](../../banana-content.config.json).

```bash
npm run generate-content-i18n                  # extract + generate
npm run generate-content-i18n -- --check       # validate; write nothing
npm run generate-content-i18n-stubs            # pseudo-localized demo stubs
```

See [translatable-content.md](translatable-content.md) for the model, what to use
directly versus treat as reference, and what gates a production rollout.

## Scalar interface strings

The only generator here whose upstream is a **dependency** rather than a
Wikimedia API. Scalar owns the set of interface strings its API reference can
render; we own their translations. The generator reads Scalar's built-in English
table at the installed version, derives a banana message key for each entry, and
writes the key map plus the English and `qqq` catalogues.

```bash
npm run generate-scalar-localization             # write map + en.json + qqq.json
npm run generate-scalar-localization -- --check  # exit 1 on drift; write nothing
npm run seed-scalar-localization -- --list              # locales Scalar can seed
npm run seed-scalar-localization -- ar de es fr pt ru zh-cn
```

`--check` is the part that earns its keep. Because the key set belongs to
upstream, a Scalar upgrade that *renames* a string is silent: our translation
simply stops applying, with no error anywhere. Running the check in review turns
that into a diff. Treat a Scalar version bump as a change that requires looking
at it.

The seeding script is separate and one-directional. Scalar ships MIT-licensed
community translations for seven locales, and **all seven are seeded** — not
just the portal's existing interface locales. That is deliberate: any locale we
left out is one Scalar would supply directly, bypassing banana and, for Arabic,
bypassing BiDi isolation too. Seeded catalogues are marked `@metadata.seeded`
and the script refuses to overwrite anything lacking that marker — the same
"never rewrite translator work" rule the prose generator follows. It also
refuses any code absent from the language catalog, resolved through
`config/languages.ts` rather than a list of its own. `he` and `fa` have no
upstream translation and must be authored by hand.

Both write into `i18n/explorer-scalar/`, kept apart from `i18n/*.json` so a
hundred-odd explorer-only strings do not ship in every page's bundle. See
[adr-scalar-interface-localization.md](../adr-scalar-interface-localization.md).

## Dark-mode tokens

[generate-dark-tokens.mjs](../../scripts/generate-dark-tokens.mjs) exists because
Codex ships its dark-mode token values as a Less mixin (`.cdx-mode-dark()`) under
an unscoped `:root` in the plain-CSS build – neither form can drive a first-party
runtime light/dark toggle directly. The script lifts the mixin's declarations and
rescopes them under the theme classes the shell applies to `<html>`, generating
[app/assets/css/color-modes.css](../../app/assets/css/color-modes.css). Generating
rather than hand-copying keeps the values exact against the installed Codex
version.

You do not need to understand its internals to use it: it is ready to use as-is.
Re-run it after bumping `@wikimedia/codex-design-tokens`, review the diff, and
commit:

```bash
node scripts/generate-dark-tokens.mjs
```

## Script-level tests

[test-content-fallback.mjs](../../scripts/test-content-fallback.mjs) is a small
assertion harness for the content locale-fallback logic (`npm run
test:content-fallback`). It is useful as a template for the kind of lightweight,
dependency-free test these scripts warrant.

[tests/endpointSearchIndex.test.mjs](../../tests/endpointSearchIndex.test.mjs)
(`node --test "tests/*.test.mjs"`) goes a step further and is worth copying when
a generated artifact depends on a third-party format: it re-runs the phase-3
builder against the committed specs and asserts the result is byte-identical to
the committed index. That converts "a dependency upgrade silently changed our
output" — normally invisible until a user reports a broken link — into a failing
test with a message telling you which command to run.

Note that these tests import the generated files and the leaf config modules
directly. That works only because those files are self-contained: Node cannot
resolve the extensionless relative imports the app uses. It is why
`config/scalarDocument.ts` and `config/explorerInstancePolicy.ts` exist as
separate modules that their original homes re-export — the generator and the test
need the same values the app uses, without a second copy.

## Known gaps and open questions

- **Regeneration is manual and unscheduled.** Nothing yet re-runs these scripts
  on a cadence, so the committed datasets drift from upstream until someone
  refreshes them. Whether to automate this (and how to keep the diff-review step)
  is unresolved.
- **The curated instance list and the generated fleet are not reconciled.** The
  Explorer still uses [config/instances.ts](../../config/instances.ts); the path from
  that prototype list to the generated fleet is not yet designed.
- **Captured OpenAPI specs are experimental.** The snapshotted spec JSON is a
  point-in-time capture from one representative instance, suited to search and
  metadata rather than authoritative rendering, and may be dropped entirely if
  nothing comes to depend on it. `$ref` resolution is also deferred to consumers,
  with no shared resolver yet. Resolve specs live from the instance when currency
  matters.
- **Imported translation locales are not reconciled with the configured set.**
  [fetch-remote-content.mjs](../../scripts/fetch-remote-content.mjs) writes files
  keyed by the wiki's translation locale codes without validating them against the
  portal's [language catalog](../../config/languages.ts). It works while both use
  MediaWiki codes, but there is no normalization or validation step to catch a
  divergent or unconfigured locale.
