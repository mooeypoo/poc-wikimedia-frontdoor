/**
 * Prototype token row types and seed data for the account dashboard.
 *
 * **Not real credentials.** Values in this file and values minted by
 * `createPrototypeClientSecret` / `createPrototypeRefreshToken` are **placeholders
 * for usability testing only**. The Front Door does **not** fetch personal or
 * application API keys from Meta-Wiki or any other backend. Listing, Reset, and
 * the Reset success dialog all operate on in-memory seed / generated stand-ins.
 *
 * **Pending:** Real retrieval, reset, and revoke of OAuth consumers / developer
 * tokens still require backend (and Meta) integration — not implemented.
 *
 * “Request new API key” may open Meta registration URLs from `config/auth.ts`;
 * that outbound link is separate from the fake rows shown on `/account`.
 *
 * Seed field strings (names, status, permissions, dates, secrets) are **external**
 * in the UI — always render through `<bdi>` (AGENTS.md BiDi rule). Do not treat
 * them as banana-i18n interface copy; interface labels live in `i18n/`.
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
 * Builds a prototype hex string for **fake** OAuth credentials (usability UI only).
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
 * Creates a realistic-looking **placeholder** OAuth client secret for Reset regenerations.
 *
 * Not a real Meta-issued secret. Usability-testing stand-in only.
 *
 * @returns Opaque client-secret string (external / prototype placeholder).
 */
export function createPrototypeClientSecret(): string {
	return createPrototypeHexString( 32 )
}

/**
 * Creates a realistic-looking **placeholder** OAuth refresh token for Reset regenerations.
 *
 * Not a real Meta-issued refresh token. Usability-testing stand-in only.
 *
 * @returns Opaque refresh-token string (external / prototype placeholder).
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
		permissions: 'read, write'
	}
]

export const PROTOTYPE_SEED_OAUTH_CONSUMERS: readonly PrototypeOAuthConsumer[] = [
	{
		id: 'oauth-consumer-1',
		applicationName: 'API key name',
		description: 'API key description',
		consumerKey: 'a331e186b64a938591e7614170814a75',
		clientSecret: 'f8e7d6c5b4a392817061524334455667',
		refreshToken: 'def50200112233445566778899aabbccddeeff00112233445566778899aabbcc',
		status: 'Approved',
		permissions: 'read, write',
		registeredOn: '2026-07-17'
	}
]
