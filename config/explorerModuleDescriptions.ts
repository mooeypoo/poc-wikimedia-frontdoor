/**
 * config/explorerModuleDescriptions.ts
 *
 * Curated banana-i18n keys for REST API module one-line descriptions when a
 * module's OpenAPI `info.description` is missing. Keys are keyed by discovery
 * module name (for example `readinglists/v0`).
 *
 * Descriptions with OpenAPI metadata are extracted at bootstrap time and do not
 * need entries here.
 */
export const EXPLORER_MODULE_DESCRIPTION_MESSAGE_KEYS: Record<string, string> = {
	'readinglists/v0': 'explorer-module-description-readinglists-v0'
}
