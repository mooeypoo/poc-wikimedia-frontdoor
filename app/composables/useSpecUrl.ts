import { computed } from 'vue'
import type { Ref } from 'vue'
import { useWikiModules } from './useWikiModules'

/**
 * Resolves the selected module spec URL from discovery data.
 *
 * @param selectedWikiInstanceId - Reactive wiki instance id.
 * @param selectedModuleName - Reactive module name.
 * @returns Reactive spec URL and discovery status flags.
 */
export function useSpecUrl( selectedWikiInstanceId: Ref<string>, selectedModuleName: Ref<string> ) {
	const { moduleOptions, isLoading, hasError, errorMessage, refetchDiscovery } = useWikiModules( selectedWikiInstanceId )

	const openApiSpecUrl = computed<string | null>( () => {
		const selectedModuleOption = moduleOptions.value.find( ( moduleOption ) => moduleOption.value === selectedModuleName.value )
		return selectedModuleOption?.specUrl ?? null
	} )

	return {
		openApiSpecUrl,
		moduleOptions,
		isLoading,
		hasError,
		errorMessage,
		refetchDiscovery
	}
}
