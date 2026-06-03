import { defineStore } from 'pinia'

/**
 * Prototype sign-in state for the developer portal (Experiment 2 placeholder).
 *
 * Persists only for the browser session. Experiment 2 will replace this with
 * `oauthSession` and `useOAuthSession()` per ARCHITECTURE.md.
 */
export const usePrototypeAuthSessionStore = defineStore( 'prototypeAuthSession', () => {
	const isAuthenticated = ref( false )
	const username = ref( '' )

	/**
	 * Records a prototype session for the given wiki username.
	 *
	 * @param wikiUsername - Username entered on the login form (trimmed by caller).
	 * @returns Nothing.
	 */
	function signIn( wikiUsername: string ): void {
		username.value = wikiUsername
		isAuthenticated.value = true
	}

	/**
	 * Clears the prototype session.
	 *
	 * @returns Nothing.
	 */
	function signOut(): void {
		username.value = ''
		isAuthenticated.value = false
	}

	return {
		isAuthenticated,
		username,
		signIn,
		signOut
	}
} )
