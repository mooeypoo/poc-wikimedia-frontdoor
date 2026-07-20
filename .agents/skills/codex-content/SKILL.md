---
name: codex-content
description: Codex content guidelines — voice and tone, UI copywriting (clarity, accessibility, translatability), machine-assisted disclosure, and related Wikimedia writing resources. Use when writing or reviewing interface strings, errors, labels, messages, or any user-visible copy (in concert with the project's i18n system).
license: MIT
---

# Codex content guidelines

This skill summarises Codex **Content Guidelines** for interface copy. Canonical docs:

- Style guide overview:
  <https://doc.wikimedia.org/codex/latest/style-guide/overview.html>
- [Voice and tone](https://doc.wikimedia.org/codex/latest/style-guide/voice-and-tone.html)
- [Writing for copy](https://doc.wikimedia.org/codex/latest/style-guide/writing-for-copy.html)
- [Machine assistance](https://doc.wikimedia.org/codex/latest/style-guide/machine-assistance.html)
- [Additional resources](https://doc.wikimedia.org/codex/latest/style-guide/additional-resources.html)

Good content keeps readers focused on their task and supports quick,
confident decisions. Pair with [`codex-design-principles`](../codex-design-principles/SKILL.md)
and [`codex-layout`](../codex-layout/SKILL.md) for structure and actions.

---

## Voice and tone

### Voice (consistent personality)

Wikimedia’s voice is the voice of **free knowledge**: empowering people to
create, develop, and access educational content worldwide.

- **Neutral** — no personal opinions in product copy; focus on empowering
  create/edit/read tasks.
- **Clear, concise, consistent** — not mechanical.
- **Directive and respectful** — tell users what to do without being pushy.

Content should not distract from the task at hand.

### Point of view

| Person | Use |
| --- | --- |
| **First person** (`I`, `we`) | Avoid in UI except when clearly the Foundation or Wikimedia entity |
| **Second person** (`you`, **your**) | Instructions to the user; prefer **“Your”** over **“My”** for UI ownership (e.g. “Your events”, not “My Events”) |
| **Third person** (active) | Most UI copy and content descriptions |

- **Do:** “Check your events page.”
- **Don’t:** “Check your ‘My Events’ page.” (forces awkward quoting in i18n)

Reserve **me/my** for when the user is speaking *to* Wikimedia, not for
labelling their own data in the UI.

### Tone (varies by context)

Tone shifts with the task; voice stays consistent.

| Context | Tone |
| --- | --- |
| Warnings, errors | Neutral, plain, clear — no panic |
| Success | Informative, appropriately positive — not shouty |
| Routine actions | Calm, direct |

Match severity: a warning and a success message should both stay on-brand
but feel different in energy.

---

## Writing for copy

Ask these questions before shipping UI text.

### Content first

**Is this needed?**

- **Do:** Minimal text; test that users understand what to do.
- **Don’t:** Long explanations where a short label suffices.

**Is this relevant?**

- **Do:** Give context, consequences, and **solutions** in errors and prompts.
- **Don’t:** Vague errors (“Something went wrong”) without what happened and
  what to do next; don’t ask for feedback without saying why.

### Design for consistency

**Is this clear?**

- **Do:** Same terminology in title and CTA; group related copy; consider
  visual hierarchy (type, spacing, icons).
- **Don’t:** Extra questions in dialogs; inconsistent terms for the same thing.

**Is this concise?**

- **Do:** Short, scannable, action-focused; Plain English for localization.
- **Don’t:** Motivation essays; too many CTAs; more detail than needed.

**Is this consistent?**

- **Do:** Align with Wikimedia terminology across products; maintain a
  preferred-term list for buttons, tabs, and recurring labels.
- **Don’t:** Complex or inconsistent synonyms for the same action.

### This is for everyone

**Is this accessible?**

- **Do:** Avoid stereotype-reinforcing wording.
- **Don’t:** “Enable/disable” → prefer **turn on / turn off**.
- **Don’t:** “Whitelist/blacklist” → **allowlist / denylist**.
- **Don’t:** “Below/above” for layout — not everyone perceives spatial layout.

See Codex typography guidelines for readability.

**Is this inclusive?**

- **Do:** “A user” or a known username; neutral active voice; `they`/`you`/`we`
  when gender is unknown and required.
- **Don’t:** Assume pronouns the user has not set.
- Note: gender-neutral copy is easier in English than in some languages —
  plan for translation.

**Is this translatable?**

- **Do:** Plain, short words; simple phrases.
- **Don’t:** Idioms, slang, jokes, metaphors, pop culture — they break in translation.

English is the most common source language for Wikimedia translations.

### Trustworthy yet joyful

**Is this trustworthy?**

- **Do:** Calm, confident tone — especially in alerts.
- **Don’t:** Alarmist copy that makes users worry unnecessarily.

### Copywriting tips (quick reference)

- **Neutral voice** — functionality first.
- **Bare infinitives** for actions: Upload, Publish, Share (button labels).
- **Scannable** — bullets, clear titles.
- **Consequences** — say what happens; don’t overload.
- **Errors** — best fix first; ordered steps when multiple fixes exist.
- **Verbs for actions, nouns for places** — “Save” vs “Preferences”.
- **User language, not dev jargon:**
  - “incorrect” not “invalid”
  - “text” / “content” not “input”
  - describe the field (“name”, “quantity”) not “value”
- **Avoid overused fillers:** please, sorry, just, simply, try (implies failure).
  - Prefer “Refresh the page to load the data” over “Please try simply
    refreshing…”
- **Work with visual design** — hierarchy via `CdxMessage`, grouping, icons.

---

## Machine-assisted experiences

Guidance for signaling ML-assisted UI content in line with Wikimedia values.
Focus: **interface copy** that notes or describes machine-assisted outputs.

### Content principles

**Center the human, not the technology**

- **Do:** Benefit/outcome focused; active voice for people (add, edit, review);
  passive for AI (“generated by”); provide feedback levers.
- **Don’t:** Frame AI as partner/coach; make the machine the primary actor;
  overemphasize tech when it doesn’t help the task.

**Give just enough information**

- **Do:** Task-critical info only; short scannable copy; “Learn more about …”
  links to model cards when needed; audience-aware (reader vs editor vs admin).
- **Don’t:** Explanatory bloat; too many dialog actions — prefer a link for a
  third action.

**Be transparent**

- **Do:** Plain language; specify what the system does (data, model, app layer);
  show useful metadata (e.g. confidence) when it helps judgment; explain limits
  in admin or high-stakes contexts; information trail (sources, inputs).
- **Don’t:** “Intelligent” hype; vague “AI” when “classifier” or “small language
  model” is accurate; hide uncertainty when trust depends on it.

### Disclosure levels

Choose depth from **predictability**, **complexity**, and **harm if wrong**
(data + model + how the UI presents output).

| Level | When | Include |
| --- | --- | --- |
| **Detailed** | Low predictability, high complexity/risk — long generated text, high-stakes translation, abuse automation, personalized recommendations | Early disclosure, label, disclaimer, instructions, feedback, sources/reasoning cues |
| **Basic** | Predictable, lower risk — machine translation, edit suggestions, non-personalized recommendations | Lighter disclosure; feedback where appropriate |

### Components by mode

| Mode | Examples | Label | Disclaimer |
| --- | --- | --- | --- |
| **Flag/Check** | Reference check, fact check | Usually none; optional “Identified by a [model]” + model card link | Readers: often no; editors: when mandatory change/automation |
| **Recommend** | Suggested articles, links | Often none (like spellcheck); optional model attribution | Readers: feedback + info trail; editors: yes in how-to |
| **Generate** | Machine translation, summaries | **Explicit** label for machine-created content | **Required** |

**Titles:** Sentence case; task/outcome focused, not model type.

- Flag/Recommend: `[verb] [noun]` — “Check a fact”, “Add a link”
- Generate: “Generate reading list”, “Review machine translation”, or
  “Machine [output]” for tool names

**Labels & icon:** Prefer text over `robot` icon alone; icon does not replace
clear wording.

**Disclaimer pattern (Generate):**

> Machine [type] can be wrong or incomplete. [How it can be wrong.] [What to do.]

Examples: machine translations; experimental features; image suggestions.

**Feedback:** Important for Generate and automated actions. Prefer close (X),
yes/no questions, dropdowns, or forms — explain how feedback is used.
**Avoid** thumbs up/down scales.

**Buttons:** Sentence case; 1–2 words when possible; match dialog title; verbs
(Add image, Check facts) — not generic Submit; avoid redundant machine icons;
prefer view/show/read over “see”.

**Links:** Descriptive out of context — “Learn more about machine suggestions”,
not bare “Learn more”.

### Machine-assisted checklist

- [ ] Focus on user task, not technology
- [ ] Disclosure matches risk
- [ ] Plain, neutral, translatable language
- [ ] Generated content labeled when required
- [ ] Feedback path where needed

---

## Additional resources

Use these when Codex content guidelines need more depth or domain context:

| Resource | URL / topic |
| --- | --- |
| **Wikimedia Documentation Style Guide** | Technical documentation writing and editing — [documentation style guide](https://www.mediawiki.org/wiki/Documentation/Style_guide) |
| **English Wikipedia Manual of Style** | Article style; accessibility provisions apply project-wide — [Manual of Style](https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style) |
| **Localization** | MediaWiki i18n and l10n — [Localization](https://www.mediawiki.org/wiki/Localization) on MediaWiki.org |
| **System messages** | Developer guidance for system messages — [System messages](https://www.mediawiki.org/wiki/New_messages) on MediaWiki.org |
| **Wikimedia content style guide** | Broader writing — <https://design.wikimedia.org/style-guide/> |
| **Inclusive Communications Guide** | Identity-inclusive language (referenced from Writing for copy) |

---

## Pre-ship checklist (UI copy)

- [ ] Voice neutral; tone matches severity (error vs success)
- [ ] Second person for instructions; “Your” not “My” for UI ownership
- [ ] Needed, relevant, clear, concise, consistent
- [ ] Accessible wording (allowlist, turn on/off, no spatial-only directions)
- [ ] Translatable (no idioms/slang); new keys added to project i18n files
- [ ] Errors explain problem + fix; CTAs match titles
- [ ] Machine-assisted features disclosed appropriately (if applicable)

## See also

- [`codex-design-principles`](../codex-design-principles/SKILL.md) — joyful,
  accessible, useful
- [`codex-layout`](../codex-layout/SKILL.md) — buttons, forms, messages placement
- [`codex-components`](../codex-components/SKILL.md) — `CdxMessage`, `CdxDialog`, `CdxField`
- [`codex-bidirectionality`](../codex-bidirectionality/SKILL.md) — mixed-language strings

## Inside Front Door

**`AGENTS.md` overrides this skill** for how copy is stored and delivered.

| Topic | Front Door rule |
| --- | --- |
| **All interface strings** | **banana-i18n only** — no hardcoded English in templates; no `vue-i18n` `$t()` for UI |
| **Adding copy** | New message keys in banana message files for every new UI string |
| **External content** | Wiki/API/spec/user strings are not “copy” — wrap in `<bdi>`, do not author in English in components |
| **Content pages** | Prose in `content/[locale]/` via Nuxt Content — separate from interface i18n |
| **Machine assistance** | Not in current experiment scope; if added later, follow disclosure section above |

Apply Codex voice/tone and writing guidelines **when authoring banana
messages**, not when embedding dynamic third-party text. Review against the
RTL and BiDi checklist in [`AGENTS.md`](../../../AGENTS.md) for anything
shown in the UI.
