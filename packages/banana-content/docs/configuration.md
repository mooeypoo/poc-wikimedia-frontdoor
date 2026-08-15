# Configuration

## Where the config lives

Resolved in this order, first hit wins:

1. `--config <path>` on the command line
2. `banana-content.config.mjs`
3. `banana-content.config.js`
4. `banana-content.config.json`
5. `bananaContent` in `package.json`

**JSON is the recommended default.** It is what a content maintainer can edit
without touching JavaScript, and it gets editor autocomplete and inline
validation for free from the published schema:

```json
{
  "$schema": "./node_modules/@wikimedia/banana-content/banana-content.schema.json",
  "format": "markdown"
}
```

The JavaScript form exists for configs that want inline functions or types:

```js
import { defineConfig, markdown } from '@wikimedia/banana-content'

export default defineConfig( {
	format: markdown(),
	output: { path: ( source, locale ) => `${ locale }/${ source.name }.md` }
} )
```

### Functions in a JSON config

Every option that accepts a function also accepts a **module specifier** — a
path to a module whose default export is that function. This is what keeps JSON
fully expressive:

```json
{
  "format": "./tools/my-format.mjs",
  "locales": { "fallback": "./config/localeFallbacks.mjs" },
  "output": { "path": "./tools/outputPath.mjs" }
}
```

Paths are resolved relative to the config file. Anything not starting with `.`
or `/` is treated as a bare module name and imported as such.

Regular expressions are written as plain strings and compiled with no flags.

---

## Options

### `format`

**Type:** `string | FormatAdapter` · **Default:** `"markdown"`

The format adapter. A built-in name (`"markdown"`, `"plainText"`), a module
specifier, or — in a JS config — an adapter object. See
[formats.md](formats.md).

### `source`

| Option | Type | Default | Description |
| :---- | :---- | :---- | :---- |
| `source.dir` | `string` | *required* | Root of the source files, relative to the config file. |
| `source.include` | `string[]` | `["**/*"]` | Globs, relative to `source.dir`. |
| `source.exclude` | `string[]` | `[]` | Globs to skip entirely. |
| `source.definitionsOnly` | `string[]` | `["**/_*", "_*/**"]` | Files that contribute definitions but emit no output. Their definitions must use fully-qualified keys. |

### `messages`

| Option | Type | Default | Description |
| :---- | :---- | :---- | :---- |
| `messages.dir` | `string` | *required* | Where message catalogues live. |
| `messages.sourceLocale` | `string` | `"en"` | The language source files are authored in. Its catalogue is **generated**; never hand-edit it. |
| `messages.documentationLocale` | `string` | `"qqq"` | Filename for translator documentation. Also generated. |
| `messages.indent` | `number \| string` | `2` | JSON indentation, for matching an existing house style. |

Every other `<locale>.json` in this directory is **translator-owned** and is only
ever read. The generator will not write one.

### `output`

| Option | Type | Default | Description |
| :---- | :---- | :---- | :---- |
| `output.dir` | `string` | *required* | Root the generated files are written under. |
| `output.path` | `string \| function` | `"%locale%/%path%"` | Template, or a function receiving `(source, locale)`. |
| `output.overrides` | `object` | `{}` | Per-source-file template overrides, keyed by path relative to `source.dir`. |

**Path tokens:**

| Token | Means | For `experiments/open-data.md` |
| :---- | :---- | :---- |
| `%locale%` | Locale code | `he` |
| `%path%` | Source-relative path, extension included | `experiments/open-data.md` |
| `%dir%` | Directory portion, no trailing slash | `experiments` |
| `%name%` | Basename without extension | `open-data` |
| `%ext%` | Extension, with the dot | `.md` |

```json
"path": "%locale%/%path%"          → content/he/experiments/open-data.md
"path": "%locale%_%name%%ext%"     → content/he_open-data.md
"path": "%dir%/%name%.%locale%%ext%" → content/experiments/open-data.he.md
```

Overrides take the same tokens:

```json
"overrides": { "experiments/open-data.md": "%locale%/special/open-data.md" }
```

### `locales`

> **The library never enumerates languages.** There is no locale list, and there
> is no way to configure one. The set of output locales is exactly the set of
> catalogue files present in `messages.dir`. Add `fr.json` and the next run
> produces French output; delete it and the French output is removed. Language
> policy — which languages a project supports, what its picker offers — belongs
> to the host project and is none of this library's business.

| Option | Type | Default | Description |
| :---- | :---- | :---- | :---- |
| `locales.fallback` | `object \| function` | `[locale, sourceLocale]` | Per-locale chain walked when a key is missing from that locale's catalogue. A map, or a function/module returning a chain. |
| `locales.minTranslatedPercent` | `number` | `0` | Below this share of a file's keys, that locale is skipped for that file and nothing is written. |

The source locale is always emitted and never subject to the threshold. Its
catalogue and the documentation catalogue are the only two files the library
writes into `messages.dir`; every other one is read.

`locales.fallback` does not breach the no-language-list rule: the library never
asks "what languages exist", only "for this locale I found on disk, what chain
should I walk". The consumer answers, or takes the two-step default.

**On the threshold.** banana falls back per message, so a 20%-translated file
renders 80% source language — and for a right-to-left locale, mixed direction as
well. Emitting nothing is usually better: whatever content fallback your host
already has then serves a clean single-language file. Set it to `0` to emit
everything regardless.

**On fallback chains.** The default is a two-step chain to the source locale. If
your project has a real fallback graph — Catalan through Spanish before English,
say — supply it, because a Catalan reader is better served by Spanish than by
English:

```json
"locales": { "fallback": "./config/localeFallbacks.mjs" }
```

```js
// config/localeFallbacks.mjs
import { CATALOG } from './languages.generated.ts'
export default ( locale ) =>
	CATALOG.find( ( l ) => l.code === locale )?.fallbackChain ?? [ locale, 'en' ]
```

### `keys`

| Option | Type | Default | Description |
| :---- | :---- | :---- | :---- |
| `keys.prefix` | `string` | `"content-"` | Reserved namespace. Also the test for whether a key is a fully-qualified cross-file reference. |
| `keys.pattern` | `string` | `"^content-[a-z0-9-]+$"` | Every namespaced key must match. |
| `keys.namespace` | `function` | path-derived | Override how a local key becomes a full key. |

If you change `keys.prefix`, change `keys.pattern` to match. They are separate
options because the prefix carries semantics (cross-file reference detection)
while the pattern is validation.

### `marker`

| Option | Type | Default | Description |
| :---- | :---- | :---- | :---- |
| `marker.name` | `string` | `"message"` | The directive name: `:message[…]`, `::message{…}`. |
| `marker.definitionsBlock` | `string` | `"messages"` | The definitions-only fence: `:::messages`. |

Must match `^[a-z][a-z0-9-]*$`.

> **Change these only to resolve a collision** — for example, a host format that
> already has a component called `message`. Renaming after adoption is a
> breaking change to every source file in the project, in the same category as
> changing `keys.prefix`. It also makes shared examples and snippets stop
> applying, which is why the default is worth keeping when you can.

### `ownership`

| Option | Type | Default | Description |
| :---- | :---- | :---- | :---- |
| `ownership.manifest` | `string \| false` | `".banana-content-manifest.json"` | Path to the generated-file manifest, relative to the config file. |
| `ownership.marker` | `string \| false` | `"i18nGenerated"` | Metadata field stamped into generated files, when the format has an envelope. |

Generated files are identified by the **union** of the two: anything listed in
the manifest, plus anything carrying the in-file marker. Each covers the other's
failure — a deleted manifest, or a hand-stripped marker — and each run deletes
that union before writing.

Set `ownership.marker` to `false` for formats with no envelope; the manifest
carries it alone. Setting **both** to `false` disables wipe-and-recreate, which
means renamed or removed source files leave orphans behind. Don't.

The generator refuses to overwrite any file it cannot prove it owns, so a source
file whose output path collides with a hand-authored file is a hard error rather
than a silent deletion.

---

## A complete example

```json
{
  "$schema": "./node_modules/@wikimedia/banana-content/banana-content.schema.json",
  "format": "markdown",
  "source": {
    "dir": "content-i18n",
    "include": [ "**/*.md" ],
    "definitionsOnly": [ "_shared/**" ]
  },
  "messages": {
    "dir": "i18n/content",
    "sourceLocale": "en",
    "documentationLocale": "qqq"
  },
  "output": {
    "dir": "content",
    "path": "%locale%/%path%"
  },
  "locales": {
    "fallback": "./config/contentLocaleFallbacks.mjs",
    "minTranslatedPercent": 0
  },
  "keys": { "prefix": "content-", "pattern": "^content-[a-z0-9-]+$" },
  "marker": { "name": "message", "definitionsBlock": "messages" }
}
```

---

## Command line

```bash
banana-content                      # extract, then generate
banana-content --extract-only       # write message catalogues only
banana-content --generate-only      # write output files only
banana-content --config path.json   # explicit config
banana-content --check              # validate and report; write nothing
```

Structural problems — a key defined twice, a reference to nothing, output that
would clobber a file the generator does not own — are **errors**: the run exits
non-zero having written nothing at all. Softer problems — a definition with no
`qqq`, a translation for a key that no longer exists, a locale skipped for
falling under the threshold — are **warnings**, reported while the run continues.

Output is deterministic: keys sorted, no timestamps, so an unchanged input
regenerates byte-identically and a real diff always means a real change.
