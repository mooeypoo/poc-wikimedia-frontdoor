import { computed } from 'vue'
import type { Ref } from 'vue'
import {
	EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS,
	EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS
} from '../../config/explorerOptIn'

/**
 * Bridges explorer opt-in boolean flags to Codex checkbox group `v-model` values.
 *
 * @param includeBetaEndpoints - Whether beta APIs and endpoints are included.
 * @param includeInternalEndpoints - Whether internal APIs and endpoints are included.
 * @returns Checkbox option descriptors and the array model for `CdxCheckbox`.
 */
export function useExplorerOptInCheckboxGroup(
	includeBetaEndpoints: Ref<boolean>,
	includeInternalEndpoints: Ref<boolean>
) {
	const { $bananaI18n } = useNuxtApp()

	const betaEndpointsLabel = computed( () => $bananaI18n( 'explorer-opt-in-beta-endpoints' ) )
	const internalEndpointsLabel = computed( () => $bananaI18n( 'explorer-opt-in-internal-endpoints' ) )

	const optInCheckboxOptions = computed( () => [
		{
			value: EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS,
			label: betaEndpointsLabel.value
		},
		{
			value: EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS,
			label: internalEndpointsLabel.value
		}
	] )

	const selectedOptInValues = computed( {
		get(): string[] {
			const selectedValues: string[] = []

			if ( includeBetaEndpoints.value ) {
				selectedValues.push( EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS )
			}

			if ( includeInternalEndpoints.value ) {
				selectedValues.push( EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS )
			}

			return selectedValues
		},
		set( nextSelectedValues: string[] ) {
			includeBetaEndpoints.value = nextSelectedValues.includes( EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS )
			includeInternalEndpoints.value = nextSelectedValues.includes( EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS )
		}
	} )

	return {
		optInCheckboxOptions,
		selectedOptInValues
	}
}
