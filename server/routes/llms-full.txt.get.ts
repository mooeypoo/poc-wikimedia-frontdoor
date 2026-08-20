import { createError, defineEventHandler, setHeader } from 'h3'

import { buildLlmsFullCorpus } from '../../app/utils/llmsDocuments.ts'
import { resolveSiteOrigin } from '../../config/seo.ts'
import { buildLlmsModuleEntries } from '../utils/llmsEntries.ts'

/**
 * Serves `/llms-full.txt` — every module's operation prose in one document.
 *
 * This is the surface that most directly addresses AI invisibility: one fetch
 * yields the whole corpus, with no JavaScript to execute and no crawl budget
 * spent on hundreds of pages. Measured prose is ~59 KB today and ~295 KB
 * projected at 50 modules, comfortably one file.
 */
export default defineEventHandler( async ( event ) => {
	const siteOrigin = resolveSiteOrigin()

	if ( !siteOrigin ) {
		throw createError( {
			statusCode: 500,
			statusMessage: 'Cannot build llms-full.txt without NUXT_PUBLIC_SITE_URL (or Netlify URL).'
		} )
	}

	setHeader( event, 'content-type', 'text/plain; charset=utf-8' )

	return buildLlmsFullCorpus( {
		siteOrigin,
		modules: await buildLlmsModuleEntries( siteOrigin )
	} )
} )
