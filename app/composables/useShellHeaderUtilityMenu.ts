import type { MenuButtonItemData, MenuItemValue } from '@wikimedia/codex'
import { cdxIconConfigure, cdxIconUserAvatar } from '@wikimedia/codex-icons'
import { isolatePickerLabel } from '../utils/bidiLabel'
import { useShellAuthNavigation } from './useShellAuthNavigation'

const UTILITY_MENU_VALUE = {
	settings: 'settings',
	account: 'account',
	login: 'login',
	logout: 'logout'
} as const

/**
 * Builds collapsed utility-row overflow menu items (settings, account, log in/out).
 *
 * Interface language remains a compact control beside the collapsed search icon;
 * it is not included in this menu. When logged in, the menu includes a link to
 * the account dashboard (username label) plus log out.
 *
 * @returns Reactive menu state and handlers for `CdxMenuButton`.
 */
export function useShellHeaderUtilityMenu() {
	const { $bananaI18n } = useNuxtApp()
	const {
		isLoggedIn,
		username,
		accountPath,
		login,
		logout
	} = useShellAuthNavigation()
	const menuSelection = ref<MenuItemValue | null>( null )

	const menuItems = computed( (): MenuButtonItemData[] => {
		const items: MenuButtonItemData[] = [
			{
				label: $bananaI18n( 'header-settings-label' ),
				value: UTILITY_MENU_VALUE.settings,
				icon: cdxIconConfigure,
				disabled: true
			}
		]

		if ( isLoggedIn.value && username.value ) {
			items.push( {
				label: isolatePickerLabel( username.value ),
				value: UTILITY_MENU_VALUE.account,
				icon: cdxIconUserAvatar
			} )
			items.push( {
				label: $bananaI18n( 'header-logout-label' ),
				value: UTILITY_MENU_VALUE.logout
			} )
		} else {
			items.push( {
				label: $bananaI18n( 'header-login-label' ),
				value: UTILITY_MENU_VALUE.login
			} )
		}

		return items
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
		} else if ( selectedValue === UTILITY_MENU_VALUE.account ) {
			navigateTo( accountPath.value )
		}

		menuSelection.value = null
	}

	return {
		menuSelection,
		menuItems,
		handleMenuSelection
	}
}
