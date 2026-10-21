import {
	computed,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
	type CSSProperties,
	type ComputedRef,
	type Ref
} from 'vue'
import {
	EXPLORER_BACK_TO_TOP_REVEAL_SCROLL_PX,
	EXPLORER_BACK_TO_TOP_SHELL_INLINE_END_INSET_PX,
	EXPLORER_BACK_TO_TOP_VIEWPORT_BLOCK_END_INSET_PX
} from '../../config/explorerSurfaces'
import { EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS } from './useScalarClientModalBackgroundScrollLock'

/**
 * Positions and reveals the explorer “Back to top” control.
 *
 * The button is `position: fixed` to the viewport (32px from the block-end) and
 * aligned to the Scalar shell’s inline-end border with a 16px inset. It cannot
 * live as a `fixed` child of `.explorer-page__scalar-shell` because that shell
 * uses `transform: translateZ(0)` (a containing block for fixed descendants).
 * Scroll target is `.frontdoor-shell__body-scroll`.
 *
 * @param scalarShellRef - Explorer Scalar shell element used for inline alignment.
 * @returns Visibility, positioned style, accessible label, and scroll action.
 */
export function useExplorerBackToTop(
	scalarShellRef: Ref<HTMLElement | null>
): {
	isBackToTopVisible: ComputedRef<boolean>
	backToTopStyle: ComputedRef<CSSProperties>
	backToTopLabel: ComputedRef<string>
	onBackToTop: () => void
} {
	const { $bananaI18n } = useNuxtApp()
	const backToTopLabel = computed( () => $bananaI18n( 'explorer-back-to-top-label' ) )

	const isScrolledPastReveal = ref( false )
	const isShellInlineVisible = ref( false )
	const isClientModalOpen = ref( false )
	const insetInlineEndPx = ref( EXPLORER_BACK_TO_TOP_SHELL_INLINE_END_INSET_PX )

	/**
	 * Resolves the shell body scrollport used for page scroll.
	 *
	 * @returns The body-scroll element, or null when the shell is not mounted.
	 */
	function resolveBodyScrollElement(): HTMLElement | null {
		return document.querySelector( '.frontdoor-shell__body-scroll' )
	}

	/**
	 * Updates reveal state and inline-end inset from the shell and scrollport.
	 *
	 * @returns Nothing.
	 */
	function updateBackToTopLayout(): void {
		const shellElement = scalarShellRef.value
		const bodyScrollElement = resolveBodyScrollElement()

		if ( !shellElement || !bodyScrollElement ) {
			isScrolledPastReveal.value = false
			isShellInlineVisible.value = false
			isClientModalOpen.value = false
			return
		}

		isClientModalOpen.value = shellElement.classList.contains(
			EXPLORER_SCALAR_SHELL_CLIENT_MODAL_OPEN_CLASS
		)
		isScrolledPastReveal.value = bodyScrollElement.scrollTop >= EXPLORER_BACK_TO_TOP_REVEAL_SCROLL_PX

		const shellRect = shellElement.getBoundingClientRect()
		isShellInlineVisible.value = shellRect.right > 0 && shellRect.left < window.innerWidth

		const isRtl = document.documentElement.getAttribute( 'dir' ) === 'rtl'
		insetInlineEndPx.value = isRtl
			? shellRect.left + EXPLORER_BACK_TO_TOP_SHELL_INLINE_END_INSET_PX
			: window.innerWidth - shellRect.right + EXPLORER_BACK_TO_TOP_SHELL_INLINE_END_INSET_PX
	}

	const isBackToTopVisible = computed( () => {
		return isScrolledPastReveal.value &&
			isShellInlineVisible.value &&
			!isClientModalOpen.value &&
			Boolean( scalarShellRef.value )
	} )

	const backToTopStyle = computed( (): CSSProperties => {
		return {
			insetBlockEnd: `${ EXPLORER_BACK_TO_TOP_VIEWPORT_BLOCK_END_INSET_PX }px`,
			insetInlineEnd: `${ Math.max( 0, insetInlineEndPx.value ) }px`
		}
	} )

	/**
	 * Smooth-scrolls the shell body scrollport to the top of the explorer page.
	 *
	 * @returns Nothing.
	 */
	function onBackToTop(): void {
		const bodyScrollElement = resolveBodyScrollElement()
		if ( !bodyScrollElement ) {
			return
		}

		bodyScrollElement.scrollTo( {
			top: 0,
			behavior: 'smooth'
		} )
	}

	let bodyScrollElement: HTMLElement | null = null
	let shellResizeObserver: ResizeObserver | null = null
	let shellClassObserver: MutationObserver | null = null

	/**
	 * Observes shell size and class changes used for layout / modal visibility.
	 *
	 * @param shellElement - Scalar shell to observe, or null to clear.
	 * @returns Nothing.
	 */
	function observeShellElement( shellElement: HTMLElement | null ): void {
		shellResizeObserver?.disconnect()
		shellClassObserver?.disconnect()

		if ( !shellElement ) {
			return
		}

		shellResizeObserver = new ResizeObserver( () => {
			updateBackToTopLayout()
		} )
		shellResizeObserver.observe( shellElement )

		shellClassObserver = new MutationObserver( () => {
			updateBackToTopLayout()
		} )
		shellClassObserver.observe( shellElement, {
			attributes: true,
			attributeFilter: [ 'class' ]
		} )
	}

	onMounted( () => {
		bodyScrollElement = resolveBodyScrollElement()
		bodyScrollElement?.addEventListener( 'scroll', updateBackToTopLayout, { passive: true } )
		window.addEventListener( 'resize', updateBackToTopLayout, { passive: true } )
		observeShellElement( scalarShellRef.value )
		updateBackToTopLayout()
	} )

	watch( scalarShellRef, ( shellElement ) => {
		observeShellElement( shellElement )
		updateBackToTopLayout()
	} )

	onBeforeUnmount( () => {
		bodyScrollElement?.removeEventListener( 'scroll', updateBackToTopLayout )
		window.removeEventListener( 'resize', updateBackToTopLayout )
		shellResizeObserver?.disconnect()
		shellClassObserver?.disconnect()
		shellResizeObserver = null
		shellClassObserver = null
		bodyScrollElement = null
	} )

	return {
		isBackToTopVisible,
		backToTopStyle,
		backToTopLabel,
		onBackToTop
	}
}
