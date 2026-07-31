import assert from 'node:assert/strict'
import test from 'node:test'
import {
	formatExplorerModuleSelectSupportingText,
	formatModuleVersionChipLabel,
	resolveExplorerModuleRailHeading
} from '../app/utils/explorerModuleRailHeading.ts'

test( 'formatModuleVersionChipLabel strips beta and internal audience suffixes', () => {
	assert.equal( formatModuleVersionChipLabel( '0.1.0-beta' ), 'v0.1.0' )
	assert.equal( formatModuleVersionChipLabel( '0.1.0-internal' ), 'v0.1.0' )
	assert.equal( formatModuleVersionChipLabel( 'v1.2.3' ), 'v1.2.3' )
} )

test( 'formatExplorerModuleSelectSupportingText is version-only', () => {
	assert.equal( formatExplorerModuleSelectSupportingText( 'v0.1.0' ), 'v0.1.0' )
	assert.equal( formatExplorerModuleSelectSupportingText( undefined ), '' )
	assert.equal( formatExplorerModuleSelectSupportingText( '  ' ), '' )
} )

test( 'resolveExplorerModuleRailHeading flags internal modules from path segments', () => {
	const railHeading = resolveExplorerModuleRailHeading(
		'discord/v0-internal',
		'Discord Preview API',
		'0.1.0-internal'
	)

	assert.equal( railHeading.headingTitle, 'Discord Preview API' )
	assert.equal( railHeading.showInternalChip, true )
	assert.equal( railHeading.showBetaChip, false )
	assert.equal( railHeading.versionChipLabel, 'v0.1.0' )
} )

test( 'resolveExplorerModuleRailHeading flags beta from title marker', () => {
	const railHeading = resolveExplorerModuleRailHeading(
		'attribution/v0-beta',
		'Attribution API (Beta)',
		'0.1.0-beta'
	)

	assert.equal( railHeading.headingTitle, 'Attribution API' )
	assert.equal( railHeading.showBetaChip, true )
	assert.equal( railHeading.showInternalChip, false )
	assert.equal( railHeading.versionChipLabel, 'v0.1.0' )
} )
