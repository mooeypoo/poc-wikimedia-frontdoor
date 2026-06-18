<script setup lang="ts">
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconMenu, cdxIconNext } from '@wikimedia/codex-icons'

/**
 * Collapsed shell navigation — hamburger control plus primary / section breadcrumbs.
 *
 * Shown when `useShellNavigationCollapse` collapses the quiet tabs and start-column
 * section menu. Menu activation is deferred to a follow-up task (Figma Off-wiki
 * page templates node 50:2731).
 */
defineProps<{
	/** Accessible name for the collapsed navigation region. */
	regionLabel: string
	/** Accessible label for the icon-only menu button. */
	menuButtonLabel: string
	/** Active primary navigation label (first breadcrumb). */
	primaryNavigationLabel: string
	/** Active start-column section label (second breadcrumb). */
	sectionNavigationLabel: string
	/** When false, only the primary breadcrumb is shown. */
	hasSectionNavigationBreadcrumb: boolean
}>()
</script>

<template>
	<nav
		class="shell-collapsed-navigation"
		:aria-label="regionLabel"
	>
		<!-- Menu panel interaction deferred — prototype control only. -->
		<CdxButton
			class="shell-collapsed-navigation__menu-button"
			weight="quiet"
			:aria-label="menuButtonLabel"
			@click.prevent
		>
			<CdxIcon :icon="cdxIconMenu" />
		</CdxButton>
		<div class="shell-collapsed-navigation__breadcrumbs">
			<span class="shell-collapsed-navigation__crumb">
				{{ primaryNavigationLabel }}
			</span>
			<template v-if="hasSectionNavigationBreadcrumb">
				<CdxIcon
					:icon="cdxIconNext"
					size="x-small"
					:flip-for-rtl="true"
					class="shell-collapsed-navigation__separator-icon"
					aria-hidden="true"
				/>
				<span class="shell-collapsed-navigation__crumb">
					{{ sectionNavigationLabel }}
				</span>
			</template>
		</div>
	</nav>
</template>

<style scoped>
/*
 * Figma Off-wiki page templates 50:2731 — icon-only quiet button + breadcrumbs
 * (spacing-25 between button and crumbs; spacing-50 between crumb segments).
 */
.shell-collapsed-navigation {
	display: flex;
	align-items: center;
	gap: var( --spacing-25 );
	min-inline-size: 0;
	/* Align block-end with quiet tab labels in the expanded row. */
	padding-block-end: calc( var( --spacing-25 ) + var( --spacing-75 ) );
}

.shell-collapsed-navigation__menu-button {
	flex: 0 0 auto;
}

.shell-collapsed-navigation__breadcrumbs {
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	gap: var( --spacing-50 );
	min-inline-size: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	color: var( --color-base );
}

.shell-collapsed-navigation__crumb {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.shell-collapsed-navigation__separator-icon {
	flex: 0 0 auto;
	color: var( --color-base );
}
</style>
