import type { MenuButtonItemData, MenuItemValue } from '@wikimedia/codex'
import { cdxIconConfigure } from '@wikimedia/codex-icons'
import { useOAuthSession } from './useOAuthSession'

const UTILITY_MENU_VALUE = {
	settings: 'settings',
	login: 'login',
	logout: 'logout'
} as const

/**
 * Builds collapsed utility-row overflow menu items (settings and log in/out).
 *
 * Interface language remains a compact `CdxSelect` beside the collapsed search icon;
 * it is not included in this menu.
 *
 * @returns Reactive menu state and handlers for `CdxMenuButton`.
 */
export function useShellHeaderUtilityMenu() {
	const { $bananaI18n } = useNuxtApp()
	const { isLoggedIn, login, logout } = useOAuthSession()
	const menuSelection = ref<MenuItemValue | null>( null )

	const menuItems = computed( (): MenuButtonItemData[] => {
		return [
			{
				label: $bananaI18n( 'header-settings-label' ),
				value: UTILITY_MENU_VALUE.settings,
				icon: cdxIconConfigure,
				disabled: true
			},
			isLoggedIn.value
				? {
					label: $bananaI18n( 'header-logout-label' ),
					value: UTILITY_MENU_VALUE.logout
				}
				: {
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
			login()
		} else if ( selectedValue === UTILITY_MENU_VALUE.logout ) {
			logout()
		}

		menuSelection.value = null
	}

	return {
		menuSelection,
		menuItems,
		handleMenuSelection
	}
}
