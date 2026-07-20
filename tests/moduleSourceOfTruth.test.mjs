import assert from 'node:assert/strict'
import test from 'node:test'
// The generated files are self-contained (no relative imports), so node --test
// can load them directly. The config/moduleSourceOfTruth.ts accessor uses the
// app's extensionless imports and is exercised by the app build, not here.
import { GENERATED_WIKI_INSTANCES } from '../config/generated/wikiInstances.generated.ts'
import { GENERATED_MODULES } from '../config/generated/modules.generated.ts'

test( 'every module instance id is a valid foreign key into the fleet registry', () => {
	const instanceIds = new Set( GENERATED_WIKI_INSTANCES.map( ( instance ) => instance.id ) )
	for ( const wikiModule of GENERATED_MODULES ) {
		for ( const instanceId of wikiModule.instances ) {
			assert.ok(
				instanceIds.has( instanceId ),
				`module ${ wikiModule.name } references unknown instance ${ instanceId }`
			)
		}
	}
} )

test( 'instance ids and module names are unique', () => {
	const instanceIds = GENERATED_WIKI_INSTANCES.map( ( instance ) => instance.id )
	assert.equal( new Set( instanceIds ).size, instanceIds.length )
	const moduleNames = GENERATED_MODULES.map( ( wikiModule ) => wikiModule.name )
	assert.equal( new Set( moduleNames ).size, moduleNames.length )
} )

test( 'registries and instance lists are sorted deterministically', () => {
	const instanceIds = GENERATED_WIKI_INSTANCES.map( ( instance ) => instance.id )
	assert.deepEqual( instanceIds, [ ...instanceIds ].sort( ( a, b ) => a.localeCompare( b ) ) )

	const moduleNames = GENERATED_MODULES.map( ( wikiModule ) => wikiModule.name )
	assert.deepEqual( moduleNames, [ ...moduleNames ].sort( ( a, b ) => a.localeCompare( b ) ) )

	for ( const wikiModule of GENERATED_MODULES ) {
		assert.deepEqual(
			wikiModule.instances,
			[ ...wikiModule.instances ].sort( ( a, b ) => a.localeCompare( b ) ),
			`module ${ wikiModule.name } instance list is not sorted`
		)
	}
} )

test( 'every module carries a spec pointer and its representative instance', () => {
	for ( const wikiModule of GENERATED_MODULES ) {
		assert.ok( wikiModule.specFile, `module ${ wikiModule.name } has no specFile` )
		assert.ok( wikiModule.specUrl, `module ${ wikiModule.name } has no specUrl` )
		assert.ok(
			wikiModule.instances.includes( wikiModule.specSourceInstance ),
			`module ${ wikiModule.name } spec source ${ wikiModule.specSourceInstance } is not in its instance list`
		)
	}
} )
