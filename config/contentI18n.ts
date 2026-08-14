/**
 * Translatable prose content — configuration.
 *
 * Message-driven pages are authored once in English under
 * `CONTENT_I18N_BASE_DIRECTORY`, extracted into the build-time-only message
 * namespace at `CONTENT_I18N_MESSAGE_DIRECTORY`, and expanded back into
 * per-locale Markdown under `CONTENT_I18N_OUTPUT_DIRECTORY` by the standalone
 * `npm run generate-content-i18n` command.
 *
 * These messages are NEVER loaded at runtime. `app/plugins/banana-i18n.ts`
 * imports `i18n/*.json` (interface strings) and must not import
 * `i18n/content/*.json` — see docs/adr-translatable-prose-content.md §1.
 */

/** Root of the English source files, relative to the repository root. */
export const CONTENT_I18N_BASE_DIRECTORY = 'content-i18n'

/** Where extracted prose messages live, relative to the repository root. */
export const CONTENT_I18N_MESSAGE_DIRECTORY = 'i18n/content'

/** Nuxt Content root that generated pages are written into. */
export const CONTENT_I18N_OUTPUT_DIRECTORY = 'content'

/** Source locale: the language the base files are authored in. */
export const CONTENT_I18N_SOURCE_LOCALE = 'en'

/**
 * Reserved key namespace. Every prose message key starts with this, which is
 * also how a fully-qualified cross-file reference is told apart from a
 * page-local one (ADR §6).
 */
export const CONTENT_I18N_KEY_PREFIX = 'content-'

/** Prose message keys must match this once namespaced (ADR §11). */
export const CONTENT_I18N_KEY_PATTERN = /^content-[a-z0-9-]+$/

/**
 * Minimum share of a page's messages that must be translated before that
 * locale gets a generated file. Below it, no file is written and Nuxt content
 * fallback serves English — which reads better than a page that is mostly
 * English with a few translated fragments, and avoids mixing directions on a
 * right-to-left locale (ADR §9).
 *
 * Deliberately independent of the remote-import threshold in
 * `config/remoteContentSources.ts`: imported wiki pages and authored prose
 * pages have different completeness economics.
 *
 * Set to 0 for the current experiment, so every locale with a message file is
 * exercised.
 */
export const CONTENT_I18N_MIN_TRANSLATED_PERCENT = 0

/**
 * Frontmatter marker identifying a script-managed generated page. The wipe
 * phase deletes exactly the files carrying this field; hand-authored content
 * never has it, and imported content carries `remoteImport` instead (ADR §8).
 */
export const CONTENT_I18N_GENERATED_MARKER = 'i18nGenerated'
