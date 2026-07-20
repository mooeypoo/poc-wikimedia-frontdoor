import { resolve } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Vite plugin that redirects Scalar's `map-config-plugins` helper to the Front Door
 * implementation so ClientPlugin write warnings reach the Test Request modal.
 *
 * A `resolve.alias` alone is not always applied when `@scalar/api-reference` is
 * pre-bundled under `optimizeDeps`.
 *
 * @param projectRootDirectory - Absolute path to the Nuxt project root.
 * @returns Vite resolve plugin.
 */
export function scalarMapConfigPluginsResolvePlugin( projectRootDirectory: string ): Plugin {
	const stockMapConfigPluginsPath = resolve(
		projectRootDirectory,
		'node_modules/@scalar/api-reference/dist/helpers/map-config-plugins.js'
	)
	const replacementPath = resolve(
		projectRootDirectory,
		'app/scalar/explorerMapConfigPlugins.client.ts'
	)

	return {
		name: 'front-door-scalar-map-config-plugins',
		enforce: 'pre',
		resolveId( source, importer ) {
			if ( source === stockMapConfigPluginsPath || source.endsWith( 'map-config-plugins.js' ) ) {
				if (
					importer?.includes( '@scalar/api-reference' )
					|| source.includes( '@scalar/api-reference' )
					|| source === stockMapConfigPluginsPath
				) {
					return replacementPath
				}
			}

			return null
		}
	}
}
