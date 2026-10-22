import { createError, defineEventHandler, getQuery } from 'h3'
import { shouldLocalizeOpenApiDocumentForInterfaceLocale } from '../../config/explorerOpenApiInterfaceLocale'
import { localizeOpenApiDocumentForInterfaceLocale } from '../../app/utils/localizeOpenApiDocument'

const OPENAPI_USER_AGENT =
	'frontdoor-dev-portal/0.1 (https://www.mediawiki.org/wiki/Front_Door_Developer_Portal)'

/**
 * Proxies an upstream OpenAPI document and applies an interface-locale prose overlay.
 *
 * Browser fetches of Wikimedia OpenAPI URLs can fail under localhost Origin
 * restrictions (same class of problem as `/api/discovery`). This route fetches
 * server-side, then rewrites `summary` / `description` / `title` for design-locale
 * Hebrew so Scalar can be fed `content` instead of `url`.
 *
 * @returns Localized OpenAPI JSON object.
 */
export default defineEventHandler( async ( event ) => {
	const query = getQuery( event )
	const openApiSpecUrl = typeof query.url === 'string' ? query.url : ''
	const interfaceLocale = typeof query.locale === 'string' ? query.locale : ''

	if ( !openApiSpecUrl || !/^https:\/\//.test( openApiSpecUrl ) ) {
		throw createError( {
			statusCode: 400,
			statusMessage: 'A https OpenAPI url query parameter is required.'
		} )
	}

	if ( !shouldLocalizeOpenApiDocumentForInterfaceLocale( interfaceLocale ) ) {
		throw createError( {
			statusCode: 400,
			statusMessage: 'Interface locale does not use an OpenAPI document overlay.'
		} )
	}

	try {
		const openApiDocument = await $fetch<Record<string, unknown> | string>( openApiSpecUrl, {
			headers: {
				accept: 'application/json',
				'user-agent': OPENAPI_USER_AGENT
			}
		} )

		const parsedDocument = typeof openApiDocument === 'string'
			? JSON.parse( openApiDocument ) as Record<string, unknown>
			: openApiDocument

		return localizeOpenApiDocumentForInterfaceLocale( parsedDocument, interfaceLocale )
	} catch ( error: unknown ) {
		const statusCode =
			typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number'
				? error.statusCode
				: 502

		throw createError( {
			statusCode,
			statusMessage: 'Failed to fetch or localize upstream OpenAPI document.'
		} )
	}
} )
