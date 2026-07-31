import assert from 'node:assert/strict'
import test from 'node:test'
import {
	DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS,
	isExplorerBetaOptInModule,
	isExplorerInternalOptInModule
} from '../config/explorerOptIn.ts'
import {
	filterExplorerBootstrapModulesByOptIn,
	resolveFirstExplorerRailModule
} from '../app/utils/explorerModuleOptInFilter.ts'

test( 'isExplorerInternalOptInModule matches MediaWiki *-internal path segments', () => {
	assert.equal( isExplorerInternalOptInModule( 'discord/v0-internal' ), true )
	assert.equal( isExplorerInternalOptInModule( 'mymodule/v1-internal' ), true )
	assert.equal( isExplorerInternalOptInModule( 'site/v1' ), false )
	assert.equal( isExplorerInternalOptInModule( 'attribution/v0-beta' ), false )
} )

test( 'isExplorerBetaOptInModule matches configured attribution prefix', () => {
	assert.equal( isExplorerBetaOptInModule( 'attribution/v0-beta' ), true )
	assert.equal( isExplorerBetaOptInModule( 'discord/v0-internal' ), false )
} )

test( 'default opt-in filter keeps beta modules and hides internal modules', () => {
	const modules = [
		{ name: 'attribution/v0-beta', hasSpecError: false },
		{ name: 'discord/v0-internal', hasSpecError: false },
		{ name: 'site/v1', hasSpecError: false }
	]

	const visibleNames = filterExplorerBootstrapModulesByOptIn(
		modules,
		DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS
	).map( ( moduleItem ) => moduleItem.name )

	assert.deepEqual( visibleNames, [ 'attribution/v0-beta', 'site/v1' ] )
} )

test( 'internal opt-in reveals Discord Preview and other *-internal modules', () => {
	const modules = [
		{ name: 'discord/v0-internal', hasSpecError: false },
		{ name: 'site/v1', hasSpecError: false }
	]

	const visibleNames = filterExplorerBootstrapModulesByOptIn( modules, {
		includeBetaEndpoints: true,
		includeInternalEndpoints: true
	} ).map( ( moduleItem ) => moduleItem.name )

	assert.deepEqual( visibleNames, [ 'discord/v0-internal', 'site/v1' ] )
} )

test( 'resolveFirstExplorerRailModule skips internal modules under default opt-in', () => {
	const modules = [
		{ name: 'discord/v0-internal', hasSpecError: false },
		{ name: 'site/v1', hasSpecError: false }
	]

	const firstModule = resolveFirstExplorerRailModule(
		modules,
		DEFAULT_EXPLORER_OPT_IN_FILTER_OPTIONS
	)

	assert.equal( firstModule?.name, 'site/v1' )
} )
