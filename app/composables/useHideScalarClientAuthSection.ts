import { onBeforeUnmount } from 'vue'
import { findOpenScalarClientModal } from '../utils/findOpenScalarClientModal'

/**
 * Marker attribute placed on the Scalar "try it out" Authentication section.
 *
 * The section is hidden by a CSS rule matching this attribute (see the
 * `@hack` block in `app/assets/css/explorer-codex-overrides.css`). JS only
 * tags the node; the actual hiding stays in the style layer.
 */
const HIDDEN_CLIENT_AUTH_ATTRIBUTE = 'data-front-door-hidden-client-auth'

/**
 * Heading text Scalar renders for the client-modal auth section.
 *
 * Passed as the CollapsibleSection `title` in
 * `@scalar/api-client` .../scalar-auth-selector-block/components/AuthSelector.vue.
 * An optional "Required"/"Optional" indicator is appended after it, so the
 * match is a prefix test rather than equality.
 */
const CLIENT_AUTH_HEADING_TEXT = 'Authentication'

const MODAL_SCAN_DEBOUNCE_MS = 80

/**
 * @hack Hides Scalar's Authentication section in the "try it out" client modal.
 *
 * There is no Scalar config option to suppress the client-modal auth section,
 * and its DOM offers no stable class, id, or attribute to target from CSS (the
 * `<section class="contents">` wrapper is anonymous, the ids are dynamic
 * `scalar-client-*`, and `data-testid="auth-indicator"` renders only when a
 * required/optional status exists). The one dependable, human-readable anchor
 * is the section heading text, which Scalar sets to "Authentication".
 *
 * Rationale for hiding (docs/adr-wikimedia-oauth-authentication.md §5.9):
 * cross-origin cookie auth is unusable from Front Door, so surfacing an auth
 * picker in the request modal is misleading and encourages a broken auth path.
 * This is the client-modal companion to the reference-intro `@hack` in
 * `explorer-codex-overrides.css` (`.scalar-reference-intro-auth`).
 *
 * Strategy: observe the document for the modal opening/re-rendering, find the
 * heading whose text is "Authentication", and tag its NEAREST `<section>`
 * ancestor with {@link HIDDEN_CLIENT_AUTH_ATTRIBUTE} so the stylesheet can hide
 * it. Each request panel is its own `<section>` (Scalar's CollapsibleSection),
 * but they sit inside a further `<section>` in the modal layout — so we must
 * match on the auth heading and climb to its own section, NOT iterate sections
 * and inspect descendant headings (which would match the outer wrapper via the
 * auth heading and hide every panel). Vue may recreate the section when the
 * active operation changes; the observer re-tags it on the next mutation.
 *
 * FRAGILITY WARNING: this depends on Scalar's English heading text. If a Scalar
 * upgrade localises or renames the client-modal auth heading, the section will
 * silently reappear. When bumping `@scalar/api-client`, re-verify in the
 * browser that the "try it out" auth section is hidden and, if broken, update
 * {@link CLIENT_AUTH_HEADING_TEXT} (or the anchor strategy) against the new DOM.
 *
 * @returns Nothing.
 */
export function useHideScalarClientAuthSection(): void {
	let observer: MutationObserver | null = null
	let scanTimeoutId: ReturnType<typeof setTimeout> | null = null

	/**
	 * Returns whether a heading names the client-modal auth picker.
	 *
	 * Scalar appends a "Required"/"Optional" indicator after the title, so this
	 * is a prefix test rather than equality.
	 *
	 * @param heading - Candidate heading element inside the open modal.
	 * @returns True when the heading text begins with the auth title.
	 */
	function isClientAuthHeading( heading: Element ): boolean {
		const headingText = ( heading.textContent ?? '' ).replace( /\s+/g, ' ' ).trim()

		return headingText.startsWith( CLIENT_AUTH_HEADING_TEXT )
	}

	/**
	 * Tags the auth section in the open modal so the stylesheet hides it.
	 *
	 * Matches the auth heading and climbs to its own `<section>` so only the
	 * Authentication panel is hidden, never an enclosing layout `<section>`.
	 *
	 * @returns Nothing.
	 */
	function hideAuthSectionInOpenModal(): void {
		const modalDialog = findOpenScalarClientModal()

		if ( !modalDialog ) {
			return
		}

		for ( const heading of modalDialog.querySelectorAll( 'h2' ) ) {
			if ( !isClientAuthHeading( heading ) ) {
				continue
			}

			const authSection = heading.closest( 'section' )

			if ( authSection && !authSection.hasAttribute( HIDDEN_CLIENT_AUTH_ATTRIBUTE ) ) {
				authSection.setAttribute( HIDDEN_CLIENT_AUTH_ATTRIBUTE, '' )
			}
		}
	}

	/**
	 * Schedules a debounced scan to avoid mutation-observer thrash.
	 *
	 * @returns Nothing.
	 */
	function scheduleScan(): void {
		if ( scanTimeoutId !== null ) {
			clearTimeout( scanTimeoutId )
		}

		scanTimeoutId = setTimeout( () => {
			scanTimeoutId = null
			hideAuthSectionInOpenModal()
		}, MODAL_SCAN_DEBOUNCE_MS )
	}

	/**
	 * Starts observing the document for modal open and re-render.
	 *
	 * @returns Nothing.
	 */
	function startObserving(): void {
		if ( observer || !import.meta.client ) {
			return
		}

		observer = new MutationObserver( () => {
			scheduleScan()
		} )

		observer.observe( document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [ 'style', 'class' ]
		} )

		scheduleScan()
	}

	/**
	 * Stops the observer and cancels any pending scan.
	 *
	 * @returns Nothing.
	 */
	function stopObserving(): void {
		if ( scanTimeoutId !== null ) {
			clearTimeout( scanTimeoutId )
			scanTimeoutId = null
		}

		observer?.disconnect()
		observer = null
	}

	startObserving()

	onBeforeUnmount( () => {
		stopObserving()
	} )
}
