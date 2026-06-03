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
				next: navLink.optional()
			} )
		} )
	}
} )
