import assert from 'node:assert/strict'
import test from 'node:test'

import {
	focusNavigationTarget,
	resolveNavigationFocusTarget
} from '../app/utils/focusNavigationTarget.ts'

/**
 * Installs a minimal `document` stub for the focus helpers (no jsdom dependency).
 *
 * @param {{ byId?: Record<string, object>, querySelector?: object | null }} options
 * @returns {() => void} Restores the previous `document` binding.
 */
function installDocumentStub( options ) {
	const previousDocument = globalThis.document
	globalThis.document = {
		getElementById( id ) {
			return options.byId?.[ id ] ?? null
		},
		querySelector() {
			return options.querySelector ?? null
		}
	}
	return () => {
		globalThis.document = previousDocument
	}
}

test( 'resolveNavigationFocusTarget prefers a hash heading over the page title', () => {
	const section = { id: 'section-a' }
	const pageTitle = { id: 'page-title' }
	const restore = installDocumentStub( {
		byId: { 'section-a': section },
		querySelector: pageTitle
	} )

	try {
		assert.equal( resolveNavigationFocusTarget( 'section-a' ), section )
	} finally {
		restore()
	}
} )

test( 'resolveNavigationFocusTarget falls back to the content page h1', () => {
	const pageTitle = { id: 'page-title' }
	const restore = installDocumentStub( {
		byId: {},
		querySelector: pageTitle
	} )

	try {
		assert.equal( resolveNavigationFocusTarget( null ), pageTitle )
		assert.equal( resolveNavigationFocusTarget( 'missing' ), pageTitle )
	} finally {
		restore()
	}
} )

test( 'focusNavigationTarget sets tabindex=-1 and calls focus', () => {
	let focused = false
	const attributes = new Map()
	const target = {
		hasAttribute( name ) {
			return attributes.has( name )
		},
		setAttribute( name, value ) {
			attributes.set( name, value )
		},
		getAttribute( name ) {
			return attributes.get( name ) ?? null
		},
		focus() {
			focused = true
		}
	}

	focusNavigationTarget( /** @type {HTMLElement} */ ( target ) )
	assert.equal( target.getAttribute( 'tabindex' ), '-1' )
	assert.equal( focused, true )
} )
