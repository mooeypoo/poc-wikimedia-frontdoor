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
- **It does not translate, and it never writes a translation.** It writes the
  source-language catalogue and the documentation catalogue. Translated files
  belong to translators and are only ever read.

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
[docs/syntax.md](docs/syntax.md).

## Formats

| Adapter | Handles |
| :---- | :---- |
| `markdown` | YAML frontmatter, GFM tables, MDC/HTML attribute values |
| `plainText` | No envelope, no escaping contexts |

Custom adapters are a module specifier away — see [docs/formats.md](docs/formats.md).

The real constraint is not "is it Markdown" but: **any line-oriented text format
whose files can carry the marker text literally.** JSON does not qualify, because
the block forms occupy whole lines and JSON has nowhere to put them.

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
