<script setup lang="ts">
/**
 * PageGrid — Codex-aligned responsive shell layout (see DESIGN_REQUIREMENTS.md).
 *
 * Desktop (≥ 1120px): fixed 281px start panel + body band (main:end 16:4 inside
 * `default.vue`). Tablet (≥ 640px): fixed 281px start + fluid body. Mobile: stacked.
 * Site footer (`ShellSiteFooter`) lives inside `frontdoor-shell__content` in
 * `default.vue` so its width matches the main content column.
 * Scroll: start column scrolls independently; main + end share one body scrollport
 * with the scrollbar at the inline-end edge — see DESIGN_REQUIREMENTS.md.
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
		<div class="fd-page-grid__body">
			<slot />
		</div>
	</div>
</template>
