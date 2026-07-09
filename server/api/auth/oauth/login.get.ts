import { createHash, randomBytes } from 'node:crypto'
import { createError, defineEventHandler, getQuery, getRequestURL, sendRedirect, useSession } from 'h3'

// Name and lifetime of the transient encrypted PKCE handshake cookie
// (docs/adr-wikimedia-oauth-authentication.md §5.3). Five minutes is ample
// for the user to complete the authorize dialog on Meta.
const OAUTH_SESSION_NAME = 'oauth-pkce'
const OAUTH_SESSION_MAX_AGE_SECONDS = 300

/**
 * Starts the Wikimedia OAuth 2.0 + PKCE flow (ADR §10 Step B2).
 *
 * Generates the PKCE verifier/challenge and a CSRF state value, stores the
 * verifier, state, and returnTo path in an encrypted HttpOnly session cookie
 * (the verifier never reaches browser JS), then 302s to Meta's authorize
 * endpoint.
 */
export default defineEventHandler( async ( event ) => {
	const config = useRuntimeConfig( event )

	if ( !config.oauthCookieSecret || !config.public.oauthClientId ) {
		throw createError( {
			statusCode: 500,
			statusMessage: 'OAuth is not configured. Set NUXT_OAUTH_COOKIE_SECRET and NUXT_PUBLIC_OAUTH_CLIENT_ID.'
		} )
	}

	// Only accept site-relative paths to prevent open redirects after login.
	const query = getQuery( event )
	const rawReturnTo = typeof query.returnTo === 'string' ? query.returnTo : ''
	const returnTo = rawReturnTo.startsWith( '/' ) && !rawReturnTo.startsWith( '//' )
		? rawReturnTo
		: '/'

	const verifier = randomBytes( 32 ).toString( 'base64url' )
	const challenge = createHash( 'sha256' ).update( verifier ).digest( 'base64url' )
	const state = randomBytes( 16 ).toString( 'base64url' )

	const session = await useSession( event, {
		name: OAUTH_SESSION_NAME,
		password: config.oauthCookieSecret,
		maxAge: OAUTH_SESSION_MAX_AGE_SECONDS,
		cookie: {
			sameSite: 'lax'
		}
	} )
	await session.update( { verifier, state, returnTo } )

	// Deriving the redirect URI from the request origin lets the same code
	// serve localhost and the deployed site, provided each origin's callback
	// URL is registered on the OAuth consumer (ADR §9.1).
	const redirectUri = `${ getRequestURL( event ).origin }/oauth/callback`

	const authorizeUrl = new URL( config.public.oauthAuthorizeUrl )
	authorizeUrl.searchParams.set( 'response_type', 'code' )
	authorizeUrl.searchParams.set( 'client_id', config.public.oauthClientId )
	authorizeUrl.searchParams.set( 'redirect_uri', redirectUri )
	authorizeUrl.searchParams.set( 'scope', config.public.oauthScope )
	authorizeUrl.searchParams.set( 'state', state )
	authorizeUrl.searchParams.set( 'code_challenge', challenge )
	authorizeUrl.searchParams.set( 'code_challenge_method', 'S256' )

	return sendRedirect( event, authorizeUrl.toString(), 302 )
} )
