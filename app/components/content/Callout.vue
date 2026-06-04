<script setup lang="ts">
import { CdxMessage } from '@wikimedia/codex'

withDefaults( defineProps<{
	type?: 'notice' | 'warning' | 'error' | 'success'
}>(), {
	type: 'notice'
} )
</script>

<template>
	<CdxMessage :type="type" class="callout">
		<strong v-if="$slots.title" class="callout__title"><slot name="title" /></strong>
		<slot />
	</CdxMessage>
</template>

<style scoped>
.callout {
	margin-block: var( --spacing-100 );
}

.callout__title {
	display: block;
	margin-block-end: var( --spacing-25 );
}
</style>
