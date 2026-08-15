# ADR: Translatable Prose Content

**Status:** Decided and implemented as an experiment. `scripts/generate-content-i18n.mjs` implements §§2–11; `content-i18n/experiments/open-data.md` is the first and only source, and the `he` / `es` message files are illustrative fixtures rather than reviewed translations (§12).
**Scope:** Short prose content pages whose English source is authored once and whose translations arrive as banana-i18n messages, expanded into per-locale Markdown by a standalone command

**Related:**
- `docs/adr-remote-content-fetching.md` — the other producer of generated content files. Both write into `content/<locale>/`; §8 below keeps their ownership markers disjoint.
- `docs/adr-language-catalog.md` — the locale set and fallback chains this generator emits against.
- `docs/guide/language-and-internationalization.md` — the two-system split (banana owns interface, per-locale Markdown owns content) that §1 amends.
- `AGENTS.md` → Absolute rules 1, 2, 6.

---

## 1. What this owns, and the boundary against Rule 1

**Decision:** This feature introduces a **third** content pathway, alongside hand-authored Markdown and remote import: prose authored once in English with translatable segments marked inline, extracted into a dedicated banana message namespace, and expanded back into per-locale Markdown files at generate time.

banana-i18n remains the **only** interface i18n system (AGENTS.md Rule 1). This ADR does not weaken that rule; it adds a **build-time-only** second use of the banana *message format* for page prose. The boundary is enforced structurally, not by convention:

- Prose messages live in `i18n/content/`, a separate directory from the interface messages in `i18n/`.
- `app/plugins/banana-i18n.ts` does **not** import `i18n/content/*`. It never will. No prose message is resolvable at runtime.
- Prose messages never render as interface chrome. Interface strings never live in `i18n/content/`.

**Context:** Existing guidance is explicit that page copy is per-locale Markdown and *not* banana-i18n — `docs/content-authoring-guide.md` says so for `::section-heading` titles, `::api-catalog-wikimedia-section` titles, and `::highlight` bodies. That guidance stands for hand-authored pages. What it does not solve is the maintenance cost of short, frequently-edited pages: an edit to one English sentence means either editing 24 locale files by hand or letting them silently rot. Those pages are exactly the shape banana already handles well — small, discrete strings with translator documentation.

**Rationale:** Keeping the two message namespaces physically separate is what makes this safe. A single merged `i18n/en.json` would be worse in two distinct ways: page prose would ship in the client JavaScript bundle for all five runtime locales despite never being read at runtime, and the Rule 1 boundary would become a naming convention rather than an import boundary.

**Consequences:**
- `docs/guide/language-and-internationalization.md` gains a third row: prose content pages → banana message format, build time only.
- Choosing between hand-authored and message-driven prose becomes an authoring decision per page. Guidance: message-driven suits short pages that change often and are worth translating fully; hand-authored suits long-form pages and anything where a translator needs whole-page context.
- No page may be both. A path is owned by exactly one pathway (§8).

---

## 2. Base files live in `content-i18n/`, mirroring the content tree without the locale segment

**Decision:** English source files live in `content-i18n/`, at the repository root, laid out exactly like `content/<locale>/` but without the locale folder:

```
content-i18n/experiments/open-data.md   →  content/en/experiments/open-data.md
                                           content/he/experiments/open-data.md
                                           content/es/experiments/open-data.md
                                           …
```

A base file or directory whose name begins with `_` emits **no page** and contributes definitions only (§7). `content-i18n/_shared/common.md` is the cross-page definitions file.

**Rationale:** The base file is locale-agnostic — it is the English source *and* the structure for every locale — so a locale segment in its path would be meaningless. Mirroring the rest of the path means the output location is derivable from the input location with no config table, and the slug is obvious from the filename, matching the mental model already documented in `docs/content-authoring-guide.md`.

`content-i18n/` sits outside `content/`, so the Nuxt Content collection (`source: '**'`, rooted at `content/`) does not ingest base files. **Verify at implementation:** confirm base files do not appear in the content collection and do not trigger content-DB rebuilds on edit.

**Consequences:**
- `_`-prefixed exclusion mirrors the existing `content/_partials/` convention.
- The demo lands at `content-i18n/experiments/open-data.md` → `/experiments/open-data`, `/he/experiments/open-data`. It collides with nothing and is in no menu.

---

## 3. Marker syntax: definitions carry text, references carry only a key

**Decision:** Two forms, one directive name.

**Definition — inline.** Declares a key and its English source, and renders in place:

```md
# :message[Access open data]{#title qqq="Page H1 — the page title."}

:message[Explore public data that you can use in research and machine learning.]{#intro qqq="Single-sentence intro paragraph under the H1."}
```

**Definition — block.** For a multi-paragraph unit:

```md
::message{#overview qqq="Two-paragraph overview of what open data covers."}
First paragraph of English Markdown.

Second paragraph.
::
```

**Reference.** No `[...]`, no `qqq` — resolves a key defined elsewhere:

```md
:message{#title}
```

**Definitions-only block.** An *optional* region that renders nothing, for lifting definitions out of a component block that has become unreadable. Placed adjacent to the component it serves; stripped from the generated output:

```md
:::messages
:message[Introduction to Wikimedia open data]{#card-intro-title qqq="Navigation card title; links to Research:Data on Meta-Wiki."}
:::
```

**Context:** Option A — English lives in the body — was chosen so that English edits are reviewed as prose diffs and `i18n/content/en.json` becomes a pure artifact that is never hand-edited. That works directly for prose, headings, list items, and table cells. Component attributes are the awkward case: the demo page is the extreme, with 21 of its 26 translatable strings sitting in `::navigation-card` attributes.

**Rationale:** Splitting definition from reference is what makes attributes tractable without a second syntax family. A bare reference contains only `:message{#key}` — no quote, no pipe, no bracket — so it is safe inside a double-quoted attribute *and* inside a table cell, with no escaping whatsoever.

A definition may **also** be written directly inside an attribute value. The English text is bracket-delimited, so it may contain quotes and apostrophes freely; only `qqq` is quote-delimited, giving two nesting levels that alternating quote styles resolve (§5):

```md
title=":message[Lift Wing API]{#card-liftwing-title qqq='Card title; proper name, not translated.'}"
```

Which of the two to use is a **readability judgement, not a correctness one** — see §3.1.

A *parameterized* reference is the one case that does carry a quote. Nest it with the alternate quote style rather than backslash-escaping:

```md
supporting-text=":message{#content-shared-read-more-on p1='Meta-Wiki'}"
```

The same reference form is the **repeat mechanism** (§7): a reference without text means "reuse this message," whether the definition is earlier in the same file, in another base file, or in `_shared/`.

### 3.1 When to use `:::messages`

A recurring question, since definitions appear both inside and outside the block.

**`:::messages` is optional.** It is a region that renders nothing, and its only job is to move a definition off a line that has become unreadable. It is not a category, not a required home for attribute-bound strings, and not "where definitions go" — most definitions in the demo page sit outside it.

An earlier revision of this ADR claimed that attribute-bound text "has no body position" and therefore *required* a non-rendering home. That was wrong, and worth recording as wrong because it is an easy thing to re-derive: an attribute **is** a position a definition can render into, verified end to end — parsing, extraction, and `&quot;` escaping on output. It is merely an awkward place to *write* one. The rule is about ergonomics, not capability.

The governing property is still that **a definition renders in place**, so the first question is unchanged: *should this English text appear right here, at this spot, in the output?* For a heading, a paragraph, a list item, a table cell, or a component attribute, the answer is yes, and the definition goes there. The second question is the new one:

> Does putting it there leave a line I can still read?

- **Yes → define it in place.** The demo page's Lift Wing card does this: one card, short title, short description, no block, no indirection.
- **No → hoist it into a `:::messages` block** immediately above the component, leaving references behind.

The threshold is reached quickly. A three-attribute navigation card with full definitions and `qqq` runs to several hundred characters on one line, and the `url` — the thing that makes it a card — is buried in the middle of two English sentences and two translator notes. The demo page's first grid is three such cards, so its definitions are hoisted; a reader then sees structure on the card lines and prose above them.

Two secondary reasons pull the same way at density. `qqq` addresses translators, not readers of the page, and inlining interleaves the two audiences on one line. And hoisting gives every attribute a uniform shape — always a reference — so cards look alike whether their copy is new or reused.

**None of this reaches translators.** They receive `en.json` and `qqq.json`, which are byte-identical either way. This is purely an authoring-ergonomics decision, which is why it is a judgement rather than a rule.

One hazard the block does not cause but can be confused with: defining text in the **body** and referencing it from an attribute renders it twice — once as a stray paragraph, once inside the component. That is a consequence of choosing a body position for text that belongs in the attribute, and defining in the attribute directly avoids it entirely.

`content-i18n/_shared/` is the one place a definitions-only region is *required* rather than chosen: those strings have no use site in that file at all, only references from other pages.

**Consequences:**
- `:message` is not a registered MDC component. An unexpanded marker leaking into `content/` renders as an unknown element rather than corrupting the page — a visible failure, which is the preferred failure. §11 validation makes leakage an error regardless.
- Block definitions should wrap a single multi-paragraph unit. Do not wrap a list in one block definition; mark each list item separately, so translators receive list items as list items.

---

## 4. Parameters: banana owns the semantics; `p1`…`pN` is transport only

**Decision:** banana-i18n defines the message format and the call contract. This layer defines **only** how a text file declares argument *values*, and does nothing else.

- **banana's job — the message format.** Everything inside a message value: `$1`…`$n`, and the magic words its emitter implements — `PLURAL`, `GENDER`, `GRAMMAR`, `BIDI`, `FORMATNUM`, `WIKILINK`, `EXTLINK`, `HTMLELEMENT`, `HTMLATTRIBUTES` (`node_modules/banana-i18n/src/emitter.js`).
- **banana's job — the call contract.** `i18n( key, ...parameters )` — plain positional variadic (`src/index.js`). An out-of-range `$n` renders as the literal `$n`.
- **This layer's job — transport.** `p1`…`pN` on a marker collect into an ordered array passed as those variadic arguments. `p1` → argument 1. That is the whole of it.

```md
:message[Read more on $1]{#content-shared-read-more-on qqq="Supporting text on a navigation card. $1 is the name of the destination site."}

:message{#content-shared-read-more-on p1="Meta-Wiki"}
:message{#content-shared-read-more-on p1="Wikidata"}
```

A definition inside a `:::messages` block never renders in place, so it carries no parameter values — `p1`…`pN` belong on the references. A parameter attribute on a non-rendering definition is an error (§11).

**Context:** The original sketch used a positional form, `::message{'key', 'hello', 'world'}`, echoing wikitext's `{{int:key|a|b}}`.

**Rationale for the deviation:** Numbered attributes keep the marker valid MDC-shaped syntax (`p1` is a legal attribute name; `'key', 'hello'` is not an attribute list), and they remove all separator ambiguity — a positional comma list cannot carry a value containing a comma, and a pipe separator collides with GFM table rows. `p1="…"` values may contain commas, pipes, and quotes under §5's escaping. This is a difference in *how values are written down*, not in what they mean.

**The generator never preprocesses a parameter value.** It passes each value to banana verbatim and lets the message decide what happens to it. Three of banana's magic words are the reason this matters, and each replaces something this layer might otherwise have been tempted to do itself:

| Need | banana's mechanism, used in the message | Not our job |
| :---- | :---- | :---- |
| Isolate a param whose direction may differ | `{{BIDI:$1}}` | Generator-side FSI/PDI wrapping |
| Localize digits in a numeric param | `{{FORMATNUM:$1}}` | Generator-side number formatting |
| Vary wording by count | `{{PLURAL:$1|…}}` | Anything |

`{{BIDI:$1}}` is the correction that matters most. It detects the argument's first strong directional codepoint and wraps in LRE/RLE…PDF, or leaves it untouched when the argument has no strong directionality. Wrapping in the generator instead would double-wrap whenever a message already used it, and would take a per-message decision away from the place a translator can see it. Note the deliberate divergence from `docs/guide/language-and-internationalization.md`, which prescribes FSI/PDI for banana parameter contexts: banana uses embedding codepoints instead, and its own source comment explains why — there is no embedding equivalent of FSI, which it judges "cleaner but still not widely supported." Follow banana here; the guide's intent is satisfied.

**What we do not author, and what a translator may still write.** Because banana owns the format, translated strings can legally contain the full magic-word set — including forms that make no sense in static content or that emit HTML rather than Markdown. These are warned about (§11), never rewritten:

- **GENDER** resolves against a specific user, and a static page has no user. Not authored in English; a translation using it would resolve against whatever `p1` happens to be.
- **WIKILINK / EXTLINK / HTMLELEMENT** emit raw `<a href="…">` / HTML into what is otherwise a Markdown document, and `WIKILINK` builds a wiki-relative `./Page` URL that is meaningless off-wiki. Write Markdown links in the message text instead.
- **PLURAL, GRAMMAR, BIDI, FORMATNUM** are all welcome. English authors none of them here today; that is a property of this page's copy, not a restriction.

**Consequences:**
- Message expansion goes through banana proper, never naive `$n` string replacement. A translator may reorder `$1`/`$2` freely — which is the entire reason to parameterize rather than concatenate.
- A literal `$1`–`$9` in English text has no escape; banana will substitute it if that argument exists. Avoid literal `$n` in prose.
- A message using `{{BIDI:$1}}` emits invisible U+202A/U+202B…U+202C control characters around the argument, in **every** locale including English. This is correct output, not noise; expect it in diffs.
- **Verify at implementation:** confirm banana's `WIKILINK`/`EXTLINK`/`HTMLELEMENT` output is only reachable via translated strings and not by anything the extractor emits, so the §11 warning is the only path that needs to catch it.

---

## 5. Escaping: escapes belong to the file syntax, never to the message value

**Decision:** One rule governs every escaping question, in both directions:

> The stored message value is the **unescaped logical string**. Escaping is a property of the surrounding syntax — the base file on the way in, the generated file on the way out. The generator escapes per output context; it never stores an escape.

**In a definition's text span (`[...]`):** bracket matching is nesting-aware, so Markdown links need no escaping — `:message[See the [dumps guide](/dumps) page]{#key}` stores `See the [dumps guide](/dumps) page`. An unbalanced bracket is escaped `\[` / `\]`. `\\` is a literal backslash.

**In an attribute value (`qqq`, `p1`…):** either quote style may delimit, and the delimiter is backslash-escaped — `qqq="Refers to the \"EventStreams\" service."`.

**In a marker nested inside an attribute value:** use the alternate quote style for the inner attributes — whether that is a reference's parameter or a definition's `qqq`:

```md
supporting-text=":message{#content-shared-read-more-on p1='Meta-Wiki'}"
title=":message[Lift Wing API]{#card-liftwing-title qqq='Card title; not translated.'}"
```

There are only ever **two** quoting levels, because a definition's English text is delimited by brackets rather than quotes and so may contain `"` and `'` freely. Alternating therefore always suffices, except when a single `qqq` needs both quote styles — then backslash-escape the delimiter (`qqq='It\'s the card title.'`), which round-trips to a clean value.

**A literal `:message[` in base-file prose:** `\:message[`.

**On the way out — context-aware substitution.** This is a correctness requirement, not a convenience, because a translated string is arbitrary text we do not control:

| Output context | Generator escapes |
| :---- | :---- |
| MDC attribute value (`title=":message{#k}"`) | `"` → `&quot;` |
| GFM table cell | `\|` |
| Plain prose, heading, list item | nothing |

A reference substituted into `title="…"` whose Hebrew translation happens to contain a double quote would otherwise terminate the attribute and break the page. The generator knows the context — it can see the delimiter it is substituting inside — so this is decidable, not guesswork.

**Rationale:** The alternative — storing escaped values in `en.json` — poisons the translator's view of the string and makes the escape style leak into every translation. Keeping escapes at the syntax boundary means a message defined in a table cell and referenced in an attribute stores one clean value and is escaped differently at each of its two use sites.

**Consequences:**
- Round-trip is only guaranteed for the logical value, not byte-for-byte for the escape style. Re-running the generator after hand-normalizing an escape in a base file produces no `en.json` diff. That is the intended behavior.
- **Markdown in attribute position does not render.** A message containing a link is fine in prose and inert inside `title="…"`. §11 warns when a message used in attribute position contains Markdown syntax.

---

## 6. Key naming: derived from the file path, with fully-qualified cross-file references

**Decision:** A local key is namespaced from the base file's path. Path relative to `content-i18n/`, extension dropped, `/` replaced with `-`, prefixed `content-`:

```
content-i18n/experiments/open-data.md   #intro
  →  content-experiments-open-data-intro
```

A key that already begins with `content-` is used **verbatim** and is a cross-file reference. Local keys may never begin with `content-`. Keys match `^content-[a-z0-9-]+$`.

`index.md` keeps its `index` segment (`content-experiments-index-title`) — dropping it would collide with the parent section's own page.

**Rationale:** Path derivation makes cross-file collision impossible by construction and removes the repetition of writing the page prefix on every marker. The "starts with `content-`" test gives an unambiguous, checkable local-vs-global rule with no lookup order and no magic — the alternative, resolving locally then falling back to global, makes a typo silently become a cross-file reference to nothing.

**Consequences:**
- Renaming or moving a base file renames every one of its keys, orphaning every translation of that page. This is the sharpest edge in the design. §13 records it as a known gap; treat moving a message-driven page as a translation-losing operation until there is a rename map.
- `_shared/` definitions must be authored fully-qualified (`#content-shared-read-more-meta`), since a path-derived `content-shared-common-*` prefix would be noise.

---

## 7. Message namespace, and how repeats work

**Decision:** Prose messages live in `i18n/content/`:

```
i18n/content/en.json     generated — English source, extracted from base files
i18n/content/qqq.json    generated — translator documentation
i18n/content/he.json     translator-owned — never written by the generator
i18n/content/es.json     translator-owned
```

A key is **defined exactly once** across all base files. Every other appearance is a reference. Referencing an undefined key is an error; defining a key twice is an error.

Three kinds of reuse, all the same syntax:

1. **Within a page** — the demo page's card 3 and card 6 share an identical description. Define at card 3, reference at card 6.
2. **Across pages** — define in `content-i18n/_shared/common.md`, reference by fully-qualified key.
3. **Parameterized reuse** — one definition of `Read more on $1`, referenced with `p1="Meta-Wiki"` / `p1="Wikidata"` / `p1="Wikimedia Enterprise"`. Three near-duplicate strings collapse to one translatable message.

**Rationale:** "Reuse" needs no dedicated syntax because a reference already means exactly that. Enforcing single-definition is what makes it trustworthy: without it, two definitions of the same key in different files would make the extracted English depend on file traversal order, and a translator would be documenting one string while the page renders another.

**Consequences:**
- `i18n/content/en.json` and `qqq.json` carry the `GENERATED FILE – DO NOT EDIT BY HAND` header used by the other generators, and are overwritten wholesale.
- The generator **never** writes a translated file. Translator work is not ours to rewrite.
- How translations arrive is unresolved (§13). There is no TranslateWiki message group for this namespace yet.

---

## 8. Ownership and lifecycle: wipe-and-recreate by `i18nGenerated`

**Decision:** Every generated content file carries frontmatter:

```yaml
---
i18nGenerated: true
sourceFile: content-i18n/experiments/open-data.md
---
```

Each run first deletes every file under `content/` carrying `i18nGenerated: true`, then recreates from current base files. Base-file frontmatter is passed through onto every locale's output, with the marker fields added.

**Rationale:** Identical to the imported-content lifecycle in `docs/adr-remote-content-fetching.md` §10, for identical reasons: a deleted base file, a renamed slug, or a locale that dropped below the threshold leaves no orphan. Frontmatter passthrough is what lets a base file set `sidebar`, `status`, `prev`/`next` once for all locales.

The marker is **standalone** — not a variant of `remoteImport`. The two generators' wipe passes must be disjoint sets, so a file is owned by exactly one of them. A file carrying both markers is a bug in whichever generator wrote it second; §11 makes it an error.

**Consequences:**
- Hand-authored content, which carries no marker, is never touched by either generator.
- Output is deterministic and diff-friendly: sorted keys, no wall-clock field, byte-identical on an unchanged re-run. A real diff always means a real change.
- Never hand-edit a file carrying `i18nGenerated: true` — the next run discards the edit. Edit the base file.

---

## 9. Locale selection: a content-specific translation threshold

**Decision:** A dedicated translation threshold, independent of the remote-import threshold. English is always emitted. Every other locale is emitted only if its share of the page's keys present in `i18n/content/<locale>.json` meets the threshold. Below it, no file is written and Nuxt content fallback serves English.

Set to `0`, every locale with a message file gets a page.

**Which locales exist is not a decision at all — it is a directory listing.** The generator writes exactly two files into `i18n/content/`, `en.json` and `qqq.json`; every other `<locale>.json` there is translator-owned and only ever read. The set of locales it generates pages for *is* the set of those files. There is no locale list to keep in sync, and adding a translation is the whole act of adding a locale.

This is why the language catalog (`config/languages.ts`) is not an input to generation. Frontdoor's catalog governs routing, direction, and the picker; it says nothing about which pages have been translated, and conflating the two would mean either generating empty pages for hundreds of catalog languages or maintaining a second list beside the files themselves. The one place catalog knowledge is genuinely useful is resolving a fallback *chain* for a locale already found on disk, which frontdoor supplies to the generator rather than the generator going looking for it (§10.1).

**Rationale:** banana's per-message fallback means a 20%-translated page renders 80% English. For `he` and `fa` that is also a directionally mixed page. Emitting nothing is better: the fallback chain then serves a clean, coherent English page, which is the documented graceful behavior. The threshold is per-page, not per-locale-overall, because coverage is uneven across pages.

A separate knob from remote import is deliberate — imported wiki pages and authored prose pages have different completeness economics, and coupling them would mean one cannot be tuned without moving the other.

**Consequences:**
- Threshold is measured against keys **used by that page**, including any `_shared/` keys it references.
- Raising the threshold silently removes locale files on the next run. Expected, and visible in the diff.
- Set it to `0` for the experiment so every available translation is exercised.

---

## 10. A standalone command, not a build step

**Decision:** `npm run generate-content-i18n`, run deliberately, output committed and reviewed as a git diff. Two phases, either runnable alone via `--extract-only` / `--generate-only`, mirroring the `--skip-specs` / `--specs-only` convention in `generate-module-source-of-truth`.

**Context:** The stated principle in `docs/guide/generation-and-maintenance-scripts.md` is that these scripts are maintenance tools, never build steps, because `npm run build` must be reproducible and offline.

**Rationale:** This generator is unlike the others in one respect worth recording: it makes **no network calls**. Its output is a pure function of committed inputs, so the reproducibility argument that rules out build-time fetching does not rule out build-time expansion here. A `prebuild` hook would be defensible.

We are not doing that yet, for two reasons. Committed output works with `nuxt dev` with zero additional wiring — no content-DB invalidation question, no dev/build divergence. And the first reviews of a new syntax are exactly when a human should be reading the generated Markdown. Revisit once the syntax has stopped moving; the cost of adding a `prebuild` hook later is one line.

**Consequences:**
- Generated content for N pages × up to 24 locales is committed. Diff volume is the accepted cost of reviewability, and is what would motivate revisiting the hook.
- Editing a base file has no effect until the command is re-run. This must be prominent in the authoring guide.

---

### 10.1 Packaged as `@wikimedia/banana-content`, kept in-tree

**Decision:** The mechanism lives in a workspace package at
`packages/banana-content/`, published nowhere and consumed only by this project.
Frontdoor drives it through a `banana-content.config.json` at the repository
root. This ADR remains the authoritative design record; the package carries
*reference* documentation only.

**Context:** Nothing in §§3–7 or §11 is specific to frontdoor, to Nuxt, or even
to Markdown. The generator never renders and never parses the host format — it
substitutes text, and asks a format adapter only two questions: where a file's
metadata lives, and which characters are dangerous at a given position.
Everything else is format-blind. That made a library boundary available, so the
question was whether taking it is worth anything.

**Rationale:** Extracting a library from a single consumer is the standard way
to buy a guessed abstraction and pay for it forever. Two things make it
defensible here, and one rule contains the risk.

The mechanism is genuinely general, and the extraction is mostly mechanical
because the script is already layered (tokenise → resolve → catalogue → render →
validate). And a package boundary buys something the script never had: real
tests, with fixtures, over the edge cases we found by hand.

The containment rule is that **nothing under `packages/banana-content/` may
import anything outside it** — not `config/`, not `content-i18n/`, not frontdoor
fixtures. If that holds, extraction into its own repository is `git mv` and
nothing else.

The sharpest test of that rule is languages, because it is the one place the
library could plausibly have reached into `config/languages.ts`. It does not, and
cannot: the library takes **no locale list** and derives its output locales from
the catalogue files on disk (§9). Language policy stays entirely on the frontdoor
side of the boundary. Where a fallback chain is genuinely needed, frontdoor
supplies a resolver through config — the library asks "what chain for this
locale", never "what languages exist". Two format adapters ship in the first version, `markdown` and a
trivial `plainText`, because an abstraction with one implementation is a guess
rather than a boundary — `plainText` exists to fail loudly if the core retains a
hidden assumption about Markdown.

**Consequences:**
- `config/contentI18n.ts` and `scripts/generate-content-i18n.mjs` are replaced by
  a config file and a dependency. The gate on that swap is a **byte-identical
  diff** of the committed pages and message catalogues: the generated output must
  not change at all.
- This ADR stays here rather than moving into the package. Frontdoor is the
  primary requirement; the packaging is preparation in case a second consumer
  appears. If one does, the mechanism sections travel with the package and this
  ADR keeps the adoption decisions (§§1, 2, 9, 10, 12).
- The package documents *what and how*; this ADR documents *why*. Duplicating
  rationale into the package would guarantee the two drift.
- Publishing under the `@wikimedia` npm scope is an org-permissions question with
  its own lead time, and is not on the critical path — the package is
  `private: true` and consumed through the workspace until then.

---

## 11. Validation

**Decision:** The command fails loudly on structural errors and warns on drift.

**Errors** — non-zero exit, nothing written:
- Key does not match `^content-[a-z0-9-]+$`.
- A key defined more than once across all base files.
- A reference to an undefined key.
- A definition in a `_`-prefixed file whose key is not fully qualified — that file emits no page, so its definitions exist only to be referenced from elsewhere (§6). The path-derived prefix is meaningless there, so the key-pattern error is suppressed in favour of this one.
- A parameter attribute (`p1`…`pN`) on a definition inside a `:::messages` block, which never renders in place (§4).
- Malformed marker syntax: an unbalanced text span, an unterminated `{ }` or `:::messages` block, an unquoted attribute value, an unknown attribute, or parameters not numbered from `p1` without gaps.
- Generated Markdown does not parse, contains an unexpanded `:message` marker, or contains a table whose rows disagree on cell count — the signature of a translated cell with an unescaped pipe (§5).
- A generated file would carry both `i18nGenerated` and `remoteImport`.
- A generated file would overwrite a hand-authored file — one carrying no generator marker (§1: a path is owned by exactly one pathway).

**Warnings** — proceed, report:
- A key in `i18n/content/<locale>.json` that no base file defines (orphaned translation, likely a rename — never deleted, §7).
- A message used in attribute position that contains Markdown syntax (§5 — it will render inert).
- A translated message containing `{{GENDER:…}}` — no user context exists in static content (§4).
- A translated message containing `{{WIKILINK:…}}`, `{{EXTLINK:…}}`, or `{{HTMLELEMENT:…}}` — these emit raw HTML into a Markdown document, and `WIKILINK` emits a wiki-relative URL (§4).
- A locale dropped for falling below the threshold, with its measured percentage.
- A definition with no `qqq`. Translators need it, and TranslateWiki requires it; it is a warning rather than an error only so that an in-progress page still generates.

**Rationale:** "Absence is only ever inferred from success" generalizes here to translator work: an orphan key is reported, never deleted, because the generator cannot distinguish a rename from a removal and only one of those makes discarding a translation correct. The hand-authored-overwrite check exists because the failure mode is silent and destructive — a base file whose path happens to match an existing page would otherwise delete authored prose on the wipe pass.

---

## 12. The demo page

**Decision:** `content-i18n/experiments/open-data.md` is the first and only source, adapted from the hand-authored `content/en/get-started/open-data.md`. The authored page is **not** touched and the demo does not take its slug.

The demo deliberately **extends** its source. The original page is an H1, a one-sentence intro, three H2s, and 8 navigation cards — 21 of its 26 strings are card attributes, so it exercises attribute references thoroughly and almost nothing else. A "Before you start" section adds a paragraph with an inline link, a bulleted list, and a three-column table, so that every syntax context in this ADR appears at least once in a real file:

| Context | Where |
| :---- | :---- |
| Inline definition in a heading | H1 and every H2 |
| Block definition, multi-paragraph | `#before-you-start-intro` |
| Inline definition in prose | `#intro`, `#before-you-start-intro` |
| Definition containing a Markdown link | `#before-you-start-intro` |
| Inline definition in a list item | `#practice-*` |
| Inline definition in a table cell | `#table-*` |
| `\|` escape inside a table cell | `#table-dumps-format` (`XML \| SQL`) |
| `\"` escape inside a `qqq` value | `#table-streams-source` |
| `:::messages` block + attribute reference | the three-card grids |
| Definition written directly inside an attribute | the Lift Wing card (§3.1) |
| Within-page repeat | `#card-dumps-description`, used by two cards |
| Cross-file repeat via `_shared/` | `#content-shared-read-the-tutorial` |
| Parameterized reference, two values | `#content-shared-read-more-on` with `p1='Meta-Wiki'` / `p1='Wikidata'` |
| banana magic word in a message | `#content-shared-read-more-on` wraps its argument in `{{BIDI:$1}}` (§4) |

**Rationale:** A fixture that does not reach the awkward corners of a syntax validates nothing. The within-page repeat is not contrived — cards 3 and 6 of the real page carry a byte-identical description, which is what motivated the reference form in the first place. The parameterized message collapses three near-duplicate `Read more on …` strings into one translatable unit, which is the concrete argument for parameters over concatenation.

**Consequences:**
- Sample `he` and `es` translations are illustrative test fixtures, not reviewed translations, and must be labeled as such wherever they land. `es` is deliberately left incomplete so §9's threshold is exercised rather than merely implemented.
- The page is in no menu and `sidebar: false`, since `/experiments/…` resolves no path-based section navigation.

---

## 13. Known gaps and open questions

- **No fuzzy / stale-translation mechanism.** Changing English under a stable key leaves every translation silently stale. MediaWiki solves this with fuzzy flags; we have nothing. Candidate: store a hash of the English source per key and report translations whose source hash has moved. Not designed.
- **No TranslateWiki message group.** `i18n/content/` has no path to translators. Until it does, translations are hand-added, and the feature's value is unrealized.
- **Renaming a base file orphans every translation** (§6). No rename map exists.
- **Runtime locales versus content locales.** `app/plugins/banana-i18n.ts` statically imports five interface locales. Prose content has no such limit — any locale with a `i18n/content/<locale>.json` gets a page. So a locale can have translated *content* and English *chrome*. Correct per the fallback design, but it is a state the interface has not been reviewed in.
- **Translated headings produce translated anchors** (github-slugger), so deep links differ per locale. Pre-existing for imported content; unchanged here.
- **Params are build-time constants.** There is no mechanism to source a param value from config, so a value that changes still requires a base-file edit and a re-run. Add only if a real case appears.
- **The generator bypasses the `config/languages.ts` accessor.** It imports `config/languages.generated.ts` directly for fallback chains, because the accessor resolves `./languages.generated` without a file extension and Node's ESM resolver cannot load that. The override layer (`LANGUAGE_OVERRIDES`) is empty today, so the two are equivalent — but a populated override would be silently ignored here. The fix is to add the extension to that import once `allowImportingTsExtensions` is set, at which point the script should switch to the accessor.

---

## Rejected alternatives

**Keys in the body, English in frontmatter.** One uniform, context-free token that works everywhere including attributes — genuinely simpler to implement. Rejected because the base file stops being readable as prose: reviewing an English copy change means correlating a YAML block against a body of bare keys, and the readability of the English source is the main thing Option A buys.

**Merging prose keys into `i18n/en.json` under a reserved prefix.** Rejected on two independent grounds: page prose would ship in the client bundle for every runtime locale despite never being resolved at runtime, and the Rule 1 interface/content boundary would degrade from an import boundary to a naming convention.

**Positional parameters (`::message{'key', 'hello', 'world'}`).** Rejected for separator ambiguity — no positional separator survives values containing that separator, and `|` additionally collides with GFM tables. `p1`/`p2` attributes cost a few characters and have no such failure.

**Per-page message files (`i18n/content/<page>/en.json`).** Rejected as premature: it complicates cross-page `_shared` references and any future TranslateWiki group definition, for a filesystem tidiness benefit that a flat namespace with path-derived keys already provides.

**Sentence-level segmentation.** Not adopted. Messages are paragraph-or-larger units with inline links inside them. `i18n/en.json` already contains the anti-pattern this avoids — `account-developer-tokens-help-before` / `-after` split a sentence around a link, leaving translators unable to move the link. Do not reproduce it here.
