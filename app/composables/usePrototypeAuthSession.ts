import { usePrototypeAuthSessionStore } from '../../stores/prototypeAuthSession'
import { usePrototypeDeveloperTokensStore } from '../../stores/prototypeDeveloperTokens'
import { useAccountPath } from './useAccountPath'
import { useLoginPath } from './useLoginPath'

/**
 * Prototype authentication session for login and account routes.
 *
 * Wraps `prototypeAuthSession` and `prototypeDeveloperTokens` stores (Experiment 2 → `useOAuthSession`).
 *
 * @returns {{
 *   isAuthenticated: import('vue').ComputedRef<boolean>,
 *   username: import('vue').ComputedRef<string>,
 *   accountPath: import('vue').ComputedRef<string>,
 *   loginPath: import('vue').ComputedRef<string>,
 *   signInAndGoToAccount: (wikiUsername: string) => void,
 *   signOutAndGoToLogin: () => void,
 *   requireAuthentication: () => void,
 *   ensureDashboardSeedData: () => void
 * }} Session state, locale-aware paths, and navigation helpers.
 */
export function usePrototypeAuthSession() {
	const prototypeAuthSessionStore = usePrototypeAuthSessionStore()
	const prototypeDeveloperTokensStore = usePrototypeDeveloperTokensStore()
	const { accountPath } = useAccountPath()
	const { loginPath } = useLoginPath()
	const router = useRouter()

	const isAuthenticated = computed( () => prototypeAuthSessionStore.isAuthenticated )
	const username = computed( () => prototypeAuthSessionStore.username )

	/**
	 * Starts a prototype session and navigates to the account dashboard.
	 *
	 * @param wikiUsername - Username from the login form.
	 * @returns Nothing.
	 */
	function signInAndGoToAccount( wikiUsername: string ): void {
		prototypeAuthSessionStore.signIn( wikiUsername )
		prototypeDeveloperTokensStore.resetToSeedData()
		router.push( accountPath.value )
	}

	/**
	 * Clears the prototype session and returns to the login page.
	 *
	 * @returns Nothing.
	 */
	function signOutAndGoToLogin(): void {
		prototypeAuthSessionStore.signOut()
		router.push( loginPath.value )
	}

	/**
	 * Redirects unauthenticated visitors to the login page (client-only guard).
	 *
	 * @returns Nothing.
	 */
	function requireAuthentication(): void {
		if ( import.meta.client && !prototypeAuthSessionStore.isAuthenticated ) {
			router.replace( loginPath.value )
		}
	}

	/**
	 * Ensures prototype token tables have seed rows when viewing the account dashboard.
	 *
	 * @returns Nothing.
	 */
	function ensureDashboardSeedData(): void {
		if ( !prototypeAuthSessionStore.isAuthenticated ) {
			return
		}

		const hasNoRows =
			prototypeDeveloperTokensStore.developerJwts.length === 0
			&& prototypeDeveloperTokensStore.oauthConsumers.length === 0

		if ( hasNoRows ) {
			prototypeDeveloperTokensStore.resetToSeedData()
		}
	}

	return {
		isAuthenticated,
		username,
		accountPath,
		loginPath,
		signInAndGoToAccount,
		signOutAndGoToLogin,
		requireAuthentication,
		ensureDashboardSeedData
	}
}
