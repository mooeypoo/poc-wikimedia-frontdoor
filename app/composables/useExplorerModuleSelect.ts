import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { ExplorerBootstrapModule } from './useExplorerBootstrap'
import { isolatePickerLabel } from '../utils/bidiLabel'
import { formatExplorerModuleSelectSupportingText } from '../utils/explorerModuleRailHeading'

export interface ExplorerModuleSelectMenuItem {
	label: string
	value: string
	supportingText?: string
}

/**
 * Builds REST API module select state for explorer project controls.
 *
 * Menu order matches the module rail: bootstrap discovery order after opt-in filtering.
 * The select stores discovery module names; labels use parsed `headingTitle` values.
 *
 * @param visibleModules - Opt-in-filtered modules in rail order.
 * @param selectedModuleName - Active module name from {@link useExplorerBootstrap}.
 * @param selectModule - Bootstrap module selection action.
 * @param isDisabled - Whether the select is disabled (bootstrapping or no modules).
 * @returns Menu items and v-model bridge for `CdxSelect`.
 */
export function useExplorerModuleSelect(
	visibleModules: Ref<ExplorerBootstrapModule[]>,
	selectedModuleName: Ref<string>,
	selectModule: (
		moduleName: string,
		options: { source: 'module-select' }
	) => boolean,
	isDisabled: Ref<boolean>
): {
	moduleMenuItems: ComputedRef<ExplorerModuleSelectMenuItem[]>
	selectedModuleValue: ComputedRef<string>
	isModuleSelectDisabled: ComputedRef<boolean>
} {
	const { $bananaI18n } = useNuxtApp()
	const betaChipLabel = computed( () => $bananaI18n( 'explorer-module-beta-chip-label' ) )

	const selectableModules = computed( () => {
		return visibleModules.value.filter( ( moduleItem ) => !moduleItem.hasSpecError )
	} )

	const moduleMenuItems = computed<ExplorerModuleSelectMenuItem[]>( () => {
		return selectableModules.value.map( ( moduleItem ) => {
			const supportingText = formatExplorerModuleSelectSupportingText(
				moduleItem,
				betaChipLabel.value,
				moduleItem.versionChipLabel
					? isolatePickerLabel( moduleItem.versionChipLabel )
					: undefined
			)
			const menuItem: ExplorerModuleSelectMenuItem = {
				value: moduleItem.name,
				label: isolatePickerLabel( moduleItem.headingTitle )
			}

			if ( supportingText ) {
				menuItem.supportingText = supportingText
			}

			return menuItem
		} )
	} )

	const selectedModuleValue = computed( {
		get(): string {
			return selectedModuleName.value
		},
		set( moduleName: string ) {
			if ( moduleName === selectedModuleName.value ) {
				return
			}

			selectModule( moduleName, { source: 'module-select' } )
		}
	} )

	const isModuleSelectDisabled = computed( () => {
		return isDisabled.value || selectableModules.value.length === 0
	} )

	return {
		moduleMenuItems,
		selectedModuleValue,
		isModuleSelectDisabled
	}
}
