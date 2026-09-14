import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { lookupContentPageSidebar } from '../app/utils/contentSidebarLookup.ts'
import {
	buildContentSidebarMap,
	serializeContentSidebarMap,
	listContentLocaleDirectories,
	serializeContentLocales
} from '../scripts/lib/contentSidebarMap.mjs'
import { SHARED_CONTENT_COLLECTION, contentCollectionForLocale } from '../config/contentCollections.ts'

const projectRoot = dirname( dirname( fileURLToPath( import.meta.url ) ) )

// The same build modules/content-sidebar-map.mjs runs, against the same source
// files. Nothing is committed to drift from, so this is the real map, not a copy.
const map = buildContentSidebarMap( join( projectRoot, 'content' ) )

// The locales the middleware can actually produce: contentLocaleFromPath reads a
// route prefix, and only these four are prefixed (app/utils/contentRoute.ts).
// Asserting against any other locale would test a call the app never makes.
const ROUTABLE_LOCALES = [ 'en', 'es', 'fr', 'he', 'fa' ]

/**
 * Writes a markdown file, creating the directories above it.
 *
 * @param {string} filePath - Absolute path to write.
 * @param {string} contents - File contents.
 */
function writeMarkdown( filePath, contents ) {
	mkdirSync( dirname( filePath ), { recursive: true } )
	writeFileSync( filePath, contents, 'utf-8' )
}

// ---------------------------------------------------------------------------
// Lookup against the real content tree
// ---------------------------------------------------------------------------

test( 'the front page is full-width in every locale that has one', () => {
	assert.equal( lookupContentPageSidebar( map, 'en', '' ), false )
	assert.equal( lookupContentPageSidebar( map, 'fr', '' ), false )
	assert.equal( lookupContentPageSidebar( map, 'he', '' ), false )
} )

test( 'a locale with no page of its own falls back to English', () => {
	// No content/fa/experiments/open-data.md, so Persian readers get the English
	// page — and it has to arrive full-width, the way that page declares.
	assert.equal( map[ '/fa/experiments/open-data' ], undefined )
	assert.equal( map[ '/en/experiments/open-data' ], false )
	assert.equal( lookupContentPageSidebar( map, 'fa', 'experiments/open-data' ), false )
} )

test( 'every routable locale resolves its front page', () => {
	// Guards the walk against a locale whose fallback chain does not reach a page:
	// the front page is the one route every locale is guaranteed to serve.
	for ( const localeCode of ROUTABLE_LOCALES ) {
		assert.equal( lookupContentPageSidebar( map, localeCode, '' ), false, localeCode )
	}
} )

test( 'a page that declares no preference does not inherit English\'s', () => {
	// /es/community exists and says nothing; /en says the front page is full-width.
	// Taking the first *declared* value rather than the first *existing* page would
	// hand the Spanish section page the English front page's layout.
	assert.equal( map[ '/es/community' ], null )
	assert.equal( map[ '/en' ], false )
	assert.equal( lookupContentPageSidebar( map, 'es', 'community' ), undefined )
} )

test( 'an ordinary content page resolves to automatic, path-based nav', () => {
	assert.equal( lookupContentPageSidebar( map, 'en', 'get-started' ), undefined )
	assert.equal( lookupContentPageSidebar( map, 'en', 'apis/attribution' ), undefined )
} )

test( 'a route with no content page anywhere resolves to no preference', () => {
	assert.equal( lookupContentPageSidebar( map, 'en', 'not-a-page' ), undefined )
} )

test( 'a nested page keeps its own preference across locales', () => {
	assert.equal( lookupContentPageSidebar( map, 'en', 'experiments/open-data' ), false )
	assert.equal( lookupContentPageSidebar( map, 'fr', 'experiments/open-data' ), false )
} )

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

test( 'index files are keyed at their directory, and partials are skipped', () => {
	const contentDirectory = mkdtempSync( join( tmpdir(), 'sidebar-map-' ) )
	writeMarkdown( join( contentDirectory, 'en/index.md' ), '---\nsidebar: false\n---\n\n# Home\n' )
	writeMarkdown( join( contentDirectory, 'en/apis/policies.md' ), '# Policies\n' )
	writeMarkdown( join( contentDirectory, 'en/standalone.md' ), '---\nsidebar: get-started\n---\n' )
	writeMarkdown( join( contentDirectory, '_partials/note.md' ), '# Note\n' )

	assert.deepEqual( buildContentSidebarMap( contentDirectory ), {
		'/en': false,
		'/en/apis/policies': null,
		'/en/standalone': 'get-started'
	} )
} )

test( 'a sidebar value the content schema forbids is refused', () => {
	const contentDirectory = mkdtempSync( join( tmpdir(), 'sidebar-map-' ) )
	writeMarkdown( join( contentDirectory, 'en/index.md' ), '---\nsidebar: 1\n---\n' )

	assert.throws(
		() => buildContentSidebarMap( contentDirectory ),
		/content\.config\.ts does not allow/
	)
} )

test( 'unparseable frontmatter reads as no preference rather than throwing', () => {
	// A watcher sees half-written files; the map should not be the thing that
	// notices, and the page's own parse failure is the louder signal anyway.
	const contentDirectory = mkdtempSync( join( tmpdir(), 'sidebar-map-' ) )
	writeMarkdown( join( contentDirectory, 'en/index.md' ), '---\nsidebar: [unclosed\n---\n' )

	assert.deepEqual( buildContentSidebarMap( contentDirectory ), { '/en': null } )
} )

test( 'a filename Nuxt would slugify is refused rather than silently mis-keyed', () => {
	const contentDirectory = mkdtempSync( join( tmpdir(), 'sidebar-map-' ) )
	writeMarkdown( join( contentDirectory, 'en/Get Started.md' ), '---\nsidebar: false\n---\n' )

	assert.throws(
		() => buildContentSidebarMap( contentDirectory ),
		/lower-case-hyphenated/
	)
} )

test( 'two files serving the same route are refused', () => {
	const contentDirectory = mkdtempSync( join( tmpdir(), 'sidebar-map-' ) )
	writeMarkdown( join( contentDirectory, 'en/apis.md' ), '# Apis\n' )
	writeMarkdown( join( contentDirectory, 'en/apis/index.md' ), '# Apis\n' )

	assert.throws(
		() => buildContentSidebarMap( contentDirectory ),
		/both served at \/en\/apis/
	)
} )

test( 'the emitted module exports the map it was built from', () => {
	const source = serializeContentSidebarMap( { '/en': false, '/en/apis': null } )

	assert.match( source, /export const CONTENT_SIDEBAR_MAP: Record<string, boolean \| string \| null> =/ )
	assert.match( source, /"\/en": false/ )
	assert.match( source, /"\/en\/apis": null/ )
} )

// ---------------------------------------------------------------------------
// Locale directory listing (content.config.ts's per-locale collection split)
// ---------------------------------------------------------------------------

test( 'the real content/ tree lists locale directories, not _partials', () => {
	const locales = listContentLocaleDirectories( join( projectRoot, 'content' ) )

	assert.ok( locales.includes( 'en' ) )
	assert.ok( locales.includes( 'fr' ) )
	assert.ok( !locales.includes( '_partials' ) )
	assert.deepEqual( locales, [ ...locales ].sort( ( a, b ) => a.localeCompare( b ) ) )
} )

test( 'listContentLocaleDirectories skips underscore-prefixed directories and files', () => {
	const contentDirectory = mkdtempSync( join( tmpdir(), 'content-locales-' ) )
	writeMarkdown( join( contentDirectory, 'en/index.md' ), '# Home\n' )
	writeMarkdown( join( contentDirectory, 'fr/index.md' ), '# Accueil\n' )
	writeMarkdown( join( contentDirectory, '_partials/shared/portal-note.md' ), '# Note\n' )
	writeFileSync( join( contentDirectory, 'README.md' ), '# Not a locale directory\n' )

	assert.deepEqual( listContentLocaleDirectories( contentDirectory ), [ 'en', 'fr' ] )
} )

test( 'the emitted locales module exports the list it was built from', () => {
	const source = serializeContentLocales( [ 'en', 'fr' ] )

	assert.match( source, /export const CONTENT_LOCALES: string\[\] =/ )
	assert.match( source, /"en"/ )
	assert.match( source, /"fr"/ )
} )

test( 'contentCollectionForLocale names one distinct collection per real locale directory, not colliding with shared', () => {
	// content.config.ts builds its collections object from exactly this recipe
	// (listContentLocaleDirectories + contentCollectionForLocale + the shared
	// collection), but can't be imported directly here: defineCollection's zod
	// schema validation only resolves inside a full Nuxt build, so importing it
	// from a plain node:test throws regardless of anything this repo changes.
	const locales = listContentLocaleDirectories( join( projectRoot, 'content' ) )
	const collectionNames = locales.map( ( locale ) => contentCollectionForLocale( locale ) )

	assert.ok( locales.length > 0 )
	assert.equal( new Set( collectionNames ).size, collectionNames.length )
	assert.ok( !collectionNames.includes( SHARED_CONTENT_COLLECTION ) )
	assert.ok( collectionNames.includes( contentCollectionForLocale( 'en' ) ) )
} )

test( 'contentCollectionForLocale sanitizes hyphens so the name is a valid @nuxt/content collection identifier', () => {
	// @nuxt/content's resolveCollection() (node_modules/@nuxt/content/dist/module.mjs)
	// silently drops any collection name that fails /^[a-z_]\w*$/i rather than
	// failing the build, so a hyphenated locale directory (content/pt-br/) has to
	// become a valid JS identifier or its collection is quietly never registered.
	const NUXT_CONTENT_COLLECTION_NAME = /^[a-z_]\w*$/i

	assert.equal( contentCollectionForLocale( 'pt-br' ), 'content_pt_br' )
	assert.match( contentCollectionForLocale( 'pt-br' ), NUXT_CONTENT_COLLECTION_NAME )

	for ( const locale of listContentLocaleDirectories( join( projectRoot, 'content' ) ) ) {
		assert.match( contentCollectionForLocale( locale ), NUXT_CONTENT_COLLECTION_NAME, locale )
	}
} )
