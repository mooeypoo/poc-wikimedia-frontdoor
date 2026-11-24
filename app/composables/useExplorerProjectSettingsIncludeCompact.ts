import type { Ref } from 'vue'
import {
	EXPLORER_MODULE_COMBOBOX_MIN_INLINE_SIZE_PX,
	EXPLORER_PROJECT_SETTINGS_HEADER_TITLE_BUTTON_MIN_GAP_PX
} from '../../config/explorerSurfaces'

/**
 * Collapses the project-settings **Include** MenuButton to icon-only when the
 * API fieldset row cannot keep the configured minimum gap between the Combobox
 * minimum and the labeled Include trigger.
 *
 * Measures intrinsic widths from a visually hidden nowrap labeled Include
 * replica (not the live flex trigger). The required gap is **16px**
 * (`--spacing-100` / `EXPLORER_PROJECT_SETTINGS_HEADER_TITLE_BUTTON_MIN_GAP_PX`)
 * — same compact floor as collapsed **Adjust selection**. Combobox floor is
 * **`EXPLORER_MODULE_COMBOBOX_MIN_INLINE_SIZE_PX`** (256 — Codex `--size-1600`);
 * do not parse that token from computed style (`parseFloat('16rem')` → `16`).
 * Only applies while project settings are expanded. Resize observation and
 * label watchers cover viewport and locale changes. Scheduled animation frames
 * and observers are cleaned up on unmount.
 *
 * @param apiSettingsRef - API Combobox + Include row element.
 * @param includeMeasureRef - Hidden labeled Include measure host.
 * @param isExpanded - Whether project settings are expanded.
 * @param includeLabel - Reactive Include label (locale-aware).
 * @returns Whether Include should render as icon-only.
 */
export function useExplorerProjectSettingsIncludeCompact(
	apiSettingsRef: Ref<HTMLElement | null>,
	includeMeasureRef: Ref<HTMLElement | null>,
	isExpanded: Ref<boolean>,
	includeLabel: Ref<string>
): {
	isIncludeIconOnly: Ref<boolean>
} {
	const isIncludeIconOnly = ref( false )

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
	 * Measures whether the labeled Include trigger still fits beside the Combobox.
	 *
	 * @returns Nothing.
	 */
	function updateIncludeCompactState(): void {
		if ( !isExpanded.value ) {
			isIncludeIconOnly.value = false
			return
		}

		const apiSettingsElement = apiSettingsRef.value
		const includeMeasureElement = includeMeasureRef.value
		const includeButtonElement = includeMeasureElement?.querySelector<HTMLElement>(
			'.cdx-button'
		) ?? null

		if (
			apiSettingsElement === null
			|| includeButtonElement === null
		) {
			return
		}

		/*
		 * Prefer `clientWidth` of the constrained row (not scroll/content width)
		 * so an already-overflowing layout still reports available space.
		 */
		const rowInlineSize = apiSettingsElement.clientWidth
		const labeledIncludeInlineSize = includeButtonElement.getBoundingClientRect().width

		/*
		 * Skip until the hidden replica has laid out — a 0-width measure would
		 * force icon-only and could stick if later frames are skipped.
		 */
		if ( labeledIncludeInlineSize <= 0 || rowInlineSize <= 0 ) {
			return
		}

		const requiredInlineSize = EXPLORER_MODULE_COMBOBOX_MIN_INLINE_SIZE_PX
			+ EXPLORER_PROJECT_SETTINGS_HEADER_TITLE_BUTTON_MIN_GAP_PX
			+ labeledIncludeInlineSize

		isIncludeIconOnly.value = requiredInlineSize > rowInlineSize
	}

	/**
	 * Schedules a measurement on the next animation frame.
	 *
	 * @returns Nothing.
	 */
	function scheduleIncludeCompactMeasurement(): void {
		if ( typeof window === 'undefined' ) {
			return
		}

		clearScheduledMeasurement()
		scheduledAnimationFrame = window.requestAnimationFrame( () => {
			scheduledAnimationFrame = null
			updateIncludeCompactState()
		} )
	}

	/**
	 * (Re)attaches resize observation to the API row and Include measure host.
	 * The API row unmounts while settings are collapsed, so observation must
	 * resume when the Accordion expands again.
	 *
	 * @returns Nothing.
	 */
	function observeCompactSources(): void {
		if ( typeof ResizeObserver === 'undefined' ) {
			scheduleIncludeCompactMeasurement()
			return
		}

		if ( resizeObserver === null ) {
			resizeObserver = new ResizeObserver( () => {
				scheduleIncludeCompactMeasurement()
			} )
		} else {
			resizeObserver.disconnect()
		}

		const apiSettingsElement = apiSettingsRef.value
		if ( apiSettingsElement !== null ) {
			resizeObserver.observe( apiSettingsElement )
		}

		const includeMeasureElement = includeMeasureRef.value
		if ( includeMeasureElement !== null ) {
			resizeObserver.observe( includeMeasureElement )
		}

		scheduleIncludeCompactMeasurement()
	}

	watch(
		[ isExpanded, includeLabel, apiSettingsRef ],
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
		isIncludeIconOnly
	}
}
