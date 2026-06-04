// https://nuxt.com/docs/api/configuration/nuxt-config

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { scalarMapConfigPluginsResolvePlugin } from './app/scalar/scalarMapConfigPluginsResolvePlugin'

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
		}
	},

	i18n: {
		strategy: 'prefix_except_default',
		defaultLocale: 'en',
		detectBrowserLanguage: false,
		locales: [
			{ code: 'en', language: 'en-US' },
			{ code: 'es', language: 'es-ES' },
			{ code: 'fr', language: 'fr-FR' },
			{ code: 'he', language: 'he-IL' },
			{ code: 'fa', language: 'fa-IR' }
		]
	},

	// Global CSS: Codex design tokens + our shell styles.
	css: [
		'@wikimedia/codex/dist/codex.style.css',
		'~/assets/css/main.css'
	],

	routeRules: {
		'/explorer': { ssr: false },
		'/explorer/**': { ssr: false }
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
} )
