import assert from 'node:assert/strict'
import test from 'node:test'
import {
	collectOnThisPageHeadings,
	flattenOnThisPageHeadings
} from '../app/utils/collectOnThisPageHeadings.ts'
import {
	ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX,
	ON_THIS_PAGE_NAV_HEADER_MAX_VIEWPORT_PX,
	ON_THIS_PAGE_NAV_MIN_H2_COUNT
} from '../config/onThisPageNav.ts'

/**
 * Minimal heading element stand-in for {@link collectOnThisPageHeadings}.
 *
 * @param {'h2' | 'h3'} tagName
 * @param {string} id
 * @param {string} label
 * @param {{ className?: string, text?: string }[]} [removableChildren]
 * @returns {HTMLElement}
 */
function fakeHeading( tagName, id, label, removableChildren = [] ) {
	return {
		id,
		tagName: tagName.toUpperCase(),
		cloneNode() {
			const removable = removableChildren.map( ( child ) => ( {
				className: child.className ?? '',
				textContent: child.text ?? '',
				remove() {
					this._removed = true
				},
				_removed: false
			} ) )

			return {
				querySelectorAll( selector ) {
					return removable.filter( ( child ) => {
						if ( child._removed ) {
							return false
						}

						if ( selector === '.prose-heading__anchor' ) {
							return child.className.includes( 'prose-heading__anchor' )
						}

						if ( selector === '.cdx-info-chip' ) {
							return child.className.includes( 'cdx-info-chip' )
						}

						return false
					} )
				},
				get textContent() {
					const extras = removable
						.filter( ( child ) => !child._removed )
						.map( ( child ) => child.textContent )
						.join( '' )
					return `${ label }${ extras }`
				}
			}
		}
	}
}

/**
 * @param {ReturnType<typeof fakeHeading>[]} headings
 * @returns {Element}
 */
function fakeContentRoot( headings ) {
	return {
		querySelectorAll( selector ) {
			if ( selector !== 'h2[id], h3[id]' ) {
				return []
			}

			return headings
		}
	}
}

test( 'on-this-page config thresholds match product decisions', () => {
	assert.equal( ON_THIS_PAGE_NAV_MIN_H2_COUNT, 3 )
	assert.equal( ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX, 1280 )
	assert.equal(
		ON_THIS_PAGE_NAV_HEADER_MAX_VIEWPORT_PX,
		ON_THIS_PAGE_NAV_END_PANEL_MIN_VIEWPORT_PX - 1
	)
} )

test( 'collectOnThisPageHeadings nests h3 under preceding h2', () => {
	const sections = collectOnThisPageHeadings( fakeContentRoot( [
		fakeHeading( 'h2', 'one', 'One' ),
		fakeHeading( 'h3', 'one-a', 'One A' ),
		fakeHeading( 'h3', 'one-b', 'One B' ),
		fakeHeading( 'h2', 'two', 'Two' ),
		fakeHeading( 'h3', 'two-a', 'Two A' )
	] ) )

	assert.equal( sections.length, 2 )
	assert.deepEqual(
		sections.map( ( section ) => ( {
			id: section.id,
			children: section.children.map( ( child ) => child.id )
		} ) ),
		[
			{ id: 'one', children: [ 'one-a', 'one-b' ] },
			{ id: 'two', children: [ 'two-a' ] }
		]
	)
} )

test( 'collectOnThisPageHeadings ignores orphan h3 before the first h2', () => {
	const sections = collectOnThisPageHeadings( fakeContentRoot( [
		fakeHeading( 'h3', 'orphan', 'Orphan' ),
		fakeHeading( 'h2', 'one', 'One' ),
		fakeHeading( 'h3', 'one-a', 'One A' )
	] ) )

	assert.equal( sections.length, 1 )
	assert.equal( sections[ 0 ]?.id, 'one' )
	assert.deepEqual( sections[ 0 ]?.children.map( ( child ) => child.id ), [ 'one-a' ] )
} )

test( 'collectOnThisPageHeadings skips headings without labels', () => {
	const sections = collectOnThisPageHeadings( fakeContentRoot( [
		fakeHeading( 'h2', 'empty', '   ' ),
		fakeHeading( 'h2', 'kept', 'Kept' )
	] ) )

	assert.equal( sections.length, 1 )
	assert.equal( sections[ 0 ]?.id, 'kept' )
} )

test( 'collectOnThisPageHeadings strips permalink anchors and chips from labels', () => {
	const [ section ] = collectOnThisPageHeadings( fakeContentRoot( [
		fakeHeading( 'h2', 'auth', 'Authentication', [
			{ className: 'prose-heading__anchor', text: '#' },
			{ className: 'cdx-info-chip', text: 'Recommended' }
		] )
	] ) )

	assert.equal( section?.label, 'Authentication' )
} )

test( 'collectOnThisPageHeadings returns empty for missing root', () => {
	assert.deepEqual( collectOnThisPageHeadings( null ), [] )
	assert.deepEqual( collectOnThisPageHeadings( undefined ), [] )
} )

test( 'flattenOnThisPageHeadings is document order', () => {
	const flat = flattenOnThisPageHeadings( [
		{
			id: 'a',
			label: 'A',
			level: 2,
			children: [ { id: 'a1', label: 'A1', level: 3, children: [] } ]
		},
		{ id: 'b', label: 'B', level: 2, children: [] }
	] )

	assert.deepEqual( flat.map( ( heading ) => heading.id ), [ 'a', 'a1', 'b' ] )
} )
