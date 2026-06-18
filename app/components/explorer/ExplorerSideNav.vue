<script setup lang="ts">
import { EXPLORER_SIDE_NAV_SECTIONS } from '../../../config/explorerSideNav'
import { pathForExplorerMode } from '../../utils/explorerRoute'
import type { ExplorerMode } from '../../composables/useEnterpriseExplorer'

/**
 * ExplorerSideNav — left-hand section navigation for the API Explorer page.
 *
 * @deprecated Superseded by `ShellSidePanelNav` + `usePageSectionNav()` in
 * `app/layouts/default.vue`. Retained for enterprise mode link patterns; the
 * layout no longer mounts this component.
 *
 * Renders section links from config; items with enabled=false are hidden.
 * Items with a mode field render as NuxtLinks pointing at the URL that
 * encodes that mode (community → /explorer, enterprise modes → sub-routes,
 * see {@link pathForExplorerMode}). Items without a mode are inert
 * placeholders for now.
 */
defineProps<{
	activeMode: ExplorerMode
}>()

const { $bananaI18n } = useNuxtApp()

const navigationLabel = computed( () => $bananaI18n( 'explorer-side-nav-label' ) )

const navigationSections = computed( () => {
	return EXPLORER_SIDE_NAV_SECTIONS.map( ( section ) => ( {
		id: section.id,
		title: $bananaI18n( section.titleMessageKey ),
		items: section.items
			.filter( ( item ) => item.enabled !== false )
			.map( ( item ) => {
				const mode = item.mode as ExplorerMode | undefined
				return {
					id: item.id,
					label: $bananaI18n( item.messageKey ),
					mode,
					to: mode !== undefined ? pathForExplorerMode( mode ) : null
				}
			} )
	} ) )
} )
</script>

<template>
	<nav
		class="explorer-side-nav"
		:aria-label="navigationLabel"
	>
		<section
			v-for="section in navigationSections"
			:key="section.id"
			class="explorer-side-nav__section"
		>
			<h2 class="explorer-side-nav__section-title">
				{{ section.title }}
			</h2>
			<ul class="explorer-side-nav__list">
				<li
					v-for="item in section.items"
					:key="item.id"
					class="explorer-side-nav__item"
				>
					<NuxtLink
						v-if="item.to !== null"
						:to="item.to"
						class="explorer-side-nav__link"
						:class="{ 'explorer-side-nav__link--active': item.mode === activeMode }"
						:aria-current="item.mode === activeMode ? 'page' : undefined"
					>
						{{ item.label }}
					</NuxtLink>
					<a
						v-else
						href="#"
						class="explorer-side-nav__link"
						@click.prevent
					>
						{{ item.label }}
					</a>
				</li>
			</ul>
		</section>
	</nav>
</template>

<style scoped>
.explorer-side-nav {
	display: grid;
	gap: var( --spacing-150 );
	/* Match .frontdoor-shell__main-nav padding-block so the first row aligns with site nav links. */
	padding-block-start: var( --spacing-100 );
	padding-block-end: var( --spacing-100 );
	min-inline-size: 0;
	font-family: var( --font-family-sans-stack );
}

.explorer-side-nav__section {
	display: grid;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.explorer-side-nav__section-title {
	margin: 0;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-small );
	color: var( --color-emphasized );
}

.explorer-side-nav__list {
	margin: 0;
	padding: 0;
	list-style: none;
	display: grid;
	gap: var( --spacing-25 );
}

.explorer-side-nav__item {
	margin: 0;
	min-inline-size: 0;
}

.explorer-side-nav__link {
	display: inline-block;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-small );
	color: var( --color-base );
	text-decoration: none;
}

.explorer-side-nav__link:hover {
	text-decoration: underline;
}

.explorer-side-nav__link--active {
	color: var( --color-emphasized );
}
</style>
