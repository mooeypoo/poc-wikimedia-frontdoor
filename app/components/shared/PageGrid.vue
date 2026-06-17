<script setup lang="ts">
/**
 * PageGrid — Codex-aligned responsive shell layout (see DESIGN_REQUIREMENTS.md).
 *
 * Desktop (≥ 1120px): fixed 281px start panel + main + end (16:4 main:end ratio).
 * Tablet (≥ 640px): fixed 281px start + fluid main. Mobile: stacked interim layout.
 * Full side-panel responsive behaviour (collapse into header) is deferred.
 *
 * Header chrome grid placement (`display: contents`, 1440px width lock) was
 * superseded by a full-viewport header band in `app/layouts/default.vue`.
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
