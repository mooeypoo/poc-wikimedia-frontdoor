import assert from 'node:assert/strict'
import test from 'node:test'

import {
	mapDocumentationSearchItems,
	orderGlobalSearchPanelItems,
	sliceVisibleSearchTiers,
	splitEnglishFallbackTier,
	toCodexMenuEntries,
	toCodexMenuItem
} from '../app/utils/globalSearchPanel.ts'

/**
 * @param {Partial<import('../app/utils/globalSearchPanel.ts').GlobalSearchPanelItem>} overrides
 * @returns {import('../app/utils/globalSearchPanel.ts').GlobalSearchPanelItem}
 */
function panelItem( overrides ) {
	return {
		id: 'doc:/en/x',
		kind: 'documentation',
		url: '/x',
		label: 'X',
		method: null,
		description: '',
		score: 1,
		resultLocale: 'en',
		resultDir: 'ltr',
		isEnglishFallback: false,
		...overrides
	}
}

test( 'mapDocumentationSearchItems flags English rows when the UI locale is not en', () => {
	const items = mapDocumentationSearchItems(
		[
			{
				locale: 'fr',
				dir: 'ltr',
				results: [ { id: '/fr/index', title: 'Accueil', content: 'bonjour', rank: -1 } ]
			},
			{
				locale: 'en',
				dir: 'ltr',
				results: [ { id: '/en/get-started', title: 'Get started', content: 'hello', rank: -2 } ]
			}
		],
		'fr'
	)

	assert.equal( items.length, 2 )
	assert.equal( items[ 0 ].isEnglishFallback, false )
	assert.equal( items[ 0 ].resultLocale, 'fr' )
	assert.equal( items[ 1 ].isEnglishFallback, true )
	assert.equal( items[ 1 ].resultLocale, 'en' )
} )

test( 'mapDocumentationSearchItems does not flag English when the UI locale is en', () => {
	const items = mapDocumentationSearchItems(
		[
			{
				locale: 'en',
				dir: 'ltr',
				results: [ { id: '/en/get-started', title: 'Get started', content: 'hello', rank: -2 } ]
			}
		],
		'en'
	)

	assert.equal( items.length, 1 )
	assert.equal( items[ 0 ].isEnglishFallback, false )
} )

test( 'All ordering keeps English fallback docs after the relevance-mixed primary tier', () => {
	const docs = [
		panelItem( {
			id: 'doc:/fr/a',
			label: 'FR',
			resultLocale: 'fr',
			isEnglishFallback: false,
			score: 10
		} ),
		panelItem( {
			id: 'doc:/en/b',
			label: 'EN',
			isEnglishFallback: true,
			score: 100
		} )
	]
	const endpoints = [
		panelItem( {
			id: 'endpoint:/explorer/x',
			kind: 'endpoint',
			method: 'GET',
			label: 'Endpoint',
			score: 5,
			resultLocale: null,
			isEnglishFallback: false
		} )
	]

	const ordered = orderGlobalSearchPanelItems( docs, endpoints, 'all' )
	assert.deepEqual(
		ordered.map( ( item ) => item.id ),
		[ 'doc:/fr/a', 'endpoint:/explorer/x', 'doc:/en/b' ]
	)
} )

test( 'sliceVisibleSearchTiers reserves an English row so the divider is never buried', () => {
	const primary = Array.from( { length: 12 }, ( _, index ) =>
		panelItem( {
			id: `endpoint:${ index }`,
			kind: 'endpoint',
			method: 'GET',
			label: `E${ index }`,
			isEnglishFallback: false
		} )
	)
	const english = [
		panelItem( { id: 'doc:/en/only', label: 'English only', isEnglishFallback: true } )
	]

	const firstWindow = sliceVisibleSearchTiers( primary, english, 7 )
	assert.equal( firstWindow.visiblePrimaryItems.length, 6 )
	assert.equal( firstWindow.visibleEnglishFallbackItems.length, 1 )
	assert.equal( firstWindow.showEnglishFallbackDivider, true )

	const expanded = sliceVisibleSearchTiers( primary, english, 14 )
	assert.equal( expanded.visiblePrimaryItems.length, 12 )
	assert.equal( expanded.visibleEnglishFallbackItems.length, 1 )
	assert.equal( expanded.showEnglishFallbackDivider, true )
} )

test( 'sliceVisibleSearchTiers shows the divider when primary is empty', () => {
	const english = [
		panelItem( { id: 'doc:/en/only', label: 'English only', isEnglishFallback: true } )
	]
	const window = sliceVisibleSearchTiers( [], english, 7 )
	assert.equal( window.visiblePrimaryItems.length, 0 )
	assert.equal( window.visibleEnglishFallbackItems.length, 1 )
	assert.equal( window.showEnglishFallbackDivider, true )
} )

test( 'splitEnglishFallbackTier separates flagged rows', () => {
	const items = [
		panelItem( { id: 'a', isEnglishFallback: false } ),
		panelItem( { id: 'b', isEnglishFallback: true } )
	]
	const { primaryItems, englishFallbackItems } = splitEnglishFallbackTier( items )
	assert.deepEqual( primaryItems.map( ( item ) => item.id ), [ 'a' ] )
	assert.deepEqual( englishFallbackItems.map( ( item ) => item.id ), [ 'b' ] )
} )

test( 'toCodexMenuItem maps endpoints with method supportingText and omits url', () => {
	const menuItem = toCodexMenuItem( panelItem( {
		id: 'endpoint:x',
		kind: 'endpoint',
		method: 'GET',
		label: 'Get page',
		description: 'Site API · snippet'
	} ) )
	assert.equal( menuItem.value, 'endpoint:x' )
	assert.equal( menuItem.label, 'Get page' )
	assert.equal( menuItem.supportingText, 'GET' )
	assert.equal( menuItem.description, 'Site API · snippet' )
	assert.equal( 'url' in menuItem && menuItem.url !== undefined, false )
} )

test( 'toCodexMenuEntries puts English rows in a labeled Menu group', () => {
	const entries = toCodexMenuEntries(
		[ panelItem( { id: 'doc:/fr/a', label: 'FR', isEnglishFallback: false } ) ],
		[ panelItem( { id: 'doc:/en/b', label: 'EN', isEnglishFallback: true } ) ],
		'Results in English',
		true
	)
	assert.equal( entries.length, 2 )
	assert.equal( entries[ 0 ].value, 'doc:/fr/a' )
	assert.ok( 'items' in entries[ 1 ] )
	assert.equal( entries[ 1 ].label, 'Results in English' )
	assert.equal( entries[ 1 ].items[ 0 ].value, 'doc:/en/b' )
} )
