import { useOAuthSessionStore } from '../stores/oauthSession'
import { OAUTH_HANDOFF_STORAGE_KEY, type OAuthHandoffPayload } from '../utils/oauthHandoff'

interface RestoredOAuthSession {
	username: string
	accessToken: string
	expiresAt: number
}

/**
 * Hydrates the OAuth session store on every client boot.
 *
 * Two sources, tried in order:
 *
 * 1. **One-shot handoff** — `pages/oauth/callback.vue` stashes the token in
 *    sessionStorage and triggers a full document navigation to `returnTo`.
 *    This plugin reads and removes it, so the token is in storage only during
 *    that single navigation (ADR §5.4).
 * 2. **Refresh-token cookie** — on any other boot (a reload, or crossing into
 *    the `ssr: false` `/account` route, where the in-memory store starts empty),
 *    `/api/auth/oauth/session` mints a fresh access token from the HttpOnly
 *    refresh-token cookie (ADR §8.6). The token never touches browser storage.
 *
 * The server round-trip is awaited only on `/account`, whose first paint branches
 * on login state (logged-out gate vs dashboard) — so the correct one renders
 * without a gate flash. Every other route (content pages, the explorer) restores
 * in the background so a Meta refresh never delays hydration; the header username
 * just appears a moment after boot, as it already did with the handoff.
 */
export default defineNuxtPlugin( async () => {
	const store = useOAuthSessionStore()

	let raw: string | null = null
	try {
		raw = sessionStorage.getItem( OAUTH_HANDOFF_STORAGE_KEY )
	} catch {
		raw = null
	}

	if ( raw ) {
		sessionStorage.removeItem( OAUTH_HANDOFF_STORAGE_KEY )

		try {
			const payload = JSON.parse( raw ) as OAuthHandoffPayload
			if (
				typeof payload.username === 'string' &&
				typeof payload.accessToken === 'string' &&
				typeof payload.expiresAt === 'number'
			) {
				store.set( payload )
				return
			}
		} catch {
			// Malformed handoff — fall through to the refresh-cookie restore.
		}
	}

	const restore = restoreSessionFromCookie( store )

	// Block only on /account, whose first paint branches on login state; every
	// other route restores in the background so hydration is not gated on a
	// Meta refresh round-trip.
	const segments = window.location.pathname.split( '/' ).filter( Boolean )
	if ( segments.includes( 'account' ) ) {
		await restore
	}
} )

/**
 * Mints a fresh access token from the refresh-token cookie and populates the
 * store. Stays logged out (no-op) on 204 or any error.
 *
 * @param store - The OAuth session Pinia store.
 * @returns A promise that resolves once the restore attempt completes.
 */
async function restoreSessionFromCookie( store: ReturnType<typeof useOAuthSessionStore> ): Promise<void> {
	try {
		const restored = await $fetch<RestoredOAuthSession | null>( '/api/auth/oauth/session', {
			method: 'POST'
		} )
		if ( restored && restored.accessToken ) {
			store.set( restored )
		}
	} catch {
		// Stay logged out on any error.
	}
}
