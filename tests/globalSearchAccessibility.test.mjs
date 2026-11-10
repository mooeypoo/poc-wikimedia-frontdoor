import assert from 'node:assert/strict'
import test from 'node:test'

import {
	computeGlobalSearchOptionPosition,
	resolveGlobalSearchAnnouncement,
	resolveGlobalSearchChipArrowIndex,
	resolveGlobalSearchInputKeyAction
} from '../app/utils/globalSearchAccessibility.ts'

test( 'Tab while highlighted clears highlight and never selects', () => {
	const action = resolveGlobalSearchInputKeyAction( {
		key: 'Tab',
		altKey: false,
		isPanelOpen: true,
		hasHighlight: true,
		hasActiveQuery: true
	} )
	assert.deepEqual( action, { type: 'tab', clearHighlight: true } )
} )

test( 'Enter with no highlight is a no-op that prevents default', () => {
	const action = resolveGlobalSearchInputKeyAction( {
		key: 'Enter',
		altKey: false,
		isPanelOpen: true,
		hasHighlight: false,
		hasActiveQuery: true
	} )
	assert.deepEqual( action, { type: 'enter-noop', preventDefault: true } )
} )

test( 'Enter with a highlight delegates to Codex for selection', () => {
	const action = resolveGlobalSearchInputKeyAction( {
		key: 'Enter',
		altKey: false,
		isPanelOpen: true,
		hasHighlight: true,
		hasActiveQuery: true
	} )
	assert.deepEqual( action, { type: 'delegate' } )
} )

test( 'Down Arrow when closed reopens the panel', () => {
	const action = resolveGlobalSearchInputKeyAction( {
		key: 'ArrowDown',
		altKey: false,
		isPanelOpen: false,
		hasHighlight: false,
		hasActiveQuery: true
	} )
	assert.deepEqual( action, { type: 'reopen-panel', clearHighlight: true } )
} )

test( 'Alt+Down when closed also reopens the panel', () => {
	const action = resolveGlobalSearchInputKeyAction( {
		key: 'ArrowDown',
		altKey: true,
		isPanelOpen: false,
		hasHighlight: false,
		hasActiveQuery: true
	} )
	assert.deepEqual( action, { type: 'reopen-panel', clearHighlight: true } )
} )

test( 'Up Arrow when closed passes through for caret movement', () => {
	const action = resolveGlobalSearchInputKeyAction( {
		key: 'ArrowUp',
		altKey: false,
		isPanelOpen: false,
		hasHighlight: false,
		hasActiveQuery: true
	} )
	assert.deepEqual( action, { type: 'pass' } )
} )

test( 'Escape when open closes and clears highlight', () => {
	const action = resolveGlobalSearchInputKeyAction( {
		key: 'Escape',
		altKey: false,
		isPanelOpen: true,
		hasHighlight: true,
		hasActiveQuery: true
	} )
	assert.deepEqual( action, {
		type: 'escape-close',
		clearHighlight: true,
		preventDefault: true
	} )
} )

test( 'Space always passes so the query can accept the character', () => {
	const action = resolveGlobalSearchInputKeyAction( {
		key: ' ',
		altKey: false,
		isPanelOpen: true,
		hasHighlight: true,
		hasActiveQuery: true
	} )
	assert.deepEqual( action, { type: 'pass' } )
} )

test( 'chip arrows wrap and mirror horizontally in RTL', () => {
	assert.equal( resolveGlobalSearchChipArrowIndex( 0, 'ArrowRight', false ), 1 )
	assert.equal( resolveGlobalSearchChipArrowIndex( 2, 'ArrowRight', false ), 0 )
	assert.equal( resolveGlobalSearchChipArrowIndex( 0, 'ArrowLeft', false ), 2 )
	assert.equal( resolveGlobalSearchChipArrowIndex( 0, 'ArrowLeft', true ), 1 )
	assert.equal( resolveGlobalSearchChipArrowIndex( 0, 'ArrowRight', true ), 2 )
	assert.equal( resolveGlobalSearchChipArrowIndex( 1, 'ArrowDown', true ), 2 )
	assert.equal( resolveGlobalSearchChipArrowIndex( 0, 'ArrowUp', false ), 2 )
	assert.equal( resolveGlobalSearchChipArrowIndex( 1, 'Enter', false ), null )
} )

test( 'option posinset is 1-based across the full ordered list', () => {
	const ids = [ 'a', 'b', 'c', 'd' ]
	assert.deepEqual( computeGlobalSearchOptionPosition( 'a', ids ), {
		posinset: 1,
		setsize: 4
	} )
	assert.deepEqual( computeGlobalSearchOptionPosition( 'c', ids ), {
		posinset: 3,
		setsize: 4
	} )
	assert.equal( computeGlobalSearchOptionPosition( 'missing', ids ), null )
} )

test( 'announcement builder covers results, filters, empties, slow search, error', () => {
	assert.equal(
		resolveGlobalSearchAnnouncement( {
			hasActiveQuery: false,
			isSearchInFlight: false,
			hasSearchError: false,
			selectedCategory: 'all',
			allCount: 0,
			endpointCount: 0,
			documentationCount: 0,
			query: 'ab',
			languageName: 'English'
		} ),
		null
	)

	assert.deepEqual(
		resolveGlobalSearchAnnouncement( {
			hasActiveQuery: true,
			isSearchInFlight: false,
			hasSearchError: false,
			selectedCategory: 'all',
			allCount: 5,
			endpointCount: 2,
			documentationCount: 3,
			query: 'category',
			languageName: 'English'
		} ),
		{
			key: 'search-status-results-all',
			params: { $1: '5', $2: '2', $3: '3' },
			role: 'status'
		}
	)

	assert.deepEqual(
		resolveGlobalSearchAnnouncement( {
			hasActiveQuery: true,
			isSearchInFlight: false,
			hasSearchError: false,
			selectedCategory: 'endpoints',
			allCount: 5,
			endpointCount: 2,
			documentationCount: 3,
			query: 'category',
			languageName: 'English'
		} ),
		{
			key: 'search-status-showing-endpoints',
			params: { $1: '2' },
			role: 'status'
		}
	)

	assert.deepEqual(
		resolveGlobalSearchAnnouncement( {
			hasActiveQuery: true,
			isSearchInFlight: false,
			hasSearchError: false,
			selectedCategory: 'documentation',
			allCount: 5,
			endpointCount: 2,
			documentationCount: 3,
			query: 'category',
			languageName: 'English'
		} ),
		{
			key: 'search-status-showing-documentation',
			params: { $1: '3' },
			role: 'status'
		}
	)

	assert.deepEqual(
		resolveGlobalSearchAnnouncement( {
			hasActiveQuery: true,
			isSearchInFlight: false,
			hasSearchError: false,
			selectedCategory: 'all',
			allCount: 0,
			endpointCount: 0,
			documentationCount: 0,
			query: 'zzz',
			languageName: 'Español'
		} ),
		{
			key: 'search-status-no-results',
			params: { $1: 'zzz', $2: 'Español' },
			role: 'status'
		}
	)

	assert.deepEqual(
		resolveGlobalSearchAnnouncement( {
			hasActiveQuery: true,
			isSearchInFlight: false,
			hasSearchError: false,
			selectedCategory: 'endpoints',
			allCount: 0,
			endpointCount: 0,
			documentationCount: 0,
			query: 'zzz',
			languageName: 'English'
		} ),
		{
			key: 'search-status-no-results-endpoints',
			params: { $1: 'zzz' },
			role: 'status'
		}
	)

	assert.deepEqual(
		resolveGlobalSearchAnnouncement( {
			hasActiveQuery: true,
			isSearchInFlight: true,
			hasSearchError: false,
			selectedCategory: 'all',
			allCount: 0,
			endpointCount: 0,
			documentationCount: 0,
			query: 'ca',
			languageName: 'English',
			announceSearching: true
		} ),
		{
			key: 'search-status-searching',
			params: {},
			role: 'status'
		}
	)

	assert.deepEqual(
		resolveGlobalSearchAnnouncement( {
			hasActiveQuery: true,
			isSearchInFlight: false,
			hasSearchError: true,
			selectedCategory: 'all',
			allCount: 0,
			endpointCount: 0,
			documentationCount: 0,
			query: 'ca',
			languageName: 'English'
		} ),
		{
			key: 'search-status-unavailable',
			params: {},
			role: 'alert'
		}
	)

	assert.deepEqual(
		resolveGlobalSearchAnnouncement( {
			hasActiveQuery: true,
			isSearchInFlight: false,
			hasSearchError: false,
			selectedCategory: 'all',
			allCount: 5,
			endpointCount: 2,
			documentationCount: 3,
			query: 'category',
			languageName: 'English',
			moreResultsLoaded: true
		} ),
		{
			key: 'search-status-more-loaded',
			params: {},
			role: 'status'
		}
	)
} )
