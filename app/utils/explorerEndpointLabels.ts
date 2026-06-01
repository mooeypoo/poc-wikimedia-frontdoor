import type { ExplorerModuleOperation } from '../composables/useExplorerBootstrap'

/**
 * Resolves the OpenAPI path label shown beside an HTTP method in the module rail.
 *
 * @param operation - Module operation metadata from bootstrap.
 * @param endpointFallbackLabel - Localized banana label when the path is empty.
 * @returns Path template or the fallback label.
 */
export function resolveEndpointPathLabel(
	operation: ExplorerModuleOperation,
	endpointFallbackLabel: string
): string {
	const pathTemplate = operation.path.trim()
	return pathTemplate || endpointFallbackLabel
}

/**
 * Builds an accessible name for a module rail endpoint control.
 *
 * @param operation - Module operation metadata from bootstrap.
 * @param endpointFallbackLabel - Localized banana label when the path is empty.
 * @returns Method, path, and summary when available.
 */
export function formatEndpointAccessibleLabel(
	operation: ExplorerModuleOperation,
	endpointFallbackLabel: string
): string {
	const pathLabel = resolveEndpointPathLabel( operation, endpointFallbackLabel )
	const summary = operation.summary.trim()

	if ( summary && summary !== pathLabel ) {
		return `${ operation.method } ${ pathLabel }. ${ summary }`
	}

	return `${ operation.method } ${ pathLabel }`
}
