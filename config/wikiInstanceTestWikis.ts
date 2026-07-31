/**
 * Production → test wiki mapping for write-request warning copy in the Scalar API client.
 *
 * Used to resolve banana-i18n display-name keys for the Test Request modal warning link.
 * Test wikis are not yet selectable explorer instances (discovery wiring pending);
 * base URLs remain for that future switch. Write requests currently hit production.
 */
export const WIKI_INSTANCE_TEST_WIKI_BASE_URLS = {
	commonswiki: 'https://test-commons.wikimedia.org',
	wikidata: 'https://test.wikidata.org'
} as const

/** Default test wiki base URL for Wikipedia (and other) language wikis. */
export const DEFAULT_WIKIPEDIA_TEST_WIKI_BASE_URL = 'https://test.wikipedia.org'

/** banana-i18n keys for test wiki display names used in write-request warning copy. */
export const TEST_WIKI_DISPLAY_NAME_MESSAGE_KEYS = {
	commonswiki: 'explorer-scalar-write-test-wiki-name-commons',
	wikidata: 'explorer-scalar-write-test-wiki-name-wikidata',
	wikipedia: 'explorer-scalar-write-test-wiki-name-wikipedia'
} as const

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
 * Returns the banana-i18n message key for the mapped test wiki display name.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns Message key for Test Wikipedia, Test Wikidata, or Test Wikimedia Commons.
 */
export function getTestWikiDisplayNameMessageKey( wikiInstanceId: string ): string {
	if ( wikiInstanceId === 'wikidata' ) {
		return TEST_WIKI_DISPLAY_NAME_MESSAGE_KEYS.wikidata
	}

	if ( wikiInstanceId === 'commonswiki' ) {
		return TEST_WIKI_DISPLAY_NAME_MESSAGE_KEYS.commonswiki
	}

	return TEST_WIKI_DISPLAY_NAME_MESSAGE_KEYS.wikipedia
}

/**
 * Returns whether the selected explorer instance has a mapped test wiki.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns True when write-request warnings can name a corresponding test wiki.
 */
export function hasTestWikiForWikiInstance( wikiInstanceId: string ): boolean {
	return Boolean( getTestWikiBaseUrlForWikiInstance( wikiInstanceId ) )
}
