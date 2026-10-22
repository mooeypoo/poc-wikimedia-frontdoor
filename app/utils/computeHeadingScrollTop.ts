/**
 * Computes the body scrollport's next `scrollTop` so a heading lands just below its top.
 *
 * Shared by {@link useOnThisPageNav}'s in-page jump and the router-level hash
 * scroll (`app/router.options.ts`) — both target the custom
 * `.frontdoor-shell__body-scroll` scrollport instead of `window`.
 *
 * @param headingElement - Target heading to scroll into view.
 * @param scrollRoot - Body scrollport (`.frontdoor-shell__body-scroll`).
 * @param offsetPx - Gap to leave above the heading.
 * @returns Clamped `scrollTop` for {@link scrollRoot}.
 */
export function computeHeadingScrollTop(
	headingElement: HTMLElement,
	scrollRoot: HTMLElement,
	offsetPx = 16
): number {
	const scrollDelta =
		headingElement.getBoundingClientRect().top -
		scrollRoot.getBoundingClientRect().top -
		offsetPx

	return Math.max( 0, scrollRoot.scrollTop + scrollDelta )
}
