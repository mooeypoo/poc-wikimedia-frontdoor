import type { Ref } from 'vue'
import type { MenuButtonItemData, MenuItemValue } from '@wikimedia/codex'
import {
	cdxIconConfigure,
	cdxIconLanguage,
	cdxIconUserAvatar
} from '@wikimedia/codex-icons'
import { isolatePickerLabel } from '../utils/bidiLabel'
import { useShellAuthNavigation } from './useShellAuthNavigation'

const UTILITY_MENU_VALUE = {
	settings: 'settings',
	language: 'language',
	account: 'account',
	login: 'login',
	logout: 'logout'
} as const

/** Collapsed utility menu item values used by `ShellHeaderUtilityActions`. */
export const SHELL_HEADER_UTILITY_MENU_VALUE = UTILITY_MENU_VALUE

/**
 * Builds collapsed utility-row overflow menu items.
 *
 * Preferences and interface language move into the same ellipsis menu as account
 * and session actions whenever the search field collapses. The parent component
 * owns Preferences and Language selection behavior. When logged in, the menu
 * includes a link to the account dashboard (username label) plus log out.
 *
 * @param selectedInterfaceLocale - Reactive active interface-locale code.
 * @returns Reactive menu state and handlers for `CdxMenuButton`.
 */
export function useShellHeaderUtilityMenu( selectedInterfaceLocale: Ref<string> ) {
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
				label: $bananaI18n( 'header-preferences-label' ),
				value: UTILITY_MENU_VALUE.settings,
				icon: cdxIconConfigure
			},
			{
				label: $bananaI18n( 'header-language-menu-item-label', {
					$1: isolatePickerLabel( selectedInterfaceLocale.value.toUpperCase() )
				} ),
				value: UTILITY_MENU_VALUE.language,
				icon: cdxIconLanguage
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
