# Translatable content guide

Some content pages are short, change often, and are worth translating in full.
Maintaining those by hand — one Markdown file per locale — decays predictably:
editing one English sentence means editing every locale copy, or letting the
translations quietly go stale. This guide covers the third content pathway, which
removes that choice by authoring the source language once and generating the rest.

It is one of three pathways into [content/](../../content/), and choosing between
them is a real decision:

| Pathway | Use for | Covered in |
| :---- | :---- | :---- |
| Hand-authored per locale | Long-form pages; anything where a translator needs whole-page context | [content-authoring-guide.md](../content-authoring-guide.md) |
| Imported from a wiki | Content that already lives on-wiki and is translated there | [content-import-guide.md](../content-import-guide.md) |
| **Message-driven** | Short pages that change often and are worth translating fully | this guide |

A page belongs to exactly one pathway. The tooling enforces that: each generator
refuses to overwrite a file it cannot prove it owns.

## The model

The source language is authored once, with translatable segments marked inline.
A command extracts them into a banana message catalogue for translators, and
expands returned translations into one file per locale.

```
content-i18n/<path>.md            source language, authored once
        │  npm run generate-content-i18n
        ▼
i18n/content/en.json + qqq.json   extracted; generated, never hand-edited
i18n/content/<locale>.json        translations return here; translator-owned
        ▼
content/<locale>/<path>.md        generated, marked i18nGenerated: true
```

Two marks do the work. A marker carrying `[...]` **defines** a key and its source
text, and renders in place. One without **references** a key defined elsewhere:

```md
# :message[Access open data]{#title qqq="Page H1 and page title."}

::navigation-card{url="/explorer" title=":message{#card-title}"}
::
```

That split is what makes component attributes tractable — a reference contains no
quote, pipe, or bracket, so it drops into `title="…"` safely — and it doubles as
the mechanism for repeated strings.

**Which locales get generated is a directory listing, not a configured list.** The
generator emits a file for every `i18n/content/<locale>.json` that exists. Adding
a translation is the whole act of adding a locale; there is no list to keep in
sync, and no relationship to the language catalog's several hundred entries.

## Where the boundary sits

The mechanism lives in [packages/banana-content/](../../packages/banana-content/)
as `@wikimedia/banana-content`; frontdoor drives it through
[banana-content.config.json](../../banana-content.config.json).

Nothing in the package is specific to frontdoor, Nuxt, or even Markdown. It never
renders and never parses the host format — it substitutes text, and asks a format
adapter only two questions: *where does this file's metadata live*, and *at this
position, which characters are dangerous?* Everything else is format-blind, which
is why it works on file types it has never heard of.

Language policy stays firmly on frontdoor's side. The library takes no locale
list, and the one language question it asks — what fallback chain to walk for a
locale it found on disk — frontdoor answers through
[config/contentLocaleFallbacks.mjs](../../config/contentLocaleFallbacks.mjs),
which reads [config/languages.ts](../../config/languages.ts). That means
`LANGUAGE_OVERRIDES` governs generated content exactly as it governs the
interface: one language policy, not two.

**The containment rule:** nothing under `packages/banana-content/` imports
anything outside it. Hold new work to that — it is what makes extraction into a
standalone repository a `git mv` rather than a refactor.

## Use directly versus treat as reference

**Use directly.** These are production-shaped and worth carrying forward as-is:

- The marker syntax and the definition/reference model.
- The escaping model: the stored message is the unescaped logical string, and the
  generator escapes per output context on the way out. This is a correctness
  requirement, not a nicety — a translated string is arbitrary text, and a
  translator's stray double quote would otherwise terminate an attribute and break
  the page.
- banana owning the message format while this layer only transports `p1`…`pN` as
  positional arguments. `{{BIDI:$1}}`, `{{FORMATNUM:$1}}` and `{{PLURAL:}}` belong
  in the message, where a translator can see them.
- Ownership as the union of a manifest and an in-file marker, and the refusal to
  overwrite anything unowned.
- Deriving locales from catalogue files rather than a list.
- The completeness threshold: below it, emit nothing and let content fallback
  serve a clean single-language page, rather than a page that is mostly source
  language with a few translated fragments — which for a right-to-left locale is
  also directionally mixed.

**Treat as reference.** Scaffolding, not product:

- [content-i18n/experiments/](../../content-i18n/experiments/) and the pages it
  generates. The demo page deliberately extends its source with a prose, list and
  table section so that every syntax context is exercised by something real.
- The `he` and `es` catalogues are hand-written fixtures, and the remaining
  locales are pseudo-localized stubs from
  [generate-content-stub-translations.mjs](../../scripts/generate-content-stub-translations.mjs).
  None are reviewed translations. Delete a locale's stub when a real translation
  arrives.
- The format adapter interface has two implementations (`markdown` and a
  deliberately trivial `plainText`). Two is enough to prove the boundary is real
  but not enough to know it is right; expect to adjust it when a third format
  appears.

## Taking this to production

Three things gate a production rollout, in order of how much they matter.

**1. A TranslateWiki message group for `i18n/content/`.** Until translators can
reach these catalogues, the feature's entire value proposition is unrealized —
you have a mechanism for distributing translations and no translations. Nothing
else on this list matters more. The catalogues already follow banana/TWN
conventions (`qqq` documentation, `@metadata`), so this is integration work rather
than redesign.

**2. Stale-translation detection.** Changing the source text under a stable key
leaves every translation of that key silently stale, and there is no mechanism to
notice. MediaWiki solves this with fuzzy flags; we have nothing. The sketched
approach is to store a hash of the source text per key and report translations
whose source hash has moved — cheap, and it turns a silent problem into a
reviewable one. Not designed, let alone built.

**3. A rename policy.** Keys are namespaced from the source file's path, so moving
or renaming a source file renames every key it owns and orphans that file's
translations. Orphans are reported and never deleted, so nothing is lost — but
nothing is carried over either. Until there is a rename map, treat moving a
message-driven page as a translation-losing operation, and decide deliberately
whether the product needs better than that.

Two smaller decisions worth making explicitly rather than inheriting:

- **Standalone command or build step.** Today it is a deliberate command with
  committed output, matching every other generator here. Unlike them it makes no
  network calls, so its output is a pure function of committed inputs and a
  `prebuild` hook would be defensible. It was left standalone because committed
  output works with `nuxt dev` with no extra wiring, and because the first reviews
  of a new syntax are exactly when a human should read the generated Markdown. The
  cost of changing your mind is one line; the cost is diff volume across locales.
- **Whether to extract the library.** If a second consumer appears, extraction is
  a directory move. If not, leaving it in-tree costs nothing. The decision is
  driven by consumers, not by tidiness.

If the production system consumes the package, it needs only a dependency and a
config file; see
[packages/banana-content/README.md](../../packages/banana-content/README.md) for
configuration, and reuse the marker syntax unchanged so existing source files and
translations carry over.

## Operating it

```bash
npm run generate-content-i18n                  # extract + generate
npm run generate-content-i18n -- --check       # validate; write nothing
npm run generate-content-i18n -- --extract-only
npm run test:banana-content                    # the package's test suite
```

Output is deterministic — keys sorted, no timestamps — so an unchanged input
regenerates byte-identically and a real diff always means a real change. Review
the diff and commit the source file, the catalogues, the generated pages and
`.banana-content-manifest.json` together.

Structural problems are **errors** and nothing at all is written: a key defined
twice, a reference to nothing, a table broken by an unescaped pipe, output that
would clobber a file the tool does not own. Softer problems are **warnings** and
the run continues: a definition with no `qqq`, a translation for a key that no
longer exists, a locale skipped for falling under the threshold.

**Never hand-edit a file carrying `i18nGenerated: true`** — the next run deletes
and rewrites it. Its `sourceFile` frontmatter names the file to edit instead.

## Known gaps

- No TranslateWiki group, no stale-translation detection, and no rename map — see
  above; these are the production blockers.
- Ownership discovery parses every file under the output root, not just the ones
  this tool wrote. Negligible at current scale, wrong order of growth at large
  scale. The manifest half alone is O(generated files); the fix is to narrow the
  scan rather than drop it.
- Translated headings produce translated anchors, so deep links differ per locale.
  Pre-existing for imported content; unchanged here.
- Nothing has been verified in a browser. The right-to-left rendering of the
  Hebrew page in particular deserves a look.

## Further reading

- [adr-translatable-prose-content.md](../adr-translatable-prose-content.md) — every
  decision above with its rationale, the rejected alternatives, and why the
  language catalog is deliberately not an input to generation.
- [packages/banana-content/README.md](../../packages/banana-content/README.md) —
  configuration, and the marker syntax and format adapter references.
- [content-authoring-guide.md](../content-authoring-guide.md) Part 5 — the
  authoring workflow for content maintainers.
- [language-and-internationalization.md](language-and-internationalization.md) —
  how this sits beside the two existing i18n systems.
