import type { OpenAPI } from '@scalar/openapi-types'
import { resolveHttpMethodFromModalElement } from './scalarClientModalHttpMethod'

export type ScalarClientServerMeta =
	| { type: 'document' }
	| { type: 'operation'; path: string; method: OpenAPI.HttpMethod }

/**
 * Extracts the first absolute HTTP(S) URL from address-bar button copy.
 *
 * @param value - Raw text content from the Scalar server button.
 * @returns Matched URL or null when none is present.
 */
function extractAbsoluteHttpUrl( value: string ): string | null {
	const urlMatch = value.match( /https?:\/\/[^\s]+/ )

	return urlMatch?.[ 0 ] ?? null
}

/**
 * Reads the active server URL from the Scalar API client address bar.
 *
 * @param modalRoot - Open modal dialog root.
 * @returns Server URL when present, otherwise null.
 */
export function resolveScalarClientModalServerUrl( modalRoot: Element | null | undefined ): string | null {
	if ( !modalRoot ) {
		return null
	}

	const addressBar = modalRoot.querySelector( '.scalar-address-bar' )

	if ( !addressBar ) {
		return null
	}

	const serverButtons = addressBar.querySelectorAll( 'button.font-code' )

	for ( const serverButton of serverButtons ) {
		const serverUrlText = serverButton.textContent?.trim() ?? ''
		const serverUrl = extractAbsoluteHttpUrl( serverUrlText )

		if ( serverUrl ) {
			return serverUrl
		}
	}

	return null
}

/**
 * Reads the active operation path from the Scalar API client address bar.
 *
 * @param modalRoot - Open modal dialog root.
 * @returns Operation path when present, otherwise null.
 */
export function resolveScalarClientModalPath( modalRoot: Element | null | undefined ): string | null {
	if ( !modalRoot ) {
		return null
	}

	const addressBar = modalRoot.querySelector( '.scalar-address-bar' )

	if ( !addressBar ) {
		return null
	}

	const pathInput = addressBar.querySelector( '[aria-label="Path"] .cm-content' )
	const pathText = pathInput?.textContent?.trim()

	if ( !pathText ) {
		return null
	}

	return pathText.startsWith( '/' ) ? pathText : `/${ pathText }`
}

/**
 * Resolves Scalar server mutator metadata for the open API client modal.
 *
 * @param modalRoot - Open modal dialog root.
 * @returns Document- or operation-scoped server meta for Scalar workspace events.
 */
export function resolveScalarClientModalServerMeta( modalRoot: Element | null | undefined ): ScalarClientServerMeta {
	const httpMethod = resolveHttpMethodFromModalElement( modalRoot )
	const operationPath = resolveScalarClientModalPath( modalRoot )

	if ( httpMethod && operationPath ) {
		return {
			type: 'operation',
			path: operationPath,
			method: httpMethod as OpenAPI.HttpMethod
		}
	}

	return { type: 'document' }
}
