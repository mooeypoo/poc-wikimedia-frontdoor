/**
 * Defines the wiki instances available in the Front Door explorer.
 *
 * Spec URLs are not stored here. They are resolved at runtime from each
 * instance discovery endpoint.
 */
export interface WikiInstanceConfig {
	id: string
	displayName: string
	baseUrl: string
	dir: 'ltr' | 'rtl'
	language: string
}

export const WIKI_INSTANCES: WikiInstanceConfig[] = [
	{
		id: 'enwiki',
		displayName: 'English Wikipedia',
		baseUrl: 'https://en.wikipedia.org',
		dir: 'ltr',
		language: 'en'
	},
	{
		id: 'eswiki',
		displayName: 'Spanish Wikipedia',
		baseUrl: 'https://es.wikipedia.org',
		dir: 'ltr',
		language: 'es'
	},
	{
		id: 'hewiki',
		displayName: 'Hebrew Wikipedia',
		baseUrl: 'https://he.wikipedia.org',
		dir: 'rtl',
		language: 'he'
	},
	{
		id: 'fawiki',
		displayName: 'Farsi Wikipedia',
		baseUrl: 'https://fa.wikipedia.org',
		dir: 'rtl',
		language: 'fa'
	},
	{
		id: 'commonswiki',
		displayName: 'Wikimedia Commons',
		baseUrl: 'https://commons.wikimedia.org',
		dir: 'ltr',
		language: 'en'
	},
	{
		id: 'wikidata',
		displayName: 'Wikidata',
		baseUrl: 'https://www.wikidata.org',
		dir: 'ltr',
		language: 'en'
	}
]

/**
 * Returns a wiki instance configuration by id.
 *
 * @param wikiInstanceId - Wiki instance id from UI state.
 * @returns Instance configuration, or undefined when the id is unknown.
 */
export function getWikiInstanceById( wikiInstanceId: string ): WikiInstanceConfig | undefined {
	return WIKI_INSTANCES.find( ( wikiInstance ) => wikiInstance.id === wikiInstanceId )
}
