<script setup lang="ts">
import { CdxField, CdxRadio } from '@wikimedia/codex'
import type { ColorMode } from '../../../config/colorMode'

/**
 * Shared color-theme radio field for the header preferences popover and dialog.
 *
 * Labels are resolved through banana-i18n by the parent. Selecting a radio updates
 * the parent's `useColorMode` bridge immediately; this component owns no theme logic.
 */
defineProps<{
	/** Translated `CdxField` legend. */
	fieldLabel: string
	/** Translated color-theme options in product order. */
	options: ReadonlyArray<{
		mode: ColorMode
		label: string
	}>
}>()

const selectedMode = defineModel<ColorMode>( 'selectedMode', {
	required: true
} )
</script>

<template>
	<CdxField
		class="shell-color-theme-preferences"
		is-fieldset
	>
		<template #label>
			{{ fieldLabel }}
		</template>
		<CdxRadio
			v-for="option in options"
			:key="option.mode"
			v-model="selectedMode"
			name="color-theme-preference"
			:input-value="option.mode"
		>
			{{ option.label }}
		</CdxRadio>
	</CdxField>
</template>

<style scoped>
.shell-color-theme-preferences {
	margin-block-start: 0;
	min-inline-size: 12rem;
}

.shell-color-theme-preferences :deep( .cdx-field__label ) {
	margin-block-end: var( --spacing-25 );
}
</style>
