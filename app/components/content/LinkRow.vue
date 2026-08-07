<script setup lang="ts">
/**
 * Horizontal row of prose links for Markdown (link-only destinations).
 *
 * Use instead of `:::navigation-card-grid` when a section only needs one or more
 * text links — not full destination cards. This is **not** a second card
 * component; it is a layout wrapper around normal Markdown → `ProseA` links.
 * Slot each link in its own paragraph so flex items receive
 * **`--spacing-150` (24px)** column gap. Under `.fd-content-page`, adjoining
 * `p` / `ul` / `ol` margins are zeroed in `main.css` so this component’s
 * `--spacing-100` block margin is the vertical rhythm (same pattern as
 * `NavigationCardGrid`). Link labels are page content (not banana-i18n);
 * direction inherits from the shell; external icons come from `ProseA`.
 *
 * MDC: `:::link-row` … `:::`.
 *
 * @see ARCHITECTURE.md → Markdown content pages → Link row
 * @see AGENTS.md → Navigation card authoring playbook → Link-only rows
 * @see DESIGN_REQUIREMENTS.md → Link row
 */
</script>

<template>
	<div class="link-row">
		<slot />
	</div>
</template>

<style scoped>
.link-row {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	column-gap: var( --spacing-150 );
	row-gap: var( --spacing-50 );
	margin-block: var( --spacing-100 );
}

.link-row :deep( p ) {
	margin: 0;
}
</style>
