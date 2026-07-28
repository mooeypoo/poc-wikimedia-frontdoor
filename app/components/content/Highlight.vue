<script setup lang="ts">
/**
 * Progressive-subtle highlight panel for Markdown CTAs / featured blurbs (not status callouts).
 *
 * Applies the shared `.fd-highlight` surface (progressive-subtle background,
 * no border, exploratory **4px** radius, **12px** / `--spacing-75` padding,
 * `--spacing-100` block margin). Use from MDC as `::highlight` … `::`.
 * The CSS class may also be applied directly in Vue templates for non-Markdown
 * surfaces (e.g. API catalog). Slot content is page copy — not banana-i18n.
 *
 * Prefer `Callout` / `CdxMessage` for notice, warning, error, or success.
 *
 * @see ARCHITECTURE.md → Markdown content pages → Highlight
 * @see DESIGN_REQUIREMENTS.md → Highlight
 */
</script>

<template>
	<div class="fd-highlight">
		<slot />
	</div>
</template>
