/**
 * Prototype token row types and seed data for the account dashboard.
 *
 * Credential creation and approval use Wikimedia Meta-Wiki URLs from `config/auth.ts`.
 */

/** Prototype developer JWT row shown after sign-in until deleted. */
export interface PrototypeDeveloperJwt {
	id: string
	label: string
	/** Bearer token value (prototype only; shown masked in the account table). */
	accessToken: string
	issuedOn: string
	lastUsedOn: string | null
}

/** Prototype OAuth 2.0 consumer row shown after sign-in until deleted. */
export interface PrototypeOAuthConsumer {
	id: string
	applicationName: string
	/** OAuth 2.0 client ID (prototype only; shown masked in the account table). */
	consumerKey: string
	grantSummary: string
	registeredOn: string
}

/**
 * Seed data for the prototype dashboard (simulates tokens already on the account).
 * Removed client-side when the user deletes a row; not persisted across reloads.
 */
export const PROTOTYPE_SEED_DEVELOPER_JWTS: readonly PrototypeDeveloperJwt[] = [
	{
		id: 'dev-jwt-1',
		label: 'Front Door local testing',
		accessToken: 'eyJprototype.frontdoor.dev.jwt.7f3a9c2e1b4d8a6f0c2e9b1',
		issuedOn: '2026-05-12',
		lastUsedOn: '2026-06-01'
	}
]

export const PROTOTYPE_SEED_OAUTH_CONSUMERS: readonly PrototypeOAuthConsumer[] = [
	{
		id: 'oauth-consumer-1',
		applicationName: 'Community API explorer (prototype)',
		consumerKey: '7f3a9c2e1b4d8a6f0c2e9b1a3d5f7c2e1b4d8a',
		grantSummary: 'read API, edit existing pages',
		registeredOn: '2026-04-03'
	}
]
