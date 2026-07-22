<script setup lang="ts">
import { CdxMenuItem } from '@wikimedia/codex'
import type { ResolvedSectionNavItem, ResolvedSectionNavSection } from '../../composables/usePageSectionNav'

/**
 * ShellSidePanelNav — section navigation in the start column, directly below the
 * full-width header band (not beside the header).
 *
 * Section headings and page links share one flat list (no nested sub-menus).
 * Horizontal dividers (`--border-color-muted`) separate section groups. The start
 * column scrollport uses an inline-end border on `.frontdoor-shell__side-panel--start`
 * (see `default.vue`, `shell-start-nav-scroll.css`, DESIGN_REQUIREMENTS.md).
 * Scroll-end inset (32px, `--spacing-200`) is a `::after` spacer on the breakpoint
 * scrollport — not padding on this component.
 *
 * **Codex exceptions:**
 * - `CdxMenuItem` outside a floating `CdxMenu` — approved for this static shell list only
 *   (and for the collapsed overlay primary list in `ShellCollapsedNavMenuOverlay`).
 * - Non-selected items: custom `:hover` CSS sets `--color-progressive` text. Codex hover
 *   normally changes background only; `highlighted` is never toggled without a parent `CdxMenu`.
 *
 * **Routing:** Items with a resolved `to` path (content items from their config
 * `href`, explorer items from their `mode`) navigate via `navigateTo`. Only items
 * with no target fall back to a non-navigating `href="#"` placeholder.
 */
defineProps<{
	/** Accessible name for the navigation region. */
	ariaLabel: string
	/** Resolved sections with translated labels. */
	sections: ResolvedSectionNavSection[]
	/**
	 * When set, section headings equal to this label are omitted (e.g. collapsed
	 * nav overlay back control already shows the primary section name).
	 */
	omitSectionTitleMatching?: string
}>()

/**
 * Navigates to a resolved section item when it has a route target.
 *
 * @param pointerEvent - Click event from the menu item.
 * @param item - Resolved navigation item from `usePageSectionNav()`.
 */
function onSectionNavItemClick( pointerEvent: PointerEvent, item: ResolvedSectionNavItem ): void {
	if ( item.to === null ) {
		pointerEvent.preventDefault()
		return
	}

	pointerEvent.preventDefault()
	navigateTo( item.to )
}
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
			<p
				v-if="section.title !== omitSectionTitleMatching"
				class="shell-side-panel-nav__section-title"
			>
				{{ section.title }}
			</p>
			<CdxMenuItem
				v-for="item in section.items"
				:id="`shell-side-panel-nav-${ section.id }-${ item.id }`"
				:key="item.id"
				class="shell-side-panel-nav__menu-item"
				:value="item.id"
				:label="item.label"
				:url="item.to ?? '#'"
				:selected="item.isActive"
				@click="onSectionNavItemClick( $event, item )"
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
	border-block-start: 1px solid var( --border-color-muted );
	margin: var( --spacing-50 ) 0;
	inline-size: 100%;
}

/* Flat list: section headings and items share the same inline alignment. */
.shell-side-panel-nav :deep( .shell-side-panel-nav__menu-item.cdx-menu-item ),
.shell-side-panel-nav :deep( .cdx-menu-item ) {
	inline-size: 100%;
	margin-inline-start: 0;
	padding-inline-start: var( --spacing-75 );
	padding-inline-end: var( --spacing-75 );
}

/* CdxMenuItem outside CdxMenu: highlighted prop is never set — use :hover for progressive text.
 * Codex default hover only changes background, not unselected label colour. See ARCHITECTURE.md. */
.shell-side-panel-nav :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover ),
.shell-side-panel-nav :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .cdx-menu-item__content ) {
	color: var( --color-progressive );
}
</style>
