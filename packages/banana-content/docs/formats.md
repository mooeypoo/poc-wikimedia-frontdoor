# Format adapters

## Why there is a format boundary at all

This library never renders and never parses the host format. It performs textual
substitution guarded by one recognition rule (see
[syntax.md](syntax.md#the-recognition-rule)). That leaves exactly **two**
questions it cannot answer on its own:

1. **Where does this file's metadata live**, if anywhere? Markdown keeps it in
   YAML frontmatter; a plain text file has nowhere to put it.
2. **At this position, which characters are dangerous, and how do I neutralise
   them?** A value landing inside `title="…"` must not contain a bare `"`. The
   same value landing in a GFM table row must not contain a bare `|`.

A format adapter answers those two questions and nothing else. Everything else —
tokenising, key resolution, catalogue building, threshold logic, banana
rendering, wipe-and-recreate — is format-blind.

Question 2 matters more than it first appears. A translated string is **arbitrary
text supplied by someone else**. A translator's stray double quote in a card
title is not a hypothetical; without context-aware escaping it terminates an
attribute and breaks the page.

## What formats work

Any **line-oriented text format whose files can carry the marker text
literally**. That includes Markdown, MDC, HTML, JSX/TSX, Vue SFCs, CSS, plain
text, and most templating languages.

It excludes JSON, and for an instructive reason: the marker text would survive
inside a JSON string value, but the block forms (`::message{…}` … `::` and
`:::messages` … `:::`) occupy whole lines, and JSON has nowhere to put a bare
line. A format that cannot host the block forms can still work with inline
definitions and references only — but that is untested, and the library does not
claim it.

## The interface

```js
/**
 * @typedef {object} FormatAdapter
 * @property {string} name
 * @property {Envelope|null} envelope
 * @property {ContextRule[]} contexts
 * @property {(output: string) => Problem[]} [validate]
 */
```

### `envelope`

```js
/**
 * @typedef {object} Envelope
 * @property {(text: string) => { metadata: object, body: string }} parse
 * @property {(metadata: object, body: string) => string} serialize
 */
```

The envelope does two jobs: it carries a source file's metadata through to every
generated locale, and it is where the generated-file marker is stamped
(`ownership.marker`).

`null` for formats with no metadata slot. Then source files have no metadata to
pass through, and generated-file ownership rests entirely on the manifest —
set `ownership.marker` to `false`.

### `contexts`

```js
/**
 * @typedef {object} ContextRule
 * @property {string} name
 * @property {(line: string, start: number, end: number) => object|false} detect
 * @property {(value: string, match: object) => string} escape
 */
```

`detect` receives the whole line and the marker's span within it, and returns
either `false` or a match object handed back to `escape`.

**Rules compose.** Every rule whose `detect` matches has its `escape` applied, in
declared order. Order is load-bearing and the adapter owns it: `markdown` escapes
attributes before table rows, because `&quot;` contains no pipe while a naive
reverse ordering would escape the backslash it just introduced.

### `validate`

Optional. Receives the rendered output and returns problems. Use it for failures
that only a translated string can cause — not for general well-formedness, which
is the host toolchain's job.

`markdown` checks that a run of table rows agrees on cell count, which is the
signature of a translated cell carrying an unescaped pipe. It does **not** run a
Markdown parser: parsers are permissive enough that the check never fires, and it
would cost a dependency for nothing.

The core adds one check to every format: no unexpanded marker may survive into
the output.

## Built-in adapters

### `markdown`

For Markdown, GFM, and MDC.

- **Envelope:** YAML frontmatter (`---` fenced)
- **Contexts:** quoted attribute value (escapes the delimiter to `&quot;` /
  `&#39;`); table row (escapes `|` to `\|`)
- **Validate:** table cell-count consistency

### `plainText`

For files with no structure to protect.

- **Envelope:** none
- **Contexts:** none
- **Validate:** none

It exists to keep the core honest. If the core ever acquires a hidden assumption
about Markdown, `plainText` is where it shows up — an abstraction with one
implementation is a guess, not a boundary.

## Writing an adapter

```js
// tools/html-format.mjs
const ATTRIBUTE_QUOTES = new Set( [ '"', "'" ] )

export default {
	name: 'html',
	envelope: null,
	contexts: [
		{
			name: 'attribute',
			detect: ( line, start, end ) => {
				const delimiter = line[ start - 1 ]
				const isAttribute =
					ATTRIBUTE_QUOTES.has( delimiter ) &&
					line[ end ] === delimiter &&
					line[ start - 2 ] === '='
				return isAttribute ? { delimiter } : false
			},
			escape: ( value, { delimiter } ) =>
				value.replaceAll( delimiter, delimiter === '"' ? '&quot;' : '&#39;' )
		}
	]
}
```

Reference it from the config:

```json
{ "format": "./tools/html-format.mjs" }
```

### Guidance

**Escape at the boundary, never in the value.** The stored message is the
unescaped logical string; an adapter escapes on the way out and unescapes on the
way in. Storing an escaped value poisons the translator's view of the string and
leaks your escape style into every translation of it.

**Detect narrowly.** A rule that matches too eagerly corrupts text that was
fine. `markdown`'s attribute rule insists on a quote before the marker, the same
quote immediately after it, *and* an `=` before that — three conditions, so
ordinary quoted prose is never mistaken for an attribute.

**Let `validate` catch what only a translator can cause.** You control the source
file; you do not control what comes back from translation. That asymmetry is
what `validate` is for.
