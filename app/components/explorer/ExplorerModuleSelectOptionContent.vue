<script setup lang="ts">
import { CdxInfoChip } from '@wikimedia/codex'
import { EXPLORER_MODULE_SELECT_DESCRIPTION_MAX_LINES } from '../../../config/explorerModuleDescriptions'
import type { ExplorerModuleSelectOptionDisplay } from '../../composables/useExplorerModuleSelect'

/**
 * Custom API-to-explore Combobox option content with audience warning chips.
 *
 * **Codex exception #14:** Replaces default Codex MenuItem text layout so beta and
 * internal markers can sit beside the module name as warning `CdxInfoChip`s, with
 * version in parentheses. Chips are **label-only** — Codex forces status icons on
 * `warning` and ignores a null `icon` prop, so icons are hidden in CSS (same
 * pattern as NavigationCard catalog chips). Used from `ExplorerProjectControls`
 * via the `CdxCombobox` `#menu-item` slot. Descriptions clamp to
 * {@link EXPLORER_MODULE_SELECT_DESCRIPTION_MAX_LINES} wrapped lines.
 */
defineProps<{
	menuItem: ExplorerModuleSelectOptionDisplay
	betaChipLabel: string
	internalChipLabel: string
}>()

const descriptionMaxLines = EXPLORER_MODULE_SELECT_DESCRIPTION_MAX_LINES
</script>

<template>
	<span
		class="cdx-menu-item__content explorer-module-select-option explorer-module-select-option--menu"
		:style="{
			'--fd-explorer-module-select-description-max-lines': descriptionMaxLines
		}"
	>
		<span class="cdx-menu-item__text">
			<span class="explorer-module-select-option__title">
				<span class="cdx-menu-item__text__label">
					<bdi>{{ menuItem.label }}</bdi><template v-if="menuItem.versionParenthetical"> (<bdi>{{ menuItem.versionParenthetical }}</bdi>)</template>
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
			</span>
			<span
				v-if="menuItem.description"
				class="cdx-menu-item__text__description explorer-module-select-option__description"
			>
				<bdi>{{ menuItem.description }}</bdi>
			</span>
		</span>
	</span>
</template>

<!--
	Unscoped: CdxCombobox menus teleport to <body>, so scoped parent styles would not apply.
-->
<style>
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

/*
 * Cap OpenAPI menu descriptions at the configured line count (default 5) so long
 * specs stay in a readable band; shorter copy still shows fully.
 */
.explorer-module-select-option__description {
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: var( --fd-explorer-module-select-description-max-lines, 5 );
}
</style>
