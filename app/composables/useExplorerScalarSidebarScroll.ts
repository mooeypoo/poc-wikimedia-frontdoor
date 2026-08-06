import type { Ref } from 'vue'

/** How long to keep retrying while Scalar's sidebar lazily renders. */
const SIDEBAR_SCROLL_RETRY_TIMEOUT_MS = 4000

/** Delay between sidebar-scroll attempts. */
const SIDEBAR_SCROLL_RETRY_INTERVAL_MS = 120

/**
 * Finds the active operation entry in Scalar's internal sidebar.
 *
 * Deliberately class-agnostic (Scalar's internal markup can change across
 * upgrades): it prefers a sidebar anchor whose hash matches the current
 * operation, then an ARIA current marker, then a generic active/selected class
 * under a sidebar container.
 *
 * @param root - Element containing the Scalar reference.
 * @param locationHash - Current URL hash (Scalar's operation hash), including `#`.
 * @returns The active sidebar entry element, or null when none is found yet.
 */
function findActiveSidebarEntry( root: ParentNode, locationHash: string ): HTMLElement | null {
	const anchors = Array.from( root.querySelectorAll<HTMLAnchorElement>( 'a[href]' ) )
	const anchorMatch = anchors.find( ( anchor ) => anchor.hash && anchor.hash === locationHash )
	if ( anchorMatch ) {
		return anchorMatch
	}

	const ariaCurrentEntry = root.querySelector<HTMLElement>(
		'[aria-current]:not([aria-current="false"])'
	)
	if ( ariaCurrentEntry ) {
		return ariaCurrentEntry
	}

	return root.querySelector<HTMLElement>(
		'[class*="sidebar"] [class*="active"], [class*="sidebar"] [class*="selected"]'
	)
}

/**
 * Returns the nearest scrollable ancestor of an element (the sidebar's own
 * scroll container), or null when none scrolls.
 *
 * @param element - Element to walk up from.
 * @returns The scrollable ancestor, or null.
 */
function findScrollableAncestor( element: HTMLElement ): HTMLElement | null {
	let node: HTMLElement | null = element.parentElement
	while ( node ) {
		const overflowY = window.getComputedStyle( node ).overflowY
		if ( ( overflowY === 'auto' || overflowY === 'scroll' ) && node.scrollHeight > node.clientHeight + 1 ) {
			return node
		}
		node = node.parentElement
	}
	return null
}

/**
 * Scrolls a sidebar entry to the vertical center of its scroll container,
 * without moving the page (only the container scrolls).
 *
 * @param entry - The active sidebar entry.
 * @param container - The entry's scroll container.
 * @returns Nothing.
 */
function scrollEntryIntoContainerCenter( entry: HTMLElement, container: HTMLElement ): void {
	const containerRect = container.getBoundingClientRect()
	const entryRect = entry.getBoundingClientRect()
	const currentOffset = entryRect.top - containerRect.top
	const centeredOffset = currentOffset - ( container.clientHeight / 2 ) + ( entryRect.height / 2 )

	container.scrollTo( {
		top: container.scrollTop + centeredOffset,
		behavior: 'smooth'
	} )
}

/**
 * Scrolls Scalar's internal sidebar so the active operation entry is visible.
 *
 * On a deep-link load Scalar scrolls the main content and highlights the sidebar
 * item, but does not scroll the sidebar list itself, so a deep-linked operation
 * can land off-screen in the sidebar. This brings the active entry into view
 * inside the sidebar's own scroll container. It applies only in the internal-
 * sidebar mode (`EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR`), where Scalar owns the
 * sidebar and the operation hash (see docs/adr-explorer-deep-linking.md §2).
 * Entries render lazily, so the attempt retries for a few seconds.
 *
 * @param scalarShellRef - Ref to the Scalar shell container element.
 * @returns A function that scrolls the sidebar to the operation in the current hash.
 */
export function useExplorerScalarSidebarScroll( scalarShellRef: Ref<HTMLElement | null> ) {
	/**
	 * Scrolls the sidebar to the operation named by the current URL hash.
	 *
	 * No-op when there is no hash (nothing to focus) or on the server.
	 *
	 * @returns Nothing.
	 */
	function scrollSidebarToActiveOperation(): void {
		if ( typeof window === 'undefined' ) {
			return
		}

		const targetHash = window.location.hash
		if ( !targetHash ) {
			return
		}

		const deadlineMs = Date.now() + SIDEBAR_SCROLL_RETRY_TIMEOUT_MS

		/**
		 * Attempts the scroll, retrying until the entry appears or the deadline passes.
		 *
		 * @returns Nothing.
		 */
		function attemptScroll(): void {
			const searchRoot = scalarShellRef.value ?? document.body
			const activeEntry = findActiveSidebarEntry( searchRoot, targetHash )

			if ( activeEntry ) {
				const scrollContainer = findScrollableAncestor( activeEntry )
				if ( scrollContainer ) {
					scrollEntryIntoContainerCenter( activeEntry, scrollContainer )
				} else {
					activeEntry.scrollIntoView( { block: 'center', inline: 'nearest' } )
				}
				return
			}

			if ( Date.now() >= deadlineMs ) {
				return
			}

			window.setTimeout( attemptScroll, SIDEBAR_SCROLL_RETRY_INTERVAL_MS )
		}

		attemptScroll()
	}

	return {
		scrollSidebarToActiveOperation
	}
}
