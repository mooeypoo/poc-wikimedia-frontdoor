import type { RouterConfig } from 'nuxt/schema'
import { computeHeadingScrollTop } from './utils/computeHeadingScrollTop'

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

		if ( !to.hash ) {
			return { left: 0, top: 0 }
		}

		const scrollRoot = document.querySelector<HTMLElement>( '.frontdoor-shell__body-scroll' )
		const headingElement = await waitForHashTarget( decodeHashTarget( to.hash ) )

		if ( !scrollRoot || !headingElement ) {
			return false
		}

		scrollRoot.scrollTo( {
			top: computeHeadingScrollTop( headingElement, scrollRoot ),
			behavior: to.path === from.path ? 'auto' : 'smooth'
		} )

		return false
	}
} satisfies RouterConfig
