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
	/** Credential value to copy (external). */
	value: string
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
 * Returns the button root element for focus/blur (tooltip show/hide).
 *
 * @returns The host `HTMLElement`, or `null` if unavailable.
 */
function getCopyButtonRootElement(): HTMLElement | null {
	const buttonRoot = copyButtonElement.value?.$el as HTMLElement | undefined

	return buttonRoot ?? null
}

/**
 * Handles quiet copy click: clipboard + brief “Copied!” tooltip.
 *
 * @returns Nothing.
 */
async function onCopy(): Promise<void> {
	await copyAndShowCopiedTooltip( properties.value, getCopyButtonRootElement() )
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
