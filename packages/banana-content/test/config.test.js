/**
 * Config resolution: defaults, module specifiers, and validation.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadConfig, resolveConfig } from '../src/node/config.js'

const MINIMAL = {
	source: { dir: 'src' },
	messages: { dir: 'messages' },
	output: { dir: 'out' }
}

test( 'defaults fill in everything a config leaves unset', async () => {
	const config = await resolveConfig( MINIMAL, '/project' )
	assert.equal( config.format.name, 'markdown' )
	assert.equal( config.messages.sourceLocale, 'en' )
	assert.equal( config.messages.documentationLocale, 'qqq' )
	assert.equal( config.output.path, '%locale%/%path%' )
	assert.equal( config.keys.prefix, 'content-' )
	assert.equal( config.marker.name, 'message' )
	assert.equal( config.ownership.marker, 'i18nGenerated' )
} )

test( 'directories are absolute, but the source dir is also kept as written', async () => {
	// The relative form is what appears in generated files; an absolute path
	// there would differ per machine and break reproducibility.
	const config = await resolveConfig( MINIMAL, '/project' )
	assert.equal( config.source.dir, '/project/src' )
	assert.equal( config.source.relativeDir, 'src' )
} )

test( 'a "./"-prefixed source dir is normalised for the relative form', async () => {
	const config = await resolveConfig(
		{ ...MINIMAL, source: { dir: './content-i18n/' } }, '/project'
	)
	assert.equal( config.source.relativeDir, 'content-i18n' )
} )

test( 'a string key pattern is compiled', async () => {
	const config = await resolveConfig(
		{ ...MINIMAL, keys: { pattern: '^x-[a-z]+$' } }, '/project'
	)
	assert.ok( config.keys.pattern instanceof RegExp )
	assert.equal( config.keys.pattern.test( 'x-abc' ), true )
} )

test( 'a missing required directory is rejected', async () => {
	await assert.rejects(
		() => resolveConfig( { messages: { dir: 'm' }, output: { dir: 'o' } }, '/project' ),
		/"source.dir" is required/
	)
} )

test( 'an invalid marker name is rejected', async () => {
	await assert.rejects(
		() => resolveConfig( { ...MINIMAL, marker: { name: 'Message' } }, '/project' ),
		/must match/
	)
} )

test( 'a built-in format is resolved by name', async () => {
	const config = await resolveConfig( { ...MINIMAL, format: 'plainText' }, '/project' )
	assert.equal( config.format.name, 'plainText' )
	assert.equal( config.format.envelope, null )
} )

test( 'fallback defaults to a two-step chain to the source locale', async () => {
	const config = await resolveConfig( MINIMAL, '/project' )
	assert.deepEqual( config.locales.fallback( 'fr' ), [ 'fr', 'en' ] )
} )

test( 'a fallback map is honoured, with a default for locales it omits', async () => {
	const config = await resolveConfig(
		{ ...MINIMAL, locales: { fallback: { ca: [ 'ca', 'es', 'en' ] } } }, '/project'
	)
	assert.deepEqual( config.locales.fallback( 'ca' ), [ 'ca', 'es', 'en' ] )
	assert.deepEqual( config.locales.fallback( 'fr' ), [ 'fr', 'en' ] )
} )

test( 'a JSON config resolves module specifiers relative to itself', async () => {
	const root = await mkdtemp( join( tmpdir(), 'banana-config-' ) )
	await mkdir( join( root, 'tools' ), { recursive: true } )
	await writeFile(
		join( root, 'tools', 'fallbacks.mjs' ),
		'export default ( locale ) => [ locale, "de", "en" ]\n',
		'utf-8'
	)
	await writeFile(
		join( root, 'banana-content.config.json' ),
		JSON.stringify( {
			$schema: './schema.json',
			...MINIMAL,
			locales: { fallback: './tools/fallbacks.mjs' }
		} ),
		'utf-8'
	)

	const { raw, configDir } = await loadConfig( { cwd: root } )
	assert.equal( raw.$schema, undefined, '$schema should be stripped, not passed through' )
	const config = await resolveConfig( raw, configDir )
	assert.deepEqual( config.locales.fallback( 'ch' ), [ 'ch', 'de', 'en' ] )
	await rm( root, { recursive: true, force: true } )
} )

test( 'a missing config is an explicit error, not a silent default', async () => {
	const root = await mkdtemp( join( tmpdir(), 'banana-config-' ) )
	await assert.rejects( () => loadConfig( { cwd: root } ), /No configuration found/ )
	await rm( root, { recursive: true, force: true } )
} )

test( 'package.json is the last resort', async () => {
	const root = await mkdtemp( join( tmpdir(), 'banana-config-' ) )
	await writeFile(
		join( root, 'package.json' ),
		JSON.stringify( { name: 'x', bananaContent: MINIMAL } ),
		'utf-8'
	)
	const { raw } = await loadConfig( { cwd: root } )
	assert.equal( raw.source.dir, 'src' )
	await rm( root, { recursive: true, force: true } )
} )
