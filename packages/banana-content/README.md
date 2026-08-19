# @wikimedia/banana-content

Generate per-locale content files from a single source file, using
[banana-i18n](https://github.com/wikimedia/banana-i18n) messages.

You author the source language **once**, marking the translatable segments
inline. This extracts them into a banana message catalogue for translators, and
expands the translations back into one output file per locale.

```
src/<path>                        source language, authored once
        │  banana-content
        ▼
messages/en.json + qqq.json       extracted for translators
messages/<locale>.json            translations come back here
        │
        ▼
out/<locale>/<path>               generated, one file per locale
```

It exists because a short, frequently-edited page translated by hand — one file
per locale — decays: editing a single sentence means editing every locale copy,
or letting them go stale. Small, discrete, documented strings are what banana
already handles well; this puts page prose on that footing.

> **Status: experimental (`0.0.0`).** Developed inside
> [wikimedia/frontdoor](https://gitlab.wikimedia.org/repos/wikimedia/frontdoor)
> as a workspace package, with exactly one consumer. It is deliberately
> self-contained so it can be lifted out into its own repository unchanged if a
> second consumer appears. Nothing under this directory imports anything outside
> it. Treat the marker syntax and the config shape as unstable until `1.0.0`.

## What it does not do

Understanding the three things this is *not* responsible for is most of
understanding what it is.

- **It does not render.** Markdown stays Markdown, JSX stays JSX. Turning the
  output into HTML is a later build step's job, and none of this library's
  business.
- **It does not parse the host format.** It performs textual substitution. It
  asks a format adapter only two questions: *where does this file's metadata
  live*, and *at this position, which characters are dangerous?* Everything else
  is format-blind — which is why it works on files it has never heard of.
- **It does not translate, and it never writes a translation.** It writes exactly
  two files into the catalogue directory — the source language and the
  documentation catalogue. Every other file there belongs to translators and is
  only ever read.
- **It does not know what languages exist.** There is no locale list and no way
  to configure one. The set of output locales *is* the set of catalogue files on
  disk. Language policy belongs to the host project.

## Install

```bash
npm install --save-dev @wikimedia/banana-content banana-i18n
```

`banana-i18n` is a peer dependency, so your project controls its version.

## Quick start

**1. Configure** — `banana-content.config.json` in your project root:

```json
{
  "format": "markdown",
  "source": { "dir": "content-i18n", "include": ["**/*.md"] },
  "messages": { "dir": "i18n/content", "sourceLocale": "en" },
  "output": { "dir": "content", "path": "%locale%/%path%" }
}
```

**2. Author** — `content-i18n/about.md`:

```md
# :message[Access open data]{#title qqq="Page H1 and page title."}

:message[Explore public data you can use in research.]{#intro qqq="Intro paragraph under the H1."}
```

**3. Run:**

```bash
npx banana-content
```

You get `i18n/content/en.json` and `qqq.json` to hand to translators, and
`content/en/about.md` with the markers expanded. Drop a translated
`i18n/content/fr.json` beside them and re-run to get `content/fr/about.md` too.

## The two marks

A marker carrying `[...]` **defines** a key and its source text, and renders in
place. One without **references** a key defined elsewhere:

```md
:message[Access open data]{#title qqq="Page H1."}     definition
:message{#title}                                      reference
```

That split is also how repeated strings work, and how text lands inside a
component attribute where a quoted definition would be unwieldy. See
[docs/syntax.md](docs/syntax.md) for the full reference.

## Configuring it

Config lives in `banana-content.config.json` (or `.mjs`/`.js`, or a
`bananaContent` key in `package.json`). Point `$schema` at the bundled schema and
your editor will autocomplete and validate every option:

```json
{
  "$schema": "./node_modules/@wikimedia/banana-content/banana-content.schema.json"
}
```

**JSON is the recommended form**, and it stays fully expressive because every
option that takes a function also takes a **module specifier** — a path to a
module whose default export is that function, resolved relative to the config
file. So you never need JavaScript config just to supply a callback:

```json
{
  "format": "./tools/my-format.mjs",
  "locales": { "fallback": "./config/localeFallbacks.mjs" }
}
```

Three options carry most of the decisions.

### `output.path` — where files land

A template, expanded per locale. Tokens are `%locale%`, `%path%` (source-relative
path with extension), `%dir%`, `%name%` (basename, no extension) and `%ext%`:

```json
"path": "%locale%/%path%"              → content/he/experiments/open-data.md
"path": "%locale%_%name%%ext%"         → content/he_open-data.md
"path": "%dir%/%name%.%locale%%ext%"   → content/experiments/open-data.he.md
```

The default suits framework conventions that route on a locale directory (Nuxt
i18n, Next.js, Astro). Empty segments collapse, so `%dir%` being empty for a file
at the source root does not leave a stray separator. `output.overrides` takes the
same tokens for per-file exceptions, and a module specifier gives full control.

### `locales` — which files get generated

**There is no locale list, and no way to configure one.** Output locales are
exactly the catalogue files in `messages.dir`. Add `fr.json` and the next run
produces French; delete it and the French output is removed. Language policy
belongs to your project, not to this tool.

What you can configure is what happens to the locales it finds:

- `locales.fallback` — the chain walked when a key is missing from a locale's own
  catalogue. Defaults to `[locale, sourceLocale]`. Supply a map or a module if
  your project has a real fallback graph, so a Catalan reader gets Spanish before
  English rather than jumping straight to English.
- `locales.minTranslatedPercent` — below this share of a file's keys, that locale
  is skipped and nothing is written. Worth setting above `0` in production:
  banana falls back per message, so a 20%-translated page renders 80% source
  language, and on a right-to-left locale that is also directionally mixed.
  Emitting nothing lets your framework's own content fallback serve a clean
  single-language page instead. `0` emits everything.

### `ownership` — how files are reclaimed

Each run deletes what it previously wrote before writing again, so a renamed or
removed source file leaves no orphan. Generated files are identified by the
**union** of two records: a manifest listing what was written, and a marker
stamped into each file's metadata. Each covers the other's failure — a deleted
manifest, or a hand-stripped marker.

Set `ownership.marker` to `false` for formats with no metadata slot (plain text),
leaving the manifest to carry it alone. Setting both to `false` disables
reclamation entirely and will accumulate orphans.

The tool refuses to overwrite any file it cannot prove it owns, so generated
output can safely share a directory with hand-authored files.

### Everything else

`source.definitionsOnly` marks files that contribute definitions but emit no
output — shared strings referenced from several pages. `keys.prefix` and
`keys.pattern` set the reserved key namespace. `marker.name` and
`marker.definitionsBlock` rename the directives, which you should only do to
resolve a collision with your host format: renaming after adoption is a breaking
change to every source file, and shared examples stop applying.

[docs/configuration.md](docs/configuration.md) is the exhaustive per-option
reference.

## Commands

```bash
banana-content                    # extract, then generate
banana-content --check            # validate and report; write nothing
banana-content --extract-only     # catalogues only
banana-content --generate-only    # output files only
banana-content --config <path>    # explicit config
```

Structural problems are **errors** — a key defined twice, a reference to nothing,
output that would clobber a file the tool does not own — and the run exits
non-zero having written nothing at all. Softer problems are **warnings** and the
run continues: a definition with no `qqq`, a translation for a key that no longer
exists, a locale skipped for falling under the threshold.

Output is deterministic: keys sorted, no timestamps, so an unchanged input
regenerates byte-identically and a real diff always means a real change. Commit
the source files, the catalogues, the generated output and the manifest together.

## Formats

| Adapter | Handles |
| :---- | :---- |
| `markdown` | YAML frontmatter, GFM tables, MDC/HTML attribute values |
| `plainText` | No envelope, no escaping contexts |

Custom adapters are a module specifier away — see [docs/formats.md](docs/formats.md).

The real constraint is not "is it Markdown" but: **any line-oriented text format
whose files can carry the marker text literally.** JSON does not qualify, because
the block forms occupy whole lines and JSON has nowhere to put them.

## Known limitations

- **JSON source files are out of scope.** The block forms occupy whole lines and
  JSON has nowhere to put a bare line. See [docs/formats.md](docs/formats.md).
- **Ownership discovery scans the whole output tree.** Finding marker-bearing
  files parses every file under `output.dir`, not just the ones this tool wrote.
  Negligible at current scale, wrong-order at large scale — see
  [docs/configuration.md](docs/configuration.md#ownership).
- **No fuzzy or stale-translation detection.** Changing the source text under a
  stable key leaves every translation of it silently stale.
- **Renaming a source file renames every key it owns**, orphaning that file's
  translations. Orphans are reported, never deleted.

## Documentation

- [docs/syntax.md](docs/syntax.md) — the marker syntax, keys, parameters, escaping
- [docs/configuration.md](docs/configuration.md) — every config option
- [docs/formats.md](docs/formats.md) — the format adapter interface

Design rationale is recorded as an ADR in the consuming project, at
`docs/adr-translatable-prose-content.md` in wikimedia/frontdoor. These documents
are reference material — *what* and *how*; the ADR carries the *why*. If this
package is ever extracted, the mechanism sections of that ADR travel with it.

## License

MIT.
