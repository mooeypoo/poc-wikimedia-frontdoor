/**
 * Single source of truth for Nuxt Content collection naming, imported both by
 * `content.config.ts` (defines the collections) and by app code (looks pages
 * up in them) so the `content_` prefix never has to be retyped or drift.
 *
 * `content.config.ts` defines one collection per `content/<locale>` directory
 * (named via `contentCollectionForLocale`) plus one `shared` collection for
 * `content/_partials/shared/*`, which holds locale-independent partials and
 * therefore isn't part of any locale's collection.
 */
import type { Collections } from '@nuxt/content'

/** Collection holding shared, locale-independent partials (`content/_partials/shared/*`). */
export const SHARED_CONTENT_COLLECTION = 'shared'

/**
 * The collection name for a locale's content (`content/<localeCode>/**`).
 *
 * Nuxt Content only accepts collection names that are valid JS identifiers
 * (`resolveCollection()` in `node_modules/@nuxt/content/dist/module.mjs`
 * tests `/^[a-z_]\w*$/i` and silently drops anything else, logging a warning
 * rather than failing the build), so a hyphenated directory like `pt-br`
 * cannot be used verbatim — it has to become `content_pt_br`.
 *
 * Typed `keyof Collections` (a cast, since the name is built at runtime) for
 * query call sites (`queryCollection`, `useSearchCollection`), which only
 * accept one of the literal collection names `@nuxt/content` generates from
 * content.config.ts. The cast is safe because this is exactly the name
 * content.config.ts gives that locale's collection.
 *
 * @param localeCode - Locale directory name under `content/` (e.g. `fr`, `pt-br`).
 * @returns Collection name, e.g. `content_fr` or `content_pt_br`.
 */
export function contentCollectionForLocale( localeCode: string ): keyof Collections {
	return `content_${ localeCode.replace( /-/g, '_' ) }` as keyof Collections
}
