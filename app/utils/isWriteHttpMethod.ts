import { SCALAR_WRITE_HTTP_METHODS } from '../../config/scalarWriteHttpMethods'

/**
 * Returns whether an HTTP method is a write operation for Scalar client warnings.
 *
 * @param httpMethod - HTTP verb from an OpenAPI operation or address bar (any casing).
 * @returns True for POST, PUT, DELETE, and PATCH.
 */
export function isWriteHttpMethod( httpMethod: string | null | undefined ): boolean {
	if ( !httpMethod ) {
		return false
	}

	const normalizedMethod = httpMethod.trim().toLowerCase()

	return ( SCALAR_WRITE_HTTP_METHODS as readonly string[] ).includes( normalizedMethod )
}
