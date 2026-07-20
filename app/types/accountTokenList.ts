/** View-model for a personal API key row on the account dashboard list. */
export interface AccountDeveloperTokenListItem {
	id: string
	/** Token display name (external string from API or prototype seed). */
	title: string
	/** Issued date string for metadata (external). */
	issuedOn: string
	/** Approval status (external). */
	status: string
	/** Permissions summary (external). */
	permissions: string
}

/** View-model for an application OAuth key row on the account dashboard list. */
export interface AccountOAuthConsumerListItem {
	id: string
	/** Application name (external string). */
	applicationName: string
	/** Application description (external string). */
	description: string
	/** OAuth client ID (shown in full). */
	consumerKey: string
	/** OAuth client secret (full value; masked form is `maskedClientSecret`). */
	clientSecret: string
	/** Masked client secret for display (from `maskSecretValue`). */
	maskedClientSecret: string
	/** Approval status (external). */
	status: string
	/** Permissions summary (external). */
	permissions: string
	/** Issued / registration date string (external). */
	registeredOn: string
}
