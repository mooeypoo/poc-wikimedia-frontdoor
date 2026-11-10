/**
 * Pure accessibility helpers for the composed global-search panel.
 *
 * Kept free of Vue / DOM so `node --test` can cover keyboard routing,
 * announcements, chip arrow wrapping, and option position math without a
 * browser runner.
 */

import type { SearchPrototypeCategory } from '../../config/searchPrototype.ts'
import type { GlobalSearchResultKind } from './globalSearchPanel.ts'

/** Keyboard routing decision for the search field. */
export type GlobalSearchInputKeyAction =
	| { type: 'pass' }
	| { type: 'delegate' }
	| { type: 'tab'; clearHighlight: true }
	| { type: 'enter-noop'; preventDefault: true }
	| { type: 'reopen-panel'; clearHighlight: true }
	| { type: 'escape-close'; clearHighlight: true; preventDefault: true }

/**
 * Decides how the search field should handle a keydown before (or instead of)
 * Codex `delegateKeyNavigation`.
 *
 * Tab is never delegated — Codex would select the highlighted option and
 * navigate. Enter with no highlight is a no-op (Codex would close). Down /
 * Alt+Down with the panel closed reopen results when a query is active.
 *
 * @param options - Current field / panel state and the key event fields.
 * @param options.key - `KeyboardEvent.key`.
 * @param options.altKey - Whether Alt was held (Alt+Down reopen).
 * @param options.isPanelOpen - Whether the results panel is visible.
 * @param options.hasHighlight - Whether a menu option is keyboard-highlighted.
 * @param options.hasActiveQuery - Whether the query meets the minimum length.
 * @returns Routing action for the field keydown handler.
 */
export function resolveGlobalSearchInputKeyAction( options: {
	key: string
	altKey: boolean
	isPanelOpen: boolean
	hasHighlight: boolean
	hasActiveQuery: boolean
} ): GlobalSearchInputKeyAction {
	const { key, altKey, isPanelOpen, hasHighlight, hasActiveQuery } = options

	if ( key === ' ' ) {
		// Space must type into the query (Codex input-with-menu pattern).
		return { type: 'pass' }
	}

	if ( key === 'Tab' ) {
		return { type: 'tab', clearHighlight: true }
	}

	if ( key === 'Escape' && isPanelOpen ) {
		return { type: 'escape-close', clearHighlight: true, preventDefault: true }
	}

	if ( key === 'Enter' && isPanelOpen && !hasHighlight ) {
		return { type: 'enter-noop', preventDefault: true }
	}

	// Down (and Alt+Down) with a settled query reopen results; Up keeps the caret.
	if ( key === 'ArrowDown' && !isPanelOpen && hasActiveQuery ) {
		return { type: 'reopen-panel', clearHighlight: true }
	}

	if ( !isPanelOpen ) {
		return { type: 'pass' }
	}

	return { type: 'delegate' }
}

/** Chip category order for radiogroup arrow navigation. */
export const GLOBAL_SEARCH_CHIP_ORDER: readonly SearchPrototypeCategory[] = [
	'all',
	'endpoints',
	'documentation'
]

/**
 * Resolves the next chip index for radiogroup arrow keys, wrapping at both ends.
 *
 * Horizontal arrows mirror in RTL (Left advances). Vertical arrows always use
 * Down = next / Up = previous regardless of direction.
 *
 * @param currentIndex - Index of the focused / checked chip (0-based).
 * @param key - Arrow key pressed.
 * @param isRtl - Whether the interface direction is RTL.
 * @param chipCount - Number of chips in the group.
 * @returns Next index, or `null` when the key is not an arrow.
 */
export function resolveGlobalSearchChipArrowIndex(
	currentIndex: number,
	key: string,
	isRtl: boolean,
	chipCount: number = GLOBAL_SEARCH_CHIP_ORDER.length
): number | null {
	if ( chipCount <= 0 ) {
		return null
	}

	let step = 0
	if ( key === 'ArrowDown' ) {
		step = 1
	} else if ( key === 'ArrowUp' ) {
		step = -1
	} else if ( key === 'ArrowRight' ) {
		step = isRtl ? -1 : 1
	} else if ( key === 'ArrowLeft' ) {
		step = isRtl ? 1 : -1
	} else {
		return null
	}

	const normalised = ( ( currentIndex % chipCount ) + chipCount ) % chipCount
	return ( normalised + step + chipCount ) % chipCount
}

/**
 * Computes 1-based `aria-posinset` / `aria-setsize` for a result in the full
 * ordered list for the active chip (including rows not yet disclosed).
 *
 * @param itemId - Stable panel item id (Menu value).
 * @param orderedItemIds - Full ordered ids for the selected category.
 * @returns Position attributes, or `null` when the id is not in the list.
 */
export function computeGlobalSearchOptionPosition(
	itemId: string,
	orderedItemIds: readonly string[]
): { posinset: number, setsize: number } | null {
	const index = orderedItemIds.indexOf( itemId )
	if ( index < 0 ) {
		return null
	}
	return {
		posinset: index + 1,
		setsize: orderedItemIds.length
	}
}

/** Inputs for building a settled search status announcement. */
export interface GlobalSearchAnnouncementInput {
	hasActiveQuery: boolean
	isSearchInFlight: boolean
	hasSearchError: boolean
	selectedCategory: SearchPrototypeCategory
	allCount: number
	endpointCount: number
	documentationCount: number
	query: string
	languageName: string
	/** When true, announce that another disclosure chunk was appended. */
	moreResultsLoaded?: boolean
	/** When true, announce a slow in-flight search (after ~1s). */
	announceSearching?: boolean
}

/** Banana key + positional params for the live status / alert region. */
export interface GlobalSearchAnnouncement {
	key: string
	params: Record<string, string>
	/** `status` (polite) or `alert` (assertive, index failure). */
	role: 'status' | 'alert'
}

/**
 * Builds the live-region announcement for the current settled search state.
 *
 * Returns `null` when nothing should be spoken (short query, still in flight
 * without the slow-search flag, etc.). Counts always match the chip totals.
 *
 * @param input - Settled panel counters and flags.
 * @returns Announcement descriptor, or `null` to clear / stay silent.
 */
export function resolveGlobalSearchAnnouncement(
	input: GlobalSearchAnnouncementInput
): GlobalSearchAnnouncement | null {
	if ( !input.hasActiveQuery ) {
		return null
	}

	if ( input.hasSearchError ) {
		return {
			key: 'search-status-unavailable',
			params: {},
			role: 'alert'
		}
	}

	if ( input.moreResultsLoaded ) {
		return {
			key: 'search-status-more-loaded',
			params: {},
			role: 'status'
		}
	}

	if ( input.isSearchInFlight ) {
		if ( input.announceSearching ) {
			return {
				key: 'search-status-searching',
				params: {},
				role: 'status'
			}
		}
		return null
	}

	const categoryCount = input.selectedCategory === 'endpoints' ?
		input.endpointCount :
		input.selectedCategory === 'documentation' ?
			input.documentationCount :
			input.allCount

	if ( categoryCount === 0 ) {
		if ( input.selectedCategory === 'endpoints' ) {
			return {
				key: 'search-status-no-results-endpoints',
				params: { $1: input.query },
				role: 'status'
			}
		}
		return {
			key: 'search-status-no-results',
			params: { $1: input.query, $2: input.languageName },
			role: 'status'
		}
	}

	if ( input.selectedCategory === 'endpoints' ) {
		return {
			key: 'search-status-showing-endpoints',
			params: { $1: String( input.endpointCount ) },
			role: 'status'
		}
	}

	if ( input.selectedCategory === 'documentation' ) {
		return {
			key: 'search-status-showing-documentation',
			params: { $1: String( input.documentationCount ) },
			role: 'status'
		}
	}

	return {
		key: 'search-status-results-all',
		params: {
			$1: String( input.allCount ),
			$2: String( input.endpointCount ),
			$3: String( input.documentationCount )
		},
		role: 'status'
	}
}

/**
 * Banana message key for the visually hidden type prefix on All-view options.
 *
 * @param kind - Result kind.
 * @returns Message key, or `null` when type text should be omitted.
 */
export function globalSearchOptionTypeMessageKey(
	kind: GlobalSearchResultKind
): 'search-option-type-endpoint' | 'search-option-type-documentation' {
	return kind === 'endpoint' ?
		'search-option-type-endpoint' :
		'search-option-type-documentation'
}
