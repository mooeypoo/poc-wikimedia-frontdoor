import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Precise `new URL(…, import.meta.url)` pattern (no `.+` / `/s`).
 *
 * @see https://github.com/vitejs/vite/issues/21696
 * @see https://github.com/vitejs/vite/pull/21800
 */
const SAFE_ASSET_IMPORT_META_URL_PATTERN =
	"\\bnew\\s+URL\\s*\\(\\s*(?:'[^']+'|\"[^\"]+\"|`[^`]+`)\\s*,\\s*import\\.meta\\.url\\s*(?:,\\s*)?\\)"

/**
 * Literal substring Vite 7.3.x emits for the buggy asset URL `filter.code`.
 */
const BUGGY_ASSET_IMPORT_META_URL_FILTER_LITERAL =
	'code: /new\\s+URL.+import\\.meta\\.url/s'

const SAFE_ASSET_IMPORT_META_URL_FILTER_LITERAL =
	`code: /${ SAFE_ASSET_IMPORT_META_URL_PATTERN }/`

/**
 * Rewrite Vite 7.3.x’s catastrophic `assetImportMetaUrl` `filter.code` on disk.
 *
 * Against the optimized `@scalar/api-reference` prebundle (~7MB), the stock
 * filter `/new\s+URL.+import\.meta\.url/s` can backtrack until Node throws
 * **Maximum call stack size exceeded** (vitejs/vite#21696). Upstream fixed
 * this with a precise filter (#21800); Nuxt 4.4 still resolves Vite 7.3.x
 * without that fix. Call once at Nuxt config load, before Vite starts.
 * Idempotent / no-op when the buggy literal is absent. Re-applies after
 * `npm install`. Remove when Nuxt ships a Vite that includes #21800.
 *
 * @param projectRootDirectory - Absolute path to the Nuxt project root.
 * @returns Whether the on-disk Vite bundle was modified.
 */
export function applyViteAssetImportMetaUrlFilterDiskPatch(
	projectRootDirectory: string
): boolean {
	const viteConfigChunkPath = resolve(
		projectRootDirectory,
		'node_modules/vite/dist/node/chunks/config.js'
	)

	let viteConfigChunkSource: string
	try {
		viteConfigChunkSource = readFileSync( viteConfigChunkPath, 'utf8' )
	} catch {
		return false
	}

	if ( !viteConfigChunkSource.includes( BUGGY_ASSET_IMPORT_META_URL_FILTER_LITERAL ) ) {
		return false
	}

	writeFileSync(
		viteConfigChunkPath,
		viteConfigChunkSource.replaceAll(
			BUGGY_ASSET_IMPORT_META_URL_FILTER_LITERAL,
			SAFE_ASSET_IMPORT_META_URL_FILTER_LITERAL
		),
		'utf8'
	)

	return true
}
