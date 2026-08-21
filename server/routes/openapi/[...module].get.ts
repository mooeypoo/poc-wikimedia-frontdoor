import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { createError, defineEventHandler, setHeader } from 'h3'

import { getModuleByName } from '../../../config/moduleSourceOfTruth.ts'
import { referenceSlugToModuleName } from '../../../config/referenceRoutes.ts'

/** Directory holding the committed per-module specs. */
const MODULE_SPECS_DIRECTORY = 'config/generated/module-specs'

/**
 * Serves a module's committed OpenAPI spec verbatim at a stable URL.
 *
 * `/openapi/site/v1.json`, `/openapi/general.json`
 *
 * **Why a separate prefix rather than `/reference/<module>/openapi.json`.** The
 * reference page is a catch-all (`app/pages/reference/[...module].vue`), so a
 * path like `/reference/site/v1/openapi.json` is indistinguishable from a module
 * named `site/v1/openapi.json` — the filename would be swallowed into the module
 * tail. A distinct top-level prefix removes the ambiguity entirely instead of
 * relying on route-precedence subtleties between Nitro routes and Vue pages.
 *
 * Specs are served **verbatim, `$ref`s unresolved** — that is the authoritative
 * form (docs/adr-module-source-of-truth.md §3), and parsers resolve refs. This
 * route deliberately does no projection: it is the machine-readable escape hatch
 * for anything the tier-1 pages omit, schema trees included.
 *
 * **The file is streamed as raw text, not parsed and re-serialised.** Returning a
 * parsed object let Nitro re-encode it, which minified the JSON and silently
 * discarded the recursive key ordering and pretty-printing that
 * `generate-module-source-of-truth` applies deliberately (§8 there: stable
 * ordering is what makes a regen diff reviewable). The bytes served now match the
 * committed bytes exactly, which is what "verbatim" has to mean if the word is
 * doing any work.
 */
export default defineEventHandler( async ( event ) => {
	const moduleParameter = event.context.params?.module
	const rawSlug = Array.isArray( moduleParameter )
		? moduleParameter.filter( Boolean ).join( '/' )
		: typeof moduleParameter === 'string' ? moduleParameter : ''

	if ( !rawSlug ) {
		throw createError( { statusCode: 400, statusMessage: 'Missing module slug.' } )
	}

	// The `.json` extension is part of the public URL, not part of the slug.
	const slug = rawSlug.replace( /\.json$/, '' )
	const wikiModule = getModuleByName( referenceSlugToModuleName( slug ) )

	if ( !wikiModule ) {
		throw createError( { statusCode: 404, statusMessage: 'Unknown module.' } )
	}

	let specText: string
	try {
		specText = await readFile(
			join( MODULE_SPECS_DIRECTORY, `${ wikiModule.specFile }.generated.json` ),
			'utf8'
		)
	} catch {
		throw createError( {
			statusCode: 404,
			statusMessage: 'No committed spec for this module.'
		} )
	}

	setHeader( event, 'content-type', 'application/json; charset=utf-8' )

	return specText
} )
