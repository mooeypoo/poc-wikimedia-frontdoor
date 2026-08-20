# Content authoring guide (hand-authored pages, menus & sidebars)

A practical how-to for **content people** shaping the site directly: adding and
moving Markdown pages, editing the top menu, and controlling the left sidebar.

This covers **hand-authored** content committed under `content/`. For content
*imported* from wikis or remote URLs, see
[`content-import-guide.md`](./content-import-guide.md).

There is a third pathway, currently an experiment: short pages whose English is
authored **once** under `content-i18n/` with translatable segments marked
inline, and whose per-locale Markdown is generated for you. Its output carries
`i18nGenerated: true` in the frontmatter — **never hand-edit a file carrying
that marker**, or the next run will discard your edit; edit the base file under
`content-i18n/` instead. See **[Part 5](#part-5--translatable-prose-pages-experiment)**
below.

---

## Mental model (read this first)

- **A page is a Markdown file.** `content/<locale>/<slug>.md` becomes a route.
  - `content/en/get-started.md` → `/get-started`
  - `content/en/index.md` → `/` (the front page — Figma platform home; other locale `index.md` stubs fall back to English until translated)
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

Body content in Markdown. MDC components (`::callout`, `::highlight`, `:::link-row`, `::partial`, `::navigation-card`, …) work here —
see the import guide and `ARCHITECTURE.md` → MDC content components for the full list.
```

- The file name (minus `.md`) is the URL slug. `content/en/guides.md` → `/guides`.
- Nested folders work: `content/en/guides/reuse.md` → `/guides/reuse`.
- The first `# ` heading is the page title.
- Heading rhythm is CSS (not Markdown): content-page `##` sections get **40px** above (`--spacing-250`); `###` subsections get **32px** above site-wide (`--spacing-200`). See `DESIGN_REQUIREMENTS.md` → Content page typography.
- For **link-only** destination lists under a heading (no card title/description), use `:::link-row` — not supporting-text-only navigation cards. See **Link row** below.

### Code blocks (fenced samples)

Wrap **every** fenced sample in **`:::code-block`** so it matches the platform-home / docs panel (muted border, exploratory **4px** radius, soft-wrap). Inline `` `code` `` is unchanged.

````md
:::code-block
```bash
curl 'https://en.wikipedia.org/api/rest_v1/feed/featured/2026/07/01'
```
:::
````

- Language must be in `nuxt.config.ts` highlight `langs` (`bash` / `sh` / `shell` for curl and URL templates — not `text`; Shiki has no `text` export).
- Soft-wrap is default; use `:::code-block{no-soft-wrap}` for horizontal scroll.
- Multi-language samples: `::::code-tabs` + `:::code-tab{label="…"}` (already framed panels).
- **Remote / wiki imports:** auto-wrapping imported fences is an open question — see `ARCHITECTURE.md` and `docs/adr-remote-content-fetching.md` §11.8. Do not assume the converter wraps them yet.

Examples: `content/en/index.md`, `content/en/apis/authentication.md`, `content/en/get-started/quick-start.md`, `content/en/use-content-and-data.md`.

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

**Agents:** Follow **`AGENTS.md` → Navigation card authoring playbook** when a prompt asks for internal vs external navigation cards or to convert `###` / “Learn more” blocks into cards. Both styles use the same `NavigationCard` component. When a section only needs plain destination links (no card title/description), use **`:::link-row`** instead — see below.

| Style | Destination | MDC shape | Copy from |
|-------|-------------|-----------|-----------|
| **Internal** | `/get-started/…`, `/explorer`, … | `url` + `title` + `description` only (**no** `supporting-text`) | `content/en/get-started.md`, `build-for-communities.md` |
| **External** | `https://…` off-platform | Same + **`supporting-text`** = writer’s link label (external icon on that link) | `about-wikimedia.md`; external cards on `open-data.md` / `tools-and-bots.md` |

Use **`:::navigation-card-grid`** for equal-height rows with **`--spacing-100` (16px)** above and below the grid (optional **`columns="2"`** for two-up rows, e.g. platform-home Join). Whole-card click via stretched link. For **internal** paths omit supporting-text (no in-card “Learn more”) unless the design deliberately shows a destination label (**approved exception:** platform-home persona / join cards keep writer supporting-text — see `AGENTS.md` → Internal navigation cards). When converting existing external “Read more on …” / “Visit …” links, **keep the technical writer’s label text**. Ensure the target Markdown file exists under `content/<locale>/` for internal destinations — a missing file yields a **404**. **Do not** convert `wikimedia-enterprise.md` body sections to cards — that page stays prose under a `::highlight` intro CTA. Brand title marks use allowlisted **`title-logo="gerrit|github|gitlab|wikimediaEnterprise"`** (see `AGENTS.md` playbook) — not free-form SVG in Markdown. Platform home structure (`content/en/index.md`) uses `:::landing-hero` / landing bands / `:::landing-api-demo` — see `ARCHITECTURE.md` → Platform landing / home. Nested MDC containers need **more colons on the outer wrapper** (e.g. `:::::landing-band` → `::::landing-api-demo` → `:::code-block`); same-level `:::` openers close the previous block and can leave orphan `:::` text in the page. **Every** fenced code sample on hand-authored pages uses **`:::code-block`** (same bordered chrome as `::::code-tabs`, without tabs; soft-wrap by default; `:::code-block{no-soft-wrap}` for horizontal scroll; use a highlight allowlisted language such as `bash` / `sh` / `shell` for curl and URL templates (not `text`)). Do not leave bare fences; leave inline `` `code` `` as normal Markdown. Community app cards may use `media`, `hide-external-icon`, and `chips="award:…"` — they follow the Codex **Portrait card** design (12px / `--spacing-75` around the image; not shipped in Codex yet — [T310632](https://phabricator.wikimedia.org/T310632)). On the platform home, links do **not** show a visited colour (product decision).

**API / product titles on cards:** Use **current** ecosystem names (e.g. **Lift Wing API**, **MediaWiki REST API**). Do not replace them with generic umbrellas (e.g. “Machine Learning API”) until product decides modules are surfaced and accessibility-oriented renames ship.

```md
:::navigation-card-grid
::navigation-card{url="/get-started/wiki-content" title="Use wiki content" description="Access articles from Wikipedia…"}
::
::navigation-card{url="/get-started/open-data" title="Access open data" description="Explore public data…"}
::
:::
```

Optional props (when design needs them): `top-icon` / `leading-icon` (allowlisted Codex names), `media` (public image path), `chips="notice:All projects|success:Stable|warning:Beta"` (API catalog — scope / stable / beta; **label-only**, no status icons; see `AGENTS.md` → Info chips) or `chips="award:Coolest Tool Award 2026"` (landing purple Coolest Tool chip + star; colours from `LANDING_AWARD_CHIP`, inverted in dark mode), `hide-external-icon`, `supporting-text="Read more on Meta-Wiki"` (progressive link to the same `url`, with external icon for off-platform destinations unless `hide-external-icon`; title trailing icon is omitted when supporting-text is set; bottom-aligned in equal-height rows; **keep the technical writer’s label text**), `external` or an `https://…` `url` for off-platform destinations. Omit `url` for a non-interactive card (e.g. destination TBD). Title, description, supporting-text, and chip text are **page content** (translate in per-locale Markdown files) — not banana-i18n interface strings. Examples: `content/en/get-started.md`, `content/en/get-started/build-for-communities.md` (internal cards, no supporting-text), `content/en/apis.md` (catalog with chips), `content/en/get-started/wiki-content.md` / `open-data.md` / `tools-and-bots.md` (mixed internal / external; description default slot for inline links), `content/en/get-started/about-wikimedia.md` (external supporting-text links), `content/en/index.md` (landing persona + community app cards).

When a card needs **Markdown** in the description (e.g. an inline link) **inside** a grid, put the Markdown in the card’s **default slot** — not `#description`. MDC named slots do not nest under `:::navigation-card-grid` and will 404 the page.

```md
:::navigation-card-grid
::navigation-card{url="https://www.mediawiki.org/wiki/Special:MyLanguage/Wikibase" title="Wikibase and Wikidata" supporting-text="Read more on mediawiki.org"}
Wikibase powers [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page).
::
:::
```

### Link row (link-only destinations)

Do **not** use supporting-text-only navigation cards for a list of links under a heading. Use **`:::link-row`**:

- Keep the section heading + description as normal Markdown (`##` or `###` as appropriate).
- Put **each** destination link in its own paragraph inside the row (**24px** / `--spacing-150` between links; wraps with `--spacing-50` row gap).
- Keep the technical writer’s link labels.
- Links use normal Markdown → `ProseA` (external icon for off-platform URLs).

Examples: `content/en/contribute/by-language.md` (`###` project + link row), `content/en/get-help.md`, MediaWiki section of `content/en/contribute/by-topic.md` (`## MediaWiki` + link row; **topic overview cards** on that page stay as `:::navigation-card-grid`).

```md
:::link-row
[Get the source code](https://github.com/scribe-org)

[Contribute (Android)](https://github.com/scribe-org/Scribe-Android/blob/main/CONTRIBUTING.md)

[Contribute (iOS)](https://github.com/scribe-org/Scribe-iOS/blob/main/CONTRIBUTING.md)
:::
```

See `ARCHITECTURE.md` → Link row and `AGENTS.md` → Navigation card authoring playbook → Link-only rows.

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
  { id: 'get-started', messageKey: 'nav-get-started', path: '/get-started' },
  { id: 'apis',        messageKey: 'nav-api',         path: '/apis' },
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
[`config/sectionNavigation.js`](../config/sectionNavigation.js)): `apis`,
`get-started`, `community`, `contribute`, `get-help`.

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

## Part 5 — Translatable prose pages (experiment)

Everything above describes a page you write **once per locale**. This part
describes the alternative: write the English **once**, mark the translatable
bits, and let a command generate every locale for you.

**Use it for** short pages that change often and are worth translating fully.
**Don't use it for** long-form pages, or anything where a translator needs the
whole page as context — those stay hand-authored per locale.

### How it fits together

```
content-i18n/<path>.md          you write this (English, once)
        │
        │  npm run generate-content-i18n
        ▼
i18n/content/en.json + qqq.json  extracted for translators
i18n/content/<locale>.json       translations come back here
        │
        ▼
content/<locale>/<path>.md       generated — DO NOT EDIT
```

- The base file mirrors the content tree **without** the locale folder:
  `content-i18n/experiments/open-data.md` → `/experiments/open-data`,
  `/he/experiments/open-data`, …
- Generated pages carry `i18nGenerated: true`. **Never hand-edit a file with
  that marker** — the next run deletes and rewrites it. Edit the base file.
- Nothing happens until you run the command. Editing a base file alone changes
  nothing on the site.

### The two marks

**A definition** carries the English text and gives it a key. It **renders in
place** — the text appears exactly where you wrote it:

```md
# :message[Access open data]{#title qqq="Page H1 and page title."}
```

**A reference** carries only a key. It resolves to text defined elsewhere:

```md
:message{#title}
```

`qqq` is the note translators read. Write it for someone who cannot see the
page: what the string is, where it appears, and anything they must not
translate. It is required in practice — a missing `qqq` is reported every run.

### Where do I put the definition?

**A definition renders in place.** So write it where the text belongs — in the
heading, in the paragraph, in the list item, in the table cell:

```md
## :message[Before you start]{#heading-before-you-start qqq="H2 above general guidance."}

- :message[Check the license of each dataset before you redistribute it.]{#practice-license qqq="Bulleted best-practice item."}

| :message[Data source]{#table-header-source qqq="Table column header."} | :message[Format]{#table-header-format qqq="Table column header."} |
```

That includes **inside a component attribute**. This works, and it is the
simplest thing when a component has only a little copy:

```md
::navigation-card{url="/explorer" title=":message[Lift Wing API]{#card-liftwing-title qqq='Card title. Proper name; not translated.'}"}
::
```

Note the **single quotes** around `qqq` — the attribute already uses double
quotes, so the inner one alternates. See the escaping table below.

### `:::messages` — when the line gets too long

Everything above still works when a component has three attributes of copy. It
just becomes unreadable:

```md
<!-- don't: one line, two English sentences, two translator notes, url buried -->
::navigation-card{url="https://meta.wikimedia.org/…/Research:Data" title=":message[Introduction to Wikimedia open data]{#card-intro-title qqq='Navigation card title. Destination is Research:Data on Meta-Wiki.'}" description=":message[Access publicly-available, open-licensed data about Wikimedia projects.]{#card-intro-description qqq='Navigation card description for the Research:Data card.'}" supporting-text=":message{#content-shared-read-more-on p1='Meta-Wiki'}"}
::
```

When that happens, lift the definitions into a **`:::messages` block** and leave
short references behind. The block renders nothing — it exists purely to get the
prose off the component line:

```md
:::messages
:message[Introduction to Wikimedia open data]{#card-intro-title qqq="Navigation card title. Destination is Research:Data on Meta-Wiki."}
:message[Access publicly-available, open-licensed data about Wikimedia projects.]{#card-intro-description qqq="Navigation card description for the Research:Data card."}
:::

:::navigation-card-grid
::navigation-card{url="https://meta.wikimedia.org/…/Research:Data" title=":message{#card-intro-title}" description=":message{#card-intro-description}"}
::
:::
```

Now the card line shows *structure* and the block above shows *content*. Inside
the block the `qqq` can go back to double quotes, because there is no attribute
wrapped around it.

**It's a judgement call, not a rule.** Both forms produce identical output and
identical files for translators — they only ever see `en.json` and `qqq.json`.
Pick whichever leaves a line you can still read. Rules of thumb:

- One short attribute → define in place.
- Two or more attributes of real prose → use a block.
- A long `qqq` → use a block; translator notes crowd a component line fast.

Put each block **immediately before the component it serves**, not all at the
top of the file. The generator doesn't care; you will, when you come back to
edit it.

The same applies to any component whose copy lives in attributes —
`::section-heading{title=…}`, `::api-catalog-wikimedia-section{title=… chip=…}`,
and so on.

> **One thing to avoid:** defining the text in the body *and* referencing it from
> the attribute. That renders it **twice** — once as a stray paragraph above the
> component, once inside it. Either define it in the attribute, or put the
> definition in a `:::messages` block. Never in ordinary body text.

### Repeating a string

A reference *is* the repeat mechanism. Define once, reference as often as you
like:

```md
:::messages
:message[Access free downloads of wiki content and data.]{#card-dumps-description qqq="Card description for the data-dumps card. Reused by the Bulk downloads card."}
:::

::navigation-card{url="…" description=":message{#card-dumps-description}"}
::
::navigation-card{url="…" description=":message{#card-dumps-description}"}
::
```

For a string repeated across **several pages**, define it in
`content-i18n/_shared/common.md` and reference it by its full key. Keys there
must start with `content-` (that is how the generator knows it is a cross-file
reference). A key may be defined **exactly once** anywhere — a second definition
is an error.

### Variables in a message

When the same sentence differs only by a name or a number, parameterize it
instead of writing near-duplicate strings. Put `$1` in the text and supply the
value on each **reference**:

```md
:::messages
:message[Read more on {{BIDI:$1}}]{#content-shared-read-more-on qqq="Card supporting text. $1 is the destination site, e.g. Meta-Wiki."}
:::

supporting-text=":message{#content-shared-read-more-on p1='Meta-Wiki'}"
supporting-text=":message{#content-shared-read-more-on p1='Wikidata'}"
```

`{{BIDI:$1}}` keeps a Latin-script name from scrambling the sentence in Hebrew,
Arabic, or Persian. **Wrap any name, title, or label you drop into a message
this way** — it does nothing visible in English and prevents a real bug in RTL
languages.

Values go on the reference, never on a definition inside `:::messages` (that
definition never renders, so it has nothing to substitute into).

### Multi-paragraph text

Use the block form when one translatable unit spans paragraphs:

```md
::message{#before-you-start-intro qqq="Two-paragraph intro. The second paragraph links to the User-Agent policy; keep the link."}
All of the data linked from this page is publicly available and openly licensed.

You do not need an account or an API key to read it.
::
```

Don't wrap a bulleted list in one of these — mark each item separately, so
translators get list items as list items.

### Escaping — the three you will hit

| Situation | Write |
|---|---|
| A literal `\|` inside a table cell | `:message[XML \| SQL]{#…}` |
| Any marker nested inside an attribute | Alternate the quote style: `title=":message[Text]{#key qqq='Note.'}"` |
| A `"` inside a `qqq` that already uses `"` | `qqq="Refers to the \"EventStreams\" service."` |

There are only ever **two** quoting levels, because the English text sits inside
`[ ]` rather than quotes. So apostrophes and quotes in the *text itself* need no
escaping at all — `:message[A project's "best" tools]{#…}` is fine as written,
even inside an attribute. Only `qqq` is quote-delimited, and alternating covers
it; backslash-escape only when one note needs both quote styles.

Markdown links need no escaping either: `:message[See the [dumps guide](/dumps) page]{#…}`
works as written. (Markdown inside an *attribute* renders as plain text, though —
the run warns you if you do that.)

### Running it

```bash
npm run generate-content-i18n
```

Then review the git diff and commit — base file, message files, and generated
pages together.

Everything is reported in one pass. Structural problems — an undefined key, a
key defined twice, a table broken by an unescaped pipe — are **errors**, and
nothing at all is written. Softer ones — a missing `qqq`, a translation for a
key you have since renamed — are **warnings**, and the run continues. It also
refuses to overwrite any page it doesn't own, so it can never eat a
hand-authored file.

Locales appear as their translations arrive (a locale below the configured
completeness threshold is skipped, and the run tells you so). A locale with no
message file simply falls back to English, exactly like a missing hand-authored
file.

### Making the page appear

Generating the files is only half of it. A generated page is an ordinary content
page, so it needs the same wiring as any other — with one wrinkle worth knowing
before it confuses you.

**Frontmatter goes in the base file, once.** Whatever you put there is copied to
every locale, so set `sidebar`, `prev`/`next` and the rest in
`content-i18n/<path>.md` and never in the generated copies:

```md
---
sidebar: false
---

# :message[Access open data]{#title qqq="Page H1."}
```

**Menus are configured, not authored** — exactly as in Parts 3 and 4. Add the page
to the top menu in `config/mainNavigation.ts`, or to a section menu in
`config/sectionNavigation.js`, by its URL. Nothing about that changes for a
message-driven page.

**But the menu label is an interface string, not page content.** This is the part
that catches people:

| String | Lives in | Because |
|---|---|---|
| Everything on the page | `i18n/content/` (generated from your base file) | It is page content |
| The menu label pointing at it | `i18n/en.json` (hand-edited) | Menu chrome is interface, and menus are shared across pages |

So a new page in a section menu means adding a `messageKey` entry to
`config/sectionNavigation.js` **and** that key to `i18n/en.json` by hand. Do not
put nav labels in `i18n/content/` — nothing reads that at runtime, and the label
will render as a raw key.

### Adding a page, start to finish

1. Create `content-i18n/<path>.md`. The path mirrors the content tree **without**
   the locale folder, so `content-i18n/get-help/faq.md` → `/get-help/faq`.
2. Write the English, marking translatable segments. Give every definition a
   `qqq`.
3. Run `npm run generate-content-i18n`. Fix anything it reports.
4. Check the generated `content/en/<path>.md` reads as you intended.
5. Wire up menus if the page needs to be reachable — nav entry plus its label in
   `i18n/en.json`.
6. Commit the base file, `i18n/content/en.json` and `qqq.json`, the generated
   pages, and `.banana-content-manifest.json` together.

Translations arrive later, as `i18n/content/<locale>.json`. Re-run the command and
that locale's page appears; you do not touch a list anywhere.

For the design behind all of this, see
[`adr-translatable-prose-content.md`](./adr-translatable-prose-content.md), and
[`guide/translatable-content.md`](./guide/translatable-content.md) for how the
system is meant to grow up.

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
| My edit to a page under `content/` vanished | That page is generated — it has `i18nGenerated: true`. Edit the base file named in its `sourceFile` frontmatter, then re-run `npm run generate-content-i18n` (Part 5). |
| I edited `content-i18n/` but the site is unchanged | Nothing regenerates on its own. Run `npm run generate-content-i18n` and commit the result. |
| A card title also appears as a stray paragraph above the grid | The definition was written in ordinary body text and referenced from the attribute, so it renders in both places. Move the definition into the attribute itself, or into a `:::messages` block (Part 5). |
| `reference to undefined key "content-…"` | Typo in the key, or it lives in `content-i18n/_shared/` and needs its full `content-…` name, not the short local one. |

---

## Related

- [`content-import-guide.md`](./content-import-guide.md) — imported/remote content
  and shared partials.
- [`adr-translatable-prose-content.md`](./adr-translatable-prose-content.md) — the
  design behind Part 5 (marker syntax, message ownership, known gaps).
- [`adr-language-catalog.md`](./adr-language-catalog.md) — the locale catalog and
  fallback design.
- Config touchpoints: [`config/mainNavigation.ts`](../config/mainNavigation.ts),
  [`config/sectionNavigation.js`](../config/sectionNavigation.js),
  [`config/contentRedirects.ts`](../config/contentRedirects.ts),
  [`content.config.ts`](../content.config.ts).
