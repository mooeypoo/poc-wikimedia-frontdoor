# Colour tokens

## Text

| Token | Use |
| --- | --- |
| `--color-base` | body text, headlines |
| `--color-subtle` | secondary text, captions, helper text |
| `--color-placeholder` | input placeholders |
| `--color-disabled` | disabled controls |
| `--color-emphasized` | strong emphasis on a neutral background |
| `--color-progressive` | links, primary action labels |
| `--color-progressive--hover` | link hover |
| `--color-progressive--active` | link active |
| `--color-destructive` | destructive action labels |
| `--color-destructive--hover` / `--color-destructive--active` | hover/active states |
| `--color-visited` | visited links |
| `--color-error` | error text in messages |
| `--color-warning` | warning text in messages |
| `--color-success` | success text |
| `--color-notice` | informational text |
| `--color-inverted` | text on inverted backgrounds (overlays, toasts) |

## Background

| Token | Use |
| --- | --- |
| `--background-color-base` | page background |
| `--background-color-neutral` | cards, panels |
| `--background-color-neutral-subtle` | toolbars, footers, secondary surfaces |
| `--background-color-progressive-subtle` | informational containers |
| `--background-color-error-subtle` | error containers |
| `--background-color-warning-subtle` | warning containers |
| `--background-color-success-subtle` | success containers |
| `--background-color-notice-subtle` | notice containers |
| `--background-color-disabled` | disabled controls |
| `--background-color-disabled-subtle` | disabled containers |
| `--background-color-button-quiet--hover` | quiet button hover |

## Border

| Token | Use |
| --- | --- |
| `--border-color-subtle` | hairline divider, lightest border |
| `--border-color-base` | default form border |
| `--border-color-emphasized` | hover border on inputs |
| `--border-color-progressive` | progressive accents (active inputs) |
| `--border-color-destructive` | destructive accents |
| `--border-color-error` | error inputs / messages |
| `--border-color-warning` | warning inputs / messages |
| `--border-color-success` | success inputs / messages |
| `--border-color-notice` | notice inputs / messages |
| `--border-color-inverted-fixed` | borders that stay visible regardless of theme |

## Tips

- `*-subtle` always means "low-contrast variant of the same family". Pair
  `--background-color-error-subtle` with `--color-error` for an error
  notice.
- For "tinted" full-bleed surfaces (banners), use the `*-subtle`
  background plus the matching base text colour.
- The `--color-inverted` token is for white-on-dark text (e.g., toasts,
  overlays) and stays correct in dark mode (it inverts the other way).
