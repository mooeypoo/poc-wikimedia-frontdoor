import assert from 'node:assert/strict'
import test from 'node:test'
import { nextTick, reactive, ref } from 'vue'
import { useOverlayDismissal } from '../app/composables/useOverlayDismissal.ts'
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
