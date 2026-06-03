---
name: codex-bidirectionality
description: Codex bidirectionality (BiDi) and RTL/LTR best practices — what to mirror, what to keep LTR, text and icon rules, and how to implement direction in Wikimedia UIs. Use when building or reviewing layouts, forms, lists, icons, or mixed-language content; when setting dir on html or inputs; or when isolating external strings in a multilingual prototype.
license: MIT
---

# Codex bidirectionality

Bidirectionality supports mirroring a user interface for languages read
left-to-right (LTR) and right-to-left (RTL). The canonical Codex style
guide is at
<https://doc.wikimedia.org/codex/latest/style-guide/bidirectionality.html>.
The style guide overview is at
<https://doc.wikimedia.org/codex/latest/style-guide/overview.html>.

**LTR** includes Latin, Cyrillic, Armenian, Georgian, Devanagari, and
digital Chinese/Japanese. **RTL** includes Arabic, Hebrew, and other
right-to-left scripts.

When a layout switches from LTR to RTL (or the reverse), the process is
**mirroring** — the layout orientation reflects the reading direction.
Not every element mirrors the same way.

## Do mirror

Align and flip these with reading direction:

- Text alignment for RTL languages
- Icons with clear horizontal direction (e.g. `cdxIconArrowNext`,
  `cdxIconArrowPrevious` — use RTL variants where Codex provides them)
- Elements within components and pages
- Buttons and button groups
- Sliders, toggle switches, and similar controls
- Rating selectors and pagination
- Navigation items
- Progress indicators that represent **sequences or steps** (not time)

## Do not mirror

Keep these stable regardless of UI direction:

- Icons without clear directionality; time icons; check-mark icons;
  right-hand-use icons
- Phone numbers and postal/ZIP codes (numbers stay LTR)
- URLs and email addresses (structure must stay readable)
- Components representing **time** (clocks, timelines in media players)
- Charts and graphs when mirroring would distort meaning
- Currency symbols
- Media controls (play, pause, rewind)
- Images and illustrations (orientation stays original; captions align
  with language direction)

## Text and mixed content

### Paragraphs

- **Do:** Align paragraph text to the **browser or article** language
  direction.
- **Don't:** Mix alignments inside one paragraph, or align against the
  dominant language of the content.

### URLs and email

- **Do:** Keep URL/email structure intact; align the field with the
  reading direction of the label/context without reversing the string.
- **Don't:** Mirror or reorder URL/email characters.

Set `dir="ltr"` on inputs that accept URLs, paths, or code even when the
surrounding UI is RTL.

### Lists

- **Do:** Align every row consistently with the list's language
  direction; set correct `lang` / `dir` per item when languages differ.
- **Don't:** Mix LTR and RTL alignment within one list.

## Forms and fields

| Field type | Rule |
| --- | --- |
| Phone | Always LTR for digits (Western or Eastern Arabic numerals); never mirror prefixes |
| Address | Mirror words; keep numbers and ZIP codes LTR; consider separate inputs for letters vs numbers |
| Date/time | Order of day/month/year follows reading direction; **numbers and time icons do not mirror** |
| Search (free text) | Prefer `dir="auto"` so the input follows what the user types |
| Names (Arabic/Hebrew) | `dir="rtl"` when the UI is LTR but the field expects RTL script |

### Actions and dialogs

- **Do:** Mirror action buttons and directional button icons with the
  language; use Codex RTL icon variants where movement is implied.
- **Don't:** Reorder **stacked** buttons when translating to RTL — keep
  the same vertical order; mirroring applies to horizontal placement and
  icon direction, not arbitrary reordering.

## Icons

- **Do:** Mirror horizontal-direction icons; use one icon for both
  directions when there is no direction cue; mirror list-style icons when
  needed for readability.
- **Don't:** Mirror time, check, media, or right-hand metaphors.

See [`codex-icons`](../codex-icons/SKILL.md) for which icons include RTL
behaviour.

## Implementing with Codex

Codex components are built for RTL when the document direction is set:

1. Set `dir="ltr"` or `dir="rtl"` on `<html>` (or the app root) to match
   the **interface** language.
2. Load Codex RTL styles when `dir="rtl"` (e.g. `codex.style-rtl.css`).
3. Prefer Codex components over custom markup so focus, ARIA, and
   mirroring stay consistent.
4. Author **first-party CSS** with logical properties (`margin-inline-*`,
   `padding-inline-*`, `inset-inline-*`, `text-align: start/end`,
   `inline-size`) — not physical `left`/`right`.

Do **not** rely on a global PostCSS “RTL flipper” for third-party
libraries; handle direction explicitly per surface.

## Mixed-language and isolation

When the UI language differs from displayed content (wiki instance name,
module title, user input, API string):

- Wrap **external** or unknown-direction strings in `<bdi>` in templates
  so they do not corrupt surrounding text order.
- When HTML is unavailable, use `unicode-bidi: isolate` in CSS or
  Unicode FSI/PDI.
- Interface copy translated via the project's i18n system does not need
  `<bdi>` — it already matches interface direction.

Declare text direction in config (`dir: 'ltr' | 'rtl'` per language or
instance); do not infer direction from locale tags at runtime unless the
project explicitly allows it.

## Pre-ship checklist

- [ ] `<html dir>` (or equivalent) matches the active interface language
- [ ] Codex RTL stylesheet loaded when `dir="rtl"`
- [ ] First-party CSS uses logical properties only
- [ ] External/dynamic strings isolated (`<bdi>` or `unicode-bidi: isolate`)
- [ ] URL, email, phone, and code fields use `dir="ltr"` where required
- [ ] Search and free-text fields use `dir="auto"` where appropriate
- [ ] Direction overrides (`dir="ltr"` / `rtl` / `auto"`) are intentional
  and commented
- [ ] Tested with an RTL interface (e.g. Arabic or Hebrew)
- [ ] Tested with LTR interface showing RTL wiki/instance labels
- [ ] Directional icons use Codex RTL variants, not manual flips
- [ ] Third-party embeds (e.g. API explorer): direction explicit, not
  globally flipped

## See also

- [`codex-layout`](../codex-layout/SKILL.md) — form footers, button order,
  ellipsis placement in RTL
- [`codex-design-principles`](../codex-design-principles/SKILL.md) —
  accessible, familiar Wikimedia UX
- [`codex-components`](../codex-components/SKILL.md) — RTL-aware components
- [`codex-usage`](../codex-usage/SKILL.md) — importing Codex and tokens
- [`codex-tokens`](../codex-tokens/SKILL.md) — spacing and layout tokens
- Codex accessibility:
  <https://doc.wikimedia.org/codex/latest/style-guide/accessibility.html>

## Inside Front Door

This repository is the **Front Door** developer portal, not ProtoWiki.
**`AGENTS.md` and `ARCHITECTURE.md` override this skill** where they
differ.

Front Door-specific rules agents must follow:

| Topic | Rule |
| --- | --- |
| Interface strings | banana-i18n only — no hardcoded UI copy |
| External strings | `<bdi>` for API, wiki, spec, config, and user data |
| Direction source | Explicit `dir` in `config/languages.js` and `config/instances.js` — never infer from language code |
| Shell direction | `useDirection()` sets `<html dir>` in `app/layouts/default.vue` |
| First-party CSS | Logical properties only; no global RTL flipper |
| Explorer (Scalar) | Client-only; do not globally mirror third-party explorer CSS; use explicit `dir` and isolation for dynamic spec content |
| Search | `dir="auto"` on search inputs |

Before marking UI work complete, run the **RTL and BiDi checklist** in
[`AGENTS.md`](../../../AGENTS.md) and layout rules in
[`DESIGN_REQUIREMENTS.md`](../../../DESIGN_REQUIREMENTS.md) when the
change is user-visible.
