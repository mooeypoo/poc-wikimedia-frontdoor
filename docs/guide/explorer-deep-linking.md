# Explorer deep linking

This document describes the deep linking system for the community API Explorer: how URLs encode Explorer state, how the system resolves links that omit explicit instance information, and the key technical concerns that shaped the implementation. It is focused on the *why* and the architectural considerations rather than specific implementation details, since product decisions about the exact URL grammar may evolve.

Deep linking for enterprise modes (full and custom) is out of scope here. Enterprise has no instance or module selection to encode, and operation-level linking within enterprise is independent work.

## Why deep linking matters

Without deep linking, the Explorer is a dead end for sharing. A developer who has navigated to a specific endpoint on a specific wiki instance cannot send that view to anyone – the URL resolves to the default Explorer regardless of what they were looking at. This undermines one of the core use cases of API documentation: collaborating around a specific endpoint, linking from a bug report, or sharing the exact context of a question.

Deep linking also enables search. If endpoint search results can link directly to a specific operation in the Explorer, the Explorer becomes a navigation destination from anywhere in the portal. Without addressable URLs for individual operations, search results can only link to the Explorer's front door, not to the thing the user actually searched for. The endpoint search feature depends on deep linking being in place first.

## State that needs to be in the URL

For the community Explorer, meaningful state consists of:

- **Mode** – community vs. enterprise (already encoded as a path segment before deep linking)  
- **Wiki instance** – which wiki the user is exploring (e.g. English Wikipedia, French Wiktionary)  
- **Module** – which REST module is loaded in Scalar  
- **Operation** – which specific endpoint is focused (scroll position within the spec)

All of this state should be expressible in the URL. A shared link should reconstruct the full view for the recipient without requiring them to make any selections.

## The hash is ours to use

One important early decision: the Explorer does not use Scalar's native hash routing. Scalar has its own mechanism for encoding the focused operation in the URL hash, but it has known reliability issues (it can drop the hash during scroll events). The Explorer instead scrolls imperatively via a focus engine that translates an operation identifier to Scalar's internal navigation id at runtime.

This means the URL hash on the Explorer route is **not** claimed by Scalar and is free for the application to own. The operation anchor lives in the hash; everything else lives in the path. The two concerns do not conflict.

### The operation anchor, and the trailing slash that matters

The anchor is a slug of the operation's HTTP method and path: runs of non-alphanumeric characters collapse to a single underscore, and the brackets around the result are trimmed. `GET /v1/page/{title}` becomes `get_v1_page_title`.

There is **one exception, and it is not cosmetic**: a path ending in `/` keeps a single trailing underscore.

```
GET /lists                 →  get_lists
GET /lists/                →  get_lists_
GET /lists/{id}/entries/   →  get_lists_id_entries_
```

That looks like an untidy edge case begging to be cleaned up. Do not clean it up. OpenAPI treats `/lists` and `/lists/` as **different paths**, and `readinglists/v0` genuinely exposes both — as it does both `/lists/{id}/entries` and `/lists/{id}/entries/`. An earlier version of the slugger trimmed the trailing separator, which merged each pair into one anchor: four collisions across the committed specs, so a deep link to `POST /lists/` silently focused `POST /lists` instead.

Note what is *not* preserved: a trailing `}`. A closing brace ends a parameter inside the final path segment, whereas a trailing slash adds an empty segment. Only the second distinguishes two real paths — and keying on it is what let the fix land without changing any anchor that already worked.

Two practical consequences if you touch this code:

- **The slug is not unique by construction.** `{id}` and a literal `id` segment both collapse to `_id_`, so `/lists/{id}/x` and `/lists/id/x` would collide. Nothing exposes that pair today. Anything that *generates* durable URLs must call `findDuplicateOperationAnchors` and fail on a duplicate rather than assume uniqueness — assuming uniqueness is precisely what shipped the original bug.
- **Round-tripping is not uniqueness.** Every one of the 179 committed operations round-tripped correctly *while four pairs were colliding*, because each collided anchor still resolved to *an* operation — just the wrong one. Both properties need their own assertion.

Links shared before the fix still resolve: the resolver tries the current format first, then the legacy one. The legacy builder is read-only and must never be emitted.

## Two kinds of links: verbose and quick

A key design tension is between **shareability** and **authoring convenience**. A fully explicit link is stable and unambiguous – it names the instance directly, so the recipient gets exactly the right wiki. But when writing documentation, creating a link from search results, or linking from a navigation menu, an author often does not want to (or cannot) specify an instance – they just want to link to "the attribution module" and let the system pick a sensible default.

This leads to two link types:

**Verbose links** name the instance explicitly. They are stable, shareable, and fully deterministic – the same link always loads the same instance and module. These are the links that appear in the browser's address bar after the user has made selections, and the links that should be shared, bookmarked, or embedded.

> **Example (illustrative – exact format subject to product decision):**

```
/explorer/direct/enwiki/attribution/v0-beta#get_v1_data_citation
```

> This names English Wikipedia (`enwiki`) explicitly, loads the Attribution module (`attribution/v0-beta`), and focuses the `GET /v1/data/citation` endpoint. Anyone following this link lands in exactly this state regardless of when they follow it.

**Quick links** omit the instance. They express only a module (and optionally an operation), and the system resolves them to a concrete instance using a preference order – typically starting with English Wikipedia and falling back through other high-traffic wikis until one that actually exposes the module is found. Quick links are convenient to author, but the resolved instance is implicit and could change as the fleet evolves.

> **Example (illustrative – exact format subject to product decision):**

```
/explorer/q/attribution/v0-beta
```

> This links to the Attribution module without specifying an instance. The system resolves to the preferred instance that exposes this module (likely `enwiki`), then rewrites the URL to the verbose form above. The author of a documentation page or navigation entry can use this form without knowing or caring which instance is most appropriate.

**The key principle:** quick links should always be resolved and then rewritten to their verbose form in the address bar. A quick link is an *input* shorthand; the address bar always ends up showing the explicit, stable form. This means copying a link from the address bar after following a quick link always produces a stable verbose link, not the original quick link.

## Instance identity

The wiki instance in a verbose link needs a stable, canonical identifier. The natural choice is the Wikimedia **dbname** (e.g. `enwiki`, `frwiktionary`, `wikidatawiki`) – these are the identifiers used throughout Wikimedia infrastructure and in the module source of truth.

One implication: the curated list of instances in the application's configuration must use consistent dbnames. Any identifier that diverges from the canonical dbname creates a mapping problem at URL resolution time.

## Instance resolution for quick links

When resolving a quick link, the system needs to pick a concrete instance that actually exposes the requested module. This is where the module source of truth becomes important.

The module source of truth (generated from Wikimedia's discovery endpoints) knows, for each module, which instances expose it. The resolver applies a preference order over that list – favoring well-known, high-traffic instances over arbitrary technical choices – and picks the first match.

This preference order is **policy**, not hardcoded logic. It should live in a configuration file so it can be adjusted without touching the resolution algorithm. The question of which instance to prefer for a given module is a product decision that may change, and the implementation should reflect that.

## Fleet-wide instance resolution

The Explorer's curated instance list contains a small number of instances for the UI (the project and language picker). But deep links – both quick links resolving to a `specSourceInstance`, and verbose links naming any wiki directly – may reference instances outside this curated set.

Bootstrap must be able to resolve a `baseUrl` for any valid wiki in the fleet, not just the curated ones. The solution is a two-tier lookup: try the curated list first (which carries additional UI policy like display names and direction), then fall back to the generated fleet registry.

When a non-curated instance is loaded via a deep link, the instance picker in the UI cannot represent it natively. The picker should inject a transient option for the current selection so the UI accurately reflects state, without permanently adding that instance to the curated list. This is a display concern, not a data concern.

## Source of truth considerations

The module source of truth and instance registry are the data foundation that makes quick link resolution and fleet-wide loading possible. Getting this data right matters.

A few open questions worth examining as deep linking is implemented:

**Is the per-module metadata complete enough to support the UI?** Quick link resolution needs to know which instances expose a module. But the UI may also need richer information – module descriptions, scope (is this module universal, or Wikidata-only, or Wikipedia-only?), display titles. If the source of truth generation doesn't capture these, they need to come from somewhere else, or the generation step needs to be extended. It is worth auditing what the generated data contains against what the UI actually needs before assuming it is sufficient.

**Is the instance registry complete and accurate?** The fleet registry is generated from discovery endpoints. Most wikis answer discovery, but a small number do not. A link naming an unreachable instance needs to degrade gracefully (see fallback behavior below). The registry should at minimum include the domain, project, language code, and discovery endpoint for each instance – these are the fields needed both for resolution and for displaying sensible information to the user.

**How does a user know what to put in a quick link?** If quick links are intended to be authored by humans (in documentation, navigation config, etc.), there needs to be a way to discover valid module slugs. The module source of truth is the right source for this, but its contents need to be surfaced somewhere accessible to non-engineers.

## Fallback behavior

Deep links are hand-editable and outlive deployments. A module that existed when a link was created may not be available on the requested instance anymore, or an instance may have changed. The system should degrade gracefully in all cases, always landing the user somewhere useful and explaining what happened.

The general principle: never show a blank page or an unrecoverable error state. Fall back progressively – try the requested instance with a different module, then fall back to the default system state. In every case where the URL is adjusted from what the user requested, a notice should be shown explaining what happened. This notice needs to survive the URL rewrite (which may remount the page), so it cannot be stored in component-local state.

Specific cases to handle:

- **Module not available on the requested instance** – load the instance with its default module, drop the operation, show a notice  
- **Instance not in the fleet or unreachable** – load the default system state, show a notice  
- **Operation anchor not found in the loaded spec** – load the module with no operation focused (the focus engine already handles this gracefully)  
- **Quick link successfully resolved** – not an error, but the URL changed; show an informational notice so the user understands why the address bar looks different from what they clicked

## Relationship to endpoint search

Endpoint search depends on deep linking, not the other way around. The search index needs to generate a `deepLink` for each operation at index build time, using the same URL format the Explorer uses for verbose links. If the URL format changes, the search index needs to be regenerated.

The module source of truth contains the per-module OpenAPI specs and instance information needed to build the endpoint search index. The index should be generated as part of the same pipeline that generates the module source of truth, so they cannot drift out of sync.

Search results for API endpoints should render as direct links to the relevant operation in the Explorer. The user experience is: search for "get article content", see an endpoint result, click it, land in the Explorer with that endpoint focused. This is the closure of the loop that makes deep linking valuable beyond just sharing.

## What the URL grammar should express

The specific URL format is a product decision. What matters architecturally is that the grammar satisfies these requirements:

- **Module names must not require percent-encoding.** Module names contain slashes (e.g. `site/v1`, `attribution/v0-beta`). A URL format that puts the module in a query parameter forces `%2F` encoding, which is ugly and fragile. Path segments carry slashes naturally.  
- **Instance and module must be unambiguous to parse.** The parser must be able to tell where the instance ends and the module begins without guessing.  
- **Quick and verbose link forms must be distinguishable.** The parser needs to know whether to resolve an instance or treat it as already explicit.  
- **The operation lives in the hash.** Mode, instance, and module live in the path; the specific operation lives in the hash fragment. This keeps the shareable "where am I" state in the path (which search engines and link previewers use) and the "which operation am I focused on" state in the hash.  
- **Reserved path segments must not collide with real module or instance names.** Any discriminator used to distinguish link types (quick vs. verbose, enterprise mode names) must be validated against actual module slugs and instance dbnames to ensure no collisions.
