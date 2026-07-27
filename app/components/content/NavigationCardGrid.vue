<script setup lang="ts">
/**
 * Grid wrapper for {@link NavigationCard} rows on content pages.
 *
 * Renders slotted cards in up to **three** equal columns (Codex desktop+),
 * stretching each row to the tallest card. Title/description stay top-aligned;
 * when cards include supporting-text, that link is bottom-aligned within each
 * card so links share a baseline across the row. Use from Markdown as
 * `:::navigation-card-grid` wrapping `::navigation-card` blocks.
 *
 * @see ARCHITECTURE.md → Markdown content pages → Navigation card
 * @see DESIGN_REQUIREMENTS.md → Navigation card
 */
</script>

<template>
	<div class="navigation-card-grid">
		<slot />
	</div>
</template>

<style scoped>
.navigation-card-grid {
	display: grid;
	grid-template-columns: 1fr;
	/* Match shell column gutter rhythm (24px at tablet+). */
	gap: var( --spacing-100 );
	align-items: stretch;
	/* 16px between section intro copy and the card row. */
	margin-block-start: var( --spacing-100 );
	margin-block-end: var( --spacing-100 );
	inline-size: 100%;
}

/*
 * MDC often wraps slotted blocks in an extra element. Flatten non-card
 * wrappers so `.navigation-card` nodes become the grid items (equal row height).
 */
.navigation-card-grid > :deep( *:not( .navigation-card ) ) {
	display: contents;
}

@media ( min-width: 640px ) {
	.navigation-card-grid {
		grid-template-columns: repeat( 2, minmax( 0, 1fr ) );
		gap: var( --spacing-150 );
	}
}

/*
 * Breakpoint px literals match Codex tablet / desktop (same pattern as
 * page-grid.css — CSS variables are unreliable inside @media).
 */
@media ( min-width: 1120px ) {
	.navigation-card-grid {
		grid-template-columns: repeat( 3, minmax( 0, 1fr ) );
	}
}

.navigation-card-grid :deep( .navigation-card ) {
	/* Fill the grid cell so row height matches the tallest card. */
	block-size: 100%;
	margin-block-end: 0;
	align-self: stretch;
}
</style>
