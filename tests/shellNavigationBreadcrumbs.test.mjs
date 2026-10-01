import assert from 'node:assert/strict'
import test from 'node:test'
import { resolvePrimaryNavigationBreadcrumbLabel } from '../app/utils/shellNavigationBreadcrumb.ts'

const MAIN_NAVIGATION_LINKS = [
	{ id: 'get-started', label: 'Get started' },
	{ id: 'apis', label: 'APIs' }
]

test( 'collapsed breadcrumb resolves the active primary navigation label', () => {
	assert.equal(
		resolvePrimaryNavigationBreadcrumbLabel( MAIN_NAVIGATION_LINKS, 'apis' ),
		'APIs'
	)
} )

test( 'collapsed breadcrumb stays empty when no primary navigation item is active', () => {
	assert.equal(
		resolvePrimaryNavigationBreadcrumbLabel( MAIN_NAVIGATION_LINKS, '' ),
		''
	)
} )
