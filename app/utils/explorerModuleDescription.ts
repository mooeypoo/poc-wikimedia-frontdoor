import { EXPLORER_MODULE_DESCRIPTION_MESSAGE_KEYS } from '../../config/explorerModuleDescriptions.ts'

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
		.replace( /https?:\/\/\S+/g, '' )
		.replace( /\s+/g, ' ' )
		.trim()
}

/**
 * Normalizes an OpenAPI module description to plain text for the module select menu.
 *
 * Descriptions are sourced from each module spec's `info.description` field at
 * bootstrap time (see `/api/explorer-bootstrap`). Text is not truncated; Codex
 * wraps long copy across multiple lines in the dropdown.
 *
 * @param rawDescription - Raw `info.description` from the OpenAPI document.
 * @returns Plain-text description, or undefined when empty after normalization.
 */
export function normalizeOpenApiModuleDescription( rawDescription?: string ): string | undefined {
	const trimmedDescription = rawDescription?.trim()
	if ( !trimmedDescription ) {
		return undefined
	}

	const plainText = stripMarkdownFromModuleDescription( trimmedDescription )
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
	moduleItem: { name: string; moduleDescription?: string },
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
