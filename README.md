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

- static assets in `.output/public`
- server functions in `.netlify/functions-internal`

`npm run generate` and `npm run generate:static` remain available for static generation workflows, but they do not provide the discovery proxy required by the explorer route.
