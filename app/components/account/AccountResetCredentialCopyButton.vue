<script setup lang="ts">
import { CdxButton, CdxIcon, CdxTooltip } from '@wikimedia/codex'
import { cdxIconCopy } from '@wikimedia/codex-icons'
import { useCopyWithCopiedTooltip } from '../../composables/useCopyWithCopiedTooltip'

/**
 * Quiet copy control for a Reset-dialog credential value (Figma 633:7695).
 *
 * Presentational: copies via {@link useCopyWithCopiedTooltip} and shows “Copied!” with
 * `CdxTooltip` on focus. The button must stay mounted after click (no `:key` remount).
 */
const properties = defineProps<{
	/** Credential string to place on the clipboard (external). */
	textToCopy: string
	/** Accessible name for the quiet copy button. */
	copyAriaLabel: string
	/** Tooltip text shown after a successful copy (banana-i18n). */
	copiedTooltipLabel: string
}>()

/** Codex tooltip directive (`v-tooltip`). */
const vTooltip = CdxTooltip

const { copyAndShowCopiedTooltip } = useCopyWithCopiedTooltip()
const copyButtonElement = ref<InstanceType<typeof CdxButton> | null>( null )

/**
 * Returns the native button element for focus/blur (tooltip show/hide).
 *
 * Prefers Codex’s exposed `button` ref; falls back to `$el` when needed.
 *
 * @returns The host `HTMLElement`, or `null` if unavailable.
 */
function getCopyButtonRootElement(): HTMLElement | null {
	const componentInstance = copyButtonElement.value

	if ( !componentInstance ) {
		return null
	}

	const exposedButton = ( componentInstance as { button?: HTMLElement | { value?: HTMLElement } } ).button

	if ( exposedButton && 'value' in exposedButton && exposedButton.value instanceof HTMLElement ) {
		return exposedButton.value
	}

	if ( exposedButton instanceof HTMLElement ) {
		return exposedButton
	}

	const buttonRoot = componentInstance.$el

	return buttonRoot instanceof HTMLElement ? buttonRoot : null
}

/**
 * Handles quiet copy click: clipboard + brief “Copied!” tooltip.
 *
 * @param clickEvent - Native click from `CdxButton` (stop so dialog chrome does not handle it).
 * @returns Nothing.
 */
async function onCopy( clickEvent: Event ): Promise<void> {
	clickEvent.preventDefault()
	clickEvent.stopPropagation()
	await copyAndShowCopiedTooltip( properties.textToCopy, getCopyButtonRootElement() )
}
</script>

<template>
	<CdxButton
		ref="copyButtonElement"
		v-tooltip="copiedTooltipLabel"
		weight="quiet"
		type="button"
		:aria-label="copyAriaLabel"
		@click="onCopy"
	>
		<CdxIcon :icon="cdxIconCopy" />
	</CdxButton>
</template>
