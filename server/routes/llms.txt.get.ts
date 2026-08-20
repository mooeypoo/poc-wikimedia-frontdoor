import { createError, defineEventHandler, setHeader } from 'h3'

import { buildLlmsIndex } from '../../app/utils/llmsDocuments.ts'
import { resolveSiteOrigin } from '../../config/seo.ts'
import { buildLlmsModuleEntries } from '../utils/llmsEntries.ts'

/**
 * Serves `/llms.txt` — the machine-readable index of documented modules.
 *
 * Requires an absolute site origin, for the same reason the sitemap does: the
 * document is a set of links, and links to a guessed host are worse than no
 * document. `nuxt.config.ts` only prerenders this route when an origin resolves,
 * so reaching the throw means the guard was bypassed.
 */
export default defineEventHandler( async ( event ) => {
	const siteOrigin = resolveSiteOrigin()

	if ( !siteOrigin ) {
		throw createError( {
			statusCode: 500,
			statusMessage: 'Cannot build llms.txt without NUXT_PUBLIC_SITE_URL (or Netlify URL).'
		} )
	}

	setHeader( event, 'content-type', 'text/plain; charset=utf-8' )

	return buildLlmsIndex( {
		siteOrigin,
		modules: await buildLlmsModuleEntries( siteOrigin ),
		fullCorpusPath: '/llms-full.txt'
	} )
} )
