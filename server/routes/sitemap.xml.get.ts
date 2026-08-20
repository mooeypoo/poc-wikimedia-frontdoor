import { createError, defineEventHandler, setHeader } from 'h3'

import { buildSitemapXml, type SitemapEntry } from '../../app/utils/seoDocuments.ts'
import { GENERATED_MODULES } from '../../config/generated/modules.generated.ts'
import { getLanguageByCode } from '../../config/languages.ts'
import {
	REFERENCE_EXPERIMENT_LOCALES,
	referencePathForModule
} from '../../config/referenceRoutes.ts'
import { resolveSiteOrigin } from '../../config/seo.ts'

/**
 * Serves `sitemap.xml` for the static reference surface.
 *
 * Scope is deliberately the reference pages only. They are the pages this
 * experiment publishes, and they can be enumerated **exactly** from the committed
 * module source of truth — no crawling, no guessing. Prose content pages are not
 * listed yet; adding them needs a build-time query over the content collection,
 * which belongs with the tier-1 index-page work.
 *
 * Every entry carries the full `hreflang` alternate set, which is what makes the
 * per-locale pages legible to search engines as translations of one another
 * rather than as duplicates (docs/adr-static-module-documentation.md §10).
 */
export default defineEventHandler( ( event ) => {
	const siteOrigin = resolveSiteOrigin()

	if ( !siteOrigin ) {
		// Should be unreachable: nuxt.config.ts only prerenders this route when an
		// origin is resolvable. Fail loudly rather than emit relative <loc> values,
		// which are invalid per the sitemap schema and would be acted on by crawlers.
		throw createError( {
			statusCode: 500,
			statusMessage: 'Cannot build a sitemap without NUXT_PUBLIC_SITE_URL (or Netlify URL).'
		} )
	}

	/**
	 * Maps a locale code to its BCP 47 tag for `hreflang`.
	 *
	 * The catalogue is authoritative; a locale missing from it falls back to its
	 * own code, which is already a valid tag for every code we publish.
	 *
	 * @param localeCode - Portal locale code.
	 * @returns BCP 47 language tag.
	 */
	function hreflangFor( localeCode: string ): string {
		return getLanguageByCode( localeCode )?.bcp47 ?? localeCode
	}

	/**
	 * Builds the absolute URL for a module page in one locale.
	 *
	 * `prefix_except_default` leaves the default locale unprefixed.
	 *
	 * @param localeCode - Portal locale code.
	 * @param moduleName - Full discovery module name.
	 * @returns Absolute URL.
	 */
	function urlFor( localeCode: string, moduleName: string ): string {
		const localePrefix = localeCode === 'en' ? '' : `/${ localeCode }`
		return `${ siteOrigin }${ localePrefix }${ referencePathForModule( moduleName ) }`
	}

	const entries: SitemapEntry[] = []

	for ( const wikiModule of GENERATED_MODULES ) {
		const alternates = REFERENCE_EXPERIMENT_LOCALES.map( ( localeCode ) => ( {
			hreflang: hreflangFor( localeCode ),
			href: urlFor( localeCode, wikiModule.name )
		} ) )

		for ( const localeCode of REFERENCE_EXPERIMENT_LOCALES ) {
			entries.push( {
				location: urlFor( localeCode, wikiModule.name ),
				alternates
			} )
		}
	}

	setHeader( event, 'content-type', 'application/xml; charset=utf-8' )

	return buildSitemapXml( entries, hreflangFor( 'en' ) )
} )
