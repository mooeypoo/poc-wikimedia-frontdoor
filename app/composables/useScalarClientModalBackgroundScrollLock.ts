import { onBeforeUnmount, watch, type Ref } from 'vue'
import type { ScalarInterfaceHandle } from './useExplorerScalarFocus'
import { useColorMode } from './useColorMode'

/**
 * State-marker class on `.explorer-page__scalar-shell` while Test Request is open.
 * Pairs with explorer-codex-overrides.css rules that size the modal to its content
 * (natural height — see ARCHITECTURE.md / DESIGN_REQUIREMENTS.md).
 */
export const EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS =
	'explorer-page__scalar-shell--client-modal-open'

interface ScalarWorkspaceEventBus {
	on: ( eventName: string, handler: ( payload: unknown ) => void ) => void
	off: ( eventName: string, handler: ( payload: unknown ) => void ) => void
}

/**
 * @returns The shell main+end page scrollport, if mounted.
 */
function getExplorerBodyScrollElement(): HTMLElement | null {
	if ( typeof document === 'undefined' ) {
		return null
	}

	const bodyScrollElement = document.querySelector( '.frontdoor-shell__body-scroll' )

	return bodyScrollElement instanceof HTMLElement ? bodyScrollElement : null
}

/**
 * @returns The open Test Request dialog element inside the marked shell, if any.
 */
function getOpenScalarClientDialog(): HTMLElement | null {
	if ( typeof document === 'undefined' ) {
		return null
	}

	const dialogElement = document.querySelector(
		`.${ EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS } .scalar-client[role="dialog"]`
	)

	return dialogElement instanceof HTMLElement ? dialogElement : null
}

/**
 * Returns whether a target is inside the Scalar shell (modal / exit overlay).
 *
 * @param target - Event target node.
 * @param scalarShell - Explorer Scalar shell element.
 * @returns True when the target is within the shell.
 */
function isTargetInsideScalarShell(
	target: EventTarget | null,
	scalarShell: HTMLElement | null
): boolean {
	return Boolean(
		target instanceof Node &&
		scalarShell &&
		scalarShell.contains( target )
	)
}

/**
 * Returns whether a client point lies inside an element’s border box.
 *
 * @param element - Element to test.
 * @param clientX - Viewport X.
 * @param clientY - Viewport Y.
 * @returns True when the point is inside the element.
 */
function isPointInsideElement(
	element: Element,
	clientX: number,
	clientY: number
): boolean {
	const box = element.getBoundingClientRect()

	return (
		clientX >= box.left &&
		clientX <= box.right &&
		clientY >= box.top &&
		clientY <= box.bottom
	)
}

/**
 * Manages Test Request open state for natural-height explorer specs.
 *
 * Specs and the Test Request modal both grow with content; vertical travel is
 * `.frontdoor-shell__body-scroll`. On open this composable scrolls the Scalar
 * shell into view (modal mounts at the shell top) and toggles
 * {@link EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS} for the Test Request
 * UI exploration CSS. While open, pointerdown outside the Scalar shell sets
 * `inert` on Scalar’s `aria-modal` dialog so its focus-trap cannot reclaim
 * focus from shell chrome (e.g. header preferences `CdxPopover`). Clears
 * `inert` when the user points back at the shell (so close / exit work again —
 * including retargeting `.app-exit-button` while inert skips hit-testing), when
 * the color theme changes after preferences dismiss, or when the modal closes.
 *
 * @param scalarShellElement - Explorer Scalar shell element.
 * @param scalarInterface - Scalar event bus / workspace handle from ApiReference.
 * @returns Nothing. Establishes listeners and cleans up on unmount.
 */
export function useScalarClientModalBackgroundScrollLock(
	scalarShellElement: Ref<HTMLElement | null>,
	scalarInterface: Ref<ScalarInterfaceHandle | null>
): void {
	let lastKnownModalOpen = false
	let bodyScrollTopBeforeModalOpen = 0
	let boundEventBus: ScalarWorkspaceEventBus | null = null

	const { resolvedMode } = useColorMode()

	/**
	 * Scrolls the page so the Scalar shell top aligns with the body-scroll top.
	 *
	 * @param scalarShell - Scalar shell element.
	 * @param bodyScrollElement - Page scrollport.
	 * @returns Nothing.
	 */
	function scrollShellIntoPageView(
		scalarShell: HTMLElement,
		bodyScrollElement: HTMLElement
	): void {
		const shellTopPx = scalarShell.getBoundingClientRect().top
		const bodyTopPx = bodyScrollElement.getBoundingClientRect().top
		bodyScrollElement.scrollTop += ( shellTopPx - bodyTopPx )
	}

	/**
	 * Marks the Test Request dialog inert so Scalar’s focus-trap cannot steal
	 * focus from shell chrome / teleported Codex overlays.
	 *
	 * @returns Nothing.
	 */
	function pauseScalarClientFocusTrapForShellChrome(): void {
		const dialogElement = getOpenScalarClientDialog()

		if ( dialogElement ) {
			dialogElement.inert = true
		}
	}

	/**
	 * Clears inert on the Test Request dialog so the focus-trap can resume and
	 * close / exit controls receive pointer events again.
	 *
	 * @returns Nothing.
	 */
	function resumeScalarClientFocusTrap(): void {
		const dialogElement = getOpenScalarClientDialog()

		if ( dialogElement ) {
			dialogElement.inert = false
		}
	}

	/**
	 * Capture-phase pointerdown: pause the trap for outside-shell chrome;
	 * resume for any interaction aimed at the Scalar shell (including close).
	 *
	 * @param event - Pointer event.
	 * @returns Nothing.
	 */
	function onDocumentPointerDownCapture( event: PointerEvent ): void {
		if ( !lastKnownModalOpen ) {
			return
		}

		const scalarShell = scalarShellElement.value
		const eventTarget = event.target
		const dialogElement = getOpenScalarClientDialog()

		/*
		 * While the dialog is inert, hit-testing skips it (and the close button
		 * inside it). If the pointer is over the shell, clear inert and — when
		 * the point lands on the close control — activate it so theme changes
		 * cannot leave the modal uncloseable.
		 */
		if (
			dialogElement?.inert &&
			scalarShell &&
			isPointInsideElement( scalarShell, event.clientX, event.clientY )
		) {
			resumeScalarClientFocusTrap()

			const elementUnderPointer = document.elementFromPoint(
				event.clientX,
				event.clientY
			)
			const exitButton = elementUnderPointer instanceof Element
				? elementUnderPointer.closest( '.app-exit-button' )
				: null

			if ( exitButton instanceof HTMLElement ) {
				exitButton.click()
				event.preventDefault()
				event.stopPropagation()
			}

			return
		}

		if ( isTargetInsideScalarShell( eventTarget, scalarShell ) ) {
			resumeScalarClientFocusTrap()
			return
		}

		/*
		 * Outside the Scalar shell (header settings, language, teleported
		 * `.cdx-popover` / `.cdx-menu`, project controls, etc.). Scalar’s
		 * useFocusTrap uses allowOutsideClick but still pulls focus back on
		 * focusin — which dismisses CdxPopover immediately after open.
		 */
		pauseScalarClientFocusTrapForShellChrome()
	}

	/**
	 * Applies or clears the natural-height modal open class and page scroll restore.
	 *
	 * @param isModalOpen - Whether the Test Request modal is open.
	 * @returns Nothing.
	 */
	function syncClientModalOpenState( isModalOpen: boolean ): void {
		const scalarShell = scalarShellElement.value
		const bodyScrollElement = getExplorerBodyScrollElement()

		if ( lastKnownModalOpen === isModalOpen ) {
			if ( isModalOpen && scalarShell ) {
				scalarShell.classList.add( EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS )
			}

			return
		}

		if ( isModalOpen && scalarShell ) {
			if ( bodyScrollElement ) {
				bodyScrollTopBeforeModalOpen = bodyScrollElement.scrollTop
				scrollShellIntoPageView( scalarShell, bodyScrollElement )
			}

			lastKnownModalOpen = true
			scalarShell.classList.add( EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS )
			return
		}

		lastKnownModalOpen = false
		resumeScalarClientFocusTrap()

		if ( scalarShell ) {
			scalarShell.classList.remove( EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS )
		}

		if ( bodyScrollElement ) {
			bodyScrollElement.scrollTop = bodyScrollTopBeforeModalOpen
		}
	}

	/**
	 * Clears the open class and restores pre-modal page scroll.
	 *
	 * @returns Nothing.
	 */
	function clearClientModalOpenState(): void {
		const wasOpen = lastKnownModalOpen
		lastKnownModalOpen = false
		resumeScalarClientFocusTrap()

		const scalarShell = scalarShellElement.value
		const bodyScrollElement = getExplorerBodyScrollElement()

		if ( scalarShell ) {
			scalarShell.classList.remove( EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS )
		}

		if ( wasOpen && bodyScrollElement ) {
			bodyScrollElement.scrollTop = bodyScrollTopBeforeModalOpen
		}
	}

	/**
	 * Subscribes to Scalar event-bus modal open/close.
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
	 * Marks the shell when Scalar reports the Test Request modal opened.
	 *
	 * @param _payload - Unused Scalar event payload.
	 * @returns Nothing.
	 */
	function onModalOpen( _payload: unknown ): void {
		syncClientModalOpenState( true )
	}

	/**
	 * Clears the shell mark when Scalar reports the Test Request modal closed.
	 *
	 * @param _payload - Unused Scalar event payload.
	 * @returns Nothing.
	 */
	function onModalClose( _payload: unknown ): void {
		syncClientModalOpenState( false )
	}

	if ( typeof document !== 'undefined' ) {
		document.addEventListener( 'pointerdown', onDocumentPointerDownCapture, true )
	}

	/*
	 * Changing appearance updates Scalar `darkMode` in place. Do not clear
	 * `inert` while the preferences popover is still open (that re-enables the
	 * focus-trap flicker). Shell pointerdown retargets close while inert; once
	 * preferences dismiss, clear inert if it was left stuck.
	 */
	watch( resolvedMode, () => {
		if ( !lastKnownModalOpen ) {
			return
		}

		queueMicrotask( () => {
			const settingsButton = document.querySelector(
				'.shell-header-utility-actions__settings-button'
			)
			const isPreferencesOpen =
				settingsButton?.getAttribute( 'aria-expanded' ) === 'true'

			if ( !isPreferencesOpen ) {
				resumeScalarClientFocusTrap()
			}
		} )
	} )

	watch( scalarShellElement, () => {
		const wasOpen = lastKnownModalOpen
		lastKnownModalOpen = false

		if ( wasOpen ) {
			syncClientModalOpenState( true )
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
		if ( typeof document !== 'undefined' ) {
			document.removeEventListener( 'pointerdown', onDocumentPointerDownCapture, true )
		}

		if ( boundEventBus ) {
			boundEventBus.off( 'ui:open:client-modal', onModalOpen )
			boundEventBus.off( 'ui:close:client-modal', onModalClose )
			boundEventBus = null
		}

		clearClientModalOpenState()
	} )
}
