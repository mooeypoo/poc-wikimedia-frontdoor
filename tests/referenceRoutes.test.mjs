import assert from 'node:assert/strict'
import test from 'node:test'

import {
	REFERENCE_PATH_PREFIX,
	moduleNameToReferenceSlug,
	referencePathForModule,
	referenceSlugToModuleName
} from '../config/referenceRoutes.ts'

test( 'the root module publishes as `general`', () => {
	assert.equal( moduleNameToReferenceSlug( '-' ), 'general' )
	assert.equal( referenceSlugToModuleName( 'general' ), '-' )
} )

test( 'every other module slugs to itself, slashes intact', () => {
	assert.equal( moduleNameToReferenceSlug( 'site/v1' ), 'site/v1' )
	assert.equal( moduleNameToReferenceSlug( 'attribution/v0-beta' ), 'attribution/v0-beta' )
	assert.equal( referenceSlugToModuleName( 'site/v1' ), 'site/v1' )
} )

test( 'slug conversion round-trips both directions', () => {
	const moduleNames = [
		'-',
		'site/v1',
		'readinglists/v0',
		'wikibase/v1',
		'attribution/v0-beta',
		'campaignevents/v0',
		'checkuser/v0',
		'growthexperiments/v0',
		'specs/v0',
		'wikifunctions/v0'
	]

	for ( const moduleName of moduleNames ) {
		assert.equal(
			referenceSlugToModuleName( moduleNameToReferenceSlug( moduleName ) ),
			moduleName,
			`round-trip failed for ${ moduleName }`
		)
	}
} )

test( 'unknown slugs pass through rather than throwing', () => {
	assert.equal( referenceSlugToModuleName( 'not/a/module' ), 'not/a/module' )
	assert.equal( moduleNameToReferenceSlug( 'not/a/module' ), 'not/a/module' )
} )

test( 'no module aliases to another module name', () => {
	// A slug that collides with a real module name would make the reverse lookup
	// ambiguous and silently reroute one module's page to another.
	assert.equal( moduleNameToReferenceSlug( 'general' ), 'general' )
	assert.equal( referenceSlugToModuleName( '-' ), '-' )
} )

test( 'referencePathForModule builds locale-less absolute paths', () => {
	assert.equal( referencePathForModule( 'site/v1' ), '/reference/site/v1' )
	assert.equal( referencePathForModule( '-' ), '/reference/general' )
	assert.equal( REFERENCE_PATH_PREFIX, 'reference' )
} )
