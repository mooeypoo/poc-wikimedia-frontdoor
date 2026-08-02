import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { MenuConfig } from '@wikimedia/codex'
import type { ExplorerBootstrapModule } from './useExplorerBootstrap'
import {
	isExplorerBetaOptInModule,
	isExplorerInternalOptInModule
} from '../../config/explorerOptIn'
import { isolatePickerLabel } from '../utils/bidiLabel'
import { formatExplorerModuleSelectSupportingText } from '../utils/explorerModuleRailHeading'
import { resolveExplorerModuleMenuDescription } from '../utils/explorerModuleDescription'

/** Codex MenuItem fields for the REST API module select (no custom attrs on the `<li>`). */
export interface ExplorerModuleSelectMenuItem {
	label: string
	value: string
	supportingText?: string
	description?: string
}

/** Audience chip flags for a module select option (looked up by discovery module name). */
export interface ExplorerModuleSelectAudienceChips {
	showBetaChip: boolean
	showInternalChip: boolean
}

/** Menu item plus audience chips for custom Select slots. */
export interface ExplorerModuleSelectOptionDisplay extends ExplorerModuleSelectMenuItem {
	showBetaChip: boolean
	showInternalChip: boolean
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
 * Audience markers use warning InfoChips in a custom Select `menu-item` slot; `supportingText` is version-only.
 *
 * @param visibleModules - Opt-in-filtered modules in discovery order.
 * @param selectedModuleName - Active module name from {@link useExplorerBootstrap}.
 * @param selectModule - Bootstrap module selection action.
 * @param isDisabled - Whether the select is disabled (bootstrapping or no modules).
 * @returns Menu items, Codex menu config, default label, chip labels, option resolver, v-model bridge, and disabled state for `CdxSelect`.
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
	moduleSelectBetaChipLabel: ComputedRef<string>
	moduleSelectInternalChipLabel: ComputedRef<string>
	resolveModuleSelectOptionDisplay: (
		menuItem: { value?: string | number } | null | undefined
	) => ExplorerModuleSelectOptionDisplay | null
	selectedModuleValue: ComputedRef<string>
	isModuleSelectDisabled: ComputedRef<boolean>
} {
	const { $bananaI18n } = useNuxtApp()
	const moduleSelectBetaChipLabel = computed( () => $bananaI18n( 'explorer-module-beta-chip-label' ) )
	const moduleSelectInternalChipLabel = computed( () => {
		return $bananaI18n( 'explorer-module-internal-chip-label' )
	} )
	const moduleSelectDefaultLabel = computed( () => $bananaI18n( 'explorer-module-placeholder' ) )

	const selectableModules = computed( () => {
		return visibleModules.value.filter( ( moduleItem ) => !moduleItem.hasSpecError )
	} )

	const moduleAudienceByName = computed( () => {
		const audienceByName = new Map<string, ExplorerModuleSelectAudienceChips>()

		for ( const moduleItem of selectableModules.value ) {
			audienceByName.set( moduleItem.name, {
				showBetaChip: moduleItem.showBetaChip || isExplorerBetaOptInModule( moduleItem.name ),
				showInternalChip: isExplorerInternalOptInModule( moduleItem.name )
			} )
		}

		return audienceByName
	} )

	const moduleMenuItems = computed<ExplorerModuleSelectMenuItem[]>( () => {
		return selectableModules.value.map( ( moduleItem ) => {
			const supportingText = formatExplorerModuleSelectSupportingText(
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

	/**
	 * Resolves Codex Select slot menu items to display data with audience chips.
	 *
	 * @param menuItem - Slot binding from `CdxSelect` `#menu-item` / `#label`.
	 * @returns Option display fields, or null when the value is not a selectable module.
	 */
	function resolveModuleSelectOptionDisplay(
		menuItem: { value?: string | number } | null | undefined
	): ExplorerModuleSelectOptionDisplay | null {
		if ( !menuItem || typeof menuItem.value !== 'string' ) {
			return null
		}

		const matchedMenuItem = moduleMenuItems.value.find( ( candidate ) => {
			return candidate.value === menuItem.value
		} )

		if ( !matchedMenuItem ) {
			return null
		}

		const audienceChips = moduleAudienceByName.value.get( matchedMenuItem.value ) ?? {
			showBetaChip: false,
			showInternalChip: false
		}

		return {
			...matchedMenuItem,
			...audienceChips
		}
	}

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
		moduleSelectBetaChipLabel,
		moduleSelectInternalChipLabel,
		resolveModuleSelectOptionDisplay,
		selectedModuleValue,
		isModuleSelectDisabled
	}
}
