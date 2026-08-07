import { createApp, h, onBeforeUnmount, reactive, watch, type App, type Ref } from 'vue'
import { getWikiInstanceById } from '../../config/instances'
import { getTestWikiDisplayNameMessageKey } from '../../config/wikiInstanceTestWikis'
import {
	SCALAR_CLIENT_WRITE_ENDPOINT_WARNINGS_ENABLED,
	SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE
} from '../../config/scalarClientWriteWarnings'
import ScalarClientWriteEndpointWarning from '../components/explorer/scalar/ScalarClientWriteEndpointWarning.vue'
import type { ScalarInterfaceHandle } from './useExplorerScalarFocus'
import { activeExplorerWikiInstanceId } from '../utils/explorerWikiInstanceContext'
import { createScalarWriteEndpointWarningElement } from '../utils/createScalarWriteEndpointWarningElement'
import { findOpenScalarClientModal } from '../utils/findOpenScalarClientModal'
import {
	isActiveAddressBarServerTestWiki,
	isTestWikiSelectableInAddressBar
} from '../utils/isTestWikiSelectableInAddressBar'
import {
	ensureScalarClientModalAddressBarWarningPlacement,
	resolveScalarClientModalAddressBarWarningPlacement,
	syncScalarClientModalAddressBarWarningInlineAlignment
} from '../utils/resolveScalarClientModalAddressBarWarningPlacement'
import { isWriteHttpMethod } from '../utils/isWriteHttpMethod'
import { resolveHttpMethodFromModalElement } from '../utils/scalarClientModalHttpMethod'
import { resolveInterfaceMessage } from '../utils/resolveInterfaceMessage'

const WRITE_WARNING_ATTRIBUTE = 'data-front-door-scalar-write-warning'
const WRITE_WARNING_MOUNT_SELECTOR = '.scalar-client-write-endpoint-warning-mount'
const WRITE_WARNING_HOST_SELECTOR = '.scalar-client-write-endpoint-warning-host'
const MODAL_SCAN_DEBOUNCE_MS = 80
const MODAL_SCAN_RETRY_INTERVAL_MS = 200
const MODAL_SCAN_RETRY_MAX_ATTEMPTS = 30

interface ScalarWorkspaceEventBus {
	on: ( eventName: string, handler: ( payload: unknown ) => void ) => void
	off: ( eventName: string, handler: ( payload: unknown ) => void ) => void
}

interface MountedWriteWarning {
	application: App<Element> | null
	mountElement: HTMLElement
}

/**
 * Injects a Codex write-endpoint production warning under the Scalar Test Request address bar.
 *
 * Scalar's modal is a separate Vue app; DOM injection mounts {@link ScalarClientWriteEndpointWarning}
 * (`CdxMessage`) immediately below `.scalar-address-bar` only. Warning copy either names a mapped
 * test server when that host appears in OpenAPI / address-bar servers
 * ({@link isTestWikiSelectableInAddressBar}), or asks the user to operate with caution.
 * The warning is hidden while the address bar’s active server is already the mapped test
 * wiki ({@link isActiveAddressBarServerTestWiki}) and returns if production is selected again.
 * Stray warning hosts outside that mount (e.g. under Response Headers from legacy ClientPlugin
 * slots) are removed on each scan. Plain HTML probe mode is available via config.
 *
 * @param scalarInterface - Scalar handles from {@link ExplorerScalarReference} (event bus for method).
 * @returns Nothing.
 */
export function useScalarClientWriteEndpointWarnings(
	scalarInterface: Ref<ScalarInterfaceHandle | null>
): void {
	let mountedWarnings: MountedWriteWarning[] = []
	let observer: MutationObserver | null = null
	let scanTimeoutId: ReturnType<typeof setTimeout> | null = null
	let modalScanRetryIntervalId: ReturnType<typeof setInterval> | null = null
	let modalScanRetryAttempts = 0
	let trackedHttpMethod = ''
	let boundEventBus: ScalarWorkspaceEventBus | null = null
	let addressBarAlignResizeListener: (() => void) | null = null

	/** Reactive props for the mounted warning app (updated on each modal scan). */
	const warningProps = reactive( {
		slotKey: 'address-bar',
		httpMethod: '',
		isTestServerSelectable: false,
		isActiveServerTestWiki: false
	} )

	/**
	 * Resolves whether the mapped test wiki is among Scalar address-bar servers.
	 *
	 * @param modalDialog - Open Test Request modal root, if any.
	 * @returns True when select-copy warning variant should be used.
	 */
	function resolveIsTestServerSelectable( modalDialog: Element | null ): boolean {
		return isTestWikiSelectableInAddressBar(
			activeExplorerWikiInstanceId.value,
			scalarInterface.value?.workspaceStore,
			modalDialog
		)
	}

	/**
	 * Resolves whether the address bar is already pointed at the mapped test wiki.
	 *
	 * @param modalDialog - Open Test Request modal root, if any.
	 * @returns True when the production warning should be hidden.
	 */
	function resolveIsActiveServerTestWiki( modalDialog: Element | null ): boolean {
		return isActiveAddressBarServerTestWiki(
			activeExplorerWikiInstanceId.value,
			modalDialog
		)
	}

	/**
	 * Inserts a write-endpoint warning into a Scalar modal region.
	 *
	 * @param parentElement - Container to receive the mount node.
	 * @param insertBefore - Optional sibling inserted before the warning.
	 * @returns Mounted warning handles.
	 */
	function mountWriteWarning(
		parentElement: Element,
		insertBefore: Element | null
	): MountedWriteWarning {
		let mountElement: HTMLElement
		let application: App<Element> | null = null

		if ( SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE ) {
			const productionWikiDisplayName = getWikiInstanceById( activeExplorerWikiInstanceId.value )?.displayName ?? ''
			const wikiInstanceId = activeExplorerWikiInstanceId.value
			const messageText = warningProps.isActiveServerTestWiki
				? ''
				: warningProps.isTestServerSelectable
					? resolveInterfaceMessage( 'explorer-scalar-write-endpoint-warning', [
						productionWikiDisplayName,
						resolveInterfaceMessage( getTestWikiDisplayNameMessageKey( wikiInstanceId ) )
					] )
					: resolveInterfaceMessage( 'explorer-scalar-write-endpoint-warning-no-test-wiki', [
						productionWikiDisplayName
					] )

			mountElement = createScalarWriteEndpointWarningElement( warningProps.slotKey, messageText )
		} else {
			mountElement = document.createElement( 'div' )
			mountElement.setAttribute( WRITE_WARNING_ATTRIBUTE, warningProps.slotKey )
			mountElement.className = 'scalar-client-write-endpoint-warning-mount'

			/*
			 * Render through a reactive props object so later scans can flip
			 * isTestServerSelectable without tearing down the mount.
			 */
			application = createApp( {
				setup() {
					return () => h( ScalarClientWriteEndpointWarning, warningProps )
				}
			} )
		}

		if ( insertBefore ) {
			parentElement.insertBefore( mountElement, insertBefore )
		} else {
			parentElement.appendChild( mountElement )
		}

		if ( application ) {
			application.mount( mountElement )
		}

		return { application, mountElement }
	}

	/**
	 * Returns the address-bar warning mount in the modal, if present.
	 *
	 * @param modalDialog - Scalar modal root element.
	 * @returns Mount element or null.
	 */
	function findAddressBarWarningMount( modalDialog: Element ): HTMLElement | null {
		const existingMount = modalDialog.querySelector( WRITE_WARNING_MOUNT_SELECTOR )

		return existingMount instanceof HTMLElement ? existingMount : null
	}

	/**
	 * Removes warning hosts that are not under the address-bar mount.
	 *
	 * Scalar's response ClientPlugin slot sits under "Response Headers". Stray hosts
	 * can appear there after Send if a stale plugin still mounts the warning component.
	 *
	 * @param modalDialog - Scalar modal root element.
	 * @returns Nothing.
	 */
	function removeStrayWriteWarningHosts( modalDialog: Element ): void {
		const warningHosts = modalDialog.querySelectorAll( WRITE_WARNING_HOST_SELECTOR )

		for ( const warningHost of warningHosts ) {
			if ( warningHost.closest( WRITE_WARNING_MOUNT_SELECTOR ) ) {
				continue
			}

			warningHost.remove()
		}

		const warningMounts = [ ...modalDialog.querySelectorAll( WRITE_WARNING_MOUNT_SELECTOR ) ]

		if ( warningMounts.length <= 1 ) {
			return
		}

		// Keep the first mount; drop duplicates created by remount races.
		for ( const duplicateMount of warningMounts.slice( 1 ) ) {
			const trackedWarning = mountedWarnings.find(
				( mountedWarning ) => mountedWarning.mountElement === duplicateMount
			)

			trackedWarning?.application?.unmount()
			duplicateMount.remove()
			mountedWarnings = mountedWarnings.filter(
				( mountedWarning ) => mountedWarning.mountElement !== duplicateMount
			)
		}
	}

	/**
	 * Keeps address-bar write controls aligned with the endpoint URL field after layout changes.
	 *
	 * @param modalDialog - Scalar modal root element.
	 * @returns Nothing.
	 */
	function syncAddressBarWarningInlineAlignment( modalDialog: Element ): void {
		const existingMount = findAddressBarWarningMount( modalDialog )

		if ( !existingMount ) {
			return
		}

		syncScalarClientModalAddressBarWarningInlineAlignment( modalDialog, existingMount )
	}

	/**
	 * Subscribes to viewport resizes while the modal is open so alignment stays in sync.
	 *
	 * @param modalDialog - Scalar modal root element.
	 * @returns Nothing.
	 */
	function startAddressBarAlignResizeListener( modalDialog: Element ): void {
		stopAddressBarAlignResizeListener()

		const onResize = (): void => {
			syncAddressBarWarningInlineAlignment( modalDialog )
		}

		window.addEventListener( 'resize', onResize, { passive: true } )
		addressBarAlignResizeListener = () => {
			window.removeEventListener( 'resize', onResize )
			addressBarAlignResizeListener = null
		}
	}

	/**
	 * Removes the viewport resize listener used for address-bar alignment.
	 *
	 * @returns Nothing.
	 */
	function stopAddressBarAlignResizeListener(): void {
		addressBarAlignResizeListener?.()
		addressBarAlignResizeListener = null
	}

	/**
	 * Starts scan retries when the explorer Test Request control is clicked.
	 *
	 * @param event - Document click event (capture phase).
	 * @returns Nothing.
	 */
	function onTestRequestButtonClick( event: MouseEvent ): void {
		const clickTarget = event.target

		if ( !( clickTarget instanceof Element ) ) {
			return
		}

		const testRequestButton = clickTarget.closest( '.show-api-client-button' )

		if ( !testRequestButton ) {
			return
		}

		const methodAttribute = testRequestButton.getAttribute( 'method' )

		if ( methodAttribute ) {
			trackedHttpMethod = methodAttribute.toLowerCase()
		}

		startModalScanRetries()
	}

	/**
	 * Removes injected warning DOM nodes.
	 *
	 * @returns Nothing.
	 */
	function teardownWarnings(): void {
		for ( const mountedWarning of mountedWarnings ) {
			mountedWarning.application?.unmount()
			mountedWarning.mountElement.remove()
		}

		mountedWarnings = []
	}

	/**
	 * Mounts or repositions the address-bar write-request warning below the endpoint URL bar.
	 *
	 * @param modalDialog - Scalar modal root element.
	 * @param httpMethod - HTTP method for the active operation.
	 * @returns Nothing.
	 */
	function injectAddressBarWarning(
		modalDialog: Element,
		httpMethod: string
	): void {
		removeStrayWriteWarningHosts( modalDialog )

		warningProps.httpMethod = httpMethod
		warningProps.isTestServerSelectable = resolveIsTestServerSelectable( modalDialog )
		warningProps.isActiveServerTestWiki = resolveIsActiveServerTestWiki( modalDialog )

		const existingMount = findAddressBarWarningMount( modalDialog )

		if ( existingMount ) {
			ensureScalarClientModalAddressBarWarningPlacement( modalDialog, existingMount )
			requestAnimationFrame( () => {
				requestAnimationFrame( () => {
					syncScalarClientModalAddressBarWarningInlineAlignment( modalDialog, existingMount )
				} )
			} )
			return
		}

		const placement = resolveScalarClientModalAddressBarWarningPlacement( modalDialog )

		if ( !placement ) {
			return
		}

		const mountedWarning = mountWriteWarning(
			placement.parentElement,
			placement.insertBefore
		)
		mountedWarnings.push( mountedWarning )

		requestAnimationFrame( () => {
			requestAnimationFrame( () => {
				syncScalarClientModalAddressBarWarningInlineAlignment(
					modalDialog,
					mountedWarning.mountElement
				)
			} )
		} )
	}

	/**
	 * Resolves the active HTTP method from the event bus tracker or modal DOM.
	 *
	 * @param modalDialog - Open modal root, if any.
	 * @returns Lowercase HTTP method or empty string.
	 */
	function resolveActiveHttpMethod( modalDialog: Element | null ): string {
		if ( trackedHttpMethod ) {
			return trackedHttpMethod
		}

		if ( !modalDialog ) {
			return ''
		}

		return resolveHttpMethodFromModalElement( modalDialog ) ?? ''
	}

	/**
	 * Scans for an open Scalar client modal and injects warnings when appropriate.
	 *
	 * @returns Nothing.
	 */
	function scanForOpenModal(): void {
		const modalDialog = findOpenScalarClientModal()

		if ( !modalDialog ) {
			stopAddressBarAlignResizeListener()
			teardownWarnings()
			return
		}

		const httpMethod = resolveActiveHttpMethod( modalDialog )

		// Probe mode: show banners for every method to verify slot injection.
		if ( !SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE && !isWriteHttpMethod( httpMethod ) ) {
			stopAddressBarAlignResizeListener()
			teardownWarnings()
			return
		}

		injectAddressBarWarning( modalDialog, httpMethod )
		startAddressBarAlignResizeListener( modalDialog )
		syncAddressBarWarningInlineAlignment( modalDialog )
	}

	/**
	 * Stops periodic rescans started when the modal opens.
	 *
	 * @returns Nothing.
	 */
	function stopModalScanRetries(): void {
		if ( modalScanRetryIntervalId !== null ) {
			clearInterval( modalScanRetryIntervalId )
			modalScanRetryIntervalId = null
		}

		modalScanRetryAttempts = 0
	}

	/**
	 * Polls while the modal mounts async content (request/response panels).
	 *
	 * Scalar toggles visibility with `v-show`, which does not fire `childList` mutations.
	 *
	 * @returns Nothing.
	 */
	function startModalScanRetries(): void {
		stopModalScanRetries()
		modalScanRetryAttempts = 0
		scanForOpenModal()

		modalScanRetryIntervalId = setInterval( () => {
			modalScanRetryAttempts += 1
			scanForOpenModal()

			if ( modalScanRetryAttempts >= MODAL_SCAN_RETRY_MAX_ATTEMPTS ) {
				stopModalScanRetries()
			}
		}, MODAL_SCAN_RETRY_INTERVAL_MS )
	}

	/**
	 * Schedules a debounced modal scan to avoid mutation-observer thrash.
	 *
	 * @returns Nothing.
	 */
	function scheduleModalScan(): void {
		if ( scanTimeoutId !== null ) {
			clearTimeout( scanTimeoutId )
		}

		scanTimeoutId = setTimeout( () => {
			scanTimeoutId = null
			scanForOpenModal()
		}, MODAL_SCAN_DEBOUNCE_MS )
	}

	/**
	 * Records HTTP method updates from Scalar workspace events.
	 *
	 * @param payload - Event payload from the Scalar event bus.
	 * @returns Nothing.
	 */
	function onModalOpen( payload: unknown ): void {
		if (
			payload
			&& typeof payload === 'object'
			&& 'method' in payload
			&& typeof payload.method === 'string'
		) {
			trackedHttpMethod = payload.method.toLowerCase()
		}

		// Test Request emits `{ id }` only — always scan when the modal opens.
		startModalScanRetries()
	}

	/**
	 * Clears warnings when the Scalar client modal closes.
	 *
	 * @returns Nothing.
	 */
	function onModalClose(): void {
		stopModalScanRetries()
		stopAddressBarAlignResizeListener()
		teardownWarnings()
		trackedHttpMethod = ''
	}

	/**
	 * Records HTTP method changes when the address bar updates an operation.
	 *
	 * @param payload - Event payload from the Scalar event bus.
	 * @returns Nothing.
	 */
	function onOperationPathMethodUpdate( payload: unknown ): void {
		if (
			payload
			&& typeof payload === 'object'
			&& 'payload' in payload
			&& payload.payload
			&& typeof payload.payload === 'object'
			&& 'method' in payload.payload
			&& typeof payload.payload.method === 'string'
		) {
			trackedHttpMethod = payload.payload.method.toLowerCase()
			scheduleModalScan()
		}
	}

	/**
	 * Subscribes to Scalar event bus updates for modal method tracking.
	 *
	 * @param eventBus - Workspace event bus from ApiReference.
	 * @returns Nothing.
	 */
	function bindEventBus( eventBus: ScalarWorkspaceEventBus ): void {
		if ( boundEventBus === eventBus ) {
			return
		}

		if ( boundEventBus ) {
			boundEventBus.off( 'ui:open:client-modal', onModalOpen )
			boundEventBus.off( 'ui:close:client-modal', onModalClose )
			boundEventBus.off( 'operation:update:pathMethod', onOperationPathMethodUpdate )
		}

		boundEventBus = eventBus
		eventBus.on( 'ui:open:client-modal', onModalOpen )
		eventBus.on( 'ui:close:client-modal', onModalClose )
		eventBus.on( 'operation:update:pathMethod', onOperationPathMethodUpdate )
	}

	/**
	 * Starts observing DOM changes for modal open, close, and method changes.
	 *
	 * @returns Nothing.
	 */
	function startObserving(): void {
		if ( observer || !import.meta.client || !SCALAR_CLIENT_WRITE_ENDPOINT_WARNINGS_ENABLED ) {
			return
		}

		observer = new MutationObserver( () => {
			scheduleModalScan()
		} )

		observer.observe( document.body, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: [ 'style', 'class' ]
		} )

		scheduleModalScan()

		document.addEventListener( 'click', onTestRequestButtonClick, true )
	}

	/**
	 * Stops the mutation observer and removes injected warnings.
	 *
	 * @returns Nothing.
	 */
	function stopObserving(): void {
		if ( scanTimeoutId !== null ) {
			clearTimeout( scanTimeoutId )
			scanTimeoutId = null
		}

		stopModalScanRetries()
		stopAddressBarAlignResizeListener()

		document.removeEventListener( 'click', onTestRequestButtonClick, true )

		observer?.disconnect()
		observer = null
		teardownWarnings()

		if ( boundEventBus ) {
			boundEventBus.off( 'ui:open:client-modal', onModalOpen )
			boundEventBus.off( 'ui:close:client-modal', onModalClose )
			boundEventBus.off( 'operation:update:pathMethod', onOperationPathMethodUpdate )
			boundEventBus = null
		}

		trackedHttpMethod = ''
	}

	watch(
		scalarInterface,
		( nextInterface ) => {
			const eventBus = nextInterface?.eventBus as ScalarWorkspaceEventBus | undefined
			if ( eventBus?.on ) {
				bindEventBus( eventBus )
			}
		},
		{ immediate: true }
	)

	startObserving()

	onBeforeUnmount( () => {
		stopObserving()
	} )
}
