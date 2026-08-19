/**
 * @wikimedia/banana-content — public API.
 *
 * Generate per-locale content files from a single source file, using
 * banana-i18n messages.
 *
 * This module is the pure core: it performs no file system access. The Node
 * runner and CLI build on it.
 */

export { Diagnostics } from './core/diagnostics.js'
export { parseSource } from './core/source.js'
export { buildCatalog, keysUsedBy, translatedPercent } from './core/catalog.js'
export {
	renderSource,
	createResolver,
	mergeChain,
	escapeForContexts,
	warnOnDiscouragedMagicWords,
	DISCOURAGED_MAGIC_WORDS
} from './core/render.js'
export { keyPrefixForPath, resolveKey, isQualified } from './core/keys.js'
export { markdown, yamlFrontmatter } from './formats/markdown.js'
export { plainText } from './formats/plainText.js'

/** Defaults applied to any option a config leaves unset. */
export const DEFAULT_CONFIG = {
	format: 'markdown',
	source: { include: [ '**/*' ], exclude: [], definitionsOnly: [ '**/_*', '_*/**' ] },
	messages: { sourceLocale: 'en', documentationLocale: 'qqq', indent: 2 },
	output: { path: '%locale%/%path%', overrides: {} },
	locales: { minTranslatedPercent: 0 },
	keys: { prefix: 'content-', pattern: '^content-[a-z0-9-]+$' },
	marker: { name: 'message', definitionsBlock: 'messages' },
	ownership: { manifest: '.banana-content-manifest.json', marker: 'i18nGenerated' }
}

/**
 * Identity helper that gives a JavaScript config file editor completion and
 * type checking without importing types at runtime.
 *
 * @param {object} config - Configuration object.
 * @returns {object} The same object.
 */
export function defineConfig( config ) {
	return config
}
