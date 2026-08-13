# Architectural principles

This document describes the architectural principles that guide the design and implementation of the Unified Front Door codebase. It is intentionally high-level: the goal is to establish shared values and decision-making instincts, not to prescribe specific file structures or implementation patterns. Concrete examples of these principles applied can be found in the prototype.

## Separation of concerns

The codebase is organized around three distinct layers, each with a clear and narrow responsibility:

- **Data and engine layer** – fetching, resolving, and transforming data. This layer knows about external APIs, spec URL resolution, language fallback logic, and content fetching. It has no knowledge of how results are rendered.  
- **Business logic layer** – rules and decisions specific to this project: which instances are supported, how language fallback chains are configured, what the defaults are. This layer lives in composables and configuration files and has no knowledge of component structure.  
- **UI layer** – rendering data and handling user interaction. Components in this layer call composables to get data and render it. They do not contain fetch logic, URL construction, or business rules.

A component that needs to display available API modules for a selected wiki instance should call a composable that handles discovery and caching. The component receives a reactive result and renders it. The implementation details of how that data was obtained are invisible to the component.

Violating this separation – fetching data inside a component, hardcoding business rules in a template, constructing URLs in the UI layer – is a code quality issue.

## Configuration over hardcoding

Values that represent project decisions, differ across environments, or are likely to change over time belong in configuration files, not hardcoded in components or composables. This includes: supported wiki instances and their base URLs, language fallback chains, default selections, and feature flags.

Configuration files should be self-documenting: a developer reading a config file should be able to understand what changes in the application when a value is modified, without having to trace through the codebase. Each file should carry a brief description of its purpose and the effect of its keys.

Environment-specific values (API endpoints that differ between staging and production, secrets) belong in environment variables, following the framework's conventions for runtime configuration.

## Content and navigation as first-class features

Updating content and managing navigation structure should be straightforward tasks that do not require understanding the application's internals. Authors adding a page, editors updating a navigation section, or contributors reorganizing the site structure should be able to do so through clear, well-documented pathways – whether that is a Markdown file in the right directory, an entry in a configuration file, or a supported content authoring pattern.

This means treating content editing and menu management with the same care as any other feature. Navigation structure should be defined in configuration that is easy to read and modify. Content should live in predictable locations with consistent conventions. The cost of adding or changing a page should be low, and the pathway should be obvious without needing to trace through the application code.

When a content or navigation change requires touching the application layer – a component, a composable, a route configuration – that is a signal that something should be extracted or made configurable.

## Composables for shared logic

Any logic that appears in more than one component – locale resolution, spec URL computation, session state access, instance selection – should be extracted into a composable and referenced from a single implementation. This is not just a code cleanliness preference: duplicated logic creates divergence over time, where two copies of the same operation start behaving differently because one was updated and the other wasn't.

Composables should be named to describe what they provide, not how they work. `useSpecUrl` is a good name; `useDiscoveryFetchAndUrlBuilder` is not. A composable's name should make sense from the perspective of the component calling it.

## Component conciseness

Vue components are responsible for rendering and user interaction only. A component that requires significant scrolling to read is a signal that logic should be extracted to a composable or that the component should be split. When two components share structural similarity but differ only in content, the difference should be expressed as props on a single component rather than as two near-identical files.

## Don't repeat yourself (DRY)

No logic, template structure, or data transformation should be duplicated across files. This applies equally to markup: repeated UI patterns should become components parameterized by props. The test is simple – if a change to a piece of behavior would require editing more than one file, something should be extracted.

## Naming as communication

Names should be chosen to be self-explanatory to someone unfamiliar with the codebase. Abbreviations should be avoided unless universally understood in context. Domain-specific terms should use their full form: `wikiInstance` not `inst`, `selectedLanguage` not `lang`, `languageFallbackChain` not `fallback`.

Boolean variables and props should read as statements or questions: `isLoading`, `hasError`, `isAuthenticated`. Functions that return booleans should begin with `is`, `has`, or `can`. Event handler props should follow the `on` prefix convention: `onInstanceChange`, `onLanguageSelect`.

## Documentation as part of the work

Documentation is part of the definition of done, not something written after the fact. Every exported function and composable should have a docblock that states what it does, what its parameters are, what it returns, and any non-obvious side effects. Any block of code that is doing something non-obvious – a workaround, a framework-specific constraint, an edge case – should have an inline comment that explains *why*, not just *what*. The what is usually readable from the code; the why is not.

This applies to build scripts and pipeline code as much as to application code.

## Directionality and BiDi as first-class concerns

The portal serves a language surface that includes RTL languages across multiple wiki instances. RTL support is not a post-implementation concern – it should be designed in from the start.

Two principles follow from this:

**Use logical CSS properties.** All first-party CSS should use logical properties (`margin-inline-start`, `padding-block-end`, `border-inline-end`) rather than physical ones (`margin-left`, `padding-bottom`, `border-right`). The browser handles direction mapping automatically based on the document's `dir` attribute. Physical properties should only appear where there is an explicit, documented reason – for example, a browser API that has no logical equivalent.

**Isolate strings of unknown directionality.** Any string that does not come from the application's own interface translation system – wiki instance names, API module names and descriptions, language names from data sources, usernames, any user-generated or externally sourced content – must be bidirectionally isolated using a `<bdi>` element or equivalent mechanism. The default posture should be: isolate everything that is not a hardcoded interface string. Interface strings translated through the project's i18n system are the only category of string safe to render without isolation.

A more detailed treatment of language support, fallback chains, RTL layout, and BiDi in specific contexts (search, the API explorer, content pages) is covered in the [language and internationalization guide](language-and-internationalization.md).