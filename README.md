# Nuxt Content Starter

Look at the [Nuxt Content documentation](https://content.nuxt.com) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Environment variables

Copy `.env.example` to `.env` and fill in:

- `NUXT_OAUTH_COOKIE_SECRET` — 32-byte secret used to encrypt the transient Wikimedia OAuth PKCE handshake cookie. Generate with `openssl rand -base64 32`. On Netlify, set this as a site environment variable — never commit it.
- `NUXT_PUBLIC_OAUTH_CLIENT_ID` — `client_id` from the approved Wikimedia OAuth 2.0 consumer registration (see [docs/adr-wikimedia-oauth-authentication.md](/home/moriel/code/wikimedia/frontdoor/docs/adr-wikimedia-oauth-authentication.md)).
- `NUXT_PUBLIC_SITE_URL` — *optional.* Absolute public origin (no trailing slash) used for the absolute URLs in `/sitemap.xml`, `/llms.txt` and `/llms-full.txt`, and for the `Sitemap:` line in `/robots.txt`. **Leave it unset locally** — outside a production build the origin falls back to `http://localhost:3000`, so those documents work with no setup. On Netlify it is also unnecessary: `DEPLOY_PRIME_URL` is picked up automatically and preferred over `URL`, so a deploy preview describes itself rather than production. A production build with no origin from any source deliberately **skips** the sitemap and llms files (with a build warning) rather than publish guessed addresses. See [config/seo.ts](/home/moriel/code/wikimedia/frontdoor/config/seo.ts).

## Static API reference

Per-module reference pages are generated from the committed OpenAPI specs and **prerendered inside `nuxt build`** via `routeRules` — a subset of routes emitted as real HTML while the rest of the site stays server-rendered. Alongside them are machine-readable surfaces for AI assistants and tooling:

| Path | What it is |
|---|---|
| `/reference/<module>` | Reference page per module, per locale (the root module is `/reference/general`) |
| `/openapi/<module>.json` | That module's committed spec, byte-identical |
| `/llms.txt` | Index of modules with operation and wiki counts |
| `/llms-full.txt` | Every module and operation as plain text, with anchor links |
| `/sitemap.xml` | All reference pages with `hreflang` alternates |

Locales are an explicit allowlist (`REFERENCE_EXPERIMENT_LOCALES` in [config/referenceRoutes.ts](/home/moriel/code/wikimedia/frontdoor/config/referenceRoutes.ts)), **not** the full 575-locale catalogue. See [docs/adr-static-module-documentation.md](/home/moriel/code/wikimedia/frontdoor/docs/adr-static-module-documentation.md) for the decisions and [docs/plan-static-module-documentation-experiment.md](/home/moriel/code/wikimedia/frontdoor/docs/plan-static-module-documentation-experiment.md) for progress.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Authoring content

Hand-authored pages live under [content/](/home/moriel/code/wikimedia/frontdoor/content/) as Markdown (`content/<locale>/<slug>.md`). For adding and moving pages, editing the top menu, and controlling the left sidebar (including the `sidebar` frontmatter field), see the [content authoring guide](/home/moriel/code/wikimedia/frontdoor/docs/content-authoring-guide.md).

## Imported content

Some pages are imported from remote sources (raw Markdown URLs, or MediaWiki pages with their translations) declared in [config/remoteContentSources.ts](/home/moriel/code/wikimedia/frontdoor/config/remoteContentSources.ts). This is a **standalone step, not part of the build** — the build uses whatever imported content is committed. For step-by-step instructions on adding/changing sources and shared partials, see the [content import guide](/home/moriel/code/wikimedia/frontdoor/docs/content-import-guide.md).

```bash
npm run fetch-remote-content
```

Each run wipes and recreates the imported files, then you **review the git diff** (added / changed / removed pages and slugs) and commit. Removed slugs are your cue to add a redirect in [config/contentRedirects.ts](/home/moriel/code/wikimedia/frontdoor/config/contentRedirects.ts). Imported files are committed (not gitignored); `npm run dev` and the production build use the committed copies. See [docs/adr-remote-content-fetching.md](/home/moriel/code/wikimedia/frontdoor/docs/adr-remote-content-fetching.md).

**Shared partials.** An imported wiki page can request a portal-authored partial by marking a spot with an empty `<div class="frontdoor-partial" data-partial="name">`; on fetch that becomes a `::partial{name}` directive shared across all translations. The partial's content lives in [content/_partials/shared/](/home/moriel/code/wikimedia/frontdoor/content/_partials/shared/) and the name must be registered in [config/sharedPartials.ts](/home/moriel/code/wikimedia/frontdoor/config/sharedPartials.ts) (an allowlist — unregistered names are dropped with a warning).

The full language catalog is likewise generated on demand with `npm run generate-language-catalog` (see [docs/adr-language-catalog.md](/home/moriel/code/wikimedia/frontdoor/docs/adr-language-catalog.md)).

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Netlify

The explorer relies on the same-origin discovery proxy in [server/api/discovery.get.ts](/home/moriel/code/wikimedia/frontdoor/server/api/discovery.get.ts), so a purely static export is not sufficient for the full app. For Netlify, deploy the Nitro server build as Netlify Functions.

Build for Netlify:

```bash
npm run build:netlify
```

This uses the Netlify Nitro preset and the repository's [netlify.toml](/home/moriel/code/wikimedia/frontdoor/netlify.toml), which expects:

- static assets in `dist`
- server functions in `.netlify/functions-internal`

`npm run generate` and `npm run generate:static` remain available for static generation workflows, but they do not provide the discovery proxy required by the explorer route.
