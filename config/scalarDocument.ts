/**
 * The Scalar document slug, isolated in a self-contained leaf module (no imports).
 *
 * Split out of `config/scalar.ts` so Node scripts can load it directly — the
 * endpoint search index generator derives operation hashes with Scalar's own id
 * builders, which need this exact slug, and `config/scalar.ts` pulls in the
 * extensionless imports that Node cannot resolve outside the app build (see the
 * note in tests/moduleSourceOfTruth.test.mjs). App code should keep importing
 * this from `config/scalar`, which re-exports it.
 */

/**
 * Stable Scalar document slug used for operation navigation ids.
 *
 * Must match the `slug` passed in `SCALAR_DEFAULT_CONFIGURATION`, and is the
 * first segment Scalar strips from a navigation id when building the URL hash
 * in single-document mode. Changing it changes every generated endpoint deep
 * link — regenerate the endpoint search index if it ever moves.
 */
export const SCALAR_DOCUMENT_SLUG = 'front-door-api-explorer'
