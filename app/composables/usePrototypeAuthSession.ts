import { PROTOTYPE_DEFAULT_WIKI_USERNAME } from '../../config/auth'
import { usePrototypeAuthSessionStore } from '../../stores/prototypeAuthSession'
import { usePrototypeDeveloperTokensStore } from '../../stores/prototypeDeveloperTokens'
import { useAccountPath } from './useAccountPath'

/**
 * Placeholder API key session helpers for the account dashboard.
 *
 * Used only after a real Meta OAuth login to seed usability-testing key tables
 * (`prototypeDeveloperTokens`). Does **not** grant access to `/account` — that
 * requires `useOAuthSession`. Unauthenticated `/account` visits show the
 * logged-out gate (Figma 1001:18723).
 *
 * @returns {{
 *   isAuthenticated: import('vue').ComputedRef<boolean>,
 *   username: import('vue').ComputedRef<string>,
 *   accountPath: import('vue').ComputedRef<string>,
 *   initializePrototypeAccountSession: () => void,
 *   clearPrototypeAccountSession: () => void,
 *   resetPrototypeAccountSession: () => void,
 *   ensureDashboardSeedData: () => void
 * }} Placeholder session helpers and locale-aware account path.
 */
export function usePrototypeAuthSession() {
	const prototypeAuthSessionStore = usePrototypeAuthSessionStore()
	const prototypeDeveloperTokensStore = usePrototypeDeveloperTokensStore()
	const { accountPath } = useAccountPath()

	const isAuthenticated = computed( () => prototypeAuthSessionStore.isAuthenticated )
	const username = computed( () => prototypeAuthSessionStore.username )

	/**
	 * Ensures placeholder key rows exist for the logged-in dashboard (client-only).
	 *
	 * Call only when a real OAuth session is active. Seeds the default wiki username
	 * into the prototype store solely so token tables have a session owner for fixtures.
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
	 * Clears the prototype session and restores default seed rows without re-signing in.
	 *
	 * Used on real OAuth logout from the account dashboard.
	 *
	 * @returns Nothing.
	 */
	function clearPrototypeAccountSession(): void {
		prototypeAuthSessionStore.signOut()
		prototypeDeveloperTokensStore.resetToSeedData()
	}

	/**
	 * Clears then re-seeds the prototype session (legacy helper for in-place reset).
	 *
	 * Prefer {@link clearPrototypeAccountSession} on OAuth logout.
	 *
	 * @returns Nothing.
	 */
	function resetPrototypeAccountSession(): void {
		clearPrototypeAccountSession()
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
		clearPrototypeAccountSession,
		resetPrototypeAccountSession,
		ensureDashboardSeedData
	}
}
