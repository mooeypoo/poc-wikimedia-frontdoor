# DECISIONS.md — Front Door Developer Portal

Settled decisions for the Front Door project. This document contains only conclusions — no comparisons, no eliminated options, no rationale. For decision history see the project design document. For behavioural rules see `AGENTS.md`. For structural reference see `ARCHITECTURE.md`.

---

## Site architecture

The site is a **hybrid SSR + client-side application**:

- **SSR shell** — prose pages (policy, guides, landing, user routing) rendered server-side via `nuxt build`. Nuxt Content FTS5 search runs on the server.
- **Dynamic SPA** — the API explorer, fully client-side, never pre-rendered. OpenAPI specs are fetched at runtime. The explorer route is configured `ssr: false`.

These two surfaces have different rules and must not be conflated.

---

## Tech stack

| Concern | Decision |
|---|---|
| Framework | Nuxt 4 + Nuxt Content |
| UI component system | Codex (`@wikimedia/codex`) — Wikimedia design system, GPL-2.0+, Vue 3 |
| Interface translation | banana-i18n — sole authoritative system for all UI strings |
| Content translation | Nuxt Content per-locale Markdown directories |
| API explorer | `@scalar/api-reference` Vue component — used directly, NOT via `@scalar/nuxt` |
| Auth | Wikimedia OAuth 2.0, Authorization Code + PKCE |
| Session state | Pinia |
| Search | @nuxt/content FTS5 via `useSearchCollection` |
| Styling | Codex design tokens + CSS variables; Codex RTL stylesheet for RTL locales |
| Build | `nuxt build` (SSR); explorer route configured `ssr: false` |

---

## API explorer

- Library: **Scalar** (`@scalar/api-reference`)
- Integrated as a Vue 3 component inside `<ClientOnly>` on the explorer page
- `@scalar/nuxt` module is **not used** — it does not support multiple specs
- Specs are fetched at **runtime** from the discovery endpoint — no spec URLs are hardcoded
- Reactive configuration updated via `Object.assign()` on a `reactive()` config object
- Scalar's internal UI strings (button labels, response headers, etc.) do not go through banana-i18n — this is the one documented exception, accepted as third-party tooling

### Scalar plugin system

Scalar's `ApiReferencePlugin` API accepts Vue components natively. Two mechanisms:

- **`views`** — inject a Vue component at `content.end` (after Models section). Used for: token display, instance/language context notices, fallback notices.
- **`extensions`** — inject a Vue component tied to an `x-*` vendor extension field in the spec. Requires the spec to contain the field. Used for per-operation metadata where spec ownership permits.

Codex components and banana-i18n work inside plugins natively — no bridge pattern required.

---

## Discovery and spec resolution

Spec URLs are **never hardcoded or constructed from parts**. The flow is always:

1. Fetch `{wiki_base}/w/rest.php/specs/v0/discovery` for the selected instance
2. Read available modules and their spec URLs from the response
3. Pass the spec URL from the discovery response directly to Scalar

`config/instances.js` contains only base URLs, direction, and language metadata. No spec URLs.

**Offline, fleet-wide.** The same discovery flow is run offline across the entire public wiki fleet by the standalone `generate-module-source-of-truth` script to produce a committed source of truth under `config/generated/`: the fleet registry, the unique modules and which instances expose each, and each module's full OpenAPI spec. It is reviewed via git diff and independent of the runtime flow above — the explorer still resolves specs live. See `docs/adr-module-source-of-truth.md`.

---

## Wiki instances

Six instances configured for the initial build. All modules and spec URLs for each are derived from their respective `/w/rest.php/specs/v0/discovery` endpoints at runtime.

> These six are the *curated* explorer set (`config/instances.ts`). The full public fleet (~840 wikis) is enumerated separately as generated data in `config/generated/wikiInstances.generated.ts`; the two are distinct concerns and are not merged.

| ID | Base URL | Direction |
|---|---|---|
| `enwiki` | `https://en.wikipedia.org` | LTR |
| `arwiki` | `https://ar.wikipedia.org` | RTL |
| `frwiki` | `https://fr.wikipedia.org` | LTR |
| `hewiki` | `https://he.wikipedia.org` | RTL |
| `wikidata` | `https://www.wikidata.org` | LTR |
| `mediawiki` | `https://www.mediawiki.org` | LTR |

---

## i18n

| Layer | System | Notes |
|---|---|---|
| Interface strings | banana-i18n | Sole authoritative system. No exceptions. |
| Content pages | Nuxt Content per-locale dirs | Native to framework. More limited language set. |
| Explorer internal UI | Scalar internals | Documented exception — third-party tooling. |

`@nuxtjs/i18n` may be present for content locale routing only. It never produces user-visible interface strings. Never call `$t()` for interface text.

---

## RTL and BiDi

RTL is a first-class requirement, not an afterthought.

- Text direction is set reactively on `<html>` based on the active locale
- Direction is **declared explicitly** in `config/languages.js` per language entry — never inferred from a language code at runtime
- Codex RTL stylesheet (`@wikimedia/codex/dist/codex.style-rtl.css`) loaded conditionally when direction is RTL

### BiDi isolation rule

**Default posture: isolate everything that is not a banana-i18n interface string.**

Any string from an external source must be wrapped in `<bdi>` in templates. External means: anything from an API, a wiki, an OpenAPI spec, a config value displayed in the UI, user input, or a language/instance name from data.

```vue
<!-- ✅ Correct -->
<span>{{ $i18n( 'explorer-instance-label' ) }}: <bdi>{{ wikiInstance.displayName }}</bdi></span>
<bdi>{{ module.name }}</bdi>
<bdi>{{ languageOption.nativeName }}</bdi>

<!-- ❌ Wrong -->
<span>{{ wikiInstance.displayName }}</span>
```

**Known gap:** Scalar renders spec content (descriptions, parameter names, example values) without per-string BiDi isolation. Mitigation: broad `unicode-bidi: isolate` CSS on Scalar content containers. Upstream issue to be filed with Scalar.

---

## Code architecture

### Three layers — never mix them

| Layer | Where | Responsibility |
|---|---|---|
| Engine / data | `composables/`, `server/`, `scripts/` | Fetching, resolving, transforming. No markup. |
| Business logic / config | `config/`, composables | Project rules: instances, languages, fallback chains, defaults. |
| UI | `app/components/`, `app/pages/` | Render and handle interaction. Call composables. Nothing else. |

### Key rules

- No fetch calls inside Vue components — use composables
- No URL construction outside of composables
- No hardcoded strings in templates — use banana-i18n
- No logic duplicated across files — extract to composables or utilities
- All configuration in `config/` — not scattered in components or composables
- All exported functions and composables have JSDoc blocks
- All non-obvious logic has inline comments explaining *why*

### Composable naming

`use` prefix, describes what it provides:
`useDiscovery`, `useWikiModules`, `useSpecUrl`, `useLocaleWithFallback`, `useOAuthSession`, `useScalarConfig`, `useDirection`

### Variable naming

Full descriptive names. No abbreviations except universally understood ones (`url`, `id`, `api`).
Booleans: `isLoading`, `hasError`, `isAuthenticated`
Boolean functions: `isSpecAvailable()`, `hasTokenExpired()`
Event handler props: `onInstanceChange`, `onLanguageSelect`, `onAuthComplete`

---

## Wiki content sync

Some on-wiki pages (policy, descriptions) and their translations are pulled into the Markdown content directory via `scripts/fetch-remote-content.mjs` (`mediawiki-translated-page` strategy). It discovers translations via the Translate extension's `messagegroupstats`, fetches each locale's Parsoid HTML, and converts to MDC Markdown with the unified/rehype/remark pipeline, writing locale-prefixed files to `content/[locale]/`.

The fetcher is a **standalone command decoupled from the build**: run it on demand, review the git diff, and commit — imported content is committed, not gitignored. Each run wipes and recreates all imported files (marked `remoteImport: true`) so orphans never linger; output is idempotent. Sources are declared in `config/remoteContentSources.ts`. See `docs/adr-remote-content-fetching.md`.

---

## Language fallback

When content is unavailable in the requested locale, the fallback chain declared in `config/languages.js` is followed. Fallback is handled in the content-fetching layer (composables and Nuxt Content queries), never in components. A visible notice is shown when fallback content is displayed.

---

## OAuth session

- Flow: Authorization Code + PKCE
- Token exchange handled in a Nuxt server route (`server/routes/oauth/callback.ts`) — keeps client secret server-side
- Token stored in the `oauthSession` Pinia store
- `useOAuthSession()` composable exposes session state to the shell for display only (logged-in username, Log in / Log out in the top bar)
- MVP scope: OAuth does **not** integrate with Scalar — no bearer injection, no in-explorer auth UI. See [adr-wikimedia-oauth-authentication.md §0](adr-wikimedia-oauth-authentication.md). Token-management UI is deferred to the future standalone SPA (ADR §11).

---

## Search

- @nuxt/content FTS5 via `useSearchCollection( 'content' )`
- Single cross-locale search call; client-side path-prefix partitioning splits results into locale bucket + English fallback
- `useContentSearch( query, activeLocale )` composable handles partitioning, all-locales expansion, and raw-result caching to avoid repeated fetches
- Search input uses `dir="auto"` for correct RTL query handling
- All result text (titles, snippets) wrapped in `<bdi>` for BiDi isolation

---

## Markdown content pages

### Rendering stack

| Concern | Decision |
|---|---|
| Markdown parser | Nuxt Content (micromark + unified) — no alternative considered; built-in |
| Syntax highlighting | Shiki — bundled with `@nuxt/content`; automatic for all fenced code blocks |
| Custom components in Markdown | MDC (Markdown Components) via `@nuxtjs/mdc` — bundled with `@nuxt/content` |
| Component system for content components | Codex (`@wikimedia/codex`) — same as the rest of the UI; no exceptions |

### No new packages required

All planned markdown features are achievable with packages already installed:

- `@shikijs/transformers` is a transitive dependency of `@nuxt/content` — activating line numbers, line highlighting, and diff annotations requires only `nuxt.config.ts` changes.
- MDC is bundled — custom components require only new `.vue` files in `app/components/content/`.
- Codex is already installed — all content components use it where a suitable widget exists.

### Feature status

| Feature | Status | What is needed |
|---|---|---|
| Syntax highlighting | ✅ Works today | Shiki via `@nuxt/content` |
| Heading anchors + link icon | ✅ Implemented | `ProseH2.vue` … `ProseH6.vue` + `ProseHeading.vue` |
| External link icons | ✅ Implemented | `ProseA.vue` |
| Line numbers | ✅ Configured | Custom inline Shiki transformer + CSS counters |
| Line highlighting | ✅ Configured | `transformerMetaHighlight()` |
| Diff annotations | ✅ Configured | `transformerNotationDiff()` |
| Callouts (info / warning / error / success) | ✅ Implemented | `Callout.vue` + `CdxMessage` — see **Callout title / icon alignment** below |
| Code tabs | ✅ Implemented | `CodeTabs.vue` + `CodeTab.vue` with **`CdxTabs` (`framed`)** — see **Framed code tabs** below |
| Buttons | ✅ Implemented | `AppButton.vue` |
| Next / Previous navigation | ✅ Implemented | `[...slug].vue` frontmatter `prev` / `next` |
| File inclusion (locale-relative) | ✅ Implemented | `Include.vue` |
| Shared partials | ✅ Implemented | `Partial.vue` + `config/sharedPartials.ts` (remote-content ADR §11) |
| Wiki attribution footer | ✅ Implemented | `Attribution.vue` |

### MDC component conventions

- Components live in `app/components/content/` and are auto-registered.
- Block components use `::component-name{props}\ncontent\n::` syntax in Markdown.
- All new content components follow the same RTL/BiDi and logical-property rules as the rest of the codebase.
- Interface labels within content components go through banana-i18n.

### Callout title / icon alignment

**Decision:** Titled callouts pass the `#title` slot through without an extra `<p>` / `<strong>` wrapper, bold the first `.cdx-message__content > p` via CSS, and set `align-self: flex-start` on `.cdx-message__content`.

**Rationale:** MDC already wraps `#title` Markdown in a `<p>`. Nesting `<p><strong><p>…</p></strong></p>` is invalid HTML and caused the Codex status icon to sit above the title. Codex multiline messages use a bold first paragraph; icon alignment with multi-line content requires overriding Codex’s single-line `align-self: center` on the content column.

### Framed code tabs

**Decision:** Tabbed code blocks in Markdown use Codex `CdxTabs` with **`framed`**, not quiet tabs.

**Rationale:**

- Codex [Tabs guidance](https://doc.wikimedia.org/codex/latest/components/demos/tabs.html) reserves **framed** tabs for content inside a bordered module; **quiet** tabs are for in-page navigation (the shell primary nav already uses quiet `CdxTabs` via `ShellPrimaryNav`).
- A tabbed code sample is a bounded module on a prose page — same visual role as Codex’s framed demo (header strip + white content panel), not a site nav strip.
- Framed tabs provide correct header interaction (hover, selected, keyboard) without custom `.cdx-tabs__list__item` overrides; code tabs inherit native Codex tab styles.

**Implementation notes:**

- Outer module: `border: 1px solid var(--border-color-muted)`, `border-radius: var(--border-radius-base)`, `overflow: hidden`.
- Code panels: `pre` padding `var(--spacing-75)` (12px) via logical properties; margins reset so the panel connects to the selected tab label.
- MDC nesting is bridged with `CodeTab` → `provide`/`inject` registration during `setup()` (SSR-safe) because `CdxTabs` only accepts direct `CdxTab` slot children.

**Alternatives considered:** Custom tab buttons styled with Codex tokens (rejected — duplicates `CdxTabs` and diverges from the design system); quiet `CdxTabs` (rejected — wrong semantic/visual role for a code module).

---

## Experiments

Three experiments validate the core unknowns before full implementation. Each produces a concrete go/no-go signal.

### Experiment 1 — Scalar multi-spec reactivity in Nuxt 4
**Status: current**

Verify that `@scalar/api-reference` can switch between multiple real Wikimedia specs at runtime inside a Nuxt 4 `<ClientOnly>` wrapper, including switching between LTR and RTL instances.

**Includes:**
- Nuxt 4 scaffold with correct structure
- `useDiscovery(instance)` — fetches `/w/rest.php/specs/v0/discovery`, returns module list with spec URLs
- `useWikiModules(instance)` — exposes module list to UI
- Instance picker (six instances from `config/instances.js`) + module picker (populated from discovery)
- Scalar re-renders on instance or module change via reactive config
- Shell `dir` attribute updates reactively on instance switch
- banana-i18n for all UI strings; Codex for pickers; `<bdi>` on all external strings

**Does not include:** language-level spec selection, OAuth, content pages, search, wiki content sync.

**Success:** All six instances load specs from discovery. Switching is clean, no reactivity warnings. RTL instances correctly flip shell direction.

**Failure modes to document:**
- Spec switching requires forced remount (`v-if` + `:key`) — acceptable, must be noted
- Scalar fails on structurally different spec (e.g. Wikidata) — document whether Scalar or spec validity issue

---

### Experiment 2 — Wikimedia OAuth in Scalar sandbox
**Status: pending Experiment 1**

Verify the Wikimedia OAuth 2.0 Authorization Code + PKCE flow works end-to-end, token is stored in Pinia, and a custom token display panel can be injected into Scalar via the plugin system.

**Success:** Flow completes, token accessible in Pinia, subsequent Scalar sandbox requests use the token, token panel renders in Scalar via `views: content.end`.

**Failure mode to document:** OAuth redirect URI conflicts with Nuxt routing — mitigation is a dedicated server-side callback route outside the Vue layer.

---

### Experiment 3 — Wiki content pull and language fallback
**Status: implemented** — see `docs/adr-remote-content-fetching.md` (§9, §10).

On-wiki pages are fetched with the `mediawiki-translated-page` strategy: translations discovered via `messagegroupstats`, each locale's **Parsoid HTML** (core REST) converted to Markdown with the **unified/rehype/remark** pipeline (not the Action API + Turndown originally sketched here), stored per locale in Nuxt Content, with the existing fallback chain rendering when a locale file is absent.

**Outcome:** conversion is acceptable for prose; the fetcher is a standalone, idempotent, wipe-and-recreate command whose committed output is reviewed via git diff.

**Failure mode to watch:** HTML-to-Markdown conversion unacceptable for a given page — mitigation is restricting to prose-only pages or maintaining Markdown-native versions outside the wiki.