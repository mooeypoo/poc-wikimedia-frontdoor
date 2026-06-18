---
name: codex-icons
description: How to use the Codex icon library (@wikimedia/codex-icons) — import a `cdxIcon…` constant, render it through CdxIcon, and look up the right name from the upstream catalogue. Covers bidi-aware icons, the langCodeMap variants (e.g., bold-x), accessibility, and common UI-action icons. Use when adding a glyph anywhere — toolbar buttons, actions, menus, pills.
license: MIT
---

# Codex icons

The Codex icon library ships separately as `@wikimedia/codex-icons`.
**Use it instead of inline SVG, font icons, or unicode glyphs.**

## Importing

```ts
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconEdit, cdxIconBold, cdxIconLink } from '@wikimedia/codex-icons'
```

Then render through `CdxIcon`:

```vue
<CdxIcon :icon="cdxIconEdit" />
<CdxIcon :icon="cdxIconBold" size="small" />
```

## Where to look up icon names

The canonical catalogue is at
<https://doc.wikimedia.org/codex/latest/icons/all-icons.html>. Every icon
has its name (`edit` → `cdxIconEdit`) and a visual.

To search local node_modules:

```bash
node -e "const i = require('@wikimedia/codex-icons'); console.log(Object.keys(i).filter(n => /search/i.test(n)))"
```

## Naming convention

`cdxIcon` + PascalCase of the icon name. So:

| Icon name | Import |
| --- | --- |
| `edit` | `cdxIconEdit` |
| `link` | `cdxIconLink` |
| `bold` | `cdxIconBold` |
| `bold-x` | `cdxIconBoldX` (langCodeMap-aware) |
| `arrow-next` | `cdxIconArrowNext` (bidi-aware) |
| `reference` | `cdxIconReference` |

## Action icons commonly needed in Wikimedia UI

| Action | Icon |
| --- | --- |
| Edit | `cdxIconEdit` |
| Save / Publish | `cdxIconCheck` |
| Cancel / Close | `cdxIconClose` |
| Search | `cdxIconSearch` |
| Bold | `cdxIconBold` |
| Italic | `cdxIconItalic` |
| Underline | `cdxIconUnderline` |
| Bulleted list | `cdxIconListBullet` |
| Numbered list | `cdxIconListNumbered` |
| Quote / blockquote | `cdxIconQuotes` |
| Cite / reference | `cdxIconReference` |
| Link | `cdxIconLink` |
| Trash / delete | `cdxIconTrash` |
| Add | `cdxIconAdd` |
| Settings | `cdxIconSettings` |
| Menu | `cdxIconMenu` |
| Ellipsis | `cdxIconEllipsis` |
| Translate / language | `cdxIconLanguage` |
| User | `cdxIconUserAvatar` |
| Star (watchlist) | `cdxIconStar` |
| Eye (view / watch) | `cdxIconEye` |
| Download | `cdxIconDownload` |
| Upload | `cdxIconUpload` |
| Image | `cdxIconImage` |
| Article | `cdxIconArticle` |

## Accessibility

`CdxIcon` doesn't make a button accessible on its own. Two patterns:

```vue
<!-- Inside a button with a label -->
<CdxButton aria-label="Edit">
  <CdxIcon :icon="cdxIconEdit" />
</CdxButton>

<!-- Decorative — paired with visible text -->
<CdxButton>
  <CdxIcon :icon="cdxIconEdit" /> Edit
</CdxButton>
```

For standalone informational icons, set `iconLabel`:

```vue
<CdxIcon :icon="cdxIconAlert" iconLabel="Warning" />
```

## Bidi-aware icons

Some icons (arrows, e.g. `cdxIconArrowNext`) automatically flip in RTL.
You can also pin direction:

```vue
<CdxIcon :icon="cdxIconArrowNext" dir="rtl" />
```

## Lang-code-aware icons

Some icons (e.g. `cdxIconBoldX`) render different glyphs depending on
language. Pass `langCode`:

```vue
<CdxIcon :icon="cdxIconBoldX" langCode="ar" />
```

## Custom icons

For an icon that's not in the catalogue, define your own descriptor:

```ts
const myIcon = '<svg viewBox="0 0 20 20">…</svg>'
```

Then `<CdxIcon :icon="myIcon" />`. But — first check the catalogue.
There are hundreds of icons.

## Don't

- Don't paste `<svg>` markup directly into your template. Use `CdxIcon`.
- Don't use emoji as icons in product UI.
- Don't use font-awesome or material-icons. We have our own system.

## Inside ProtoWiki

`@wikimedia/codex-icons` is already a dependency — just import the
constants you need. See
[`protowiki-getting-started`](../protowiki-getting-started/SKILL.md)
for the wider stack.
