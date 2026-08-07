import { getWikiInstanceById } from './instances'

/**
 * Production → test wiki mapping for write-request warning **display names** and
 * documented sandbox base URLs in the Scalar API client.
 *
 * Mapping alone does **not** decide select-copy vs caution or hide-on-test — those use
 * production-host comparison against OpenAPI / address-bar servers
 * (`isTestWikiSelectableInAddressBar` / `isActiveAddressBarServerTestWiki`). Front Door
 * does not rewrite write requests; the user may select a sandbox server in Scalar when
 * the spec lists one (e.g. `test.wikimedia.org` for Core REST).
 *
 * Instance ids match {@link config/instances.ts} (e.g. `wikidatawiki`, not the picker
 * project id `wikidata`).
 */
export const WIKI_INSTANCE_TEST_WIKI_BASE_URLS = {
	commonswiki: 'https://test-commons.wikimedia.org',
	wikidatawiki: 'https://test.wikidata.org'
} as const

/**
 * Default test wiki base URL for curated Wikipedia language wikis.
 *
 * MediaWiki Core REST specs expose `test.wikimedia.org` in the address-bar server
 * list (not `test.wikipedia.org`). Keep this aligned with what Scalar actually offers.
 */
export const DEFAULT_WIKIPEDIA_TEST_WIKI_BASE_URL = 'https://test.wikimedia.org'

/** banana-i18n keys for test wiki display names used in write-request warning copy. */
export const TEST_WIKI_DISPLAY_NAME_MESSAGE_KEYS = {
	commonswiki: 'explorer-scalar-write-test-wiki-name-commons',
	wikidatawiki: 'explorer-scalar-write-test-wiki-name-wikidata',
	wikipedia: 'explorer-scalar-write-test-wiki-name-wikipedia'
} as const

/**
 * Returns the test wiki base URL for a selected explorer wiki instance, when one exists.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns Absolute test wiki base URL without a trailing slash, or `null` when none is mapped.
 */
export function getTestWikiBaseUrlForWikiInstance( wikiInstanceId: string ): string | null {
	if ( wikiInstanceId in WIKI_INSTANCE_TEST_WIKI_BASE_URLS ) {
		return WIKI_INSTANCE_TEST_WIKI_BASE_URLS[
			wikiInstanceId as keyof typeof WIKI_INSTANCE_TEST_WIKI_BASE_URLS
		]
	}

	// Remaining curated instances are Wikipedia language wikis → Test Wikipedia.
	if ( getWikiInstanceById( wikiInstanceId ) ) {
		return DEFAULT_WIKIPEDIA_TEST_WIKI_BASE_URL
	}

	return null
}

/**
 * Returns the banana-i18n message key for the mapped test wiki display name.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns Message key for Test Wikipedia, Test Wikidata, or Test Wikimedia Commons.
 */
export function getTestWikiDisplayNameMessageKey( wikiInstanceId: string ): string {
	if ( wikiInstanceId === 'wikidatawiki' ) {
		return TEST_WIKI_DISPLAY_NAME_MESSAGE_KEYS.wikidatawiki
	}

	if ( wikiInstanceId === 'commonswiki' ) {
		return TEST_WIKI_DISPLAY_NAME_MESSAGE_KEYS.commonswiki
	}

	return TEST_WIKI_DISPLAY_NAME_MESSAGE_KEYS.wikipedia
}

/**
 * Returns whether the selected explorer instance has a mapped test wiki in config.
 *
 * Prefer `isTestWikiSelectableInAddressBar` for warning copy — mapped does not imply
 * the address bar can select that host yet.
 *
 * @param wikiInstanceId - Wiki instance id from {@link config/instances.ts}.
 * @returns True when config defines a corresponding test wiki base URL.
 */
export function hasTestWikiForWikiInstance( wikiInstanceId: string ): boolean {
	return getTestWikiBaseUrlForWikiInstance( wikiInstanceId ) !== null
}
