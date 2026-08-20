import { createError, defineEventHandler } from 'h3'

import { referenceSlugToModuleName } from '../../../config/referenceRoutes.ts'
import {
	CollidingAnchorsError,
	MissingModuleSpecError,
	projectModuleReference,
	type ReferenceModuleProjection
} from '../../utils/referenceProjection.ts'

/**
 * Tier-1 reference projection for one REST API module.
 *
 * A thin HTTP wrapper: slug resolution, then `projectModuleReference`, which is
 * shared with the `llms.txt` / `llms-full.txt` surfaces so a page and a machine
 * surface can never describe the same operation differently.
 */

/**
 * Extracts the module slug from a catch-all route parameter.
 *
 * Module names span multiple segments (`site/v1`), so the tail is rejoined
 * verbatim — the reason the route is a catch-all at all.
 *
 * @param moduleParameter - Raw `module` route param.
 * @returns The slug (e.g. `site/v1`, `general`), or an empty string.
 */
function readModuleSlug( moduleParameter: unknown ): string {
	if ( Array.isArray( moduleParameter ) ) {
		return moduleParameter.filter( Boolean ).join( '/' )
	}
	return typeof moduleParameter === 'string' ? moduleParameter : ''
}

export default defineEventHandler( async ( event ): Promise<ReferenceModuleProjection> => {
	const slug = readModuleSlug( event.context.params?.module )

	if ( !slug ) {
		throw createError( { statusCode: 400, statusMessage: 'Missing module slug.' } )
	}

	try {
		const projection = await projectModuleReference( referenceSlugToModuleName( slug ) )

		if ( !projection ) {
			throw createError( { statusCode: 404, statusMessage: 'Unknown module.' } )
		}

		return projection
	} catch ( error ) {
		if ( error instanceof MissingModuleSpecError ) {
			throw createError( {
				statusCode: 404,
				statusMessage: 'No committed spec for this module.'
			} )
		}
		if ( error instanceof CollidingAnchorsError ) {
			throw createError( { statusCode: 500, statusMessage: error.message } )
		}
		throw error
	}
} )
