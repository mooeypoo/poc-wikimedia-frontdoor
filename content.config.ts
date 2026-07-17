import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const navLink = z.object( {
	text: z.string(),
	link: z.string()
} )

export default defineContentConfig( {
	collections: {
		content: defineCollection( {
			type: 'page',
			source: '**',
			schema: z.object( {
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
		} )
	}
} )
