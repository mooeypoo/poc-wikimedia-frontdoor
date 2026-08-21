# Developer guide

The curated, in-repository guide for developers working directly on the Front
Door codebase. These documents are written as guidance and principles – the
*why* alongside the *what* – rather than exhaustive API reference. They are kept
deliberately separate from the loose material one level up in
[../](..), which holds older ADRs and working notes not written for this
audience.

## Contents

Start here for the shared values, then read the topic guides as needed:

- [architecture-principles.md](architecture-principles.md) – the foundational
  principles: three-layer separation of concerns, configuration over hardcoding,
  DRY, composables, naming, documentation-as-done, and directionality/BiDi as
  first-class concerns. Read this first.
- [language-and-internationalization.md](language-and-internationalization.md) –
  the two i18n systems (banana-i18n for interface strings, Nuxt i18n for content
  routing), the canonical language catalog and fallback chains, language
  flattening, RTL layout, and BiDi isolation rules.
- [translatable-content.md](translatable-content.md) – the third content pathway:
  short pages whose source language is authored once with translatable segments
  marked inline, generated into one file per locale from banana message
  catalogues. Choosing between the three pathways, where the library boundary
  sits, what is production-shaped versus scaffolding, and the three things that
  gate a production rollout.
- [dynamic-spa-surfaces.md](dynamic-spa-surfaces.md) – what makes a surface a
  client-side SPA, how SPAs coexist with the SSG site, the principles common to
  all of them (locale exemption, deep linking, navigation boundaries), and the
  two surfaces built so far: the Explorer and token management.
- [explorer-deep-linking.md](explorer-deep-linking.md) – how Explorer state is
  encoded in URLs: verbose vs. quick links, hash ownership, instance resolution,
  fleet-wide loading, fallback behavior, and the relationship to endpoint search.
- [generation-and-maintenance-scripts.md](generation-and-maintenance-scripts.md) – the standalone
  scripts that feed the portal from Wikimedia: the source-of-truth generators
  (language catalog, wiki fleet, REST API modules), the content importer and its
  HTML-to-Markdown converter, and supporting tools (dark-mode tokens). What each
  does, what to use directly, and what to treat as reference.
- [ai-agents-accessibility.md](ai-agents-accessibility.md) – how to make the site
  discoverable and usable by AI agents that cannot execute the SPA: a static
  discovery layer (robots.txt, llms.txt, a module manifest, an instance index,
  sitemap) derived from the same module/instance metadata as everything else.

## Case studies

Records of work that was built and measured rather than guidance on how to build.
Kept because the measurements and failure modes are reusable, and because parts
of a design we declined as a whole may still be worth adopting piecemeal.

- [static-api-reference-experiment.md](static-api-reference-experiment.md) – a
  static, indexable API reference generated from the committed OpenAPI specs:
  built, measured, and recommended for release **English-only and permanently
  so**, with language coverage left to the Explorer. Separates three needs that
  had been bundled together (search visibility, AI coverage, a no-JavaScript
  fallback), then matches each against what translation actually contributes –
  the conclusion being that it contributes almost nothing to two of them and is
  counterproductive for the AI corpus. Contains the measured cost of
  prerendering at scale, why per-language search-engine annotations grow
  quadratically rather than linearly, the constraint that bites first (build
  memory, not disk), and four alternatives compared honestly. The
  machine-readable surfaces it describes are a concrete implementation of
  [ai-agents-accessibility.md](ai-agents-accessibility.md).

When a document leans on a decision recorded in an ADR, it links out to the
relevant file in [../](..) rather than restating it.
