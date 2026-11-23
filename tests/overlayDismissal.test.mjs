import assert from 'node:assert/strict'
import test from 'node:test'
import { nextTick, reactive, ref } from 'vue'
import { useOverlayDismissal } from '../app/composables/useOverlayDismissal.ts'
import { useShellCollapsedNavMenu } from '../app/composables/useShellCollapsedNavMenu.ts'
import { useShellCollapsedSearchOverlay } from '../app/composables/useShellCollapsedSearchOverlay.ts'

// Vue's onMounted / onUnmounted no-op with a console warning when called
// outside a component instance, which both composables under test do
// unconditionally. The keydown listener they would otherwise attach is a DOM
// concern out of scope here; only the open/close and watch behaviour is
// under test.

/**
 * A reactive stand-in for the injected `route` option.
 *
 * @returns {{ fullPath: string }}
 */
function fakeRoute() {
	return reactive( { fullPath: '/apis' } )
}

test( 'useOverlayDismissal open() and close() toggle isOpen; close() always runs onClose', () => {
	let onCloseCallCount = 0
	const { isOpen, open, close } = useOverlayDismissal( {
		isCollapsed: ref( true ),
		onClose: () => {
			onCloseCallCount += 1
		},
		route: fakeRoute()
	} )

	assert.equal( isOpen.value, false )

	open()
	assert.equal( isOpen.value, true )
	assert.equal( onCloseCallCount, 0 )

	close()
	assert.equal( isOpen.value, false )
	assert.equal( onCloseCallCount, 1 )
} )

test( 'useOverlayDismissal closes when isCollapsed becomes false, not when it becomes true', async () => {
	const isCollapsed = ref( false )
	const { isOpen, open } = useOverlayDismissal( { isCollapsed, route: fakeRoute() } )

	open()
	isCollapsed.value = true
	await nextTick()
	assert.equal( isOpen.value, true, 'becoming collapsed leaves the overlay open' )

	isCollapsed.value = false
	await nextTick()
	assert.equal( isOpen.value, false, 'uncollapsing closes the overlay' )
} )

test( 'useOverlayDismissal closes on route change', async () => {
	const route = fakeRoute()
	const { isOpen, open } = useOverlayDismissal( { isCollapsed: ref( true ), route } )

	open()
	route.fullPath = '/explorer'
	await nextTick()

	assert.equal( isOpen.value, false )
} )

test( 'useShellCollapsedSearchOverlay exposes the same dismissal rules under its own names', async () => {
	const isUtilityCollapsed = ref( true )
	const route = fakeRoute()
	const {
		isCollapsedSearchOverlayOpen,
		openCollapsedSearchOverlay,
		closeCollapsedSearchOverlay
	} = useShellCollapsedSearchOverlay( { isUtilityCollapsed, route } )

	openCollapsedSearchOverlay()
	assert.equal( isCollapsedSearchOverlayOpen.value, true )

	closeCollapsedSearchOverlay()
	assert.equal( isCollapsedSearchOverlayOpen.value, false )

	openCollapsedSearchOverlay()
	isUtilityCollapsed.value = false
	await nextTick()
	assert.equal( isCollapsedSearchOverlayOpen.value, false, 'uncollapsing the utility row closes it' )

	openCollapsedSearchOverlay()
	route.fullPath = '/explorer'
	await nextTick()
	assert.equal(
		isCollapsedSearchOverlayOpen.value,
		false,
		'route change forwarded to the shared composable closes it'
	)
} )

test( 'useShellCollapsedNavMenu opens to section or primary view based on hasSectionNavigation', () => {
	const hasSectionNavigation = ref( true )
	const { collapsedNavMenuView, openCollapsedNavMenu, closeCollapsedNavMenu } = useShellCollapsedNavMenu( {
		isNavigationCollapsed: ref( true ),
		hasSectionNavigation,
		route: fakeRoute()
	} )

	openCollapsedNavMenu()
	assert.equal( collapsedNavMenuView.value, 'section' )

	closeCollapsedNavMenu()
	hasSectionNavigation.value = false
	openCollapsedNavMenu()
	assert.equal( collapsedNavMenuView.value, 'primary' )
} )

test( 'useShellCollapsedNavMenu toggle opens when closed and closes when open', () => {
	const { isCollapsedNavMenuOpen, toggleCollapsedNavMenu } = useShellCollapsedNavMenu( {
		isNavigationCollapsed: ref( true ),
		hasSectionNavigation: ref( true ),
		route: fakeRoute()
	} )

	toggleCollapsedNavMenu()
	assert.equal( isCollapsedNavMenuOpen.value, true )

	toggleCollapsedNavMenu()
	assert.equal( isCollapsedNavMenuOpen.value, false )
} )

test( 'useShellCollapsedNavMenu resets to section view on explicit close, route change, and uncollapse', async () => {
	const isNavigationCollapsed = ref( true )
	const route = fakeRoute()
	const {
		collapsedNavMenuView,
		openCollapsedNavMenu,
		closeCollapsedNavMenu,
		showCollapsedNavMenuPrimaryView
	} = useShellCollapsedNavMenu( {
		isNavigationCollapsed,
		hasSectionNavigation: ref( true ),
		route
	} )

	openCollapsedNavMenu()
	showCollapsedNavMenuPrimaryView()
	closeCollapsedNavMenu()
	assert.equal( collapsedNavMenuView.value, 'section', 'explicit close resets the view' )

	openCollapsedNavMenu()
	showCollapsedNavMenuPrimaryView()
	route.fullPath = '/explorer'
	await nextTick()
	assert.equal( collapsedNavMenuView.value, 'section', 'a route change resets the view too' )

	openCollapsedNavMenu()
	showCollapsedNavMenuPrimaryView()
	isNavigationCollapsed.value = false
	await nextTick()
	assert.equal( collapsedNavMenuView.value, 'section', 'uncollapsing the nav resets the view too' )
} )
