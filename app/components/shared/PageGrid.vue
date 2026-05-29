<script setup lang="ts">
/**
 * PageGrid — 24-column page layout with reserved side-panel columns.
 *
 * Renders a responsive grid with 4 + 16 + 4 column areas for navigation
 * side panels and main page content. Below 1120px the areas stack vertically
 * with the main slot first.
 */
</script>

<template>
	<div class="fd-page-grid">
		<aside class="fd-page-grid__start">
			<slot name="start" />
		</aside>
		<div class="fd-page-grid__main">
			<slot />
		</div>
		<aside
			v-if="$slots.end"
			class="fd-page-grid__end"
		>
			<slot name="end" />
		</aside>
	</div>
</template>
