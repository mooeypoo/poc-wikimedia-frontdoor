import { computed } from 'vue'
import type { Ref } from 'vue'
import { useDiscovery } from './useDiscovery'

export interface WikiModuleOption {
	value: string
	label: string
	specUrl: string
}

/**
 * Returns module options for picker rendering based on instance discovery data.
 *
 * @param selectedWikiInstanceId - Reactive wiki instance id.
 * @returns Reactive module options and discovery status flags.
 */
export function useWikiModules( selectedWikiInstanceId: Ref<string> ) {
	const { modules, isLoading, hasError, errorMessage, refetchDiscovery } = useDiscovery( selectedWikiInstanceId )

	const moduleOptions = computed<WikiModuleOption[]>( () => {
		return modules.value.map( ( moduleItem ) => ( {
			value: moduleItem.name,
			label: moduleItem.version
				? `${ moduleItem.title ?? moduleItem.name } (${ moduleItem.version.startsWith( 'v' ) ? moduleItem.version : `v${ moduleItem.version }` })`
				: moduleItem.title ?? moduleItem.name,
			specUrl: moduleItem.specUrl
		} ) )
	} )

	return {
		moduleOptions,
		isLoading,
		hasError,
		errorMessage,
		refetchDiscovery
	}
}
