import { onBeforeUnmount, watch, type Ref } from 'vue'
import type { ScalarInterfaceHandle } from './useExplorerScalarFocus'
import {
	applyTestWikiToggleToServerUrl,
	normalizeServerUrlToProduction
} from '../utils/applyTestWikiToggleToServerUrl'
import {
	cachedProductionServerUrlForWriteRequest,
	isTestWikiEnabledForWriteRequests,
	scheduleScalarWriteRequestAddressBarSync
} from '../utils/explorerScalarWriteRequestContext'
import { findOpenScalarClientModal } from '../utils/findOpenScalarClientModal'
import { isWriteHttpMethod } from '../utils/isWriteHttpMethod'
import {
	resolveScalarClientModalServerMeta,
	resolveScalarClientModalServerUrl,
	type ScalarClientServerMeta
} from '../utils/scalarClientModalServerUrl'
import { resolveHttpMethodFromModalElement } from '../utils/scalarClientModalHttpMethod'

const ADDRESS_BAR_SYNC_DEBOUNCE_MS = 50

interface ScalarWorkspaceEventBus {
	emit: ( eventName: string, payload: unknown ) => void
}

/**
 * Emits a Scalar workspace server URL update for the active modal.
 *
 * @param eventBus - Scalar workspace event bus from ApiReference.
 * @param serverUrl - Target server URL for the address bar.
 * @param serverMeta - Document- or operation-scoped server metadata.
 * @returns Nothing.
 */
function emitScalarClientServerUrlUpdate(
	eventBus: ScalarWorkspaceEventBus,
	serverUrl: string,
	serverMeta: ScalarClientServerMeta
): void {
	eventBus.emit( 'server:update:server', {
		index: 0,
		server: { url: serverUrl },
		meta: serverMeta
	} )
}

/**
 * Keeps the Scalar address bar server URL aligned with the write-request test-wiki checkbox.
 *
 * @param scalarInterface - Scalar handles from {@link ExplorerScalarReference}.
 * @param selectedWikiInstanceId - Reactive wiki instance id for URL rewriting.
 * @returns Nothing.
 */
export function useScalarWriteRequestAddressBarSync(
	scalarInterface: Ref<ScalarInterfaceHandle | null>,
	selectedWikiInstanceId: Ref<string>
): void {
	let syncTimeoutId: ReturnType<typeof setTimeout> | null = null

	/**
	 * Schedules a debounced address-bar sync after modal DOM updates.
	 *
	 * @returns Nothing.
	 */
	function scheduleAddressBarSync(): void {
		if ( syncTimeoutId !== null ) {
			clearTimeout( syncTimeoutId )
		}

		syncTimeoutId = setTimeout( () => {
			syncTimeoutId = null
			syncAddressBarServerUrl()
		}, ADDRESS_BAR_SYNC_DEBOUNCE_MS )
	}

	/**
	 * Rewrites the open modal's server URL to match the test-wiki checkbox state.
	 *
	 * @returns Nothing.
	 */
	function syncAddressBarServerUrl(): void {
		const modalRoot = findOpenScalarClientModal()
		const eventBus = scalarInterface.value?.eventBus as ScalarWorkspaceEventBus | undefined
		const httpMethod = resolveHttpMethodFromModalElement( modalRoot )

		if ( !modalRoot || !eventBus?.emit || !isWriteHttpMethod( httpMethod ) ) {
			return
		}

		const currentServerUrl = resolveScalarClientModalServerUrl( modalRoot )

		if ( !currentServerUrl ) {
			return
		}

		if ( !cachedProductionServerUrlForWriteRequest.value ) {
			cachedProductionServerUrlForWriteRequest.value = normalizeServerUrlToProduction(
				currentServerUrl,
				selectedWikiInstanceId.value
			)
		}

		const targetServerUrl = applyTestWikiToggleToServerUrl(
			cachedProductionServerUrlForWriteRequest.value,
			selectedWikiInstanceId.value,
			isTestWikiEnabledForWriteRequests.value
		)

		if ( targetServerUrl === currentServerUrl ) {
			return
		}

		const serverMetaCandidates: ScalarClientServerMeta[] = [ { type: 'document' } ]
		const operationServerMeta = resolveScalarClientModalServerMeta( modalRoot )

		if ( operationServerMeta.type === 'operation' ) {
			serverMetaCandidates.push( operationServerMeta )
		}

		/**
		 * Scalar scopes servers at document or operation level depending on the spec.
		 * Try each candidate until the address bar reflects the target URL.
		 */
		const tryServerMetaCandidate = ( candidateIndex: number ): void => {
			const serverMeta = serverMetaCandidates[ candidateIndex ]

			if ( !serverMeta ) {
				return
			}

			emitScalarClientServerUrlUpdate( eventBus, targetServerUrl, serverMeta )

			requestAnimationFrame( () => {
				const nextServerUrl = resolveScalarClientModalServerUrl( modalRoot )

				if ( nextServerUrl === targetServerUrl ) {
					return
				}

				tryServerMetaCandidate( candidateIndex + 1 )
			} )
		}

		tryServerMetaCandidate( 0 )
	}

	const stopToggleWatcher = watch( isTestWikiEnabledForWriteRequests, () => {
		scheduleAddressBarSync()
	} )

	const stopInstanceWatcher = watch( selectedWikiInstanceId, () => {
		cachedProductionServerUrlForWriteRequest.value = null
		scheduleAddressBarSync()
	} )

	const stopInterfaceWatcher = watch( scalarInterface, () => {
		scheduleAddressBarSync()
	} )

	scheduleScalarWriteRequestAddressBarSync.value = scheduleAddressBarSync

	onBeforeUnmount( () => {
		if ( syncTimeoutId !== null ) {
			clearTimeout( syncTimeoutId )
			syncTimeoutId = null
		}

		scheduleScalarWriteRequestAddressBarSync.value = null
		stopToggleWatcher()
		stopInstanceWatcher()
		stopInterfaceWatcher()
	} )
}
