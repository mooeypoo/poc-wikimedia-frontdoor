import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { getWikiInstanceById } from '../../config/instances'
import { normalizeDiscoveryModules } from '../utils/normalizeDiscoveryModules'
import type { DiscoveryModule, DiscoveryResponse } from '../utils/normalizeDiscoveryModules'
import { useExplorerDiagnostics } from './useExplorerDiagnostics'

const discoveryCacheByInstance = new Map<string, DiscoveryModule[]>()

/**
 * Fetches and caches discovery modules for the selected wiki instance.
 *
 * @param selectedWikiInstanceId - Reactive wiki instance id.
 * @returns Reactive discovery modules and loading/error flags.
 */
export function useDiscovery( selectedWikiInstanceId: Ref<string> ) {
	const isLoading = ref( false )
	const hasError = ref( false )
	const errorMessage = ref( '' )
	const modules = ref<DiscoveryModule[]>( [] )
	const { logEvent } = useExplorerDiagnostics()

	/**
	 * Fetches discovery modules for the current instance.
	 *
	 * @returns Nothing.
	 */
	async function fetchDiscoveryModules(): Promise<void> {
		const selectedWikiInstance = getWikiInstanceById( selectedWikiInstanceId.value )

		if ( !selectedWikiInstance ) {
			modules.value = []
			hasError.value = true
			errorMessage.value = 'Unknown wiki instance id.'
			logEvent( 'discovery.error', {
				reason: 'unknown_instance',
				selectedWikiInstanceId: selectedWikiInstanceId.value
			} )
			return
		}

		if ( discoveryCacheByInstance.has( selectedWikiInstance.id ) ) {
			modules.value = discoveryCacheByInstance.get( selectedWikiInstance.id ) ?? []
			hasError.value = false
			errorMessage.value = ''
			logEvent( 'discovery.cache_hit', {
				selectedWikiInstanceId: selectedWikiInstance.id,
				moduleCount: modules.value.length
			} )
			return
		}

		isLoading.value = true
		hasError.value = false
		errorMessage.value = ''

		logEvent( 'discovery.fetch_start', {
			selectedWikiInstanceId: selectedWikiInstance.id,
			discoveryUrl: `${ selectedWikiInstance.baseUrl }/w/rest.php/specs/v0/discovery`,
			proxyUrl: `/api/discovery?wikiInstanceId=${ selectedWikiInstance.id }`
		} )

		try {
			const discoveryResponse = await $fetch<DiscoveryResponse>( '/api/discovery', {
				query: {
					wikiInstanceId: selectedWikiInstance.id
				}
			} )
			const normalizedModules = normalizeDiscoveryModules( discoveryResponse.modules, selectedWikiInstance.baseUrl )

			discoveryCacheByInstance.set( selectedWikiInstance.id, normalizedModules )
			modules.value = normalizedModules

			logEvent( 'discovery.fetch_success', {
				selectedWikiInstanceId: selectedWikiInstance.id,
				moduleCount: normalizedModules.length
			} )
		} catch ( error ) {
			modules.value = []
			hasError.value = true
			errorMessage.value = error instanceof Error ? error.message : 'Discovery request failed.'
			logEvent( 'discovery.fetch_error', {
				selectedWikiInstanceId: selectedWikiInstance.id,
				errorMessage: errorMessage.value
			} )
		} finally {
			isLoading.value = false
		}
	}

	watch( selectedWikiInstanceId, () => {
		void fetchDiscoveryModules()
	}, { immediate: true } )

	return {
		isLoading,
		hasError,
		errorMessage,
		modules: computed( () => modules.value ),
		refetchDiscovery: fetchDiscoveryModules
	}
}
