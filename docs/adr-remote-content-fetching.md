# ADR: Remote Content Fetching

**Status:** Decided  
**Scope:** Build-time prose content — Markdown files fetched from remote URLs and rendered as shell-chrome pages

---

## 1. Consolidated build script replaces the undocumented `sync-wiki-content.js`

**Decision:** Create `scripts/fetch-remote-content.mjs` as the single, authoritative build-time content-fetching script. This subsumes and replaces the previously documented `scripts/sync-wiki-content.js` and `config/wikiContentSources.js`, neither of which was ever implemented.

**Context:** `ARCHITECTURE.md` and `TECH_DECISIONS.md` both describe a `sync-wiki-content.js` script that fetches on-wiki translations via the MediaWiki Action API. The file was never created. The feature described in this ADR is the first concrete implementation of that documented intent, generalized to support arbitrary remote Markdown URLs as Phase 1, with MediaWiki Action API and HTML-to-Markdown as planned Phase 2 strategies.

Maintaining two parallel scripts (`sync-wiki-content.js` for wiki sources and a new script for other remote Markdown) would duplicate structure, tooling, and build pipeline integration. A single configurable script with a `strategy` field per source entry is cleaner.

**Rationale:** A `strategy` discriminator in the source config allows different fetch modes to coexist in one pipeline. Phase 1 implements `'markdown-url'` only. Future strategies (`'mediawiki-action-api'`, `'html-url'`) are added as additional cases in the same script, not as separate files.

**Consequences:**
- `ARCHITECTURE.md` "Wiki content sync" section must be updated to reference `fetch-remote-content.mjs` and `remoteContentSources.ts`.
- `TECH_DECISIONS.md` "Wiki content sync" section must be updated identically.
- The Experiment 3 description in `TECH_DECISIONS.md` should reference this ADR as its implementation track.
- `config/wikiContentSources.js` should not be created — `config/remoteContentSources.ts` is its replacement.

---

## 2. Config lives in `config/remoteContentSources.ts`

**Decision:** All remote source definitions live in a new `config/remoteContentSources.ts`. No source URLs, paths, or nav metadata are hardcoded anywhere outside this file.

**Context:** AGENTS.md Rule 6 requires all configuration in `config/`. The wiki content sync sources were already documented there as a planned config file. This is that file.

**Config shape:**

```ts
export interface RemoteContentSource {
  id: string
  strategy: 'markdown-url'  // extend when Phase 2 strategies added
  remoteUrl: string
  localPath: string

  // Phase 1: single locale (defaults to 'en')
  locale?: string

  // Phase 2: multi-locale URLs (reserved, not yet used by script)
  // When implemented: fetch each URL per locale, write to content/[locale]/
  // Existing sources don't change; script checks for localeFiles first
  localeFiles?: Record<string, string>

  overrideFrontmatter?: Record<string, unknown>
  navEntry?: RemoteContentNavEntry
}

export interface RemoteContentNavEntry {
  target: 'primary'  // 'explorer-side' planned for Phase 2
  messageKey: string
  navPosition: number | `after:${string}`
}

// Phase 1 example:
// {
//   id: 'terms-of-use',
//   strategy: 'markdown-url',
//   remoteUrl: 'https://example.org/portal-docs/terms.md',
//   localPath: 'terms-of-use',
//   locale: 'en',
//   overrideFrontmatter: { title: 'Terms of Use' },
//   navEntry: {
//     target: 'primary',
//     messageKey: 'nav-terms',
//     navPosition: 'after:about',
//   },
// }

// Phase 2 example (when multi-locale is implemented):
// {
//   id: 'api-docs',
//   strategy: 'markdown-url',
//   localPath: 'api-overview',
//   localeFiles: {
//     en: 'https://example.org/docs/api.md',
//     fr: 'https://example.org/docs/fr/api.md',
//     ar: 'https://example.org/docs/ar/api.md',
//   },
//   overrideFrontmatter: { title: 'API Overview' },
//   navEntry: {
//     target: 'primary',
//     messageKey: 'nav-api-docs',
//     navPosition: 'after:api-explorer',
//   },
// }
```

**Consequences:**
- The script imports this config directly; no discovery, no runtime reading.
- Adding a new remote source requires a code change to this file and a deploy — this is intentional. Remote sources are explicit declarations, not dynamic.
- Phase 1 sources use `remoteUrl` + `locale`; Phase 2 will use `localeFiles` instead. Both can coexist in the same config file.
- Gitignore prevents fetched files from being committed; they are always regenerated from remote sources at build time.

---

## 3. Accepted Markdown format: MDC (`.md`), not MDX

**Decision:** Remote files fetched with `strategy: 'markdown-url'` must be in MDC-compatible Markdown (`.md`). JSX-based MDX syntax is not supported and will not be supported without a deliberate future decision.

**Context:** Nuxt Content uses micromark + the MDC (Markdown Components) extension for parsing. MDC allows custom components via `::component-name{props}` block syntax. JSX-based MDX (import statements, `<Component />` JSX syntax, export statements) is a different format and is not parsed by Nuxt Content's pipeline. Passing a JSX MDX file through the pipeline produces either silent stripping of JSX syntax or a parse error depending on the content.

**Rationale:** The portal cannot silently accept files in an incompatible format. Owners of the remote source must know what format is required before they write it.

**Obligations this places on the remote source:**

The remote Markdown file must:
- Be valid CommonMark Markdown
- Use MDC component syntax (`::component-name{prop="value"}`) if it needs custom components, not JSX
- Declare frontmatter (YAML front matter block) with at minimum a `title` field, or rely on `overrideFrontmatter` in the source config to supply one

The remote Markdown file must not:
- Use `import` or `export` statements
- Use JSX element syntax (`<MyComponent />`)
- Reference components not already registered in `app/components/content/`

**How to enforce this contract:** Document the format requirement at the point of configuration (in the JSDoc on `RemoteContentSource.remoteUrl`) and in the build script's error output when the fetched content fails to produce a valid rendered page. There is no build-time format validator for MDC beyond what Nuxt Content itself produces; misuse will surface as a rendering error at build time or at page load.

**Consequences:**
- The contract is a documentation and communication requirement, not a code enforcement. The portal team must communicate this to the team(s) owning the remote files before they are registered as sources.
- If a future source must be fetched from a JSX MDX file that cannot be changed to MDC, that requires a deliberate decision to add an MDX-to-MDC conversion step — it is not a silent "just works" path.

---

## 4. Locale: English by default; multi-locale reserved for Phase 2

**Decision:** In Phase 1, fetched files are written to `content/en/[localPath].md`. The locale defaults to `'en'` unless `source.locale` is explicitly set. Other locales fall back to the English file via the existing fallback chain in `config/languages.ts`.

**Context:** The current content directory is structured as `content/[locale]/`. The existing `useLocalizedContentPage` composable walks a fallback chain when a locale-specific file is absent. Remote content declared without an explicit locale will therefore be served to visitors of all locales via the English fallback — which is correct for Phase 1, where the remote source is English-only content.

**Multi-locale feature (Phase 2):** When the same content is available in multiple languages from different remote URLs, a single source entry will declare locale-specific URLs. The shape reserved for this:

```ts
localeFiles?: {
  [localeCode: string]: string  // locale code → remote URL for that locale's file
}

// Example:
// localeFiles: {
//   en: 'https://example.org/docs/terms.md',
//   fr: 'https://example.org/docs/fr/terms.md',
//   ar: 'https://example.org/docs/ar/terms.md',
// }
```

Each `localeFiles` entry would be fetched and written to the appropriate `content/[locale]/[localPath].md` path. The fallback chain handles locales not listed.

**Phase 1 shape uses single-locale fields:**
- `remoteUrl`: URL for the primary file (typically English)
- `locale?: string`: which locale directory to write to (defaults to `'en'`)

**Phase 2 transition (non-breaking):**
- Add `localeFiles` as an optional field in the type
- When Phase 2 script is implemented: check if `localeFiles` exists; if so, fetch all per-locale URLs; else fall back to single-URL mode
- Existing Phase 1 entries (with `remoteUrl` + `locale`) continue to work unchanged
- New Phase 2 entries use `localeFiles` instead
- No migration of existing entries needed

**Consequences:**
- Phase 1 sources do not need to change when Phase 2 is implemented
- The `localeFiles` field is now reserved in the type (`config/remoteContentSources.ts`) with full documentation so future implementers understand the intent
- Script logic in Phase 2 must prioritize `localeFiles` if present, falling through to single-URL path when absent
- Per-locale `overrideFrontmatter` handling is deferred to Phase 2 design

---

## 5. Navigation: primary top nav, config-driven via `navEntry`; explorer side nav planned

**Decision:** Remote content sources that declare a `navEntry` with `target: 'primary'` are merged into the primary site navigation by `useMainNavigationLinks()`. The merge respects the `navPosition` field so nav order remains explicit in config.

**Context:** `config/mainNavigation.ts` is currently a static `readonly` array of eight items. `useMainNavigationLinks()` consumes this array and returns label + path pairs for rendering. To make the nav respond to remote source config without requiring a manual edit to `mainNavigation.ts` each time a source is added, the composable must be extended.

**Rationale:** Keeping nav order in config (not in component logic) follows AGENTS.md Rule 6. Using `navPosition: 'after:{id}'` keeps the intent readable: `'after:about'` means "this item appears directly after the About nav entry," which is legible when reading the source config.

**Implementation:**

`useMainNavigationLinks()` is updated to:
1. Import `REMOTE_CONTENT_SOURCES` from `config/remoteContentSources.ts`
2. Filter sources where `navEntry?.target === 'primary'`
3. Map each to a `MainNavigationItem`-shaped object using `navEntry.messageKey` as the banana key and the derived route from `localPath`
4. Insert into the items array at the position described by `navEntry.navPosition`

All nav labels remain banana-i18n message keys — no English literals in the merged items. Each `messageKey` declared in a source config must be added to all `i18n/*.json` files before the source is registered.

**Explorer side nav (`target: 'explorer-side'`) — planned, not implemented:**

The explorer side nav (`config/explorerSideNav.js` → `ExplorerSideNav.vue`) uses a different data shape: sections containing items, where each item has a message key and optional link state. This differs structurally from the primary nav (a flat ordered list). Supporting `target: 'explorer-side'` requires:
- Extending the `RemoteContentNavEntry` type's `target` union to include `'explorer-side'`
- Adding a `section` field to `RemoteContentNavEntry` identifying which side nav section the item belongs to
- Updating `config/explorerSideNav.js` (or a new composable) to merge entries from remote sources

This is out of scope for Phase 1. The `target` field is defined as a string union now so the extension is additive when the time comes.

**Issue to note:** The explorer side nav currently links to `href="#"` placeholder links (non-functional, per `DESIGN_REQUIREMENTS.md`). Adding real links from remote sources would make those entries functional. Confirm before wiring this up that the explorer side nav is ready to serve real navigation.

---

## 6. Build failure behavior: warn always; use stale copy if available; emit empty placeholder if not

**Decision:**

| Condition | Behavior |
|---|---|
| Fetch succeeds | Write file, log success |
| Fetch fails; stale copy exists (`content/[locale]/[localPath].md` already on disk) | Keep stale file, emit a **warning** naming the source and the stale file path, continue build |
| Fetch fails; no stale copy | Write a minimal **empty placeholder** page (see shape below), emit a **warning** naming the source, continue build |
| `REMOTE_CONTENT_SOURCES` is empty | No-op, log "no remote content sources configured" |

The build **never fails** due to a remote source being unreachable. The portal must be deployable even when third-party content sources are temporarily unavailable.

**Empty placeholder shape:**

```markdown
---
title: Content unavailable
---

This page's content could not be fetched at build time.
```

The placeholder title is overridden by `source.overrideFrontmatter.title` if declared. The body is a plain English fallback. This is a safety net, not a designed state — the warning in the build log surfaces it for investigation.

**Rationale:**

- Failing the build on an external network dependency turns every third-party outage into a deployment blocker. That is not acceptable for infrastructure the portal does not control.
- Silently omitting a page (writing nothing when the fetch fails) is worse: the route returns a 404 without any signal that content was expected there, and visitors who already have that URL bookmarked hit a dead page.
- A stale copy is the best possible outcome of a failed fetch — it preserves the last known good content. Always warning means the operator knows the content is out of date.
- An empty placeholder is visually undesirable but operationally safe. It keeps the nav entry live and surfaceable, so the problem is noticed rather than hidden.

**Consequences:**
- The build script must check for stale file existence before writing. If the fetch fails, do not touch the existing file.
- The script must exit with code `0` in all cases (stale and placeholder both count as non-fatal).
- CI should surface build warnings to the developer — do not pipe the script's stderr to `/dev/null`.

---

## 7. Rendering pipeline: no changes to `[...slug].vue` or `useLocalizedContentPage`

**Decision:** The existing `app/pages/[...slug].vue` catch-all route and `useLocalizedContentPage` composable are unchanged. Fetched files become regular Nuxt Content documents once written to `content/[locale]/`.

**Context:** `useLocalizedContentPage` calls `queryCollection('content').path(candidate).first()`. Nuxt Content indexes all `.md` files in `content/` at build time. A file placed there by the fetch script is indistinguishable from a locally authored page.

**Rationale:** No special-case rendering logic for remote vs. local content. The fetch script's output is the same artifact as any other authored page.

**Consequences:**
- The site's full content rendering stack (MDC components, Shiki syntax highlighting, prev/next navigation, BiDi isolation, RTL direction) applies to fetched content automatically.
- If the remote file references an MDC component (`::callout{}`) that does not exist in `app/components/content/`, Nuxt Content renders it as a no-op block rather than erroring. This is a content authoring concern, not a rendering pipeline change.

---

## 8. Build pipeline integration

**Decision:** Add the fetch script as a pre-step in both `generate` and `build:netlify`:

```json
"fetch-remote-content": "node scripts/fetch-remote-content.mjs",
"generate": "npm run fetch-remote-content && nuxt generate",
"build": "npm run fetch-remote-content && nuxt build",
"build:netlify": "NITRO_PRESET=netlify npm run fetch-remote-content && nuxt build"
```

**Rationale:** Remote content must be on disk before Nuxt Content builds its SQLite index. Running it earlier ensures the index includes fetched files.

**Consequences:**
- Local `nuxt dev` does not call the fetch script. Developers working on prose pages that are fetched remotely need to run `npm run fetch-remote-content` once manually before starting the dev server, or rely on any stale copy already on disk.
- The fetched files in `content/` should be added to `.gitignore` if they are meant to be regenerated every build, or committed if a stable local copy is preferred for development. **This must be decided per source.** The current recommendation is: add fetched files to `.gitignore` so they are always regenerated from the authoritative remote source, and rely on the stale-fallback behavior to cover network failures.

---

## Future phases

### Phase 2a — Multi-locale per source

Extend `RemoteContentSource` with `localeFiles` (see §4). The script fetches one file per declared locale and writes to `content/[locale]/[localPath].md`. Existing single-URL entries continue to work unchanged.

### Phase 2b — HTML-to-Markdown (`strategy: 'html-url'`)

Add `strategy: 'html-url'` support to the script. Fetch HTML, extract the content region using a configured CSS selector (`htmlSelector` field), convert with **Turndown** (already the documented approach for MediaWiki content in the previously planned `sync-wiki-content.js`). Add Turndown as a dependency only when this phase is started.

The `htmlSelector` field is required for this strategy — without it, Turndown converts the full HTML page including the remote site's nav and footer into Markdown.

### Phase 2c — MediaWiki Action API (`strategy: 'mediawiki-action-api'`)

Add `strategy: 'mediawiki-action-api'` as a specialised form of HTML-to-Markdown that calls `action=parse` on the MediaWiki instance rather than fetching a static URL. This is the strategy originally documented for `sync-wiki-content.js`. It shares the Turndown conversion path with `'html-url'` but differs in how the source HTML is obtained.

### Phase 2d — Explorer side nav target

Extend `RemoteContentNavEntry.target` to include `'explorer-side'` (see §5).

---

## Corrections to existing documentation

| Document | Section | Required correction |
|---|---|---|
| `ARCHITECTURE.md` | Wiki content sync | Update to reference `scripts/fetch-remote-content.mjs` and `config/remoteContentSources.ts`. Remove references to `sync-wiki-content.js` and `wikiContentSources.js`. |
| `ARCHITECTURE.md` | Wiki content sync | Note that Turndown is not yet a dependency — it will be added when Phase 2b/2c HTML conversion is implemented. |
| `TECH_DECISIONS.md` | Wiki content sync | Same corrections as above. |
| `TECH_DECISIONS.md` | Experiment 3 | Reference this ADR as the implementation track for wiki content pull. |
| `AGENTS.md` | Rule 6 (All configuration goes in config files) | Replace "Wiki content sync sources" bullet with reference to `config/remoteContentSources.ts`. |
