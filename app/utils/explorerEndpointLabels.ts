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

/**
 * Resolves the bootstrap operation id for a module rail selection target.
 *
 * @param moduleItem - Module containing the operations list.
 * @param operationTarget - Operation the user selected in the module rail.
 * @returns Matching operation id, or null when no row matches.
 */
export function resolveEndpointOperationId(
	moduleItem: { operations: ExplorerModuleOperation[] } | null | undefined,
	operationTarget: {
		method: string
		path: string
		operationId?: string
	}
): string | null {
	if ( !moduleItem ) {
		return null
	}

	const normalizedMethod = operationTarget.method.toLowerCase()
	const normalizedPath = operationTarget.path.trim()
	const normalizedOperationId = operationTarget.operationId?.trim()

	const matchedOperation = moduleItem.operations.find( ( operation ) => {
		if ( operation.method.toLowerCase() !== normalizedMethod ) {
			return false
		}

		if ( operation.path.trim() !== normalizedPath ) {
			return false
		}

		if ( normalizedOperationId ) {
			return operation.operationId?.trim() === normalizedOperationId
		}

		return true
	} )

	return matchedOperation?.id ?? null
}
