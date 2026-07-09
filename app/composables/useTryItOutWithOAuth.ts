import { ref, watch } from 'vue'
import { useOAuthSession } from './useOAuthSession'

// Module-scoped so the Scalar config and the explorer toggle UI share one
// state. Deliberately a plain ref rather than Pinia: this is an ephemeral UI
// preference, not session identity (ADR §5.6).
const tryItOutWithOAuth = ref( true )

/**
 * Whether Scalar "Try it out" requests should use the OAuth session's bearer
 * token (docs/adr-wikimedia-oauth-authentication.md §5.6, §10 Step C1).
 *
 * Resets to on whenever the user logs in, so each fresh session starts with
 * credentials applied.
 *
 * @returns Shared boolean ref controlling bearer-token injection.
 */
export function useTryItOutWithOAuth() {
	const { isLoggedIn } = useOAuthSession()

	watch( isLoggedIn, ( nextIsLoggedIn ) => {
		if ( nextIsLoggedIn ) {
			tryItOutWithOAuth.value = true
		}
	} )

	return { tryItOutWithOAuth }
}
