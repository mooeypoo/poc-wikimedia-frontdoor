<script setup lang="ts">
import { CdxButton, CdxIcon, CdxMenuItem } from '@wikimedia/codex'
import { cdxIconPrevious } from '@wikimedia/codex-icons'
import type { MainNavigationLink } from '../../composables/useMainNavigationLinks'
import type { ResolvedSectionNavSection } from '../../composables/usePageSectionNav'
import type { ShellCollapsedNavMenuView } from '../../composables/useShellCollapsedNavMenu'

/**
 * Full-viewport collapsed navigation overlay — backdrop-light mask with a start-side panel.
 *
 * Default view mirrors `ShellSidePanelNav` (start-column section links) with the active
 * primary section as a quiet back control (`cdxIconPrevious`, `flip-for-rtl`). Section
 * headings that duplicate the back label are omitted via `omitSectionTitleMatching`.
 * The primary view lists main navigation entries and the API Explorer link.
 * Figma Off-wiki page templates node 25:1929.
 */
defineProps<{
	/** Accessible name for the dialog region. */
	overlayLabel: string
	/** Accessible label for the back control (section view). */
	backButtonLabel: string
	/** Active primary navigation label shown on the back control. */
	primaryNavigationLabel: string
	/** Accessible name for the primary navigation list. */
	primaryNavigationListLabel: string
	/** API Explorer link label. */
	apiExplorerLinkLabel: string
	/** Current overlay drill-down level. */
	menuView: ShellCollapsedNavMenuView
	/** Resolved primary navigation entries. */
	mainNavigationLinks: MainNavigationLink[]
	/** Main navigation id for the current route. */
	activeNavigationId: string
	/** Whether the current route is the API Explorer. */
	isExplorerRoute: boolean
	/** Accessible name for the section navigation list. */
	sectionNavigationLabel: string
	/** Resolved section navigation for the current route. */
	sectionNavigationSections: ResolvedSectionNavSection[]
}>()

const emit = defineEmits<{
	/** Emitted when the user dismisses the overlay (backdrop click). */
	close: []
	/** Emitted when the user steps back to the primary navigation list. */
	back: []
	/** Emitted when the user selects a primary navigation entry. */
	'primary-navigation-select': [ navigationId: string ]
	/** Emitted when the user selects the API Explorer link. */
	'api-explorer-select': []
}>()
</script>

<template>
	<Teleport to="body">
		<div
			class="shell-collapsed-nav-menu-overlay"
			@click.self="emit( 'close' )"
		>
			<div
				class="shell-collapsed-nav-menu-overlay__panel"
				role="dialog"
				aria-modal="true"
				:aria-label="overlayLabel"
			>
				<template v-if="menuView === 'section'">
					<CdxButton
						class="shell-collapsed-nav-menu-overlay__back-button"
						weight="quiet"
						size="small"
						:aria-label="backButtonLabel"
						@click="emit( 'back' )"
					>
						<CdxIcon
							:icon="cdxIconPrevious"
							:flip-for-rtl="true"
						/>
						{{ primaryNavigationLabel }}
					</CdxButton>
					<SharedShellSidePanelNav
						class="shell-collapsed-nav-menu-overlay__section-nav"
						:aria-label="sectionNavigationLabel"
						:sections="sectionNavigationSections"
						:omit-section-title-matching="primaryNavigationLabel"
					/>
				</template>
				<nav
					v-else
					class="shell-collapsed-nav-menu-overlay__primary-nav"
					:aria-label="primaryNavigationListLabel"
				>
					<CdxMenuItem
						v-for="navigationLink in mainNavigationLinks"
						:id="`shell-collapsed-nav-menu-primary-${ navigationLink.id }`"
						:key="navigationLink.id"
						class="shell-collapsed-nav-menu-overlay__primary-nav-item"
						:value="navigationLink.id"
						:label="navigationLink.label"
						:selected="navigationLink.id === activeNavigationId && !isExplorerRoute"
						@click.prevent="emit( 'primary-navigation-select', navigationLink.id )"
					/>
					<CdxMenuItem
						id="shell-collapsed-nav-menu-primary-api-explorer"
						class="shell-collapsed-nav-menu-overlay__primary-nav-item"
						value="api-explorer"
						:label="apiExplorerLinkLabel"
						:selected="isExplorerRoute"
						@click.prevent="emit( 'api-explorer-select' )"
					/>
				</nav>
			</div>
		</div>
	</Teleport>
</template>

<style scoped>
/*
 * Figma Off-wiki page templates 25:1929 — full-viewport backdrop-light overlay;
 * start-side panel with base background and subtle inline-end border.
 */
.shell-collapsed-nav-menu-overlay {
	position: fixed;
	inset: 0;
	z-index: 20;
	display: flex;
	justify-content: flex-start;
	background-color: var( --background-color-backdrop-light );
}

.shell-collapsed-nav-menu-overlay__panel {
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: var( --spacing-50 );
	inline-size: var( --fd-layout-start-panel-inline-size );
	max-inline-size: 100%;
	block-size: 100%;
	padding-block: var( --spacing-100 );
	/*
	 * Inline-start inset matches Figma spacing-200 (32px) at the viewport edge;
	 * inline-end matches the start-column panel (`--spacing-75`).
	 */
	padding-inline-start: var( --spacing-200 );
	padding-inline-end: var( --spacing-75 );
	overflow-block: auto;
	overscroll-behavior: contain;
	background-color: var( --background-color-base );
	border-inline-end: 1px solid var( --border-color-subtle );
}

.shell-collapsed-nav-menu-overlay__back-button {
	align-self: flex-start;
	max-inline-size: 100%;
}

.shell-collapsed-nav-menu-overlay__section-nav {
	flex: 1 1 auto;
	min-block-size: 0;
}

.shell-collapsed-nav-menu-overlay__primary-nav {
	display: flex;
	flex-direction: column;
	gap: 0;
	min-inline-size: 0;
	inline-size: 100%;
}

.shell-collapsed-nav-menu-overlay__primary-nav-item {
	inline-size: 100%;
}

.shell-collapsed-nav-menu-overlay__primary-nav :deep( .shell-collapsed-nav-menu-overlay__primary-nav-item.cdx-menu-item ),
.shell-collapsed-nav-menu-overlay__primary-nav :deep( .cdx-menu-item ) {
	inline-size: 100%;
	margin-inline-start: 0;
	padding-inline-start: var( --spacing-75 );
	padding-inline-end: var( --spacing-75 );
}

.shell-collapsed-nav-menu-overlay__primary-nav :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover ),
.shell-collapsed-nav-menu-overlay__primary-nav :deep( .cdx-menu-item--enabled:not( .cdx-menu-item--selected ):hover .cdx-menu-item__content ) {
	color: var( --color-progressive );
}

</style>
