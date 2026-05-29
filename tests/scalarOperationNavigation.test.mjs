import assert from 'node:assert/strict'
import test from 'node:test'
import {
	buildScalarOperationNavigationIdCandidates,
	findOperationNavigationIdInEntries,
	findOperationNavigationIdInSidebarItems,
	resolveScalarDocumentId,
	resolveScalarOperationNavigationId,
	slugScalarNavigationSegment
} from '../app/utils/scalarOperationNavigation.ts'

test( 'slugScalarNavigationSegment matches Scalar document slugging', () => {
	assert.equal( slugScalarNavigationSegment( 'Front Door API Explorer' ), 'front-door-api-explorer' )
	assert.equal( slugScalarNavigationSegment( 'Page content' ), 'page-content' )
} )

test( 'resolveScalarDocumentId keeps configured slug segments', () => {
	assert.equal( resolveScalarDocumentId( 'front-door-api-explorer' ), 'front-door-api-explorer' )
} )

test( 'findOperationNavigationIdInSidebarItems searches document children', () => {
	const navigationId = findOperationNavigationIdInSidebarItems(
		[
			{
				id: 'front-door-api-explorer',
				type: 'document',
				children: [
					{
						type: 'operation',
						id: 'front-door-api-explorer/GET/v1/page/{title}',
						method: 'GET',
						path: '/v1/page/{title}'
					}
				]
			}
		],
		'front-door-api-explorer',
		'GET',
		'/v1/page/{title}'
	)

	assert.equal( navigationId, 'front-door-api-explorer/GET/v1/page/{title}' )
} )

test( 'findOperationNavigationIdInEntries matches method and path', () => {
	const navigationId = findOperationNavigationIdInEntries(
		[
			{
				type: 'tag',
				children: [
					{
						type: 'operation',
						id: 'front-door-api-explorer/tag/page-content/GET/pages/{title}/signals',
						method: 'GET',
						path: '/pages/{title}/signals'
					}
				]
			}
		],
		'GET',
		'/pages/{title}/signals'
	)

	assert.equal( navigationId, 'front-door-api-explorer/tag/page-content/GET/pages/{title}/signals' )
} )

test( 'buildScalarOperationNavigationIdCandidates prefers tagged ids', () => {
	const candidates = buildScalarOperationNavigationIdCandidates( {
		documentSlug: 'front-door-api-explorer',
		method: 'get',
		path: '/v1/page/{title}',
		primaryTag: 'Page content'
	} )

	assert.deepEqual( candidates, [
		'front-door-api-explorer/tag/page-content/GET/v1/page/{title}',
		'front-door-api-explorer/GET/v1/page/{title}'
	] )
} )

/**
 * @param {Array<{ id: string }>} elements
 * @returns {ParentNode}
 */
function createMockSearchRoot( elements ) {
	return {
		querySelector( selector ) {
			const match = selector.match( /\[id="(.+)"\]/ )
			if ( !match ) {
				return null
			}

			return elements.find( ( element ) => element.id === match[ 1 ] ) ?? null
		},
		querySelectorAll( selector ) {
			if ( selector === '[id]' ) {
				return elements
			}

			return []
		}
	}
}

test( 'resolveScalarOperationNavigationId matches suffix ids in the shell', () => {
	const shell = createMockSearchRoot( [
		{ id: 'front-door-api-explorer/tag/page-content/GET/v1/page/{title}' },
		{ id: 'front-door-api-explorer/GET/v1/page/{title}' }
	] )

	const resolvedId = resolveScalarOperationNavigationId( shell, {
		documentSlug: 'front-door-api-explorer',
		method: 'GET',
		path: '/v1/page/{title}',
		primaryTag: 'Page content'
	} )

	assert.equal( resolvedId, 'front-door-api-explorer/tag/page-content/GET/v1/page/{title}' )
} )

test( 'resolveScalarOperationNavigationId avoids substring path collisions', () => {
	const shell = createMockSearchRoot( [
		{ id: 'front-door-api-explorer/GET/v1/page/{title}' },
		{ id: 'front-door-api-explorer/GET/v1/page/{title}/links' }
	] )

	const resolvedId = resolveScalarOperationNavigationId( shell, {
		documentSlug: 'front-door-api-explorer',
		method: 'GET',
		path: '/v1/page/{title}/links'
	} )

	assert.equal( resolvedId, 'front-door-api-explorer/GET/v1/page/{title}/links' )
} )
