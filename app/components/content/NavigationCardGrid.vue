<script setup lang="ts">
/**
 * Grid wrapper for {@link NavigationCard} rows on content pages.
 *
 * Renders slotted cards in up to **three** equal columns when
 * `columns="3"` is set, or **two** by default (Codex desktop+, and the
 * landing “Join the community” band). Stretches each row to the tallest
 * card. Title/description stay top-aligned; when cards include
 * supporting-text, that link is bottom-aligned within each card so
 * links share a baseline across the row. Vertical rhythm uses
 * **`--spacing-100` (16px)** `margin-block` above and below the grid; under
 * `.fd-content-page`, adjoining `p` / `ul` / `ol` margins are zeroed in
 * `main.css` so that gap does not collapse. Use from Markdown as
 * `:::navigation-card-grid` wrapping `::navigation-card` blocks.
 *
 * @see ARCHITECTURE.md → Markdown content pages → Navigation card
 * @see DESIGN_REQUIREMENTS.md → Navigation card
 */
const props = withDefaults( defineProps<{
	/**
	 * Max columns at desktop+. Default `"2"` matches the standard content
	 * card grid; `"3"` opts back into the wider three-up row.
	 */
	columns?: '2' | '3' | 2 | 3 | string
}>(), {
	columns: '2'
} )

const isTwoColumnGrid = computed( () => {
	return props.columns === 2 || props.columns === '2'
} )
</script>

<template>
	<div
		class="navigation-card-grid"
		:class="{ 'navigation-card-grid--columns-2': isTwoColumnGrid }"
	>
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
	/*
	 * 16px above and below the card row vs adjacent prose
	 * (`--spacing-100`). Adjacent list/paragraph margins are zeroed under
	 * `.fd-content-page` in `main.css` so this gap does not collapse away.
	 */
	margin-block: var( --spacing-100 );
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
	.navigation-card-grid:not( .navigation-card-grid--columns-2 ) {
		grid-template-columns: repeat( 3, minmax( 0, 1fr ) );
	}

	/*
	 * Only two cards slotted into an explicit 3-column grid: expand to a
	 * 2-up row that fills the width instead of leaving a dead third
	 * track. `:nth-child(2):last-child` matches a container whose second
	 * child is also its last — i.e. exactly two slotted elements.
	 */
	.navigation-card-grid:not( .navigation-card-grid--columns-2 ):has( > :nth-child( 2 ):last-child ) {
		grid-template-columns: repeat( 2, minmax( 0, 1fr ) );
	}
}

.navigation-card-grid :deep( .navigation-card ) {
	/* Fill the grid cell so row height matches the tallest card. */
	block-size: 100%;
	margin-block-end: 0;
	align-self: stretch;
}
</style>
