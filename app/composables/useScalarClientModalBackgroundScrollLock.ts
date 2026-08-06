import { onBeforeUnmount, watch, type Ref } from 'vue'
import {
	EXPLORER_TEST_REQUEST_MODAL_GUTTER_PX,
	EXPLORER_TEST_REQUEST_SHELL_BLOCK_SIZE_UPDATE_THRESHOLD_PX
} from '../../config/explorerSurfaces'
import type { ScalarInterfaceHandle } from './useExplorerScalarFocus'
import { useColorMode } from './useColorMode'

/**
 * State-marker class on `.explorer-page__scalar-shell` while Test Request is open.
 * Pairs with explorer-codex-overrides.css (overlay / gutter) and scoped shell
 * clamp styles in `app/pages/explorer/[[view]].vue` (natural height — see
 * ARCHITECTURE.md / DESIGN_REQUIREMENTS.md).
 */
export const EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS =
	'explorer-page__scalar-shell--client-modal-open'

/**
 * CSS custom property on the Scalar shell: block size while Test Request is open
 * (dialog `scrollHeight` + vertical gutter). Clips the OpenAPI document under
 * the overlay so page scroll cannot travel into specs past the sandbox.
 */
export const EXPLORER_TEST_REQUEST_SHELL_BLOCK_SIZE_CSS_VAR =
	'--fd-explorer-test-request-shell-block-size'

/** How many animation frames to wait for Scalar to mount the dialog after open. */
const DIALOG_MOUNT_MAX_FRAMES = 30

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
 * Reads the Test Request gutter (block padding) from the shell CSS variable.
 *
 * @param scalarShell - Explorer Scalar shell element.
 * @returns Gutter in CSS pixels (one side).
 */
function getTestRequestModalGutterPx( scalarShell: HTMLElement ): number {
	const resolvedPadding = getComputedStyle( scalarShell )
		.getPropertyValue( '--fd-explorer-test-request-modal-padding' )
		.trim()
	const parsedPaddingPx = Number.parseFloat( resolvedPadding )

	return Number.isFinite( parsedPaddingPx )
		? parsedPaddingPx
		: EXPLORER_TEST_REQUEST_MODAL_GUTTER_PX
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
 * shell into view, toggles {@link EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS},
 * and sets {@link EXPLORER_TEST_REQUEST_SHELL_BLOCK_SIZE_CSS_VAR} from dialog
 * **`scrollHeight` + vertical gutter** (`ResizeObserver`, deadband from
 * `config/explorerSurfaces.ts`) so page scroll cannot continue into the OpenAPI
 * document under the overlay. Shell **`block-size` / `overflow-block: clip`**
 * must stay in **scoped** `explorer/[[view]].vue` styles (unscoped overrides
 * lose to `[data-v-*]`). Content above the shell and the site footer remain
 * reachable. While open, pointerdown outside the Scalar shell sets `inert` on
 * Scalar’s `aria-modal` dialog so its focus-trap cannot reclaim focus from shell
 * chrome (e.g. header preferences `CdxPopover`). Clears `inert` when the user
 * points back at the shell (including retargeting `.app-exit-button`), when the
 * color theme changes after preferences dismiss, or when the modal closes.
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
	let dialogResizeObserver: ResizeObserver | null = null
	let dialogMountFrameCount = 0
	let dialogMountRafId = 0
	let lastAppliedShellBlockSizePx = 0

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
	 * Sets the shell block-size CSS variable from the open dialog + gutter.
	 *
	 * Uses `scrollHeight` (content size) rather than the laid-out border box so
	 * a percentage-sized ancestor cannot feed a ResizeObserver loop. Skips
	 * updates smaller than
	 * {@link EXPLORER_TEST_REQUEST_SHELL_BLOCK_SIZE_UPDATE_THRESHOLD_PX}.
	 *
	 * @returns True when a dialog was measured (variable may be unchanged).
	 */
	function syncShellBlockSizeToOpenDialog(): boolean {
		const scalarShell = scalarShellElement.value
		const dialogElement = getOpenScalarClientDialog()

		if ( !scalarShell || !dialogElement ) {
			return false
		}

		const gutterPx = getTestRequestModalGutterPx( scalarShell )
		/*
		 * Prefer content size. `getBoundingClientRect().height` can equal the
		 * shell-constrained box and re-enter the clamp loop.
		 */
		const dialogHeightPx = Math.max(
			dialogElement.scrollHeight,
			dialogElement.offsetHeight
		)
		/*
		 * Container padding is gutter on block-start and block-end (40px each).
		 * Shell height = dialog + both paddings so the sandbox is the scroll
		 * extent; specs under the overlay are clipped.
		 */
		const shellBlockSizePx = Math.ceil( dialogHeightPx + ( gutterPx * 2 ) )

		if (
			lastAppliedShellBlockSizePx > 0 &&
			Math.abs( shellBlockSizePx - lastAppliedShellBlockSizePx ) <
				EXPLORER_TEST_REQUEST_SHELL_BLOCK_SIZE_UPDATE_THRESHOLD_PX
		) {
			return true
		}

		lastAppliedShellBlockSizePx = shellBlockSizePx
		scalarShell.style.setProperty(
			EXPLORER_TEST_REQUEST_SHELL_BLOCK_SIZE_CSS_VAR,
			`${ shellBlockSizePx }px`
		)

		return true
	}

	/**
	 * Clears the shell height clamp used while Test Request is open.
	 *
	 * @returns Nothing.
	 */
	function clearShellBlockSizeClamp(): void {
		lastAppliedShellBlockSizePx = 0
		const scalarShell = scalarShellElement.value

		if ( scalarShell ) {
			scalarShell.style.removeProperty(
				EXPLORER_TEST_REQUEST_SHELL_BLOCK_SIZE_CSS_VAR
			)
		}
	}

	/**
	 * Stops observing the Test Request dialog for size changes.
	 *
	 * @returns Nothing.
	 */
	function stopDialogResizeObservation(): void {
		if ( dialogMountRafId !== 0 ) {
			cancelAnimationFrame( dialogMountRafId )
			dialogMountRafId = 0
		}

		dialogMountFrameCount = 0

		if ( dialogResizeObserver ) {
			dialogResizeObserver.disconnect()
			dialogResizeObserver = null
		}

	}

	/**
	 * Observes the open dialog and keeps the shell height in sync as content grows.
	 *
	 * @returns Nothing.
	 */
	function startDialogResizeObservation(): void {
		stopDialogResizeObservation()

		if ( typeof ResizeObserver === 'undefined' ) {
			syncShellBlockSizeToOpenDialog()
			return
		}

		/**
		 * Waits for Scalar to mount `[role="dialog"]`, then observes it.
		 *
		 * @returns Nothing.
		 */
		function tryAttachObserver(): void {
			if ( !lastKnownModalOpen ) {
				return
			}

			const dialogElement = getOpenScalarClientDialog()

			if ( !dialogElement ) {
				dialogMountFrameCount += 1

				if ( dialogMountFrameCount < DIALOG_MOUNT_MAX_FRAMES ) {
					dialogMountRafId = requestAnimationFrame( tryAttachObserver )
				}

				return
			}

			dialogMountRafId = 0
			syncShellBlockSizeToOpenDialog()

			dialogResizeObserver = new ResizeObserver( () => {
				if ( lastKnownModalOpen ) {
					syncShellBlockSizeToOpenDialog()
				}
			} )
			dialogResizeObserver.observe( dialogElement )
		}

		dialogMountRafId = requestAnimationFrame( tryAttachObserver )
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
	 * Applies or clears the natural-height modal open class, shell height clamp,
	 * and page scroll restore.
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
				startDialogResizeObservation()
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
			startDialogResizeObservation()
			return
		}

		lastKnownModalOpen = false
		stopDialogResizeObservation()
		resumeScalarClientFocusTrap()
		clearShellBlockSizeClamp()

		if ( scalarShell ) {
			scalarShell.classList.remove( EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS )
		}

		if ( bodyScrollElement ) {
			bodyScrollElement.scrollTop = bodyScrollTopBeforeModalOpen
		}
	}

	/**
	 * Clears the open class, shell height clamp, and restores pre-modal page scroll.
	 *
	 * @returns Nothing.
	 */
	function clearClientModalOpenState(): void {
		const wasOpen = lastKnownModalOpen
		lastKnownModalOpen = false
		stopDialogResizeObservation()
		resumeScalarClientFocusTrap()
		clearShellBlockSizeClamp()

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
	 * preferences dismiss, clear inert if it was left stuck. Remeasure shell
	 * height after theme paint in case dialog chrome metrics change.
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

			syncShellBlockSizeToOpenDialog()
		} )
	} )

	watch( scalarShellElement, () => {
		const wasOpen = lastKnownModalOpen
		lastKnownModalOpen = false
		stopDialogResizeObservation()
		clearShellBlockSizeClamp()

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
