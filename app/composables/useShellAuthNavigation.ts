import { useAccountPath } from './useAccountPath'
import { useOAuthSession } from './useOAuthSession'

/**
 * Resolves shell header account navigation after Wikimedia OAuth login.
 *
 * When logged in, the header shows the Meta username as a progressive link to
 * the locale-aware `/account` dashboard. Components must not read the OAuth
 * store directly — this composable encapsulates session + path resolution.
 *
 * @returns {{
 *   isLoggedIn: import('vue').ComputedRef<boolean>,
 *   username: import('vue').ComputedRef<string | null>,
 *   accountPath: import('vue').ComputedRef<string>,
 *   headerAuthLinkAccessibleLabel: import('vue').ComputedRef<string>,
 *   login: (returnTo?: string) => void,
 *   logout: () => void
 * }} Header account link state and OAuth actions.
 */
export function useShellAuthNavigation() {
	const { $bananaI18n } = useNuxtApp()
	const { isLoggedIn, username, login, logout } = useOAuthSession()
	const { accountPath } = useAccountPath()

	/**
	 * Accessible name for the username → account dashboard link.
	 *
	 * Visible text is only the username; this aria-label clarifies the destination.
	 *
	 * @returns banana-i18n string; $1 is the wiki username.
	 */
	const headerAuthLinkAccessibleLabel = computed( () =>
		$bananaI18n( 'header-auth-link-aria', { $1: username.value ?? '' } )
	)

	return {
		isLoggedIn,
		username,
		accountPath,
		headerAuthLinkAccessibleLabel,
		login,
		logout
	}
}
