# Typography tokens

Codex defines a small set of font tokens. Use them — don't pick fonts or
sizes directly.

## Font family

| Token | Use |
| --- | --- |
| `--font-family-system-sans` | UI text (default) |
| `--font-family-sans` | UI text (alias) |
| `--font-family-serif` | Wikipedia-like article title + article body (used by `ArticleHeader` + **`ArticleRenderer`** parser column) |
| `--font-family-monospace` | code, source mode editor |

## Font size

| Token | Approx. px | Use |
| --- | --- | --- |
| `--font-size-x-small` | 12 | captions, footnotes |
| `--font-size-small` | 14 | helper text, secondary labels |
| `--font-size-medium` | 16 | body text |
| `--font-size-large` | 18 | h3 / subheadings |
| `--font-size-x-large` | 20 | Heading 3 |
| `--font-size-xx-large` | ~24–28 | Heading 2 |
| `--font-size-xxx-large` | ~28–36 | Heading 1 (`h1`) — see [Codex typography](https://doc.wikimedia.org/codex/latest/style-guide/typography.html) |

## Font weight

| Token | Use |
| --- | --- |
| `--font-weight-normal` | body |
| `--font-weight-bold` | strong emphasis |

(The design system intentionally has only two weights.)

## Line height

| Token | Use |
| --- | --- |
| `--line-height-x-small` | dense UI labels |
| `--line-height-small` | body / form labels |
| `--line-height-medium` | long-form article text |
| `--line-height-large` | Heading 4 |
| `--line-height-x-large` | Heading 3 / responsive `h1` |
| `--line-height-xx-large` | Heading 2 |
| `--line-height-xxx-large` | Heading 1 |

## ProtoWiki: semantic HTML

`src/styles/global.css` maps **`h1`–`h6`**, **`p`**, **`small`**, **`blockquote`**,
**`cite`**, **`figcaption`**, **`code`/`kbd`/`samp`**, **`pre`**, and related
elements to the Codex scale above (aligned with the official typography style
guide). Prefer plain semantic markup in prototypes — avoid one-off font CSS
unless you are demonstrating something outside the scale.

Reader-style **underlines** on primary titles still use **`mw-first-heading`**
(PlainWrapper, **`ArticleRenderer`**'s **`.article-content`**, `.mw-parser-output`); that class only adds the separator —
sizes come from **`h1`** + tokens.

## Tip — heading hierarchy (manual overrides)

If you need a one-off class instead of `h1`–`h6`:

```css
.first-heading {
  font-size: var(--font-size-xxx-large);
  line-height: var(--line-height-xxx-large);
  font-family: var(--font-family-serif);
}

.section-heading {
  font-size: var(--font-size-xx-large);
  font-family: var(--font-family-serif);
}

.sub-heading {
  font-size: var(--font-size-large);
}
```
