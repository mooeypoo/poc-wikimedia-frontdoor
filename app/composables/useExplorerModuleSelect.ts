import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import type { MenuConfig } from '@wikimedia/codex'
import type { ExplorerBootstrapModule } from './useExplorerBootstrap'
import {
	isExplorerBetaOptInModule,
	isExplorerInternalOptInModule
} from '../../config/explorerOptIn'
import { isolatePickerLabel } from '../utils/bidiLabel'
import {
	formatExplorerModuleSelectDisplayValue,
	formatModuleVersionChipLabel
} from '../utils/explorerModuleRailHeading'
import { resolveExplorerModuleMenuDescription } from '../utils/explorerModuleDescription'

/** Codex MenuItem fields for the REST API module combobox (no custom attrs on the `<li>`). */
export interface ExplorerModuleSelectMenuItem {
	label: string
	/** Combobox input / selected display string (`Title (v1)`). */
	value: string
	/** Discovery module name used for selection and audience-chip lookup. */
	moduleName: string
	/** Formatted version for `(v1)` beside the title in menu / summary slots. */
	versionParenthetical?: string
	description?: string
}

/** Audience chip flags for a module combobox option (looked up by discovery module name). */
export interface ExplorerModuleSelectAudienceChips {
	showBetaChip: boolean
	showInternalChip: boolean
}

/** Menu item plus audience chips for the custom Combobox menu slot. */
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
 * Builds REST API module combobox state for explorer project controls.
 *
 * Menu order matches bootstrap discovery order after opt-in filtering (same order as the module rail’s parent module list).
 * Combobox `selected` / menu `value` use human display strings (`Title (v1)` via
 * {@link formatExplorerModuleSelectDisplayValue}); discovery module names stay on
 * `moduleName` for selection and audience-chip lookup.
 * Descriptions come from OpenAPI `info.description` (bootstrap) with config fallbacks
 * and sentence-shortening; Codex wraps the shortened copy in the menu.
 * Audience markers use warning InfoChips in a custom Combobox `menu-item` slot and in
 * the closed Combobox / minimized summary when applicable.
 *
 * @param visibleModules - Opt-in-filtered modules in discovery order.
 * @param selectedModuleName - Active module name from {@link useExplorerBootstrap}.
 * @param selectModule - Bootstrap module selection action.
 * @param isDisabled - Whether the combobox is disabled (bootstrapping or no modules).
 * @returns Filtered menu items, Codex menu config, translated menu labels, option
 * resolver, selected-option display data, safe v-model bridge, filter/reset handlers,
 * and disabled state for `CdxCombobox`.
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
	moduleSelectNoResultsLabel: ComputedRef<string>
	resolveModuleSelectOptionDisplay: (
		menuItem: { value?: string | number } | null | undefined
	) => ExplorerModuleSelectOptionDisplay | null
	selectedModuleDisplay: ComputedRef<ExplorerModuleSelectOptionDisplay | null>
	selectedModuleValue: WritableComputedRef<string>
	isModuleSelectDisabled: ComputedRef<boolean>
	isModuleComboboxFiltering: ComputedRef<boolean>
	onModuleComboboxInput: ( event: InputEvent ) => void
	onModuleComboboxChange: () => void
} {
	const { $bananaI18n } = useNuxtApp()
	const moduleSelectBetaChipLabel = computed( () => $bananaI18n( 'explorer-module-beta-chip-label' ) )
	const moduleSelectInternalChipLabel = computed( () => {
		return $bananaI18n( 'explorer-module-internal-chip-label' )
	} )
	const moduleSelectDefaultLabel = computed( () => $bananaI18n( 'explorer-module-placeholder' ) )
	const moduleSelectNoResultsLabel = computed( () => {
		return $bananaI18n( 'explorer-module-no-results' )
	} )

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

	/**
	 * Maps discovery module names to Combobox display strings (`Title (v1)`).
	 *
	 * @param moduleName - Discovery module name.
	 * @returns Matching display value, or undefined when unknown.
	 */
	function displayValueForModuleName( moduleName: string ): string | undefined {
		const moduleItem = selectableModules.value.find( ( restModule ) => {
			return restModule.name === moduleName
		} )

		if ( !moduleItem ) {
			return undefined
		}

		const versionChipLabel = formatModuleVersionChipLabel( moduleItem.versionChipLabel ?? moduleItem.version )
		return formatExplorerModuleSelectDisplayValue( moduleItem.headingTitle, versionChipLabel )
	}

	/**
	 * Maps a Combobox display string back to a discovery module name.
	 *
	 * @param displayValue - Combobox `selected` / input text.
	 * @returns Module name when it matches a healthy option, otherwise undefined.
	 */
	function moduleNameForDisplayValue( displayValue: string ): string | undefined {
		const normalizedDisplayValue = displayValue.trim()
		if ( !normalizedDisplayValue ) {
			return undefined
		}

		for ( const moduleItem of selectableModules.value ) {
			const candidateDisplayValue = displayValueForModuleName( moduleItem.name )
			if ( candidateDisplayValue === normalizedDisplayValue ) {
				return moduleItem.name
			}
		}

		return undefined
	}

	const allModuleMenuItems = computed<ExplorerModuleSelectMenuItem[]>( () => {
		return selectableModules.value.map( ( moduleItem ) => {
			const versionChipLabel = formatModuleVersionChipLabel(
				moduleItem.versionChipLabel ?? moduleItem.version
			)
			const versionParenthetical = versionChipLabel
				? isolatePickerLabel( versionChipLabel )
				: undefined
			const displayValue = formatExplorerModuleSelectDisplayValue(
				moduleItem.headingTitle,
				versionChipLabel
			)
			const menuItem: ExplorerModuleSelectMenuItem = {
				value: displayValue,
				moduleName: moduleItem.name,
				label: isolatePickerLabel( moduleItem.headingTitle )
			}

			if ( versionParenthetical ) {
				menuItem.versionParenthetical = versionParenthetical
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

	const moduleFilterQuery = ref( '' )
	const moduleMenuItems = computed<ExplorerModuleSelectMenuItem[]>( () => {
		const normalizedQuery = moduleFilterQuery.value.trim().toLocaleLowerCase()
		if ( !normalizedQuery ) {
			return allModuleMenuItems.value
		}

		return allModuleMenuItems.value.filter( ( menuItem ) => {
			return [
				menuItem.value,
				menuItem.label,
				menuItem.versionParenthetical ?? '',
				menuItem.description ?? ''
			].some( ( candidate ) => candidate.toLocaleLowerCase().includes( normalizedQuery ) )
		} )
	} )

	const isModuleComboboxFiltering = computed( () => {
		return moduleFilterQuery.value.trim().length > 0
	} )

	/**
	 * Resolves Codex Combobox slot menu items to display data with audience chips.
	 *
	 * @param menuItem - Slot binding from `CdxCombobox` `#menu-item`.
	 * @returns Option display fields, or null when the value is not a selectable module.
	 */
	function resolveModuleSelectOptionDisplay(
		menuItem: { value?: string | number } | null | undefined
	): ExplorerModuleSelectOptionDisplay | null {
		if ( !menuItem || typeof menuItem.value !== 'string' ) {
			return null
		}

		const matchedMenuItem = allModuleMenuItems.value.find( ( candidate ) => {
			return candidate.value === menuItem.value
		} )

		if ( !matchedMenuItem ) {
			return null
		}

		const audienceChips = moduleAudienceByName.value.get( matchedMenuItem.moduleName ) ?? {
			showBetaChip: false,
			showInternalChip: false
		}

		return {
			...matchedMenuItem,
			...audienceChips
		}
	}

	const selectedModuleDisplay = computed( () => {
		return resolveModuleSelectOptionDisplay( {
			value: displayValueForModuleName( selectedModuleName.value )
		} )
	} )

	const moduleComboboxValue = ref(
		displayValueForModuleName( selectedModuleName.value ) ?? selectedModuleName.value
	)
	const selectedModuleValue = computed( {
		get(): string {
			return moduleComboboxValue.value
		},
		set( displayValue: string ) {
			moduleComboboxValue.value = displayValue

			const moduleName = moduleNameForDisplayValue( displayValue )
			if ( !moduleName || moduleName === selectedModuleName.value ) {
				return
			}

			selectModule( moduleName, { source: 'module-select' } )
		}
	} )

	/**
	 * Filters API options using the current native Combobox input text.
	 *
	 * @param event - Input event emitted by `CdxCombobox`.
	 * @returns Nothing.
	 */
	function onModuleComboboxInput( event: InputEvent ): void {
		const inputElement = event.target
		moduleFilterQuery.value = inputElement instanceof HTMLInputElement
			? inputElement.value
			: ''
	}

	/**
	 * Restores the active module when arbitrary Combobox text is committed.
	 *
	 * @returns Nothing.
	 */
	function onModuleComboboxChange(): void {
		if ( !moduleNameForDisplayValue( moduleComboboxValue.value ) ) {
			moduleComboboxValue.value = displayValueForModuleName( selectedModuleName.value )
				?? selectedModuleName.value
		}
		moduleFilterQuery.value = ''
	}

	watch( selectedModuleName, ( moduleName ) => {
		moduleComboboxValue.value = displayValueForModuleName( moduleName ) ?? moduleName
		moduleFilterQuery.value = ''
	} )

	watch( selectableModules, () => {
		if ( moduleFilterQuery.value.trim() ) {
			return
		}

		const displayValue = displayValueForModuleName( selectedModuleName.value )
		if ( displayValue ) {
			moduleComboboxValue.value = displayValue
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
		moduleSelectNoResultsLabel,
		resolveModuleSelectOptionDisplay,
		selectedModuleDisplay,
		selectedModuleValue,
		isModuleSelectDisabled,
		isModuleComboboxFiltering,
		onModuleComboboxInput,
		onModuleComboboxChange
	}
}
