/**
 * Test wiki base URLs shown in write-endpoint warnings for safe API experimentation.
 *
 * Production explorer instances map to their corresponding Wikimedia test wikis.
 */
export const WIKI_INSTANCE_TEST_WIKI_URLS = {
	commonswiki: 'https://test-commons.wikimedia.org/',
	wikidata: 'https://test.wikidata.org/'
} as const

/** Default test wiki for Wikipedia (and other) language wikis. */
export const DEFAULT_WIKIPEDIA_TEST_WIKI_URL = 'test.wikipedia.org'

/**
 * Returns the test wiki URL label for a selected explorer wiki instance.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns Test wiki hostname or URL string for interface copy.
 */
export function getTestWikiUrlForWikiInstance( wikiInstanceId: string ): string {
	if ( wikiInstanceId in WIKI_INSTANCE_TEST_WIKI_URLS ) {
		return WIKI_INSTANCE_TEST_WIKI_URLS[ wikiInstanceId as keyof typeof WIKI_INSTANCE_TEST_WIKI_URLS ]
	}

	return DEFAULT_WIKIPEDIA_TEST_WIKI_URL
}
