import type { Ref } from 'vue'
import { watch } from 'vue'
import { SCALAR_DOCUMENT_SLUG } from '../../config/scalar'
import type { ExplorerOperationTarget } from './useExplorerBootstrap'
import {
	resolveScalarOperationNavigationId,
	type ScalarNavigationEntry,
	type ScalarOperationNavigationInput
} from '../utils/scalarOperationNavigation'

const SCALAR_FOCUS_RETRY_TIMEOUT_MS = 5000
const SCALAR_FOCUS_RETRY_INTERVAL_MS = 100

export interface ScalarInterfaceHandle {
	eventBus?: {
		emit: ( eventName: string, payload: { id: string } ) => void
	}
	workspaceStore?: {
		workspace?: Record<string, unknown>
	}
	sidebarItems?: ScalarNavigationEntry[]
}

/**
 * Returns whether an operation element is present in the document.
 *
 * @param navigationId - Scalar navigation id for the operation.
 * @returns True when the element exists in the DOM.
 */
function isOperationElementPresent( navigationId: string ): boolean {
	return Boolean( document.getElementById( navigationId ) )
}

/**
 * Scrolls an operation section into view inside the Scalar shell scroll container.
 *
 * Scalar's lazy loader also calls scrollIntoView on the document; this aligns the
 * explorer shell (`overflow: auto`) when the browser does not scroll that container.
 *
 * @param navigationId - Scalar navigation id for the operation.
 * @param scrollContainer - Scrollable Scalar shell element, if available.
 * @returns True when the element was found and scrolled.
 */
function scrollOperationIntoView(
	navigationId: string,
	scrollContainer: HTMLElement | null
): boolean {
	const matchedElement = document.getElementById( navigationId )
	if ( !matchedElement ) {
		return false
	}

	if ( scrollContainer ) {
		const containerRect = scrollContainer.getBoundingClientRect()
		const elementRect = matchedElement.getBoundingClientRect()
		const nextScrollTop = scrollContainer.scrollTop + ( elementRect.top - containerRect.top )

		scrollContainer.scrollTo( {
			top: nextScrollTop,
			behavior: 'smooth'
		} )
	} else {
		matchedElement.scrollIntoView( {
			behavior: 'smooth',
			block: 'start'
		} )
	}

	return true
}

/**
 * Requests Scalar to scroll to an operation and waits until the target exists.
 *
 * Scalar lazy-loads operation sections, so the element may not exist until after
 * the scroll event is handled.
 *
 * @param scalarInterface - Scalar ApiReference interface handle.
 * @param navigationId - Scalar navigation id for the target operation.
 * @param scrollContainer - Scrollable Scalar shell element.
 * @param deadlineMs - Timestamp after which waiting stops.
 * @returns Promise resolving to true when the operation element is present.
 */
function waitForOperationScroll(
	scalarInterface: ScalarInterfaceHandle | null,
	navigationId: string,
	scrollContainer: HTMLElement | null,
	deadlineMs: number
): Promise<boolean> {
	return new Promise( ( resolve ) => {
		const attemptScroll = (): void => {
			scalarInterface?.eventBus?.emit( 'scroll-to:nav-item', { id: navigationId } )

			if ( isOperationElementPresent( navigationId ) ) {
				scrollOperationIntoView( navigationId, scrollContainer )
				resolve( true )
				return
			}

			if ( Date.now() >= deadlineMs ) {
				resolve( false )
				return
			}

			window.setTimeout( attemptScroll, SCALAR_FOCUS_RETRY_INTERVAL_MS )
		}

		attemptScroll()
	} )
}

/**
 * Focuses a pending explorer operation inside Scalar with retries while the spec renders.
 *
 * @param operationTarget - Operation the user selected in the module rail.
 * @param scalarInterface - Scalar ApiReference interface handle.
 * @param scalarShellElement - Scalar shell container element.
 * @param clearPendingOperationTarget - Clears the pending focus request after success.
 * @returns Promise resolving to true when focus succeeded.
 */
async function focusOperationTargetInScalar(
	operationTarget: ExplorerOperationTarget,
	scalarInterface: ScalarInterfaceHandle | null,
	scalarShellElement: HTMLElement | null,
	clearPendingOperationTarget: () => void
): Promise<boolean> {
	const navigationInput: ScalarOperationNavigationInput = {
		documentSlug: SCALAR_DOCUMENT_SLUG,
		method: operationTarget.method,
		path: operationTarget.path,
		primaryTag: operationTarget.primaryTag
	}

	const searchRoot = scalarShellElement ?? document
	const deadlineMs = Date.now() + SCALAR_FOCUS_RETRY_TIMEOUT_MS

	while ( Date.now() < deadlineMs ) {
		const navigationId = resolveScalarOperationNavigationId(
			searchRoot,
			navigationInput,
			{
				workspaceStore: scalarInterface?.workspaceStore ?? null,
				sidebarItems: scalarInterface?.sidebarItems
			}
		)

		if ( navigationId ) {
			const didFocus = await waitForOperationScroll(
				scalarInterface,
				navigationId,
				scalarShellElement,
				deadlineMs
			)

			if ( didFocus || isOperationElementPresent( navigationId ) ) {
				scrollOperationIntoView( navigationId, scalarShellElement )
				clearPendingOperationTarget()
				return true
			}
		}

		await new Promise( ( resolve ) => {
			window.setTimeout( resolve, SCALAR_FOCUS_RETRY_INTERVAL_MS )
		} )
	}

	return false
}

/**
 * Wires explorer endpoint selection to Scalar operation navigation.
 *
 * @param pendingOperationTarget - Pending operation focus request from bootstrap state.
 * @param scalarInterface - Scalar ApiReference interface handle from the mounted component.
 * @param scalarShellRef - Ref to the Scalar shell container element.
 * @param isScalarSwitching - Whether Scalar is currently loading a new spec.
 * @param isInstanceBootstrapping - Whether instance bootstrap is in progress.
 * @param clearPendingOperationTarget - Clears the pending operation target after focus.
 * @returns Function to attempt focusing the pending operation in Scalar.
 */
export function useExplorerScalarFocus(
	pendingOperationTarget: Ref<ExplorerOperationTarget | null>,
	scalarInterface: Ref<ScalarInterfaceHandle | null>,
	scalarShellRef: Ref<HTMLElement | null>,
	isScalarSwitching: Ref<boolean>,
	isInstanceBootstrapping: Ref<boolean>,
	clearPendingOperationTarget: () => void
) {
	let focusRequestGeneration = 0

	/**
	 * Attempts to focus the pending operation when Scalar is ready.
	 *
	 * @returns Nothing.
	 */
	function focusPendingOperationInScalar(): void {
		if ( typeof window === 'undefined' ) {
			return
		}

		const operationTarget = pendingOperationTarget.value
		if ( !operationTarget || isScalarSwitching.value || isInstanceBootstrapping.value ) {
			return
		}

		const nextFocusRequestGeneration = focusRequestGeneration + 1
		focusRequestGeneration = nextFocusRequestGeneration

		void focusOperationTargetInScalar(
			operationTarget,
			scalarInterface.value,
			scalarShellRef.value,
			() => {
				if ( focusRequestGeneration === nextFocusRequestGeneration ) {
					clearPendingOperationTarget()
				}
			}
		)
	}

	watch( isScalarSwitching, ( isSwitching, wasSwitching ) => {
		if ( wasSwitching && !isSwitching && pendingOperationTarget.value ) {
			window.requestAnimationFrame( () => {
				focusPendingOperationInScalar()
			} )
		}
	} )

	watch( scalarInterface, ( nextScalarInterface ) => {
		if ( nextScalarInterface?.eventBus && pendingOperationTarget.value ) {
			window.requestAnimationFrame( () => {
				focusPendingOperationInScalar()
			} )
		}
	}, { deep: true } )

	return {
		focusPendingOperationInScalar
	}
}
