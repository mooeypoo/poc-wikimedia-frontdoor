<script setup lang="ts">
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconClose } from '@wikimedia/codex-icons'

/**
 * Full-viewport collapsed header search overlay — backdrop-light mask with a
 * block-start-anchored panel hosting the global-search prototype control.
 *
 * Design prototype (`config/searchPrototype.ts`): category chips and scroll
 * disclosure live in `ShellHeaderGlobalSearch` (`variant="overlay"`). Autofocus
 * starts the content-index build via the field’s `focusin` (no expanded-field
 * focus path exists while the utility row is collapsed).
 */
defineProps<{
	/** Accessible name for the dialog region. */
	overlayLabel: string
	/** Accessible label for the close button. */
	closeButtonLabel: string
}>()

const emit = defineEmits<{
	/** Emitted when the user dismisses the overlay (backdrop click or close button). */
	close: []
	/** Emitted when the user activates a search result. */
	'result-select': []
}>()

const searchQuery = defineModel<string>( 'searchQuery', { required: true } )
const panelRef = useTemplateRef<HTMLElement>( 'panelRef' )

/**
 * Focuses the overlay search field so the keyboard and index build start immediately.
 */
async function focusSearchField(): Promise<void> {
	await nextTick()
	panelRef.value?.querySelector<HTMLInputElement>(
		'.shell-header-global-search__input input'
	)?.focus()
}

onMounted( () => {
	void focusSearchField()
} )
</script>

<template>
	<Teleport to="body">
		<div
			class="shell-header-search-overlay"
			@click.self="emit( 'close' )"
		>
			<div
				ref="panelRef"
				class="shell-header-search-overlay__panel"
				role="dialog"
				aria-modal="true"
				:aria-label="overlayLabel"
			>
				<div class="shell-header-search-overlay__header">
					<SharedShellHeaderGlobalSearch
						v-model:search-query="searchQuery"
						class="shell-header-search-overlay__search"
						variant="overlay"
						@result-select="emit( 'result-select' )"
						@close="emit( 'close' )"
					/>
					<CdxButton
						class="shell-header-search-overlay__close-button"
						weight="quiet"
						:aria-label="closeButtonLabel"
						@click="emit( 'close' )"
					>
						<CdxIcon :icon="cdxIconClose" />
					</CdxButton>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style scoped>
.shell-header-search-overlay {
	position: fixed;
	inset: 0;
	z-index: 20;
	display: flex;
	align-items: flex-start;
	background-color: var( --background-color-backdrop-light );
}

.shell-header-search-overlay__panel {
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	inline-size: 100%;
	max-block-size: 100%;
	min-block-size: 0;
	overflow-block: auto;
	overscroll-behavior: contain;
	/* Match #73 compact-search margins: 16px block-start / 24px inline. */
	padding-block-start: var( --spacing-100 );
	padding-block-end: var( --spacing-100 );
	padding-inline: var( --spacing-150 );
	background-color: var( --background-color-base );
}

.shell-header-search-overlay__header {
	display: flex;
	align-items: flex-start;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.shell-header-search-overlay__search {
	flex: 1 1 auto;
	min-inline-size: 0;
}

/*
 * Codex SearchInput defaults to a 256px min — too wide between 24px mobile
 * margins. Overlay must let the field shrink with the viewport.
 */
.shell-header-search-overlay__search:deep( .cdx-text-input ) {
	inline-size: 100%;
	min-inline-size: 0;
}

.shell-header-search-overlay__close-button {
	flex: 0 0 auto;
	margin-block-start: var( --spacing-25 );
}
</style>
