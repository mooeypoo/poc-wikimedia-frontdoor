import { createError, defineEventHandler, getRequestURL, readBody, useSession } from 'h3'

const OAUTH_TOKEN_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/access_token'
const OAUTH_PROFILE_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile'
const OAUTH_USER_AGENT =
	'frontdoor-dev-portal/0.1 (https://www.mediawiki.org/wiki/Front_Door_Developer_Portal)'

// Must match the session options in login.get.ts so the same cookie decrypts.
const OAUTH_SESSION_NAME = 'oauth-pkce'
const OAUTH_SESSION_MAX_AGE_SECONDS = 300

interface OAuthTokenResponse {
	access_token: string
	expires_in: number
}

interface OAuthProfileResponse {
	username: string
}

/**
 * Completes the Wikimedia OAuth 2.0 + PKCE flow (ADR §10 Step B3).
 *
 * Called by the callback page with the { code, state } returned by Meta.
 * Validates the state against the encrypted handshake cookie, exchanges the
 * code (plus the stored PKCE verifier) for an access token, fetches the
 * user's profile, clears the handshake cookie, and returns the session
 * payload for the client-side store.
 */
export default defineEventHandler( async ( event ) => {
	const config = useRuntimeConfig( event )

	if ( !config.oauthCookieSecret || !config.public.oauthClientId ) {
		throw createError( {
			statusCode: 500,
			statusMessage: 'OAuth is not configured. Set NUXT_OAUTH_COOKIE_SECRET and NUXT_PUBLIC_OAUTH_CLIENT_ID.'
		} )
	}

	const body = await readBody( event )
	const code = typeof body?.code === 'string' ? body.code : ''
	const state = typeof body?.state === 'string' ? body.state : ''

	if ( !code || !state ) {
		throw createError( {
			statusCode: 400,
			statusMessage: 'Missing code or state.'
		} )
	}

	const session = await useSession( event, {
		name: OAUTH_SESSION_NAME,
		password: config.oauthCookieSecret,
		maxAge: OAUTH_SESSION_MAX_AGE_SECONDS,
		cookie: {
			sameSite: 'lax'
		}
	} )

	const { verifier, state: expectedState, returnTo } = session.data

	if ( !verifier || !expectedState ) {
		throw createError( {
			statusCode: 400,
			statusMessage: 'OAuth handshake is missing or expired. Please try logging in again.'
		} )
	}

	if ( state !== expectedState ) {
		throw createError( {
			statusCode: 400,
			statusMessage: 'OAuth state mismatch. Please try logging in again.'
		} )
	}

	// Must be identical to the redirect_uri sent in the authorize request.
	const redirectUri = `${ getRequestURL( event ).origin }/oauth/callback`

	let tokenResponse: OAuthTokenResponse
	try {
		tokenResponse = await $fetch<OAuthTokenResponse>( OAUTH_TOKEN_URL, {
			method: 'POST',
			headers: {
				'user-agent': OAUTH_USER_AGENT
			},
			body: new URLSearchParams( {
				grant_type: 'authorization_code',
				code,
				code_verifier: verifier,
				client_id: config.public.oauthClientId,
				redirect_uri: redirectUri
			} )
		} )
	} catch ( error: unknown ) {
		const statusCode =
			typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number'
				? error.statusCode
				: 502

		throw createError( {
			statusCode,
			statusMessage: 'Failed to exchange the authorization code for a token.'
		} )
	}

	let profileResponse: OAuthProfileResponse
	try {
		profileResponse = await $fetch<OAuthProfileResponse>( OAUTH_PROFILE_URL, {
			headers: {
				authorization: `Bearer ${ tokenResponse.access_token }`,
				'user-agent': OAUTH_USER_AGENT
			}
		} )
	} catch ( error: unknown ) {
		const statusCode =
			typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number'
				? error.statusCode
				: 502

		throw createError( {
			statusCode,
			statusMessage: 'Failed to fetch the user profile.'
		} )
	}

	// The handshake cookie is single-use: clear it once the exchange succeeds.
	await session.clear()

	return {
		accessToken: tokenResponse.access_token,
		expiresAt: Date.now() + tokenResponse.expires_in * 1000,
		username: profileResponse.username,
		returnTo: typeof returnTo === 'string' ? returnTo : '/'
	}
} )
