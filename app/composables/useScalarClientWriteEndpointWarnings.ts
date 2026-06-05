import { createApp, onBeforeUnmount, watch, type App, type Ref } from 'vue'
import { getTestWikiUrlForWikiInstance } from '../../config/wikiInstanceTestWikis'
import {
	SCALAR_CLIENT_WRITE_ENDPOINT_WARNINGS_ENABLED,
	SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE
} from '../../config/scalarClientWriteWarnings'
import ScalarClientWriteEndpointWarning from '../components/explorer/scalar/ScalarClientWriteEndpointWarning.vue'
import { SCALAR_CLIENT_MODAL_VIEW_SLOTS } from '../scalar/scalarClientWriteEndpointPlugins'
import type { ScalarInterfaceHandle } from './useExplorerScalarFocus'
import {
	resetScalarWriteRequestTestWikiPreference,
	scheduleScalarWriteRequestAddressBarSync
} from '../utils/explorerScalarWriteRequestContext'
import { createScalarWriteEndpointWarningElement } from '../utils/createScalarWriteEndpointWarningElement'
import { findOpenScalarClientModal } from '../utils/findOpenScalarClientModal'
import { isWriteHttpMethod } from '../utils/isWriteHttpMethod'
import { resolveHttpMethodFromModalElement } from '../utils/scalarClientModalHttpMethod'
import { resolveInterfaceMessage } from '../utils/resolveInterfaceMessage'

const WRITE_WARNING_ATTRIBUTE = 'data-front-door-scalar-write-warning'
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
 * Inserts a write-endpoint warning into a Scalar modal region.
 *
 * @param parentElement - Container to receive the mount node.
 * @param insertBefore - Optional sibling inserted before the warning.
 * @param slotKey - Slot identifier stored on the mount node for deduplication.
 * @param httpMethod - HTTP method for write-endpoint gating inside the warning component.
 * @param testWikiUrl - Test wiki URL label for the selected explorer instance.
 * @returns Mounted warning handles.
 */
function mountWriteWarning(
	parentElement: Element,
	insertBefore: Element | null,
	slotKey: string,
	httpMethod: string,
	testWikiUrl: string
): MountedWriteWarning {
	let mountElement: HTMLElement
	let application: App<Element> | null = null

	if ( SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE ) {
		mountElement = createScalarWriteEndpointWarningElement(
			slotKey,
			resolveInterfaceMessage( 'explorer-scalar-write-endpoint-warning', [ testWikiUrl ] )
		)
	} else {
		mountElement = document.createElement( 'div' )
		mountElement.setAttribute( WRITE_WARNING_ATTRIBUTE, slotKey )
		mountElement.className = 'scalar-client-write-endpoint-warning-mount'

		application = createApp( ScalarClientWriteEndpointWarning, {
			slotKey,
			httpMethod,
			testWikiUrl
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
 * Injects Codex-styled write-endpoint warnings into the Scalar Test Request modal.
 *
 * Scalar's modal is a separate Vue app; DOM injection mounts {@link ScalarClientWriteEndpointWarning}
 * (`CdxMessage`) in a small Vue root per slot. Plain HTML probe mode is available via config.
 *
 * @param scalarInterface - Scalar handles from {@link ExplorerScalarReference} (event bus for method).
 * @param selectedWikiInstanceId - Reactive wiki instance id for test-wiki copy in warnings.
 * @returns Nothing.
 */
export function useScalarClientWriteEndpointWarnings(
	scalarInterface: Ref<ScalarInterfaceHandle | null>,
	selectedWikiInstanceId: Ref<string>
): void {
	let mountedWarnings: MountedWriteWarning[] = []
	let observer: MutationObserver | null = null
	let scanTimeoutId: ReturnType<typeof setTimeout> | null = null
	let modalScanRetryIntervalId: ReturnType<typeof setInterval> | null = null
	let modalScanRetryAttempts = 0
	let trackedHttpMethod = ''
	let boundEventBus: ScalarWorkspaceEventBus | null = null

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

		if ( testRequestButton ) {
			resetScalarWriteRequestTestWikiPreference()
		}

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
	 * Mounts a warning at a slot when not already present.
	 *
	 * @param modalDialog - Scalar modal root element.
	 * @param parentElement - Parent container for the mount node.
	 * @param insertBefore - Optional sibling before the warning.
	 * @param slotKey - Slot identifier for deduplication.
	 * @param httpMethod - HTTP method for the active operation.
	 * @returns Nothing.
	 */
	function injectWarningAtSlot(
		modalDialog: Element,
		parentElement: Element | null | undefined,
		insertBefore: Element | null,
		slotKey: string,
		httpMethod: string,
		testWikiUrl: string
	): void {
		if ( !parentElement ) {
			return
		}

		if ( modalDialog.querySelector( `[${ WRITE_WARNING_ATTRIBUTE }="${ slotKey }"]` ) ) {
			return
		}

		mountedWarnings.push(
			mountWriteWarning( parentElement, insertBefore, slotKey, httpMethod, testWikiUrl )
		)
	}

	/**
	 * Mounts write warnings for the open modal at each supported placement.
	 *
	 * @param modalDialog - Scalar modal root element.
	 * @param httpMethod - Normalized HTTP method for the active operation.
	 * @returns Nothing.
	 */
	function injectWarningsIntoModal( modalDialog: Element, httpMethod: string ): void {
		const testWikiUrl = getTestWikiUrlForWikiInstance( selectedWikiInstanceId.value )
		const topContainer = modalDialog.querySelector( '.t-app__top-container' ) ?? modalDialog
		injectWarningAtSlot(
			modalDialog,
			topContainer,
			null,
			'address-bar',
			httpMethod,
			testWikiUrl
		)

		const requestSection = modalDialog.querySelector( '.request-section-content' )
		const codeExample = requestSection?.querySelector( '.request-section-content-code-example' )

		injectWarningAtSlot(
			modalDialog,
			requestSection,
			codeExample ?? null,
			SCALAR_CLIENT_MODAL_VIEW_SLOTS.requestComponent,
			httpMethod,
			testWikiUrl
		)

		const responseSection = modalDialog.querySelector( '.response-section-content' )

		injectWarningAtSlot(
			modalDialog,
			responseSection,
			responseSection?.querySelector( '.response-section-content-body' ) ?? null,
			SCALAR_CLIENT_MODAL_VIEW_SLOTS.responseComponent,
			httpMethod,
			testWikiUrl
		)
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
			teardownWarnings()
			return
		}

		const httpMethod = resolveActiveHttpMethod( modalDialog )

		// Probe mode: show banners for every method to verify slot injection.
		if ( !SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE && !isWriteHttpMethod( httpMethod ) ) {
			teardownWarnings()
			return
		}

		injectWarningsIntoModal( modalDialog, httpMethod )
		scheduleScalarWriteRequestAddressBarSync.value?.()
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
		resetScalarWriteRequestTestWikiPreference()

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
