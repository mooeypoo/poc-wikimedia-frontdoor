import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import type { ScalarInterfaceHandle } from './useExplorerScalarFocus'

/**
 * State-marker class on `.explorer-page__scalar-shell` while Test Request is open.
 * Pairs with explorer-codex-overrides.css rules that pin the modal into the shell
 * client box (see ARCHITECTURE.md / DESIGN_REQUIREMENTS.md).
 */
export const EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS =
	'explorer-page__scalar-shell--client-modal-open'

interface ScalarWorkspaceEventBus {
	on: ( eventName: string, handler: ( payload: unknown ) => void ) => void
	off: ( eventName: string, handler: ( payload: unknown ) => void ) => void
}

/**
 * Returns whether a scroll/wheel event targets content inside an open Test Request modal.
 *
 * @param eventTarget - Event target from wheel or touchmove.
 * @param openModalRoot - Visible Scalar client modal root, if any.
 * @returns True when the event should keep scrolling the modal (not the reference).
 */
function isEventInsideOpenScalarClientModal(
	eventTarget: EventTarget | null,
	openModalRoot: HTMLElement | null
): boolean {
	return Boolean(
		openModalRoot
		&& eventTarget instanceof Node
		&& openModalRoot.contains( eventTarget )
	)
}

/**
 * Keeps the Test Request modal usable inside the visible Scalar shell.
 *
 * Scalar mounts the modal inside `.explorer-page__scalar-shell` (transform
 * containing block). After the reference has scrolled, the modal chrome can sit
 * above the visible client box; freezing `scrollTop` then traps the close control
 * off-screen. On open this composable snaps the shell to `scrollTop = 0` (restored
 * on close), freezes that position, blocks wheel/touch on the shell outside the
 * modal, and relies on CSS under
 * {@link EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS} to pin the overlay into
 * the shell client box. Open/close comes from the Scalar event bus only — a
 * body-wide MutationObserver freezes the explorer tab during Scalar mount.
 * Does **not** lock `.frontdoor-shell__body-scroll`.
 *
 * @param scalarShellElement - Explorer Scalar shell element (scrollport at ≥ 960px).
 * @param scalarInterface - Scalar event bus / workspace handle from ApiReference.
 * @returns Nothing. Establishes listeners and cleans up on unmount.
 */
export function useScalarClientModalBackgroundScrollLock(
	scalarShellElement: Ref<HTMLElement | null>,
	scalarInterface: Ref<ScalarInterfaceHandle | null>
): void {
	let lastKnownModalOpen = false
	let lockedShellScrollTop = 0
	let shellScrollTopBeforeModalOpen = 0
	let boundShellElement: HTMLElement | null = null
	let boundEventBus: ScalarWorkspaceEventBus | null = null

	/**
	 * Attaches the scroll-freeze listener to the current shell element.
	 *
	 * @returns Nothing.
	 */
	function bindShellScrollFreeze(): void {
		const scalarShell = scalarShellElement.value

		if ( boundShellElement === scalarShell ) {
			return
		}

		if ( boundShellElement ) {
			boundShellElement.removeEventListener( 'scroll', onShellScrollFreeze )
		}

		boundShellElement = scalarShell

		if ( boundShellElement ) {
			boundShellElement.addEventListener( 'scroll', onShellScrollFreeze, { passive: true } )
		}
	}

	/**
	 * Reverts reference-shell scroll while the Test Request modal is open.
	 *
	 * @returns Nothing.
	 */
	function onShellScrollFreeze(): void {
		if ( !lastKnownModalOpen || !boundShellElement ) {
			return
		}

		if ( boundShellElement.scrollTop !== lockedShellScrollTop ) {
			boundShellElement.scrollTop = lockedShellScrollTop
		}
	}

	/**
	 * Applies or clears the reference-shell scroll lock.
	 *
	 * @param isModalOpen - Whether the Test Request modal is open.
	 * @returns Nothing.
	 */
	function syncBackgroundScrollLock( isModalOpen: boolean ): void {
		bindShellScrollFreeze()

		const scalarShell = scalarShellElement.value

		if ( lastKnownModalOpen === isModalOpen ) {
			if ( isModalOpen && scalarShell ) {
				scalarShell.classList.add( EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS )
				onShellScrollFreeze()
			}

			return
		}

		if ( isModalOpen && scalarShell ) {
			// Snap to the shell client top so the transform-contained modal chrome
			// (close control, address bar) is inside the visible box; restore on close.
			shellScrollTopBeforeModalOpen = scalarShell.scrollTop
			scalarShell.scrollTop = 0
			lockedShellScrollTop = 0
			lastKnownModalOpen = true
			scalarShell.classList.add( EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS )
			onShellScrollFreeze()
			return
		}

		lastKnownModalOpen = false

		if ( scalarShell ) {
			scalarShell.classList.remove( EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS )
			scalarShell.scrollTop = shellScrollTopBeforeModalOpen
		}
	}

	/**
	 * Clears the reference-shell scroll lock and restores pre-modal scroll.
	 *
	 * @returns Nothing.
	 */
	function clearBackgroundScrollLock(): void {
		const wasOpen = lastKnownModalOpen
		lastKnownModalOpen = false

		const scalarShell = scalarShellElement.value

		if ( scalarShell ) {
			scalarShell.classList.remove( EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS )

			if ( wasOpen ) {
				scalarShell.scrollTop = shellScrollTopBeforeModalOpen
			}
		}
	}

	/**
	 * Prevents wheel / touch scrolling of the reference shell while the modal is open.
	 *
	 * Modal-internal scroll regions are left alone. Does not touch page body scroll.
	 *
	 * @param scrollEvent - Wheel or touchmove event.
	 * @returns Nothing.
	 */
	function onReferenceShellScrollGesture( scrollEvent: Event ): void {
		if ( !lastKnownModalOpen ) {
			return
		}

		const scalarShell = scalarShellElement.value

		if ( !scalarShell ) {
			return
		}

		const eventTarget = scrollEvent.target

		if ( !( eventTarget instanceof Node ) ) {
			return
		}

		const isOverScalarShell = scalarShell.contains( eventTarget ) || scalarShell === eventTarget

		if ( !isOverScalarShell ) {
			return
		}

		const openModalRoot = scalarShell.querySelector( '.scalar-client[role="dialog"]' )

		if (
			isEventInsideOpenScalarClientModal(
				eventTarget,
				openModalRoot instanceof HTMLElement ? openModalRoot : null
			)
		) {
			return
		}

		scrollEvent.preventDefault()
	}

	/**
	 * Subscribes to Scalar event-bus modal open/close for lock sync.
	 *
	 * @param eventBus - Workspace event bus from ApiReference.
	 * @returns Nothing.
	 */
	function bindEventBus( eventBus: ScalarWorkspaceEventBus ): void {
		if ( boundEventBus === eventBus ) {
			return
		}

		if ( boundEventBus ) {
			boundEventBus.off( 'ui:open:client-modal', onModalOpen )
			boundEventBus.off( 'ui:close:client-modal', onModalClose )
		}

		boundEventBus = eventBus
		eventBus.on( 'ui:open:client-modal', onModalOpen )
		eventBus.on( 'ui:close:client-modal', onModalClose )
	}

	/**
	 * Locks the reference shell when Scalar reports the Test Request modal opened.
	 *
	 * @param _payload - Unused Scalar event payload.
	 * @returns Nothing.
	 */
	function onModalOpen( _payload: unknown ): void {
		syncBackgroundScrollLock( true )
	}

	/**
	 * Unlocks the reference shell when Scalar reports the Test Request modal closed.
	 *
	 * @param _payload - Unused Scalar event payload.
	 * @returns Nothing.
	 */
	function onModalClose( _payload: unknown ): void {
		syncBackgroundScrollLock( false )
	}

	onMounted( () => {
		bindShellScrollFreeze()

		document.addEventListener( 'wheel', onReferenceShellScrollGesture, { capture: true, passive: false } )
		document.addEventListener( 'touchmove', onReferenceShellScrollGesture, { capture: true, passive: false } )
	} )

	watch( scalarShellElement, () => {
		const wasOpen = lastKnownModalOpen
		lastKnownModalOpen = false
		bindShellScrollFreeze()

		if ( wasOpen ) {
			syncBackgroundScrollLock( true )
		}
	} )

	watch(
		scalarInterface,
		( nextScalarInterface ) => {
			const eventBus = nextScalarInterface?.eventBus as ScalarWorkspaceEventBus | undefined

			if ( eventBus?.on ) {
				bindEventBus( eventBus )
			}
		},
		{ immediate: true }
	)

	onBeforeUnmount( () => {
		document.removeEventListener( 'wheel', onReferenceShellScrollGesture, true )
		document.removeEventListener( 'touchmove', onReferenceShellScrollGesture, true )

		if ( boundShellElement ) {
			boundShellElement.removeEventListener( 'scroll', onShellScrollFreeze )
			boundShellElement = null
		}

		if ( boundEventBus ) {
			boundEventBus.off( 'ui:open:client-modal', onModalOpen )
			boundEventBus.off( 'ui:close:client-modal', onModalClose )
			boundEventBus = null
		}

		clearBackgroundScrollLock()
	} )
}
