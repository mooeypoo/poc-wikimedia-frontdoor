import type { MenuButtonItemData, MenuItemValue } from '@wikimedia/codex'
import { cdxIconConfigure } from '@wikimedia/codex-icons'

const UTILITY_MENU_VALUE = {
	settings: 'settings',
	login: 'login'
} as const

/**
 * Builds collapsed utility-row overflow menu items (settings and log in only).
 *
 * Interface language remains a compact `CdxSelect` beside the collapsed search icon;
 * it is not included in this menu.
 *
 * @returns Reactive menu state and handlers for `CdxMenuButton`.
 */
export function useShellHeaderUtilityMenu() {
	const { $bananaI18n } = useNuxtApp()
	const menuSelection = ref<MenuItemValue | null>( null )

	const menuItems = computed( (): MenuButtonItemData[] => {
		return [
			{
				label: $bananaI18n( 'header-settings-label' ),
				value: UTILITY_MENU_VALUE.settings,
				icon: cdxIconConfigure,
				disabled: true
			},
			{
				label: $bananaI18n( 'header-login-label' ),
				value: UTILITY_MENU_VALUE.login
			}
		]
	} )

	/**
	 * Handles a menu selection from the collapsed utility `CdxMenuButton`.
	 *
	 * Resets `menuSelection` after each action so the trigger does not show a persistent
	 * selection.
	 *
	 * @param selectedValue - Newly selected menu item value, or null.
	 */
	function handleMenuSelection( selectedValue: MenuItemValue | null ): void {
		if ( selectedValue === null ) {
			return
		}

		if ( selectedValue === UTILITY_MENU_VALUE.login ) {
			// Non-functional log-in prototype — same as the expanded text link.
			menuSelection.value = null
			return
		}

		menuSelection.value = null
	}

	return {
		menuSelection,
		menuItems,
		handleMenuSelection
	}
}
