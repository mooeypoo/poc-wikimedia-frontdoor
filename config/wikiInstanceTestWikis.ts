/**
 * Test wiki base URLs for safe write-request experimentation in the Scalar API client.
 *
 * Production explorer instances map to their corresponding Wikimedia test wikis.
 */
export const WIKI_INSTANCE_TEST_WIKI_BASE_URLS = {
	commonswiki: 'https://test-commons.wikimedia.org',
	wikidata: 'https://test.wikidata.org'
} as const

/** Default test wiki base URL for Wikipedia (and other) language wikis. */
export const DEFAULT_WIKIPEDIA_TEST_WIKI_BASE_URL = 'https://test.wikipedia.org'

/**
 * Returns the test wiki base URL for a selected explorer wiki instance.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns Absolute test wiki base URL without a trailing slash.
 */
export function getTestWikiBaseUrlForWikiInstance( wikiInstanceId: string ): string {
	if ( wikiInstanceId in WIKI_INSTANCE_TEST_WIKI_BASE_URLS ) {
		return WIKI_INSTANCE_TEST_WIKI_BASE_URLS[ wikiInstanceId as keyof typeof WIKI_INSTANCE_TEST_WIKI_BASE_URLS ]
	}

	return DEFAULT_WIKIPEDIA_TEST_WIKI_BASE_URL
}

/**
 * Returns the test wiki hostname label for interface copy.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns Test wiki hostname (for example `test.wikipedia.org`).
 */
export function getTestWikiDisplayHostForWikiInstance( wikiInstanceId: string ): string {
	return new URL( getTestWikiBaseUrlForWikiInstance( wikiInstanceId ) ).host
}

/**
 * Returns whether the selected explorer instance has a mapped test wiki.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns True when write requests can be routed to a test wiki.
 */
export function hasTestWikiForWikiInstance( wikiInstanceId: string ): boolean {
	return Boolean( getTestWikiBaseUrlForWikiInstance( wikiInstanceId ) )
}

/**
 * Returns the test wiki URL label for a selected explorer wiki instance.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns Test wiki hostname for interface copy.
 */
export function getTestWikiUrlForWikiInstance( wikiInstanceId: string ): string {
	return getTestWikiDisplayHostForWikiInstance( wikiInstanceId )
}
