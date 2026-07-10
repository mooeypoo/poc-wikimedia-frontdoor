import { useOAuthSessionStore } from '../stores/oauthSession'
import { OAUTH_HANDOFF_STORAGE_KEY, type OAuthHandoffPayload } from '../utils/oauthHandoff'

/**
 * Hydrates the OAuth session store from the sessionStorage handoff written by
 * `pages/oauth/callback.vue`.
 *
 * The callback stashes the token in sessionStorage and triggers a full
 * document navigation to `returnTo` so Scalar can remount cleanly across the
 * explorer route boundary (see `plugins/explorer-route-navigation.client.ts`).
 * This plugin runs on the destination page, reads the payload once, and
 * removes it — the token is in storage only during that single navigation
 * (ADR §5.4: "memory only after boot").
 */
export default defineNuxtPlugin( () => {
	let raw: string | null = null
	try {
		raw = sessionStorage.getItem( OAUTH_HANDOFF_STORAGE_KEY )
	} catch {
		return
	}

	if ( !raw ) {
		return
	}

	sessionStorage.removeItem( OAUTH_HANDOFF_STORAGE_KEY )

	let payload: OAuthHandoffPayload
	try {
		payload = JSON.parse( raw ) as OAuthHandoffPayload
	} catch {
		return
	}

	if (
		typeof payload.username !== 'string' ||
		typeof payload.accessToken !== 'string' ||
		typeof payload.expiresAt !== 'number'
	) {
		return
	}

	useOAuthSessionStore().set( payload )
} )
