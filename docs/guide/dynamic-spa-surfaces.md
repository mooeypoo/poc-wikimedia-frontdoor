# Dynamic SPA surfaces

This document describes the architectural approach to client-side single-page application (SPA) surfaces within the Unified Front Door. It covers what makes a surface a SPA, how SPAs coexist with the predominantly static site, the principles that apply to all SPAs, and the specifics of the two SPA surfaces built so far: the API Explorer and the token management area.

## What is a SPA surface in this system

The Unified Front Door is SSG-first: most pages are pre-rendered at build time as static HTML. SPA surfaces are the deliberate exceptions – interactive areas where runtime behavior, user state, or dynamic data make static pre-rendering either impractical or counterproductive.

A surface is treated as a SPA when it meets one or more of these conditions:

- Its content is resolved at runtime based on user input or session state (the Explorer's spec loading is the primary example)  
- It maintains session or interaction state that must persist across in-page navigation  
- It requires client-side JavaScript to function at all, and degrading gracefully without it is not meaningful

SPA surfaces in this system are implemented as client-only routes (`ssr: false`) within the Nuxt application. They share the same shell – header, navigation, footer – as the static pages, but their main content area is rendered entirely in the browser.

The static shell and the SPA content area are architecturally distinct. Shell chrome (navigation, language picker, authentication state) is managed by the application layer and is available on every page. SPA-specific state – which instance is selected, which module is loaded, whether a user is logged in – is managed within the SPA surface itself and does not leak into the shell or affect other pages.

## Principles that apply to all SPA surfaces

### Locale exemption

SPA routes must never receive locale URL prefixes. The API Explorer is always `/explorer`, never `/fr/explorer`. Token management is always `/account`, never `/ar/account`.

This is not just a routing convenience. SPA surfaces control their own language behavior internally – the Explorer selects language per wiki instance; the token management area inherits the interface locale from the shell. Locale-prefixed URLs for SPAs would imply content that varies by locale in the URL, which is not true, and would create navigational complexity without benefit.

The locale exemption must be implemented in a single shared utility that all link-generating code consults. It should not be left to individual components or templates to decide whether to apply a locale prefix. The list of exempt routes should be a configuration value, not hardcoded logic scattered across the application.

Content managers must be able to add, move, or update links to SPA surfaces – in navigation menus, side menus, and Markdown content – without touching application code. The mechanism for locale exemption should be transparent to content authoring: a link to `/explorer` in a Markdown file or a navigation config entry should simply work, with the routing layer handling the exemption automatically.

### Deep linking

Every meaningful state in a SPA surface should be expressible as a URL. A user should be able to copy a URL from their browser and share it, and the recipient should land in the same state – same mode, same selections, same visible content.

Deep linking is not an afterthought. It is a first-class requirement that shapes how state is managed. If a piece of state is only in memory and cannot survive a direct navigation to a URL, it is not properly deep-linkable.

In practice, deep linking means:

- Mode selection (which variant of a SPA is active) lives in the URL path  
- Significant user selections (instance, module) live in path segments  
- In-page position (which specific endpoint is visible) lives in the URL hash

The URL is the source of truth for SPA state on initial load. On mount, the SPA reads from the URL to reconstruct its state rather than defaulting to a blank initial state.

### Session state and navigation boundaries

SPAs use client-side routing internally. However, transitions between the static content area and a SPA surface require special handling because the two rendering contexts do not share a runtime.

Entering or leaving a SPA route from a static page triggers a full document navigation rather than a client-side route transition. This ensures the SPA mounts cleanly and the static page renders correctly. The cost is a brief reload at the boundary, which is an accepted tradeoff for reliability.

Session state – particularly authentication tokens – cannot survive this boundary in normal Pinia store memory, since a full navigation clears in-memory state. The pattern used to handle this is a deliberate one-shot handoff: state is written to sessionStorage immediately before the navigation and read and cleared by a client plugin on the destination page's first mount. The token is never in sessionStorage beyond that single navigation hop.

## The API Explorer

The Explorer is the primary SPA surface. It loads OpenAPI specs at runtime based on user selections and renders them through Scalar, the OpenAPI explorer component.

### Mode

The Explorer currently has one mode: community. It loads specs dynamically based on wiki instance and REST module selection, using each instance's discovery endpoint (`/w/rest.php/specs/v0/discovery`) to enumerate available modules per instance.

Mode is derived from the URL path. There is no separate mode state that can diverge from the URL. The side navigation links directly to the mode path; switching mode is a navigation, not a state mutation.

If additional modes are introduced in the future, each should follow the same pattern: a new path segment under `/explorer`, a configuration entry that maps the segment to a mode identifier, and a route utility that derives mode from path. Mode-specific UI is conditionally rendered based on the active mode.

### Deep linking in the Explorer

Deep linking in the Explorer encodes the full view state – wiki instance, module, and focused endpoint – into the URL, so any state the user reaches can be shared, bookmarked, or linked from search results. The URL hash is owned by the application, not by Scalar, since Scalar's native hash routing has known reliability issues.

Two link forms are supported: a verbose form that names the instance explicitly (stable and shareable) and a quick form that omits the instance and lets the system resolve a sensible default. Quick links are always rewritten to their verbose form in the address bar, so copying a URL always produces a stable link.

The exact URL grammar is a product decision that was still being finalized at the time of the prototype. The full treatment – including the verbose/quick distinction, instance resolution, fallback behavior, and the relationship to endpoint search – is documented in [explorer-deep-linking.md](explorer-deep-linking.md).

### Spec loading and the discovery model

Community mode specs are never hardcoded. The available modules and their spec URLs for any given wiki instance are always read from that instance's discovery endpoint at runtime. This means:

- Adding a new module to a wiki automatically makes it available in the Explorer without any application change  
- Spec URL changes upstream are reflected immediately  
- The Explorer's view of any instance is always current, not a snapshot from build time

The discovery endpoint is the single source of truth for what is available. The application never constructs spec URLs from parts or makes assumptions about module names.

## OAuth and token management

OAuth authentication in the portal serves two purposes: establishing user identity in the shell (the logged-in username and login/logout controls) and powering the token management SPA.

### Explorer sandbox: considered and set aside

During the prototype we explored integrating OAuth with the Explorer's "Try it out" sandbox, so that authenticated requests could be made directly from the documentation. We decided not to implement this for now. The MediaWiki REST specs do not currently declare a bearer security scheme, which makes token injection inert, and the cookie-based schemes Scalar surfaces in its authentication panel cannot function cross-origin from the portal's domain. Surfacing broken authentication affordances would be more confusing than helpful.

This is worth revisiting if bearer schemes are added to upstream MediaWiki REST specs. When that happens, the token management SPA is the natural place to develop it, rather than as a standalone Explorer change.

### The OAuth flow

Authentication uses OAuth 2.0 Authorization Code with PKCE, against `meta.wikimedia.org` as the identity provider. A Meta-issued token is recognized across SUL-linked wikis, making it suitable for a portal covering multiple instances.

The PKCE code verifier is generated and consumed server-side, never exposed to the browser. The access token lives only in memory (a Pinia store) and does not survive a page reload – an accepted limitation for the current implementation.

### The token management SPA

Token management is a planned SPA that will replace the current Metawiki experience – a lengthy, complex intake form – with a cleaner interface where logged-in users can view and manage their existing OAuth tokens and request new ones, all within the portal. It will live at `/account` with `ssr: false`, following the same SPA architectural patterns as the Explorer.

A few things to keep in mind for when this is built:

- Unauthenticated visits show a logged-out gate with a login prompt, not an error page.  
- It will consume the Wikimedia OAuth Management API. The available endpoints were not fully documented at prototype time and should be investigated before implementation begins.  
- Expanded OAuth scopes beyond `basic` will likely be needed, which requires re-submitting the OAuth consumer registration for approval.  
- The route is always `/account`, never locale-prefixed, following the SPA locale exemption rule.

### A note on Scalar's authentication panel

Scalar renders an authentication panel from the security schemes declared in the loaded spec. For MediaWiki REST specs these are currently cookie-based schemes that cannot work cross-origin, so the panel is hidden by default via a CSS override. The selector used targets a class that Scalar does not treat as a public API – after any `@scalar/api-reference` upgrade, verify the panel is still hidden and update the selector if needed.  