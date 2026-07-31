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

Body content in Markdown. MDC components (`::callout`, `::highlight`, `::partial`, `::navigation-card`, …) work here —
see the import guide and `ARCHITECTURE.md` → MDC content components for the full list.
```

- The file name (minus `.md`) is the URL slug. `content/en/guides.md` → `/guides`.
- Nested folders work: `content/en/guides/reuse.md` → `/guides/reuse`.
- The first `# ` heading is the page title.

### Highlight (progressive CTA / featured blurb)

Use **`::highlight`** for a progressive-subtle banner / CTA (no border, exploratory **4px** radius, **12px** / `--spacing-75` padding, `--spacing-100` block margin). Same surface as class **`.fd-highlight`** in Vue templates.

**Not a callout:** For notice / warning / error / success, use **`::callout`** (`CdxMessage`). Highlight has no status icon or message type — only an emphasized panel. Independent of code syntax highlighting.

```md
::highlight
Ready to start using Wikimedia APIs? [**Go to the quick start →**](/get-started/quick-start)
::
```

Example: `content/en/get-started.md` (quick-start CTA with arrow). Also `content/en/get-started/wikimedia-enterprise.md` — sentence and CTA as **separate paragraphs** inside the highlight (CTA **without** arrow). That page’s body sections stay **prose** (not navigation cards). Copy is page content (per-locale Markdown), not banana-i18n.

### Section heading with chip

For a content `h2` that needs an inline Codex InfoChip:

```md
::section-heading{title="Wikimedia APIs" chip="Recommended" status="notice"}
::
```

Title and chip text are page content (per-locale Markdown), not banana-i18n. Default status is `notice`. See `ARCHITECTURE.md` → Section heading.

### API catalog — Wikimedia APIs (filterable)

On `/apis`, do **not** hand-author the Wikimedia APIs card grid. Use:

```md
::api-catalog-wikimedia-section{title="Wikimedia APIs" chip="Recommended"}
Discover our curated selection of production-ready APIs…
::
```

`title` and `chip` are **page content** (translate in per-locale Markdown) — same rules as `::section-heading`. Cards, project-filter visibility (`universal` / `projects` / optional `excludeProjectIds`), and scope chip labels live in `config/apiCatalogWikimedia.ts` — do not encode filter show/hide or add Wikimedia APIs cards in the Markdown body (e.g. Math API, Wikimedia REST APIs). Explorer destinations use `url: '/explorer'`. Combobox **`inline-size` / `min-inline-size`** use Codex **`--size-1600`** (256px) in the section component CSS. Filter chrome labels (“Filter by project”, “Any”, …) are banana-i18n. See `ARCHITECTURE.md` → API catalog project filter and `DESIGN_REQUIREMENTS.md` → API catalog → Project filter layout.

### Navigation cards (destination tiles)

**Agents:** Follow **`AGENTS.md` → Navigation card authoring playbook** when a prompt asks for internal vs external navigation cards or to convert `###` / “Learn more” blocks into cards. Both styles use the same `NavigationCard` component.

| Style | Destination | MDC shape | Copy from |
|-------|-------------|-----------|-----------|
| **Internal** | `/get-started/…`, `/explorer`, … | `url` + `title` + `description` only (**no** `supporting-text`) | `content/en/get-started.md`, `build-for-communities.md` |
| **External** | `https://…` off-platform | Same + **`supporting-text`** = writer’s link label (external icon on that link) | `about-wikimedia.md`; external cards on `open-data.md` / `tools-and-bots.md` |

Use **`:::navigation-card-grid`** for equal-height rows with **`--spacing-100` (16px)** above and below the grid (optional **`columns="2"`** for two-up rows, e.g. platform-home Join). Whole-card click via stretched link. For **internal** paths omit supporting-text (no in-card “Learn more”) unless the design deliberately shows a destination label (platform-home persona cards keep writer supporting-text). When converting existing external “Read more on …” / “Visit …” links, **keep the technical writer’s label text**. Ensure the target Markdown file exists under `content/<locale>/` for internal destinations — a missing file yields a **404**. **Do not** convert `wikimedia-enterprise.md` body sections to cards — that page stays prose under a `::highlight` intro CTA. Brand title marks use allowlisted **`title-logo="gerrit|github|gitlab|wikimediaEnterprise"`** (see `AGENTS.md` playbook) — not free-form SVG in Markdown. Platform home structure (`content/en/index.md`) uses `:::landing-hero` / landing bands / `:::landing-api-demo` — see `ARCHITECTURE.md` → Platform landing / home. Nested MDC containers need **more colons on the outer wrapper** (e.g. `:::::landing-band` → `::::landing-api-demo` → `:::code-block`); same-level `:::` openers close the previous block and can leave orphan `:::` text in the page. Single code samples use **`:::code-block`** (same bordered chrome as `::::code-tabs`, without tabs; use a highlight allowlisted language such as `bash` for curl). Community app cards may use `media`, `hide-external-icon`, and `chips="award:…"` — they follow the Codex **Portrait card** design (12px / `--spacing-75` around the image; not shipped in Codex yet — [T310632](https://phabricator.wikimedia.org/T310632)).

**API / product titles on cards:** Use **current** ecosystem names (e.g. **Lift Wing API**, **MediaWiki REST API**). Do not replace them with generic umbrellas (e.g. “Machine Learning API”) until product decides modules are surfaced and accessibility-oriented renames ship.

```md
:::navigation-card-grid
::navigation-card{url="/get-started/wiki-content" title="Use wiki content" description="Access articles from Wikipedia…"}
::
::navigation-card{url="/get-started/open-data" title="Access open data" description="Explore public data…"}
::
:::
```

Optional props (when design needs them): `top-icon` / `leading-icon` (allowlisted Codex names), `media` (public image path), `chips="notice:All projects|success:Stable|warning:Beta"` (API catalog — scope / stable / beta; **label-only**, no status icons; see `AGENTS.md` → Info chips) or `chips="award:Coolest Tool Award 2026"` (landing purple Coolest Tool chip + star), `hide-external-icon`, `supporting-text="Read more on Meta-Wiki"` (progressive link to the same `url`, with external icon for off-platform destinations unless `hide-external-icon`; title trailing icon is omitted when supporting-text is set; bottom-aligned in equal-height rows; **keep the technical writer’s label text**), `external` or an `https://…` `url` for off-platform destinations. Omit `url` for a non-interactive card (e.g. destination TBD). Title, description, supporting-text, and chip text are **page content** (translate in per-locale Markdown files) — not banana-i18n interface strings. Examples: `content/en/get-started.md`, `content/en/get-started/build-for-communities.md` (internal cards, no supporting-text), `content/en/apis.md` (catalog with chips), `content/en/get-started/wiki-content.md` / `open-data.md` / `tools-and-bots.md` (mixed internal / external; description default slot for inline links), `content/en/get-started/about-wikimedia.md` (external supporting-text links), `content/en/index.md` (landing persona + community app cards).

When a card needs **Markdown** in the description (e.g. an inline link) **inside** a grid, put the Markdown in the card’s **default slot** — not `#description`. MDC named slots do not nest under `:::navigation-card-grid` and will 404 the page.

```md
:::navigation-card-grid
::navigation-card{url="https://www.mediawiki.org/wiki/Special:MyLanguage/Wikibase" title="Wikibase and Wikidata" supporting-text="Read more on mediawiki.org"}
Wikibase powers [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page).
::
:::
```

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

Two things that are **not** special-cased outside this list:

- **APIs** is a normal primary tab (`id: apis`, `nav-api`, path `/explorer`). It stays selected on explorer routes; the start-column section heading remains **API Explorer**. The destination is never locale-prefixed (`i18n: false` on that route).
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
`use-content-and-data`, `community`, `contribute`, `get-help`.

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
