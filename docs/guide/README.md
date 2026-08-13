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
- [dynamic-spa-surfaces.md](dynamic-spa-surfaces.md) – what makes a surface a
  client-side SPA, how SPAs coexist with the SSG site, the principles common to
  all of them (locale exemption, deep linking, navigation boundaries), and the
  two surfaces built so far: the Explorer and token management.
- [explorer-deep-linking.md](explorer-deep-linking.md) – how Explorer state is
  encoded in URLs: verbose vs. quick links, hash ownership, instance resolution,
  fleet-wide loading, fallback behavior, and the relationship to endpoint search.
- [source-of-truth-scripts.md](source-of-truth-scripts.md) – the standalone
  scripts that feed the portal from Wikimedia: the source-of-truth generators
  (language catalog, wiki fleet, REST API modules), the content importer and its
  HTML-to-Markdown converter, and supporting tools (dark-mode tokens). What each
  does, what to use directly, and what to treat as reference.
- [ai-agents-accessibility.md](ai-agents-accessibility.md) – how to make the site
  discoverable and usable by AI agents that cannot execute the SPA: a static
  discovery layer (robots.txt, llms.txt, a module manifest, an instance index,
  sitemap) derived from the same module/instance metadata as everything else.

When a document leans on a decision recorded in an ADR, it links out to the
relevant file in [../](..) rather than restating it.
