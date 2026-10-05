<script setup lang="ts">
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconMenu, cdxIconNext } from '@wikimedia/codex-icons'
import { useShellCollapsedNavigationBreadcrumbFit } from '../../composables/useShellCollapsedNavigationBreadcrumbFit'

/**
 * Collapsed shell navigation — hamburger control plus optional primary / section breadcrumbs.
 *
 * Shown when `useShellNavigationCollapse` collapses the quiet tabs and start-column
 * section menu. The menu button toggles `ShellCollapsedNavMenuOverlay` (Figma Off-wiki
 * page templates nodes 50:2731, 25:1929). Routes outside the primary information
 * architecture, including the landing page, show only the hamburger.
 */
const props = defineProps<{
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
	/** When true, the collapsed navigation overlay is open (menu button pressed state). */
	isMenuOpen: boolean
}>()

const navigationRootRef = useTemplateRef<HTMLElement>( 'navigationRootRef' )
const primaryBreadcrumbRef = useTemplateRef<HTMLElement>( 'primaryBreadcrumbRef' )
const sectionBreadcrumbGroupRef = useTemplateRef<HTMLElement>( 'sectionBreadcrumbGroupRef' )
const { shouldShowSectionBreadcrumb } = useShellCollapsedNavigationBreadcrumbFit( {
	navigationRootRef,
	primaryBreadcrumbRef,
	sectionBreadcrumbGroupRef,
	hasSectionBreadcrumb: toRef( props, 'hasSectionNavigationBreadcrumb' ),
	primaryBreadcrumbLabel: toRef( props, 'primaryNavigationLabel' ),
	sectionBreadcrumbLabel: toRef( props, 'sectionNavigationLabel' )
} )

const emit = defineEmits<{
	/** Emitted when the user activates the menu button. */
	'menu-toggle': []
}>()
</script>

<template>
	<nav
		ref="navigationRootRef"
		class="shell-collapsed-navigation"
		:aria-label="regionLabel"
	>
		<CdxButton
			class="shell-collapsed-navigation__menu-button"
			weight="quiet"
			:aria-label="menuButtonLabel"
			:aria-expanded="isMenuOpen"
			@click="emit( 'menu-toggle' )"
		>
			<CdxIcon :icon="cdxIconMenu" />
		</CdxButton>
		<div
			v-if="primaryNavigationLabel"
			class="shell-collapsed-navigation__breadcrumbs"
		>
			<span
				ref="primaryBreadcrumbRef"
				class="shell-collapsed-navigation__crumb shell-collapsed-navigation__crumb--primary"
			>
				{{ primaryNavigationLabel }}
			</span>
			<span
				v-if="hasSectionNavigationBreadcrumb"
				ref="sectionBreadcrumbGroupRef"
				class="shell-collapsed-navigation__section-group"
				:class="{
					'shell-collapsed-navigation__section-group--measure-only':
						!shouldShowSectionBreadcrumb
				}"
				:aria-hidden="!shouldShowSectionBreadcrumb"
			>
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
			</span>
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
	position: relative;
	display: flex;
	align-items: center;
	flex: 1 1 auto;
	flex-wrap: nowrap;
	gap: var( --spacing-50 );
	min-inline-size: 0;
	overflow: hidden;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	color: var( --color-base );
}

.shell-collapsed-navigation__crumb {
	min-inline-size: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.shell-collapsed-navigation__crumb--primary {
	flex: 1 1 auto;
}

.shell-collapsed-navigation__section-group {
	display: inline-flex;
	align-items: center;
	flex: 0 0 auto;
	gap: var( --spacing-50 );
	inline-size: max-content;
}

/*
 * Keep the complete section trail measurable after it leaves the visible row.
 * Fixed positioning removes it from both the breadcrumb flex layout and scroll
 * overflow; visibility also removes the duplicate text from accessibility.
 */
.shell-collapsed-navigation__section-group--measure-only {
	position: fixed;
	inset-block-start: 0;
	inset-inline-start: 0;
	visibility: hidden;
	pointer-events: none;
}

.shell-collapsed-navigation__separator-icon {
	flex: 0 0 auto;
	color: var( --color-base );
}
</style>
