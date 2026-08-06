# AGENTS.md — Front Door Developer Portal

This file instructs AI coding agents working on the Front Door project. Read it in full before writing any code. The rules here are not preferences — they are requirements derived from architectural decisions documented in [`ARCHITECTURE.md`](ARCHITECTURE.md) and UI/UX decisions in [`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md).

---

## Related documentation

Use the right document for the kind of work you are doing:

| Document | Consult for |
|----------|-------------|
| **`AGENTS.md`** (this file) | Non-negotiable implementation rules — always follow; **Navigation card authoring playbook** (internal vs external card styles for docs automation) |
| **[`ARCHITECTURE.md`](ARCHITECTURE.md)** | System structure, data flow, composables, route boundaries, discovery, technical constraints |
| **[`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md)** | UI/UX: Codex layout system, shell chrome, site navigation IA, API Explorer layout, typography, loading/empty states |
| **[`docs/content-authoring-guide.md`](docs/content-authoring-guide.md)** | Markdown / MDC authoring, including navigation-card examples |
| **[`.agents/skills/`](.agents/skills/)** | Codex agent skills (components, tokens, icons, usage, design principles, bidirectionality, layout, content) — summaries of the [Codex style guide](https://doc.wikimedia.org/codex/latest/style-guide/overview.html); subordinate to this file and `DESIGN_REQUIREMENTS.md` |

**Read [`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md) before changing** anything that affects what users see or how they move through the shell: `app/layouts/`, `app/components/shared/`, shell layout CSS (`app/assets/css/page-grid.css`, `app/assets/css/shell-start-nav-reveal.css`, `app/assets/css/shell-start-nav-scroll.css`, `app/assets/css/shell-collapsed-nav-menu.css`, `app/assets/css/shell-end-panel-nav.css`), content-page visual patterns in `app/assets/css/main.css` (e.g. `.fd-content-page` typography and `h2` section spacing), platform landing surfaces in `app/assets/css/landing-page.css` and `app/components/content/Landing*.vue`, explorer UI components, or site-wide visual patterns. Implement to match recorded decisions there (e.g. desktop **4 \| 16 \| 4** grid, end-panel nav aligned via `useEndPanelNavAlign`, content-page `h2` **`--spacing-250`**, landing content measure **1000px** via `config/landingSurfaces.ts`) unless the user explicitly requests a design change.

**Precedence:** If **`DESIGN_REQUIREMENTS.md`** conflicts with this file, **`AGENTS.md` wins**. For technical behaviour (SSR, discovery, composable boundaries), prefer **`ARCHITECTURE.md`**. For visual and interaction behaviour, prefer **`DESIGN_REQUIREMENTS.md`**.

---

## What this project is

Front Door is the Wikimedia REST API developer portal. It serves a language surface that includes English, French, Spanish, Hebrew, Persian, Urdu, and many other languages across multiple wiki instances. It is not a typical LTR-English documentation site. Treat every assumption about language, text direction, and spec availability as something that must be explicitly handled, not assumed.

The project is a **hybrid static + dynamic application**:
- Prose pages (policy, guides, landing pages) are pre-rendered Markdown content served statically.
- The API explorer is a fully client-side SPA, never pre-rendered, that fetches OpenAPI specs at runtime.

These two surfaces have different rules. Know which one you are working on.

---

## Technology stack

- **Framework:** Nuxt 4 with Nuxt Content
- **UI components:** Codex (Wikimedia design system) — `@wikimedia/codex`, GPL-2.0+
- **Codex direction CSS:** experimental `codex.style-bidi.css` globally (`nuxt.config.ts`); do not stack `codex.style.css` + `codex.style-rtl.css`
- **Interface translation:** banana-i18n exclusively — registered as a global Nuxt plugin
- **Content translation:** per-locale Markdown directories via Nuxt Content
- **API explorer:** `@scalar/api-reference` Vue component — used directly, NOT via `@scalar/nuxt`
- **Auth:** Wikimedia OAuth 2.0 with PKCE — session state in Pinia
- **Search:** `@nuxt/content` FTS5 via `useSearchCollection`; locale partitioning handled in `useContentSearch`
- **State management:** Pinia
- **CSS direction:** native CSS logical properties for first-party CSS; Codex chrome via `codex.style-bidi.css`; no global CSS flipping layer for third-party explorer styles in the current phase

Do not introduce additional frameworks, UI libraries, or i18n systems. If you believe an exception is warranted, stop and explain why before writing code.

---

## Absolute rules

These are non-negotiable. Do not work around them, do not treat them as suggestions.

### 1. banana-i18n is the only interface i18n system

Every string that appears in the UI as interface text — labels, button text, nav items, error messages, placeholders, ARIA labels, tooltips — comes from banana-i18n. No exceptions.

Do not use:
- Hardcoded English strings in templates or components (except in code comments)
- `vue-i18n` / `$t()` for interface strings
- Any other translation library for UI text

`@nuxtjs/i18n` may be present for content locale routing only. It does not own any user-visible strings.

If you are writing a component and reach for a string, ask: does this string come from banana? If not, make it do so.

### 2. BiDi isolation is mandatory for all external strings

Any string that is not a hardcoded interface string translated through banana-i18n must be wrapped in `<bdi>` tags in templates.

"External string" means: anything sourced from an API, a wiki, an OpenAPI spec, a config file value displayed in the UI, a user input, or a language/instance name from data.

```vue
<!-- ✅ Correct -->
<span>{{ $i18n( 'explorer-instance-label' ) }}: <bdi>{{ wikiInstance.displayName }}</bdi></span>
<bdi>{{ module.name }}</bdi>
<bdi>{{ languageOption.nativeName }}</bdi>

<!-- ❌ Wrong — external string without isolation -->
<span>{{ wikiInstance.displayName }}</span>
```

When HTML is not available (e.g. inside an attribute value), use `unicode-bidi: isolate` via CSS or Unicode FSI/PDI characters. If you are unsure whether a string needs isolation, isolate it.

### 3. The `@scalar/nuxt` module is not used

Scalar is integrated via the `@scalar/api-reference` Vue component directly, inside a `<ClientOnly>` wrapper on the explorer page. The Nuxt module only supports a single static spec and is not suitable for this project's multi-spec, runtime-resolved use case.

Do not install or configure `@scalar/nuxt`.

### 4. The explorer route is client-only

The explorer page must never be server-rendered or pre-rendered. It is configured in `nuxt.config.ts` as:

```ts
routeRules: {
  '/explorer/**': { ssr: false }
}
```

Do not add SSR or SSG behaviour to the explorer route. Do not move OpenAPI spec fetching to the server layer.

### 5. No logic in Vue components

Components render and handle user interaction. They do not:
- Fetch data directly (use composables)
- Construct URLs (use composables or config)
- Contain business logic or conditional rules about instances, languages, or modules
- Manage Pinia stores directly (use composables that encapsulate store access)

If you find yourself writing a `fetch()` or `$fetch()` call inside a `<script setup>` block in a component, move it to a composable.

### 6. All configuration goes in config files

Values that are likely to change, are environment-dependent, or represent project-level decisions belong in `config/`. This includes:
- Supported wiki instances and their base URLs
- Explorer project + language picker options and wiki instance mapping (`config/explorerProjectPicker.ts`)
- API catalog Wikimedia cards, project-filter options, and visibility (`universal` / `projects` / `excludeProjectIds`) (`config/apiCatalogWikimedia.ts`)
- Explorer opt-in checkbox defaults and beta/internal-gated module rules (`config/explorerOptIn.ts` — beta prefixes such as `attribution/`; internal via `*-internal` path segments such as `discord/v0-internal`)
- REST API module select description fallbacks when OpenAPI omits `info.description`, and per-module OpenAPI suffix strip patterns (`config/explorerModuleDescriptions.ts`)
- Inline collapsible module rail visible endpoint row cap (`config/explorerModuleRail.ts`)
- Explorer control surface tokens for project controls and module rail (`config/explorerSurfaces.ts`); exploratory **4px** border radius (`--fd-explorer-controls-surface-border-radius`) is also consumed by account list-element cards, the Reset credentials panel, **`NavigationCard`**, **`.fd-highlight`** / **`Highlight`**, **`CodeBlock`**, and **`CodeTabs`**
- Platform landing (`config/landingSurfaces.ts`): content max inline size (`LANDING_CONTENT_MAX_INLINE_SIZE` → `--fd-landing-content-max-inline-size`); light/dark band gradient stops (`LANDING_BAND_GRADIENTS` — APIs/join dark `#233566` → `#101418`); hero dither asset paths (`LANDING_ASSETS.heroDither` / `heroDitherDark`); hero globe mask tint (`LANDING_HERO_GLOBE_COLOR`); award InfoChip colours (`LANDING_AWARD_CHIP` light purple100/600, dark inverted → `--fd-landing-award-chip-*-light` / `*-dark`); committed API-preview / community-app paths; article-preview placeholder copy (`LANDING_API_ARTICLE_PREVIEWS`)
- Navigation card allowlisted Codex icon names for MDC (`config/navigationCardIcons.ts` — includes landing persona / join / award icons such as `userGroup`, `labFlask`, `userTalk`, `code`, `star`)
- Navigation card allowlisted brand title logos for MDC (`config/navigationCardTitleLogos.ts` — `gerrit` / `github` / `gitlab` / `wikimediaEnterprise`)
- Header utility collapse threshold and interface-language menu limits (`config/headerChrome.ts` — `HEADER_LANGUAGE_MENU_VISIBLE_ITEM_LIMIT` / `HEADER_LANGUAGE_MENU_ITEM_RENDER_CAP`; collapse gap estimates must match utility-row CSS: search→preferences **16px** / other options **8px**; Floating UI cancel for the Lookup popover is a documented shell Codex exception, not a separate config knob)
- Shell primary-nav collapse hysteresis + start-drawer expand duration (`config/shellNavigation.ts` — `SHELL_NAV_*_PADDING_PX`, `SHELL_NAV_DRAWER_EXPAND_DURATION_MS`; drawer CSS gated by `.frontdoor-shell--nav-drawer-expanding` so landing / `sidebar: false` route changes stay instant)
- Color mode storage key, theme classes, and preferences popover radio order (`config/colorMode.ts` — `COLOR_MODES`, `COLOR_THEME_PREFERENCE_OPTIONS` Light → Dark → System default)
- Test wiki base URL + display-name message keys for write-request warnings (`config/wikiInstanceTestWikis.ts`)
- Write HTTP methods and Scalar Test Request modal warning / confirm-dialog flags (`config/scalarWriteHttpMethods.ts`, `config/scalarClientWriteWarnings.ts` — `SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED` is an easy-to-undo mock)
- Language definitions with explicit `dir` declarations
- Language fallback chains
- OAuth client ID and endpoint URLs
- Scalar configuration defaults
- Remote content sources (raw Markdown URLs, or MediaWiki translated pages; fetched by the standalone `fetch-remote-content` command and committed — not fetched by the build; see `config/remoteContentSources.ts`)
- The fleet-wide module source of truth (the public wiki fleet, the unique REST API modules and which instances expose each, and each module's full OpenAPI spec) — generated by the standalone `generate-module-source-of-truth` command and committed under `config/generated/` (regenerate and review the git diff — not fetched by the build; see `docs/adr-module-source-of-truth.md`). Consume it through the `config/moduleSourceOfTruth.ts` accessor, never by reaching into `config/generated/` directly.

Generated data (`config/generated/*.generated.ts`, `config/generated/module-specs/*.generated.json`) is reviewed via its git diff like a committed lockfile — never hand-edited. Hand-authored policy and accessors live in the sibling non-generated modules (`config/moduleSourceOfTruth.ts`).

Do not hardcode these values anywhere else in the codebase. If a component or composable needs a config value, it imports from `config/`.

### 7. Direction is declared, never inferred

The `dir` property of each supported language is explicitly declared in `config/languages.js`. Do not write code that infers text direction from a language code or BCP 47 tag at runtime. Use the declared value from config.

### 8. CSS uses logical properties; no global CSS flipping layer

All CSS authored in this project — SFC `<style>` blocks, layout styles, Nuxt Content prose styles, anything we write — uses **CSS logical properties** (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `border-inline-end`, `text-align: start`, `inline-size`, etc.) instead of their physical counterparts. The browser handles direction flipping automatically from the `dir` attribute on `<html>`.

Do not add a global PostCSS RTL flipping layer at this stage. Explorer content is primarily API-facing and often LTR-dominant; forcing third-party explorer CSS to flip globally can produce incorrect UI behaviour. Direction-sensitive values inside explorer content must be handled by explicit `dir` usage and BiDi isolation (`<bdi>` for external strings).

Do not:
- Ship a separate first-party `*.rtl.css` and swap stylesheets at runtime
- Stack Codex `codex.style.css` with `codex.style-rtl.css` (mirror sheets are meant to **replace** each other; stacking breaks clearable/start-icon edges and other physical `left`/`right` rules). Use **`codex.style-bidi.css`** from `nuxt.config.ts` instead — see `ARCHITECTURE.md` → RTL and BiDi
- Write physical properties in first-party CSS and rely on a build-time flipper — use logical properties
- Assume the Scalar explorer should mirror all chrome direction changes; keep explorer direction decisions explicit and content-driven

**Documented exception:** WebKit `::-webkit-scrollbar` pseudos in `app/assets/css/shell-start-nav-scroll.css` use physical **`width`** — the API has no logical equivalent. See `ARCHITECTURE.md` → Shell scroll regions and `DESIGN_REQUIREMENTS.md` → Start column section navigation.

**Documented exception — interface language Lookup menu:** `ShellHeaderUtilityActions` cancels Codex Lookup’s Floating UI absolute placement and viewport `maxHeight` so `.shell-header-utility-actions__language-popover` can wrap the whole Lookup (input + native menu) and `visibleItemLimit: 7` owns scroll height. That override uses physical **`max-height: none`** only to clear Floating UI’s inline physical style; menu chrome stays Codex-default (no restyle, no added gap between input and menu). Do **not** override Lookup/TextInput **`clearable`** or start-icon placement — those use native Codex props/chrome; direction edges come from **`codex.style-bidi.css`**. See `ARCHITECTURE.md` → Codex exceptions (shell chrome) #8 and `DESIGN_REQUIREMENTS.md` → Interface language picker.

**Documented exception — `CdxPopover` arrow seam:** Floating UI’s physical **`top: -9px`** on `.cdx-popover__arrow` leaves the panel top border visible through the pointer. Shared class **`fd-cdx-popover--arrow-seam-fix`** in `app/assets/css/shell-codex-overrides.css` sets **`top: -8px`** and **`box-shadow: none`** (global CSS because `CdxPopover` teleports). Used by header preferences and explorer opt-in help — do not duplicate the rule. See `ARCHITECTURE.md` → Codex exceptions (shell chrome) #11.

**Documented exception — write-request confirm dialog (Codex #13):** `ScalarClientWriteRequestConfirmDialog` teleports to `#explorer-reference-panel` (component is a **sibling** of that panel, not a descendant). Three product deviations, all in `explorer-codex-overrides.css`:
1. **Actions** — keep the action group end-aligned like default `CdxDialog`, but place progressive **Confirm** to the **left** of **Cancel** within the pair (`flex-direction: row` + `justify-content: end`; Codex default is `row-reverse`).
2. **Containment** — absolute backdrop inside the reference panel (not viewport-fixed). Physical **`width` / `height` / `top` / `left` / `right` / `max-width` / `max-height`** clear Codex’s `100vw` / `100vh` / `fixed` rules (no logical equivalents for those resets).
3. **Title** — `--font-size-large` (18px) instead of Codex / shell #12 `--font-size-x-large` (20px); body stays `--font-size-medium` (16px).
See `ARCHITECTURE.md` → Codex exceptions #13 and Write-request confirm dialog.

**Scroll-end inset on nav scrollports:** Start section nav and the collapsed nav overlay reserve **32px** below the last item via a **`::after` block spacer** (`block-size: var(--spacing-200)`) on the **scrollport** element — not `padding-block-end` on a nested wrapper (nested flex + `overflow: auto` does not always extend scroll range). In-shell rules: `app/assets/css/shell-start-nav-scroll.css` (tablet+ **`.frontdoor-shell__side-panel--start`**, mobile **`.fd-page-grid__start`**). Overlay: `ShellCollapsedNavMenuOverlay.vue`. Site footer keeps **`padding-block-end`** on **`.shell-site-footer`**. See `ARCHITECTURE.md` → Shell section navigation (scroll-end inset).

**Explorer picker menus (`CdxSelect` / `CdxCombobox`):** Under `.explorer-page`, `app/assets/css/main.css` may only raise floating-menu **z-index** and reset list markers. **Do not** override Codex `CdxMenuItem` hover, keyboard **`highlighted`**, or **`selected`** styles — those menus use Codex’s internal `CdxMenu`. **Documented exception #14 (content only):** **API to explore** uses custom Select `#menu-item` / `#label` slots (`ExplorerModuleSelectOptionContent`) so beta / internal render as **label-only** warning **`CdxInfoChip`**s beside the name (status icons hidden — Codex forces icons on `warning` and ignores null `icon`; same pattern as NavigationCard catalog chips) and version stays `supportingText` — do not regress audience markers into plain supporting text or re-enable chip icons. Standalone **`CdxMenuItem`** rows (module rail endpoints, start-column section nav) follow separate documented shell exceptions. See `ARCHITECTURE.md` → Codex exceptions #14 and `DESIGN_REQUIREMENTS.md` → REST API module select + opt-in (Codex interaction).

See `ARCHITECTURE.md` → "CSS direction strategy" for the full rationale.

### 9. Content components use Codex

Vue components placed in `app/components/content/` are auto-registered as MDC components and callable from Markdown. When building or modifying these components, use Codex widgets wherever a suitable one exists. Do not introduce bespoke styling for things Codex already covers (buttons, messages/callouts, tabs, icons).

- Use `CdxIcon` + `cdxIconLink` in `ProseH2.vue` … `ProseH6.vue` for heading anchor icons. The default `@nuxtjs/mdc` heading component wraps the full heading text in `<a>` — the override renders heading text as plain text and places a `CdxIcon` link alongside it, shown on hover via CSS.
- Use `CdxMessage` for callout/alert boxes — its `type` prop covers `notice`, `warning`, `error`, and `success` variants. For titled callouts, pass `#title` as Markdown (MDC already emits a `<p>`); do not re-wrap the title — see `ARCHITECTURE.md` → “Markdown content pages” → Callouts.
- Use `Highlight` (`::highlight`) for **progressive-subtle highlight / CTA** surfaces in Markdown (not status messages — those stay `Callout` / `CdxMessage`). Shared class **`.fd-highlight`** is also reusable in Vue (e.g. API catalog). Codex has no equivalent padded progressive surface without message chrome; this is an approved bespoke exception. See `ARCHITECTURE.md` → Highlight.
- Use `SectionHeading` (`::section-heading`) when a content `h2` needs an inline Codex `CdxInfoChip` (e.g. API catalog Wikimedia APIs + Recommended). Title and chip labels are content strings (`<bdi>`), not banana-i18n. Prefer `status="notice"` for Recommended (Figma). See `ARCHITECTURE.md` → Section heading.
- Use `ApiCatalogWikimediaSection` (`::api-catalog-wikimedia-section`) for the filterable Wikimedia APIs block on `/apis` — project filter chrome via banana-i18n; section `title` / `chip` as **content** props (per-locale Markdown + `<bdi>` via `SectionHeading`); cards and visibility (`excludeProjectIds` where needed) in `config/apiCatalogWikimedia.ts` (add/reorder cards there — e.g. Math API, Wikimedia REST APIs → `/explorer`). Combobox **`inline-size` / `min-inline-size`** use Codex **`--size-1600`** (256px); do not use `min(…, 100%)` under flex (it collapses). Do not hardcode show/hide rules in the Vue component. Do not re-author those cards as a plain `:::navigation-card-grid` on the catalog. Interactive island on the still-static page (default filter “Any” at SSG) — not a `<ClientOnly>` / `ssr: false` route. See `ARCHITECTURE.md` → API catalog project filter.
- Use `CodeBlock` (`:::code-block`) for a single bordered code sample — same panel chrome as code tabs without the tab header (muted border, exploratory **4px** radius, soft-wrap, intentional `dir="ltr"`). Fence language must be in `nuxt.config.ts` highlight `langs` (use `bash` / `shell` for curl). See `ARCHITECTURE.md` → “Markdown content pages” → Code block.
- Use `CdxTabs` + `CdxTab` for tabbed code groups via `CodeTabs` / `CodeTab` (`::::code-tabs`). Use the **`framed`** variant inside a bordered module with the same exploratory **4px** radius as `CodeBlock` — see `ARCHITECTURE.md` → “Markdown content pages” → Code tabs. Quiet tabs remain reserved for shell chrome (`ShellPrimaryNav`).
- Use `CdxButton` for inline call-to-action buttons. Markdown CTAs use `AppButton` (`::app-button`), which wraps progressive primary `CdxButton` (avoids shell prose-link colour washing out inverted label text on `<a>`-styled buttons). Root-relative `href` values (`/…`) always use in-app `navigateTo` — do not rely on `external` to force a new tab for internal paths (MDC `external=""` is ignored for `/…`; prefer absolute `http(s):` URLs for off-platform destinations).
- Use `CdxIcon` with the appropriate `cdxIcon*` constant for decorative icons (e.g. `cdxIconLinkExternal` on external links).
- Use `NavigationCard` (`::navigation-card`) for vertical content / navigation destination cards — do not restyle stock `CdxCard` for this chrome; wrap groups in `NavigationCardGrid` (`:::navigation-card-grid`) for equal-height rows. See **Navigation card authoring playbook** below, `ARCHITECTURE.md` → Navigation card, and `DESIGN_REQUIREMENTS.md` → Navigation card.
- **Approved exception — InfoChips are label-only where documented:** Optional `CdxInfoChip` rows on `NavigationCard`, explorer **API to explore** audience chips (`ExplorerModuleSelectOptionContent`, Codex exception #14), and the header brand **Prototype** warning chip (`ShellHeaderBrand`, Figma 1238:24310) keep stock Codex **status colours** but hide status icons. Codex forces icons on `warning` / `error` / `success` and ignores a null `icon` prop for those statuses, so first-party CSS hides `.cdx-info-chip__icon--vue` (`.navigation-card__chips` / `.explorer-module-select-option__audience-chip` / `.shell-header-brand-group__prototype-chip`). Do not re-enable icons or invent a second chip component. See `ARCHITECTURE.md` → Navigation card → Info chips, Codex exceptions #6 / #14, and `DESIGN_REQUIREMENTS.md` → Brand logo.

All other rules apply inside content components: banana-i18n for interface strings, `<bdi>` for external strings, CSS logical properties.

For the full feature status and implementation plan see `ARCHITECTURE.md` → "Markdown content pages" and `docs/TECH_DECISIONS.md` → "Markdown content pages".

### Navigation card authoring playbook (for agents)

**One component, two styles.** Internal and external destination tiles both use `NavigationCard` / `NavigationCardGrid`. Do **not** invent a second card component. Choose the style from the destination type. When a human prompt says “internal navigation cards” or “external navigation cards,” follow the matching subsection and copy the MDC shape from the reference pages.

**When the prompt asks to convert a docs page** (e.g. replace `###` + description + “Learn more” / “Try it out” with cards):

1. Keep existing `##` section headings and any section intro paragraphs unless the prompt says otherwise.
2. Under each section, put one `:::navigation-card-grid` wrapping `::navigation-card` blocks (equal-height rows).
3. Map each former `###` → card `title`, body copy → `description`, link URL → `url`.
4. Pick **internal** vs **external** style per card from the rules below (a page may mix both).
5. If the destination URL is empty / unknown: stop and ask, or omit `url` (non-clickable card) — do not invent URLs silently.
6. For every new **internal** `url`, ensure `content/<locale>/…` exists (or add a mockup stub); otherwise the card 404s.
7. Title, description, and supporting-text are **content** (per-locale Markdown + `<bdi>` via the component) — **not** banana-i18n.
8. Markdown inside a description (inline links) in a grid → card **default slot**, not `#description` (MDC named slots under `:::navigation-card-grid` 404 the page).
9. **API / product card titles** reflect the **current** Wikimedia API ecosystem (e.g. **Lift Wing API**, **MediaWiki REST API**). Do not invent friendlier umbrella names (e.g. “Machine Learning API”) ahead of planned module surfacing / accessibility renames — wait for an explicit product decision.

**Do not cardify:** `content/en/get-started/wikimedia-enterprise.md` body sections stay **prose** (heading + paragraphs + writer links). That page may use `::highlight` for the intro CTA only — see `ARCHITECTURE.md` → About Wikimedia Enterprise.

#### Internal navigation cards

**Use when:** destination is on Front Door (`/get-started/…`, `/explorer`, other same-origin paths).

**Style (required):**

| Prop | Rule |
|------|------|
| `url` | Locale-agnostic internal path (e.g. `/get-started/wiki-content`, `/explorer`) |
| `title` / `description` | From the section heading + body |
| `supporting-text` | **Omit** — no progressive footer link, no external icon |
| Visual link chrome | None beyond whole-card click (stretched link) |

**Do not:** add “Learn more”, “Try it out”, or other in-card link labels for internal destinations — the whole card is the link.

**Approved exception — platform home persona / join cards** (`content/en/index.md`): Figma keeps writer-authored `supporting-text` on **internal** destinations (e.g. “Learn about building tools →”). Do **not** strip those labels when editing the home page. Elsewhere, keep omitting supporting-text on internal cards. On `.fd-landing-page`, supporting-text still uses Codex Link tokens but **suppresses `:visited`** (see Platform landing RTL checklist).

**Reference pages (copy this shape):**

- `content/en/get-started.md`
- `content/en/get-started/build-for-communities.md`
- Internal cards on `wiki-content.md`, `open-data.md`, `tools-and-bots.md` (e.g. `/explorer`)
- Platform home persona / join cards: `content/en/index.md` (supporting-text exception above)

```md
:::navigation-card-grid
::navigation-card{url="/get-started/wiki-content" title="Use wiki content" description="Access articles from Wikipedia, media files, structured data, and more with public APIs and downloads."}
::
:::
```

**Prompt phrases (team → agent):** “use internal navigation cards”, “same style as Get started / Build for communities”, “no supporting-text / no in-card link” (except platform-home persona/join per Figma).

#### External navigation cards

**Use when:** destination is off-platform (`https://…` Meta-Wiki, mediawiki.org, Wikidata, Toolhub, Wikitech, etc.).

**Style (required):**

| Prop | Rule |
|------|------|
| `url` | Absolute `http(s):` URL (opens in a new tab) |
| `title` / `description` | From the section heading + body |
| `supporting-text` | **Required** progressive footer link to the **same** `url`, with external icon |
| Supporting-text label | **Keep the technical writer’s existing link text** (“Read more on Meta-Wiki”, “Visit Toolhub”, …). Never invent or “improve” labels when converting |

**Do not:** put the only external affordance on the title trailing icon when supporting-text is present — the component moves the external icon onto supporting-text automatically.

**Reference pages (copy this shape):**

- `content/en/get-started/about-wikimedia.md` (all external)
- External cards on `open-data.md`, `tools-and-bots.md`, `wiki-content.md` (Meta-Wiki dumps)

```md
:::navigation-card-grid
::navigation-card{url="https://meta.wikimedia.org/wiki/Special:MyLanguage/Data_dumps" title="Download content in bulk" description="Access free downloads of wiki content and data…" supporting-text="Read more on Meta-Wiki"}
::
:::
```

**Description + separate off-platform mention:** If the card destination is Wikitech (supporting-text) but a product name in the description should open elsewhere (e.g. PAWS → hub-paws), put the description Markdown in the **default slot** and keep supporting-text as the writer label for the card `url`. Example: `content/en/get-started/tools-and-bots.md` → “Run scripts in your browser”.

**Brand title logos (exception):** Use allowlisted `title-logo="gerrit|github|gitlab|wikimediaEnterprise"` from `config/navigationCardTitleLogos.ts` — monochrome SVG at `--size-icon-medium`, `currentColor` / `--color-base` (not progressive). Logo-only titles: Browse repositories on `/get-started/by-language`. Logo **before** a text title: Enterprise persona card on the platform home (`content/en/index.md`). Keep writer `supporting-text`. Do not invent new brand ids without adding them to that config.

**Do not** add an inline link in the description to the same off-platform destination the card already opens (e.g. Wikibase/Wikidata on About Wikimedia) — supporting-text (or the title icon) already exposes that URL.

**Prompt phrases (team → agent):** “use external navigation cards”, “same style as About Wikimedia”, “supporting-text with writer labels”, “preserve Read more on … / Visit … copy”.

#### Info chips (optional)

**Use when:** design asks for scope / stability tags on destination cards — primary surface is the **API catalog** (`content/en/apis.md`). **Do not** add chips to Get started overview / Build for communities cards unless the prompt explicitly asks.

| Codex `status` | Catalog use |
|----------------|-------------|
| `notice` | Scope (e.g. All projects, Multi-project, Wikidata) |
| `success` | Stable / Check stability at endpoint level |
| `warning` | Beta |

**MDC:** `chips="notice:All projects|success:Stable"` (pipe-separated; `status:label` or bare label → default `subtle`). Labels are **content** (per-locale Markdown + `<bdi>`), not banana-i18n. Chips are **label-only** (no status icons) — see the approved exception above.

**Reference page:** `content/en/apis.md` (mixed internal `/explorer` + external cards with chips; best-practice panels use `::highlight`, not cards).

#### Mixed pages

A single page may combine both styles (e.g. `/explorer` internal cards next to Meta-Wiki external cards). Apply the rules **per card**, not per page. References: `wiki-content.md`, `open-data.md`, `tools-and-bots.md`, `apis.md` (catalog).

#### Ambiguities (raise before guessing)

Stop and ask when:

- Former prose links are empty (`[Try it out]()`, `[Read more]()`)
- A section has two external URLs (which is the card `url` vs an inline description link?)
- Duplicate titles appear in two sections (keep both vs one?)
- Layout of orphan `###` blocks with no parent `##` is unclear
- The prompt would cardify `wikimedia-enterprise.md` (body must stay prose — confirm before changing)
- The prompt asks for a friendlier API umbrella title that is not the current product name (e.g. “Machine Learning API” vs **Lift Wing API**) — confirm before inventing labels

See `ARCHITECTURE.md` → Navigation card and `docs/content-authoring-guide.md` → Navigation cards.
---

## Code quality rules

### DRY

If the same logic appears in more than one place, extract it. Repeated patterns become composables (if stateful/reactive) or utility functions (if pure). Repeated template structures become components parameterised by props.

### Composable naming

Composables live in `composables/` and are named with the `use` prefix describing what they provide:

- `useExplorerProjectLanguagePicker(instanceId, instanceDisplayName)` — project + language combobox state; maps to wiki instance id via `config/explorerProjectPicker.ts`; injects a **transient selected option** (labelled with the wiki display name) for a non-curated, deep-linked instance the curated comboboxes cannot represent (`isPickerRepresentableInstance`)
- `useExplorerDeepLink(selectedWikiInstanceId)` — hydrates community selection from a deep-link URL **before** bootstrap (`/explorer/direct/…`, `/explorer/q/…`): sets the instance, hands `useExplorerBootstrap` a module/operation intent, and resolves + canonicalizes quick links via `server/api/explorer-quick-resolve` (see `docs/adr-explorer-deep-linking.md`)
- `useExplorerDeepLinkSync({ … })` — reflects community selection back into the URL (`push` on operation focus, `replace` on instance/module change; clears the hash on switch), re-focuses on same-module Back/Forward, and falls back to the default wiki when a deep-linked instance fails to load
- `useExplorerDeepLinkNotice()` — app-scoped (`useState`) deep-link notice channel shared by the deep-link composables, the bootstrap, and the page; `useState` (not a component ref) so the notice survives the page remount an in-explorer URL adjustment can trigger
- `useExplorerModuleSelect(visibleModules, …)` — REST API module `CdxSelect` menu items (`label`, version-only `supportingText`, `description`), audience-chip resolver, `menu-config`, `default-label`, and selection bridge for project controls
- `useExplorerOptInFilteredModules(...)` — client-side beta/internal module visibility over bootstrap lists; reconciles selection when a gated module is hidden (`config/explorerOptIn.ts` + `app/utils/explorerModuleOptInFilter.ts`)
- `useExplorerOptInCheckboxGroup(includeBetaEndpoints, includeInternalEndpoints)` — maps opt-in boolean refs to Codex checkbox-group values (`config/explorerOptIn.ts` tokens)
- `useApiCatalogProjectFilter()` — Wikimedia APIs catalog project combobox (banana labels, `isolatePickerLabel` menu items) and visible cards via `isApiCatalogCardVisibleForProjectFilter()` in `config/apiCatalogWikimedia.ts`
- `useWikiModules(instance)` — fetches and caches modules for a given instance
- `useLocaleWithFallback(requestedLocale)` — resolves the best available locale
- `useOAuthSession()` — provides token state and auth actions
- `useShellAuthNavigation()` — header Log in / username→`/account` over OAuth session
- `useShellHeaderUtilityMenu()` — collapsed utility `CdxMenuButton` items; exports `SHELL_HEADER_UTILITY_MENU_VALUE` (settings opens preferences popover in the parent)
- `useColorMode()` — site light / dark / auto (`html.fd-theme--*`); localStorage + FOUC; header preferences radios call `setMode` only
- `useAccountDashboardPage()` — account access gate (OAuth-only), logged-out / dashboard labels, sign-out; composes token dashboard + Reset dialog
- `usePrototypeAuthSession()` — placeholder key seeding after OAuth login (does not grant `/account` access)
- `useDeveloperTokenDashboard()` — **placeholder** API key lists (not real Meta data), Meta registration CTA (`onOpenMetaConsumerRegistration` → `META_OAUTH2_CONSUMER_REGISTRATION_URL`), locale-aware in-app auth learn-more paths (`resolveContentHref`), confirm-reset placeholder regenerate (**Delete not shown** until Meta/backend revoke)
- `useAccountResetApiKeyDialog()` — Reset API key `CdxDialog` confirm→success flow; success credentials are **placeholders** (Figma 626:7921 / 633:7695)
- `useCopyWithCopiedTooltip()` — clipboard copy + brief `CdxTooltip` “Copied!” feedback (Reset success quiet copy)
- `usePrimaryNavigationTab()` — active primary nav tab id (`apis` stays selected on `/apis`, `/apis/…`, `/explorer`, and `/explorer/…`; **no** tab selected on `/account` or home — `getMainNavigationIdFromPath` returns null → `''`)
- `useMainNavigationLinks()` — primary tab labels and paths; explorer destination never locale-prefixed

**Account API keys are not real.** `/account` list rows and Reset success Client ID / Client secret / Refresh token values are usability-testing placeholders from `config/tokenManagement.ts` / `stores/prototypeDeveloperTokens.ts`. Front Door does not retrieve or reset live Meta credentials yet — backend work is **pending**. See `ARCHITECTURE.md` → Account dashboard → Prototype placeholders.

**Logged-out `/account` (product decision):** Visiting `/account` without a Meta OAuth session shows the logged-out gate (Figma 1001:18723) — title, prompt, progressive **Log in** that starts the same OAuth + PKCE flow as the header link (`returnTo` = locale-aware account path), and a mock **Create an account** Codex Link to `WIKIMEDIA_CREATE_ACCOUNT_URL` (`config/auth.ts`) — outbound only; no post-registration return. **No** primary nav tab is selected (account is outside the primary IA). The shell site footer stays at the viewport bottom; the gate (not the dashboard) fills remaining vertical space. The dashboard (placeholder keys) appears only after real OAuth login. `/account` is **`ssr: false`** so the memory-only OAuth handoff does not SSR the gate layout into the dashboard.
- `useDiscovery(instance)` — fetches and parses the /discovery endpoint
- `useExplorerModuleRailPlacement()` — module rail Teleport target and layout mode (end column vs inline)
- `useExplorerModuleRailInlineEndpointScrollCap(scrollport, endpointList, …)` — inline rail endpoint scrollport cap (`config/explorerModuleRail.ts`)
- `useScalarClientWriteEndpointWarnings(scalarInterface)` — injects the write-request production **`CdxMessage`** under the Test Request address bar only; strips stray warning hosts elsewhere in the modal
- `useScalarClientWriteRequestConfirmDialog()` — mock Codex confirm before Scalar Send on write methods (`SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED`)
- `useScalarClientModalBackgroundScrollLock(scalarShellRef, scalarInterface)` — keeps Test Request inside the **visible** Scalar shell (snap `scrollTop` to 0 on open / restore on close + CSS pin); freezes reference scroll only; does **not** lock page body scroll; never `overflow: hidden` on the shell

### Documentation

Every exported function, composable, and class must have a JSDoc block. No exceptions.

The docblock must include:
- A one-sentence description of what it does
- `@param` entries for every parameter, with type and description
- `@returns` with type and description
- Any non-obvious side effects, watchers established, or cleanup behaviour

```js
/**
 * Resolves the OpenAPI spec URL for a given wiki instance, language, and module.
 *
 * Queries the instance's /discovery endpoint to find the matching module,
 * then returns the spec URL for the requested language. Falls back through
 * the language fallback chain defined in config/languages.js if the
 * requested language is not available for the given module.
 *
 * @param {Ref<string>} instance  - Reactive wiki instance ID (e.g. 'enwiki')
 * @param {Ref<string>} language  - Reactive BCP 47 language tag
 * @param {Ref<string>} module    - Reactive REST module name from /discovery
 * @returns {{ specUrl: ComputedRef<string | null>, isLoading: Ref<boolean>, hasError: Ref<boolean> }}
 */
export function useSpecUrl( instance, language, module ) { ... }
```

Inline comments are required for:
- Any non-obvious logic
- Workarounds (must include a brief explanation of why the workaround is needed)
- Bespoke MediaWiki-specific behaviour
- Edge cases in language fallback or spec resolution

### Variable naming

Use full, descriptive names. Domain terms use their full form.

| Do not use | Use instead |
|---|---|
| `inst` | `wikiInstance` |
| `lang` | `selectedLanguage` |
| `mod` | `restModule` |
| `spec` | `openApiSpecUrl` |
| `cb` | `onOAuthCallback` |
| `res` | `discoveryResponse` |
| `cfg` | `scalarConfiguration` |
| `fallback` | `languageFallbackChain` |

Booleans: `isLoading`, `hasError`, `isAuthenticated`, `shouldShowFallbackNotice`
Boolean functions: `isSpecAvailable()`, `hasTokenExpired()`, `canMakeRequest()`
Event handler props: `onInstanceChange`, `onLanguageSelect`, `onAuthComplete`

---

## RTL and BiDi checklist

Before marking any component complete, verify:

- [ ] Layout, spacing, and shell/explorer UI patterns match [`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md) when the change is user-visible
- [ ] All interface strings go through banana-i18n
- [ ] All external strings (from APIs, specs, config data shown in UI) are wrapped in `<bdi>`
- [ ] First-party CSS uses logical properties (`margin-inline-*`, `padding-inline-*`, `inset-inline-*`, `text-align: start/end`, etc.) — no `left`/`right` physical properties in CSS we author
- [ ] CSS does not pin `direction` (to `ltr` or `rtl`) unless that direction is genuinely required for the content. Most elements should inherit direction from the UI. Pin direction only with intent — for example, an input that accepts URLs, file paths, code, or other inherently LTR content should be `dir="ltr"` even when the surrounding UI is RTL; an input that accepts Arabic or Hebrew names should be `dir="rtl"` even when the UI is LTR. When in doubt, prefer `dir="auto"` over a hardcoded direction. Any intentional direction pin must be accompanied by a brief comment explaining why.
- [ ] Explorer-specific direction choices are explicit; do not rely on global CSS flipping for Scalar
- [ ] The component works correctly when the interface language is Arabic or Hebrew (RTL layout)
- [ ] The component works correctly when the interface is LTR but the displayed wiki instance is an RTL-language wiki
- [ ] Search inputs use `dir="auto"` or equivalent dynamic direction binding
- [ ] Start nav / collapsed overlay scroll-end inset uses **`::after` spacer on the scrollport** (`shell-start-nav-scroll.css`, `ShellCollapsedNavMenuOverlay.vue`) — not `padding-block-end` on nested wrappers
- [ ] Account dashboard: username and seed/API key fields in `<bdi>`; Client ID uses intentional `dir="ltr"` with a comment; **Client secret is not shown** on application list cards (Reset success dialog only); interface labels via banana-i18n; **treat key rows as placeholders** (not live Meta credentials — see `ARCHITECTURE.md`); logged-out gate uses banana strings, real OAuth Log in, and mock Create an account Codex Link (`account-logged-out-create-account-*` → `WIKIMEDIA_CREATE_ACCOUNT_URL` in `config/auth.ts`; new tab; no post-registration return; **no `:visited` colour**); Personal and Application section intros are **heading → description + learn-more in one paragraph** above cards; learn-more “personal API tokens” / “OAuth” continue the description sentence as in-app `NuxtLink`s to `/apis/authentication#…` (`config/auth.ts` + `resolveContentHref`) — **same tab, no external icon**; list cards show quiet **Reset** only (**Delete not shown** until Meta/backend revoke); each section has a progressive outlined CTA + `cdxIconLinkExternal` below the list/empty state — Personal **Create API token** (`account-create-api-token-button`), OAuth **Request new OAuth client** (`account-request-new-oauth-client-button`); both open `META_OAUTH2_CONSUMER_REGISTRATION_URL` in a new tab (`onOpenMetaConsumerRegistration`; aria via `externalLinkAccessibleLabel`; does not insert a local placeholder key); **Personal → OAuth** vertical gap is **`--spacing-250` (40px)** (page column still `--spacing-200` for title / logout; adjacent-section remainder in `account.vue`); list-element cards use exploratory **4px** radius via `--fd-explorer-controls-surface-border-radius` (`config/explorerSurfaces.ts` — not a Codex token; under consideration as a future system default); Application cards have **no** write-token `CdxMessage` notice; first-party CSS uses logical properties
- [ ] Account Reset confirmation dialog (`AccountResetApiKeyDialog` / `CdxDialog`): confirm + success copy via banana (`account-reset-dialog-*`); success rows are **placeholder** **Client ID**, **Client secret**, **Refresh token** (not real credentials); bold labels (`--font-weight-bold`); credential values in `<bdi dir="ltr">` with monospace; credentials panel uses exploratory **4px** radius via `--fd-explorer-controls-surface-border-radius` (same as list-element cards / explorer surfaces); quiet copy stays mounted and uses `CdxTooltip` “Copied!” via `useCopyWithCopiedTooltip`; intro / credential list / warning separated by `--spacing-100`; inherits interface `dir` from the shell
- [ ] Header brand (`ShellHeaderBrand`): banana wordmark + `aria-label` from `app-title`; mark via `WikimediaLogoMark` / `currentColor`; label-only warning **Prototype** `CdxInfoChip` after the lockup (`brand-prototype-chip-label`; `--spacing-50` / 8px gap; hide `.cdx-info-chip__icon--vue`; chip outside the home link); Codex `v-tooltip` on chip host (`brand-prototype-chip-tooltip` — “Test prototype. For internal use only”); **no** `:focus` / `:focus-visible` / `:active` / router-active outline on the link (Codex exception #6); first-party CSS uses logical properties
- [ ] Header **color theme preferences**: settings gear is **`weight="quiet"`** (or collapsed utility **Settings**) opens `CdxPopover` with `CdxField` (`is-fieldset`) + `CdxRadio` Light / Dark / System default (`light` / `dark` / `auto` via `COLOR_THEME_PREFERENCE_OPTIONS` in `config/colorMode.ts`); labels via banana (`color-mode-group-label`, `color-mode-*-label`); selection calls `useColorMode().setMode` only (no duplicate theme logic); popover **stays open** after select; **no** title/close chrome (dismiss via outside click / Escape); collapsed mode may anchor to the overflow `CdxMenuButton`; arrow/body seam via shared **`fd-cdx-popover--arrow-seam-fix`** (Codex exception #11); utility options use **`column-gap: var(--spacing-50)` (8px)** with **search → preferences at `--spacing-100` (16px)** and **vertical center** alignment with brand; first-party CSS uses logical properties (except documented physical `top` for Floating UI); inherits interface `dir`
- [ ] Header logged-in username is a progressive link to locale-aware `/account` (no “Logged in as” prefix); `aria-label` from `header-auth-link-aria`
- [ ] Interface language picker: globe + code trigger is quiet `CdxButton` + `CdxIcon` per [Codex Button with icon](https://doc.wikimedia.org/codex/latest/components/demos/button.html#with-icon) (native color/gap/typography — **no** first-party overrides on icon or code label); popover wraps full `CdxLookup` (input + native menu in normal flow); Codex **`clearable`** on the Lookup (filter only — does not change committed locale); `visibleItemLimit: 7` / render cap **50** from `config/headerChrome.ts`; Floating UI placement cancelled only as documented (no menu chrome restyle, no TextInput/clearable/start-icon overrides, no added input–menu gap); trigger code in `<bdi>`; autonyms via MenuItem `language` / `lang`; Codex direction via **`codex.style-bidi.css`** (do not stack LTR + RTL Codex sheets)
- [ ] Explorer **`CdxSelect`** / **`CdxCombobox`** floating menus use native Codex MenuItem interaction states — no custom hover / highlighted / selected CSS on `.explorer-page` (`main.css` z-index + list-style only)
- [ ] **API to explore** audience chips (Codex exception #14): warning **`CdxInfoChip`** beta/internal beside module name via `ExplorerModuleSelectOptionContent` (`#menu-item` + `#label`); chips are **label-only** (hide `.cdx-info-chip__icon--vue`); banana labels `explorer-module-beta-chip-label` / `explorer-module-internal-chip-label`; module name + version in `<bdi>`; version-only `supportingText` (no audience text in supportingText); unscoped option CSS required because Select menus teleport
- [ ] **Module rail** standalone **`CdxMenuItem`** rows: endpoint **name** uses **`--color-progressive`** on hover and when selected; HTTP method tags keep semantic colours (do not blanket progressive on hover/selected); selected rows have **no** Codex progressive-subtle background fill
- [ ] Primary **APIs** tab (`nav-api`) lands on `/apis`; stays selected on `/apis` (+ children) and `/explorer` (+ children); start-column section heading on explorer remains **API Explorer** (`explorer-side-nav-api-explorer-title`); **no** primary tab selected on `/account` (or home) — `usePrimaryNavigationTab` must not fall back to Get started
- [ ] Scalar Test Request modal sticky titles: `.explorer-page .scalar-client .request-response-header` has `z-index: 1` in `explorer-codex-overrides.css` so scrolling parameters do not paint over the endpoint name (re-verify class on Scalar upgrades)
- [ ] Scalar Test Request modal shell fit + scroll lock: dialog fully inside visible shell and **above** Scalar endpoint sidebar (`z-index: 10000`); shell `scrollTop` snapped to 0 on open / restored on close; reference frozen; **page** body still scrolls; CSS pins overlay under `--client-modal-open` (not `100vh`/`90svh`); **no** shell `overflow: hidden`; **no** body-wide MutationObserver (freezes mount)
- [ ] Scalar Test Request modal write-request **`CdxMessage`**: address-bar only (no request/response ClientPlugin slots; `slotKey === 'address-bar'`; stray hosts under Response Headers removed on scan); banana-i18n for warning + test-wiki names (`explorer-scalar-write-endpoint-warning`, `explorer-scalar-write-test-wiki-name-*`); production wiki display name and test-wiki link label in `<bdi>`; `$2` progressive link is a no-op until test wikis are discoverable; write requests hit production (no URL rewrite); first-party CSS uses logical properties
- [ ] Write-request confirm dialog (`ScalarClientWriteRequestConfirmDialog`): banana keys `explorer-scalar-write-confirm-*`; `$1` production wiki in title (FSI/PDI) and body (`<bdi>`); dialog component is a **sibling** of `#explorer-reference-panel` with `CdxDialog` `target` into that panel; absolute (not viewport-fixed) backdrop; action group **end-aligned** with progressive **Confirm** left of **Cancel** (Codex exception #13); title `--font-size-large` (18px) / body `--font-size-medium` (16px); Cancel / close does not send; gated by `SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED`
- [ ] **API catalog project filter** (`ApiCatalogWikimediaSection` / `config/apiCatalogWikimedia.ts`): “Filter by project” + option / empty labels via banana (`api-catalog-filter-*`); section title + Recommended chip are **content** (`title` / `chip` MDC props + `<bdi>`); card title / description / scope chips are **content** in config (`<bdi>` via `NavigationCard`); default filter **Any**; visibility only via config — `universal` (+ optional `excludeProjectIds`) or `projects`; Attribution excludes Wikifunctions; Lift Wing / GrowthExperiments exclude Wikifunctions + Commons; combobox menu labels BiDi-isolated (`isolatePickerLabel`); first-party CSS uses logical properties; combobox **`inline-size` / `min-inline-size: var(--size-1600)`** (256px; `flex: 0 0 auto` — do not use `min(…, 100%)` under a shrinkable flex parent); do not put the catalog on `ssr: false` / `<ClientOnly>` solely for the filter
- [ ] **Navigation card** (`NavigationCard` / `NavigationCardGrid`): title, description, supporting-text, and chip labels in `<bdi>`; no banana keys for card copy; first-party CSS uses logical properties; hover border `--border-color-subtle` on linked cards; whole-card click via stretched link; when `supporting-text` + `url` are set, supporting-text is a Codex Link (`--color-link*` hover/active/visited/focus per https://doc.wikimedia.org/codex/latest/components/mixins/link.html — **except** `.fd-landing-page`, which suppresses `:visited`); external icon `color: inherit` for off-platform URLs; title trailing icon omitted; **keep writer-authored supporting-text labels** when converting from prose; supporting-text bottom-aligned in equal-height grid rows with **min `--spacing-50` (8px)** from description; without supporting-text, title trailing icon for off-platform URLs unless `hide-external-icon`; optional allowlisted `title-logo` (`gerrit` / `github` / `gitlab` / `wikimediaEnterprise`) at `--size-icon-medium` with `currentColor`/`--color-base` — logo-only or logo+text title; omit `url` for intentionally non-clickable cards; description may include inline links (e.g. PAWS / Wikidata; ProseA external icons suppressed; Codex Link tokens via main.css); Get started / Build for communities / Use wiki content / Access open data / Tools and bots / About Wikimedia / platform-home / API catalog cards sit in `:::navigation-card-grid` (equal-height rows; optional `columns="2"` for two-up, e.g. landing Join); platform-home persona/join may keep internal `supporting-text` (Figma exception); grid uses **`--spacing-100` (16px)** `margin-block` above and below (adjacent `p`/`ul`/`ol` margins zeroed under `.fd-content-page`); internal card/`sectionNavigation` `href`s have matching `content/<locale>/…` Markdown (e.g. `/get-started/on-wiki` → `on-wiki.md`) so destinations do not 404; **Wikimedia Enterprise body content is prose, not cards**
- [ ] **Highlight** (`Highlight` / `.fd-highlight`): progressive-subtle CTA / featured blurb only (not `Callout` / `CdxMessage` status types); no banana keys for highlight copy (Markdown / Vue slot content); no border; radius via `--fd-explorer-controls-surface-border-radius`; padding `--spacing-75`; first-party CSS uses logical properties; inherits interface `dir` from the shell; links inside follow ProseA / progressive link rules; demos include Get started landing (inline CTA with arrow) and Wikimedia Enterprise intro (sentence + CTA on a **new line**, **no** arrow; body of that page is **prose**, not cards)
- [ ] **Content page typography** (`.fd-content-page`): Codex Heading 1 / 2 / 3 on `h1` / `h2` / `h3` per `ARCHITECTURE.md` → Content typography; content-page `h2` **`margin-block-start: --spacing-250` (40px)** (not global `--spacing-150`) per `DESIGN_REQUIREMENTS.md` → Content page typography
- [ ] **Platform landing / home** (`.fd-landing-page` / `frontdoor-shell--landing`): full-bleed section backgrounds; content measure from **`LANDING_CONTENT_MAX_INLINE_SIZE`** (not hardcoded in CSS); assets, award-chip colours (`LANDING_AWARD_CHIP` light purple100/600 + dark inverted via `--fd-landing-award-chip-*-light` / `*-dark`; dark applied on the chip in `landing-page.css` — do not reassign the light inline custom property), globe tints (`LANDING_HERO_GLOBE_COLOR`), and API-preview copy from `config/landingSurfaces.ts`; `index.vue` **preloads** `LANDING_API_ARTICLE_PREVIEWS` thumbnails (`rel=preload as=image`) so Codex `CdxThumbnail` can hit cache without bypassing `CdxCard`; hero H1 monospace at exploratory **`2rem`** in `landing-page.css` (not a Codex font-size token) + intro `p` at **`--font-size-x-large`** in `LandingHero.vue` (scoped `:deep(p)` — do not use `:where(p)` in `landing-page.css`); hero dither swaps light/dark SVGs via `fd-theme--*` (dark: Figma 1202:27291); ascii globe is RGBA PNG **mask** + themeable fill (light `#202122`, dark `#eaecf0`); APIs/join bands swap dark linear gradients (`#233566` → `#101418`) via `fd-theme--*` (hex — do not use dark `var(--background-color-inverted)`); article titles/snippets and section CTA labels in `<bdi>`; `apps` band uses `--background-color-base`; community app cards follow Codex **Portrait card** (not in Codex yet — T310632): committed `media` with **`--spacing-75` (12px)** image inset, `hide-external-icon`, Lexica/Paulina/Listen `chips="award:…"` (star + purple100/600, inverted in dark); API demo uses Codex **`CdxCard`** previews (**Codex exception:** muted resting border + exploratory **4px** radius) + `:::code-block` curl (`bash`; soft-wrap; **4px** radius; `dir="ltr"`); desktop example column stretches to stacked preview cards with auto space between intro `p` and `h3` + code-block; nested MDC containers use increasing colon counts (no orphan `:::` paragraphs); RTL shell still centers hero and mirrors layout via logical properties; heading permalink anchors not rendered; hero prose links suppress ProseA external icon; **all** home links suppress `:visited` colour (hero prose, card supporting-text, section CTAs; external prose links open in a new tab); section CTAs use trailing arrow (not external glyph) even for http(s); section `h2` → content gap **`--spacing-150` (24px)**; navigation-card leading icons top-aligned with title (+ 2px optical padding); persona card order communities → research → enterprise; persona/join may keep internal `supporting-text` (Figma)
- [ ] **Code block / Code tabs** (`CodeBlock` / `CodeTabs`): muted border + exploratory **4px** radius via `--fd-explorer-controls-surface-border-radius` (not hardcoded `4px`); `--spacing-75` padding on `pre`; intentional `dir="ltr"` on `CodeBlock`; soft-wrap long lines in `CodeBlock`; fence language in highlight allowlist; keep panel chrome tokens in sync between the two components

---

## What to do when you are uncertain

**If a requirement is ambiguous:** Stop. Write a comment in the code with `// QUESTION:` describing the ambiguity, implement the most conservative interpretation, and flag it in your response. Do not make silent assumptions.

**If a third-party library behaves unexpectedly:** Document it with an inline comment explaining what was expected, what actually happens, and the workaround used. Include a link to the relevant issue if one exists.

**If you need to deviate from these rules:** Explain why before writing the code. The rules exist for specific reasons documented in [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`DESIGN_REQUIREMENTS.md`](DESIGN_REQUIREMENTS.md) — if the reason no longer applies, the rule can be revisited, but that is a decision, not a default.

---

## Experiment 1 scope (current task)

The current task is Experiment 1 from the design document: verifying that Scalar's `@scalar/api-reference` Vue component can switch between multiple specs at runtime inside a Nuxt 4 `<ClientOnly>` wrapper, using real Wikimedia API endpoints.

---

### Real endpoints to use

The experiment uses a curated set of real Wikimedia REST API endpoints spanning different projects and languages. This tests that spec switching works across genuinely different specs, not just trivial URL swaps.

#### Confirmed base API URLs

The MediaWiki Core REST API follows this pattern for all Wikimedia wikis:
```
{wiki_base}/w/rest.php/v1/
```

The Wikibase REST API (Wikidata and Wikibase instances) uses:
```
https://www.wikidata.org/w/rest.php/wikibase/v1
```

#### Spec URL pattern and discovery

Spec URLs are **never hardcoded or interpolated**. They are always derived at runtime from the `/discovery` endpoint of each wiki instance:

```
{wiki_base}/w/rest.php/discovery
```

The discovery response lists all REST modules available for that instance, including the spec URL for each. The agent must call `/discovery` for each configured instance and use the spec URLs exactly as returned — no pattern construction, no guessing module names.

`module` is always the literal `moduleType` segment in the path (i.e. `specs/v0/module/{name}/{version}`), but this is an implementation detail of what discovery returns — the code should not reconstruct this pattern. It should read the spec URL directly from the discovery response and pass it to Scalar.

Example discovery response structure (approximate):
```json
{
  "modules": [
    {
      "name": "growthexperiments",
      "version": "v0",
      "specUrl": "/w/rest.php/specs/v0/module/growthexperiments/v0"
    },
    ...
  ]
}
```

The `useDiscovery(instance)` composable fetches this endpoint, caches the result, and returns the list of available modules with their spec URLs. The `useSpecUrl(instance, moduleName)` composable selects the matching entry. Neither constructs a URL from parts.

#### Instances and languages to test

The community explorer uses a **project + language** picker (`ExplorerProjectControls.vue`, `useExplorerProjectLanguagePicker`) that resolves to wiki instance ids in `config/explorerProjectPicker.ts`. Instance metadata lives in `config/instances.ts`:

```ts
/**
 * config/instances.ts — wiki instances referenced by the picker mapping.
 *
 * Spec URLs are never stored here; they come from each instance's
 * /w/rest.php/discovery endpoint at runtime.
 */
export const WIKI_INSTANCES = [
  { id: 'enwiki',  baseUrl: 'https://en.wikipedia.org',      dir: 'ltr', language: 'en' }, // Wikipedia + English
  { id: 'eswiki',  baseUrl: 'https://es.wikipedia.org',      dir: 'ltr', language: 'es' }, // Wikipedia + Spanish
  { id: 'hewiki',  baseUrl: 'https://he.wikipedia.org',      dir: 'rtl', language: 'he' }, // Wikipedia + Hebrew
  { id: 'fawiki',  baseUrl: 'https://fa.wikipedia.org',      dir: 'rtl', language: 'fa' }, // Wikipedia + Farsi
  { id: 'commonswiki', baseUrl: 'https://commons.wikimedia.org', dir: 'ltr', language: 'en' }, // Wikimedia Commons
  { id: 'wikidata', baseUrl: 'https://www.wikidata.org',      dir: 'ltr', language: 'en' }, // Wikidata
]
```

**Picker UI (banana-i18n):** Project — Wikipedia (default), Wikimedia Commons, Wikidata. Language — English (default), Spanish, Hebrew, Farsi; **disabled** when Commons or Wikidata is selected.

This set is chosen deliberately:
- **enwiki / eswiki**: LTR Wikipedia in two content languages
- **hewiki / fawiki**: RTL Wikipedia — tests that switching instance `dir` in `config/instances.ts` updates shell direction without breaking BiDi isolation
- **commonswiki**: Different Wikimedia project (MediaWiki Core REST API on Commons)
- **wikidata**: Different API surface (Wikibase REST API, not MediaWiki Core) — tests that Scalar handles structurally different specs cleanly

---

### In scope

- Minimal Nuxt 4 project scaffold with correct directory structure per `ARCHITECTURE.md`
- Scalar installed as `@scalar/api-reference` (not `@scalar/nuxt`)
- A single explorer page at `/explorer` with `ssr: false`
- A `<ClientOnly>` wrapper mounting `ApiReference` with a reactive configuration object
- `useDiscovery(instance)` composable — fetches `{baseUrl}/w/rest.php/discovery` for the selected instance and returns the list of available modules with their spec URLs as provided by the response
- `useWikiModules(instance)` composable — wraps `useDiscovery`, extracts the module list, caches per instance
- Project + language pickers (`CdxCombobox` in a fieldset) populated from `config/explorerProjectPicker.ts`; selections resolve to wiki instance ids in `config/instances.ts` via `useExplorerProjectLanguagePicker`
- REST API module select (`CdxSelect`) populated from opt-in-filtered bootstrap modules in discovery order via `useExplorerModuleSelect`; default module is the first healthy entry in discovery order (`resolveFirstExplorerRailModule`); menu options include **`description`** (OpenAPI `info.description` at bootstrap, with config fallbacks and configured suffix stripping), **version-only** MenuItem **`supportingText`**, **label-only** warning **`CdxInfoChip`** audience labels for beta/internal beside the name (Codex exception #14 / `ExplorerModuleSelectOptionContent` — status icons hidden), **`default-label`**, and Codex **`menu-config`** (`boldLabel`, `hideDescriptionOverflow: false` for wrapping). Field label banana `explorer-rest-api-module-label` (“API to explore”). Explorer picker menus must use native Codex MenuItem interaction states — do not override hover / highlighted / selected CSS on `.explorer-page`
- Include opt-in checkboxes: **Beta APIs and endpoints** default **on**, **Internal APIs and endpoints** default **off** (`DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS` in `config/explorerOptIn.ts`); explorer page refs seed from that config. Client-side **module** filtering via `filterExplorerBootstrapModulesByOptIn()` / `useExplorerOptInFilteredModules`: beta prefixes (`isExplorerBetaOptInModule`, e.g. `attribution/`), internal audience path segments (`isExplorerInternalOptInModule`, e.g. `discord/v0-internal` — Discord Preview API). Per-endpoint filtering inside a selected OpenAPI spec is out of scope for this phase
- Primary shell tab **APIs** (`nav-api`, id `apis`) → `/apis` (catalog); `getMainNavigationIdFromPath` returns `apis` for `/apis` (+ children) and `/explorer` (+ children) so the tab stays selected; start-column section heading on explorer remains **API Explorer** (`explorer-side-nav-api-explorer-title`)
- End-column **module rail** (`ExplorerModuleRail`) lists endpoints for the **selected REST API module** only; endpoint rows use **`CdxMenuItem`** (same shell pattern as `ShellSidePanelNav`) and show operation **names** (OpenAPI `summary` via `resolveEndpointNameLabel()`); **`--fd-explorer-controls-surface-*`** background and border radius on project controls and rail (`config/explorerSurfaces.ts`); selected endpoint indicated via **`CdxMenuItem` `:selected`** (progressive **name**, no progressive-subtle fill); sticky scroll divider when the endpoint list scrolls; rail top aligns with **`.explorer-page__scalar-shell`** via `useEndPanelNavAlign` on desktop (≥ 1120px); below 1120px the rail teleports inline below project controls (`useExplorerModuleRailPlacement`) with **no** `.explorer-page__project-controls-stack` gap and a collapsible endpoint panel; when expanded with more than **`EXPLORER_MODULE_RAIL_INLINE_MAX_VISIBLE_ENDPOINTS`** (7) endpoints, **`useExplorerModuleRailInlineEndpointScrollCap`** caps the scrollport to seven visible rows with internal scroll
- Community explorer page description banana `explorer-description`: “Discover APIs and test requests against Wikimedia projects”
- Scalar re-renders against the spec URL from discovery when instance (project/language), REST module select, or endpoint selection changes
- Verification that reactive config update (via `Object.assign` or equivalent) re-renders Scalar without full component teardown
- Verification that switching to an RTL wiki instance (`hewiki`, `fawiki`) correctly sets `dir="rtl"` on the shell from `config/instances.ts`; switching back sets `dir="ltr"`
- banana-i18n installed as a Nuxt plugin; all picker labels and UI strings go through banana
- Codex components for explorer controls (`CdxCombobox`, `CdxSelect`, `CdxField`, `CdxCheckbox`, …)
- Basic RTL: `dir` attribute on `<html>` set reactively from the selected instance's `dir` in `config/instances.ts`
- Picker menu labels use BiDi isolation (`isolatePickerLabel()`); module names in the rail wrapped in `<bdi>`
- **Write-request production warning (Test Request modal):** for write HTTP methods on instances with a mapped test wiki (`config/wikiInstanceTestWikis.ts`), a **`CdxMessage`** below the modal address bar (and nowhere else in the modal) always warns that the request will modify live data; `$2` is a mocked progressive link to the mapped test wiki display name (navigation pending discovery). Write requests hit the production wiki. No checkbox / no ClientPlugin view slots. Implemented via DOM injection under `.scalar-address-bar` — see `ARCHITECTURE.md` → Write-request production warning
- **Write-request confirm dialog (mock):** before address-bar **Send** on write methods, a **`CdxDialog`** asks for confirmation (`SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED`; easy undo). Contained to `#explorer-reference-panel`; Confirm left of Cancel in an end-aligned action group (Codex exception #13). See `ARCHITECTURE.md` → Write-request confirm dialog

### Out of scope for Experiment 1

- Language-level spec selection (per-instance per-language specs — next phase)
- Full OAuth integration (Experiment 2)
- Wiki content pull (Experiment 3)
- Nuxt Content / Markdown pages
- Full language fallback logic
- Search
- Production-ready styling

---

### Success signals

- All six wiki instances load their spec in Scalar without errors
- Switching project, language, or instance re-renders Scalar cleanly, within ~500ms, no Vue reactivity warnings
- Switching to `hewiki` or `fawiki` correctly sets `dir="rtl"` on the shell; switching back sets `dir="ltr"`
- Language combobox is disabled when Wikimedia Commons or Wikidata is selected
- Primary **APIs** tab (`nav-api`) stays selected on `/apis` (+ children) and `/explorer` (+ children); start-column section heading on explorer remains **API Explorer**
- REST API module select defaults to the first healthy module in discovery order (after opt-in filter)
- Include **Beta APIs and endpoints** is checked by default (`DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS.includeBetaEndpoints`); **Internal APIs and endpoints** remains off, so `*-internal` modules (for example Discord Preview API / `discord/v0-internal`) are absent from **API to explore** until that checkbox is checked
- Module rail heading and endpoint **names** (OpenAPI summary; path only as fallback) use `<bdi>`; HTTP method tags use `dir="ltr"`; picker menu labels and module descriptions use BiDi isolation (`isolatePickerLabel()`); REST API module select uses native Codex menu hover, keyboard highlight, and selected styling (no custom `.cdx-menu-item` state overrides on the explorer page); beta/internal modules show **label-only** warning InfoChips beside the name with version-only supporting text (Codex exception #14); module rail endpoint rows use documented standalone-`CdxMenuItem` exceptions (progressive name on hover/selected, semantic method colours preserved, transparent selected background); project controls module row uses **`column-gap: var(--spacing-150)`** (24px) between REST API module select and Opt-in fieldset; inline collapsible rail shows at most seven endpoint rows before the endpoint scrollport scrolls internally; sticky scroll divider when endpoint list is scrolled; **no** gap on `.explorer-page__project-controls-stack` between controls and the inline rail anchor
- Write-request Test Request modal: **`CdxMessage`** appears only below the address bar for POST/PUT/PATCH/DELETE when a test wiki is mapped (not under Response Headers or other modal sections after Send); copy names the production wiki and a mocked link to the test wiki display name; requests are not rewritten away from production
- Write-request confirm dialog: address-bar **Send** on write methods opens **`CdxDialog`** contained to `#explorer-reference-panel`; action group end-aligned with **Confirm** left of **Cancel**; title 18px / body 16px; Cancel does not send; disable via `SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED`
- If `Object.assign` is required as a workaround for Scalar reactivity, it is documented with an inline comment

### Failure signals to report

- If any instance's spec URL pattern cannot be confirmed: document findings and fall back to Petstore placeholder for that entry, clearly labelled
- If spec switching requires full component remount (`v-if` + `:key`): document this explicitly — the fallback is acceptable but must be noted
- If Scalar fails to render a structurally different spec (e.g. Wikidata's Wikibase API vs MediaWiki Core): document the failure mode and whether it is a Scalar limitation or a spec validity issue