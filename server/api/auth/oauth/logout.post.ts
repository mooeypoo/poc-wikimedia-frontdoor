import { defineEventHandler, setResponseStatus } from 'h3'
import { useOAuthPersistentSession } from '../../../utils/oauthSession'

/**
 * Clears the persistent OAuth refresh-token cookie
 * (docs/adr-wikimedia-oauth-authentication.md §8.6).
 *
 * Called by `useOAuthSession.logout()` alongside clearing the in-memory store,
 * so a subsequent reload does not silently restore the session from the cookie.
 * Always responds 204 — logging out must never fail for the user.
 */
export default defineEventHandler( async ( event ) => {
	const config = useRuntimeConfig( event )

	if ( config.oauthCookieSecret ) {
		const session = await useOAuthPersistentSession( event, config.oauthCookieSecret )
		await session.clear()
	}

	setResponseStatus( event, 204 )
	return null
} )
