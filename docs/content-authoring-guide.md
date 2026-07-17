# Content authoring guide (hand-authored pages, menus & sidebars)

A practical how-to for **content people** shaping the site directly: adding and
moving Markdown pages, editing the top menu, and controlling the left sidebar.

This covers **hand-authored** content committed under `content/`. For content
*imported* from wikis or remote URLs, see
[`content-import-guide.md`](./content-import-guide.md).

---

## Mental model (read this first)

- **A page is a Markdown file.** `content/<locale>/<slug>.md` becomes a route.
  - `content/en/get-started.md` → `/get-started`
  - `content/en/index.md` → `/` (the front page)
  - `content/fr/get-started.md` → `/fr/get-started`
- **English is the default, everything falls back to it.** The default locale
  (`en`) has no URL prefix; other locales are prefixed (`/fr/...`). If a page is
  missing in the requested locale, the site silently serves the English version
  (via the fallback chain). You only need translated files where you actually have
  translations.
- **Only a few locales carry hand-authored content today** — `en`, `es`, `fr`,
  `he`, `fa` (these also have interface-string files under `i18n/`). Every other
  registered language falls back to English automatically.
- **The page title is the first `# ` heading** in the file — you don't set it in
  frontmatter.
- **Two things are configured, not authored:** the **top menu**
  (`config/mainNavigation.ts`) and the **sidebar menus**
  (`config/sectionNavigation.js`). Pages then *attach* to those menus by their URL
  or via frontmatter (below).

Nuxt serves these files through two page components — `app/pages/index.vue` (the
`/` front page) and `app/pages/[...slug].vue` (everything else). You normally never
touch them.

---

## Part 1 — Add a content page

**1. Create the file** at `content/en/<slug>.md`:

```md
---
# frontmatter is optional — omit the block entirely if you don't need it
---

# My page title

Body content in Markdown. MDC components (`::callout`, `::partial`, …) work here —
see the import guide for the component list.
```

- The file name (minus `.md`) is the URL slug. `content/en/guides.md` → `/guides`.
- Nested folders work: `content/en/guides/reuse.md` → `/guides/reuse`.
- The first `# ` heading is the page title.

**2. (Optional) add previous / next links.** On content pages, a footer nav renders
when you set `prev` / `next` in frontmatter:

```md
---
prev: { text: 'Introduction', link: '/get-started' }
next: { text: 'Reuse content', link: '/use-content-and-data' }
---
```

**3. (Optional) translate it.** Add `content/<locale>/<slug>.md` for any of the
content locales (`es`, `fr`, `he`, `fa`). If you don't, that locale falls back to
English — no error.

That's the whole flow. The page is live at its route; no build-config changes
needed. Whether it shows a sidebar is decided in **Part 4**.

### Frontmatter reference

| Field | Type | Purpose |
|---|---|---|
| `prev` | `{ text, link }` | Previous-page link in the footer nav (content pages). |
| `next` | `{ text, link }` | Next-page link in the footer nav. |
| `sidebar` | `boolean \| string` | Per-page sidebar control — see [Part 4](#part-4--control-the-side-menu-sidebar). |

The schema lives in [`content.config.ts`](../content.config.ts). The page title is
**not** a frontmatter field — it comes from the first `# ` heading.

---

## Part 2 — Move or rename a page

1. **Rename / move the file** — and its locale copies
   (`content/es/<slug>.md`, etc.).
2. **Add a redirect** so old links (and search engines) don't 404. Edit
   [`config/contentRedirects.ts`](../config/contentRedirects.ts) →
   `LEGACY_PATH_REDIRECTS`:

   ```ts
   const LEGACY_PATH_REDIRECTS = {
     '/old-slug': '/new-slug',   // 301; locale-prefixed variants are generated for you
   }
   ```

   Locale-prefixed redirects (`/fr/old-slug` → `/fr/new-slug`) are built
   automatically for the content locales — you only list the locale-agnostic path.
3. **Update internal links** that pointed at the old slug.

> **Worked example — moving "Get Started" off the front page.** The homepage used
> to *be* the Get Started tab (`/`). We moved Get Started to its own page:
> created `content/en/get-started.md`, changed the tab's `path` to `/get-started`
> in `config/mainNavigation.ts` (Part 3), and gave the front page a sidebar-less
> layout with `sidebar: false` (Part 4). No redirect was needed because `/` still
> exists — it just became the front page.

---

## Part 3 — Edit the top menu

The primary tabs live in `MAIN_NAVIGATION_ITEMS` in
[`config/mainNavigation.ts`](../config/mainNavigation.ts). **Array order = display
order.**

```ts
export const MAIN_NAVIGATION_ITEMS = [
  { id: 'get-started',          messageKey: 'nav-get-started',          path: '/get-started' },
  { id: 'use-content-and-data', messageKey: 'nav-use-content-and-data', path: '/use-content-and-data' },
  // …
]
```

- `id` — stable identifier. **Also the key that links a tab to its sidebar menu**
  (Part 4).
- `messageKey` — a banana-i18n key for the label. **It must exist in the locale
  files.** At minimum add it to `i18n/en.json` **and** `i18n/es.json`, `fr.json`,
  `he.json`, `fa.json` — a key missing from a locale that *has* a file renders as
  the raw key. The file-less catalog locales fall back to English automatically.
- `path` — the page the tab points to (locale prefixing is handled for you).

**To add a tab:** add an entry (in the position you want) and add its `messageKey`
to the locale files. **To reorder:** move the entry. **To remove:** delete it (the
page itself still exists at its route unless you also remove the file).

Two things that are **not** in this list:

- **The API Explorer** is a separate header link (`/explorer`), not a tab.
- **Imported pages** can add themselves to the top nav via a `navEntry` block —
  see the [import guide](./content-import-guide.md#add-a-navigation-entry-optional).

---

## Part 4 — Control the side menu (sidebar)

### How the sidebar is chosen

By default the sidebar is picked **from the URL**: a page under a top-nav item's
`path` shows that item's menu. `/community` and `/community/anything` both show the
`community` menu. A page whose path matches no tab (like the front page `/`) shows
**no** sidebar.

A page can override this from **frontmatter**:

```md
---
sidebar: false            # hide the sidebar; content spans full width
---
```

### `sidebar` frontmatter reference

| Value | Effect |
|---|---|
| *(omitted)* | **Automatic** — menu chosen by the page's URL (the default). |
| `false` | **Hide** the sidebar. The content spans **full width** (no reserved column). |
| `true` | **Show** this page's URL-based menu explicitly (same as omitted when the URL maps to one). |
| `"<menu-id>"` | **Force a specific menu**, regardless of URL. Value is a menu id (below). |

> **`false` vs. an empty menu.** `sidebar: false` collapses the column so content
> is full-width. A page that merely has *no menu items* (e.g. a section defined
> with `sections: []`) still **reserves** the column. Use `sidebar: false` when you
> want the space back — that's what the front page does.

**Available menu ids** (keys of `SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID` in
[`config/sectionNavigation.js`](../config/sectionNavigation.js)): `get-started`,
`use-content-and-data`, `tools-and-bots`, `community`, `contribute`, `get-help`.

Example — a standalone page that should show the Get Started menu:

```md
---
sidebar: get-started
---
```

### Editing what's *in* a menu

Menu contents live in `SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID` in
[`config/sectionNavigation.js`](../config/sectionNavigation.js), keyed by top-nav
`id`. Each menu has `sections`, each section has a title and `items`:

```js
community: {
  ariaLabelMessageKey: 'section-nav-community-label',
  sections: [
    {
      id: 'community',
      titleMessageKey: 'section-nav-community-title',
      items: [
        { id: 'events', messageKey: 'section-nav-community-events' },
        // …
      ]
    }
  ]
}
```

- `titleMessageKey` / `messageKey` are banana-i18n keys — **add them to the locale
  files** (same rule as Part 3).
- To add a whole new menu, add a new top-level key whose name matches a top-nav
  `id` (or that you reference via `sidebar: "<id>"`).
- Item links are currently placeholder labels (they don't navigate yet) except on
  the API Explorer. Wiring item `to:` targets is a future step.

### The front page (worked example)

`content/en/index.md` (and its locale copies) sets `sidebar: false`, so the
homepage renders full width with no sidebar:

```md
---
sidebar: false
---

# Welcome to Front Door
```

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Page shows a raw key like `nav-foo` instead of a label | `messageKey` missing from a locale file that exists (`en`/`es`/`fr`/`he`/`fa`). Add it there. |
| New tab doesn't appear | Entry not added to `MAIN_NAVIGATION_ITEMS`, or you edited the wrong file. |
| Sidebar still shows on a page that should be bare | Add `sidebar: false` to that page's frontmatter (per locale file). |
| `sidebar: "foo"` shows nothing | `foo` isn't a key in `SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID`. Use one of the listed ids. |
| Page shows English on a translated locale | No file at `content/<locale>/<slug>.md` — that's the fallback working as designed. Add the translated file. |
| Old URL 404s after a rename | Add the mapping to `LEGACY_PATH_REDIRECTS` in `config/contentRedirects.ts`. |

---

## Related

- [`content-import-guide.md`](./content-import-guide.md) — imported/remote content
  and shared partials.
- [`adr-language-catalog.md`](./adr-language-catalog.md) — the locale catalog and
  fallback design.
- Config touchpoints: [`config/mainNavigation.ts`](../config/mainNavigation.ts),
  [`config/sectionNavigation.js`](../config/sectionNavigation.js),
  [`config/contentRedirects.ts`](../config/contentRedirects.ts),
  [`content.config.ts`](../content.config.ts).
