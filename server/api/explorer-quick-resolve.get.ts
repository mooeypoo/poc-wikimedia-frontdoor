import { createError, defineEventHandler, getQuery } from 'h3'
import { getModuleByName, resolvePreferredModuleInstance } from '../../config/moduleSourceOfTruth'

/**
 * Resolves a quick community deep-link (`/explorer/q/<module>`) to the instance
 * that should host it.
 *
 * The client cannot resolve this itself without bundling the source-of-truth
 * registries (the accessor builds an 841-instance lookup map at module load, so
 * it is not tree-shakeable). This route keeps that data server-side and returns
 * the preferred instance id for the requested module — the first of
 * `QUICK_LINK_INSTANCE_PREFERENCE` that exposes it, else the module's first
 * instance — which the client uses to canonicalize the URL to the verbose
 * `direct` form (ADR §6).
 *
 * @returns `{ moduleName, instanceId }` for a known module.
 * @throws 400 when no module is given; 404 when the module is unknown.
 */
export default defineEventHandler( ( event ) => {
	const query = getQuery( event )
	const moduleName = typeof query.module === 'string' ? query.module : ''

	if ( !moduleName ) {
		throw createError( {
			statusCode: 400,
			statusMessage: 'Missing module name.'
		} )
	}

	const resolvedModule = getModuleByName( moduleName )

	if ( !resolvedModule ) {
		throw createError( {
			statusCode: 404,
			statusMessage: 'Unknown module.'
		} )
	}

	return {
		moduleName: resolvedModule.name,
		instanceId: resolvePreferredModuleInstance( resolvedModule )
	}
} )
