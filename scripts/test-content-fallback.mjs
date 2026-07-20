import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Builds locale-qualified Nuxt Content paths for a route slug.
 *
 * @param {string} localeCode - Requested locale code.
 * @param {string} slugPath - Route slug path without a leading slash.
 * @returns {string[]} Ordered candidate paths for that locale.
 */
function buildLocaleContentPaths( localeCode, slugPath ) {
	const normalizedSlugPath = slugPath.replace( /^\/+/, '' ).replace( /\/+$/, '' )
	if ( normalizedSlugPath.length === 0 ) {
		return [ `/${ localeCode }`, `/${ localeCode }/index` ]
	}

	return [ `/${ localeCode }/${ normalizedSlugPath }` ]
}

/**
 * Builds ordered locale candidates based on configured fallback chain.
 *
 * @param {string} requestedLocaleCode - Requested locale code.
 * @param {string[]} languageFallbackChain - Fallback chain for the requested locale.
 * @returns {string[]} Unique candidate locale codes in priority order.
 */
function buildLocaleCandidates( requestedLocaleCode, languageFallbackChain ) {
	const orderedCandidates = [ requestedLocaleCode, ...languageFallbackChain ]
	const uniqueCandidates = []

	for ( const localeCode of orderedCandidates ) {
		if ( uniqueCandidates.includes( localeCode ) ) {
			continue
		}
		uniqueCandidates.push( localeCode )
	}

	if ( !uniqueCandidates.includes( 'en' ) ) {
		uniqueCandidates.push( 'en' )
	}

	return uniqueCandidates
}

/**
 * Validates silent markdown fallback behavior for a missing French get-help page.
 */
function runFallbackAssertions() {
	const localeCandidates = buildLocaleCandidates( 'fr', [ 'fr', 'en' ] )
	assert.deepEqual( localeCandidates, [ 'fr', 'en' ] )

	const frenchGetHelpCandidates = buildLocaleContentPaths( 'fr', 'get-help' )
	assert.deepEqual( frenchGetHelpCandidates, [ '/fr/get-help' ] )

	const englishGetHelpCandidates = buildLocaleContentPaths( 'en', 'get-help' )
	assert.deepEqual( englishGetHelpCandidates, [ '/en/get-help' ] )

	const frenchGetHelpFile = resolve( process.cwd(), 'content/fr/get-help.md' )
	const englishGetHelpFile = resolve( process.cwd(), 'content/en/get-help.md' )

	assert.equal( existsSync( frenchGetHelpFile ), false, 'Expected French get-help markdown file to be intentionally missing.' )
	assert.equal( existsSync( englishGetHelpFile ), true, 'Expected English get-help markdown file to exist for fallback.' )
}

runFallbackAssertions()
console.log( 'Content fallback test passed.' )
