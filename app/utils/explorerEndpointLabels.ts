import type { ExplorerModuleOperation } from '../composables/useExplorerBootstrap'

/**
 * Resolves the OpenAPI path label for an endpoint (accessible name / fallback).
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
 * Resolves the human-readable endpoint name shown in the module rail.
 *
 * Prefers OpenAPI `summary` (bootstrap already falls back to `operationId`, then path).
 * Falls back to the path template, then the localized banana fallback.
 *
 * @param operation - Module operation metadata from bootstrap.
 * @param endpointFallbackLabel - Localized banana label when name and path are empty.
 * @returns Endpoint display name for the rail row.
 */
export function resolveEndpointNameLabel(
	operation: ExplorerModuleOperation,
	endpointFallbackLabel: string
): string {
	const summary = operation.summary.trim()
	if ( summary ) {
		return summary
	}

	return resolveEndpointPathLabel( operation, endpointFallbackLabel )
}

/**
 * Builds an accessible name for a module rail endpoint control.
 *
 * @param operation - Module operation metadata from bootstrap.
 * @param endpointFallbackLabel - Localized banana label when path/name are empty.
 * @returns Method, display name, and path when they differ.
 */
export function formatEndpointAccessibleLabel(
	operation: ExplorerModuleOperation,
	endpointFallbackLabel: string
): string {
	const pathLabel = resolveEndpointPathLabel( operation, endpointFallbackLabel )
	const nameLabel = resolveEndpointNameLabel( operation, endpointFallbackLabel )

	if ( nameLabel !== pathLabel ) {
		return `${ operation.method } ${ nameLabel }. ${ pathLabel }`
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
