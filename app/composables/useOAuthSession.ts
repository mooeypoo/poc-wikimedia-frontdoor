import { computed } from 'vue'
import { useOAuthSessionStore } from '../stores/oauthSession'

interface OAuthSessionPayload {
	username: string
	accessToken: string
	expiresAt: number
}

/**
 * Consumer-facing wrapper around the oauthSession Pinia store
 * (docs/adr-wikimedia-oauth-authentication.md §10 Step B6).
 *
 * Components read login state and initiate login/logout through this
 * composable; they never import the Pinia store directly (ARCHITECTURE.md
 * three-layer separation).
 *
 * @returns Reactive session state and login/logout actions.
 */
export function useOAuthSession() {
	const store = useOAuthSessionStore()
	const route = useRoute()

	/**
	 * Starts the OAuth 2.0 + PKCE flow via a full-page navigation to the
	 * Nitro login route, which 302s to Meta's authorize endpoint.
	 *
	 * @param returnTo - Path to return to after login; defaults to the current route.
	 */
	function login( returnTo?: string ): void {
		const target = returnTo ?? route.fullPath
		window.location.href = `/api/auth/oauth/login?returnTo=${ encodeURIComponent( target ) }`
	}

	/**
	 * Logs out by clearing the in-memory session. No server round trip is
	 * needed — there is no server-side session state (ADR §8.3).
	 */
	function logout(): void {
		store.clear()
	}

	/**
	 * Hydrates the session after a successful token exchange. Used by the
	 * OAuth callback page.
	 *
	 * @param payload - Session data returned by the exchange route.
	 */
	function setSession( payload: OAuthSessionPayload ): void {
		store.set( payload )
	}

	return {
		isLoggedIn: computed( () => store.isLoggedIn ),
		username: computed( () => store.username ),
		accessToken: computed( () => store.accessToken ),
		expiresAt: computed( () => store.expiresAt ),
		login,
		logout,
		setSession
	}
}
