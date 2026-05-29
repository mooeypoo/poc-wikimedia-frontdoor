import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

const WIDE_LAYOUT_MEDIA_QUERY = '(min-width: 70rem)'

interface ExplorerRailStickyStyle {
	'--explorer-rail-sticky-inset': string
}

/**
 * Keeps the explorer module rail sticky inset aligned with the REST module header,
 * then tracks the Scalar shell top edge once scrolling brings them together.
 *
 * @param railAlignAnchorElement - Ref to the REST module label paragraph (or fallback anchor).
 * @param scalarShellElement - Ref to `.explorer-page__scalar-shell` in the main column.
 * @returns Reactive inline style for the rail and a manual refresh hook.
 */
export function useExplorerRailStickyAlign(
	railAlignAnchorElement: Ref<HTMLElement | null>,
	scalarShellElement: Ref<HTMLElement | null>
): {
	railStickyStyle: ComputedRef<ExplorerRailStickyStyle | undefined>
	refreshRailStickyAlign: () => void
} {
	const stickyInsetBlockStart = ref( '' )
	const defaultStickyInsetPx = ref( 0 )

	let animationFrameId = 0
	let mediaQueryList: MediaQueryList | null = null
	let resizeObserver: ResizeObserver | null = null

	/**
	 * Caches the viewport top offset that aligns the rail with the REST module label line.
	 *
	 * Only updates near the top of the page so mid-scroll measurements stay stable.
	 *
	 * @returns Nothing.
	 */
	function measureDefaultStickyInset(): void {
		const alignAnchorElement = railAlignAnchorElement.value
		if ( !alignAnchorElement ) {
			return
		}

		if ( typeof window !== 'undefined' && window.scrollY > 64 ) {
			return
		}

		defaultStickyInsetPx.value = alignAnchorElement.getBoundingClientRect().top
	}

	/**
	 * Recomputes the rail sticky inset from the REST module label and Scalar shell positions.
	 *
	 * @returns Nothing.
	 */
	function updateStickyInset(): void {
		if ( typeof window === 'undefined' ) {
			return
		}

		if ( !window.matchMedia( WIDE_LAYOUT_MEDIA_QUERY ).matches ) {
			stickyInsetBlockStart.value = ''
			return
		}

		if ( defaultStickyInsetPx.value <= 0 ) {
			measureDefaultStickyInset()
		}

		const defaultTopPx = defaultStickyInsetPx.value
		if ( defaultTopPx <= 0 ) {
			stickyInsetBlockStart.value = ''
			return
		}

		const scalarShellTopPx = scalarShellElement.value?.getBoundingClientRect().top
		const nextInsetPx = typeof scalarShellTopPx === 'number' && !Number.isNaN( scalarShellTopPx )
			? Math.min( defaultTopPx, scalarShellTopPx )
			: defaultTopPx

		stickyInsetBlockStart.value = `${ Math.max( 0, nextInsetPx ) }px`
	}

	/**
	 * Schedules a sticky inset update on the next animation frame.
	 *
	 * @returns Nothing.
	 */
	function refreshRailStickyAlign(): void {
		if ( typeof window === 'undefined' ) {
			return
		}

		cancelAnimationFrame( animationFrameId )
		animationFrameId = requestAnimationFrame( () => {
			updateStickyInset()
		} )
	}

	const railStickyStyle = computed( () => {
		if ( !stickyInsetBlockStart.value ) {
			return undefined
		}

		return {
			'--explorer-rail-sticky-inset': stickyInsetBlockStart.value
		}
	} )

	onMounted( () => {
		if ( typeof window === 'undefined' ) {
			return
		}

		mediaQueryList = window.matchMedia( WIDE_LAYOUT_MEDIA_QUERY )
		mediaQueryList.addEventListener( 'change', refreshRailStickyAlign )
		window.addEventListener( 'scroll', refreshRailStickyAlign, { passive: true } )
		window.addEventListener( 'resize', refreshRailStickyAlign, { passive: true } )

		resizeObserver = new ResizeObserver( () => {
			measureDefaultStickyInset()
			refreshRailStickyAlign()
		} )

		if ( railAlignAnchorElement.value ) {
			resizeObserver.observe( railAlignAnchorElement.value )
		}

		if ( scalarShellElement.value ) {
			resizeObserver.observe( scalarShellElement.value )
		}

		requestAnimationFrame( () => {
			measureDefaultStickyInset()
			refreshRailStickyAlign()
		} )
	} )

	onUnmounted( () => {
		cancelAnimationFrame( animationFrameId )
		mediaQueryList?.removeEventListener( 'change', refreshRailStickyAlign )
		window.removeEventListener( 'scroll', refreshRailStickyAlign )
		window.removeEventListener( 'resize', refreshRailStickyAlign )
		resizeObserver?.disconnect()
	} )

	watch( railAlignAnchorElement, ( nextAlignAnchorElement, previousAlignAnchorElement ) => {
		if ( previousAlignAnchorElement ) {
			resizeObserver?.unobserve( previousAlignAnchorElement )
		}

		if ( nextAlignAnchorElement ) {
			resizeObserver?.observe( nextAlignAnchorElement )
		}

		measureDefaultStickyInset()
		refreshRailStickyAlign()
	} )

	watch( scalarShellElement, ( nextScalarShellElement, previousScalarShellElement ) => {
		if ( previousScalarShellElement ) {
			resizeObserver?.unobserve( previousScalarShellElement )
		}

		if ( nextScalarShellElement ) {
			resizeObserver?.observe( nextScalarShellElement )
		}

		refreshRailStickyAlign()
	} )

	return {
		railStickyStyle,
		refreshRailStickyAlign
	}
}
