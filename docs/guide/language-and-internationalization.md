# Language and internationalization guide

This document covers how language support is architected across the Unified Front Door: what systems are responsible for what, how language selection works, how content is translated and falls back, and how directionality and BiDi isolation are handled in the UI. It is intended as both an orientation for new contributors and a reference for anyone implementing language-related features.

A brief note on BiDi isolation is also included in the [architectural principles](architecture-principles.md) document. This document is the expanded treatment.

## Two systems, one user experience

The portal uses two separate i18n systems, and their responsibilities do not overlap. Understanding this division is the most important thing to know before touching any language-related code.

**banana-i18n** handles all interface strings – navigation labels, button text, error messages, form labels, headings, and any other copy that is part of the application shell rather than page content. It uses a JSON message file format aligned with MediaWiki conventions and supports CLDR-based plural rules, gender forms, and named and positional parameters. It is the only system permitted to produce user-visible interface strings. No other translation function should be called for interface text.

**Nuxt's i18n module (`@nuxtjs/i18n`)** handles content locale routing – the URL prefix that indicates which language a content page is being served in (`/fr/policy`, `/ar/get-started`). It does not own any user-visible strings. It is a routing concern, not a translation concern.

From the user's perspective these two systems work together seamlessly: changing the interface language switches both the shell strings (banana) and the content locale (Nuxt i18n routing) at the same time. The implementation keeps them separate because they solve different problems and have different maintenance characteristics.

A third partial exception exists: the API explorer's internal UI strings (button labels, response section headers, and similar copy rendered by Scalar) are outside our control and do not go through banana-i18n. This is a documented, accepted limitation. It should not be treated as a precedent for adding other exceptions.

## What each system owns

| Surface | System | Notes |
| :---- | :---- | :---- |
| Navigation labels, tab names | banana-i18n |  |
| Button and link text | banana-i18n |  |
| Error and status messages | banana-i18n |  |
| Form labels and placeholders | banana-i18n |  |
| Search UI strings | banana-i18n |  |
| Language picker labels | banana-i18n for UI chrome; autonyms from catalog data | Language names shown as options use native autonyms from the catalog, not banana keys |
| Content page routing (`/fr/`, `/ar/`) | Nuxt i18n | URL prefix only |
| Markdown content translation | Per-locale content directories | `content/[locale]/` |
| API explorer internal strings | Scalar (third-party) | Accepted exception; not our interface surface |

## The canonical language catalog

The portal's language list is generated from Wikimedia's own APIs rather than maintained by hand. The Wikimedia APIs are the authoritative source for the full set of content languages, along with each language's direction, native name (autonym), BCP-47 tag, and fallback chain.

The generated catalog is committed to the repository as a source file and regenerated deliberately – not as part of every build. Regenerating produces a git diff that can be reviewed before committing. This makes the catalog traceable and auditable while eliminating the need to manually maintain hundreds of language entries.

The catalog serves as the single source of truth for the entire application. There is no separate "supported interface languages" list or "supported content languages" list. Every language in the catalog is supported; if content or interface strings are missing for a particular language, the fallback chain handles it gracefully. A user selecting a language the portal has not yet translated will see English chrome and English content – not a broken page.

**Fallback chains** are sourced from the Wikimedia API and stored per language in the catalog, with English guaranteed as the terminal entry. This means fallback is configured data, not application logic. Components and composables that need to resolve a language simply consult the catalog; they do not implement fallback rules themselves.

**The catalog is the only place language policy is defined.** A small override layer allows hand-authored exceptions – for example, pinning a custom fallback chain or temporarily restricting the active language set during early development. These overrides sit alongside the generated catalog, never inside it. The generated file itself is never hand-edited.

**The catalog is a data layer; what the application does with it is a separate concern.** The catalog contains everything that is possible – all languages Wikimedia supports, with their full metadata. What languages are surfaced to users in the language picker, which ones get first-class content support, and how the UI presents partial coverage are business logic decisions that sit above the catalog. These decisions belong in configuration, not in the catalog itself and not in the UI. This matters in practice: an MVP might surface a curated subset of languages in the picker while the catalog silently supports the full set for fallback resolution, content imports, and direction detection. Later iterations can expand the active set without touching the catalog or the UI. Keeping this separation means the catalog can grow and be queried freely without any of that affecting what users see until a deliberate configuration change is made.

## What the catalog looks like

The following is an illustrative example of what a few catalog entries might look like. The actual shape is generated from Wikimedia's APIs – specifically `siteinfo/languages` for the spine and `languageinfo` for enrichment (direction, autonym, fallback chain). The example is intended to make the data model concrete, not to prescribe field names.

```json
[
  {
    "code": "en",
    "bcp47": "en",
    "dir": "ltr",
    "autonym": "English",
    "name": "English",
    "fallbackChain": ["en"]
  },
  {
    "code": "fr",
    "bcp47": "fr",
    "dir": "ltr",
    "autonym": "français",
    "name": "French",
    "fallbackChain": ["fr", "en"]
  },
  {
    "code": "ar",
    "bcp47": "ar",
    "dir": "rtl",
    "autonym": "العربية",
    "name": "Arabic",
    "fallbackChain": ["ar", "en"]
  },
  {
    "code": "he",
    "bcp47": "he",
    "dir": "rtl",
    "autonym": "עברית",
    "name": "Hebrew",
    "fallbackChain": ["he", "en"]
  },
  {
    "code": "ca",
    "bcp47": "ca",
    "dir": "ltr",
    "autonym": "català",
    "name": "Catalan",
    "fallbackChain": ["ca", "es", "en"]
  }
]
```

A few things worth noting in this structure. The `dir` field is explicit on every entry rather than derived at runtime – this is intentional, because direction cannot always be reliably inferred from a language code alone. The `autonym` is the native name used in the language picker; displaying it requires correct BiDi handling since it may be in a different script and direction from the surrounding interface. The `fallbackChain` is an ordered list of language codes to try if content or interface strings are unavailable in the requested language. It begins with the language itself and always ends with English as the guaranteed terminal – so English's own chain is just `["en"]`, since it is its own terminal. A language like Catalan falling back through Spanish before English is a meaningful distinction: a Catalan-speaking user is more likely to read Spanish than English, so the fallback chain reflects that.

This data is not hand-maintained. It is fetched from Wikimedia APIs and committed as a generated file. Any component or composable that needs to know a language's direction, its display name, or its fallback behavior reads from this catalog.

> **Where the data comes from:** The catalog is generated by querying two endpoints on `https://www.mediawiki.org/w/api.php` (any Wikimedia wiki returns the same core set; mediawiki.org is the canonical reference). `action=query&meta=siteinfo&siprop=languages` provides the spine – the full list of selectable content languages. `action=query&meta=languageinfo&liprop=code|bcp47|dir|autonym|name|fallbacks` provides the enrichment – direction, native name, and fallback chains. The two are joined on language code. See the [language catalog ADR](../adr-language-catalog.md) for the design decisions and [generation-and-maintenance-scripts.md](generation-and-maintenance-scripts.md) for the generation logic.

## Language selection and flattening

When a user selects a language, that selection applies simultaneously to both the interface (banana-i18n) and the content locale (Nuxt i18n routing). From the user's perspective there is one language setting, not two.

This "flattening" of the language choice is intentional. The alternative – separate interface language and content language controls – adds UI complexity and creates confusing mixed-language states that are hard to reason about. A single language selection is both simpler to use and simpler to implement.

In practice this means the language switching logic must update both systems together. A composable responsible for language selection should coordinate both the banana locale and the Nuxt i18n route prefix change as a single atomic operation, not leave them to be updated separately by different parts of the UI.

## SPA route exemptions

Some routes in the portal are client-side SPAs and must not receive locale URL prefixes. The API explorer is the primary example: the route should always be `/explorer`, never `/fr/explorer` or `/ar/explorer`. This is because the explorer's language behavior (which wiki instance and language the spec is loaded for) is controlled by in-page controls, not by the URL prefix – and because locale-prefixed SPA routes would create navigational complexity without benefit.

The same principle applies to any future SPA surfaces, such as a token management application. See [dynamic-spa-surfaces.md](dynamic-spa-surfaces.md) for the full treatment of SPA surfaces and [explorer-deep-linking.md](explorer-deep-linking.md) for how the Explorer encodes state in locale-exempt URLs.

This exemption must be explicit and maintained in a single shared utility function. Any code that constructs locale-aware paths should consult that function to determine whether a given route should receive a locale prefix. It should not be left to individual components or pages to decide whether to apply a prefix, because that leads to inconsistency as the application grows.

When crossing the boundary between locale-prefixed content routes and non-prefixed SPA routes, navigation behavior may need special handling to prevent the SPA from receiving stale locale state or vice versa. This boundary has known reliability implications and should be treated as a first-class concern rather than an edge case.

## Content translation and fallback

Translated content lives in per-locale directories under the content layer (`content/[locale]/`). When a user requests a page in a particular language, the application looks for the file in that language's directory first, then falls back through the language's fallback chain until it finds a version, ultimately reaching English.

A page that exists in English but has not been translated into a given language should render the English version gracefully, with a clear indication to the user that the content is not available in their selected language. It should never show a blank page or an error.

Content translation works best when kept simple. Some content will be translated by the community through on-wiki translation tools and imported automatically; some will be authored directly in the content directory. Both pathways land content in the same per-locale directory structure, so the application treats them identically. The distinction between imported and hand-authored content is a workflow concern, not an architectural one – the application does not need to know where a file came from.

The language catalog's fallback chains are the source of truth for how content fallback resolves. Content-fetching logic should read from the catalog rather than implementing its own fallback rules.

## Directionality and RTL layout

The portal serves languages written right-to-left, including Arabic, Hebrew, Persian, and Urdu. RTL support is a first-class requirement, not a post-implementation concern. Any assumption in the codebase that layout is always left-to-right is a bug.

**Direction is derived from the language catalog.** Each language entry in the catalog declares its direction explicitly (`ltr` or `rtl`). Direction should never be inferred at runtime from a language code alone, because the mapping is not always predictable and varies for language subtags. The catalog declaration is authoritative.

**The document direction updates reactively.** When the user changes language, the `dir` attribute on the root element updates to match the new language's direction. The entire shell – navigation, layout, spacing, icons – should respond correctly to this change without requiring a page reload.

**Use logical CSS properties throughout.** All first-party CSS must use logical properties rather than physical ones. `margin-inline-start` instead of `margin-left`, `padding-block-end` instead of `padding-bottom`, `border-inline-end` instead of `border-right`, `inset-inline-start` instead of `left`. The browser maps these automatically based on the document direction. Physical properties should only appear where there is an explicit documented reason – for example, a browser API with no logical equivalent. These exceptions should be commented.

**Third-party component RTL behavior requires explicit handling.** External libraries such as the Codex design system provide RTL stylesheets that must be loaded conditionally when the document direction is RTL. The prototype addressed this with a client-side plugin that enables and disables the RTL stylesheet reactively as the language changes. This approach has known limitations with some Codex components when both LTR and RTL stylesheets are active simultaneously – these gaps should be documented when encountered rather than worked around silently, and ideally addressed upstream.

## BiDi isolation

Bidirectional text isolation is required any time a string of unknown or mixed directionality appears in the UI. This is not limited to RTL interfaces – an LTR interface displaying an Arabic wiki instance name or a Hebrew API description is equally at risk of the Unicode bidirectional algorithm misinterpreting surrounding text.

**The default rule is: isolate everything that does not come from banana-i18n.** Interface strings produced by banana-i18n are safe to render without isolation because their directionality matches the interface direction by definition. Everything else requires isolation.

Strings that must always be isolated include:

- Wiki instance names and project names  
- API module names and descriptions sourced from OpenAPI specs  
- Language names displayed as data (autonyms from the catalog)  
- Usernames and any user-supplied content  
- Content pulled from external sources (wiki pages, remote Markdown)  
- Any string whose language or directionality is not statically known when the component is written

The standard mechanism is a `<bdi>` HTML element wrapping the string. For contexts where HTML wrapping is not available – such as strings passed through banana-i18n substitution parameters – Unicode FSI (`\u2068`) and PDI (`\u2069`) markers achieve the same isolation in plain text.

**Known gap: Scalar spec content.** Strings rendered by the Scalar explorer from OpenAPI spec content – parameter names, descriptions, schema property names, example values – are not BiDi-isolated by default because they are rendered by a third-party component outside the application's component tree. This is a documented limitation. Broad CSS `unicode-bidi: isolate` applied to Scalar's content containers is a partial mitigation. An upstream issue should be filed with Scalar requesting per-string isolation.

Search inputs should use `dir="auto"` so the browser infers direction from the first strong character of the query. This handles RTL queries in an LTR interface correctly without requiring explicit direction detection logic in the application.  