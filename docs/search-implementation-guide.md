# Multilingual Content Search — Implementation Guide

This document captures every decision made while building the locale-partitioned
full-text search feature so it can be reimplemented cleanly on top of any future
state of the repository. Treat it as a recipe, not a diff — adapt placement and
styling to whatever the layout looks like at the time.

---

## What we are building

A search bar in the global layout header that:

- Queries the static content markdown pages (not the Scalar/OpenAPI explorer).
- Shows results partitioned by language: current-locale results first, then a
  labeled "Results in English" fallback section for non-English locales.
- Is RTL/BiDi safe per the project's AGENTS.md checklist.
- Uses banana-i18n for all UI strings (same as the rest of the interface).

---

## Tech stack decisions

### Search engine: Nuxt Content `useSearchCollection` (SQLite FTS5)

**Do NOT use Lunr.** Nuxt Content v3 ships its own SQLite FTS5 search that is
already wired up via `nuxt.config.ts`. The correct composable is:

```ts
const { search } = useSearchCollection( 'content' )
const results = await search( query, { limit: 30, snippet: { columns: ['content'], around: 20, tag: 'mark' } } )
```

`useSearchCollection` is auto-imported by the `@nuxt/content` module — no
explicit import needed.

**Do NOT use** `searchContent()` — that function does not exist in v3.

**Do NOT import `SearchResult`** from `@nuxt/content` — it is not on the public
API surface. Define a local interface instead (see composable section below).

### Scope: content pages only (for now)

Searching the currently-loaded OpenAPI/Scalar spec was intentionally deferred.
Scalar does not expose programmatic navigation to individual operations, so
deep-linking search results into the explorer is not yet feasible. Revisit in a
separate PR once Scalar exposes hash anchors or a navigation API.

### Static-first build (`nuxt generate`): deferred

The project currently uses `nuxt build` (SSR via Netlify Functions). Switching
to `nuxt generate` for prose pages was deferred because the site may eventually
need to support ~400 interface languages, and the scaling implications on static
generation have not been analysed. **Do not switch to `nuxt generate` until that
analysis is done in a separate PR.**

---

## nuxt.config.ts changes

Two changes are required on top of what main already has.

### 1. Fix stale SQLite file accumulation

Prod builds create `.data/content/contents-{pid}.sqlite` per run and never
clean them up. Add a cleanup function and a `build:before` hook:

```ts
import { readdirSync, unlinkSync } from 'fs'
import { join } from 'path'

// ... existing isDevelopment / contentLocalDatabaseFilename declarations ...

function cleanStaleContentDatabases(): void {
    const dir = join( process.cwd(), '.data/content' )
    try {
        for ( const file of readdirSync( dir ) ) {
            if ( file.startsWith( 'contents-' ) && file.endsWith( '.sqlite' ) ) {
                try { unlinkSync( join( dir, file ) ) } catch { /* ignore */ }
            }
        }
    } catch { /* directory may not exist yet */ }
}

export default defineNuxtConfig( {
    // ... all existing config ...

    hooks: {
        'build:before': () => {
            if ( !isDevelopment ) {
                cleanStaleContentDatabases()
            }
        }
    }
} )
```

### 2. No other nuxt.config.ts changes needed

The SQLite connector split (`sqlite3` in dev, `better-sqlite3` in prod) and the
`_localDatabase` filename config are already present on main and must be kept.

---

## banana-i18n plugin bug fix

`banana.i18n(key, params)` expects parameters as a **positional array**, not an
object. The plugin was passing `{ $1: value }` directly, causing `[object Object]`
to appear in substituted strings. Fix the `i18n()` function inside
`app/plugins/banana-i18n.ts`:

```ts
// Replace this:
const translatedMessage = banana.i18n( messageKey, parameters )

// With this:
const args: string[] = []
for ( let i = 1; parameters[ `$${ i }` ] !== undefined; i++ ) {
    args.push( parameters[ `$${ i }` ] )
}
const translatedMessage = banana.i18n( messageKey, args )
```

This fix is needed for any message that uses `$1` substitution (currently only
`search-no-results`). It is backwards-compatible with messages that take no
parameters.

---

## i18n message keys

Add these keys to **all five locale files** (`i18n/en.json`, `es.json`, `fr.json`,
`he.json`, `fa.json`). The `$1` placeholder in `search-no-results` must be
wrapped in FSI (`\u2068`) / PDI (`\u2069`) Unicode isolation markers so that a
RTL query string embedded in a LTR sentence (or vice versa) renders correctly.

```json
"search-label": "Search documentation",
"search-placeholder": "Search…",
"search-no-results": "No results for \u2068$1\u2069",
"search-results-fallback-heading": "Results in English",
"search-result-page-label": "Page"
```

Translations used in the previous implementation (adapt as needed):

| Key | es | fr | he | fa |
|-----|----|----|----|----|
| `search-label` | Buscar en la documentación | Rechercher dans la documentation | חיפוש בתיעוד | جستجو در مستندات |
| `search-placeholder` | Buscar… | Rechercher… | חיפוש… | جستجو… |
| `search-no-results` | Sin resultados para ⁨$1⁩ | Aucun résultat pour ⁨$1⁩ | אין תוצאות עבור ⁨$1⁩ | نتیجه‌ای برای ⁨$1⁩ یافت نشد |
| `search-results-fallback-heading` | Resultados en inglés | Résultats en anglais | תוצאות באנגלית | نتایج به انگلیسی |
| `search-result-page-label` | Página | Page | דף | صفحه |

(All `$1` cells above show the visible text; the actual JSON must contain the
`\u2068` and `\u2069` markers around `$1`.)

---

## Content markdown

Main currently has stub content files. Replace them with substantive, searchable
prose so that the FTS index is actually useful. Each locale's files should cover:

- **index.md**: Introduction to the REST API, module discovery, authentication
  (OAuth 2.0 / PKCE), language/locale support.
- **about.md**: Technical design (hybrid SSR + SQLite), contributing workflow
  (Gerrit, translations).

French `about.md` can be intentionally omitted to exercise the English fallback
path during development.

Content structure in `content/`:
```
content/
  en/index.md   en/about.md
  es/index.md   es/about.md
  fr/index.md   (no about.md — fallback test)
  he/index.md   he/about.md
  fa/index.md   fa/about.md
```

---

## The composable: `app/composables/useContentSearch.ts`

Create this file from scratch:

```ts
/**
 * Local mirror of the SearchResult shape from @nuxt/content FTS internals.
 * Not imported from the package — SearchResult is not on the public API.
 */
export interface ContentSearchResult {
    collection: string
    id: string
    title: string
    titles: string[]
    level: number
    content: string
    rank: number
    snippets?: {
        title?: string
        content?: string
    }
}

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_DELAY_MS = 200

/**
 * Returns true if a search result section belongs to the given locale.
 *
 * Section IDs follow two patterns produced by Nuxt Content's FTS builder:
 *   - Page root:  /{locale}/{slug}  (e.g. /en/about, /en)
 *   - Subsection: /{locale}/{slug}#{anchor}  (e.g. /en/about#authentication)
 */
function isFromLocale( resultId: string, localeCode: string ): boolean {
    const localePath = `/${ localeCode }`
    return (
        resultId === localePath ||
        resultId.startsWith( `${ localePath }/` ) ||
        resultId.startsWith( `${ localePath }#` )
    )
}

export function useContentSearch(
    query: Ref<string>,
    localeCode: Ref<string>
): {
    localeResults: Ref<ContentSearchResult[]>
    fallbackResults: Ref<ContentSearchResult[]>
    isSearching: Ref<boolean>
} {
    const { search } = useSearchCollection( 'content' )

    const localeResults = ref<ContentSearchResult[]>( [] )
    const fallbackResults = ref<ContentSearchResult[]>( [] )
    const isSearching = ref( false )

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    async function runSearch(): Promise<void> {
        const queryValue = query.value.trim()
        const locale = localeCode.value

        if ( queryValue.length < MIN_QUERY_LENGTH ) {
            localeResults.value = []
            fallbackResults.value = []
            return
        }

        isSearching.value = true
        try {
            const rawResults = await search( queryValue, {
                limit: 30,
                snippet: {
                    columns: [ 'content' ],
                    around: 20,
                    tag: 'mark'
                }
            } )

            localeResults.value = rawResults.filter(
                ( result ) => isFromLocale( result.id, locale )
            )

            // Fallback to English only when the requested locale is not English.
            fallbackResults.value = locale === 'en'
                ? []
                : rawResults.filter( ( result ) => isFromLocale( result.id, 'en' ) )
        } finally {
            isSearching.value = false
        }
    }

    watch(
        [ query, localeCode ],
        () => {
            if ( debounceTimer !== null ) {
                clearTimeout( debounceTimer )
            }
            debounceTimer = setTimeout( runSearch, DEBOUNCE_DELAY_MS )
        }
    )

    return { localeResults, fallbackResults, isSearching }
}
```

---

## The component: `app/components/ContentSearch.vue`

Key design points:

- `CdxSearchInput` with `dir="auto"` — this attribute propagates to the actual
  `<input>` because CdxSearchInput passes `$attrs` through `mergeProps` to the
  inner input. `dir="auto"` is required so RTL query text renders correctly
  regardless of page direction.
- Results panel: `position: absolute`, `inset-block-start: 100%`,
  `inset-inline-start: 0 / inset-inline-end: 0`. All CSS must use logical
  properties — no physical `left`/`right`/`top`/`bottom`.
- All `result.title` and `result.snippets.content` must be wrapped in `<bdi>`.
  Snippet content uses `v-html` (FTS injects `<mark>` tags) — the biome lint
  suppression comment is intentional.
- `noResultsMessage` (banana-i18n output) does **not** get a `<bdi>` wrapper —
  banana-i18n strings are trusted interface text. The user-typed query inside it
  is isolated via the FSI/PDI markers in the message string itself.
- `resultPath()` maps FTS section IDs back to navigable routes:
  - Strips the locale prefix (e.g. `/en/about` → `/about`).
  - Calls `localePath( slugPath, resultLocale )` from `useLocalePath()`.
  - Re-attaches the `#anchor` after the path (not inside `localePath`).
  - `index` slug and empty slug both map to `/` (root path for that locale).

### Known open issue: result links with anchors

At the time of writing, clicking a result that resolves to `/#section` (a
section on the current page) correctly scrolls but does not cause a navigation.
Results on other pages (`/about#section`) navigate correctly. This is a Vue
Router behavior for same-route hash navigation, not a bug in `resultPath`. If
this causes UX friction, one workaround is to strip the anchor from the `to`
prop and scroll programmatically after navigation.

### Escape / click-outside

Use `useTemplateRef<HTMLElement>('container')` + a `mousedown` listener on
`document` to close the panel when clicking outside. Close on `@keydown.escape`
too. `handleResultClick` closes the panel and clears the query.

---

## Wiring into the layout

Add `<ContentSearch>` to `app/layouts/default.vue` after the language picker
`<CdxField>`. The search component is self-contained and positions its results
panel relative to itself, so placement in any flex row works.

Add a CSS rule for the search component's host class, e.g.:
```css
.frontdoor-shell__search {
    inline-size: min( 20rem, 100% );
}
```

The `$interfaceLocale` ref from the banana-i18n plugin is passed directly to
`useContentSearch` as the `localeCode` argument, so search results automatically
re-partition when the user switches language.

---

## RTL / BiDi checklist

When reimplementing, verify each of these before marking complete:

- [ ] `CdxSearchInput` has `dir="auto"` attribute
- [ ] All `result.title` output is in `<bdi>`
- [ ] All `result.snippets.content` output is in `<bdi>`
- [ ] `search-no-results` `$1` substitution is wrapped in FSI/PDI in **all five**
      locale JSON files
- [ ] No physical CSS properties (`left`, `right`, `top`, `bottom`, `margin-left`,
      `padding-right`, etc.) in the component's `<style>` block
- [ ] Results panel uses `inset-inline-*` and `inset-block-*`
- [ ] Spinner border highlight uses `border-block-start-color`

---

## Deferred / open questions (document in ARCHITECTURE.md)

1. **Static-first build strategy** — switching to `nuxt generate` for prose
   pages is desirable but needs analysis at ~400-language scale before
   committing. Do not do this in the same PR as search.

2. **Scalar/OpenAPI spec search** — Scalar does not currently expose
   programmatic navigation to individual operations. Deferred until Scalar
   provides hash anchors or a navigation callback. When it does, a separate
   search collection or a client-side index over the loaded spec JSON would be
   the approach.
