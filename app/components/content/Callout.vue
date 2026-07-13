<script setup lang="ts">
import { CdxMessage } from '@wikimedia/codex'

withDefaults( defineProps<{
	type?: 'notice' | 'warning' | 'error' | 'success'
}>(), {
	type: 'notice'
} )
</script>

<template>
	<!--
		Title slot content is already a Markdown paragraph (<p>…) from MDC — do not wrap
		it in another <p> or <strong>. Bold the first paragraph via CSS instead.
	-->
	<CdxMessage
		:type="type"
		class="callout"
		:class="{ 'callout--titled': Boolean( $slots.title ) }"
	>
		<slot name="title" />
		<slot />
	</CdxMessage>
</template>

<style scoped>
.callout {
	margin-block: var( --spacing-100 );
}

/*
 * CdxMessage vertically centers .cdx-message__content for single-line messages.
 * With a title + body, top-align content so the icon lines up with the title row.
 */
.callout :deep( .cdx-message__content ) {
	align-self: flex-start;
}

/* Codex multiline pattern: bold label in the first paragraph (see Message docs). */
.callout--titled :deep( .cdx-message__content > p:first-child ) {
	font-weight: bold;
}
</style>
