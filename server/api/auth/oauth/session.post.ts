import { createError, defineEventHandler, setResponseStatus } from 'h3'
import { refreshOAuthAccessToken, useOAuthPersistentSession } from '../../../utils/oauthSession'

/**
 * Restores an OAuth session from the persistent refresh-token cookie
 * (docs/adr-wikimedia-oauth-authentication.md §8.6).
 *
 * Called by `plugins/oauth-handoff.client.ts` on app boot when the one-shot
 * post-login handoff is absent (a reload, or entering the `ssr: false`
 * `/account` route). Mints a fresh access token from the stored refresh token,
 * rotates the refresh token in the cookie, and returns the in-memory session
 * payload. The access token never touches browser storage.
 *
 * Returns 204 (no body) when there is no session to restore or the refresh
 * token has expired/been revoked — the client stays logged out.
 */
export default defineEventHandler( async ( event ) => {
	const config = useRuntimeConfig( event )

	if ( !config.oauthCookieSecret || !config.public.oauthClientId ) {
		throw createError( {
			statusCode: 500,
			statusMessage: 'OAuth is not configured. Set NUXT_OAUTH_COOKIE_SECRET and NUXT_PUBLIC_OAUTH_CLIENT_ID.'
		} )
	}

	const session = await useOAuthPersistentSession( event, config.oauthCookieSecret )
	const refreshToken = typeof session.data.refreshToken === 'string' ? session.data.refreshToken : ''
	const username = typeof session.data.username === 'string' ? session.data.username : ''

	if ( !refreshToken || !username ) {
		setResponseStatus( event, 204 )
		return null
	}

	let refreshed
	try {
		refreshed = await refreshOAuthAccessToken( refreshToken, config.public.oauthClientId )
	} catch {
		// Refresh token expired or revoked — drop the session and report logged out.
		await session.clear()
		setResponseStatus( event, 204 )
		return null
	}

	// MediaWiki rotates the refresh token on use; persist the new one so the next
	// reload can refresh again.
	await session.update( {
		refreshToken: refreshed.refreshToken,
		username
	} )

	return {
		accessToken: refreshed.accessToken,
		expiresAt: refreshed.expiresAt,
		username
	}
} )
