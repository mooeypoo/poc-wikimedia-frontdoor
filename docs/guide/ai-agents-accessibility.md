# AI agent accessibility

Making the Wikimedia developer portal discoverable and usable by AI agents, alongside human developers.

## Purpose and scope

This document describes how the portal should be structured to be discoverable and usable by AI agents and LLM-based developer tools, in addition to human developers.

AI agents cannot reliably use single-page applications (SPAs). They cannot execute JavaScript, maintain session state, or infer structure from visual layout. A documentation site built entirely as an SPA is, from an agent's perspective, an opaque shell with no accessible content. This is a growing concern as developer workflows increasingly involve AI assistants that consult API documentation autonomously.

The goal is not to rebuild the documentation site for machines, but to add a lightweight, well-structured discovery layer alongside it that agents can use. Human-facing content and machine-facing content can – and should – coexist and derive from the same underlying data. Much of that underlying data already exists in this codebase as the module source of truth (see [source-of-truth-scripts.md](source-of-truth-scripts.md)). This document points back to it repeatedly, because the discovery layer should be generated from it rather than from a separately maintained dataset.

## How AI agents navigate documentation

Understanding how an agent approaches an unfamiliar API site is important for structuring the right response. Agents generally follow one of two query patterns:

- **Task-first:** the agent knows what outcome it wants ("get article abstracts from French Wikipedia") but does not know which module or endpoint to use. It needs guidance – the kind that written documentation provides.
- **Module-first:** the agent already knows which API it needs ("the Action API for German Wiktionary") and simply needs the correct spec URL for the right instance. It needs a structured index.

Both patterns need to be served. Written documentation (guides, capability overviews, "which API should I use" articles) serves the task-first pattern. A structured machine-readable manifest serves the module-first pattern. These are complementary, not redundant.

Agents also follow a predictable cold-start sequence when arriving at an unfamiliar domain. They check a small set of well-known locations in order:

- **robots.txt** – to understand what they are permitted to access and to find links to discovery resources
- **llms.txt** – an emerging convention for AI-readable site orientation (analogous to robots.txt but for LLMs rather than crawlers)
- **sitemap.xml** – to enumerate available pages when no other discovery mechanism is present
- Manifest or index endpoints linked from the above

None of these require any JavaScript rendering. They are static, text-based resources that any HTTP client can fetch. This is the foundation of the accessibility strategy.

## The specific challenge for this site

The portal has structural characteristics that make naive approaches insufficient:

- The documentation site is a JavaScript SPA (Scalar-based), which AI agents cannot parse for content.
- APIs are organized into modules – semantically grouped sets of endpoints – each with its own OpenAPI specification. The prototype's discovery sweep currently finds around ten modules fleet-wide, but this is expected to grow. An individual instance may expose on the order of twenty modules or more as coverage expands, so the discovery layer should be built to scale to that rather than assume a fixed small set.
- Those modules are distributed across roughly 900 wiki instances spanning about a dozen projects (Wikipedia, Wiktionary, Wikidata, Commons, and others), with not all modules available on all instances.
- The canonical source of which modules exist on a given instance is a live discovery endpoint on that instance (`/w/rest.php/specs/v0/discovery`), not a static list.
- A spec is expected to become retrievable in a specific language via a query parameter once upstream MediaWiki REST support lands (see the note below). In principle that produces a very large matrix of possible files.

A full pre-generated static site covering all combinations is impractical. The strategy instead is to build a small, authoritative, static discovery layer that gives agents enough orientation to fetch exactly what they need from the live infrastructure – without requiring the agent to render any JavaScript or guess at URL structures.

> **Note on the language parameter.** Requesting a spec in a specific language via a query parameter is a *planned* upstream MediaWiki REST capability that is **not yet implemented**. Everywhere this document and its samples show a `lang` parameter, treat it as forward-looking: design the discovery layer so the parameter can be documented and surfaced once it exists, but do not assume it works today. English is the only reliably available spec language at present.

## Recommended discovery layer

The following resources should be produced and kept current. Each serves a distinct role in the agent discovery chain. Together they form a complete and self-describing discovery surface. All of them should be generated from the module source of truth (see [build and maintenance considerations](#build-and-maintenance-considerations) below) rather than hand-maintained.

### robots.txt

The robots.txt file should explicitly permit known AI agent crawlers to access the discovery resources, and reference the llms.txt file so agents know it exists. Most AI agents check robots.txt first when arriving at an unfamiliar domain.

Key things to include:

- A `Sitemap:` directive pointing to the sitemap.
- A reference to the llms.txt location – while not a formal standard, a growing number of AI agents check for this pointer. This can be added as a comment or, where supported, as a dedicated directive.
- Explicit `Allow` rules for the discovery resources (manifest, instance index, llms.txt), even if the site otherwise restricts crawling, since the SPA shell has no useful content for agents to crawl anyway.

> **Note:** robots.txt is the first file most agents check. A robots.txt that only contains `Disallow` rules with no discovery pointers is a dead end for an agent trying to do something useful.

### llms.txt

llms.txt is a plain-text file served at a well-known path (conventionally at the root of the domain) that provides a concise, human- and machine-readable orientation to the site. It is the most important single file for AI agent accessibility.

Unlike robots.txt, which is about permissions, llms.txt is about orientation. An agent that reads only llms.txt should come away knowing:

- What this site is and what it contains
- How Wikimedia APIs are structured (the module/instance model)
- How to find the right API for a task (links to written guidance)
- How to programmatically discover available specs (links to the manifest and instance index)
- The URL pattern for fetching a spec directly, including how to request it in a specific language once that is supported

The llms.txt file should be kept short enough to read in a single request – ideally under 2,000 words – but dense enough that an agent can act on it without following any links. Think of it as the elevator pitch and quick-start guide for a developer who has never heard of Wikimedia APIs, written in plain prose rather than rendered HTML.

Critically, it should describe the module/instance model in plain language, explain that not all modules are available on all instances, and tell the agent how to resolve this (query the discovery endpoint of a specific instance, or consult the manifest).

> **Note:** llms.txt should be a real file on disk, not dynamically generated, so it is always available even under heavy load. It should be regenerated as part of the build or deploy pipeline when module metadata changes.

### Module manifest

The module manifest is the structured index of all available API modules. It is the primary machine-readable resource for an agent that knows what it wants and needs to find where to get it.

The manifest should be a single JSON file served at a stable, well-known URL. It should be referenced from llms.txt and robots.txt.

**What the manifest should describe per module:**

- A stable identifier (slug) for the module, including its version segment (e.g. `site/v1`, `attribution/v0-beta`) – the same full name the module source of truth uses
- A human-readable title and a one- to two-sentence description of what the module covers and what kinds of tasks it supports
- The scope of the module – whether it is available universally across all instances, on a project subset, or on a single instance. This single field saves an agent significant inference work.
- A canonical spec URL for English, as a concrete example an agent can use immediately
- A description of the language parameter (once available) – telling the agent that a spec can be retrieved in another language and how to do so
- A list of the instance domains where this module is available, or a reference to the instance index for modules available on a large number of instances
- Links to relevant written guides on the documentation site, where they exist

**Where each field comes from.** Most of the manifest can be generated directly from the module source of truth ([modules.generated.ts](../../config/generated/modules.generated.ts) and [wikiInstances.generated.ts](../../config/generated/wikiInstances.generated.ts), accessed through [moduleSourceOfTruth.ts](../../config/moduleSourceOfTruth.ts)):

- **slug, title, spec URL, instance list** – already present per module (`name`, `title`, `specUrl`, `instances`). No new source needed.
- **scope** – a *computed* field, derived from the `instances` array rather than hand-maintained: a module present on (nearly) the whole fleet is `universal`, one present on a single instance is `singleton`, anything in between is a `project-subset`.
- **description** – **not currently captured** by the generation step. This is a genuine gap. Two candidate sources: the module's own OpenAPI document (the `info.description` field in the captured spec) or an authored per-module description. Decide on a source before relying on this field – see the open questions in [explorer-deep-linking.md](explorer-deep-linking.md), which flags the same missing metadata.
- **guide links** – authored, merged from content frontmatter at build time (see [connecting guides to modules](#connect-guides-to-modules-via-metadata)).

**What the manifest should not do:**

- Embed full spec content inline – the manifest is an index, not a delivery mechanism. Agents fetch the spec separately once they know the URL.
- Enumerate every language variant – the language-parameter approach (once available) makes this unnecessary and would make the manifest unmanageably large.
- List all instances inline for universal modules – for modules available on hundreds of instances, a reference to the instance index with a note that the module is near-universal is more useful than a 900-item array.

> **Note:** The scope field on each module is particularly valuable for agents. A module described as "singleton – only available on wikidata.org" immediately tells an agent it does not need to select an instance. A module described as "universal" tells it that any instance will do and the choice is about language, not capability.

### Instance index

The instance index is a companion to the manifest. Where the manifest is organized by module, the instance index is organized by wiki instance. It should be a separate file referenced from the manifest, and it maps directly onto the generated fleet registry ([wikiInstances.generated.ts](../../config/generated/wikiInstances.generated.ts)), which already carries each instance's domain, language, and direction.

For each instance, the index should include:

- The instance domain
- The project it belongs to (Wikipedia, Wiktionary, Wikidata, etc.)
- The language code (BCP 47) and human-readable language name – or a note that the instance is language-agnostic (as Wikidata is)
- The URL of the instance's discovery endpoint, which an agent can query to get the live list of available modules for that instance

The instance index serves two purposes. First, it allows an agent to answer "which instance should I use for language X and project Y" without having to know the URL convention. Second, it provides the discovery endpoint URL for cases where an agent needs to verify what modules a specific instance actually offers before attempting a fetch.

The instance index can be large (roughly 900 entries) but each entry is small, so the total file size should remain manageable. It does not need to be paginated.

### Sitemap

The sitemap should enumerate all documentation pages on the site – guides, reference articles, getting-started content, and any other statically-generated pages. It does not need to enumerate individual OpenAPI spec URLs, since those are covered by the manifest.

The sitemap serves agents that navigate by page enumeration rather than by manifest. It is also used by search engines, so it is worth producing regardless. The same data used to generate the manifest (module metadata, instance list) can drive sitemap generation, ensuring the two stay in sync.

Spec URLs served directly from wiki instances are external to the documentation site and do not belong in the doc site's sitemap. The manifest is the right place to enumerate those.

## Making written documentation useful for agents

The written documentation – guides, capability overviews, getting-started articles – is the primary resource for task-first agents. A well-structured written guide can give an agent the context it needs to select the right module and instance without having to parse the entire manifest. Several practices improve this significantly.

### Structure guides for plain-text readability

Written guides will be read by agents as plain text, not as rendered webpages. This means:

- Avoid relying on visual layout to convey structure. A decision tree that works as a rendered flowchart is useless to an agent reading raw text.
- Use explicit, descriptive headings. "Which API should I use for reading article content?" is a better heading than "Reading content" because it matches the way agents phrase queries.
- Name modules explicitly in the text using their canonical slugs. An agent that reads "use the `site/v1` module for this" can directly cross-reference the manifest.
- Write use-case descriptions that include the kind of language a developer might use: "if you want to get the plain-text summary of a Wikipedia article", "if you need to check recent changes across a wiki".

### Connect guides to modules via metadata

Each written guide should declare which modules it is relevant to. This can be done in document frontmatter (for markdown-based content) or in a sidecar metadata file. The benefit is bidirectional:

- The manifest can include links to relevant guides per module, so an agent consulting the manifest for a module also gets a pointer to the best human-readable explanation of when to use it.
- Agents that arrive via a guide are one step away from the spec, rather than having to navigate back through the manifest.

This cross-referencing is the connective tissue between the task-first and module-first agent patterns. It does not require significant engineering – frontmatter metadata on markdown files and a build step that merges it into the manifest output is sufficient.

### Prioritise the "which API" guide

If only one piece of written content is optimised for agent readability, it should be the guide that helps a developer choose the right API. This document is the highest-value page on the site for an agent operating in task-first mode, because it maps intent to module in explicit, scannable prose.

It should be written so that reading it as plain text – without any CSS, JavaScript, or visual rendering – still conveys the full decision logic. A list mapping use-cases to module names, with a one-line description of each module, is more useful to an agent than a polished interactive decision tree.

## Language considerations

The language dimension of the API is a significant complexity that needs to be handled carefully in the discovery layer. There are two distinct language concerns:

- The language of the wiki instance (which Wikipedia are we talking to – English, French, Arabic?)
- The language in which the OpenAPI spec itself is returned (the human-readable descriptions, summaries, and parameter documentation within the spec)

These are independent axes. An agent might want to use the French Wikipedia instance but read the API spec in English, or vice versa. The manifest and llms.txt should make this distinction explicit – while being clear that the spec-language axis is not yet available (see the note in [the specific challenge for this site](#the-specific-challenge-for-this-site)).

The recommended approach is:

- Encode the wiki instance (and by extension its primary language) in the URL – the instance domain is unambiguous and self-describing. This axis works today.
- Describe the spec language as a separate query parameter. When upstream support lands, the manifest should explain this parameter clearly, with examples, and note that English is the default. Until then, document it as planned so agents (and humans) know it is coming.
- Include explicit BCP 47 language codes for each instance in the instance index (not just the domain, from which a language might be inferred but not reliably). This allows agents to filter by language without pattern-matching on domain names.

> **Note:** The llms.txt file itself should be in English, as that is what most agents will expect by default. If translated versions of the discovery layer are produced in future, they can be referenced from the English llms.txt.

## Build and maintenance considerations

The discovery layer is only useful if it is kept current.

### Single source of truth

The manifest, instance index, sitemap, and references in llms.txt should all derive from one dataset – and in this codebase that dataset already exists. The module source of truth (`config/generated/`, accessed through [moduleSourceOfTruth.ts](../../config/moduleSourceOfTruth.ts)) is generated from Wikimedia's discovery endpoints and already carries the module registry (names, titles, spec URLs, and the instance ids that expose each) and the fleet registry (each instance's domain, language, and direction). See [source-of-truth-scripts.md](source-of-truth-scripts.md) for how it is generated and regenerated.

The discovery layer should be generated *from* this source, not from a separately maintained one, so that adding a module or instance updates the discovery resources automatically and they cannot drift from what the Explorer uses. In a Nuxt-based SSG build this is best implemented as a build-time step that reads the module source of truth and emits the manifest, instance index, and sitemap together as outputs of the same step.

The genuine gaps to close are the fields the source of truth does not yet capture – module descriptions, human-facing scope labels (scope is computable from the instance lists), and guide cross-references. These are additive: they extend the generation step rather than replacing it.

### Cache headers

The manifest and instance index should be served with cache headers that allow CDN and agent caching, but not so long that stale data becomes a problem. A max-age of one hour with a stale-while-revalidate window of 24 hours is a reasonable starting point. The llms.txt file, being more stable, can carry a longer cache TTL.

### Versioning

The manifest should include a generated timestamp and a schema version field. This allows agents and tooling to detect when the manifest has been updated and whether a cached copy is still current. If the manifest structure changes significantly in future, a version field allows old and new clients to coexist during a transition. (The module source of truth already records a generation timestamp in its metadata, so this comes almost for free.)

### Validation

The manifest should be validated against a schema as part of the build pipeline. A manifest with missing required fields, broken URL patterns, or inconsistent module slugs is worse than no manifest, because it can mislead agents into making incorrect requests. At minimum, validate that every module's canonical spec URL returns a valid OpenAPI document as part of CI.

## Summary of recommended resources

| Resource | Purpose | Generated by |
| :---- | :---- | :---- |
| **robots.txt** | Entry point for agent crawlers; permits access to discovery resources; references llms.txt and sitemap | Static file; updated when discovery resource URLs change |
| **llms.txt** | Plain-text site orientation for AI agents; describes the module/instance model; links to manifest, instance index, and key guides | Template with injected module/instance counts; otherwise static prose |
| **Module manifest (JSON)** | Structured index of all modules; canonical spec URLs; scope; language-parameter documentation; links to relevant guides | Build-time step reading the module source of truth; same source as sitemap |
| **Instance index (JSON)** | Full list of all wiki instances with project, language, and discovery endpoint URL | Same build-time step as manifest, from the fleet registry; separated to keep manifest file size manageable |
| **Sitemap (XML)** | Enumeration of all documentation pages for agents and search engines; does not enumerate spec URLs | Nuxt SSG build; same module and instance metadata as manifest |
| **Written guides with module frontmatter** | Task-first navigation for agents; maps developer intent to specific modules; cross-referenced in the manifest | Authored content; frontmatter metadata added by documentation authors; merged into manifest at build time |

The combined effect of these resources is a documentation site where an AI agent – arriving with no prior knowledge – can within two or three HTTP requests identify the correct OpenAPI specification for any combination of module, instance, and (eventually) language. No JavaScript execution is required at any point. The agent-facing discovery layer is a thin addition to the site, derivable from the same data that drives the human-facing content, and maintainable as part of the standard build pipeline.

## Sample files

The following samples illustrate what each discovery resource looks like in practice. Read them with these caveats in mind:

- The discovery-layer resources (llms.txt, manifest, instance index, sitemap) are hosted by the **portal** at `developer.wikimedia.org`. The exact resource paths under it (shown here as `/api-discovery/...`) are placeholders to be finalized during implementation.
- The per-instance discovery and spec URLs are **real**: they live on each wiki (`en.wikipedia.org`, `www.mediawiki.org`, `commons.wikimedia.org`, …), not on the portal, and use the actual MediaWiki REST paths the prototype already reads (`/w/rest.php/specs/v0/...`). The module slugs, titles, and spec URLs are real entries from the module source of truth.
- The `lang` parameter is shown as planned-but-not-yet-available.
- **Numeric counts are illustrative.** Instance counts (e.g. `instance_count`, the "~900 instances" figures) are placeholders for readability, except where noted – `wikibase/v1`'s count of 4 is real. The real numbers come from the module source of truth at generation time; do not treat the figures here as current.

They convey the format, tone, and level of detail each file should contain.

### robots.txt

The robots.txt file is minimal. Its job is to point agents at the resources that are useful to them, and to permit access to those resources explicitly.

```
User-agent: *
Disallow: /

# AI agents: the SPA shell has no accessible content.
# Use the resources below instead.

User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Googlebot
Allow: /llms.txt
Allow: /api-discovery/

Sitemap: https://developer.wikimedia.org/sitemap.xml

# AI agent discovery
# llms.txt: https://developer.wikimedia.org/llms.txt
```

The `Allow` rules ensure that even if the site otherwise restricts crawling, the discovery resources remain accessible. The comment pointing to llms.txt is a courtesy for agents that parse comments; some also check for an `X-LLMs` response header on the root page, which can point to the same file.

### llms.txt

llms.txt is written in plain prose and Markdown. It should be readable by a person and immediately actionable by an agent. The goal is that an agent reading only this file can decide what to do next without any further navigation. Note that the discovery endpoint and spec URLs below are the real MediaWiki REST paths; the `?lang=` example is marked as planned.

```
# Wikimedia API Documentation

Wikimedia provides REST and action APIs for ~900 wiki instances across roughly a
dozen projects: Wikipedia, Wiktionary, Wikidata, Wikisource, Wikiquote, Commons,
and others.

## How APIs are organised

APIs are grouped into modules – sets of endpoints with common semantic behaviour,
such as "site", "attribution", or "wikibase". Modules are versioned; the full
module name includes the version (e.g. site/v1, attribution/v0-beta). Not all
modules are available on every instance; availability varies by project and
sometimes by instance.

Each wiki instance exposes the modules available to it via a discovery endpoint.
Query it to find out exactly what a given instance offers:

  GET https://{instance}/w/rest.php/specs/v0/discovery

All specs are OpenAPI 3. The default (and currently only) spec language is
English. Requesting a spec in another language via a lang query parameter is a
planned upstream capability – see "Fetching a spec" below.

## Finding the right API

If you are not sure which module to use, start here:
- [Which API should I use?](https://developer.wikimedia.org/docs/which-api)
- [Getting started](https://developer.wikimedia.org/docs/getting-started)
- [API capability guide](https://developer.wikimedia.org/docs/capabilities)

## Machine-readable discovery

- [Module manifest](https://developer.wikimedia.org/api-discovery/manifest.json)
  Index of all modules: descriptions, scope, canonical spec URLs, and which
  instances each module is available on.

- [Instance index](https://developer.wikimedia.org/api-discovery/instances.json)
  All ~900 wiki instances with project, language code, and discovery endpoint URL.

## Fetching a spec

To see what modules a specific instance offers:
  GET https://{instance}/w/rest.php/specs/v0/discovery

The discovery response gives a spec URL per module. Fetch it directly, e.g.:
  GET https://www.mediawiki.org/w/rest.php/specs/v0/module/attribution%2Fv0-beta

PLANNED (not yet available): request another language with a lang parameter:
  GET https://www.mediawiki.org/w/rest.php/specs/v0/module/attribution%2Fv0-beta?lang=fr
```

The file stays short deliberately. An agent does not need to read everything about the API here – it needs enough to orient itself and know where to go next.

### Module manifest (excerpt)

The module manifest is the structured index agents use when they know what they want and need to find where to get it. It is organized by module, with enough metadata per entry that an agent can make an informed choice without fetching anything else first. The slugs, titles, and spec URLs below are real entries from the module source of truth; `scope` is computed from each module's instance coverage, and the top-level `language_parameter` block records that the language axis is planned rather than live.

```json
{
  "version": "1",
  "generated": "2026-07-18T00:00:00Z",
  "description": "Index of all Wikimedia API modules. Each entry describes one module, its availability across wiki instances, and how to fetch its OpenAPI spec.",
  "instance_index_url": "https://developer.wikimedia.org/api-discovery/instances.json",
  "language_parameter": {
    "name": "lang",
    "status": "planned",
    "default": "en",
    "note": "Per-spec language selection is a planned upstream MediaWiki REST capability and is not yet available. English is currently the only spec language."
  },
  "modules": [
    {
      "slug": "-",
      "title": "MediaWiki REST API",
      "description": "The base REST API present on every instance: core page, revision, and search operations.",
      "scope": "universal",
      "spec_url": "https://www.mediawiki.org/w/rest.php/specs/v0/module/-",
      "guides": [
        {
          "title": "Getting started with the REST API",
          "url": "https://developer.wikimedia.org/docs/rest-getting-started"
        }
      ]
    },
    {
      "slug": "wikibase/v1",
      "title": "Wikibase REST API",
      "description": "Read and write structured data on Wikibase repositories. Available on Wikidata and Commons.",
      "scope": "project-subset",
      "spec_url": "https://commons.wikimedia.org/w/rest.php/specs/v0/module/wikibase%2Fv1",
      "instance_count": 4,
      "instances_url": "https://developer.wikimedia.org/api-discovery/instances.json?module=wikibase%2Fv1",
      "guides": []
    },
    {
      "slug": "attribution/v0-beta",
      "title": "Attribution API (Beta)",
      "description": "Retrieve licence and attribution information for Wikimedia content.",
      "scope": "project-subset",
      "spec_url": "https://www.mediawiki.org/w/rest.php/specs/v0/module/attribution%2Fv0-beta",
      "instance_count": 412,
      "instances_url": "https://developer.wikimedia.org/api-discovery/instances.json?module=attribution%2Fv0-beta",
      "guides": []
    }
  ]
}
```

The `scope` field is the most important signal for an agent selecting an instance. `universal` means any instance will work and the choice is purely about language. `singleton` means there is only one instance to use and no selection is needed. `project-subset` means the agent should consult the instance index or the module's `instances_url` to find a valid instance. All three are derivable from the module's `instances` list in the source of truth – no separate data source is required.

### Instance index (excerpt)

The instance index is the companion to the module manifest, and mirrors the generated fleet registry. An agent that needs to find the right instance for a given language and project – or that wants to verify what a specific instance offers – consults this file.

```json
{
  "version": "1",
  "generated": "2026-07-18T00:00:00Z",
  "description": "All Wikimedia wiki instances. Use the discovery_url of any instance to retrieve the live list of API modules available on that instance.",
  "instance_count": 923,
  "instances": [
    {
      "domain": "en.wikipedia.org",
      "project": "wikipedia",
      "lang": "en",
      "lang_name": "English",
      "discovery_url": "https://en.wikipedia.org/w/rest.php/specs/v0/discovery"
    },
    {
      "domain": "fr.wikipedia.org",
      "project": "wikipedia",
      "lang": "fr",
      "lang_name": "français",
      "discovery_url": "https://fr.wikipedia.org/w/rest.php/specs/v0/discovery"
    },
    {
      "domain": "www.wikidata.org",
      "project": "wikidata",
      "lang": null,
      "lang_name": null,
      "discovery_url": "https://www.wikidata.org/w/rest.php/specs/v0/discovery"
    },
    {
      "domain": "commons.wikimedia.org",
      "project": "commons",
      "lang": null,
      "lang_name": null,
      "discovery_url": "https://commons.wikimedia.org/w/rest.php/specs/v0/discovery"
    }
  ]
}
```

Wikidata and Commons have `null` language fields because they are not language-specific instances – they serve all languages through a single instance. An agent filtering instances by language should treat `null` as "language-agnostic" rather than "unknown".

The `discovery_url` per instance is the live endpoint an agent can call to get the current list of modules available on that instance, including any that are not yet in the manifest (for example, during a phased rollout of a new module).
