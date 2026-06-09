import { PROTOTYPE_DEFAULT_WIKI_USERNAME } from '../../config/auth'
import { usePrototypeAuthSessionStore } from '../../stores/prototypeAuthSession'
import { usePrototypeDeveloperTokensStore } from '../../stores/prototypeDeveloperTokens'
import { useAccountPath } from './useAccountPath'

/**
 * Prototype account dashboard session state.
 *
 * Wraps `prototypeAuthSession` and `prototypeDeveloperTokens` stores (Experiment 2 → `useOAuthSession`).
 * The account page is opened directly at `/account`; no separate login route.
 *
 * @returns {{
 *   isAuthenticated: import('vue').ComputedRef<boolean>,
 *   username: import('vue').ComputedRef<string>,
 *   accountPath: import('vue').ComputedRef<string>,
 *   initializePrototypeAccountSession: () => void,
 *   resetPrototypeAccountSession: () => void,
 *   ensureDashboardSeedData: () => void
 * }} Session state, locale-aware account path, and dashboard helpers.
 */
export function usePrototypeAuthSession() {
	const prototypeAuthSessionStore = usePrototypeAuthSessionStore()
	const prototypeDeveloperTokensStore = usePrototypeDeveloperTokensStore()
	const { accountPath } = useAccountPath()

	const isAuthenticated = computed( () => prototypeAuthSessionStore.isAuthenticated )
	const username = computed( () => prototypeAuthSessionStore.username )

	/**
	 * Ensures a prototype session exists for the account dashboard (client-only).
	 *
	 * Seeds the default wiki username when `/account` is opened without an active session.
	 *
	 * @returns Nothing.
	 */
	function initializePrototypeAccountSession(): void {
		if ( !import.meta.client ) {
			return
		}

		if ( !prototypeAuthSessionStore.isAuthenticated ) {
			prototypeAuthSessionStore.signIn( PROTOTYPE_DEFAULT_WIKI_USERNAME )
			prototypeDeveloperTokensStore.resetToSeedData()
		}

		ensureDashboardSeedData()
	}

	/**
	 * Clears the prototype session and restores default dashboard seed data in place.
	 *
	 * @returns Nothing.
	 */
	function resetPrototypeAccountSession(): void {
		prototypeAuthSessionStore.signOut()
		prototypeDeveloperTokensStore.resetToSeedData()
		prototypeAuthSessionStore.signIn( PROTOTYPE_DEFAULT_WIKI_USERNAME )
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
		initializePrototypeAccountSession,
		resetPrototypeAccountSession,
		ensureDashboardSeedData
	}
}
