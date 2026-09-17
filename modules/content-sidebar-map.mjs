/**
 * Writes `#build/content-sidebar-map` — every page under content/, keyed by the
 * route path it is served at, valued at its `sidebar` frontmatter.
 *
 * The shell picks the left section nav before the page component has loaded any
 * frontmatter, so `content-sidebar.global` has to resolve that one field first.
 * It used to ask the content collection, and global middleware runs in the
 * browser as well as on the server, where any `queryCollection` drags in the
 * SQLite WASM runtime and the whole collection dump — 1.95 MB on first paint of
 * every content page, to read one boolean. The map is a few kB of the bundle.
 *
 * Also writes the same content/ walk's locale directory list, for code that
 * needs every locale content.config.ts made a collection for. One file, read
 * under two aliases, because Nuxt forbids `#build/` in server code: the app
 * reads `#build/content-locales` (`useContentSearch.ts`'s per-locale
 * collections and its "search all languages" expansion), Nitro reads
 * `#content-locales` (`server/api/content-page.get.ts`, which narrows a
 * reader's fallback chain, and `server/api/content-document.get.ts`, which
 * validates a single-document request's locale against it). @nuxt/content does
 * publish an equivalent list at runtime (`#content/manifest`'s `tables`, keyed
 * by collection name), but that
 * alias is internal and undocumented; this repo already owns the walk that
 * produces the same answer, so a second source of truth here is the more
 * stable dependency, not a needless one.
 *
 * Generated rather than committed so the frontmatter under content/ stays the
 * only place a sidebar is declared. See ARCHITECTURE.md → Shell section
 * navigation.
 */

import { readFileSync, watch } from 'node:fs'
import { join } from 'node:path'
import { defineNuxtModule, addTemplate, useLogger } from '@nuxt/kit'

import {
	buildContentSidebarMap,
	serializeContentSidebarMap,
	listContentLocaleDirectories,
	serializeContentLocales
} from '../scripts/lib/contentSidebarMap.mjs'

const MODULE_NAME = 'content-sidebar-map'
const TEMPLATE_FILENAME = `${ MODULE_NAME }.ts`
const LOCALES_TEMPLATE_FILENAME = 'content-locales.ts'
/** Alias Nitro reads the locale list under, since `#build/` is app-side only. */
const SERVER_LOCALES_ALIAS = '#content-locales'

/** Redraw window for bursts of file events (a branch switch, a bulk rename). */
const WATCH_DEBOUNCE_MS = 100

/**
 * Reads the template a previous Nuxt instance left in the build directory.
 *
 * @param {string} buildDirectory - Nuxt's build directory.
 * @returns {string|null} Its contents, or null on a clean build.
 */
function readTemplateFromLastRun( buildDirectory ) {
	try {
		return readFileSync( join( buildDirectory, TEMPLATE_FILENAME ), 'utf-8' )
	} catch {
		return null
	}
}

export default defineNuxtModule( {
	meta: {
		name: MODULE_NAME
	},

	setup( moduleOptions, nuxt ) {
		const contentDirectory = join( nuxt.options.rootDir, 'content' )
		const logger = useLogger( MODULE_NAME )

		/*
		 * Seeded from whatever the last instance wrote, because `setup` runs again
		 * on every restart and this repo restarts a lot: @nuxt/content's dev cache
		 * collides with itself on most content edits (SQLITE_BUSY, nothing to do
		 * with this module), and a fallback that resets each time is not one. A
		 * clean build starts with nothing, which is what makes the cold case honest.
		 */
		let lastGoodContents = readTemplateFromLastRun( nuxt.options.buildDir )

		/**
		 * Rebuilds the map, holding the last good one when the tree is unmappable.
		 *
		 * Throwing would be the obvious move, but `builder:generateApp` is shared:
		 * a rejection here fails whichever call is in flight, including ones this
		 * module did not make. A page with a `sidebar` the schema forbids is the
		 * author's to fix, not a reason to take the build down around them — so it
		 * is reported, and the last good map stands until they fix it.
		 *
		 * With no map to fall back on there is nothing to serve, so a cold build
		 * still fails, naming the file.
		 *
		 * @returns {string} Module source for the template.
		 */
		function renderSidebarMap() {
			try {
				lastGoodContents = serializeContentSidebarMap( buildContentSidebarMap( contentDirectory ) )
			} catch ( error ) {
				if ( !lastGoodContents ) {
					throw error
				}
				logger.error( error.message )
			}

			return lastGoodContents
		}

		addTemplate( {
			filename: TEMPLATE_FILENAME,
			write: true,
			getContents: renderSidebarMap
		} )

		/**
		 * Renders the locale directory list. Unlike the sidebar map, this has
		 * nothing to hold "last good" for — a plain directory listing has no
		 * per-file frontmatter to fail on — so it's recomputed fresh every time.
		 *
		 * A brand-new content/<locale>/ directory added mid-dev-session updates
		 * this list on the next watch tick, but content.config.ts's own
		 * collections are resolved once at server start — @nuxt/content does not
		 * hot-reload a newly-added collection — so a reader whose chain reaches
		 * that locale before a restart hits a listed locale with no collection
		 * behind it yet. A dev-only gap; a restart picks it up like any other
		 * content.config.ts change would. The app and Nitro read the same
		 * written file, so they cannot drift apart from each other, only from
		 * the collections.
		 *
		 * @returns {string} Module source for the template.
		 */
		function renderContentLocales() {
			return serializeContentLocales( listContentLocaleDirectories( contentDirectory ) )
		}

		const localesTemplate = addTemplate( {
			filename: LOCALES_TEMPLATE_FILENAME,
			write: true,
			getContents: renderContentLocales
		} )

		/*
		 * Aliased rather than registered as a second Nitro-side template, which
		 * is how @nuxt/content publishes its own `#content/manifest`
		 * (dist/module.mjs:3131). An alias onto the written file teaches the
		 * bundler and both generated tsconfigs at once, where a bare Nitro
		 * virtual would have resolved at runtime and failed typecheck.
		 */
		nuxt.options.alias[ SERVER_LOCALES_ALIAS ] = localesTemplate.dst

		if ( !nuxt.options.dev ) {
			return
		}

		/*
		 * Nuxt's own watcher covers srcDir, not content/, and putting content/ on
		 * nuxt.options.watch would restart the dev server on every prose edit. So
		 * we watch it ourselves and rebuild on any event — a directory rename
		 * moves pages without touching a .md path, so filtering by extension would
		 * miss it. Nuxt compares the compiled template against the last one and
		 * only writes on a real change, so a prose edit costs one rebuild of the
		 * map and nothing downstream.
		 *
		 * Calling the hook rather than kit's updateTemplates(): that wrapper reads
		 * the ambient Nuxt instance and does nothing at all when it cannot find
		 * one, which from a filesystem callback would be a silent no-op.
		 *
		 * Measured, in case it comes up: this costs no restarts. @nuxt/content's
		 * dev cache restarts the server by itself on most content edits, with this
		 * watcher disabled and the frontmatter untouched.
		 */
		let pendingRedraw = null
		const watcher = watch( contentDirectory, { recursive: true }, () => {
			clearTimeout( pendingRedraw )
			pendingRedraw = setTimeout( () => {
				nuxt.hooks.callHook( 'builder:generateApp', {
					filter: ( template ) => template.filename === TEMPLATE_FILENAME
						|| template.filename === LOCALES_TEMPLATE_FILENAME
				} ).catch( ( error ) => {
					// renderSidebarMap holds its own errors, so a rejection here belongs
					// to something else in the build. Log it: an unhandled rejection out
					// of a timer takes the dev server down.
					logger.error( error.message )
				} )
			}, WATCH_DEBOUNCE_MS )
		} )

		nuxt.hook( 'close', () => {
			clearTimeout( pendingRedraw )
			watcher.close()
		} )
	}
} )
