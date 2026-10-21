import type { ComputedRef, Ref } from 'vue'
import { EXPLORER_PROJECT_SETTINGS_HEADER_TITLE_BUTTON_MIN_GAP_PX } from '../../config/explorerSurfaces'

/** Readable element ref (plain or computed) for compact-fit measurement. */
type ElementRef = Ref<HTMLElement | null> | ComputedRef<HTMLElement | null>

/**
 * Collapses the project-settings **Adjust selection** control to a medium
 * progressive quiet icon-only button when the collapsed Accordion header cannot
 * keep the configured minimum gap between a single-line title and the labeled
 * button.
 *
 * Measures intrinsic widths from visually hidden nowrap replicas (title text +
 * labeled Adjust), not the live flex title — a live `scrollWidth` after icon-only
 * expands the title box equals the box width when the text fits, so the labeled
 * control would never return. The required gap is **16px** (`--spacing-100`).
 * Only applies while settings are collapsed (Adjust is hidden when expanded).
 * Resize observation and label watchers cover viewport and locale changes.
 * Scheduled animation frames and observers are cleaned up on unmount.
 *
 * @param headerRef - Collapsed Accordion header / summary track element.
 * @param titleMeasureRef - Hidden nowrap title measure host.
 * @param adjustMeasureRef - Hidden labeled Adjust button measure host.
 * @param isExpanded - Whether project settings are expanded.
 * @param titleLabel - Reactive collapsed-title fingerprint (locale-aware).
 * @param adjustLabel - Reactive Adjust label (locale-aware).
 * @returns Whether Adjust should render as icon-only.
 */
export function useExplorerProjectSettingsAdjustCompact(
	headerRef: ElementRef,
	titleMeasureRef: ElementRef,
	adjustMeasureRef: ElementRef,
	isExpanded: Ref<boolean>,
	titleLabel: Ref<string>,
	adjustLabel: Ref<string>
): {
	isAdjustIconOnly: Ref<boolean>
} {
	const isAdjustIconOnly = ref( false )

	let resizeObserver: ResizeObserver | null = null
	let scheduledAnimationFrame: number | null = null

	/**
	 * Cancels a pending measurement frame when one is scheduled.
	 *
	 * @returns Nothing.
	 */
	function clearScheduledMeasurement(): void {
		if ( scheduledAnimationFrame === null || typeof window === 'undefined' ) {
			return
		}

		window.cancelAnimationFrame( scheduledAnimationFrame )
		scheduledAnimationFrame = null
	}

	/**
	 * Measures whether the labeled Adjust button still fits beside a single-line title.
	 *
	 * @returns Nothing.
	 */
	function updateAdjustCompactState(): void {
		if ( isExpanded.value ) {
			isAdjustIconOnly.value = false
			return
		}

		const headerElement = headerRef.value
		const titleMeasureElement = titleMeasureRef.value
		const adjustMeasureElement = adjustMeasureRef.value
		const adjustButtonElement = adjustMeasureElement?.querySelector<HTMLElement>(
			'.cdx-button'
		) ?? null

		if (
			headerElement === null
			|| titleMeasureElement === null
			|| adjustButtonElement === null
		) {
			return
		}

		const headerInlineSize = headerElement.getBoundingClientRect().width
		const titleSingleLineInlineSize = titleMeasureElement.getBoundingClientRect().width
		const labeledAdjustInlineSize = adjustButtonElement.getBoundingClientRect().width

		/*
		 * Skip until the hidden replicas have laid out — a 0-width measure would
		 * force icon-only and could stick if later frames are skipped.
		 */
		if ( titleSingleLineInlineSize <= 0 || labeledAdjustInlineSize <= 0 ) {
			return
		}

		const requiredInlineSize = titleSingleLineInlineSize
			+ EXPLORER_PROJECT_SETTINGS_HEADER_TITLE_BUTTON_MIN_GAP_PX
			+ labeledAdjustInlineSize

		isAdjustIconOnly.value = requiredInlineSize > headerInlineSize
	}

	/**
	 * Schedules a measurement on the next animation frame.
	 *
	 * @returns Nothing.
	 */
	function scheduleAdjustCompactMeasurement(): void {
		if ( typeof window === 'undefined' ) {
			return
		}

		clearScheduledMeasurement()
		scheduledAnimationFrame = window.requestAnimationFrame( () => {
			scheduledAnimationFrame = null
			updateAdjustCompactState()
		} )
	}

	/**
	 * (Re)attaches resize observation. The Accordion summary ref can resolve
	 * after mount when host markup lands, so observation must follow `headerRef`.
	 *
	 * @returns Nothing.
	 */
	function observeCompactSources(): void {
		if ( typeof ResizeObserver === 'undefined' ) {
			scheduleAdjustCompactMeasurement()
			return
		}

		if ( resizeObserver === null ) {
			resizeObserver = new ResizeObserver( () => {
				scheduleAdjustCompactMeasurement()
			} )
		} else {
			resizeObserver.disconnect()
		}

		const headerElement = headerRef.value
		if ( headerElement !== null ) {
			resizeObserver.observe( headerElement )
		}

		const titleMeasureElement = titleMeasureRef.value
		if ( titleMeasureElement !== null ) {
			resizeObserver.observe( titleMeasureElement )
		}

		const adjustMeasureElement = adjustMeasureRef.value
		if ( adjustMeasureElement !== null ) {
			resizeObserver.observe( adjustMeasureElement )
		}

		scheduleAdjustCompactMeasurement()
	}

	watch(
		[ isExpanded, titleLabel, adjustLabel, headerRef ],
		() => {
			observeCompactSources()
		}
	)

	onMounted( () => {
		observeCompactSources()
	} )

	onBeforeUnmount( () => {
		resizeObserver?.disconnect()
		resizeObserver = null
		clearScheduledMeasurement()
	} )

	return {
		isAdjustIconOnly
	}
}
