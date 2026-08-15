# Marker syntax

The complete reference for what you write in a source file.

Throughout, the marker name is shown as `message` — its default. It is
configurable (`marker.name`), so substitute your own if you changed it.

---

## The recognition rule

Read this first, because it is the guarantee that makes everything else safe:

> A marker is **only** the marker name preceded by a colon and followed
> *immediately* by `[` or `{`. Nothing else in the file belongs to this library.

So in a Markdown source file:

```md
## :message[High-volume access]{#heading-commercial qqq="H2."} {#commercial}
```

the trailing `{#commercial}` is an MDC heading id, not part of the marker — it
passes through to every locale untouched. The `{` is claimed only when it sits
directly against `:message` or against the `]` that closes `:message[…]`.

This is what lets markers be dropped into a format the library has never seen
without colliding with that format's own syntax.

To write a literal marker in prose, escape the colon: `\:message[…]`.

---

## The four forms

### Definition, inline

Declares a key, supplies its source text, and **renders in place** — the text
appears exactly where you wrote it.

```md
# :message[Access open data]{#title qqq="Page H1 and page title."}
```

Works anywhere the format allows text: headings, paragraphs, list items, table
cells, and inside quoted attribute values.

### Definition, block

For one translatable unit that spans paragraphs.

```md
::message{#intro qqq="Two-paragraph introduction. The second paragraph links to the policy; keep the link."}
All of the data linked from this page is publicly available.

You do not need an account or an API key to read it.
::
```

Opens with `::` at the start of a line and closes with a line containing only
`::`. The text is everything between, trimmed.

Do not wrap a bulleted list in one of these — mark each item separately, so
translators receive list items as list items.

### Reference

Carries only a key, and resolves to text defined elsewhere — earlier in the same
file, in another source file, or in a definitions-only file.

```md
:message{#title}
```

A reference is the compact form: no quote, no pipe, no bracket, so it drops into
an attribute value or a table cell with no escaping at all. It is also the
**reuse mechanism** — a reference without text means "use that message again."

### Definitions-only block

A region that renders nothing. Its only purpose is to move definitions off a
line that has grown unreadable.

```md
:::messages
:message[Introduction to open data]{#card-title qqq="Navigation card title."}
:message[Access publicly-available data.]{#card-description qqq="Navigation card description."}
:::
```

The block and one following blank line are removed from the output. A definition
inside it never renders in place, so it may not carry parameter values.

Configurable separately from the marker name via `marker.definitionsBlock` — the
library does not derive one from the other, because pluralising `message` into
`messages` is English morphology it has no business performing.

---

## Where to put a definition

A definition renders in place, so write it where the text belongs — in the
heading, the paragraph, the list item, the table cell, **or the attribute**:

```md
::card{url="/explorer" title=":message[Lift Wing API]{#card-title qqq='Card title; not translated.'}"}
::
```

That works. The question is only whether it leaves a line you can read.

| Situation | Do this |
| :---- | :---- |
| One short attribute | Define in place |
| Two or more attributes of real prose | Hoist into `:::messages`, leave references |
| A long `qqq` | Hoist — translator notes crowd a component line fast |

Both forms produce identical output and identical catalogues. Translators never
see the difference. It is an authoring-ergonomics judgement, not a correctness
one.

> **The one thing to avoid:** defining text in ordinary body text *and*
> referencing it from an attribute. That renders it twice — once as a stray
> paragraph, once inside the component. Define it in the attribute, or in a
> `:::messages` block. Never in body text that isn't where you want it to appear.

---

## Keys

A key is written as `#id` inside the attribute block.

**Local keys are namespaced from the source file's path.** With a `keys.prefix`
of `content-`:

```
src/experiments/open-data.md   #intro
  →  content-experiments-open-data-intro
```

**A key that already begins with the prefix is used verbatim**, and is how you
reference a definition in another file:

```md
:message{#content-shared-read-more}
```

That rule is deliberately mechanical — there is no "try local, then fall back to
global" lookup, because under such a rule a typo silently becomes a
cross-file reference to nothing.

A key must match `keys.pattern` (default `^content-[a-z0-9-]+$`) and must be
**defined exactly once** across all source files. A second definition is an
error; every other appearance must be a reference.

### Definitions-only files

A file or directory matched by `source.definitionsOnly` emits no output and
exists purely to be referenced. Its definitions **must** use fully-qualified
keys, since a path-derived namespace would be meaningless there.

---

## Parameters

banana owns the message format and the call contract. This library only
transports argument *values*: `p1`…`pN` collect in order and are passed as
positional arguments.

```md
:::messages
:message[Read more on {{BIDI:$1}}]{#content-shared-read-more qqq="Card supporting text. $1 is the destination site."}
:::

supporting-text=":message{#content-shared-read-more p1='Meta-Wiki'}"
supporting-text=":message{#content-shared-read-more p1='Wikidata'}"
```

Values are passed to banana **verbatim**. Anything that needs doing to a value
belongs in the message, where a translator can see it:

| Need | Write in the message |
| :---- | :---- |
| Isolate a value whose text direction may differ | `{{BIDI:$1}}` |
| Localise digits in a numeric value | `{{FORMATNUM:$1}}` |
| Vary wording by count | `{{PLURAL:$1|…}}` |

`{{BIDI:$1}}` matters more than it looks. A Latin-script name dropped into a
Hebrew or Arabic sentence will scramble the surrounding text without it, and it
costs nothing in the source language. Wrap any name, title, or label you
substitute.

Parameters go on **references**, never on a definition inside `:::messages` —
that definition never renders, so it has nothing to substitute into. Doing so is
an error.

Numbering must start at `p1` with no gaps.

### What the library does not author, but translators may write

Because banana owns the format, a translated string can legally contain the
whole magic-word set — including forms that make no sense in static content, or
that emit HTML into a document that isn't HTML. These are **warned about, never
rewritten**:

- `{{GENDER:…}}` resolves against a specific user; static content has none.
- `{{WIKILINK:…}}`, `{{EXTLINK:…}}`, `{{HTMLELEMENT:…}}` emit raw `<a>`/HTML, and
  `WIKILINK` builds a wiki-relative URL.

---

## Escaping

One rule governs every case, in both directions:

> The stored message is the **unescaped logical string**. Escaping belongs to the
> surrounding syntax — the source file on the way in, the generated file on the
> way out. The generator escapes per output context and never stores an escape.

So a message written in a table cell as `XML \| SQL` is stored as `XML | SQL`,
and re-escaped to `XML \| SQL` when written back into a table row — in every
locale, including translations that happen to contain a pipe.

### Writing source files

| Situation | Write |
| :---- | :---- |
| Unbalanced bracket in the text | `\[` / `\]` |
| A pipe in a table cell (Markdown) | `\|` |
| A marker nested inside an attribute | Alternate the quote style: `title=":message[Text]{#k qqq='Note.'}"` |
| A quote inside a `qqq` already using that quote | `qqq="the \"Dumps\" service"` |
| A literal marker in prose | `\:message[` |

There are only ever **two** quoting levels, because a definition's text is
delimited by brackets rather than quotes. So quotes and apostrophes in the text
itself never need escaping — `:message[A project's "best" tools]{#k}` is fine as
written, even inside an attribute. Only `qqq` and `pN` are quote-delimited, and
alternating covers them; backslash-escape only when one value needs both styles.

Balanced brackets need no escaping either, so Markdown links work as written:
`:message[See the [dumps guide](/dumps) page]{#k}`.

### Generating output

The generator escapes each substituted value for the context it lands in, as
declared by the format adapter. For `markdown`:

| Context | Escaped |
| :---- | :---- |
| Quoted attribute value | The delimiter → `&quot;` / `&#39;` |
| Table row | `\|` |
| Anything else | Nothing |

This is a correctness requirement, not a nicety: a translated string is
arbitrary text, and a translator's stray double quote would otherwise terminate
an attribute and break the page.

One consequence: **Markdown inside an attribute renders as plain text.** A
message containing a link is fine in prose and inert in `title="…"`. The run
warns when a message used in attribute position contains Markdown syntax.
