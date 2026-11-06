<script setup lang="ts">
import { cdxIconCheck } from '@wikimedia/codex-icons'
import { CdxIcon } from '@wikimedia/codex'
import type { SearchPrototypeCategory } from '../../../config/searchPrototype'

/**
 * Fixed menu-header category chips for the global-search prototype (Figma).
 *
 * Exclusive selection (radiogroup). Visual language matches selected
 * progressive InfoChip + check vs subtle outline chips. Implemented as
 * buttons because Codex `CdxInfoChip` is non-interactive.
 *
 * @see DESIGN_REQUIREMENTS.md → Global search design prototype
 */

const props = defineProps<{
	selectedCategory: SearchPrototypeCategory
	allCount: number
	endpointCount: number
	documentationCount: number
}>()

const emit = defineEmits<{
	select: [ category: SearchPrototypeCategory ]
}>()

const { $bananaI18n } = useNuxtApp()

const groupLabel = computed( () => $bananaI18n( 'search-category-group-label' ) )

/**
 * Visible chip labels stay Figma-short; accessible names always include the
 * word “results” so VoiceOver announces category purpose consistently
 * (All already says “results”; endpoints / documentation need the SR form).
 */
const chips = computed( () => [
	{
		id: 'all' as const,
		label: $bananaI18n( 'search-category-all', { $1: String( props.allCount ) } ),
		accessibleLabel: $bananaI18n( 'search-category-all', { $1: String( props.allCount ) } )
	},
	{
		id: 'endpoints' as const,
		label: $bananaI18n( 'search-category-endpoints', { $1: String( props.endpointCount ) } ),
		accessibleLabel: $bananaI18n( 'search-category-endpoints-accessible', {
			$1: String( props.endpointCount )
		} )
	},
	{
		id: 'documentation' as const,
		label: $bananaI18n( 'search-category-documentation', {
			$1: String( props.documentationCount )
		} ),
		accessibleLabel: $bananaI18n( 'search-category-documentation-accessible', {
			$1: String( props.documentationCount )
		} )
	}
] )

/**
 * Activates a category chip.
 *
 * @param category - Chip id.
 */
function onSelect( category: SearchPrototypeCategory ): void {
	emit( 'select', category )
}
</script>

<template>
	<div
		class="global-search-category-chips"
		role="radiogroup"
		:aria-label="groupLabel"
	>
		<button
			v-for="chip in chips"
			:key="chip.id"
			type="button"
			class="global-search-category-chips__chip"
			:class="{
				'global-search-category-chips__chip--selected': selectedCategory === chip.id
			}"
			role="radio"
			:aria-checked="selectedCategory === chip.id"
			:aria-label="chip.accessibleLabel"
			@click="onSelect( chip.id )"
		>
			<CdxIcon
				v-if="selectedCategory === chip.id"
				class="global-search-category-chips__check"
				:icon="cdxIconCheck"
				size="x-small"
				aria-hidden="true"
			/>
			<span
				class="global-search-category-chips__label"
				aria-hidden="true"
			>{{ chip.label }}</span>
		</button>
	</div>
</template>

<style scoped>
.global-search-category-chips {
	display: flex;
	flex-wrap: wrap;
	gap: var( --spacing-50 );
	padding-block: var( --spacing-50 ) var( --spacing-25 );
	padding-inline: var( --spacing-75 );
}

.global-search-category-chips__chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: var( --spacing-25 );
	margin: 0;
	padding-block: var( --spacing-12 );
	padding-inline: 6px;
	border: 1px solid var( --border-color-base );
	border-radius: var( --border-radius-pill );
	background-color: var( --background-color-transparent );
	font-family: var( --font-family-system-sans );
	font-size: var( --font-size-small );
	line-height: var( --line-height-small );
	color: var( --color-base );
	cursor: pointer;
}

.global-search-category-chips__chip--selected {
	border-color: var( --border-color-progressive );
	background-color: var( --background-color-progressive-subtle );
}

.global-search-category-chips__chip:focus-visible {
	outline: var( --outline-color-progressive--focus ) solid var( --border-width-thick );
	outline-offset: 1px;
}

.global-search-category-chips__check {
	color: var( --color-progressive );
}

.global-search-category-chips__label {
	white-space: nowrap;
}
</style>
