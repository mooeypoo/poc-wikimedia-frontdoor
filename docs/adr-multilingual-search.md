# ADR: Multilingual Content Search

**Status:** Decided  
**Scope:** Content markdown pages only (see §4 for Scalar deferral)

---

## 1. Replace Lunr with Nuxt Content FTS5

**Decision:** Use `useSearchCollection('content')` from `@nuxt/content` v3. Remove Lunr and `lunr-languages`.

**Context:** `TECH_DECISIONS.md` listed Lunr as the search backend, but Nuxt Content v3 ships SQLite FTS5 as a built-in, already configured in `nuxt.config.ts`. Lunr would require maintaining a separate build step to generate an index, and a separate strategy for per-language tokenisation.

**Rationale:**
- FTS5 is already running. No new dependencies, no index build step.
- Result IDs produced by Nuxt Content's FTS builder are locale-prefixed paths (`/en/about`, `/fr/about#section`), which enables exact locale partitioning without any extra metadata.
- `lunr-languages` support for RTL languages (Arabic script, Hebrew) is incomplete. FTS5 is language-agnostic.

**Consequences:**
- `useSearchCollection` is auto-imported by the `@nuxt/content` module — no explicit import needed.
- `SearchResult` is **not** exported from `@nuxt/content`'s public API. Define a local `ContentSearchResult` interface that mirrors the shape rather than importing from internal paths.
- The correct call signature is `search(query, options)` where `snippet` lives inside the options object of `search()`, **not** inside `useSearchCollection()`. Passing `snippet` to `useSearchCollection()` causes a type error.

**Correction to `TECH_DECISIONS.md`:** The "Search" row must be updated from `Lunr.js + lunr-languages` to `@nuxt/content FTS5 via useSearchCollection`.

---

## 2. Search scope: content pages only

**Decision:** Search covers the `content/` markdown collection only. The Scalar/OpenAPI explorer is excluded.

**Context:** The explorer loads OpenAPI specs at runtime and renders them inside a third-party `@scalar/api-reference` component.

**Rationale:** Scalar does not expose programmatic navigation to individual operations (no deep-link API, no hash-anchor callbacks). Indexing the spec client-side is feasible in principle, but there is no way to navigate a user to a specific operation after a match. This would produce dead results.

**Deferred to a future PR.** Revisit if Scalar adds a navigation API or exposes operation-level hash anchors. When that happens, the approach would be a separate search index over the loaded spec JSON, with results rendered in a distinct section of the same panel.

---

## 3. Locale partitioning by path prefix

**Decision:** Filter raw FTS results into two buckets using the result's `id` field:
- **`localeResults`** — IDs that start with `/{activeLocale}/` or `/{activeLocale}#`.
- **`fallbackResults`** — IDs that start with `/en/` or `/en#`, populated only when the active locale is not English.

**Context:** Nuxt Content's FTS builder sets each section's `id` to its content path. The content directory is structured as `content/{locale}/{slug}.md`, so IDs are reliably locale-prefixed.

**Rationale:** Path prefix matching is O(n) over the result set and requires no extra metadata. The three cases that must be handled:
```
resultId === '/{locale}'               // root page
resultId.startsWith('/{locale}/')      // any sub-page
resultId.startsWith('/{locale}#')      // section on root page
```

**Consequences:**
- Fallback results are always English regardless of which non-English locale is active. There is no multi-hop fallback (e.g. `fr` → `es` → `en`).
- Both result buckets must be cleared when the query is shorter than the minimum length (2 characters).

---

## 4. English fallback: labeled, secondary

**Decision:** When the active locale is not English and English results exist, display them in a separate, labeled section below the locale results — not mixed in.

**Rationale:** Mixing locales without a label is confusing, especially for RTL locales where English results would flip direction mid-list. A labeled section communicates clearly that the content is not yet translated.

**UI string key:** A single parameterized key, `search-results-locale-heading` (`"Results in {{bidi:$1}}"`), serves both the active-locale and English-fallback headings. The translated language name is passed as `$1`, so there is no separate `search-results-fallback-heading` key — the English-fallback section reuses the same key with `$1` resolved to "English". `{{bidi:$1}}` provides BiDi isolation around the language name (see §8).

---

## 5. Stay on `nuxt build` — do not switch to `nuxt generate`

**Decision:** Search does not require, and this PR must not introduce, a switch from `nuxt build` (SSR via Netlify Functions) to `nuxt generate` (static pre-rendering).

**Context:** `TECH_DECISIONS.md` originally described the prose shell as "pre-rendered via `nuxt generate`" — this was aspirational, not yet implemented. The actual build uses `nuxt build`.

**Rationale:** The site may eventually need to support ~400 interface languages. At that scale, `nuxt generate` would produce a combinatorial number of static routes (400 locales × N content pages). The scaling and caching implications have not been analysed. Switching build strategies mid-feature is also a large blast radius change.

**Consequence:** `ARCHITECTURE.md` should note this explicitly as an open question and include the constraint: *do not switch to `nuxt generate` until scale analysis is complete in a separate PR.*

**Correction to `TECH_DECISIONS.md`:** The "Site architecture" section incorrectly states prose pages are "pre-rendered via `nuxt generate`". Correct to: rendered server-side via `nuxt build` on Netlify Functions.

---

## 6. banana-i18n for all search UI strings

**Decision:** All search UI strings (label, placeholder, no-results message, fallback heading) go through banana-i18n via `$bananaI18n()`. Do not use `$t()` or any `@nuxtjs/i18n` translation function.

**Context:** The project uses two i18n systems with a strict division: `@nuxtjs/i18n` handles URL prefix routing only; banana-i18n handles every interface string. This split already exists throughout the codebase.

**Consequence:** All five locale JSON files (`i18n/en.json`, `es.json`, `fr.json`, `he.json`, `fa.json`) need the same set of `search-*` keys.

---

## 7. banana-i18n parameter bug: pass array, not object

**Decision:** When calling `banana.i18n(key, params)`, parameters must be passed as a **positional array**, not as `{ $1: value }`.

**Context:** The plugin's `i18n()` wrapper accepted `Record<string, string>` and forwarded it directly to `banana.i18n()`. The banana-i18n library treats the second argument as the first positional replacement (`$1`), so passing the whole object produced `[object Object]` in the rendered string.

**Fix:** Extract `$1`, `$2`, … keys in order into an array before calling `banana.i18n`:

```ts
const args: string[] = []
for ( let i = 1; parameters[ `$${ i }` ] !== undefined; i++ ) {
    args.push( parameters[ `$${ i }` ] )
}
// Spread the array — banana.i18n() takes positional replacements as variadic
// arguments ($1, $2, …), so passing the array itself would land it all in $1.
const translatedMessage = banana.i18n( messageKey, ...args )
```

**Consequence:** This fix is backwards-compatible. Messages with no parameters pass an empty array, which is fine.

---

## 8. BiDi strategy for search results

**Decision:**
- Wrap every `result.title` and `result.snippets.content` in `<bdi>`.
- Add `dir="auto"` to the `CdxSearchInput` element.
- Do **not** wrap `$bananaI18n()` output in `<bdi>` — those are trusted interface strings.
- Wrap user-supplied substitution values (`$1` etc.) in FSI (`\u2068`) / PDI (`\u2069`) markers inside the message string in each locale JSON file.

**Context:** Result titles and snippet text come from content files that may be in any direction. User-typed queries embedded in "no results for X" messages may be RTL even when the interface language is LTR (or vice versa).

**Rationale:**
- `<bdi>` isolates an unknown-direction string from surrounding content without requiring a known `dir` value.
- `dir="auto"` on the input lets the browser infer direction from the first strong character of the query — necessary for RTL searches in an LTR interface.
- FSI/PDI in message strings is the correct alternative to `<bdi>` for text that passes through banana-i18n substitution, since the output is a plain string, not DOM.
- `CdxSearchInput` has `inheritAttrs: false` internally but merges `$attrs` (including `dir`) onto the inner `<input>` element via `mergeProps`, so `dir="auto"` reaches the actual input.

**CSS requirement:** All component styles must use logical properties exclusively:
`inset-inline-start/end`, `inset-block-start/end`, `padding-inline`, `padding-block`, `margin-block`, `inline-size`, `block-size`. No physical `left`, `right`, `top`, `bottom`.

---

## 9. SQLite stale file cleanup

**Decision:** Add a `ready` Nuxt hook that, in development, deletes old `contents-{pid}.sqlite` files left behind by previous dev servers.

**Context:** `nuxt.config.ts` derives the content DB filename per process (`contents-{pid}.sqlite`) so a previous dev server that exited uncleanly does not lock the file the new one needs (`SQLITE_BUSY: database is locked`). The trade-off is that those per-PID files accumulate in `.data/content/` across restarts, so something has to sweep the stale ones.

**Fix in `nuxt.config.ts`:** Runs on the `ready` hook, **development only**, and skips the current process's own file:

```ts
hooks: {
    ready: async () => {
        if ( !isDevelopment ) {
            return
        }
        const { readdir, unlink } = await import( 'node:fs/promises' )
        const { join } = await import( 'node:path' )
        const dir = '.data/content'
        const currentFile = `contents-${ process.pid }.sqlite`
        try {
            const files = await readdir( dir )
            await Promise.all(
                files
                    .filter( ( f ) => f !== currentFile && f.startsWith( 'contents-' ) && f.endsWith( '.sqlite' ) )
                    .map( ( f ) => unlink( join( dir, f ) ).catch( () => undefined ) )
            )
        } catch {
            // .data/content does not exist yet on a fresh checkout — safe to ignore.
        }
    }
}
```

**Note:** This targets the dev workflow, where repeated `nuxt dev` restarts are the source of accumulation. If a live dev server still holds a lock, `lsof .data/content/contents-{pid}.sqlite` finds the PID so it can be stopped before restarting.
