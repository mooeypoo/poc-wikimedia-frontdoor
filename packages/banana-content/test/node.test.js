/**
 * The Node runner: path templating, ownership, and end-to-end runs against a
 * temporary project.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyPathTemplate, matchesAny } from '../src/node/files.js'
import { resolveConfig } from '../src/node/config.js'
import { run } from '../src/node/run.js'

/**
 * Builds a throwaway project on disk.
 *
 * @param {object} files - Path to contents, relative to the project root.
 * @returns {Promise<string>} Project root.
 */
async function project( files ) {
	const root = await mkdtemp( join( tmpdir(), 'banana-content-' ) )
	for ( const [ path, contents ] of Object.entries( files ) ) {
		const absolute = join( root, path )
		await mkdir( join( absolute, '..' ), { recursive: true } )
		await writeFile( absolute, contents, 'utf-8' )
	}
	return root
}

const BASE_CONFIG = {
	source: { dir: 'src-content', include: [ '**/*.md' ], definitionsOnly: [ '_shared/**' ] },
	messages: { dir: 'messages' },
	output: { dir: 'out' }
}

/**
 * Runs the generator against a throwaway project.
 *
 * @param {object} files - Project files.
 * @param {object} [overrides] - Config overrides.
 * @param {object} [options] - Run options.
 * @returns {Promise<object>} Root and result.
 */
async function generate( files, overrides = {}, options = {} ) {
	const root = await project( files )
	const config = await resolveConfig( { ...BASE_CONFIG, ...overrides }, root )
	const result = await run( config, options )
	return { root, result }
}

test( 'path templates expand every token', () => {
	const path = 'experiments/open-data.md'
	assert.equal( applyPathTemplate( '%locale%/%path%', path, 'he' ), 'he/experiments/open-data.md' )
	assert.equal( applyPathTemplate( '%locale%_%name%%ext%', path, 'he' ), 'he_open-data.md' )
	assert.equal(
		applyPathTemplate( '%dir%/%name%.%locale%%ext%', path, 'he' ),
		'experiments/open-data.he.md'
	)
} )

test( 'an empty %dir% does not leave a stray separator', () => {
	assert.equal( applyPathTemplate( '%locale%/%dir%/%name%%ext%', 'about.md', 'fr' ), 'fr/about.md' )
} )

test( 'glob matching handles the definitions-only patterns', () => {
	assert.equal( matchesAny( '_shared/common.md', [ '_shared/**' ] ), true )
	assert.equal( matchesAny( 'experiments/open-data.md', [ '_shared/**' ] ), false )
	assert.equal( matchesAny( 'a/_draft.md', [ '**/_*' ] ), true )
	assert.equal( matchesAny( 'a/b.md', [ '**/_*' ] ), false )
} )

test( 'an end-to-end run extracts catalogues and generates the source locale', async () => {
	const { root, result } = await generate( {
		'src-content/about.md': '# :message[Access open data]{#title qqq="Page H1."}\n'
	} )
	assert.equal( result.diagnostics.hasErrors, false )

	const english = JSON.parse( await readFile( join( root, 'messages/en.json' ), 'utf-8' ) )
	assert.equal( english[ 'content-about-title' ], 'Access open data' )
	const qqq = JSON.parse( await readFile( join( root, 'messages/qqq.json' ), 'utf-8' ) )
	assert.equal( qqq[ 'content-about-title' ], 'Page H1.' )

	const page = await readFile( join( root, 'out/en/about.md' ), 'utf-8' )
	// sourceFile carries the config-relative source directory, so that a reader
	// of a generated file knows exactly where to go and edit it.
	assert.match(
		page,
		/^---\ni18nGenerated: true\nsourceFile: src-content\/about\.md\n---\n\n# Access open data\n$/
	)
	await rm( root, { recursive: true, force: true } )
} )

test( 'locales come from the catalogue files present, with no list anywhere', async () => {
	const { root, result } = await generate( {
		'src-content/about.md': '# :message[Title]{#title qqq="H1."}\n',
		'messages/fr.json': JSON.stringify( { 'content-about-title': 'Titre' } ),
		'messages/he.json': JSON.stringify( { 'content-about-title': 'כותרת' } )
	} )
	assert.deepEqual( result.locales.sort(), [ 'en', 'fr', 'he' ] )
	assert.match( await readFile( join( root, 'out/fr/about.md' ), 'utf-8' ), /# Titre/ )
	assert.match( await readFile( join( root, 'out/he/about.md' ), 'utf-8' ), /# כותרת/ )
	await rm( root, { recursive: true, force: true } )
} )

test( 'a run is idempotent', async () => {
	const files = {
		'src-content/about.md': '# :message[Title]{#title qqq="H1."}\n',
		'messages/fr.json': JSON.stringify( { 'content-about-title': 'Titre' } )
	}
	const { root } = await generate( files )
	const first = await readFile( join( root, 'out/fr/about.md' ), 'utf-8' )
	const config = await resolveConfig( BASE_CONFIG, root )
	await run( config )
	assert.equal( await readFile( join( root, 'out/fr/about.md' ), 'utf-8' ), first )
	await rm( root, { recursive: true, force: true } )
} )

test( 'a removed translation removes its generated file', async () => {
	const { root } = await generate( {
		'src-content/about.md': '# :message[Title]{#title qqq="H1."}\n',
		'messages/fr.json': JSON.stringify( { 'content-about-title': 'Titre' } )
	} )
	assert.ok( ( await readdir( join( root, 'out' ) ) ).includes( 'fr' ) )

	await rm( join( root, 'messages/fr.json' ) )
	const config = await resolveConfig( BASE_CONFIG, root )
	await run( config )
	assert.equal( ( await readdir( join( root, 'out' ) ) ).includes( 'fr' ), false )
	await rm( root, { recursive: true, force: true } )
} )

test( 'hand-authored output is never overwritten', async () => {
	const authored = '# Written by a person\n'
	const { root, result } = await generate( {
		'src-content/about.md': '# :message[Generated]{#title qqq="H1."}\n',
		'out/en/about.md': authored
	} )
	assert.equal( result.diagnostics.hasErrors, true )
	assert.match(
		result.diagnostics.errors.map( ( entry ) => entry.message ).join( '\n' ),
		/refusing to overwrite/
	)
	assert.equal( await readFile( join( root, 'out/en/about.md' ), 'utf-8' ), authored )
	await rm( root, { recursive: true, force: true } )
} )

test( 'imported content is identified as such when it collides', async () => {
	const { root, result } = await generate( {
		'src-content/about.md': '# :message[Generated]{#title qqq="H1."}\n',
		'out/en/about.md': '---\nremoteImport: true\n---\n\n# Imported\n'
	} )
	assert.match(
		result.diagnostics.errors.map( ( entry ) => entry.message ).join( '\n' ),
		/owned by exactly one generator/
	)
	await rm( root, { recursive: true, force: true } )
} )

test( 'a stripped marker is still owned via the manifest', async () => {
	const { root } = await generate( {
		'src-content/about.md': '# :message[Title]{#title qqq="H1."}\n'
	} )
	// Simulate someone deleting the frontmatter marker by hand.
	await writeFile( join( root, 'out/en/about.md' ), '# Title\n', 'utf-8' )
	const config = await resolveConfig( BASE_CONFIG, root )
	const result = await run( config )
	assert.equal( result.diagnostics.hasErrors, false, 'manifest should still claim the file' )
	await rm( root, { recursive: true, force: true } )
} )

test( 'a deleted manifest still finds files via the marker', async () => {
	const { root } = await generate( {
		'src-content/about.md': '# :message[Title]{#title qqq="H1."}\n'
	} )
	await rm( join( root, '.banana-content-manifest.json' ) )
	const config = await resolveConfig( BASE_CONFIG, root )
	const result = await run( config )
	assert.equal( result.diagnostics.hasErrors, false, 'marker should still claim the file' )
	assert.equal( result.removed, 1 )
	await rm( root, { recursive: true, force: true } )
} )

test( 'the threshold skips a locale and says so', async () => {
	const { root, result } = await generate( {
		'src-content/about.md': [
			'# :message[Title]{#title qqq="H1."}',
			'',
			':message[Body]{#body qqq="Body."}',
			''
		].join( '\n' ),
		'messages/fr.json': JSON.stringify( { 'content-about-title': 'Titre' } )
	}, { locales: { minTranslatedPercent: 80 } } )

	assert.deepEqual( result.skipped, [ { locale: 'fr', path: 'about.md', percent: 50 } ] )
	assert.equal( ( await readdir( join( root, 'out' ) ) ).includes( 'fr' ), false )
	await rm( root, { recursive: true, force: true } )
} )

test( 'a cross-file shared definition resolves and its file emits nothing', async () => {
	const { root, result } = await generate( {
		'src-content/_shared/common.md':
			':::messages\n:message[Read more on $1]{#content-shared-more qqq="$1 is a site."}\n:::\n',
		'src-content/about.md':
			'::card{text=":message{#content-shared-more p1=\'Meta-Wiki\'}"}\n'
	} )
	assert.equal( result.diagnostics.hasErrors, false )
	assert.match(
		await readFile( join( root, 'out/en/about.md' ), 'utf-8' ),
		/text="Read more on Meta-Wiki"/
	)
	assert.equal( ( await readdir( join( root, 'out/en' ) ) ).includes( '_shared' ), false )
	await rm( root, { recursive: true, force: true } )
} )

test( 'an orphaned translation is warned about, never deleted', async () => {
	const { root, result } = await generate( {
		'src-content/about.md': '# :message[Title]{#title qqq="H1."}\n',
		'messages/fr.json': JSON.stringify( {
			'content-about-title': 'Titre',
			'content-about-renamed-away': 'Orphelin'
		} )
	} )
	assert.match(
		result.diagnostics.warnings.map( ( entry ) => entry.message ).join( '\n' ),
		/orphaned translation/
	)
	const french = JSON.parse( await readFile( join( root, 'messages/fr.json' ), 'utf-8' ) )
	assert.equal( french[ 'content-about-renamed-away' ], 'Orphelin' )
	await rm( root, { recursive: true, force: true } )
} )

test( '--check writes nothing', async () => {
	const { root, result } = await generate(
		{ 'src-content/about.md': '# :message[Title]{#title qqq="H1."}\n' },
		{},
		{ check: true }
	)
	assert.equal( result.diagnostics.hasErrors, false )
	await assert.rejects( () => readFile( join( root, 'messages/en.json' ), 'utf-8' ) )
	await assert.rejects( () => readFile( join( root, 'out/en/about.md' ), 'utf-8' ) )
	await rm( root, { recursive: true, force: true } )
} )

test( 'an error anywhere means nothing is written', async () => {
	const { root, result } = await generate( {
		'src-content/about.md': ':message{#content-nowhere-at-all}\n'
	} )
	assert.equal( result.diagnostics.hasErrors, true )
	await assert.rejects( () => readFile( join( root, 'messages/en.json' ), 'utf-8' ) )
	await rm( root, { recursive: true, force: true } )
} )

test( 'a custom fallback chain is honoured', async () => {
	const { root } = await generate( {
		'src-content/about.md': [
			'# :message[Title]{#title qqq="H1."}',
			'',
			':message[Body]{#body qqq="Body."}',
			''
		].join( '\n' ),
		'messages/es.json': JSON.stringify( {
			'content-about-title': 'Título', 'content-about-body': 'Cuerpo'
		} ),
		'messages/ca.json': JSON.stringify( { 'content-about-title': 'Títol' } )
	}, { locales: { fallback: { ca: [ 'ca', 'es', 'en' ] } } } )

	const catalan = await readFile( join( root, 'out/ca/about.md' ), 'utf-8' )
	assert.match( catalan, /# Títol/ )
	// Missing in Catalan, so it comes from Spanish rather than English.
	assert.match( catalan, /Cuerpo/ )
	await rm( root, { recursive: true, force: true } )
} )
