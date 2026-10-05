import {
	EXPLORER_MODULE_DESCRIPTION_MESSAGE_KEYS,
	EXPLORER_MODULE_DESCRIPTION_OPENAPI_COMMON_STRIP_PATTERNS,
	EXPLORER_MODULE_DESCRIPTION_OPENAPI_SUFFIX_STRIP_PATTERNS,
	EXPLORER_MODULE_SELECT_DESCRIPTION_MAX_CHARS
} from '../../config/explorerModuleDescriptions.ts'

/**
 * Strips common Markdown constructs from OpenAPI `info.description` text.
 *
 * @param rawDescription - Description string from an upstream OpenAPI document.
 * @returns Plain text suitable for a multi-line menu description.
 */
function stripMarkdownFromModuleDescription( rawDescription: string ): string {
	return rawDescription
		.replace( /\[([^\]]+)\]\([^)]+\)/g, '$1' )
		.replace( /`([^`]+)`/g, '$1' )
		.replace( /\*\*([^*]+)\*\*/g, '$1' )
		.replace( /__([^_]+)__/g, '$1' )
		.replace( /^#{1,6}\s+/gm, '' )
		.replace( /https?:\/\/\S+/g, '' )
		.replace( /\s+/g, ' ' )
		.trim()
}

/**
 * Removes shared trailing boilerplate from a normalized module description.
 *
 * @param plainText - Markdown-stripped description text.
 * @returns Description with common sandbox / rules / license tails removed.
 */
function stripCommonModuleDescriptionBoilerplate( plainText: string ): string {
	let shortenedText = plainText

	for ( const stripPattern of EXPLORER_MODULE_DESCRIPTION_OPENAPI_COMMON_STRIP_PATTERNS ) {
		shortenedText = shortenedText.replace( stripPattern, '' ).trim()
	}

	return shortenedText
}

/**
 * Removes configured trailing boilerplate from a normalized module description.
 *
 * @param plainText - Markdown-stripped description text.
 * @param moduleName - Discovery module name (for example `site/v1`).
 * @returns Description with configured suffix patterns removed.
 */
function stripConfiguredModuleDescriptionSuffixes(
	plainText: string,
	moduleName: string
): string {
	const suffixStripPattern = EXPLORER_MODULE_DESCRIPTION_OPENAPI_SUFFIX_STRIP_PATTERNS[ moduleName ]

	if ( !suffixStripPattern ) {
		return plainText
	}

	return plainText.replace( suffixStripPattern, '' ).trim()
}

/**
 * Shortens a module description to the Combobox menu character budget.
 *
 * Prefers a complete sentence within the limit. Does not append an ellipsis —
 * longer OpenAPI copy is reduced to a readable product summary.
 *
 * @param plainText - Normalized plain-text description.
 * @param maxChars - Soft maximum length (approx. 3–5 wrapped menu lines).
 * @returns Shortened description, or the original when already within budget.
 */
function shortenModuleDescriptionForMenu(
	plainText: string,
	maxChars: number = EXPLORER_MODULE_SELECT_DESCRIPTION_MAX_CHARS
): string {
	if ( plainText.length <= maxChars ) {
		return plainText
	}

	const candidate = plainText.slice( 0, maxChars + 1 )
	const sentenceBoundary = Math.max(
		candidate.lastIndexOf( '. ' ),
		candidate.lastIndexOf( '! ' ),
		candidate.lastIndexOf( '? ' )
	)

	// Keep a full sentence when it still covers a meaningful share of the budget.
	if ( sentenceBoundary >= Math.floor( maxChars * 0.35 ) ) {
		return plainText.slice( 0, sentenceBoundary + 1 ).trim()
	}

	const wordBoundary = plainText.slice( 0, maxChars ).lastIndexOf( ' ' )
	if ( wordBoundary > 0 ) {
		return plainText.slice( 0, wordBoundary ).trim()
	}

	return plainText.slice( 0, maxChars ).trim()
}

/**
 * Normalizes an OpenAPI module description to plain text for the module select menu.
 *
 * Descriptions are sourced from each module spec's `info.description` field at
 * bootstrap time (see `/api/explorer-bootstrap`). Shared and per-module
 * boilerplate is stripped, then text is shortened to roughly 3–5 wrapped lines
 * at a sentence boundary (no ellipsis).
 *
 * @param rawDescription - Raw `info.description` from the OpenAPI document.
 * @param moduleName - Discovery module name used for configured suffix stripping.
 * @returns Plain-text description, or undefined when empty after normalization.
 */
export function normalizeOpenApiModuleDescription(
	rawDescription?: string,
	moduleName?: string
): string | undefined {
	const trimmedDescription = rawDescription?.trim()
	if ( !trimmedDescription ) {
		return undefined
	}

	let plainText = stripMarkdownFromModuleDescription( trimmedDescription )
	plainText = stripCommonModuleDescriptionBoilerplate( plainText )

	if ( moduleName ) {
		plainText = stripConfiguredModuleDescriptionSuffixes( plainText, moduleName )
	}

	plainText = shortenModuleDescriptionForMenu( plainText )

	return plainText || undefined
}

/**
 * Resolves the menu description for a REST API module select option.
 *
 * Prefers bootstrap `moduleDescription` from OpenAPI; falls back to curated
 * banana-i18n keys in `config/explorerModuleDescriptions.ts` when the spec omits
 * a description.
 *
 * @param moduleItem - Bootstrap module metadata.
 * @param translateMessage - Resolves a banana-i18n message key to interface text.
 * @returns External or interface description text, or undefined when none applies.
 */
export function resolveExplorerModuleMenuDescription(
	moduleItem: { name: string, moduleDescription?: string },
	translateMessage: ( messageKey: string ) => string
): string | undefined {
	const openApiDescription = moduleItem.moduleDescription?.trim()
	if ( openApiDescription ) {
		return openApiDescription
	}

	const fallbackMessageKey = EXPLORER_MODULE_DESCRIPTION_MESSAGE_KEYS[ moduleItem.name ]
	if ( !fallbackMessageKey ) {
		return undefined
	}

	return translateMessage( fallbackMessageKey )
}
