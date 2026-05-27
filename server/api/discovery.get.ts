import { createError, defineEventHandler, getQuery } from 'h3'
import { getWikiInstanceById } from '../../config/instances'

const DISCOVERY_USER_AGENT =
	'frontdoor-dev-portal/0.1 (https://www.mediawiki.org/wiki/Front_Door_Developer_Portal)'

/**
 * Proxies Wikimedia discovery endpoint requests from the same origin.
 *
 * Wikimedia discovery blocks browser requests with localhost Origin headers,
 * so this route fetches discovery server-side and returns the upstream JSON.
 */
export default defineEventHandler( async ( event ) => {
	const query = getQuery( event )
	const wikiInstanceId = typeof query.wikiInstanceId === 'string' ? query.wikiInstanceId : ''
	const selectedWikiInstance = getWikiInstanceById( wikiInstanceId )

	if ( !selectedWikiInstance ) {
		throw createError( {
			statusCode: 400,
			statusMessage: 'Unknown wiki instance id.'
		} )
	}

	const discoveryUrl = `${ selectedWikiInstance.baseUrl }/w/rest.php/specs/v0/discovery`

	try {
		return await $fetch( discoveryUrl, {
			headers: {
				'user-agent': DISCOVERY_USER_AGENT
			}
		} )
	} catch ( error: unknown ) {
		const statusCode =
			typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number'
				? error.statusCode
				: 502

		throw createError( {
			statusCode,
			statusMessage: 'Failed to fetch discovery from upstream instance.'
		} )
	}
} )
