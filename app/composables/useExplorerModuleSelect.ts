import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { MenuConfig } from '@wikimedia/codex'
import type { ExplorerBootstrapModule } from './useExplorerBootstrap'
import { isolatePickerLabel } from '../utils/bidiLabel'
import { formatExplorerModuleSelectSupportingText } from '../utils/explorerModuleRailHeading'
import { resolveExplorerModuleMenuDescription } from '../utils/explorerModuleDescription'

export interface ExplorerModuleSelectMenuItem {
	label: string
	value: string
	supportingText?: string
	description?: string
}

/** Codex menu options for REST API module items with labels and descriptions. */
const EXPLORER_MODULE_SELECT_MENU_CONFIG: MenuConfig = {
	boldLabel: true,
	hideDescriptionOverflow: false
}

/**
 * Builds REST API module select state for explorer project controls.
 *
 * Menu order matches bootstrap discovery order after opt-in filtering (same order as the module rail’s parent module list).
 * The select stores discovery module names; labels use parsed `headingTitle` values.
 * Descriptions come from OpenAPI `info.description` (bootstrap) with config fallbacks; Codex wraps long text in the menu.
 *
 * @param visibleModules - Opt-in-filtered modules in discovery order.
 * @param selectedModuleName - Active module name from {@link useExplorerBootstrap}.
 * @param selectModule - Bootstrap module selection action.
 * @param isDisabled - Whether the select is disabled (bootstrapping or no modules).
 * @returns Menu items, Codex menu config, default label, v-model bridge, and disabled state for `CdxSelect`.
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
	moduleSelectMenuConfig: MenuConfig
	moduleSelectDefaultLabel: ComputedRef<string>
	selectedModuleValue: ComputedRef<string>
	isModuleSelectDisabled: ComputedRef<boolean>
} {
	const { $bananaI18n } = useNuxtApp()
	const betaChipLabel = computed( () => $bananaI18n( 'explorer-module-beta-chip-label' ) )
	const moduleSelectDefaultLabel = computed( () => $bananaI18n( 'explorer-module-placeholder' ) )

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

			const menuDescription = resolveExplorerModuleMenuDescription(
				moduleItem,
				( messageKey ) => $bananaI18n( messageKey )
			)

			if ( menuDescription ) {
				menuItem.description = isolatePickerLabel( menuDescription )
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
		moduleSelectMenuConfig: EXPLORER_MODULE_SELECT_MENU_CONFIG,
		moduleSelectDefaultLabel,
		selectedModuleValue,
		isModuleSelectDisabled
	}
}
