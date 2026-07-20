/**
 * Prototype token row types and seed data for the account dashboard.
 *
 * Credential creation and approval use Wikimedia Meta-Wiki URLs from `config/auth.ts`.
 * Seed values mirror the Figma `/account` prototype (node 966:21207).
 *
 * Seed field strings (names, status, permissions, dates) are **prototype stand-ins** for
 * data that will come from Meta APIs. They are external strings in the UI — always
 * render through `<bdi>` (AGENTS.md BiDi rule). Do not treat them as banana-i18n
 * interface copy; interface labels (section headings, buttons, meta prefixes) live in `i18n/`.
 */

/** Prototype personal API key row shown after sign-in until deleted. */
export interface PrototypeDeveloperJwt {
	id: string
	label: string
	/** OAuth client ID (Reset success dialog; Figma 633:7695). */
	consumerKey: string
	/** OAuth client secret (masked on card; revealed after Reset). */
	clientSecret: string
	/** OAuth refresh token (Reset success dialog only). */
	refreshToken: string
	/** Bearer access token (prototype; not shown in the Reset success dialog). */
	accessToken: string
	issuedOn: string
	/** Approval status label (external / prototype seed). */
	status: string
	/** Permissions summary (external / prototype seed). */
	permissions: string
}

/** Prototype OAuth 2.0 application key row shown after sign-in until deleted. */
export interface PrototypeOAuthConsumer {
	id: string
	applicationName: string
	/** Short application description shown under the name. */
	description: string
	/** OAuth 2.0 client ID (shown in full, monospace). */
	consumerKey: string
	/** OAuth 2.0 client secret (masked in the UI). */
	clientSecret: string
	/**
	 * OAuth 2.0 refresh token (prototype). Shown only in the Reset success dialog;
	 * not listed on the account card.
	 */
	refreshToken: string
	/** Approval status label (external / prototype seed). */
	status: string
	/** Permissions summary (external / prototype seed). */
	permissions: string
	registeredOn: string
}

/**
 * Builds a prototype hex string for fake OAuth credentials (UI demo only).
 *
 * @param characterCount - Number of hex characters to produce.
 * @returns Lowercase hex string of the requested length.
 */
function createPrototypeHexString( characterCount: number ): string {
	const hexAlphabet = '0123456789abcdef'
	let hexString = ''

	for ( let characterIndex = 0; characterIndex < characterCount; characterIndex += 1 ) {
		hexString += hexAlphabet[ Math.floor( Math.random() * hexAlphabet.length ) ]
	}

	return hexString
}

/**
 * Creates a realistic-looking prototype OAuth client secret for Reset regenerations.
 *
 * @returns Opaque client-secret string (external / prototype).
 */
export function createPrototypeClientSecret(): string {
	return createPrototypeHexString( 32 )
}

/**
 * Creates a realistic-looking prototype OAuth refresh token for Reset regenerations.
 *
 * @returns Opaque refresh-token string (external / prototype).
 */
export function createPrototypeRefreshToken(): string {
	return `def50200${ createPrototypeHexString( 56 ) }`
}

/**
 * Seed data for the prototype dashboard (simulates tokens already on the account).
 * Removed client-side when the user deletes a row; not persisted across reloads.
 */
export const PROTOTYPE_SEED_DEVELOPER_JWTS: readonly PrototypeDeveloperJwt[] = [
	{
		id: 'dev-jwt-1',
		label: 'Developer oauth token',
		consumerKey: 'b7c4e9120f5a8361d2e9a0b3c4d5e6f7',
		clientSecret: 'e1a2b3c4d5e6f708192a3b4c5d6e7f80',
		refreshToken: 'def50200a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbcc',
		accessToken: 'eyJprototype.frontdoor.dev.jwt.7f3a9c2e1b4d8a6f0c2e9b1',
		issuedOn: '2025-07-17',
		status: 'Approved',
		permissions: '{{permissions}}'
	}
]

export const PROTOTYPE_SEED_OAUTH_CONSUMERS: readonly PrototypeOAuthConsumer[] = [
	{
		id: 'oauth-consumer-1',
		applicationName: 'API key name',
		description: '{{Description}}',
		consumerKey: 'a331e186b64a938591e7614170814a75',
		clientSecret: 'f8e7d6c5b4a392817061524334455667',
		refreshToken: 'def50200112233445566778899aabbccddeeff00112233445566778899aabbcc',
		status: 'Approved',
		permissions: '{{permissions}}',
		registeredOn: '2026-07-17'
	}
]
