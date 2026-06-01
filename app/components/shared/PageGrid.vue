<script setup lang="ts">
/**
 * PageGrid — Codex-aligned responsive shell layout (see DESIGN_REQUIREMENTS.md).
 *
 * Desktop (≥ 1120px): 24-column 4 + 16 + 4 with both side panels reserved on every route.
 * Below desktop: interim layout; full side-panel responsive behaviour is deferred.
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
		<aside class="fd-page-grid__end">
			<slot name="end" />
		</aside>
	</div>
</template>
