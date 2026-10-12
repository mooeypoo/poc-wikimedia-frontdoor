import type { MenuGroupData, MenuItemValue } from '@wikimedia/codex'
import { computed } from 'vue'
import type { Ref } from 'vue'
import {
	EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS,
	EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS
} from '../../config/explorerOptIn'

/**
 * Bridges explorer opt-in boolean flags to a multi-select Codex MenuButton.
 *
 * @param includeBetaEndpoints - Whether beta APIs and endpoints are included.
 * @param includeInternalEndpoints - Whether internal APIs and endpoints are included.
 * @returns A native Codex menu group and the selected-value array for `CdxMenuButton`.
 */
export function useExplorerOptInMenu(
	includeBetaEndpoints: Ref<boolean>,
	includeInternalEndpoints: Ref<boolean>
) {
	const { $bananaI18n } = useNuxtApp()

	const optInGroupLabel = computed( () => $bananaI18n( 'explorer-opt-in-label' ) )
	const betaEndpointsLabel = computed( () => $bananaI18n( 'explorer-opt-in-beta-endpoints' ) )
	const betaEndpointsDescription = computed( () => {
		return $bananaI18n( 'explorer-opt-in-beta-description' )
	} )
	const internalEndpointsLabel = computed( () => $bananaI18n( 'explorer-opt-in-internal-endpoints' ) )
	const internalEndpointsDescription = computed( () => {
		return $bananaI18n( 'explorer-opt-in-internal-description' )
	} )

	const optInMenuEntries = computed<MenuGroupData[]>( () => [
		{
			label: optInGroupLabel.value,
			items: [
				{
					value: EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS,
					label: betaEndpointsLabel.value,
					description: betaEndpointsDescription.value
				},
				{
					value: EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS,
					label: internalEndpointsLabel.value,
					description: internalEndpointsDescription.value
				}
			]
		}
	] )

	const selectedOptInValues = computed<MenuItemValue[]>( {
		get() {
			const selectedValues: MenuItemValue[] = []

			if ( includeBetaEndpoints.value ) {
				selectedValues.push( EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS )
			}

			if ( includeInternalEndpoints.value ) {
				selectedValues.push( EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS )
			}

			return selectedValues
		},
		set( nextSelectedValues ) {
			includeBetaEndpoints.value = nextSelectedValues.includes(
				EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS
			)
			includeInternalEndpoints.value = nextSelectedValues.includes(
				EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS
			)
		}
	} )

	return {
		optInMenuEntries,
		selectedOptInValues
	}
}
