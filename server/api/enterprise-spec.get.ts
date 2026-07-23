import { createError, defineEventHandler, setResponseHeader } from 'h3'

/**
 * Storage key of the bundled Enterprise OpenAPI spec inside Nitro's server
 * assets (`server/assets/`). The spec is served from the local system rather
 * than fetched from the (now unavailable) remote endpoint. Exported so sibling
 * server routes (e.g. enterprise-spec-parsed) share a single source of truth.
 */
export const ENTERPRISE_SPEC_ASSET_KEY = 'wme-api.yaml'

/**
 * Reads the bundled Enterprise OpenAPI spec YAML from server assets.
 *
 * Exported so the parsed-outline route reads the identical source. Uses Nitro's
 * server-asset storage (`assets:server`) so the file is included in the
 * serverless bundle rather than read from a relative filesystem path.
 *
 * @returns Raw YAML text of the Enterprise spec.
 * @throws {H3Error} 500 when the asset is missing from the bundle or empty.
 */
export async function readEnterpriseSpecYaml(): Promise<string> {
	const spec = await useStorage( 'assets:server' ).getItem<string>( ENTERPRISE_SPEC_ASSET_KEY )
	if ( typeof spec !== 'string' || spec.length === 0 ) {
		throw createError( {
			statusCode: 500,
			statusMessage: 'Enterprise spec asset is missing or empty.'
		} )
	}
	return spec
}

export default defineEventHandler( async ( event ) => {
	const spec = await readEnterpriseSpecYaml()
	setResponseHeader( event, 'content-type', 'text/yaml; charset=utf-8' )
	return spec
} )
