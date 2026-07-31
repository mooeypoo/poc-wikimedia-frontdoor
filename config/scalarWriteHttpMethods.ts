/**
 * HTTP methods treated as write operations in the Scalar API client modal.
 *
 * Used to decide when write-endpoint warnings appear under the Test Request address bar.
 */
export const SCALAR_WRITE_HTTP_METHODS = [
	'post',
	'put',
	'delete',
	'patch'
] as const

export type ScalarWriteHttpMethod = typeof SCALAR_WRITE_HTTP_METHODS[number]
