/** Defaults applied to any option a config file leaves unset. */
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

/** Config file names, in resolution order. */
export const CONFIG_FILENAMES = [
	'banana-content.config.mjs',
	'banana-content.config.js',
	'banana-content.config.json'
]

/** Marker and definitions-block names must look like directive names. */
export const MARKER_NAME_PATTERN = /^[a-z][a-z0-9-]*$/
