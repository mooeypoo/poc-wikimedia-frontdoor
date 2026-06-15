<script setup lang="ts">
import { CdxMenuItem } from '@wikimedia/codex'
import type { ResolvedSectionNavSection } from '../../composables/usePageSectionNav'

/**
 * ShellSidePanelNav — left-hand section navigation in the shell start column.
 *
 * Section headings and page links share one flat list (no nested sub-menus).
 * Horizontal dividers separate section groups; the start column has no edge border.
 *
 * **Codex exception:** uses `CdxMenuItem` outside a floating `CdxMenu` — approved
 * for this static shell list only (see DESIGN_REQUIREMENTS.md, ARCHITECTURE.md).
 *
 * **Prototype:** item links are `href="#"` placeholders; active state is supplied
 * by the parent via `usePageSectionNav()` — not by Vue Router.
 */
defineProps<{
	/** Accessible name for the navigation region. */
	ariaLabel: string
	/** Resolved sections with translated labels. */
	sections: ResolvedSectionNavSection[]
}>()
</script>

<template>
	<nav
		class="shell-side-panel-nav"
		:aria-label="ariaLabel"
	>
		<template
			v-for="( section, sectionIndex ) in sections"
			:key="section.id"
		>
			<p class="shell-side-panel-nav__section-title">
				{{ section.title }}
			</p>
			<CdxMenuItem
				v-for="item in section.items"
				:id="`shell-side-panel-nav-${ section.id }-${ item.id }`"
				:key="item.id"
				class="shell-side-panel-nav__menu-item"
				:value="item.id"
				:label="item.label"
				url="#"
				:selected="item.isActive"
				@click.prevent
			/>
			<hr
				v-if="sectionIndex < sections.length - 1"
				class="shell-side-panel-nav__divider"
			>
		</template>
	</nav>
</template>

<style scoped>
.shell-side-panel-nav {
	display: flex;
	flex-direction: column;
	gap: 0;
	min-inline-size: 0;
	inline-size: 100%;
	max-inline-size: 100%;
	overflow-wrap: anywhere;
}

.shell-side-panel-nav__section-title {
	margin: 0;
	padding: var( --spacing-50 ) var( --spacing-75 );
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-small );
	color: var( --color-base );
}

.shell-side-panel-nav__menu-item {
	inline-size: 100%;
}

.shell-side-panel-nav__divider {
	border: none;
	border-block-start: 1px solid var( --border-color-subtle );
	margin: var( --spacing-50 ) 0;
	inline-size: 100%;
}

/* Flat list: section headings and items share the same inline alignment. */
.shell-side-panel-nav__menu-item:deep( .cdx-menu-item ) {
	inline-size: 100%;
	margin-inline-start: 0;
	padding-inline-start: var( --spacing-75 );
	padding-inline-end: var( --spacing-75 );
}
</style>
