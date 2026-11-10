<script setup lang="ts">
import { CdxButton, CdxDialog, CdxIcon } from '@wikimedia/codex'
import { cdxIconArrowPrevious } from '@wikimedia/codex-icons'

/**
 * Full-viewport collapsed header search — Codex `CdxDialog` (requirements §5.1.7.3).
 *
 * Quiet **Back** (`cdxIconArrowPrevious`, BiDi-aware) abandons the view; the
 * clearable composed `ShellHeaderGlobalSearch` (`variant="overlay"`) fills the
 * remaining viewport (chips + Menu; no 7-row visible limit). Autofocus starts
 * the content-index build via the field’s `focusin`. Close on Back, Escape,
 * result selection, or the utility row expanding again.
 *
 * Global CSS in `shell-codex-overrides.css` restyles the teleported dialog to a
 * viewport-filling surface (Minerva-inspired compact search).
 *
 * @see DESIGN_REQUIREMENTS.md → Collapsed search overlay
 * @see ARCHITECTURE.md → Codex exceptions (shell chrome) #7 / #15
 */
defineProps<{
	/** Accessible name for the dialog (`CdxDialog` title / aria). */
	overlayLabel: string
	/** Accessible label for the Back control. */
	backButtonLabel: string
}>()

const emit = defineEmits<{
	/** Emitted when the user dismisses the dialog (Back, Escape, or Dialog close). */
	close: []
	/** Emitted when the user activates a search result. */
	'result-select': []
}>()

const searchQuery = defineModel<string>( 'searchQuery', { required: true } )
const dialogBodyRef = useTemplateRef<HTMLElement>( 'dialogBodyRef' )

/**
 * Focuses the dialog search field after layout so the keyboard and index build start.
 *
 * CdxDialog’s focus trap may initially land on Back; move focus to the input once
 * the body is painted (double rAF matches the language Lookup popover wait).
 */
async function focusSearchField(): Promise<void> {
	await nextTick()
	await new Promise<void>( ( resolve ) => {
		requestAnimationFrame( () => {
			requestAnimationFrame( () => {
				resolve()
			} )
		} )
	} )
	dialogBodyRef.value?.querySelector<HTMLInputElement>(
		'.shell-header-global-search__input input'
	)?.focus()
}

/**
 * Forwards Dialog `update:open` — closing emits `close` to the parent overlay host.
 *
 * @param isOpen - Next open state from `CdxDialog`.
 */
function handleDialogOpenUpdate( isOpen: boolean ): void {
	if ( !isOpen ) {
		emit( 'close' )
	}
}

onMounted( () => {
	void focusSearchField()
} )
</script>

<template>
	<CdxDialog
		:open="true"
		class="shell-header-search-overlay-dialog"
		:title="overlayLabel"
		:hide-title="true"
		:use-close-button="false"
		@update:open="handleDialogOpenUpdate"
	>
		<div
			ref="dialogBodyRef"
			class="shell-header-search-overlay-dialog__selector"
		>
			<SharedShellHeaderGlobalSearch
				v-model:search-query="searchQuery"
				class="shell-header-search-overlay-dialog__search"
				variant="overlay"
				@result-select="emit( 'result-select' )"
				@close="emit( 'close' )"
			>
				<template #leading>
					<CdxButton
						class="shell-header-search-overlay-dialog__back"
						weight="quiet"
						:aria-label="backButtonLabel"
						@click="emit( 'close' )"
					>
						<!-- Codex mirrors ArrowPrevious for RTL. -->
						<CdxIcon :icon="cdxIconArrowPrevious" />
					</CdxButton>
				</template>
			</SharedShellHeaderGlobalSearch>
		</div>
	</CdxDialog>
</template>

<style scoped>
/*
 * Dialog body chrome lives in `shell-codex-overrides.css` (teleported root).
 * Scoped rules only style content we own inside the dialog body slot.
 */
.shell-header-search-overlay-dialog__selector {
	display: flex;
	flex-direction: column;
	block-size: 100%;
	min-block-size: 0;
	background-color: var( --background-color-base );
}

.shell-header-search-overlay-dialog__search {
	flex: 1 1 auto;
	min-inline-size: 0;
	min-block-size: 0;
}

.shell-header-search-overlay-dialog__back {
	flex: 0 0 auto;
}
</style>
