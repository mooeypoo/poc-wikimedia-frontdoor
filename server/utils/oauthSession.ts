import { type H3Event, useSession } from 'h3'

/**
 * Persistent OAuth session helpers (docs/adr-wikimedia-oauth-authentication.md §8.6).
 *
 * The access token stays in browser memory only (ADR §5.4). To let the session
 * survive a full reload or crossing into the `ssr: false` `/account` route, we
 * store the OAuth **refresh token** in a separate encrypted HttpOnly cookie —
 * never readable by browser JS — and mint a fresh access token from it on mount
 * via `server/api/auth/oauth/session.post.ts`. This is the "future improvement"
 * described in ADR §8.6 (refresh token in the session cookie, refresh on mount).
 */

// Meta's OAuth 2.0 token endpoint and the User-Agent every server-side Meta
// request must send. Shared with the code-exchange handler.
export const OAUTH_TOKEN_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/access_token'
export const OAUTH_USER_AGENT =
	'frontdoor-dev-portal/0.1 (https://www.mediawiki.org/wiki/Front_Door_Developer_Portal)'

// Persistent (login-lifetime) session cookie holding the refresh token. Distinct
// from the transient five-minute `oauth-pkce` handshake cookie used during login.
// A refresh failure before this age simply logs the user out.
export const OAUTH_SESSION_COOKIE_NAME = 'oauth-session'
export const OAUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export type OAuthPersistentSessionData = {
	refreshToken?: string
	username?: string
}

export interface OAuthRefreshResult {
	accessToken: string
	refreshToken: string
	expiresAt: number
}

interface OAuthTokenResponse {
	access_token: string
	expires_in: number
	refresh_token?: string
}

/**
 * Opens the encrypted, HttpOnly refresh-token session. Cookie options mirror the
 * transient handshake cookie (`sameSite: 'lax'`) so the same origins that work
 * for login also carry this cookie.
 *
 * @param event - The current request event.
 * @param password - Sealing secret (`config.oauthCookieSecret`).
 * @returns The h3 session handle for the persistent OAuth cookie.
 */
export function useOAuthPersistentSession( event: H3Event, password: string ) {
	return useSession<OAuthPersistentSessionData>( event, {
		name: OAUTH_SESSION_COOKIE_NAME,
		password,
		maxAge: OAUTH_SESSION_MAX_AGE_SECONDS,
		cookie: {
			sameSite: 'lax'
		}
	} )
}

/**
 * Exchanges a refresh token for a fresh access token (OAuth 2.0 refresh grant).
 *
 * MediaWiki's OAuth2 server rotates the refresh token on each use and revokes
 * the old one, so callers MUST persist the returned `refreshToken`. If the
 * response omits a new refresh token, the previous one is reused.
 *
 * @param refreshToken - The current refresh token from the session cookie.
 * @param clientId - The public OAuth client id.
 * @returns The new access token, rotated refresh token, and absolute expiry.
 * @throws When Meta rejects the refresh token (expired/revoked).
 */
export async function refreshOAuthAccessToken(
	refreshToken: string,
	clientId: string
): Promise<OAuthRefreshResult> {
	const tokenResponse = await $fetch<OAuthTokenResponse>( OAUTH_TOKEN_URL, {
		method: 'POST',
		headers: {
			'user-agent': OAUTH_USER_AGENT
		},
		body: new URLSearchParams( {
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
			client_id: clientId
		} )
	} )

	return {
		accessToken: tokenResponse.access_token,
		refreshToken: tokenResponse.refresh_token ?? refreshToken,
		expiresAt: Date.now() + tokenResponse.expires_in * 1000
	}
}
