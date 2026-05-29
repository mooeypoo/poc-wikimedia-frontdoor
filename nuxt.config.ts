// https://nuxt.com/docs/api/configuration/nuxt-config

const isDevelopment = process.env.NODE_ENV !== 'production'
// Per-process DB files avoid SQLITE_BUSY when a previous dev server did not exit cleanly.
const contentLocalDatabaseFilename = `.data/content/contents-${ process.pid }.sqlite`

export default defineNuxtConfig( {
	modules: [
		'@nuxt/content',
		'@pinia/nuxt'
	],
	devtools: { enabled: true },
	compatibilityDate: '2024-04-03',

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

	// Global CSS: Codex design tokens + our shell styles.
	css: [
		'@wikimedia/codex/dist/codex.style.css',
		'~/assets/css/main.css',
		'@scalar/api-reference/style.css'
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
} )
