import { usePrototypeAuthSession } from './usePrototypeAuthSession'

/**
 * Resolves shell header link to the prototype account dashboard.
 *
 * Always links to `/account`. Shows the prototype wiki username when a session is active;
 * otherwise shows the generic account dashboard label.
 *
 * @returns {{
 *   isAuthenticated: import('vue').ComputedRef<boolean>,
 *   username: import('vue').ComputedRef<string>,
 *   headerAuthLinkPath: import('vue').ComputedRef<string>,
 *   headerAccountLabel: import('vue').ComputedRef<string>,
 *   headerAuthLinkAccessibleLabel: import('vue').ComputedRef<string>
 * }} Shell header account link path, labels, and session username for the template.
 */
export function useShellAuthNavigation() {
	const { $bananaI18n } = useNuxtApp()
	const { isAuthenticated, username, accountPath } = usePrototypeAuthSession()

	const headerAuthLinkPath = computed( () => accountPath.value )

	const headerAccountLabel = computed( () => $bananaI18n( 'header-account-label' ) )

	/**
	 * Accessible name when the header shows the wiki username (links to the dashboard).
	 *
	 * @returns banana-i18n string; $1 is the username.
	 */
	const headerAuthLinkAccessibleLabel = computed( () =>
		$bananaI18n( 'header-auth-link-aria', { $1: username.value } )
	)

	return {
		isAuthenticated,
		username,
		headerAuthLinkPath,
		headerAccountLabel,
		headerAuthLinkAccessibleLabel
	}
}
