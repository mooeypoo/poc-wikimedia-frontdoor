# ADR: Remote Content Fetching

**Status:** Decided (Phase 1 and the wiki-translated-page strategy §9 implemented; the wipe-and-recreate lifecycle §10 is decided, not yet implemented)  
**Scope:** Build-time prose content — Markdown files fetched from remote URLs and rendered as shell-chrome pages

**Related:** `docs/adr-language-catalog.md` — the wiki strategy (§9) writes translations into locales defined by the unified language catalog. That ADR (Steps 1 + 1.5) is a prerequisite for the wiki strategy to have locales to land in.

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
  strategy: 'markdown-url' | 'mediawiki-translated-page'  // wiki strategy: see §9.1 for its extra fields
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
- Imported files are **committed** (not gitignored) so their git diff is the developer's review surface (§8, §10); they are regenerated on demand by the standalone fetch command, not on every build.

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

The explorer side nav (`config/explorerSideNav.js` → `usePageSectionNav()` + `ShellSidePanelNav`) uses a different data shape: sections containing items, where each item has a message key and optional `mode` for route wiring. This differs structurally from the primary nav (a flat ordered list). Supporting `target: 'explorer-side'` requires:
- Extending the `RemoteContentNavEntry` type's `target` union to include `'explorer-side'`
- Adding a `section` field to `RemoteContentNavEntry` identifying which side nav section the item belongs to
- Updating `config/explorerSideNav.js` (or a new composable) to merge entries from remote sources

This is out of scope for Phase 1. The `target` field is defined as a string union now so the extension is additive when the time comes.

**Issue to note:** Overview section entries in the explorer side nav (no `mode` field) still use `href="#"` placeholders. Mode-bearing entries navigate to `/explorer` sub-routes. Confirm before wiring remote sources that new explorer-side entries include a `mode` when they should route, or remain inert placeholders.

---

## 6. Build failure behavior: warn always; emit empty placeholder on failure

> **Revised.** The original decision kept a *stale copy* (last-known-good) when a
> fetch failed. That tier is **retired** by the wipe-and-recreate lifecycle in
> §10: imported files are deleted before re-fetching, so no prior copy exists to
> fall back to. Failure now always produces the empty placeholder.

**Decision:**

| Condition | Behavior |
|---|---|
| Fetch succeeds | Write file (with the `remoteImport` marker, §10), log success |
| Fetch fails | Write a minimal **empty placeholder** page (see shape below), emit a **warning** naming the source, continue build |
| `REMOTE_CONTENT_SOURCES` is empty | No-op, log "no remote content sources configured" |

The build **never fails** due to a remote source being unreachable (the script exits `0`; a placeholder keeps the route live). The portal must be deployable even when third-party content sources are temporarily unavailable.

**Empty placeholder shape:**

```markdown
---
title: Content unavailable
remoteImport: true
---

This page's content could not be fetched at build time.
```

The placeholder title is overridden by `source.overrideFrontmatter.title` if declared. The `remoteImport` marker is required so the placeholder is itself cleaned up on the next build (§10). The body is a plain English fallback. This is a safety net, not a designed state — the warning in the build log surfaces it for investigation.

**Rationale:**

- Failing the build on an external network dependency turns every third-party outage into a deployment blocker. That is not acceptable for infrastructure the portal does not control.
- Silently omitting a page (writing nothing when the fetch fails) is worse: the route returns a 404 without any signal that content was expected there, and visitors who already have that URL bookmarked hit a dead page.
- An empty placeholder is visually undesirable but operationally safe. It keeps the nav entry live and surfaceable, so the problem is noticed rather than hidden.

**Accepted tradeoff:** because §10 wipes imported files before re-fetching, a source that is unreachable during a build yields placeholders rather than the previous content. This is the deliberate cost of guaranteeing no stale or orphaned imports (see §10 rationale). Operators must treat placeholder warnings in the build log as actionable.

**Consequences:**
- The script must exit with code `0` in all fetch-failure cases (placeholder is non-fatal).
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

## 8. Fetch is decoupled from build; imported content is committed

**Decision:** Fetching and building are **independent steps**. `build` / `generate` do **not** run the fetch script; they build whatever content is on disk. The fetch script is a standalone command, and its output — the imported content files — is **committed to the repository** (see §10, which reverses the earlier gitignore decision).

```json
"fetch-remote-content": "node scripts/fetch-remote-content.mjs",
"generate": "nuxt generate",
"build": "nuxt build",
"build:netlify": "NITRO_PRESET=netlify nuxt build"
```

**Workflow:**
1. A developer (or a scheduled job) runs `npm run fetch-remote-content` when content should be refreshed.
2. They **review the resulting git diff** — added / changed / removed pages and slugs (§10) — and decide whether the fetch is acceptable and whether any editorial follow-up is needed (e.g. a redirect for a removed slug, §10).
3. They commit the content. Normal `build` / deploy then uses the committed content.

**Rationale:**
- **You can rebuild without re-fetching**, and re-fetch without an immediate build. The two concerns no longer block each other.
- **Deterministic, network-free builds.** CI builds from committed content — no build-time dependency on mediawiki.org being up, and no per-build fan-out of API requests.
- **Human review gate.** Because the fetch output is a committed diff, a bad fetch (an outage producing placeholders, an unexpected mass removal) is caught in review and simply not committed — it never reaches a deploy. This is what mitigates the wipe-first outage risk noted in §6.

**Consequences:**
- Content freshness now depends on someone running the fetch and committing — a manual developer action or a scheduled bot that opens a PR. It is no longer implicit in every build.
- Local `nuxt dev` builds from committed content; the wipe-and-recreate lifecycle (§10) runs only when the fetch script is invoked.
- Imported files must be **idempotent** so an unchanged page produces no diff (§9.5, §10).

---

## 9. Wiki translated-page strategy — `strategy: 'mediawiki-translated-page'` (Step 2)

**Decision:** Add a strategy that fetches a MediaWiki **page-translation** page and *all* of its translation subpages, converts each to Markdown, and writes one file per locale into `content/[locale]/[localPath].md`. This is the concrete implementation of what the ADR previously stubbed as Phase 2c, and it **subsumes Phase 2a** (multi-locale) for wiki sources: translations are auto-discovered, not hand-listed in `localeFiles`.

**Scope boundary — page translation, not interlanguage links.** This strategy targets the **Translate extension / page-translation model**, where translations live at subpages `Foo/<langcode>` (e.g. `Help:Extension:Translate/fr`). The Wikipedia-style **interlanguage-links** model (independent per-language articles via `langlinks`) is explicitly **out of scope** — it is a different content model, not subpages of one page.

### 9.1 Config shape

```ts
export interface RemoteContentSource {
  // ...existing fields...
  strategy: 'markdown-url' | 'mediawiki-translated-page'  // extended union

  // Wiki strategy fields (required when strategy === 'mediawiki-translated-page'):
  wikiApiUrl?: string          // e.g. 'https://www.mediawiki.org/w/api.php'
  pageTitle?: string           // canonical source page title, e.g. 'Help:Extension:Translate'
  minTranslatedPercent?: number  // skip translations below this completeness (default: skip only 0%)
  componentMapping?: {         // conservative element→MDC mapping toggles (see §9.4)
    code?: boolean             // default true
    callouts?: boolean         // default true
    tabber?: boolean           // default false
  }
  linkPolicy?: 'absolute-external'  // default; rewrite wiki links to absolute URLs
  attribution?: {              // see §9.5
    license?: string           // e.g. 'CC BY-SA 4.0'
  }
}
```

`remoteUrl` / `locale` / `localeFiles` are not used by this strategy (translations are discovered). `localPath`, `overrideFrontmatter`, and `navEntry` behave as for other strategies.

### 9.2 Translation discovery — `messagegroupstats`

**Decision:** Discover which languages a page is translated into via the Translate extension's `messagegroupstats` (verified live against mediawiki.org):

```
GET {wikiApiUrl}?action=query&meta=messagegroupstats
    &mgsgroup=page-{pageTitle}&mgsprop=total,translated
    &mgssuppressempty=1&formatversion=2
```

Returns per-language `{ code, language, total, translated, fuzzy, proofread }`. The group id is `page-` + the **canonical title with spaces** (namespace included).

- **Fetch all discovered languages** (per the project decision to support every language). Each maps directly onto a locale in the unified catalog (`docs/adr-language-catalog.md`), so no locale metadata is invented here.
- **Completeness gate:** skip a language whose `translated` is `0`; keep the rest. `minTranslatedPercent` tunes this. `fuzzy` units count as translated (Translate serves untranslated units in the source language anyway).
- **Requires the Translate extension** on the target wiki. If a page is not translation-enabled, discovery returns nothing and the source degrades to source-language-only (§9.6).

### 9.3 HTML source — Parsoid REST `/html`

**Decision:** Fetch each translation's HTML from the **core REST API Parsoid endpoint**:

```
GET {wikiHost}/w/rest.php/v1/page/{title}/html      // title = '{pageTitle}/{langcode}', percent-encoded
```

**Rationale:** Parsoid HTML is semantically structured (`data-mw`, section wrappers, `rel="mw:WikiLink"`, `<figure>`), which is the better substrate for a rule-based HTML→Markdown + element→component mapping, and it is MediaWiki's documented forward direction. The trade-off (accepted): it is heavier and needs more aggressive stripping than legacy `action=parse` output, and page metadata (display title) may need a second call.

**Encoding caveat (verified):** the subpage slash must be percent-encoded in the path (`Help%3AExtension%3ATranslate%2Ffr`). The Parsoid `~lang` variant syntax is **not** the mechanism for translation subpages and 404s.

**Noise to strip before conversion:** the `<languages/>` translation bar (`.mw-pt-languages`), TOC, edit-section links, category boxes, and navboxes. `Special:MyLanguage/` links are resolved to absolute URLs (§9.7).

### 9.4 HTML→Markdown + element→MDC mapping (conservative)

**Converter:** the **unified / rehype / remark** pipeline (`rehype-parse` → `rehype-remark` → `remark-gfm` → `remark-stringify`), which is **already present** as a transitive dependency of `@nuxt/content` — no new install. This deviates from the earlier plan to use **Turndown**: the sandbox's npm registry allowlist blocks installing Turndown, and unified is both available and more idiomatic for a Nuxt Content project (Nuxt Content itself parses MDC with `remark-mdc`). The element→MDC mapping is implemented as `rehype-remark` handlers; MDC component syntax (`::callout`) is emitted via mdast `html` nodes passed through verbatim by `remark-stringify`. Implemented in `scripts/lib/wikiContentConversion.mjs`.

**Mapping tier — conservative safe set (default):**
- **Fenced code with language** — `<pre>` / `<div class="mw-highlight mw-highlight-lang-*">` → ` ```lang ` (a rehype-remark `pre` handler reading the `mw-highlight-lang-*` / `language-*` class). *Default on.*
- **Message/note boxes → `::callout{type=...}`** — MediaWiki `.cdx-message`, `.mw-message-box`, `.ambox` mapped to the nearest callout type. *Default on.*

**Opportunistic (config-gated, default off):**
- **Tabber** (`.tabber` from the Tabber extension) → `::code-tabs` / `::code-tab`. *Off unless `componentMapping.tabber`.*

**Degrade / strip:**
- Infoboxes, navboxes, TOC, edit-section links, the language bar → dropped.
- `<references/>` / footnotes → flattened to an ordered list at the page end (MDC has no footnote component).
- Images → absolute-ized and hot-linked (§9.7); thumb framing unwrapped.

Mapping targets **must** be exactly the names of components registered in `app/components/content/` (per §7, an unregistered `::component` renders as a no-op block and silently vanishes).

### 9.5 Licensing & attribution — frontmatter + rendered footer

**Decision:** Wikimedia prose is CC BY-SA; reuse requires attribution, a link back, and a license notice. Every fetched page carries provenance **and renders a visible footer**:

- **Frontmatter** (injected at fetch time): `sourceUrl`, `sourceRevision`, `sourceWiki`, `license`, plus the `remoteImport` cleanup marker (§10).
- **Rendered footer:** the fetch step appends an `::attribution{}` MDC block to the body; a new `Attribution` content component renders "Adapted from [page] on [wiki], licensed CC BY-SA, revision N." This keeps the render pipeline (§7) untouched — it is just content.

**No `fetchedAt` in the committed frontmatter.** A wall-clock fetch timestamp would change on every run and produce a diff on *every* file even when nothing changed, drowning the review signal (§8, §10). Content version is instead conveyed by `sourceRevision` (the Parsoid ETag revision); *when* it was fetched is recorded by the git commit. This keeps imported files idempotent — an unchanged upstream page re-fetches to byte-identical output and shows no diff.

### 9.6 Per-locale build-failure behavior (amends §6)

§6's warn/placeholder policy applies **per locale file**, not per source:
- One locale's fetch failing must not drop the others; each translation is fetched and written independently.
- The empty placeholder is decided per `content/[locale]/[localPath].md` (there is no stale copy — §10 wipes imported files first).
- If discovery (§9.2) itself fails, attempt only the source-language page, write a placeholder if that also fails, and warn. The build never fails.

### 9.7 Link & image rewriting

- **Internal wiki links** (`/wiki/...`, `rel="mw:WikiLink"`, `Special:MyLanguage/...`) → rewritten to **absolute URLs** on the source wiki (`linkPolicy: 'absolute-external'`). They render through `ProseA` with the external-link icon. Not mapped to portal routes in v1.
- **Images** → absolute-ized to `upload.wikimedia.org` and **hot-linked** (no asset localization in v1). Revisit if CSP or offline builds require local copies.

### 9.8 API etiquette

- **Descriptive `User-Agent`** on every request (Wikimedia policy requires it).
- **Concurrency cap** across locales × pages; do not fan out unbounded.
- Respect `maxlag`; back off on 429 / `Retry-After`.

### 9.9 MDC-injection hazard (must handle)

Converted Markdown may contain `::`, `:`, or `{…}` sequences that Nuxt Content's MDC parser interprets as components/spans. Wiki content (e.g. `::` inside a code sample, or `{{...}}` remnants) can silently become a broken component or be stripped. The converter **must escape** these sequences in prose/code output. This is the single most likely rendering-corruption bug in this strategy and needs explicit test coverage.

### 9.10 Relationship to multi-locale (Phase 2a)

For wiki sources, translations are discovered (§9.2), so the reserved `localeFiles` map (§4) is **not** used — this strategy supersedes Phase 2a for wiki content. `localeFiles` remains available for the generic `markdown-url` (and future `html-url`) strategies where locale URLs are known but not discoverable.

---

## 10. Imported-content lifecycle: wipe-and-recreate cleanup

**Decision:** Every fetch run **deletes all previously-imported files, then recreates them** from current config. No orphaned import survives a run — whether it came from a source removed from config, a changed `localPath`/slug, a changed `locale`, or a translation that dropped below `minTranslatedPercent` (or was removed upstream). (The run is the standalone fetch command, not a build — §8.)

**Context / problem:** The original design only ever *wrote* files; it never removed them. Renaming a `localPath`, dropping a source, or losing a translation left the old file in `content/`, and Nuxt Content kept indexing and serving it. The portal needs the set of imported files to always equal what the current config + current remote state describe.

**Identification — a frontmatter marker.** Every file the fetch script writes — wiki pages, `markdown-url` pages, and empty placeholders — carries a marker in its frontmatter:

```yaml
remoteImport: true   # plus sourceId, for logging/debugging
```

The wipe scans `content/` recursively, parses each `.md`'s frontmatter (with the `yaml` package), and deletes exactly the files where `remoteImport === true`. Hand-authored content has no marker and is never touched. This is the safety mechanism that lets a blanket wipe coexist with authored pages in the same tree (§7).

- Because the marker lives in frontmatter, **every imported write must produce a frontmatter block.** A bare `markdown-url` source whose remote file has no frontmatter (and no `overrideFrontmatter`) now always gets one injected.

**Lifecycle, per fetch run** (the standalone `fetch-remote-content` command — *not* every build, §8):
1. **Wipe** — delete every marked file under `content/`; prune any locale directory left empty.
2. **Recreate** — fetch and write all configured sources, stamping the marker on each file.
3. **Log** — report counts: wiped, written, placeholder.

**Why wipe-first (always-fresh) rather than reconcile-and-keep-stale:**
- **Deterministic.** The output is a pure function of config + current remote state; there is no accumulated on-disk history to reason about.
- **No orphan diffing.** A blanket wipe covers *every* orphan case (removed source, changed slug/locale, dropped translation) with one mechanism, instead of per-case reconciliation logic that is easy to get subtly wrong.
- **Config is the single source of truth** for what should exist, not the contents of `content/`.

**Interaction with §6 — the stale tier is retired.** Because imported files are deleted before re-fetching, a failed fetch has no last-known-good copy to preserve; failure yields the empty placeholder. The outage risk this created is now caught by the **review gate** below rather than shipped: a fetch that produces placeholders shows up as such in the git diff and is simply not committed. Builds never fetch (§8), so a wiki outage cannot degrade a deploy — only a *reviewed and committed* fetch changes what ships.

**Committed output & the review diff (the reason imported files are not gitignored).** Imported files are **committed to the repository.** The point is that the fetch run's **git diff is the developer's review surface** — it shows exactly which pages, translations, and slugs were added, changed, or removed. This is why wipe-and-recreate pairs so well with committing: a removed source/slug/translation appears as a **deleted file** in the diff (an overwrite-only approach would hide it), so the developer can:
- judge whether the fetch is "successful" (expected changes) or wrong (an outage's mass placeholders, an unexpected mass removal) before committing;
- take editorial follow-up a script cannot decide — most importantly, **add a redirect** in `config/contentRedirects.ts` (`LEGACY_PATH_REDIRECTS`, HTTP 301) when an imported slug disappears and its old URL should not 404. *Caveat:* that config currently emits redirects only for the default locale + `es/fr/he/fa` (`NON_DEFAULT_CONTENT_LOCALE_CODES`), so for a removed slug that existed across many catalog locales, redirect coverage should be widened — a follow-up now that content locales span the full catalog (see `docs/adr-language-catalog.md`).

For this diff to be meaningful, imported output must be **idempotent** — no volatile fields (see §9.5, `fetchedAt` removed) — so an unchanged upstream page yields no diff and only real changes surface.

*Tradeoffs of committing:* generated content adds to repo size and history churn, and can produce merge conflicts on branches (resolve by re-running the fetch). Acceptable for curated sources; revisit if a source explodes into thousands of committed locale files.

**Edge cases covered:** source removed from config · `localPath`/slug changed · `locale` changed (markdown-url) · translation dropped or below threshold (with successful discovery) · fresh checkout (nothing marked to wipe) · hand-authored files (no marker, untouched) · placeholders (marked, so re-wiped) · per-file fetch failures (isolated to that file).

**Consequences:**
- The wipe deletes only regenerable, marked files (always reproducible by re-running the fetch); it never touches unmarked authored content. A fatal error exits `1`, and since the run is reviewed before commit, a wipe not followed by a clean recreate is discarded rather than shipped.
- Imported content is **committed, not gitignored** — the `.gitignore` entries for imported files are removed. (Reverses the earlier gitignore decision in §2/§8.)
- Content freshness is a deliberate, reviewed act (manual run or scheduled PR bot), not an implicit build side-effect (§8).
- `nuxt dev` does not run the lifecycle; it builds from committed content.

---

## Future phases

### Phase 2a — Multi-locale per source (generic sources only)

Extend `RemoteContentSource` with `localeFiles` (see §4). The script fetches one file per declared locale and writes to `content/[locale]/[localPath].md`. Existing single-URL entries continue to work unchanged. **Superseded for wiki sources** by the auto-discovery of `strategy: 'mediawiki-translated-page'` (§9.10); `localeFiles` remains for `markdown-url` / `html-url` sources.

### Phase 2b — HTML-to-Markdown (`strategy: 'html-url'`)

Add `strategy: 'html-url'` support to the script. Fetch HTML, extract the content region using a configured CSS selector (`htmlSelector` field), and convert through the same unified pipeline as §9.4 (`scripts/lib/wikiContentConversion.mjs`), sharing its element→MDC mapping.

The `htmlSelector` field is required for this strategy — without it, the converter would turn the full HTML page (including the remote site's nav and footer) into Markdown.

### Phase 2c — Wiki translated pages — **specified in §9**

The MediaWiki-page strategy is now fully specified as `strategy: 'mediawiki-translated-page'` (§9). It uses the Parsoid REST `/html` endpoint (not `action=parse`) and discovers translations via `messagegroupstats`. This replaces the earlier `'mediawiki-action-api'` stub.

### Phase 2d — Explorer side nav target

Extend `RemoteContentNavEntry.target` to include `'explorer-side'` (see §5).

---

## Rejected Alternative: MDX Support

**Why MDX was considered:** Nuxt Content's constraint that fetched files must be in **MDC format** (Markdown with Vue component syntax `::component-name`) rather than **MDX** (JSX-based Markdown) might seem limiting if a remote source only provides MDX content with `import` statements and JSX component syntax.

**Why MDX is rejected for Phase 1 and 2:**

1. **No native support in Nuxt Content v3.** MDX is a framework-agnostic format that requires compilation to JavaScript. Nuxt Content uses Remark + Micromark for parsing and outputs a Markdown AST, which ContentRenderer then renders to HTML. MDX requires the `@mdx-js/mdx` compiler (JavaScript/bundler-centric), not a Vue parser. No direct bridge exists.

2. **Framework mismatch.** MDX is React-first; Vue integration is non-trivial. The `remark-mdx` plugin only handles tokenization, not compilation or execution. Adapting MDX for Vue would require custom work.

3. **Security and predictability.** MDX files contain `import` statements and arbitrary JavaScript. Executing untrusted remote MDX at build time introduces supply-chain risk. MDC constrains content to Vue component slots and props — much safer.

4. **No identified use case.** Today, no remote content sources require MDX. All documented Phase 2 sources (wiki pages, external HTML) can be converted to Markdown; if component integration is needed, MDC provides that.

**If MDX support becomes necessary in the future:**

1. **Assess the real need:** Is the remote source team genuinely unable to provide Markdown or MDC? Or do they need interactive React components? If the latter, a separately-hosted sandbox might be more appropriate than embedding in the portal.

2. **Evaluate the cost:** Adding MDX support would require:
   - Installing `@mdx-js/mdx` and related compiler dependencies (bundler integration)
   - Custom remark plugin or build-time compiler bridge to compile MDX → Vue-renderable components
   - A Nuxt Content integration layer to handle MDX files separately from Markdown
   - Security review of imported remote code (imports in fetched files)
   - Performance impact: MDX compilation is more expensive than Markdown parsing

3. **Alternative: MDX in a separate surface.** If a future content source truly requires MDX + JSX, consider:
   - Hosting that content in a separate Nuxt app with native MDX support (via `@mdx-js/mdx` + React, or via Comark when available)
   - Embedding that app as an `<iframe>` in the portal, if isolation is acceptable
   - This avoids mixing MDX and MDC compilation pipelines

4. **Future Nuxt/MDC direction:** The Vue/Nuxt team is deprecating MDC in favor of **Comark** (framework-agnostic, AI-friendly, no longer Vue-specific). MDX may gain traction in this ecosystem; revisit this decision when Comark is adopted.

**Constraint going forward:** Remote content sources must provide either:
- **Markdown** (`.md`) with optional MDC component syntax — required for Phase 1
- **HTML** — convertible to Markdown via Phase 2b
- **MediaWiki wiki pages** — fetchable via Action API and convertible via Phase 2c

**Do not** accept MDX, JSX, or import-heavy content without an explicit architectural decision to support it.

---

## Corrections to existing documentation

**Status: applied** — `ARCHITECTURE.md`, `docs/TECH_DECISIONS.md`, `AGENTS.md`, `README.md`, and `.gitignore` have been reconciled with this ADR (standalone fetch, wipe-and-recreate, committed content, unified converter). The table below is retained as the record of what changed.

| Document | Section | Required correction |
|---|---|---|
| `ARCHITECTURE.md` | Wiki content sync | Update to reference `scripts/fetch-remote-content.mjs` and `config/remoteContentSources.ts`. Remove references to `sync-wiki-content.js` and `wikiContentSources.js`. |
| `ARCHITECTURE.md` | Wiki content sync | The wiki strategy (§9) converts HTML with the **unified/rehype/remark** pipeline already bundled via `@nuxt/content` (not Turndown — see §9.4). No new dependency was added. |
| `TECH_DECISIONS.md` | Wiki content sync | Same corrections as above. |
| `TECH_DECISIONS.md` | Experiment 3 | Reference this ADR (§9) as the implementation track for wiki content pull. |
| `AGENTS.md` | Rule 6 (All configuration goes in config files) | Replace "Wiki content sync sources" bullet with reference to `config/remoteContentSources.ts`. |
| `scripts/fetch-remote-content.mjs` | `mergeFrontmatter` | The hand-rolled YAML parse (splits on `:`) is lossy on nested keys / arrays / colon-bearing values. Move to the `yaml` dependency (already installed) before injecting wiki frontmatter (title, provenance, attribution). |
| `docs/adr-language-catalog.md` | — | Prerequisite: the wiki strategy (§9) writes into locales defined by the unified language catalog. |
| `ARCHITECTURE.md` | Remote content fetching | Describe the wipe-and-recreate lifecycle (§10) run by the standalone fetch command (build no longer fetches, §8); imported content is committed and reviewed via its git diff; the stale-copy fallback is retired. |
| `.gitignore` | imported content | Remove the imported-content ignore entries (`content/en/demo-remote-markdown.md`, `content/*/wiki-translate-help.md`) — imported files are now committed (§8, §10). |
