/**
 * Interface locales supported in the shell header language picker and banana-i18n.
 *
 * Content locale routing may expose additional codes; this list is the header utility
 * row subset documented in DESIGN_REQUIREMENTS.md.
 */
export const SUPPORTED_INTERFACE_LOCALES = [ 'en', 'es', 'fr', 'he', 'fa' ] as const

/** BCP 47 language tag for a supported shell interface locale. */
export type SupportedInterfaceLocale = typeof SUPPORTED_INTERFACE_LOCALES[ number ]
