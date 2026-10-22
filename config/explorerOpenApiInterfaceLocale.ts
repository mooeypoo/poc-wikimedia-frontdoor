/**
 * Policy for localizing OpenAPI *document* prose from the interface locale.
 *
 * Design branch (`design-scalar-mirroring`): when the UI language is Hebrew,
 * Scalar is fed a localized `content` object (not only chrome translations) so
 * endpoint docs can be reviewed as RTL text inside the pinned-LTR embed.
 * Project / wiki language pickers do not drive this — only `interfaceLocale`.
 *
 * @see docs/adr-scalar-interface-localization.md
 */

/**
 * Interface locales that receive an OpenAPI document prose overlay.
 *
 * Declared explicitly (AGENTS.md rule 7) — never inferred from script direction.
 */
export const OPENAPI_DOCUMENT_INTERFACE_LOCALES = [ 'he' ] as const

export type OpenApiDocumentInterfaceLocale =
	( typeof OPENAPI_DOCUMENT_INTERFACE_LOCALES )[ number ]

/**
 * Returns whether the interface locale should localize OpenAPI document prose.
 *
 * @param localeCode - Short interface locale code.
 * @returns `true` when a document overlay applies.
 */
export function shouldLocalizeOpenApiDocumentForInterfaceLocale(
	localeCode: string
): localeCode is OpenApiDocumentInterfaceLocale {
	return ( OPENAPI_DOCUMENT_INTERFACE_LOCALES as readonly string[] ).includes( localeCode )
}
