import { usePrototypeAuthSession } from './usePrototypeAuthSession'

/**
 * Resolves shell header auth link for the prototype login → dashboard flow.
 *
 * Unauthenticated: link to `/login` with banana label "Log in".
 * Authenticated: link to `/account` with the signed-in wiki username as visible text.
 *
 * @returns {{
 *   isAuthenticated: import('vue').ComputedRef<boolean>,
 *   username: import('vue').ComputedRef<string>,
 *   headerAuthLinkPath: import('vue').ComputedRef<string>,
 *   headerLoginLabel: import('vue').ComputedRef<string>,
 *   headerAuthLinkAccessibleLabel: import('vue').ComputedRef<string>
 * }} Shell header auth link path, labels, and session username for the template.
 */
export function useShellAuthNavigation() {
	const { $bananaI18n } = useNuxtApp()
	const { isAuthenticated, username, accountPath, loginPath } = usePrototypeAuthSession()

	const headerAuthLinkPath = computed( () =>
		isAuthenticated.value ? accountPath.value : loginPath.value
	)

	const headerLoginLabel = computed( () => $bananaI18n( 'header-login-label' ) )

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
		headerLoginLabel,
		headerAuthLinkAccessibleLabel
	}
}
