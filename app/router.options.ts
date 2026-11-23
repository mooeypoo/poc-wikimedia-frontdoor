import type { RouterConfig } from 'nuxt/schema'
import { computeHeadingScrollTop } from './utils/computeHeadingScrollTop'
import {
	focusNavigationTarget,
	resolveNavigationFocusTarget
} from './utils/focusNavigationTarget'

const HASH_TARGET_WAIT_TIMEOUT_MS = 2000

/**
 * Turns a route hash into the heading `id` to look for.
 *
 * `decodeURIComponent` throws `URIError` on a malformed percent-escape, and a
 * fragment is free to hold a bare `%` (`#100%-coverage`). Since this runs inside
 * an async `scrollBehavior`, an uncaught throw leaves a rejected promise in the
 * router's scroll handling rather than the graceful miss every other failure
 * here returns, so an undecodable hash falls back to its raw text: that is what
 * an `id` written with a literal `%` would match anyway.
 *
 * @param routeHash - Route hash including its leading `#`.
 * @returns The heading `id` to search for.
 */
function decodeHashTarget( routeHash: string ): string {
	const rawTarget = routeHash.slice( 1 )

	try {
		return decodeURIComponent( rawTarget )
	} catch {
		return rawTarget
	}
}

/**
 * Waits for a heading `id` to exist in the DOM.
 *
 * A client-side route change lands here before the destination page's content
 * (async data fetch, then `ContentRenderer`) has painted its headings, so a
 * single `getElementById` on the first attempt reliably misses. Polls once per
 * frame until the element appears or {@link HASH_TARGET_WAIT_TIMEOUT_MS} elapses.
 *
 * @param headingId - Heading `id` to wait for (the route hash without its `#`).
 * @returns The matched element, or `null` if it never appears in time.
 */
function waitForHashTarget( headingId: string ): Promise<HTMLElement | null> {
	return new Promise( ( resolve ) => {
		const deadline = Date.now() + HASH_TARGET_WAIT_TIMEOUT_MS

		const poll = () => {
			const target = document.getElementById( headingId )

			if ( target ) {
				resolve( target )
				return
			}

			if ( Date.now() >= deadline ) {
				resolve( null )
				return
			}

			requestAnimationFrame( poll )
		}

		poll()
	} )
}

export default {
	async scrollBehavior( to, from, savedPosition ) {
		if ( savedPosition ) {
			return savedPosition
		}

		const scrollRoot = document.querySelector<HTMLElement>( '.frontdoor-shell__body-scroll' )

		if ( !to.hash ) {
			/*
			 * No section hash: scroll to top, then move focus to the page title so
			 * activating a global-search (or other in-app) link does not leave the
			 * caret in the header chrome. Skipped on savedPosition (Back/Forward).
			 */
			if ( scrollRoot ) {
				scrollRoot.scrollTo( { left: 0, top: 0 } )
			}

			const pageTitle = await waitForFocusTarget( null )
			if ( pageTitle ) {
				focusNavigationTarget( pageTitle )
			}

			return false
		}

		const headingId = decodeHashTarget( to.hash )
		const headingElement = await waitForHashTarget( headingId )

		if ( !scrollRoot || !headingElement ) {
			return false
		}

		scrollRoot.scrollTo( {
			top: computeHeadingScrollTop( headingElement, scrollRoot ),
			behavior: to.path === from.path ? 'auto' : 'smooth'
		} )

		// Match scroll: land keyboard / SR focus on the section heading, not chrome.
		focusNavigationTarget( headingElement )

		return false
	}
} satisfies RouterConfig

/**
 * Waits for a focus target after navigation (hash heading or page `h1`).
 *
 * Mirrors {@link waitForHashTarget}: content may paint after the first frame.
 *
 * @param headingId - Decoded hash id, or `null` for the page title fallback.
 * @returns The element to focus, or `null` if nothing appears in time.
 */
function waitForFocusTarget( headingId: string | null ): Promise<HTMLElement | null> {
	return new Promise( ( resolve ) => {
		const deadline = Date.now() + HASH_TARGET_WAIT_TIMEOUT_MS

		const poll = () => {
			const target = resolveNavigationFocusTarget( headingId )

			if ( target ) {
				resolve( target )
				return
			}

			if ( Date.now() >= deadline ) {
				resolve( null )
				return
			}

			requestAnimationFrame( poll )
		}

		poll()
	} )
}
