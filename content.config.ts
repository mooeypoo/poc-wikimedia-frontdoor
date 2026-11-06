import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

import { listContentLocaleDirectories } from './scripts/lib/contentSidebarMap.mjs'
import { SHARED_CONTENT_COLLECTION, contentCollectionForLocale } from './config/contentCollections.ts'

const navLink = z.object( {
	text: z.string(),
	link: z.string()
} )

const pageSchema = z.object( {
	prev: navLink.optional(),
	next: navLink.optional(),
	// Per-page sidebar control (see docs/content-authoring-guide.md):
	//   false        → hide the sidebar; content spans full width
	//   true         → show this page's path-based section menu
	//   "<menu-id>"  → force a named menu (key of
	//                  SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID)
	//   (omitted)    → automatic, path-based resolution
	sidebar: z.union( [ z.boolean(), z.string() ] ).optional()
} )

const projectRootDirectory = dirname( fileURLToPath( import.meta.url ) )
const contentDirectory = join( projectRootDirectory, 'content' )

/*
 * One collection per content/<locale> directory, so search can filter to a
 * reader's locale (and fallback chain) ahead of the FTS rank cutoff instead of
 * after it — see ARCHITECTURE.md's Search section for the ranking-starvation
 * bug this fixes and why. Plus one `shared` collection for
 * content/_partials/shared/*, which holds locale-independent partials and so
 * doesn't belong under any locale directory.
 */
export default defineContentConfig( {
	collections: {
		[ SHARED_CONTENT_COLLECTION ]: defineCollection( {
			type: 'page',
			source: '_partials/**',
			schema: pageSchema
		} ),
		...Object.fromEntries(
			listContentLocaleDirectories( contentDirectory ).map( ( locale ) => [
				contentCollectionForLocale( locale ),
				defineCollection( {
					type: 'page',
					source: `${ locale }/**`,
					schema: pageSchema
				} )
			] )
		)
	}
} )
