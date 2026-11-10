<script setup lang="ts">
import { cdxIconCheck } from '@wikimedia/codex-icons'
import { CdxIcon } from '@wikimedia/codex'
import type { SearchPrototypeCategory } from '../../../config/searchPrototype'
import {
	GLOBAL_SEARCH_CHIP_ORDER,
	resolveGlobalSearchChipArrowIndex
} from '../../utils/globalSearchAccessibility'

/**
 * Fixed menu-header category chips for the global-search prototype (Figma).
 *
 * Exclusive selection (radiogroup) with roving tabindex and arrow-key
 * selection. Visual language matches selected progressive InfoChip + check vs
 * subtle outline chips. Implemented as buttons because Codex `CdxInfoChip` is
 * non-interactive.
 *
 * Accessible names match the visible labels (honest naming — WCAG 2.2 AA).
 *
 * @see DESIGN_REQUIREMENTS.md → Global search design prototype
 */

const props = defineProps<{
	selectedCategory: SearchPrototypeCategory
	allCount: number
	endpointCount: number
	documentationCount: number
	/** Interface `dir` for horizontal arrow mirroring. */
	isRtl?: boolean
}>()

const emit = defineEmits<{
	select: [ category: SearchPrototypeCategory ]
	/** Esc from a chip — parent closes the panel and focuses the field. */
	escape: []
	/** Shift+Tab / printable char — parent focuses the search field. */
	'focus-input': []
	/** Printable character typed on a chip — parent focuses and inserts it. */
	'type-character': [ character: string ]
}>()

const { $bananaI18n } = useNuxtApp()

const groupLabel = computed( () => $bananaI18n( 'search-category-group-label' ) )

/**
 * Visible chip labels — also the accessible name (no separate aria-label).
 */
const chips = computed( () => [
	{
		id: 'all' as const,
		label: $bananaI18n( 'search-category-all', { $1: String( props.allCount ) } )
	},
	{
		id: 'endpoints' as const,
		label: $bananaI18n( 'search-category-endpoints', { $1: String( props.endpointCount ) } )
	},
	{
		id: 'documentation' as const,
		label: $bananaI18n( 'search-category-documentation', {
			$1: String( props.documentationCount )
		} )
	}
] )

const chipButtonRefs = ref<Array<HTMLButtonElement | null>>( [] )

/**
 * Activates a category chip (mouse or keyboard).
 *
 * @param category - Chip id.
 */
function onSelect( category: SearchPrototypeCategory ): void {
	emit( 'select', category )
}

/**
 * Focuses the chip button at `index` after selection so roving tabindex lands
 * on the checked control.
 *
 * @param index - Chip index in {@link GLOBAL_SEARCH_CHIP_ORDER}.
 */
function focusChipAt( index: number ): void {
	nextTick( () => {
		chipButtonRefs.value[ index ]?.focus()
	} )
}

/**
 * Handles radiogroup keyboard behaviour on a chip.
 *
 * @param event - Keyboard event from the focused chip.
 * @param chipId - Chip under focus.
 */
function handleChipKeydown(
	event: KeyboardEvent,
	chipId: SearchPrototypeCategory
): void {
	if ( event.key === 'Escape' ) {
		event.preventDefault()
		event.stopPropagation()
		emit( 'escape' )
		return
	}

	if ( event.key === 'Tab' && event.shiftKey ) {
		// Return to the field; keep the panel open (parent does not close).
		event.preventDefault()
		emit( 'focus-input' )
		return
	}

	if ( event.key === ' ' || event.key === 'Enter' ) {
		event.preventDefault()
		onSelect( chipId )
		return
	}

	const currentIndex = GLOBAL_SEARCH_CHIP_ORDER.indexOf( chipId )
	const nextIndex = resolveGlobalSearchChipArrowIndex(
		currentIndex,
		event.key,
		Boolean( props.isRtl )
	)
	if ( nextIndex !== null ) {
		event.preventDefault()
		const nextId = GLOBAL_SEARCH_CHIP_ORDER[ nextIndex ]
		onSelect( nextId )
		focusChipAt( nextIndex )
		return
	}

	// Printable character → move focus back to the input and type there.
	if ( event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey ) {
		event.preventDefault()
		emit( 'type-character', event.key )
	}
}

/**
 * Assigns a template ref slot for a chip button.
 *
 * @param element - Button element or null on unmount.
 * @param index - Chip index.
 */
function setChipButtonRef(
	element: Element | null,
	index: number
): void {
	chipButtonRefs.value[ index ] = element instanceof HTMLButtonElement ? element : null
}
</script>

<template>
	<div
		class="global-search-category-chips"
		role="radiogroup"
		:aria-label="groupLabel"
	>
		<button
			v-for="( chip, index ) in chips"
			:key="chip.id"
			:ref="( element ) => setChipButtonRef( element as Element | null, index )"
			type="button"
			class="global-search-category-chips__chip"
			:class="{
				'global-search-category-chips__chip--selected': selectedCategory === chip.id
			}"
			role="radio"
			:aria-checked="selectedCategory === chip.id"
			:tabindex="selectedCategory === chip.id ? 0 : -1"
			@click="onSelect( chip.id )"
			@keydown="handleChipKeydown( $event, chip.id )"
		>
			<CdxIcon
				v-if="selectedCategory === chip.id"
				class="global-search-category-chips__check"
				:icon="cdxIconCheck"
				size="x-small"
				aria-hidden="true"
			/>
			<span class="global-search-category-chips__label">{{ chip.label }}</span>
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
