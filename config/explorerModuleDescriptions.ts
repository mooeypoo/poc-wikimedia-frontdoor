/**
 * config/explorerModuleDescriptions.ts
 *
 * Curated banana-i18n keys for REST API module one-line descriptions when a
 * module's OpenAPI `info.description` is missing. Keys are keyed by discovery
 * module name (for example `readinglists/v0`).
 *
 * `EXPLORER_MODULE_DESCRIPTION_OPENAPI_SUFFIX_STRIP_PATTERNS` removes trailing
 * boilerplate from normalized OpenAPI descriptions at bootstrap (for example
 * Site API access footnotes on `site/v1`). Applied in
 * `normalizeOpenApiModuleDescription()` via module name.
 *
 * Descriptions with full OpenAPI metadata are extracted at bootstrap time and do
 * not need fallback keys unless suffix stripping is configured here.
 */
export const EXPLORER_MODULE_DESCRIPTION_MESSAGE_KEYS: Record<string, string> = {
	'readinglists/v0': 'explorer-module-description-readinglists-v0'
}

/**
 * Regex patterns that remove trailing OpenAPI description boilerplate per module
 * after markdown normalization. Keyed by discovery module name (for example `site/v1`).
 */
export const EXPLORER_MODULE_DESCRIPTION_OPENAPI_SUFFIX_STRIP_PATTERNS: Record<string, RegExp> = {
	'site/v1': /\s*For more information about who can access this API,.+$/i
}
