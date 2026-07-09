import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * Wikimedia OAuth session state (docs/adr-wikimedia-oauth-authentication.md §5.4).
 *
 * The access token lives in browser memory only — it is never written to
 * localStorage or sessionStorage, so a full page reload returns the store to
 * its logged-out initial state by design (ADR §8.6).
 */
export const useOAuthSessionStore = defineStore( 'oauthSession', () => {
	const username = ref( null )
	const accessToken = ref( null )
	const expiresAt = ref( null )

	const isLoggedIn = computed(
		() => Boolean( accessToken.value ) && Date.now() < expiresAt.value
	)

	/**
	 * Hydrates the session after a successful token exchange.
	 *
	 * @param {Object} payload
	 * @param {string} payload.username - Wikimedia username from the profile endpoint.
	 * @param {string} payload.accessToken - Bearer token from the token endpoint.
	 * @param {number} payload.expiresAt - Epoch milliseconds when the token expires.
	 */
	function set( payload ) {
		username.value = payload.username
		accessToken.value = payload.accessToken
		expiresAt.value = payload.expiresAt
	}

	/**
	 * Clears the session (logout or expiry).
	 */
	function clear() {
		username.value = null
		accessToken.value = null
		expiresAt.value = null
	}

	return { username, accessToken, expiresAt, isLoggedIn, set, clear }
} )
