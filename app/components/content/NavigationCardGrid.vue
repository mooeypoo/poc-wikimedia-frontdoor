<script setup lang="ts">
/**
 * Grid wrapper for {@link NavigationCard} rows on content pages.
 *
 * Renders slotted cards in **one**, **two**, or **three** equal columns
 * depending on the `columns` prop:
 *
 * - `columns="1"` — a single full-width column at every breakpoint
 *   (cards stack vertically).
 * - `columns="2"` (default) — two columns at tablet+ (Codex desktop+, and
 *   the landing “Join the community” band).
 * - `columns="3"` — three columns at desktop+, two at tablet.
 *
 * Stretches each row to the tallest card. Title/description stay
 * top-aligned; when cards include supporting-text, that link is
 * bottom-aligned within each card so links share a baseline across the
 * row. Vertical rhythm uses **`--spacing-100` (16px)** `margin-block` above
 * and below the grid; under `.fd-content-page`, adjoining `p` / `ul` / `ol`
 * margins are zeroed in `main.css` so that gap does not collapse. Use from
 * Markdown as `:::navigation-card-grid` wrapping `::navigation-card` blocks.
 *
 * @see ARCHITECTURE.md → Markdown content pages → Navigation card
 * @see DESIGN_REQUIREMENTS.md → Navigation card
 */
const props = withDefaults( defineProps<{
	/**
	 * Max columns at desktop+. Default `"2"` matches the standard content
	 * card grid; `"1"` stacks cards in a single column; `"3"` opts into the
	 * wider three-up row.
	 */
	columns?: '1' | '2' | '3' | 1 | 2 | 3 | string
}>(), {
	columns: '2'
} )

const isSingleColumnGrid = computed( () => {
	return props.columns === 1 || props.columns === '1'
} )

const isTwoColumnGrid = computed( () => {
	return props.columns === 2 || props.columns === '2'
} )

/*
 * Preserves prior behavior: any value that is not explicitly 1 or 2
 * falls through to the three-column layout.
 */
const isThreeColumnGrid = computed( () => {
	return !isSingleColumnGrid.value && !isTwoColumnGrid.value
} )
</script>

<template>
	<div
		class="navigation-card-grid"
		:class="{
			'navigation-card-grid--columns-1': isSingleColumnGrid,
			'navigation-card-grid--columns-2': isTwoColumnGrid,
			'navigation-card-grid--columns-3': isThreeColumnGrid
		}"
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

	/*
	 * Single-column option: stay one track wide at every breakpoint.
	 * Declared after the base tablet rule above (same specificity) so it
	 * wins; keeps the wider tablet+ gap so spacing matches other variants.
	 */
	.navigation-card-grid--columns-1 {
		grid-template-columns: minmax( 0, 1fr );
	}
}

/*
 * Breakpoint px literals match Codex tablet / desktop (same pattern as
 * page-grid.css — CSS variables are unreliable inside @media).
 */
@media ( min-width: 1120px ) {
	.navigation-card-grid--columns-3 {
		grid-template-columns: repeat( 3, minmax( 0, 1fr ) );
	}

	/*
	 * Only two cards slotted into an explicit 3-column grid: expand to a
	 * 2-up row that fills the width instead of leaving a dead third
	 * track. `:nth-child(2):last-child` matches a container whose second
	 * child is also its last — i.e. exactly two slotted elements.
	 */
	.navigation-card-grid--columns-3:has( > :nth-child( 2 ):last-child ) {
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
