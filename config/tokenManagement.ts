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
	/** Bearer token value (prototype only; not shown on the personal-key card). */
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
	/** Approval status label (external / prototype seed). */
	status: string
	/** Permissions summary (external / prototype seed). */
	permissions: string
	registeredOn: string
}

/**
 * Seed data for the prototype dashboard (simulates tokens already on the account).
 * Removed client-side when the user deletes a row; not persisted across reloads.
 */
export const PROTOTYPE_SEED_DEVELOPER_JWTS: readonly PrototypeDeveloperJwt[] = [
	{
		id: 'dev-jwt-1',
		label: 'Developer oauth token',
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
		clientSecret: 'prototype-client-secret-value-not-shown',
		status: 'Approved',
		permissions: '{{permissions}}',
		registeredOn: '2026-07-17'
	}
]
