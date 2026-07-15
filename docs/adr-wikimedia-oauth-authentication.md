# ADR: Wikimedia OAuth 2.0 authentication

**Status:** Partially implemented — session + top-bar identity shipped; Scalar integration reverted for the MVP
**Scope:** User login via Wikimedia OAuth 2.0, session persistence across the shell and the Explorer, and forward-looking placement for a future standalone token-management SPA

---

## 0. MVP decision: OAuth does not integrate with Scalar

> **Decision (2026-07, supersedes §5.5–§5.9 below):** We tried wiring the OAuth
> session into Scalar's "Try it out" (bearer-token injection, an in-Explorer
> "logged in" badge, a per-session credential toggle, and a reveal toggle for
> Scalar's built-in Authentication panel) and learned it added UI surface and
> coupling without delivering usable authenticated requests — the MediaWiki
> REST specs still declare no bearer scheme (§5.5, §9.3), so injection is inert,
> and the cookie-based schemes Scalar surfaces cannot work cross-origin (§5.9).
>
> **For the MVP, OAuth's entire role is:**
> 1. Establish the session (PKCE handshake, token exchange, in-memory Pinia
>    store — Phase B, all shipped and retained).
> 2. Show the logged-in username (and Log in / Log out) in the shell top bar.
>
> Nothing else listens to or is affected by the OAuth session. Specifically,
> the following described in §5.5–§5.9 are **removed / not implemented**:
> `useScalarConfig` no longer builds an `authentication` block; there is no
> `useTryItOutWithOAuth` toggle; there is no in-Explorer login badge or
> expired-session prompt; and there is no `useAdvancedAuthPanel` reveal toggle
> or dialog. Scalar's built-in Authentication panel stays hidden
> unconditionally via CSS (§5.9), because the cross-origin-cookie rationale is
> independent of OAuth.
>
> When a bearer scheme does land upstream, re-integrating injection should be
> its own scoped change — most likely folded into the future token-management
> SPA (§11), which is now the only planned surface that consumes OAuth beyond
> session identity.

---

## 1. Problem statement

The Front Door's API Explorer renders OpenAPI specs through Scalar and supports a "Try it out" affordance.  Out of the box, "Try it out" hits the public MediaWiki REST endpoints anonymously — useful for read endpoints, useless for anything that requires authentication, and indistinguishable from an unauthenticated curl call.

To make the Explorer a credible development surface for the Wikimedia cluster, the user must be able to:

- Log in once with their SUL (Single User Login) Wikimedia account.
- Stay logged in as they move between content pages and the Explorer (Explorer is `ssr: false`, content pages are pre-rendered — they don't share a runtime, but they do share the same origin and cookies).
- Have the Explorer's "Try it out" requests carry their bearer token so the responses they see reflect what their account can actually do.
- See a clear indicator inside the Explorer that the request will go out authenticated.
- (Future, deferred) Visit a dedicated page where they can list and create OAuth consumers via the Wikimedia OAuth API.

ARCHITECTURE.md already reserved this slot:

- Line 35: "Wikimedia OAuth 2.0 + PKCE ← session state in Pinia" inside the API Explorer client SPA block.
- Line 96: `stores/oauthSession.js` listed in the directory tree.
- Line 156: `useOAuthSession()` composable named in the composables table — "Token state, auth initiation, token display data; wraps the Pinia oauthSession store".

No code has been written yet for any of these.  DESIGN_REQUIREMENTS.md line 32 explicitly notes that the header's login control is a non-functional placeholder.  This ADR fills that slot.

---

## 2. Scope of this ADR

This ADR does the following:

- Documents the OAuth 2.0 + PKCE flow we will implement and where each step runs.
- Specifies the OAuth consumer registration shape and the callback URL to put in the Meta-wiki form.
- Documents the in-browser-memory token model (no server-side token persistence) and how Scalar receives the token.
- Surfaces every ambiguity raised in planning and records the decision taken for the prototype.
- Lists prerequisites that must happen outside code (consumer approval, env vars, hostname).
- Provides a phased implementation plan.

This ADR does **not**:

- Submit the consumer registration form (manual step, see §9).
- Authorize implementation work to begin — Phase A prerequisites must complete first.
- Design the future standalone token-management SPA.  Section §11 records the deferred intent only.

---

## 3. The OAuth provider

**Authorize endpoint:** `https://meta.wikimedia.org/w/rest.php/oauth2/authorize`
**Token endpoint:** `https://meta.wikimedia.org/w/rest.php/oauth2/access_token`
**Profile endpoint:** `https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile`
**Consumer registration:** `https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2`

Wikimedia OAuth 2.0 is the SUL-aware identity provider for the cluster.  A consumer registered on Meta issues tokens that are recognised across SUL-linked wikis (en.wikipedia.org, es.wikipedia.org, …).  Whether a Meta-issued bearer is honoured by every wiki's REST surface in practice is verified in §8.5 below — for the prototype we assume yes.

---

## 4. Current state of every touched system

### 4.1 Header / shell login control

The login control exists in [app/layouts/default.vue](/home/moriel/code/wikimedia/frontdoor/app/layouts/default.vue) but is a non-functional placeholder (DESIGN_REQUIREMENTS.md §32).  No click handler, no state binding.  This ADR replaces it with a real button bound to the OAuth session composable.

### 4.2 No auth routes exist

[server/api/](/home/moriel/code/wikimedia/frontdoor/server/api/) currently contains only [discovery.get.ts](/home/moriel/code/wikimedia/frontdoor/server/api/discovery.get.ts) (a same-origin Wikimedia discovery proxy) and `explorer-bootstrap.get.ts`.  There is no `/api/auth/*` namespace yet.  The discovery file is the pattern to mirror for the single OAuth proxy route we will add: same `defineEventHandler`, same external-URL constant in-file, same `createError` shape on upstream failure.

### 4.3 No Pinia store yet

ARCHITECTURE.md names `stores/oauthSession.js` (line 96) and `useOAuthSession()` (line 156), but neither file exists yet.  Both are created by this ADR.  The composable wraps the store so components never import Pinia directly — this matches the established three-layer separation (engine / composable / UI) documented in §3 of ARCHITECTURE.md.

### 4.4 Scalar configuration has no authentication

[app/composables/useScalarConfig.ts](/home/moriel/code/wikimedia/frontdoor/app/composables/useScalarConfig.ts) builds the Scalar configuration object passed to `<ApiReference :configuration="…" />` in [ExplorerScalarReference.client.vue](/home/moriel/code/wikimedia/frontdoor/app/components/explorer/ExplorerScalarReference.client.vue).  The current object carries `slug`, `layout`, `theme`, `hideDownloadButton`, `showDeveloperTools`, and the spec URL.  It carries no `authentication`, `preferredSecurityScheme`, `securitySchemes`, or request-interceptor configuration.  This ADR adds an `authentication` block when the user is logged in, sourced reactively from the Pinia store.

### 4.5 `nuxt.config.ts` has no `runtimeConfig`

[nuxt.config.ts](/home/moriel/code/wikimedia/frontdoor/nuxt.config.ts) currently does not declare a `runtimeConfig` block.  We add one in Phase B to surface the OAuth `clientId`, the session cookie's encryption secret, and the OAuth endpoint URLs.  `clientId` is `public:` since a public PKCE client makes it inherently non-secret; the cookie encryption secret is server-only.

### 4.6 No Pinia stores directory yet

The project uses `@pinia/nuxt` (package.json) but no `stores/` directory has been created.  This ADR creates it.  Composables in `app/composables/` are the documented consumer pattern — components never import stores directly.

---

## 5. Proposed architecture

### 5.1 Flow at a glance

The three actors are the **Browser** (Vue page + Pinia store), **Nitro** (two server routes — `login` and `exchange`), and **Meta** (`meta.wikimedia.org`'s OAuth 2.0 endpoints).

| # | Actor | Action |
|---|---|---|
| 1 | Browser | User clicks "Log in" in the shell header. |
| 2 | Browser → Nitro | `GET /api/auth/oauth/login?returnTo=…` |
| 3 | Nitro | Generates `code_verifier` (32 random bytes), derives `code_challenge` (S256), generates `state` (random). |
| 4 | Nitro | Writes `{ verifier, state, returnTo }` to the `h3.useSession` HttpOnly encrypted cookie. |
| 5 | Nitro → Browser | `302` to Meta's authorize endpoint with `client_id`, `response_type=code`, `code_challenge`, `code_challenge_method=S256`, `state`, `scope=basic`, `redirect_uri`. |
| 6 | Browser ↔ Meta | Browser follows the redirect; user logs in on Meta and consents to the consumer. |
| 7 | Meta → Browser | `302` to `https://wikifrodo.netlify.app/oauth/callback?code=…&state=…` |
| 8 | Browser | `/oauth/callback` Vue page mounts and reads `code` + `state` from the URL. |
| 9 | Browser → Nitro | `POST /api/auth/oauth/exchange { code, state }` (the HttpOnly session cookie is auto-attached by the browser). |
| 10 | Nitro | Reads `{ verifier, state, returnTo }` from the session cookie; checks that the body `state` matches the cookie `state`. |
| 11 | Nitro → Meta | `POST …/oauth2/access_token` with `grant_type=authorization_code`, `code`, `code_verifier`, `client_id`, `redirect_uri`. |
| 12 | Meta → Nitro | `{ access_token, expires_in, … }` |
| 13 | Nitro → Meta | `GET …/oauth2/resource/profile` with `Authorization: Bearer …` |
| 14 | Meta → Nitro | `{ username, … }` |
| 15 | Nitro → Browser | `{ accessToken, username, expiresAt, returnTo }` + `Set-Cookie` clearing the PKCE session cookie. |
| 16 | Browser | Hydrates the Pinia `oauthSession` store with `{ username, accessToken, expiresAt }`. |
| 17 | Browser | `router.replace(returnTo)`. |

The exchange route (steps 9–15) is the **only** server-side processing in the whole flow.  It exists because Meta's token endpoint does not advertise CORS for browser callers (same constraint that forced `server/api/discovery.get.ts` to exist).  The route is stateless beyond the transient session cookie: it reads PKCE state from the cookie, forwards to Meta, fetches the profile, returns the result, and clears the cookie in the same response.  It does not persist the access token anywhere on the server.

The `code_verifier` never leaves the server: the browser only ever sees `code` and `state`.  This keeps the PKCE secret out of JS even briefly.

### 5.2 Why a public PKCE client (not confidential)

The user directive is to avoid server-side state as much as possible (resolves §8.3).  A confidential client requires a `client_secret` that lives only on the server and is sent in every token exchange — that's fine ergonomically but it means the server must know how to use the token long-term to be worth keeping.  Since we're keeping tokens in browser memory anyway (resolves §8.4 — Option B), a confidential client buys us nothing here.  Public + PKCE is the standard pattern for SPA OAuth and is what the Wikimedia OAuth 2.0 form supports under "Public" client type.

### 5.3 PKCE handshake state — h3.useSession encrypted cookie

The `code_verifier` and `state` parameters cannot live in JS memory between the authorize redirect and the callback — the browser navigates away.  Choices were:

- **`sessionStorage`** — survives the redirect (same origin), zero server involvement.  But XSS-readable and gives the verifier no integrity protection from itself.
- **`h3.useSession` encrypted cookie** — server signs and encrypts a small cookie that holds the handshake state.  No server-side storage, the data lives in the cookie itself.  Cookie clears on success.

We use the second.  This is consistent with the user's "avoid server-side as much as possible" directive *and* the user's "use h3.useSession" directive: h3.useSession is not server-side storage — it's a stateless encrypted cookie validated by a server key, which is the lightest possible server footprint that still keeps the verifier away from arbitrary JS.

The cookie is set with `HttpOnly; Secure; SameSite=Lax`, `Path=/`, and a short max-age (5 minutes — the authorize round trip should be well under that).  After successful exchange the session is cleared via `clearSession`.

### 5.4 Access token storage — in-memory Pinia, never localStorage

The access token returned from the exchange lives only in the `oauthSession` Pinia store.  It is **never** written to `localStorage`, and it is written to `sessionStorage` only for the duration of a single navigation as a handoff mechanism (see §10 Step B4).  This means:

- A page reload loses the in-memory token.  On mount, the store has no token; the UI shows "logged out" until the user clicks login again.  For the prototype this is acceptable (resolves §8.6).  The sessionStorage handoff key is cleared on first read, so it never survives a subsequent reload.
- An XSS payload that can reach the Pinia store can exfiltrate the token.  Mitigation: keep the Front Door's XSS surface small, request only the `basic` scope, accept short-lived tokens.
- We do not surface the token to any third-party domain.  Scalar consumes it via the `authentication` configuration prop — it stays in the same JS realm.

### 5.5 Scalar integration

> **Superseded by §0 (MVP):** not implemented. `useScalarConfig` builds no
> `authentication` block; the design below is retained as the record of what a
> future re-integration would look like once a bearer scheme lands upstream.

`@scalar/api-reference` supports a configuration block of the shape:

```ts
configuration = {
  // …existing fields…
  authentication: {
    preferredSecurityScheme: 'bearerAuth',
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', token: '<access_token>' }
    }
  }
}
```

The exact key names depend on what the OpenAPI spec declares for its security scheme.  The MediaWiki REST specs use `bearerAuth` (`type: http`, `scheme: bearer`); the Enterprise spec already documents the same (see [adr-enterprise-explorer-integration.md §8.6](/home/moriel/code/wikimedia/frontdoor/docs/adr-enterprise-explorer-integration.md)).  Verifying that every wiki's discovery-supplied spec declares the same scheme name is a Phase C check.

[useScalarConfig.ts](/home/moriel/code/wikimedia/frontdoor/app/composables/useScalarConfig.ts) becomes session-aware: it reads `useOAuthSession()` reactively, and when the token is present it emits the `authentication` block alongside the existing fields.  Scalar's documented `Object.assign` update pattern still applies — the existing reactive update mechanism is unchanged.

Scalar renders its own visible "Authentication" panel from `components.securitySchemes` in the document.  MediaWiki module specs currently declare only cookie-based `CentralAuthSessionProvider-*` schemes there, which are unusable cross-origin from Front Door (browsers strip the `Cookie` header from cross-origin `fetch` and refuse to set third-party cookies).  Surfacing those in the UI is misleading and encourages a broken auth path, so Front Door hides that panel by default via a CSS override and gates any reveal behind a Codex dialog — see §5.9.  Auth injection into requests happens via our `authentication` configuration regardless of panel visibility.

### 5.6 Toggle: use OAuth credentials in Try it out

> **Superseded by §0 (MVP):** removed. The `useTryItOutWithOAuth` composable and
> its `CdxToggleSwitch` were deleted; there is no per-session credential toggle.

The user asked whether it's possible to let a reader turn OAuth-credential injection on/off, rather than it being all-or-nothing once logged in.

**Feasibility confirmed by inspecting the installed `@scalar/types` v1.46.4 declarations directly** (`node_modules/@scalar/types/dist/api-reference/authentication-configuration.d.ts` — same audit approach as [adr-enterprise-explorer-integration.md §7.1](/home/moriel/code/wikimedia/frontdoor/docs/adr-enterprise-explorer-integration.md)):

```ts
export type AuthenticationConfiguration = {
  preferredSecurityScheme?: string | (string | string[])[] | null
  securitySchemes?: Record<string, PartialDeep<SecurityScheme>>
  createAnySecurityScheme?: boolean
}
```

`preferredSecurityScheme` explicitly types `| null`, and `securitySchemes` entries are `PartialDeep` (every field optional).  Both are ordinary reactive config values with no special lifecycle — they can be added and cleared the same way `useScalarConfig.ts` already mutates `spec.url` (§5.5), via `Object.assign` on the same reactive object.  No remount of `<ApiReference>` is required to flip the toggle.

Scalar separately ships its own per-operation auth selector (`Auth.vue`, backed by `get-default-security.ts`) where a reader can already pick "no security" for a single request.  That control is spec-scoped and has no notion of our OAuth session — it's a manual, per-request override, not a persistent "use my Wikimedia login or not" switch.  It doesn't satisfy the ask; the toggle below is orthogonal to it, and a reader can still use Scalar's own selector on top of whatever this toggle sets.

**Design:**
- A `useTryItOutWithOAuth` boolean, exposed as a plain composable-level `ref` (not Pinia) — it's ephemeral UI state, not session identity, so it doesn't belong in `stores/oauthSession.js`.  Defaults to `true` whenever `isLoggedIn` becomes `true`; meaningless (and hidden) while logged out.  Like the access token itself (§8.6), it resets to its default on a full reload — no persistence needed since the token it's gating is also in-memory-only.
- `useScalarConfig.ts` (§5.5, Step C1) reads both `accessToken` and this ref. When logged in **and** the toggle is on, it emits the `authentication` block from §5.5. Otherwise it emits `authentication: { preferredSecurityScheme: null, securitySchemes: {} }` — explicitly clearing the forced scheme/token (`Object.assign` merges keys, it doesn't delete them, so the "off" state must be written, not omitted).
- UI: a Codex `CdxToggleSwitch` next to the "logged in" badge (§5.7), labelled via banana-i18n (`explorer-auth-toggle-use-session` — `Use my Wikimedia login for Try it out`). Rendered only while logged in.

### 5.7 "You are logged in" indicator inside the Explorer

> **Superseded by §0 (MVP):** removed. There is no in-Explorer login badge or
> credential row; login state is shown only in the shell top bar (§5.8). The
> `ExplorerScalarReference.client.vue` wrapper no longer reads the OAuth session.

[ExplorerScalarReference.client.vue](/home/moriel/code/wikimedia/frontdoor/app/components/explorer/ExplorerScalarReference.client.vue) gains a small inline badge above the Scalar shell, rendered only when the OAuth session is logged in:

> 🔓 Logged in as **Mooeypoo**. Try-it-out requests will be sent with your bearer token.

The badge uses Codex components for consistency with the rest of the shell.  It is `aria-live="polite"` so screen readers announce when the badge appears/disappears as login state changes.  Wording goes through banana-i18n like every other interface string.  The toggle switch from §5.6 sits alongside it, in the same badge row.

### 5.8 Where the session is mounted

The `useOAuthSession` composable is called from [app/layouts/default.vue](/home/moriel/code/wikimedia/frontdoor/app/layouts/default.vue) so the Pinia store hydrates on every page (content pages and Explorer alike), and the header's "Log in" / "Log out as <user>" control reads from it.  Because the access token is in-memory only (§5.4), the store's initial state on every navigation that crosses the SSR / client-only boundary is "logged out" until the user logs in again — see §8.6.

### 5.9 Scalar's Authentication panel — hidden unconditionally

> **Amended by §0 (MVP):** the panel is still hidden, but *unconditionally* —
> the `useAdvancedAuthPanel` composable, the reveal `CdxToggleSwitch`, and the
> acknowledgement dialog were all removed. The cross-origin-cookie rationale
> below stands on its own (it is not an OAuth concern), so the CSS override now
> hides `.scalar-reference-intro-auth` with no toggle to reveal it. The
> paragraphs about the reveal path, the dialog, and the acknowledgement flag no
> longer describe shipped behaviour.

Front Door surfaces exactly one primary auth mechanism to end users — the OAuth toggle from §5.6.  Scalar's built-in Authentication panel, which lists every scheme declared in the current spec's `components.securitySchemes`, is **hidden by default** via a CSS override in [app/assets/css/explorer-codex-overrides.css](/home/moriel/code/wikimedia/frontdoor/app/assets/css/explorer-codex-overrides.css).

The rationale is functional, not just cosmetic:

- Every module spec today declares three cookie-based schemes (`CentralAuthSessionProvider-Session`, `-UserID`, `-Token`) that a browser at `wikifrodo.netlify.app` **cannot** exercise against `en.wikipedia.org` — cookies are same-origin, and `Cookie` is a forbidden header on cross-origin `fetch` calls.
- Once upstream adds a bearer scheme (§5.5, awaited), our config-based injection covers authenticated requests without the user needing to touch Scalar's panel at all.
- Advanced users can still reach the panel for inspection or manual override, so the affordance is preserved — behind a small friction hurdle.

The reveal path uses a new composable, [useAdvancedAuthPanel.ts](/home/moriel/code/wikimedia/frontdoor/app/composables/useAdvancedAuthPanel.ts), and a Codex `CdxDialog`:

- The badge/toggle row above the Scalar shell carries a second `CdxToggleSwitch` labelled `explorer-auth-panel-toggle-label` ("Show authentication panel (advanced)").  Unlike the OAuth toggle, this control is visible regardless of login state — the panel exists for inspection, not just for authenticated use.
- Turning the toggle on for the first time opens a `CdxDialog` with i18n keys `explorer-auth-panel-dialog-title`, `explorer-auth-panel-dialog-body`, `explorer-auth-panel-dialog-cancel` ("Keep hidden"), `explorer-auth-panel-dialog-confirm` ("Show panel").  A `CdxCheckbox` labelled `explorer-auth-panel-dialog-dont-show-again` lets the user suppress future dialogs for the browser.
- Confirming the dialog reveals the panel (CSS class flips off the wrapper) and, if the checkbox was ticked, writes `explorer-auth-panel-acknowledged=true` to `localStorage`.  Subsequent enables read that flag and reveal directly without prompting.
- Turning the toggle off never prompts — reducing exposure needs no acknowledgement.
- Panel visibility itself is **not** persisted; it defaults to hidden on every fresh session.  This mirrors the §8.6 precedent (safer defaults each fresh boot; explicit opt-in each time).  Only the acknowledgement flag persists.
- On reveal, the component scrolls the auth section into view so keyboard and pointer users notice the change.

The CSS selector targets `.scalar-reference-intro-auth` — a stable, semantic class Scalar's `Content.vue` assigns directly on the auth section's wrapper.  This is a UI-surface override, not an internal contract: any Scalar version bump can silently rename or remove that class, causing the panel to reappear.  Mitigation is documented in §12.

---

## 6. Consumer registration shape

This is what to fill in on `https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2`.

### 6.1 Callback URL

**Prototype:** `https://wikifrodo.netlify.app/oauth/callback`

The path `/oauth/callback` is a **client-side Vue page** (not a Nitro server route).  The page reads the `code` and `state` query params, recovers the PKCE handshake state from the h3 session cookie, and calls `POST /api/auth/oauth/exchange` to complete the flow.  Putting the callback on a page rather than a server route lets the rest of the OAuth dance (state validation, transition into the Pinia store, redirect back to `returnTo`) run as ordinary client code.

### 6.2 The single-consumer compromise for the prototype

OAuth best practice — and what production should adopt — is **two separate consumers**: one for production with `https://wikifrodo.netlify.app/oauth/callback` as the redirect URI, one for development with `http://localhost:3000/oauth/callback`.  Separate client IDs make it impossible for a dev-machine compromise to forge tokens that look like production tokens, and they let dev be approved/revoked independently.

For this prototype we use **one consumer** and rely on Meta's form to allow either:
- Multiple redirect URIs on a single consumer (newline-separated in the form), or
- The "callback URL prefix" checkbox if the form still offers it for OAuth 2.0.

If neither mechanism is available, the prototype uses the prod URL on the single consumer and developers must run the dev server behind a tunnel (or test only on production-deployed previews).  Production hardening (`adr-followup`) must split this into two consumers before this ADR can be considered "complete".

### 6.3 Other form fields

| Field | Value | Reason |
|---|---|---|
| Application name | `Wikimedia Front Door (prototype)` | Marks it visibly as not-yet-production for anyone looking at their grants list. |
| Application description | One sentence pointing at this repo / ADR. | So an admin reviewing the request has the context to approve it. |
| OAuth protocol version | **OAuth 2.0** | The whole flow above assumes 2.0 + PKCE. |
| Client type | **Public (non-confidential)** | See §5.2. |
| Wiki | **All wikis** | The Explorer targets multiple instances; the spec it loads varies. |
| Grants / scopes | **`basic` only** | Resolves §8.7 — minimal exposure for the prototype.  See §8.7 for what to add later. |

### 6.4 Approval expectation

OAuth 2.0 consumer approvals on Meta historically take **days** of human review.  Phase A is gated on approval — there is no useful coding work that can start before the `client_id` is in hand.  Submit the form early.

---

## 7. Level of effort

### 7.1 Phase A: Prerequisites — no code (manual)

| Task | Effort |
|---|---|
| Submit OAuth consumer registration form on Meta | 15 min |
| Wait for admin approval | Days (out of our hands) |
| Add `clientId` + cookie secret to local `.env`; document in README | 15 min |

### 7.2 Phase B: PKCE flow end-to-end — login button works

| Task | Effort | File(s) |
|---|---|---|
| Add `runtimeConfig` block to `nuxt.config.ts` | XS | `nuxt.config.ts` |
| `server/api/auth/oauth/login.get.ts` — generate verifier+state, write h3 session, 302 to authorize URL | S | New |
| `pages/oauth/callback.vue` — read query, validate state, call exchange, hydrate store, redirect | M | New |
| `server/api/auth/oauth/exchange.post.ts` — code+verifier → access_token + profile | M | New |
| `stores/oauthSession.js` — Pinia store: `{ username, accessToken, expiresAt }` | S | New |
| `app/composables/useOAuthSession.ts` — wraps the store; exposes `login()`, `logout()`, `isLoggedIn` | S | New |
| Wire the placeholder login control in `app/layouts/default.vue` | S | Existing |
| i18n keys for "Log in" / "Log out" / "Logged in as $1" in every locale | XS | `i18n/*.json` |

**Subtotal: ~1–2 days.**

### 7.3 Phase C: Scalar uses the token; Explorer shows the badge

| Task | Effort | File(s) |
|---|---|---|
| Extend `useScalarConfig.ts` to emit `authentication` block when token present | S | Existing |
| Verify the security-scheme name in MediaWiki REST specs (`bearerAuth` assumed) | S | (audit task) |
| Add the "Logged in as <user>" badge to `ExplorerScalarReference.client.vue` | S | Existing |
| Add the "use my login for Try it out" toggle switch + wire it into `useScalarConfig.ts` (§5.6) | S | Existing |
| Smoke-test an authenticated try-it-out against one wiki, with the toggle both on and off | S | manual |

**Subtotal: ~1–1.5 days.**

### 7.4 Phase D: Refresh, logout, expiry UX

| Task | Effort | File(s) |
|---|---|---|
| Logout endpoint / store action (clears in-memory token, no server call needed) | XS | `useOAuthSession` |
| Refresh: optional in prototype — without a refresh token round trip, expired tokens just force re-login | S | — |
| Friendly handling for 401 from a try-it-out (toast + "log in again") | S | `ExplorerScalarReference.client.vue` |

**Subtotal: ~0.5–1 day.**

### 7.5 Total range

| Scenario | Estimated effort |
|---|---|
| Phase B only (login works, no Scalar integration) | ~2 days |
| Phase B + C (login works, Scalar sends bearer in try-it-out) | ~3 days |
| Phase B + C + D | ~4 days |
| + production hardening (split consumers, refresh token flow, etc.) | not estimated here |

---

## 8. Ambiguities and decisions

### 8.1 Resolved: production hostname is `wikifrodo.netlify.app`

The Netlify deployment hostname is fixed and the consumer registration uses `https://wikifrodo.netlify.app/oauth/callback`.

### 8.2 Resolved: one consumer for the prototype, two for production

This is a prototype — a single OAuth consumer is acceptable and we register one consumer that handles both development and production callback URLs (via multiple redirect URIs or the prefix-checkbox mechanism, depending on what Meta's form supports today).

**Documented for future hardening:** before this is considered production-ready, the consumer should be split into two — one for production (`https://wikifrodo.netlify.app/oauth/callback`) and one for local development (`http://localhost:3000/oauth/callback`).  This is OAuth best practice (blast-radius isolation) and is not done in the prototype only because of the manual approval overhead per consumer.

### 8.3 Resolved: minimise server-side surface

Server-side state is kept to the bare minimum the browser cannot do itself:

- **One** server route for token exchange (CORS forces this).
- **One** encrypted cookie via `h3.useSession` for the PKCE handshake (transient — cleared after callback).
- **No** server-side storage of access tokens.  Tokens live in the Pinia store in browser memory only.

### 8.4 Resolved: Option B — token in browser memory, injected into Scalar via `authentication` config

The two candidates were:
- **Option B:** Pass the access token to the browser; Scalar's own fetch sends `Authorization: Bearer …` directly from the browser.
- **Option C:** Proxy every "Try it out" request through a server route that attaches the token from a server session.

Option B is chosen.  It accepts that the token is XSS-exposed and short-lived, in exchange for letting Scalar's UI (Authentication panel, badge state) work natively and for keeping the server footprint to a single route.

If XSS exposure becomes unacceptable later, the migration path is to swap Option B for Option C without touching the OAuth handshake itself — only `useScalarConfig.ts` and the addition of one new generic-proxy server route would change.

### 8.5 Deferred verification: does a Meta-issued bearer work on every wiki's REST API?

A Meta-issued OAuth 2.0 bearer is *expected* to work against every SUL-linked wiki's REST API.  We did not write a verification script for this — the assumption is that SUL/CentralAuth makes it transparent.

**If it does not** (e.g. enterprise endpoints or specific wikis reject the Meta bearer): the path forward is either (a) register one consumer per wiki the Explorer targets, or (b) route the calls through a server-side proxy that re-attaches the right credential per destination wiki.  Both are larger work than this ADR contemplates and would warrant a follow-up ADR.

**To verify (later, if needed):** small standalone script that takes a Meta-issued bearer and hits `/v1/page/` (or any read endpoint requiring auth) against each entry in [config/instances.ts](/home/moriel/code/wikimedia/frontdoor/config/instances.ts).  Add to `scripts/` if we hit issues.

### 8.6 Resolved: in-memory token, no rehydration on reload

A reload drops the access token; the user re-logs-in.  This is acceptable for the prototype.

The single-navigation `sessionStorage` handoff described in §5.4 and §10 Step B4 does not weaken this invariant: the handoff key is read-and-cleared by a client plugin on the destination page before its first render, so any subsequent reload finds no key and boots into the logged-out state.

**Documented for future improvement:** storing a refresh token (HttpOnly, encrypted) in the session cookie and refreshing transparently on mount would let the session survive reloads without exposing the access token to JS storage.  Not implemented in this iteration because it expands server-side surface and contradicts §8.3's directive.

### 8.7 Resolved: `basic` scope only — flag what else might be needed

The consumer is registered with the `basic` scope only.  This is enough to identify the user and to make authenticated read requests on their behalf where the endpoint accepts a bearer.

**Likely future expansions (when a specific feature demands them):**

| Capability the Explorer might need | Wikimedia grant to add |
|---|---|
| Edit pages from try-it-out | `editpage`, `editprotected` |
| Create/move pages | `createeditmovepage` |
| Upload media | `uploadfile`, `uploadeditmovefile` |
| Patrol / rollback | `patrol`, `rollback` |
| Read user options / preferences | `viewmyprivateinfo` |
| Manage tokens (for the future SPA — §11) | `oauthadmin` (if exposed via OAuth 2.0) |

Adding any of these is **not** a code change in this repo — it is a consumer-registration change on Meta, which requires re-approval.  This is by design; expanding the consumer's capabilities should be a deliberate, reviewed event.

### 8.8 Resolved: session library choice is `h3.useSession`

The session-cookie work could be done three ways:

| Approach | Pros | Cons |
|---|---|---|
| **`h3.useSession`** (chosen) | Already in Nitro — no new dependency.  Standard API, well-documented.  Encrypted-cookie model fits §8.3. | Less batteries-included than `nuxt-auth-utils` — we wire `setUserSession` / `getUserSession` ourselves. |
| `nuxt-auth-utils` | Helpers for the exact "user session" pattern; useful primitives. | Extra dependency; some opinionated hooks we'd not use. |
| Hand-rolled crypto | Total control. | Cryptographic primitives are easy to misuse; no upside over `h3.useSession` here. |

We choose `h3.useSession`.  The other two are documented so a future maintainer who hits its limits can see why they were rejected and what the alternatives are.

### 8.9 Resolved: hide Scalar's built-in Authentication panel by default

Scalar renders every scheme declared in the current spec's `components.securitySchemes` in an "Authentication" panel inside its reference view.  For MediaWiki module specs today, that means three cookie-based `CentralAuthSessionProvider-*` schemes that are functionally inert from Front Door's origin (browsers strip `Cookie` from cross-origin `fetch` and refuse to set third-party cookies).  Surfacing them prominently teaches users a broken auth path and confuses the mental model — the OAuth toggle is the only mechanism that actually works from this origin.

**Decision:** hide the panel by default via a CSS override (see §5.9 and the `.scalar-reference-intro-auth` selector).  Keep it reachable for advanced users via the "Show authentication panel (advanced)" toggle plus a Codex confirmation dialog on first reveal.

**Alternatives considered:**

| Alternative | Why rejected |
|---|---|
| Leave the panel visible and add an explanation `CdxMessage` above it | Users still read the misleading CentralAuth entries as the primary auth affordance.  Less opinionated but louder in the wrong direction. |
| Prefill CentralAuth values from the OAuth session | Technically wrong (values aren't equivalent) and functionally useless (browsers ignore the `Cookie` header cross-origin anyway).  Would teach a broken mental model. |
| Set `preferredSecurityScheme: 'bearerAuth'` and rely on Scalar defaulting to bearer | Requires upstream to declare bearer first, and still lets confused users click into CentralAuth.  Will be combined with the hide once upstream lands. |
| Post-render CSS/DOM hacks driven from JS | Bought no benefit over a pure-CSS class flip and added moving parts. |
| Ask upstream to remove the cookie-based schemes | Independently valid and pursued in parallel, but not something we can block on for a user-visible UX bug. |

Fragility of the CSS-hide is accepted and documented as a §12 risk with a Scalar-upgrade mitigation.

---

## 9. Prerequisites before implementation begins

In priority order:

### 9.1 Consumer registration submitted and approved

Without an approved `client_id`, no part of Phase B is runnable.  Submit early.

**The callback URL to register on the form:**

```
https://wikifrodo.netlify.app/oauth/callback
```

This is the production path that the `pages/oauth/callback.vue` page in Step B4 will respond at.  The two must stay in lock-step — if the registered URL is changed, Step B4's filename must change with it, and vice versa.

If Meta's OAuth 2.0 form accepts **multiple** redirect URIs (newline-separated, like its OAuth 1.0a counterpart), also include:

```
http://localhost:3000/oauth/callback
```

so the login flow is exercisable against the local dev server too.  If the form rejects the second entry (single-redirect-URI consumers), register only the production URL — see §9.1.1 for the local-dev consequences.

#### 9.1.1 If the form only accepts one redirect URI

Single-URI is the OAuth 2.0 spec default; Meta's form may enforce it.  In that case:

- The registered URL is the production one.
- Local dev cannot exercise the *real* OAuth round trip (the browser will be redirected to `wikifrodo.netlify.app`, not `localhost`).  Developers can still build and unit-test the surrounding code; end-to-end login is verified by deploying a Netlify preview.
- This is an accepted prototype compromise.  Splitting into two consumers (§8.2) resolves it for production.

### 9.2 Decide on cookie secret and where it lives

The `h3.useSession` cookie requires a 32-byte secret.  For local dev, generated in `.env` (gitignored).  For Netlify, set as a Netlify environment variable in the site settings — **not** committed to the repo.  Document this in [README.md](/home/moriel/code/wikimedia/frontdoor/README.md) alongside the existing build instructions.

### 9.3 Confirm the `bearerAuth` scheme name in MediaWiki REST specs

Sample one or two specs returned by `server/api/discovery.get.ts` and confirm the security-scheme name.  If they declare something other than `bearerAuth`, `useScalarConfig.ts` needs the right key.  This is a 10-minute check, not a blocker for design, but it must happen before Phase C ships.

---

## 10. Step-by-step implementation plan

Each step has a verification criterion.  Steps within a phase are independent; phases are ordered.

---

### Phase A: Prerequisites — no code

#### Step A1 — Submit the consumer registration form

Done manually by the project owner at `https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2`.

**Values to enter** (full table in §6.3):

| Form field | Value |
|---|---|
| Application name | `Wikimedia Front Door (prototype)` |
| OAuth protocol version | OAuth 2.0 |
| Client type | Public (non-confidential) |
| Wiki | All wikis |
| Grants / scopes | `basic` only |
| **OAuth "callback" URL** | **`https://wikifrodo.netlify.app/oauth/callback`** (add `http://localhost:3000/oauth/callback` on a second line if the form accepts multi-URI — see §9.1) |

The callback path `/oauth/callback` is intentional: it is the path that `pages/oauth/callback.vue` (Step B4) will be created at.  Anything you change here must be changed in B4 to match — these are the two ends of the same wire.

**Output:** `client_id`, approval confirmation email.

#### Step A2 — Add `clientId` and cookie secret to `.env.example` and document in README

So the next developer can see what they need.  No secret values in the repo.

---

### Phase B: PKCE flow end-to-end

#### Step B1 — `runtimeConfig` in `nuxt.config.ts`

```ts
runtimeConfig: {
  // server-only
  oauthCookieSecret: '',
  // exposed to client
  public: {
    oauthClientId: '',
    oauthAuthorizeUrl: 'https://meta.wikimedia.org/w/rest.php/oauth2/authorize',
    oauthScope: 'basic'
  }
}
```

`oauthCookieSecret` is populated from `NUXT_OAUTH_COOKIE_SECRET`; `public.oauthClientId` from `NUXT_PUBLIC_OAUTH_CLIENT_ID`.  Standard Nuxt env-mapping rules.

**Verify:** `useRuntimeConfig()` in a server route returns the secret; `useRuntimeConfig().public.oauthClientId` in a client component returns the public client id.

#### Step B2 — `server/api/auth/oauth/login.get.ts`

Generates a 32-byte random `code_verifier`, derives `code_challenge` (S256), generates a `state`.  Writes `{ verifier, state, returnTo }` to the h3 session.  302s to the authorize URL with the standard PKCE params.

**Verify:** `GET /api/auth/oauth/login` (with `?returnTo=/explorer`) responds 302 to a URL starting with the authorize endpoint and carrying `code_challenge`, `state`, `client_id`, `response_type=code`, `redirect_uri`, `scope=basic`.  The h3 session cookie is set.

#### Step B3 — `server/api/auth/oauth/exchange.post.ts`

Accepts `{ code, state }` from the client.  Reads `{ verifier, state, returnTo }` from the `h3.useSession` cookie and verifies that the body `state` matches the cookie `state`.  POSTs to the Meta token endpoint with `grant_type=authorization_code`, the same `redirect_uri`, the `code_verifier` (from the cookie), and the `client_id`.  On success, fetches the profile.  Returns `{ accessToken, expiresAt, username, returnTo }` and clears the session cookie (`clearSession`) in the same response.  On any upstream failure: `createError({ statusCode, statusMessage })` — mirror the pattern in `discovery.get.ts`.

**Verify:** A manual end-to-end run produces a token and a username.  A `state` mismatch returns `400`.  An invalid `code` returns the upstream's 4xx with a readable error.  The PKCE session cookie is cleared on the success response.

#### Step B4 — `pages/oauth/callback.vue`

Vue page.  On mount: read `route.query.code` and `route.query.state`.  Call `POST /api/auth/oauth/exchange` with `{ code, state }` (the HttpOnly session cookie is attached automatically).  Instead of writing the returned `{ accessToken, username, expiresAt }` straight into the Pinia store and calling `router.replace(returnTo)`, the callback stashes the payload in `sessionStorage` under a single-use key (see `app/utils/oauthHandoff.ts`) and triggers a full document navigation via `window.location.replace(returnTo)`.

This detour exists because `app/plugins/explorer-route-navigation.client.ts` forces a full document reload on any transition into or out of `/explorer` so Scalar's `ApiReference` can remount cleanly — a router-level transition either fights that reload (wiping the in-memory Pinia store) or bypasses it (breaking Scalar's mount with a `Cannot destructure property 'bum'` error).  The handoff hops the token across the reload.

A companion client plugin, `app/plugins/oauth-handoff.client.ts`, runs on the destination page, reads the sessionStorage entry once, removes it, and calls `oauthSession.set(payload)`.  The token is in storage only during that one navigation; every reload after that clears it and the UI returns to logged-out (preserves §8.6).

The `code_verifier` is never read by the page — it lives only in the HttpOnly session cookie and is consumed server-side by the exchange route.  No client-side state-helper endpoint is needed.  `window.location.replace` (not `assign`) keeps the callback URL, with its single-use `code`, out of the browser history.

**Verify:** Land on `/oauth/callback?code=…&state=…` after a real authorize flow; arrive on `returnTo` logged in (header shows username, Scalar's Authentication panel carries the bearer token), no `bum` unmount errors in the console, and reloading `returnTo` returns to logged-out.

#### Step B5 — `stores/oauthSession.js`

```js
defineStore('oauthSession', () => {
  const username = ref(null)
  const accessToken = ref(null)        // never persisted
  const expiresAt = ref(null)
  const isLoggedIn = computed(() => !!accessToken.value && Date.now() < expiresAt.value)
  function set(payload) { username.value = payload.username; accessToken.value = payload.accessToken; expiresAt.value = payload.expiresAt }
  function clear()      { username.value = null; accessToken.value = null; expiresAt.value = null }
  return { username, accessToken, expiresAt, isLoggedIn, set, clear }
})
```

**Verify:** `pinia-plugin-persistedstate` (or equivalent) is NOT in use for this store.  `accessToken` does not appear in `localStorage` at any point, and does not appear in `sessionStorage` once the destination page has finished booting (the callback→destination handoff key from Step B4 is read-and-cleared before the destination's first render).

#### Step B6 — `app/composables/useOAuthSession.ts`

```ts
export function useOAuthSession() {
  const store = useOAuthSessionStore()
  const config = useRuntimeConfig().public
  function login(returnTo = useRoute().fullPath) {
    window.location.href = `/api/auth/oauth/login?returnTo=${ encodeURIComponent(returnTo) }`
  }
  function logout() { store.clear() }
  return { isLoggedIn: computed(() => store.isLoggedIn), username: computed(() => store.username), accessToken: computed(() => store.accessToken), login, logout }
}
```

**Verify:** Components can read `isLoggedIn` / `username` reactively, call `login()` and `logout()`, and never see Pinia directly.

#### Step B7 — Wire the placeholder login control in the layout

In `app/layouts/default.vue`, swap the placeholder for a Codex button bound to `useOAuthSession().login()`.  When `isLoggedIn`, render "Logged in as $1" + a logout button.

**Verify:** Header reflects login state across content pages and the Explorer.

#### Step B8 — i18n keys

Add to every locale in `i18n/`:
- `shell-auth-log-in`
- `shell-auth-log-out`
- `shell-auth-logged-in-as` — banana `Logged in as $1`

**Verify:** No `[shell-auth-…]` placeholder labels in any locale.

---

### Phase C: Scalar consumes the token

#### Step C1 — Extend `useScalarConfig.ts`

Add a `useTryItOutWithOAuth()` composable exposing a plain `ref<boolean>` (default `true`), separate from the `oauthSession` Pinia store (§5.6 — it's ephemeral UI state, not session identity). Reset it to `true` whenever `isLoggedIn` transitions to `true`.

When `useOAuthSession().accessToken` is set **and** the toggle is on, emit an `authentication` block alongside the existing config fields:

```ts
authentication: {
  preferredSecurityScheme: 'bearerAuth',
  securitySchemes: {
    bearerAuth: { token: accessToken.value }
  }
}
```

Otherwise — logged out, or toggle switched off — emit:

```ts
authentication: {
  preferredSecurityScheme: null,
  securitySchemes: {}
}
```

This must be written explicitly rather than omitted: `Object.assign` merges keys onto the existing reactive config, it doesn't delete them, so clearing the forced scheme/token requires setting them to empty/`null` values.

Watch both `accessToken` and the toggle ref, and update the Scalar configuration via the documented `Object.assign` pattern.

**Verify:** With the user logged in and the toggle on, opening any endpoint in Scalar shows the Authentication panel populated with the bearer token, and a "Try it out" request includes `Authorization: Bearer …` in the network tab. Flipping the toggle off and repeating the same request sends no `Authorization` header.

#### Step C2 — Audit security-scheme name in production discovery specs

Sample one or two specs from `server/api/discovery.get.ts` for each wiki instance.  Confirm the scheme name matches the key used in `useScalarConfig.ts`.  If anything other than `bearerAuth` appears, update the config key — or, more robustly, key `securitySchemes` off the spec-declared name (read it from the spec at config time).

**Verify:** Authenticated "Try it out" works on at least one operation per wiki in `config/instances.ts`.

#### Step C3 — Badge and toggle inside the Explorer

In `ExplorerScalarReference.client.vue`, render a Codex info badge above the Scalar shell when `useOAuthSession().isLoggedIn`.  Text via banana-i18n: `explorer-auth-badge-logged-in` — `Logged in as $1. Try-it-out requests will be sent with your bearer token.`  `aria-live="polite"`.

In the same badge row, render a `CdxToggleSwitch` bound to `useTryItOutWithOAuth()`, labelled via banana-i18n: `explorer-auth-toggle-use-session` — `Use my Wikimedia login for Try it out`. Hidden while logged out.

**Verify:** Badge and toggle appear immediately on login, disappear immediately on logout; screen readers announce the badge change; toggling off/on immediately changes whether subsequent "Try it out" requests carry the bearer token (no page reload needed).

#### Step C4 — Hide Scalar's Authentication panel with an "advanced" reveal toggle

Add the composable [app/composables/useAdvancedAuthPanel.ts](/home/moriel/code/wikimedia/frontdoor/app/composables/useAdvancedAuthPanel.ts) (module-scoped visibility ref, `localStorage`-backed acknowledgement, actions for reveal request / confirm / cancel / hide), a CSS override in [app/assets/css/explorer-codex-overrides.css](/home/moriel/code/wikimedia/frontdoor/app/assets/css/explorer-codex-overrides.css) that hides `.scalar-reference-intro-auth` under a wrapper class, and the toggle-plus-dialog wiring in [ExplorerScalarReference.client.vue](/home/moriel/code/wikimedia/frontdoor/app/components/explorer/ExplorerScalarReference.client.vue).

i18n keys added in all six locales (see §5.9): `explorer-auth-panel-toggle-label`, `explorer-auth-panel-dialog-title`, `explorer-auth-panel-dialog-body`, `explorer-auth-panel-dialog-dont-show-again`, `explorer-auth-panel-dialog-cancel`, `explorer-auth-panel-dialog-confirm`.

**Verify:**

- Fresh browser (or `localStorage` cleared): auth panel is hidden by default; toggle exists in the badge row regardless of login state.
- Flipping the toggle on opens the dialog; **Keep hidden** dismisses it and leaves the toggle off; **Show panel** reveals the panel and scrolls it into view.
- Ticking "Don't show this message again" then confirming persists `explorer-auth-panel-acknowledged=true` in `localStorage`; subsequent enables reveal directly without a dialog.
- Reload always returns to hidden regardless of prior state; acknowledgement flag survives the reload.
- Toggling off never prompts.
- RTL locales (`he`, `fa`): dialog and toggle mirror correctly.
- No console errors on any of the above.

Fragility mitigation (see §12): after every `@scalar/api-reference` upgrade, load `/explorer` and confirm the panel is still hidden by default.

---

### Phase D: Logout, expiry, error handling

#### Step D1 — Logout

`useOAuthSession().logout()` clears the store.  No server round trip needed — there is no server-side state to clear.  Optionally hit Meta's logout endpoint if we want to revoke the token; for the prototype we skip this.

#### Step D2 — Expired-token handling

Scalar fires its own error UX for 401s, but a friendlier behaviour is: intercept 401 from the try-it-out (Scalar emits events on its `ApiReference` ref), surface a Codex Message: "Your session expired — log in again."  Click → `login()`.

**Verify:** Forcing an expired token (set `expiresAt` to a past timestamp) and clicking "Try it out" produces the expected message instead of a bare 401.

---

## 11. Future: standalone token-management SPA — explicitly out of scope here

The user asked for a separate standalone SPA that queries the Wikimedia OAuth API to list a user's existing OAuth consumers and create new ones.  This is **deferred**.  It will need:

- A new route, probably `/tokens` (or `/account/tokens`) with `ssr: false` like the Explorer.
- Knowledge of the Wikimedia OAuth Management API — which is currently exposed via Special:OAuthListConsumers / OAuthConsumerRegistration with no documented REST surface.  Investigation (or use of the MediaWiki Action API equivalent) is the first step.
- An expanded scope on this consumer (almost certainly `oauthadmin` or similar) — meaning a re-approval of the registration.
- Token-listing UI, consumer-creation UI, plenty of safety around destructive actions (revoke).

The OAuth handshake architecture in this ADR — public client, in-memory token, Pinia-backed composable — is the foundation that page will sit on.  Following the §0 MVP decision, this SPA is now the **only** planned surface that consumes the OAuth session for anything beyond top-bar identity; any future re-integration of bearer injection into Scalar (§5.5) would most naturally live alongside it.  When that work begins it should produce its own follow-up ADR; this one stays focused on the auth handshake and top-bar session identity.

---

## 12. Risks

1. **Consumer approval delay** — gate on a human review.  Mitigation: submit immediately on ADR approval.
2. **CORS surprises at the token endpoint** — if Meta's token endpoint behaviour changes, the single proxy route covers us.  No further change needed.
3. **Cross-wiki bearer rejection** — §8.5.  Mitigation documented; verification deferred.
4. **XSS exfiltration of access token** — accepted risk for the prototype (§5.4).  Mitigation: minimal scope, short token lifetime, no other third-party scripts in the Explorer.
5. **Single consumer used for dev + prod** — accepted prototype compromise (§8.2).  Must be split before going beyond prototype.
6. **Scalar DOM/class churn silently reverting the Auth-panel hide** (§5.9, §8.9) — our CSS override targets `.scalar-reference-intro-auth`, a class Scalar assigns semantically today but does not treat as public API.  A minor version bump could rename or remove it, at which point the panel reappears without warning and users see the misleading CentralAuth entries again (there is no longer a reveal toggle, so the panel is meant to stay hidden always).  **Mitigation:** after every `@scalar/api-reference` upgrade, load `/explorer` in the browser and confirm the built-in Auth panel is still hidden; if broken, re-verify the selector against the new rendered DOM and update the override.  Longer-term mitigation would be a lightweight E2E assertion that `.scalar-reference-intro-auth` is not visible on the explorer page.
