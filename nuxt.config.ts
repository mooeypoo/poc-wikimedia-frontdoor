// https://nuxt.com/docs/api/configuration/nuxt-config

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { scalarMapConfigPluginsResolvePlugin } from './app/scalar/scalarMapConfigPluginsResolvePlugin'
import { buildLegacyContentRedirectRouteRules } from './config/contentRedirects'
import { BRAND_WORDMARK_FONT_STYLESHEET_URL } from './config/brandTypography'
import { SUPPORTED_LANGUAGES } from './config/languages'
import {
	COLOR_MODES,
	COLOR_MODE_STORAGE_KEY,
	DEFAULT_COLOR_MODE
} from './config/colorMode'

// Pre-hydration color-mode script. Runs synchronously in <head> before first
// paint so the stored theme choice is on <html> before the body renders,
// avoiding a light flash on SSR content routes. Mirrors useColorMode.ts; the
// two share config/colorMode.ts so the storage key and class names cannot drift.
const colorModeFoucScript = `(function(){try{` +
	`var m=localStorage.getItem(${ JSON.stringify( COLOR_MODE_STORAGE_KEY ) });` +
	`if(${ JSON.stringify( COLOR_MODES ) }.indexOf(m)===-1){m=${ JSON.stringify( DEFAULT_COLOR_MODE ) };}` +
	`var e=document.documentElement;` +
	`${ JSON.stringify( COLOR_MODES ) }.forEach(function(x){e.classList.remove('fd-theme--'+x);});` +
	`e.classList.add('fd-theme--'+m);` +
	`}catch(e){}})();`

const projectRootDirectory = dirname( fileURLToPath( import.meta.url ) )
const isDevelopment = process.env.NODE_ENV !== 'production'
// Per-process DB files avoid SQLITE_BUSY when a previous dev server did not exit cleanly.
const contentLocalDatabaseFilename = `.data/content/contents-${ process.pid }.sqlite`

export default defineNuxtConfig( {
	modules: [
		'@nuxt/content',
		'@pinia/nuxt',
		'@nuxtjs/i18n'
	],

	// Wikimedia OAuth 2.0 + PKCE (docs/adr-wikimedia-oauth-authentication.md §10 Step B1).
	// oauthCookieSecret is server-only; the public block is safe to expose since the
	// OAuth client is a public PKCE client (no client secret involved).
	runtimeConfig: {
		oauthCookieSecret: '',
		public: {
			oauthClientId: '',
			oauthAuthorizeUrl: 'https://meta.wikimedia.org/w/rest.php/oauth2/authorize',
			oauthScope: 'basic'
		}
	},

	app: {
		head: {
			link: [
				{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
				{ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
				{ rel: 'stylesheet', href: BRAND_WORDMARK_FONT_STYLESHEET_URL }
			],
			// Sole initial setter of the theme class: runs before first paint and is
			// then maintained at runtime by useColorMode via classList. Deliberately
			// NOT mirrored in htmlAttrs.class — unhead would re-assert its static value
			// and accumulate with the runtime class (e.g. forcing `auto` back on).
			script: [
				{ innerHTML: colorModeFoucScript, tagPosition: 'head' }
			]
		}
	},
	devtools: { enabled: true },
	// Must be >= 2024-05-07 so Nitro uses the modern `netlify` preset (not `netlify-legacy`),
	// which emits ESM Functions 2.0 handlers compatible with Netlify's runtime.
	compatibilityDate: '2024-05-07',

	// Nuxt Content behaves differently across environments here:
	// - dev: `sqlite3` avoids the native-binding double-load issue we observed
	//   with `better-sqlite3` in Nuxt's dev pipeline.
	// - build/prod: `better-sqlite3` is synchronous and avoids the noisy locked
	//   table warnings emitted by the async `sqlite3` connector during builds.
	content: {
		_localDatabase: {
			type: 'sqlite',
			filename: contentLocalDatabaseFilename
		},
		experimental: {
			sqliteConnector: isDevelopment ? 'sqlite3' : 'better-sqlite3'
		},
		build: {
			markdown: {
				highlight: {
					// Dual themes: Shiki emits both palettes inline, the dark one as
					// `--shiki-dark*` custom properties. main.css swaps to them under
					// the dark theme classes so code blocks follow the site mode.
					theme: {
						default: 'github-light',
						dark: 'github-dark'
					},
					langs: [
						'javascript',
						'typescript',
						'python',
						'php',
						'bash',
						'json',
						'html',
						'css',
						'vue',
						'markdown'
					]
				}
			}
		}
	},

	i18n: {
		strategy: 'prefix_except_default',
		defaultLocale: 'en',
		detectBrowserLanguage: false,
		// One list for every locale: sourced from the generated language catalog
		// (config/languages.ts). Locales without content or interface strings fall
		// back through the chain to English. See docs/adr-language-catalog.md.
		// Registered under the SSR build; full static generation does not scale to
		// this many locales (ADR §7).
		locales: SUPPORTED_LANGUAGES.map( ( language ) => ( {
			code: language.code,
			language: language.bcp47,
			dir: language.dir
		} ) )
	},

	// Global CSS: Codex design tokens + our shell styles.
	css: [
		'@wikimedia/codex/dist/codex.style.css',
		'~/assets/css/main.css',
		// Dark-mode token overrides, scoped under html.fd-theme--* (see color-modes.css).
		// Loads after main.css so it overrides the light :root token defaults.
		'~/assets/css/color-modes.css'
	],

	routeRules: {
		'/explorer': { ssr: false },
		'/explorer/**': { ssr: false },
		// OAuth session is memory-only (+ handoff); SSR would paint the logged-out gate
		// then hydrate the dashboard and collapse Figma vertical spacing.
		'/account': { ssr: false },
		'/*/account': { ssr: false },
		...buildLegacyContentRedirectRouteRules()
	},

	vite: {
		plugins: [
			scalarMapConfigPluginsResolvePlugin( projectRootDirectory )
		],
		resolve: {
			alias: {
				// ApiReference forwards ClientPlugin UI only through mapConfigPlugins into the modal.
				[ resolve(
					projectRootDirectory,
					'node_modules/@scalar/api-reference/dist/helpers/map-config-plugins.js'
				) ]: resolve( projectRootDirectory, 'app/scalar/explorerMapConfigPlugins.client.ts' )
			}
		},
		optimizeDeps: {
			include: [
				'@scalar/api-reference',
				'github-slugger'
			],
			esbuildOptions: {
				plugins: [
					{
						name: 'front-door-scalar-map-config-plugins-esbuild',
						setup( build ) {
							build.onResolve(
								{ filter: /map-config-plugins\.js$/ },
								() => ( {
									path: resolve(
										projectRootDirectory,
										'app/scalar/explorerMapConfigPlugins.client.ts'
									)
								} )
							)
						}
					}
				]
			}
		}
	},

	// Direction handling is currently driven by the shell dir attribute and
	// logical CSS properties in first-party styles. We intentionally avoid
	// global CSS flipping for third-party explorer styles for now.

	hooks: {
		// Per-process SQLite files accumulate across dev server restarts when the
		// previous process exits uncleanly. Clean them up at startup so the .data/
		// directory does not grow unboundedly (ADR §9).
		ready: async () => {
			if ( !isDevelopment ) {
				return
			}
			const { readdir, unlink } = await import( 'node:fs/promises' )
			const { join } = await import( 'node:path' )
			const dir = '.data/content'
			const currentFile = `contents-${ process.pid }.sqlite`
			try {
				const files = await readdir( dir )
				await Promise.all(
					files
						.filter( ( f ) => f !== currentFile && f.startsWith( 'contents-' ) && f.endsWith( '.sqlite' ) )
						.map( ( f ) => unlink( join( dir, f ) ).catch( () => undefined ) )
				)
			} catch {
				// .data/content does not exist yet on a fresh checkout — safe to ignore.
			}
		}
	}
} )
