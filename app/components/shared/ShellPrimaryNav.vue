<script setup lang="ts">
import { CdxTab, CdxTabs } from '@wikimedia/codex'
import type { MainNavigationLink } from '../../composables/useMainNavigationLinks'

/**
 * ShellPrimaryNav — primary site navigation as Codex quiet tabs.
 *
 * Navigation-only usage: tab panels are hidden; route changes are handled by
 * the parent when `navigation-select` fires. Matches Figma Header/MainNav.
 *
 * **Re-selecting the active tab:** Codex `CdxTabs` does not emit `update:active`
 * when the clicked tab is already active, so a capture-phase click on the
 * selected tab re-emits `navigation-select` — the parent can then navigate to
 * that section’s overview (e.g. `/get-started` from `/get-started/…`, `/apis`
 * from `/apis/…` or `/explorer`). Mount-time `v-model` sync is ignored until
 * after the first tick so explorer does not bounce to the catalog on load.
 *
 * **Layout:** Tab labels use an extra `--spacing-75` (12px) block-end padding
 * beyond Codex defaults for alignment with the header bottom border. The quiet-tabs
 * header border is suppressed — `.frontdoor-shell__chrome` owns the single edge.
 *
 * **Typography:** All tab labels use **normal** weight — Codex defaults every
 * quiet-tab label to bold (`shell-primary-nav-overrides.css`); selection uses
 * colour and underline only.
 *
 * **Responsive:** Codex tab scroll buttons are suppressed in
 * `shell-primary-nav-overrides.css` (they flicker on load; header chrome
 * responsiveness will use a separate approach).
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
	/** Emitted when the user selects a primary nav tab (including re-select). */
	'navigation-select': [ navigationId: string ]
}>()

const rootElement = useTemplateRef<HTMLElement>( 'rootElement' )
const isTabSyncReady = ref( false )

onMounted( () => {
	void nextTick( () => {
		isTabSyncReady.value = true
	} )
} )

const activeTabName = computed( {
	get: () => props.activeNavigationId,
	set: ( navigationId: string ) => {
		// Ignore mount-time / no-op sync to the already-active tab. Re-selecting
		// the active tab for “go to section overview” is handled in
		// `onTabListClick` (Codex does not emit `update:active` for that click).
		if ( !isTabSyncReady.value || navigationId === props.activeNavigationId ) {
			return
		}

		emit( 'navigation-select', navigationId )
	}
} )

/**
 * Re-emits selection when the user clicks the already-active tab.
 *
 * Codex `select(name)` is a no-op for `update:active` when `name` is already
 * active, so overview navigation would never fire without this path.
 *
 * @param pointerEvent - Click inside the primary nav.
 */
function onTabListClick( pointerEvent: MouseEvent ): void {
	if ( !isTabSyncReady.value || !rootElement.value ) {
		return
	}

	const eventTarget = pointerEvent.target
	if ( !( eventTarget instanceof Element ) ) {
		return
	}

	const tabButton = eventTarget.closest( 'button[role="tab"]' )
	if ( !( tabButton instanceof HTMLButtonElement ) || !rootElement.value.contains( tabButton ) ) {
		return
	}

	const tabButtons = Array.from(
		rootElement.value.querySelectorAll<HTMLButtonElement>( 'button[role="tab"]' )
	)
	const tabIndex = tabButtons.indexOf( tabButton )
	const navigationLink = props.navigationLinks[ tabIndex ]

	if ( !navigationLink || navigationLink.id !== props.activeNavigationId ) {
		return
	}

	emit( 'navigation-select', navigationLink.id )
}
</script>

<template>
	<nav
		ref="rootElement"
		class="shell-primary-nav"
		:aria-label="ariaLabel"
		@click="onTabListClick"
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
	inline-size: auto;
	max-inline-size: 100%;
	min-inline-size: 0;
}

.shell-primary-nav__tabs {
	inline-size: auto;
	max-inline-size: 100%;
}

/* Navigation-only: page content lives in the main column, not tab panels. */
.shell-primary-nav__tabs:deep( .cdx-tabs__content ) {
	display: none;
}

/*
 * Quiet-tabs header border suppression lives in shell-primary-nav-overrides.css
 * (imported from main.css after `codex.style-bidi.css`).
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
