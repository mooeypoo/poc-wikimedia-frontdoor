/**
 * Shared storage key for the OAuth callback → destination token handoff
 * (docs/adr-wikimedia-oauth-authentication.md §5.4).
 *
 * The token is written to sessionStorage on the callback page just before it
 * triggers a full document navigation to `returnTo` (necessary so the
 * explorer route boundary plugin can force the clean remount Scalar needs),
 * and read+cleared once by `plugins/oauth-handoff.client.ts` on the other
 * side. sessionStorage is scoped to the tab, and the value only exists
 * across that single navigation.
 */
export const OAUTH_HANDOFF_STORAGE_KEY = 'oauth-handoff'

export interface OAuthHandoffPayload {
	username: string
	accessToken: string
	expiresAt: number
}
