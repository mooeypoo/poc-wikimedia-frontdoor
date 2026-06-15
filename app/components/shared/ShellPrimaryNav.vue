<script setup lang="ts">
import { CdxTab, CdxTabs } from '@wikimedia/codex'
import type { MainNavigationLink } from '../../composables/useMainNavigationLinks'

/**
 * ShellPrimaryNav — primary site navigation as Codex quiet tabs.
 *
 * Navigation-only usage: tab panels are hidden; route changes are handled by
 * the parent when `navigation-select` fires. Matches Figma Header/MainNav.
 *
 * **Layout:** Tab labels use an extra `--spacing-75` (12px) block-end padding
 * beyond Codex defaults for alignment with the header bottom border. The quiet-tabs
 * header border is suppressed — `.frontdoor-shell__chrome` owns the single edge.
 *
 * **Responsive:** Header chrome collapse is deferred; tab list scrolls horizontally
 * when labels overflow (built-in Codex Tabs behaviour).
 */
const props = defineProps<{
	/** Accessible name for the tab list. */
	ariaLabel: string
	/** Resolved primary navigation entries. */
	navigationLinks: MainNavigationLink[]
	/** Main navigation id for the current route (`CdxTab` `name`). */
	activeNavigationId: string
}>()

const emit = defineEmits<{
	/** Emitted when the user selects a different primary nav tab. */
	'navigation-select': [ navigationId: string ]
}>()

const activeTabName = computed( {
	get: () => props.activeNavigationId,
	set: ( navigationId: string ) => {
		emit( 'navigation-select', navigationId )
	}
} )
</script>

<template>
	<nav
		class="shell-primary-nav"
		:aria-label="ariaLabel"
	>
		<CdxTabs
			v-model:active="activeTabName"
			:framed="false"
			class="shell-primary-nav__tabs"
		>
			<CdxTab
				v-for="navigationLink in navigationLinks"
				:key="navigationLink.id"
				:name="navigationLink.id"
				:label="navigationLink.label"
			/>
		</CdxTabs>
	</nav>
</template>

<style scoped>
.shell-primary-nav {
	inline-size: 100%;
	min-inline-size: 0;
}

.shell-primary-nav__tabs {
	inline-size: 100%;
}

/* Navigation-only: page content lives in the main column, not tab panels. */
.shell-primary-nav__tabs:deep( .cdx-tabs__content ) {
	display: none;
}

/*
 * Quiet-tabs header border suppression lives in shell-primary-nav-overrides.css
 * (imported from main.css and after codex.style-rtl.css in codex-rtl-styles.client.ts).
 */

/*
 * Figma quiet tab row: 4px block-start, 12px block-end (extra vs Codex default 4px),
 * 12px inline padding on labels.
 */
.shell-primary-nav__tabs:deep( .cdx-tabs__list__item ) {
	padding-block-start: var( --spacing-25 );
	padding-block-end: calc( var( --spacing-25 ) + var( --spacing-75 ) );
	padding-inline: var( --spacing-75 );
	max-inline-size: 16rem;
}
</style>
