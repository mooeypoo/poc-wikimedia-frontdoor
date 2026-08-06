import { computed, onBeforeUnmount, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { ModalAction, PrimaryModalAction } from '@wikimedia/codex'
import { getWikiInstanceById } from '../../config/instances'
import { SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED } from '../../config/scalarClientWriteWarnings'
import { activeExplorerWikiInstanceId } from '../utils/explorerWikiInstanceContext'
import { findOpenScalarClientModal } from '../utils/findOpenScalarClientModal'
import { isActiveAddressBarServerTestWiki } from '../utils/isTestWikiSelectableInAddressBar'
import { isWriteHttpMethod } from '../utils/isWriteHttpMethod'
import { resolveHttpMethodFromModalElement } from '../utils/scalarClientModalHttpMethod'
import { resolveInterfaceMessage } from '../utils/resolveInterfaceMessage'

/**
 * Returns whether a click target is Scalar's Test Request address-bar Send control.
 *
 * @param clickTarget - Event target from a document click.
 * @returns The Send button element when matched; otherwise null.
 */
function resolveScalarAddressBarSendButton( clickTarget: EventTarget | null ): HTMLButtonElement | null {
	if ( !( clickTarget instanceof Element ) ) {
		return null
	}

	const candidateButton = clickTarget.closest( 'button' )

	if ( !( candidateButton instanceof HTMLButtonElement ) ) {
		return null
	}

	const addressBar = candidateButton.closest( '.scalar-address-bar' )

	if ( !addressBar ) {
		return null
	}

	const modalRoot = findOpenScalarClientModal()

	if ( !modalRoot?.contains( addressBar ) ) {
		return null
	}

	const accessibleName = candidateButton.querySelector( '.sr-only' )?.textContent?.trim()
		?? candidateButton.getAttribute( 'aria-label' )
		?? ''

	// AddressBar.vue: sr-only copy is "Send {METHOD} request to …"
	if ( !/^Send\s+/i.test( accessibleName ) ) {
		return null
	}

	return candidateButton
}

/**
 * Intercepts Scalar Test Request Send for write methods and opens a Codex confirm dialog.
 *
 * Mock / easy to undo: disable via {@link SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED}.
 * Skips the dialog when the address bar’s active server is a non-production host
 * ({@link isActiveAddressBarServerTestWiki}) — same gate as hiding the production warning.
 * On Confirm, re-clicks the captured Send button once; Cancel dismisses without sending.
 * The presentational dialog teleports into `#explorer-reference-panel` (Codex exception #13 —
 * containment, Confirm-left-of-Cancel, title 18px); mount it as a **sibling** of that panel.
 *
 * @returns Dialog open state, labels/actions, production wiki name, and confirm/cancel handlers.
 */
export function useScalarClientWriteRequestConfirmDialog(): {
	isWriteRequestConfirmDialogOpen: Ref<boolean>
	productionWikiDisplayName: ComputedRef<string>
	confirmDialogPrimaryAction: ComputedRef<PrimaryModalAction>
	confirmDialogDefaultAction: ComputedRef<ModalAction>
	confirmDialogCloseButtonLabel: ComputedRef<string>
	onWriteRequestConfirmDialogPrimary: () => void
	onWriteRequestConfirmDialogCancel: () => void
} {
	const isWriteRequestConfirmDialogOpen = ref( false )
	const pendingSendButton = ref<HTMLButtonElement | null>( null )
	let shouldAllowNextSendClick = false

	const productionWikiDisplayName = computed( () => {
		return getWikiInstanceById( activeExplorerWikiInstanceId.value )?.displayName ?? ''
	} )

	const confirmDialogPrimaryAction = computed( (): PrimaryModalAction => ( {
		label: resolveInterfaceMessage( 'explorer-scalar-write-confirm-confirm' ),
		actionType: 'progressive'
	} ) )

	const confirmDialogDefaultAction = computed( (): ModalAction => ( {
		label: resolveInterfaceMessage( 'explorer-scalar-write-confirm-cancel' )
	} ) )

	const confirmDialogCloseButtonLabel = computed( () => {
		return resolveInterfaceMessage( 'explorer-scalar-write-confirm-close' )
	} )

	/**
	 * Capture-phase handler: blocks Send on write methods until the user confirms.
	 *
	 * @param clickEvent - Document click event.
	 * @returns Nothing.
	 */
	function onDocumentClickCapture( clickEvent: MouseEvent ): void {
		if ( !SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED ) {
			return
		}

		if ( shouldAllowNextSendClick ) {
			shouldAllowNextSendClick = false
			return
		}

		const sendButton = resolveScalarAddressBarSendButton( clickEvent.target )

		if ( !sendButton ) {
			return
		}

		const modalRoot = findOpenScalarClientModal()
		const httpMethod = resolveHttpMethodFromModalElement( modalRoot )

		if ( !isWriteHttpMethod( httpMethod ) ) {
			return
		}

		// Sandbox address-bar hosts (e.g. test.wikimedia.org) skip confirm — same as
		// hiding the production CdxMessage warning.
		if ( isActiveAddressBarServerTestWiki( activeExplorerWikiInstanceId.value, modalRoot ) ) {
			return
		}

		clickEvent.preventDefault()
		clickEvent.stopImmediatePropagation()

		pendingSendButton.value = sendButton
		isWriteRequestConfirmDialogOpen.value = true
	}

	/**
	 * Closes the dialog without sending the request.
	 *
	 * @returns Nothing.
	 */
	function onWriteRequestConfirmDialogCancel(): void {
		isWriteRequestConfirmDialogOpen.value = false
		pendingSendButton.value = null
	}

	/**
	 * Confirms and re-triggers the intercepted Scalar Send click once.
	 *
	 * @returns Nothing.
	 */
	function onWriteRequestConfirmDialogPrimary(): void {
		const sendButton = pendingSendButton.value

		isWriteRequestConfirmDialogOpen.value = false
		pendingSendButton.value = null

		if ( !sendButton ) {
			return
		}

		shouldAllowNextSendClick = true

		// Defer so CdxDialog can finish closing before Scalar handles Send.
		requestAnimationFrame( () => {
			sendButton.click()
		} )
	}

	watch( isWriteRequestConfirmDialogOpen, ( isOpen ) => {
		if ( !isOpen && !shouldAllowNextSendClick ) {
			pendingSendButton.value = null
		}
	} )

	if ( import.meta.client && SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED ) {
		document.addEventListener( 'click', onDocumentClickCapture, true )
	}

	onBeforeUnmount( () => {
		document.removeEventListener( 'click', onDocumentClickCapture, true )
		pendingSendButton.value = null
	} )

	return {
		isWriteRequestConfirmDialogOpen,
		productionWikiDisplayName,
		confirmDialogPrimaryAction,
		confirmDialogDefaultAction,
		confirmDialogCloseButtonLabel,
		onWriteRequestConfirmDialogPrimary,
		onWriteRequestConfirmDialogCancel
	}
}
