# Content import guide (remote sources & shared partials)

A practical how-to for **adding and changing imported content**: remote content
sources (`config/remoteContentSources.ts`) and shared partials
(`config/sharedPartials.ts`). For the *why* behind these mechanisms, see
`docs/adr-remote-content-fetching.md`.

---

## Mental model (read this first)

- **Fetching is a standalone step, not part of the build.** `npm run build` uses
  whatever content is already committed. You refresh content deliberately.
- **Imported content is committed.** Its git diff is your review surface.
- **Every fetch wipes and recreates.** Files the script owns are deleted and
  regenerated, so removed sources / renamed slugs / dropped translations never
  leave a stale file behind. Hand-authored content (including shared partials) is
  never touched.

### The workflow for any change below

```bash
# 1. Edit config (and, for partials, author the partial file)
# 2. Regenerate imported content
npm run fetch-remote-content
# 3. Review the diff — added / changed / REMOVED pages and slugs
git diff
# 4. Commit when it looks right
```

If a fetch fails (e.g. the source is down) you'll see warnings and "content
unavailable" placeholders in the diff — **don't commit those**; re-run when the
source is back.

---

## Part 1 — Remote content sources

All sources live in the `REMOTE_CONTENT_SOURCES` array in
[`config/remoteContentSources.ts`](../config/remoteContentSources.ts). Two
strategies.

### 1a. Add a raw-Markdown source (`markdown-url`)

Fetches one Markdown file from a URL.

```ts
{
  id: 'terms-of-use',              // unique; used in logs
  strategy: 'markdown-url',
  remoteUrl: 'https://example.org/portal-docs/terms.md',
  localPath: 'terms-of-use',       // → content/en/terms-of-use.md → /terms-of-use
  locale: 'en',                    // optional; defaults to 'en'
  overrideFrontmatter: { title: 'Terms of Use' }
}
```

The file must be MDC-compatible Markdown (not MDX) — see ADR §3.

### 1b. Add a wiki translated-page source (`mediawiki-translated-page`)

Fetches a MediaWiki page **and all its translation subpages**, one Nuxt Content
file per locale.

```ts
{
  id: 'translate-help',
  strategy: 'mediawiki-translated-page',
  wikiApiUrl: 'https://www.mediawiki.org/w/api.php',
  pageTitle: 'Help:Extension:Translate',   // canonical title, with namespace
  localPath: 'translate-help',              // → content/<locale>/translate-help.md
  minTranslatedPercent: 85,                 // skip thinly-translated locales
  componentMapping: { code: true, callouts: true },   // optional; both default true
  attribution: { license: 'CC BY-SA 4.0' }             // adds a CC BY-SA footer
}
```

How it resolves locales: the fetcher asks the wiki's Translate extension
(`messagegroupstats`) which languages the page is translated into, keeps those at
or above `minTranslatedPercent`, and writes `content/<locale>/<localPath>.md` for
each. English is always included.

### Field reference

| Field | Strategy | Purpose |
|---|---|---|
| `id` | both | Unique identifier (logs/warnings). |
| `strategy` | both | `'markdown-url'` or `'mediawiki-translated-page'`. |
| `localPath` | both | Path under `content/<locale>/`, no extension → the route. |
| `overrideFrontmatter` | both | Frontmatter to inject/override (e.g. `title`). |
| `navEntry` | both | Optional primary-nav entry (see below). |
| `remoteUrl` | markdown-url | Source Markdown URL. |
| `locale` | markdown-url | Target locale (default `en`). |
| `wikiApiUrl` | wiki | MediaWiki Action API endpoint. |
| `pageTitle` | wiki | Canonical source page title (with namespace). |
| `minTranslatedPercent` | wiki | Skip translations below this % (default 1). |
| `componentMapping` | wiki | Toggle content conversions: `code`, `callouts` (both default true). |
| `attribution` | wiki | `{ license }` → provenance frontmatter + `::attribution` footer. |

### Add a navigation entry (optional)

To surface a page in the primary top nav, add `navEntry`:

```ts
navEntry: {
  target: 'primary',
  messageKey: 'nav-terms',       // banana-i18n key — MUST exist in i18n/*.json
  navPosition: 'after:community' // or a numeric index; 'after:<id>' refers to a
                                 // MAIN_NAVIGATION_ITEMS id
}
```

**Before enabling a nav entry, add its `messageKey` to the locale files.** At
minimum add it to `i18n/en.json` **and** to `i18n/es.json`, `fr.json`, `he.json`,
`fa.json` — a key missing from a locale that *has* a message file renders as the
raw key (banana returns the key, bypassing English fallback). The ~570
file-less catalog locales fall back to English automatically.

> The demo sources ship with their `navEntry` blocks commented out. To show a
> demo page in the nav, uncomment its block and ensure the `messageKey` exists in
> the locale files.

### Change a slug, or remove a source

Just edit or delete the config entry and re-fetch. Because of wipe-and-recreate,
the old files are deleted and appear as **removals in the git diff**. If a
removed/renamed URL should not start returning 404, add a redirect in
[`config/contentRedirects.ts`](../config/contentRedirects.ts)
(`LEGACY_PATH_REDIRECTS`, HTTP 301).

---

## Part 2 — Shared partials

A **shared partial** is portal-authored content, inserted at a spot chosen by a
wiki page, and **shared across all of that page's translations**. The wiki holds
only a *placeholder*; the content lives in the markdown system, so it can use MDC
components, Vue, and banana-i18n, and you edit it in one place.

Three pieces: the **authored file**, the **registry entry**, and the **wiki
placeholder**.

### Add a shared partial (step by step)

**1. Author the partial file** at `content/_partials/shared/<name>.md`. It is a
plain content snippet (no frontmatter needed) and may use MDC components:

```md
::callout{type="notice"}
This section is maintained in the Wikimedia Developer Portal and shared across
all translations of this page.
::
```

Partials are committed and hand-maintained — they are **never fetched or wiped**.

**2. Register the name** in
[`config/sharedPartials.ts`](../config/sharedPartials.ts) by adding to
`SHARED_PARTIALS`:

```ts
export const SHARED_PARTIALS: readonly SharedPartial[] = [
  { name: 'portal-note', path: '/_partials/shared/portal-note' },
  { name: 'api-note',    path: '/_partials/shared/api-note' }   // ← new
]
```

- `name` — how the partial is referenced (kebab-case, unique).
- `path` — the Nuxt Content path of the file from step 1 (`content/_partials/shared/<name>.md` → `/_partials/shared/<name>`).

This list is an **allowlist and a security boundary**: because a partial name can
come from wiki text, only registered names resolve — there is no path derivation
from the name, so a wiki page cannot pull in an arbitrary content path.

**3. Add the placeholder to the wiki page.** In the source page's wikitext, put
an **empty** marker where the partial should appear:

```html
<div class="frontdoor-partial" data-partial="api-note"></div>
```

It's empty, so translators can't alter it and it's safe inside or outside
`<translate>` units. (A wiki template that renders this same div works too.)

**4. Re-fetch.** `npm run fetch-remote-content` replaces the placeholder with a
`::partial{name="api-note"}` directive in every locale's page; the `Partial`
component renders your authored file at page load.

### Use a partial in authored content too

`::partial` is a normal MDC component — you can drop it into any hand-authored
page, not just imported ones:

```md
::partial{name="portal-note"}
::
```

### Change or remove a partial

- **Change:** edit `content/_partials/shared/<name>.md`. Every page that
  references it updates — no re-fetch needed for the content itself.
- **Remove:** delete the file, remove its `SHARED_PARTIALS` entry, and remove the
  placeholder from the wiki page(s). If a placeholder for an unregistered name is
  left on a wiki page, the next fetch **drops it and logs a warning** (one per
  source) — it won't break the build.

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| Placeholder text still shows / no partial inserted | `name` not in `SHARED_PARTIALS`; or a typo in `class="frontdoor-partial"` / `data-partial`; or the page wasn't re-fetched. Check the fetch log for an "unregistered shared partial" warning. |
| `::partial` renders nothing | Name not registered, or the authored file is missing at the registered `path`. |
| Callout/code not converting in a fetched page | `componentMapping` toggle off, or the source HTML doesn't use MediaWiki's `mw-highlight-lang-*` / message-box classes. |
| Page is a "content unavailable" placeholder | The fetch failed for that page — check warnings; re-run; don't commit the placeholder. |

---

## Related

- `docs/adr-remote-content-fetching.md` — decisions (strategies, lifecycle §10, conversion registry & shared partials §11).
- `docs/adr-language-catalog.md` — the locale catalog imported pages land in.
- Regenerate the language catalog: `npm run generate-language-catalog`.
