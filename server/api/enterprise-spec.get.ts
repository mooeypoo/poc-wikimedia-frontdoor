import { createError, defineEventHandler, setResponseHeader } from 'h3'

/**
 * Upstream URL for the Enterprise OpenAPI spec. Exported so sibling server
 * routes (e.g. enterprise-spec-parsed) share a single source of truth.
 */
export const ENTERPRISE_SPEC_UPSTREAM_URL = 'https://api.enterprise.wikimedia.com/spec/spec.yaml'

/** User-Agent sent with every upstream fetch. Exported for reuse. */
export const ENTERPRISE_SPEC_USER_AGENT = 'frontdoor-dev-portal/0.1 (https://www.mediawiki.org/wiki/Front_Door_Developer_Portal)'

export default defineEventHandler( async ( event ) => {
	try {
		const spec = await $fetch<string>( ENTERPRISE_SPEC_UPSTREAM_URL, {
			headers: { 'user-agent': ENTERPRISE_SPEC_USER_AGENT },
			responseType: 'text'
		} )
		setResponseHeader( event, 'content-type', 'text/yaml; charset=utf-8' )
		return spec
	} catch ( error: unknown ) {
		const statusCode =
			typeof error === 'object' &&
			error !== null &&
			'statusCode' in error &&
			typeof ( error as Record<string, unknown> ).statusCode === 'number'
				? ( error as { statusCode: number } ).statusCode
				: 502
		throw createError( { statusCode, statusMessage: 'Failed to fetch Enterprise spec from upstream.' } )
	}
} )
