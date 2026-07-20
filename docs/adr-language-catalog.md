# ADR: Unified Language Catalog

**Status:** Decided — implementation not started
**Scope:** The portal's list of languages: one catalog generated from Wikimedia APIs, covering both content locales and interface locales, with fallback filling any gaps.

**Related:** `docs/adr-remote-content-fetching.md` (Step 2 wiki-translated-page fetching lands translations into locales this catalog defines).

---

## Problem

The prototype hardcodes five locales (`en`, `es`, `fr`, `he`, `fa`) in three places:

- `config/languages.ts` — `SUPPORTED_LANGUAGES`, the **content** locale catalog (fallback chains), consumed by `useLocalizedContentPage`, `useContentSearch`, `useDirection`.
- `config/interfaceLocales.ts` — `SUPPORTED_INTERFACE_LOCALES`, the **interface** locale subset shown in the header language picker.
- `nuxt.config.ts` — `i18n.locales`, the routing prefixes.

The goal is to support **every language Wikimedia offers** (~430–700 codes depending on source), so that any on-wiki translation has a home and the language picker can eventually list them all. The five-locale set was only ever a prototype convenience.

Two design facts make this tractable:

1. Wikimedia's own APIs are the authoritative source for the full language list plus each language's direction, native name, and fallback chain — so the catalog can be **generated**, not hand-maintained.
2. The interface layer **already falls back to English** for unknown locales (see §5), so adding a language the portal has no translations for degrades gracefully rather than breaking.

---

## 1. One language list, not two

**Decision:** There is a single canonical language catalog. The content-locale / interface-locale distinction is removed. `config/interfaceLocales.ts` and `SUPPORTED_INTERFACE_LOCALES` are **deleted**; every consumer reads the one catalog.

**Rationale:** The only purpose of the second list was to *curate* which languages get first-class interface treatment. That curation is explicitly rejected: every language is supported; if content or interface strings are missing for a language, the fallback chain (ultimately English) fills the gap. A curated interface subset is therefore redundant.

**The distinction that survives is derived, not configured.** "Which languages have real interface translations" is meaningful (e.g. for a future completeness indicator), but it equals *which `i18n/*.json` message files exist* (`Object.keys(MESSAGES_BY_LOCALE)` in `app/plugins/banana-i18n.ts`). It is derived from the filesystem, never a hand-maintained config list.

**Consequences:**
- `config/interfaceLocales.ts` removed.
- `app/components/shared/ShellHeaderUtilityActions.vue` and `app/layouts/default.vue` (its two consumers) switch to the catalog.
- No code path may reintroduce a separate "supported interface locales" config list.

---

## 2. The catalog is generated from Wikimedia APIs

**Decision:** A script — `scripts/generate-language-catalog.mjs` — fetches the language list from a Wikimedia wiki and writes a committed generated file. The catalog is regenerated occasionally and reviewed via git diff, not maintained by hand.

**Source APIs (verified against `www.mediawiki.org`):**

| Purpose | Call | Returns |
|---|---|---|
| Catalog spine | `action=query&meta=siteinfo&siprop=languages&formatversion=2` | `query.languages[]` = `{ code, bcp47, name }` (~700 entries) |
| Enrichment | `action=query&meta=languageinfo&liprop=code\|bcp47\|dir\|autonym\|name\|fallbacks&formatversion=2` | per-code `{ dir, autonym, name, fallbacks[] }` (~500 entries) |

**Decision — spine + enrichment (not `languageinfo` alone):** the spine is `siteinfo/languages` (the canonical *selectable content languages* list). Each entry is enriched with `dir`, `autonym`, and `fallbacks` from `languageinfo`, joined on `code`. This deliberately excludes the formal/private variant codes (`de-formal`, private-use tags) that `languageinfo` carries but that will never hold real wiki content, while keeping the native names and directionality the picker needs.

**Source wiki:** `https://www.mediawiki.org/w/api.php`, configurable via a constant in the script. Any Wikimedia wiki returns the same core set; mediawiki.org is chosen as the canonical, stable reference.

**Consequences:**
- Requests must send a descriptive `User-Agent` per Wikimedia API policy.
- The script is a maintenance tool, not a build step — it is **not** added to `build` / `generate`. Regenerating is a deliberate, reviewed act (`npm run generate-language-catalog`, then commit the diff).

---

## 3. File layout: generated data + hand-authored policy

**Decision:**

- `config/languages.generated.ts` — the full catalog array, **committed**, overwritten wholesale by the generator. Never hand-edited.
- `config/languages.ts` — imports the generated array, keeps the `LanguageConfig` type, `getLanguageByCode`, and a small hand-authored **override layer** (e.g. to pin a custom fallback chain or, during the prototype, to restrict the *active* set). `SUPPORTED_LANGUAGES = mergeOverrides(GENERATED, OVERRIDES)`.

**Rationale:** Regeneration must never clobber hand-authored policy. Separating generated data from policy keeps the diff of a regen small and readable, and satisfies AGENTS.md Rule 6 (policy lives in `config/`; the generated file is reviewed data, like a committed lockfile).

**Committed, not gitignored:** unlike fetched remote content (regenerated every build, gitignored), the catalog is reviewed through its git diff — that diff *is* the "occasionally see if it needs updating" workflow.

---

## 4. `LanguageConfig` gains `autonym`, `bcp47`, `name`

**Decision:** Extend the type:

```ts
export interface LanguageConfig {
  code: string
  dir: 'ltr' | 'rtl'
  fallbackChain: string[]
  autonym: string   // native name, e.g. "עברית" — used as the picker label
  bcp47: string     // BCP-47 tag — used for i18n `language` field / lang attribute
  name: string      // English name — reference / search
}
```

The additions are purely additive; existing consumers (`useDirection`, `useContentSearch`, `useLocalizedContentPage`) are unaffected.

**Fallback policy:** `fallbackChain` = the language's `languageinfo` `fallbacks` array, with `en` guaranteed as the terminal entry (MediaWiki fallback chains do not always end in `en` — English's is `[]`, Hebrew's is `[]`). Every code referenced in a chain must itself exist in the catalog.

---

## 5. Interface fallback already works; only one guard changes

**Context:** `app/plugins/banana-i18n.ts` already degrades gracefully for unknown locales:
- `getBanana(locale)` constructs a Banana instance with `MESSAGES_BY_LOCALE[locale] ?? en`.
- `i18n()` does a final `banana.i18n() || en[key] || key`.

So an unregistered locale like `de` renders **English chrome**, not raw keys, today.

**The one blocker:** `setInterfaceLocale` snaps any non-message-bearing locale back to English:

```js
interfaceLocale.value = MESSAGES_BY_LOCALE[ nextLocale ] ? nextLocale : 'en'
```

**Decision (Step 1.5):** relax this guard to accept any locale present in the catalog. Message resolution still falls back to English for locales without a JSON file. Message files in `i18n/` stay at whatever is actually translated — the catalog does not require a JSON per language.

**Deferred concern:** message JSONs are statically imported and bundled. That is fine at a handful of files; if interface translations grow to dozens, switch to lazy per-locale loading. Out of scope here.

---

## 6. The language picker: autonym labels + searchable

**Decision (Step 1.5):**

1. The header language picker maps the **catalog** (not a curated list) and labels each option with its **`autonym`**. It does **not** use `interface-language-${code}` banana keys — we will not hand-author ~430 such keys.
2. The picker becomes **searchable/typeahead** (`CdxLookup` or a filterable menu). A ~430-option `CdxSelect` is unusable.

**Consequences:**
- `ShellHeaderUtilityActions.vue` picker rebuilt around `CdxLookup`, sourced from the catalog, filtered by autonym / English name / code.
- This **revises** the current curated-`CdxSelect` design in `DESIGN_REQUIREMENTS.md` ("Interface language select"); that section must be updated (see Corrections).
- The `interface-language-*` message keys in `i18n/*.json` become unused for the picker (may remain for other display or be removed).

---

## 7. Scale: SSR is fine; full static generation is not

**Context:** Netlify deploys via `nuxt build` (SSR / Nitro server — see `netlify.toml` → `build:netlify`). Registering ~430 `i18n.locales` there does **not** multiply prerendering; pages render on request and missing content files fall back.

**Decision:**
- Register the catalog as `i18n.locales` under the SSR build.
- `nuxt generate` / `generate:static` (full SSG) does **not** scale to 430 locales × every page and is treated as dev-only / must gate its prerender crawl to real content. Do not rely on it for production output while the catalog is large.

---

## Corrections to existing documentation

| Document | Section | Required correction |
|---|---|---|
| `DESIGN_REQUIREMENTS.md` | "Interface language select" (~§ header utility row) | Replace curated-`CdxSelect` (globe icon, 5 full names) with a searchable `CdxLookup` sourced from the full catalog, labelled by autonym. Note English-chrome fallback for untranslated interface locales. |
| `ARCHITECTURE.md` | i18n / locales overview | Note the single generated catalog (`config/languages.generated.ts`) as the source of all locales; remove the content-vs-interface two-list framing. |
| `AGENTS.md` | Rule 6 (configuration in `config/`) | Note `config/languages.generated.ts` is generated (regen-and-diff), and `config/languages.ts` holds the hand-authored override layer. |

---

## Implementation steps

### Step 1 — Generate the catalog (data only, non-breaking)
1. `scripts/generate-language-catalog.mjs`: fetch `siteinfo/languages` + `languageinfo`, join on `code`, append `en` terminal to each fallback chain, sort deterministically.
2. Extend `LanguageConfig` with `autonym`, `bcp47`, `name`.
3. Write committed `config/languages.generated.ts`; refactor `config/languages.ts` to `[...GENERATED, ...overrides]`, keep `getLanguageByCode`.
4. Add npm script `generate-language-catalog`; document the regen-and-diff workflow.

*Non-breaking: nothing routes or renders differently yet; the catalog is just bigger data.*

### Step 1.5 — Unify on the catalog (wiring; scale-sensitive)
1. Delete `config/interfaceLocales.ts`; repoint `ShellHeaderUtilityActions.vue` and `layouts/default.vue`.
2. Relax the `setInterfaceLocale` guard (§5).
3. Point `nuxt.config.ts` `i18n.locales` at the catalog (SSR).
4. Rebuild the language picker as searchable `CdxLookup` with autonym labels (§6).
5. Update `DESIGN_REQUIREMENTS.md` (§ Corrections).

---

## Open questions / risks

- **Prototype active set.** With the full catalog registered, the picker exposes ~430 mostly-English-fallback languages immediately. If that is undesirable during the prototype, the override layer (§3) can restrict the *active* set while keeping the full catalog as data. Decide when wiring Step 1.5.
- **Variant codes.** `zh-hans` / `zh-hant` and similar variants: included if present in `siteinfo/languages`. Confirm they route and fall back sensibly when Step 2 produces variant translations.
- **`bcp47` correctness for i18n.** A few MediaWiki codes map to non-obvious BCP-47 tags; the API-supplied `bcp47` is authoritative, but spot-check the ones Nuxt i18n is strict about.
- **Bundle size** of statically imported message JSONs as interface translations grow (§5).
