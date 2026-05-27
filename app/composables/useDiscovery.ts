import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { getWikiInstanceById } from '../../config/instances'
import { useExplorerDiagnostics } from './useExplorerDiagnostics'

interface DiscoveryModule {
	name: string
	title?: string
	version?: string
	specUrl: string
}

interface DiscoveryModuleObjectShape {
	moduleId?: string
	version?: string
	info?: {
		title?: string
		version?: string
	}
	spec?: string
	specUrl?: string
}

interface DiscoveryResponse {
	modules?: DiscoveryModule[] | Record<string, DiscoveryModuleObjectShape>
}

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
	 * Resolves a spec URL to absolute form.
	 *
	 * @param baseUrl - Base URL of the selected wiki instance.
	 * @param specUrl - Spec URL from discovery response.
	 * @returns Absolute spec URL suitable for Scalar.
	 */
	function normalizeSpecUrl( baseUrl: string, specUrl: string ): string {
		try {
			return new URL( specUrl, baseUrl ).toString()
		} catch {
			return specUrl
		}
	}

	/**
	 * Normalizes discovery module data across known response shapes.
	 *
	 * @param discoveryModules - Modules field from discovery response.
	 * @param baseUrl - Base URL of the selected wiki instance.
	 * @returns Normalized module list for explorer pickers.
	 */
	function normalizeDiscoveryModules(
		discoveryModules: DiscoveryResponse[ 'modules' ],
		baseUrl: string
	): DiscoveryModule[] {
		const isUsableVersion = ( version: unknown ): version is string => {
			return typeof version === 'string' && version.trim() !== '' && version !== 'undefined'
		}

		if ( Array.isArray( discoveryModules ) ) {
			return discoveryModules
				.filter( ( rawModule ) => typeof rawModule.name === 'string' && typeof rawModule.specUrl === 'string' )
				.map( ( rawModule ) => ( {
					name: rawModule.name,
					title: typeof ( rawModule as DiscoveryModule & { title?: string } ).title === 'string'
						? ( rawModule as DiscoveryModule & { title?: string } ).title
						: undefined,
					version: isUsableVersion( rawModule.version ) ? rawModule.version : undefined,
					specUrl: normalizeSpecUrl( baseUrl, rawModule.specUrl )
				} ) )
		}

		if ( discoveryModules && typeof discoveryModules === 'object' ) {
			return Object.entries( discoveryModules )
				.flatMap( ( [ moduleKey, moduleValue ] ) => {
					const moduleName = typeof moduleValue.moduleId === 'string' ? moduleValue.moduleId : moduleKey
					const moduleVersion =
						isUsableVersion( moduleValue.info?.version )
							? moduleValue.info.version
							: isUsableVersion( moduleValue.version )
								? moduleValue.version
								: undefined
					const moduleTitle = typeof moduleValue.info?.title === 'string'
						? moduleValue.info.title
						: undefined
					const rawSpecUrl =
						typeof moduleValue.spec === 'string'
							? moduleValue.spec
							: typeof moduleValue.specUrl === 'string'
								? moduleValue.specUrl
								: ''

					if ( !rawSpecUrl ) {
						return []
					}

					const normalizedModule: DiscoveryModule = {
						name: moduleName,
						specUrl: normalizeSpecUrl( baseUrl, rawSpecUrl )
					}

					if ( moduleTitle ) {
						normalizedModule.title = moduleTitle
					}

					if ( moduleVersion ) {
						normalizedModule.version = moduleVersion
					}

					return [ normalizedModule ]
				} )
		}

		return []
	}

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
