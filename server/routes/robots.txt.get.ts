import { defineEventHandler, setHeader } from 'h3'

import { buildRobotsTxt } from '../../app/utils/seoDocuments.ts'
import { ROBOTS_DISALLOWED_PATHS, resolveSiteOrigin } from '../../config/seo.ts'

/**
 * Serves `robots.txt`.
 *
 * A route rather than a static `public/robots.txt` so the `Sitemap:` directive
 * can carry the resolved absolute site origin instead of a hardcoded host. The
 * route is prerendered, so in production this is a static file on the CDN.
 */
export default defineEventHandler( ( event ) => {
	const siteOrigin = resolveSiteOrigin()

	setHeader( event, 'content-type', 'text/plain; charset=utf-8' )

	return buildRobotsTxt( {
		disallowedPaths: ROBOTS_DISALLOWED_PATHS,
		sitemapUrl: siteOrigin ? `${ siteOrigin }/sitemap.xml` : undefined
	} )
} )
