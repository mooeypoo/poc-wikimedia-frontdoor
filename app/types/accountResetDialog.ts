/**
 * One credential line in the Reset API key success dialog (Figma 633:7695).
 */
export interface AccountResetCredentialRow {
	/** Stable id for copy-feedback tracking. */
	id: string
	/** Banana-i18n field label (includes trailing colon where needed). */
	label: string
	/** Credential value (external string — BiDi-isolate + `dir="ltr"`). */
	value: string
}

/**
 * Dialog step after opening Reset on an account API key.
 *
 * - `confirm` — warn before regenerating (Figma 626:7921)
 * - `success` — show new credentials (Figma 633:7695)
 */
export type AccountResetDialogStep = 'confirm' | 'success'
