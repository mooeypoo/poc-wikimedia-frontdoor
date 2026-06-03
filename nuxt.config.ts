// https://nuxt.com/docs/api/configuration/nuxt-config

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
		optimizeDeps: {
			include: [
				'@scalar/api-reference',
				'github-slugger'
			]
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
