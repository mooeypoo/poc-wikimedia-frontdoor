---
name: codex-layout
description: Codex layout guidelines — content overflow (wrap, ellipsis, fade), links vs buttons (semantics, hierarchy, spacing, groups), and constructing forms (fields, validation, footers, tokens). Use when laying out forms, action bars, truncated labels, or mixed link/button toolbars in Wikimedia UIs.
license: MIT
---

# Codex layout guidelines

This skill summarises three Codex **Layout Guidelines** pages. Canonical docs:

- Style guide overview:
  <https://doc.wikimedia.org/codex/latest/style-guide/overview.html>
- [Content overflow](https://doc.wikimedia.org/codex/latest/style-guide/content-overflow.html)
- [Using links and buttons](https://doc.wikimedia.org/codex/latest/style-guide/using-links-and-buttons.html)
- [Constructing forms](https://doc.wikimedia.org/codex/latest/style-guide/constructing-forms.html)

Use Codex components and tokens — see [`codex-components`](../codex-components/SKILL.md)
and [`codex-tokens`](../codex-tokens/SKILL.md). For RTL mirroring of buttons and
ellipsis placement, see [`codex-bidirectionality`](../codex-bidirectionality/SKILL.md).

---

## Content overflow

Overflow happens when text or child elements exceed available space (long
button labels, crowded tabs, list items needing scroll).

### Strategies

| Approach | When to use |
| --- | --- |
| **Wrap** | Default; allow multi-line text when fixed height is not required |
| **Ellipsis** | Fixed-height rows; chips; buttons; selects — keep uniform height |
| **Fade** | Scrollable **groups** of elements only — not for text truncation |

### Wrapping

- **Do:** Wrap as the base solution when vertical growth is acceptable
  (accordion labels, body copy).
- **Don't:** Wrap inside components that must share one height (e.g. a row
  of form controls where one `CdxSelect` grows taller than neighbours).

### Ellipsis truncation

- **Do:** Use ellipsis when height consistency matters; add tooltips so
  users can read full truncated labels where appropriate.
- **Don't:** Ellipsis article titles or other content where full text is
  the primary affordance and height is not constrained.

**Optional multi-line ellipsis:** Some components (e.g. `CdxCard`) allow
capping description lines (e.g. three lines) without a tooltip for the
full body — only the visible label needs to be readable.

**BiDi:** In LTR, ellipsis appears at the **end** of text; in RTL, at the
**start** (reading-direction side). Codex handles this when `dir` is set
correctly.

### Fade (scroll hint)

- **Do:** Fade on horizontally scrollable tab strips or similar **groups**.
- **Don't:** Fade to truncate paragraph text — use ellipsis instead.

---

## Using links and buttons

### Link vs button (semantics)

| Use | Element |
| --- | --- |
| Navigate to another resource or in-page section | **Link** (`CdxLink` / `<a>`) |
| Perform an action (submit, toggle panel, API call) | **Button** (`CdxButton`) |

- **Do not** style `<a>` as a button or `<button>` as a link — use the
  matching Codex component.
- **Exception:** Rare marketing CTAs (“Donate”, “Register”) that navigate
  but must look like buttons — still implement as links with button-like
  styling per Codex docs, not a `<button>` that navigates.
- **Keyboard:** Links activate with Enter; buttons with Enter **and** Space.

### Links

- Text links; not icon-only (external links add `cdxIconLinkExternal`).
- Default: underline on hover/press, not always on (wiki prefs may differ).
- **Base (blue):** default navigation.
- **Red:** wiki red links only (page does not exist).
- Match surrounding font size; regular weight unless emphasis requires bold/italic.

**Groups:** `@spacing-75` / `var(--spacing-75)` between links; vertical
column, multi-column, or horizontal footer patterns as appropriate.

### Buttons — `action` and `weight`

| `action` | Use |
| --- | --- |
| `neutral` | Secondary / low emphasis |
| `progressive` | Primary forward action |
| `destructive` | Irreversible actions only |

| `weight` | Use |
| --- | --- |
| `primary` | Main action in a group (one primary progressive per group) |
| `normal` | Secondary |
| `quiet` | Tertiary — avoid beside links (looks like a link) |

**Icons:** Put `CdxIcon` inside `CdxButton`; icon-only buttons need
`aria-label`. Use RTL arrow icons in RTL per bidirectionality skill.

### Disabled buttons

- **Do:** Disable only when another control enables the button (single-field
  flows with live validity).
- **Don't:** Disable the submit button on multi-field forms — use validation
  messages instead.

### Groups and hierarchy

- **2–3 buttons** in a footer/dialog row; more actions → `CdxMenuButton`.
- **Same target element** (one row in a table) → `CdxButtonGroup`.
- Spacing between buttons/links: `spacing-75` (not inside `CdxButtonGroup` /
  `CdxToggleButtonGroup` — those manage their own layout).

**Hierarchy in a group:**

1. At most one **primary progressive** button.
2. Secondary → `normal` neutral/progressive.
3. Tertiary → `quiet`.
4. Avoid progressive + destructive only — add a neutral escape (e.g. Cancel).
5. Destructive colour dominates — separate from progressive when possible.

**Order:**

- **Stacked (mobile):** Most important button **on top**; order unchanged in RTL.
- **Horizontal flow / form footer:** Primary action at the **end** of the
  group (inline-end in logical terms).
- **Form footer alignment:** Actions at **inline-start** of the form container
  (left in LTR, right in RTL); primary at the **end** of the action group.
- **Dialog footer:** Actions at **inline-end** of the dialog (right in LTR,
  left in RTL).
- **Multi-step:** Back (`normal`) beside forward (`primary progressive`);
  optional `quiet` “Skip” with lower hierarchy.

Mixed link + button groups: `gap: var(--spacing-75)`; avoid quiet progressive
next to links.

---

## Constructing forms

A form has at least one **`CdxField`** (label, description, help, validation).

Canonical page:
<https://doc.wikimedia.org/codex/latest/style-guide/constructing-forms.html>

### Usability and accessibility

- Keep fields simple; use existing Codex inputs.
- Collect only necessary data; label optional fields with “(optional)” via
  `CdxField` / `CdxLabel`.
- Always show visible labels (or documented visually-hidden labels).
- Avoid disabled submit on multi-field forms; avoid timers; don’t hide
  required forms inside collapsed accordions.
- Prefer validation over disabled buttons.

### Width and layout

- Fields span the parent; equal width across fields.
- Max field width `size-4000` (~640px) when no in-form table of contents.
- Non-field blocks (tables, accordions) may use full container width.
- Header/footer of form: full width of page or form body even when fields
  are max-width constrained.

**Labels:** Top labels on fields (built into `CdxField`).

**Multi-column row:** Only for related short fields (“Name” + “Surname”,
“Start” + “End”); avoid if translations make labels very long; use
`spacing-150` between columns; stack vertically below
`min-width-breakpoint-tablet` (640px).

**Fieldsets:** `CdxField` fieldset variant with `<fieldset>` + `<legend>` for
radio/checkbox groups.

**Modules:** Optional bordered/grouped sections — `border-radius-base`,
`border-color-muted`, optional `background-color-interactive-subtle`;
parent section label **bold**, inner field labels **regular**.

**Conditional / nested fields:** Indent nested fields `16px` per level;
“Other” text input directly under the selected radio/checkbox, aligned with
its label.

### Table of contents

- In-form TOC at **inline-start** linking to sections; section headings use
  `border-color-base` underline.
- **Caution:** Avoid TOC + adjacent sidebar nav competing on the same page.

### Form footer

- Fixed to viewport bottom with background + top border when form is long;
  in `CdxDialog`, actions follow the last field.
- **Primary:** `action="progressive"` `weight="primary"` for submit.
- **Destructive submit:** `action="destructive"` `weight="primary"` when
  the whole form is destructive.
- Other actions: neutral `normal` or `quiet`.
- Disclaimer above actions inside footer; `spacing-100` between disclaimer
  and buttons; `spacing-75` between buttons.
- With in-form TOC, footer width matches field column, not TOC column.

### Validation

- Inline on **blur** by default; clear error when user edits after error.
- Inline on **input** only for strict early feedback (prefix rules, very
  short max length) — use sparingly.
- On submit failure: summary message above submit; refresh on resubmit;
  remove when valid.
- Use `CdxField` status / messages — not a disabled submit for multi-field forms.

### Spacing tokens (default theme)

| Context | Token |
| --- | --- |
| Form ↔ page / TOC / footer | `spacing-150` (24px) |
| Elements within form | `spacing-100` (16px) |
| Sections within form | `spacing-150` |
| Label ↔ control | `spacing-25` desktop / `spacing-50` mobile (in Field) |
| Module padding (whole form) | `spacing-150` interior |
| Module padding (field group) | `spacing-75` interior |
| Multi-column gap | `spacing-150` |
| Inside module groups | `spacing-100` |
| Checkbox/radio options | `spacing-75` (built-in) |

Spacing is the same at all breakpoints.

### Field type picker

| Need | Component |
| --- | --- |
| Short text, email, URL, tel, number, password, time | `CdxTextInput` in `CdxField` |
| Long text | `CdxTextArea` |
| Pick from list (short) | `CdxSelect`, `CdxCombobox` |
| Search long list | `CdxLookup` |
| Multi custom tags | `CdxChipInput` |
| One/many of few options | `CdxRadio`, `CdxCheckbox` |
| Immediate binary toggle (no submit) | `CdxToggleSwitch` |
| Page search bar | **Not** in forms — use `CdxLookup` / `CdxSearchInput` |

**Readonly vs disabled:** `readonly` = visible, focusable, submitted;
`disabled` = not focused, not submitted, may fail contrast — use intentionally.

---

## Pre-ship checklist

- [ ] Overflow: wrap vs ellipsis vs fade chosen correctly; tooltips on truncated labels
- [ ] Links navigate; buttons act; no semantic swap
- [ ] At most one primary progressive per button group
- [ ] Form uses `CdxField`; labels visible; optional marked
- [ ] Multi-field form: validation, not disabled submit
- [ ] Footer/dialog button order and alignment match flow type (form vs dialog)
- [ ] Spacing uses Codex tokens (`var(--spacing-*)`, `var(--size-*)`)
- [ ] First-party layout CSS uses logical properties (inline-start/end)
- [ ] RTL: ellipsis side and footer alignment verified

## See also

- [`codex-components`](../codex-components/SKILL.md) — `CdxButton`, `CdxField`, `CdxDialog`, …
- [`codex-bidirectionality`](../codex-bidirectionality/SKILL.md) — footer mirroring, ellipsis
- [`codex-design-principles`](../codex-design-principles/SKILL.md) — familiar, accessible UX
- [`codex-content`](../codex-content/SKILL.md) — labels, errors, button copy, tone
- [`codex-tokens`](../codex-tokens/SKILL.md) — spacing and size tokens

## Inside Front Door

**`AGENTS.md` and `DESIGN_REQUIREMENTS.md` override this skill** where they
differ.

| Topic | Front Door rule |
| --- | --- |
| UI copy | banana-i18n for all interface strings |
| External labels | `<bdi>` for dynamic wiki/API/spec strings in forms and pickers |
| Shell layout | Page grid, explorer rails, nav — `DESIGN_REQUIREMENTS.md` |
| CSS | Logical properties only; spacing via Codex tokens |
| Logic | No fetch/validation rules in components — use composables |
| Explorer forms | Scalar owns its UI; apply shell Codex patterns only to first-party chrome |

For shell-specific layout (2-panel grid, end-panel nav), read
[`DESIGN_REQUIREMENTS.md`](../../../DESIGN_REQUIREMENTS.md) before changing
`app/layouts/` or shared shell components.
