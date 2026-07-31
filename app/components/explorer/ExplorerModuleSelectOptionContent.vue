<script setup lang="ts">
import { CdxInfoChip } from '@wikimedia/codex'
import type { ExplorerModuleSelectOptionDisplay } from '../../composables/useExplorerModuleSelect'

/**
 * Custom API-to-explore Select option / handle content with audience warning chips.
 *
 * **Codex exception #14:** Replaces default Codex MenuItem text layout so beta and
 * internal markers can sit beside the module name as warning `CdxInfoChip`s while
 * version remains subtle supporting text. Chips are **label-only** — Codex forces
 * status icons on `warning` and ignores a null `icon` prop, so icons are hidden in
 * CSS (same pattern as NavigationCard catalog chips). Used from
 * `ExplorerProjectControls` via `CdxSelect` `#menu-item` and `#label` slots.
 */
defineProps<{
	menuItem: ExplorerModuleSelectOptionDisplay
	betaChipLabel: string
	internalChipLabel: string
	/** `menu` recreates MenuItem content; `label` is the closed Select handle. */
	variant: 'menu' | 'label'
}>()
</script>

<template>
	<span
		v-if="variant === 'label'"
		class="explorer-module-select-option explorer-module-select-option--label"
	>
		<bdi>{{ menuItem.label }}</bdi>
		<CdxInfoChip
			v-if="menuItem.showBetaChip"
			class="explorer-module-select-option__audience-chip"
			status="warning"
		>
			{{ betaChipLabel }}
		</CdxInfoChip>
		<CdxInfoChip
			v-if="menuItem.showInternalChip"
			class="explorer-module-select-option__audience-chip"
			status="warning"
		>
			{{ internalChipLabel }}
		</CdxInfoChip>
	</span>
	<span
		v-else
		class="cdx-menu-item__content explorer-module-select-option explorer-module-select-option--menu"
	>
		<span class="cdx-menu-item__text">
			<span class="explorer-module-select-option__title">
				<span class="cdx-menu-item__text__label">
					<bdi>{{ menuItem.label }}</bdi>
				</span>
				<CdxInfoChip
					v-if="menuItem.showBetaChip"
					class="explorer-module-select-option__audience-chip"
					status="warning"
				>
					{{ betaChipLabel }}
				</CdxInfoChip>
				<CdxInfoChip
					v-if="menuItem.showInternalChip"
					class="explorer-module-select-option__audience-chip"
					status="warning"
				>
					{{ internalChipLabel }}
				</CdxInfoChip>
				<span
					v-if="menuItem.supportingText"
					class="cdx-menu-item__text__supporting-text"
				>
					<bdi>{{ menuItem.supportingText }}</bdi>
				</span>
			</span>
			<span
				v-if="menuItem.description"
				class="cdx-menu-item__text__description"
			>
				<bdi>{{ menuItem.description }}</bdi>
			</span>
		</span>
	</span>
</template>

<!--
	Unscoped: CdxSelect menus teleport to <body>, so scoped parent styles would not apply.
-->
<style>
.explorer-module-select-option--label,
.explorer-module-select-option__title {
	display: inline-flex;
	flex-wrap: wrap;
	align-items: center;
	column-gap: var( --spacing-50 );
	row-gap: var( --spacing-25 );
	min-inline-size: 0;
}

.explorer-module-select-option__audience-chip {
	flex-shrink: 0;
}

/*
 * Codex forces status icons on warning InfoChips and ignores a null `icon` prop.
 * Audience chips are label-only (beta / internal text).
 */
.explorer-module-select-option__audience-chip .cdx-info-chip__icon--vue {
	display: none;
}

.explorer-module-select-option--menu .cdx-menu-item__text__description {
	display: block;
}
</style>
