/** View-model for a developer JWT row on the account dashboard list. */
export interface AccountDeveloperTokenListItem {
	id: string
	/** Token display name (external string from API or prototype seed). */
	title: string
	/** Full bearer token value (masked in the list item UI). */
	accessToken: string
	/** Issued date string for metadata (external). */
	issuedOn: string
	/** Last-used date string from API/seed, or null when never used. */
	lastUsedOn: string | null
}

/** View-model for an OAuth consumer row on the account dashboard list. */
export interface AccountOAuthConsumerListItem {
	id: string
	/** Application name (external string). */
	applicationName: string
	/** OAuth client ID (masked in the list item UI). */
	consumerKey: string
	/** Grant summary (external string; may truncate in the UI). */
	grantSummary: string
	/** Registration date string (external). */
	registeredOn: string
}
