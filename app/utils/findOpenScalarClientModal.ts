const MODAL_DIALOG_SELECTOR = '.scalar-client[role="dialog"]'

/**
 * Returns whether an element and its Scalar overlay ancestors are visible.
 *
 * @param element - Candidate modal dialog element.
 * @returns True when the modal is shown to the user.
 */
function isScalarClientModalVisible( element: HTMLElement ): boolean {
	const elementStyle = getComputedStyle( element )

	if ( elementStyle.display === 'none' || elementStyle.visibility === 'hidden' ) {
		return false
	}

	const overlayElement = element.closest( '.scalar.scalar-app' )

	if ( overlayElement instanceof HTMLElement ) {
		const overlayStyle = getComputedStyle( overlayElement )

		if ( overlayStyle.display === 'none' || overlayStyle.visibility === 'hidden' ) {
			return false
		}
	}

	return true
}

/**
 * Returns the open Scalar Test Request modal root, if present in the document.
 *
 * The modal is mounted inside ApiReference (not necessarily on `document.body`).
 * When closed, Scalar keeps the dialog in the DOM with `display: none` on the overlay.
 *
 * @returns Visible modal dialog element, or null when closed.
 */
export function findOpenScalarClientModal(): HTMLElement | null {
	const modalCandidates = document.querySelectorAll( MODAL_DIALOG_SELECTOR )

	for ( const modalCandidate of modalCandidates ) {
		if ( !( modalCandidate instanceof HTMLElement ) ) {
			continue
		}

		if ( isScalarClientModalVisible( modalCandidate ) ) {
			return modalCandidate
		}
	}

	return null
}
