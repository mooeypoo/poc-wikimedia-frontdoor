<script setup lang="ts">
import { CdxCombobox, CdxField } from '@wikimedia/codex'
import { useApiCatalogProjectFilter } from '../../composables/useApiCatalogProjectFilter'
import SectionHeading from './SectionHeading.vue'
import NavigationCard from './NavigationCard.vue'
import NavigationCardGrid from './NavigationCardGrid.vue'

/**
 * Filterable Wikimedia APIs catalog section for `/apis`.
 *
 * Renders the section heading (Recommended chip), a Codex project-filter
 * combobox ([Figma 1183:31958](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=1183-31958)),
 * optional intro slot, and a client-filtered {@link NavigationCard} grid.
 * The host Markdown page stays statically generated — filtering only toggles
 * visibility after hydration (interactive island; not a `<ClientOnly>` route).
 *
 * Card data and filter rules live in `config/apiCatalogWikimedia.ts`. Filter
 * chrome labels use banana-i18n. Section `title` / `chip` are **content**
 * strings (author via MDC props; BiDi via {@link SectionHeading}). Combobox
 * **`inline-size` / `min-inline-size`** use Codex **`--size-1600`** (256px) —
 * a design-token CSS value (not a `config/` constant); the control does not
 * shrink under flex.
 *
 * @see ARCHITECTURE.md → API catalog project filter
 * @see DESIGN_REQUIREMENTS.md → API catalog
 */
const props = withDefaults( defineProps<{
	/** Section title (content string — per-locale Markdown). */
	title?: string
	/** Optional InfoChip beside the title (content string). */
	chip?: string
}>(), {
	title: 'Wikimedia APIs',
	chip: 'Recommended'
} )

const {
	filterLabel,
	projectFilterMenuItems,
	projectFilterComboboxSelected,
	visibleCards,
	emptyFilterLabel
} = useApiCatalogProjectFilter()
</script>

<template>
	<section class="api-catalog-wikimedia-section">
		<div class="api-catalog-wikimedia-section__header">
			<SectionHeading
				class="api-catalog-wikimedia-section__heading"
				:title="props.title"
				:chip="props.chip"
				status="notice"
			/>
			<CdxField class="api-catalog-wikimedia-section__filter">
				<template #label>
					{{ filterLabel }}
				</template>
				<CdxCombobox
					v-model:selected="projectFilterComboboxSelected"
					class="api-catalog-wikimedia-section__combobox"
					:menu-items="projectFilterMenuItems"
				/>
			</CdxField>
		</div>

		<div
			v-if="$slots.default"
			class="api-catalog-wikimedia-section__intro"
		>
			<slot />
		</div>

		<NavigationCardGrid v-if="visibleCards.length > 0">
			<NavigationCard
				v-for="card in visibleCards"
				:key="card.id"
				:url="card.url"
				:title="card.title"
				:description="card.description"
				:supporting-text="card.supportingText"
				:chips="card.chips"
			/>
		</NavigationCardGrid>
		<p
			v-else
			class="api-catalog-wikimedia-section__empty"
		>
			{{ emptyFilterLabel }}
		</p>
	</section>
</template>

<style scoped>
/*
 * Header row: title + Recommended (start), Filter by project (end).
 * Both children are non-shrinking so `gap: --spacing-150` (24px) is preserved
 * while they share a row; when chip↔filter would go below 24px, the filter
 * wraps below the heading (flex-wrap).
 */
.api-catalog-wikimedia-section__header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	/* 24px minimum between heading chip and filter; also used as wrap threshold. */
	gap: var( --spacing-150 );
	/*
	 * Restore default content h2 block-start rhythm (`main.css` h2 uses
	 * `--spacing-150`). Applied on the header so the filter stays vertically
	 * centered with the heading when they share a row.
	 */
	margin-block-start: var( --spacing-150 );
}

.api-catalog-wikimedia-section__heading {
	/* Natural title+chip width; do not shrink (keeps the 24px wrap threshold). */
	flex: 0 0 auto;
	inline-size: auto;
	max-inline-size: 100%;
	margin-block: 0;
}

.api-catalog-wikimedia-section__filter {
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: var( --spacing-50 );
	flex: 0 0 auto;
	/* Codex Field adds margin-block-start; that shifts the filter below the h2. */
	margin-block: 0;
	max-inline-size: 100%;
}

/*
 * Codex Field stacks the label above the control by default. Figma places
 * “Filter by project” inline beside the combobox, vertically centered with it
 * and with the section h2.
 */
.api-catalog-wikimedia-section__filter :deep( .cdx-label ) {
	display: flex;
	align-items: center;
	margin-block: 0;
	/* Default label padding-block-end is for stacked fields — remove for inline. */
	padding-block-end: 0;
	flex: 0 0 auto;
}

.api-catalog-wikimedia-section__filter :deep( .cdx-label__label ) {
	display: flex;
	align-items: center;
	font-weight: var( --font-weight-bold );
	white-space: nowrap;
	line-height: var( --line-height-small );
}

.api-catalog-wikimedia-section__filter :deep( .cdx-field__control ) {
	display: flex;
	align-items: center;
	flex: 0 0 auto;
}

/*
 * Combobox width: Codex `--size-1600` (16rem / 256px). Use a definite
 * `inline-size` (not only min) — under flex, `min( …, 100% )` collapsed to the
 * content width when the parent had `min-inline-size: 0`. Do not shrink.
 */
.api-catalog-wikimedia-section__combobox {
	inline-size: var( --size-1600 );
	min-inline-size: var( --size-1600 );
	flex: 0 0 auto;
}

.api-catalog-wikimedia-section__combobox :deep( .cdx-combobox__input-wrapper ) {
	inline-size: 100%;
}

.api-catalog-wikimedia-section__combobox :deep( .cdx-text-input ) {
	flex: 1 1 auto;
	inline-size: 100%;
	min-inline-size: 0;
}

.api-catalog-wikimedia-section__combobox :deep( .cdx-text-input__input ) {
	min-inline-size: 0;
}

.api-catalog-wikimedia-section__intro {
	margin-block-start: var( --spacing-100 );
}

.api-catalog-wikimedia-section__intro :deep( > :first-child ) {
	margin-block-start: 0;
}

.api-catalog-wikimedia-section__intro :deep( > :last-child ) {
	margin-block-end: 0;
}

.api-catalog-wikimedia-section__empty {
	margin-block: var( --spacing-100 );
	color: var( --color-subtle );
}
</style>
