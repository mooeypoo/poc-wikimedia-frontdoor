/**
 * Programmatic keyboard focus after in-app navigation (global search, TOC, etc.).
 *
 * Route `scrollBehavior` scrolls the shell body to a hash target or page top, but
 * does not move focus — without this helper, activating a search result leaves
 * focus in the header chrome. Headings are not focusable by default; a temporary
 * `tabindex="-1"` allows focus without adding them to sequential tab order.
 */

/**
 * Moves keyboard focus to a navigation target without scrolling again.
 *
 * @param target - Element that should receive focus (heading or page title).
 * @returns Nothing.
 */
export function focusNavigationTarget( target: HTMLElement ): void {
	if ( !target.hasAttribute( 'tabindex' ) ) {
		target.setAttribute( 'tabindex', '-1' )
	}

	target.focus( { preventScroll: true } )
}

/**
 * Resolves where focus should land after a client-side route change.
 *
 * Prefers a hash-matched heading (section from search / on-this-page). Falls
 * back to the content page `h1`, then any `h1` inside the shell main column.
 *
 * @param headingId - Decoded hash target id, or `null` when the route has no hash.
 * @returns The element to focus, or `null` when none is in the DOM yet.
 */
export function resolveNavigationFocusTarget( headingId: string | null ): HTMLElement | null {
	if ( headingId ) {
		const hashTarget = document.getElementById( headingId )
		if ( hashTarget ) {
			return hashTarget
		}
	}

	return document.querySelector<HTMLElement>(
		'.fd-content-page h1, .frontdoor-shell__main h1, main h1'
	)
}
