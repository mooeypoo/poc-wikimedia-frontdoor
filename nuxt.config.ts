// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig( {
	modules: [
		'@nuxt/content'
	],
	devtools: { enabled: true },
	compatibilityDate: '2024-04-03',

	// Use the `sqlite3` connector for the local content DB. The default
	// `better-sqlite3` has a native-binding double-load issue in Nuxt's dev
	// pipeline ("Module did not self-register"). Node's built-in `node:sqlite`
	// is not yet available in Node 22 LTS, so `sqlite3` is the most reliable
	// option until we move to Node 24+.
	content: {
		experimental: {
			sqliteConnector: 'sqlite3'
		}
	},

	// Global CSS: Codex design tokens + our shell styles.
	css: [
		'~/assets/css/main.css'
	],

	// Direction handling is currently driven by the shell dir attribute and
	// logical CSS properties in first-party styles. We intentionally avoid
	// global CSS flipping for third-party explorer styles for now.
} )
