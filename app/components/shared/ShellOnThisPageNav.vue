<script setup lang="ts">
import { ref, watch } from 'vue'
import type { OnThisPageHeading } from '../../utils/collectOnThisPageHeadings'

/**
 * End-column “On this page” TOC for documentation pages (Figma EndNavPanel 354:32476).
 *
 * Presentational: heading tree and active id come from {@link useOnThisPageNav}.
 * `h2` sections are always listed; their `h3` children are collapsed under a
 * disclosure toggle. Accordion behavior: at most one section is expanded. The
 * section containing the active (scrollspy) heading opens automatically and
 * closes any other; opening a section manually also closes the others.
 * Section titles are content strings (`<bdi>`); the landmark label / heading use
 * banana-i18n. Active item uses `--color-progressive` (scrollspy).
 *
 * Mount inside `.frontdoor-shell__on-this-page-end` (CSS sticky at the end-column
 * top — not explorer `useEndPanelNavAlign`).
 *
 * @see ARCHITECTURE.md → On-this-page navigation
 * @see DESIGN_REQUIREMENTS.md → On-this-page navigation
 */
const props = defineProps<{
	/** Accessible name for the navigation landmark. */
	ariaLabel: string
	/** Visible “On this page” heading (banana-i18n). */
	headingLabel: string
	/** `h2` sections with optional nested `h3` children. */
	sections: OnThisPageHeading[]
	/** Heading id currently in view (scrollspy). */
	activeHeadingId: string | null
}>()

const emit = defineEmits<{
	/** User activated a TOC link. */
	'heading-select': [ headingId: string ]
}>()

/** Id of the single `h2` section whose `h3` list is expanded, if any. */
const expandedId = ref<string | null>( null )

/**
 * Keeps only the section that contains the active heading expanded.
 * When the active heading belongs to a section with no `h3` children,
 * everything collapses. A manual toggle lasts until the active heading
 * moves to a different heading.
 */
watch(
	() => props.activeHeadingId,
	( activeId ) => {
		if ( activeId === null ) {
			return
		}
		const owner = props.sections.find(
			( section ) => section.id === activeId ||
				section.children.some( ( child ) => child.id === activeId )
		)
		expandedId.value = owner && owner.children.length > 0 ? owner.id : null
	},
	{ immediate: true }
)

/**
 * Whether a section's `h3` list is expanded.
 *
 * @param sectionId - `h2` heading id.
 * @returns True when expanded.
 */
function isExpanded( sectionId: string ): boolean {
	return expandedId.value === sectionId
}

/**
 * Toggles a section's `h3` list, collapsing any other open section.
 *
 * @param sectionId - `h2` heading id.
 * @returns Nothing.
 */
function toggleSection( sectionId: string ): void {
	expandedId.value = expandedId.value === sectionId ? null : sectionId
}

/**
 * Handles in-page TOC link activation without a full navigation.
 *
 * @param pointerEvent - Click event from the anchor.
 * @param headingId - Target heading id.
 * @returns Nothing.
 */
function onHeadingClick( pointerEvent: MouseEvent, headingId: string ): void {
	pointerEvent.preventDefault()
	emit( 'heading-select', headingId )
}
</script>

<template>
	<nav
		class="shell-on-this-page-nav"
		:aria-label="ariaLabel"
	>
		<p class="shell-on-this-page-nav__heading">
			{{ headingLabel }}
		</p>
		<ul class="shell-on-this-page-nav__list">
			<li
				v-for="section in sections"
				:key="section.id"
				class="shell-on-this-page-nav__item"
			>
				<div class="shell-on-this-page-nav__row">
					<a
						:id="`on-this-page-link-${ section.id }`"
						:href="`#${ section.id }`"
						class="shell-on-this-page-nav__link"
						:class="{
							'shell-on-this-page-nav__link--active': activeHeadingId === section.id
						}"
						@click="onHeadingClick( $event, section.id )"
					>
						<bdi>{{ section.label }}</bdi>
					</a>
					<!--
						Named by the section link (aria-labelledby) so no extra i18n
						string is needed; state is conveyed by aria-expanded.
					-->
					<button
						v-if="section.children.length > 0"
						type="button"
						class="shell-on-this-page-nav__toggle"
						:aria-expanded="isExpanded( section.id )"
						:aria-controls="`on-this-page-sublist-${ section.id }`"
						:aria-labelledby="`on-this-page-link-${ section.id }`"
						@click="toggleSection( section.id )"
					>
						<span
							class="shell-on-this-page-nav__chevron"
							:class="{
								'shell-on-this-page-nav__chevron--expanded': isExpanded( section.id )
							}"
							aria-hidden="true"
						></span>
					</button>
				</div>
				<ul
					v-if="section.children.length > 0"
					v-show="isExpanded( section.id )"
					:id="`on-this-page-sublist-${ section.id }`"
					class="shell-on-this-page-nav__list shell-on-this-page-nav__list--nested"
				>
					<li
						v-for="child in section.children"
						:key="child.id"
						class="shell-on-this-page-nav__item"
					>
						<a
							:href="`#${ child.id }`"
							class="shell-on-this-page-nav__link"
							:class="{
								'shell-on-this-page-nav__link--active': activeHeadingId === child.id
							}"
							@click="onHeadingClick( $event, child.id )"
						>
							<bdi>{{ child.label }}</bdi>
						</a>
					</li>
				</ul>
			</li>
		</ul>
	</nav>
</template>

<style scoped>
/*
 * Figma EndNavPanel 354:32476 — quiet section list: bold subtle heading,
 * regular subtle links, progressive active (scrollspy).
 * Exception: `--font-size-small` (not medium) for compact end-column TOC.
 */
.shell-on-this-page-nav {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-75 );
	box-sizing: border-box;
	inline-size: 100%;
	max-inline-size: 100%;
	min-inline-size: 0;
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-50 );
	background-color: var( --background-color-base );
	font-size: var( --font-size-small );
}

.shell-on-this-page-nav__heading {
	margin: 0;
	padding-block: var( --spacing-50 );
	padding-inline: var( --spacing-75 );
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-small );
	color: var( --color-subtle );
}

.shell-on-this-page-nav__list {
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 0;
	list-style: none;
}

.shell-on-this-page-nav__list--nested {
	padding-inline-start: var( --spacing-75 );
}

.shell-on-this-page-nav__item {
	min-inline-size: 0;
}

.shell-on-this-page-nav__row {
	display: flex;
	align-items: flex-start;
}

.shell-on-this-page-nav__link {
	display: block;
	flex: 1 1 auto;
	min-inline-size: 0;
	padding-block: var( --spacing-50 );
	padding-inline: var( --spacing-75 );
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-small );
	color: var( --color-subtle );
	text-decoration: none;
	overflow-wrap: anywhere;
}

.shell-on-this-page-nav__link:hover {
	color: var( --color-progressive );
}

.shell-on-this-page-nav__link--active {
	color: var( --color-progressive );
}

.shell-on-this-page-nav__toggle {
	display: flex;
	flex: 0 0 auto;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	/* Match the link's row height so the chevron centers on the first line. */
	block-size: calc( var( --line-height-small ) + 2 * var( --spacing-50 ) );
	inline-size: var( --spacing-150, 24px );
	margin: 0;
	padding: 0;
	border: 0;
	background: transparent;
	color: var( --color-subtle );
	cursor: pointer;
}

.shell-on-this-page-nav__toggle:hover {
	color: var( --color-progressive );
}

/* CSS-drawn chevron; points down when collapsed, up when expanded. */
.shell-on-this-page-nav__chevron {
	display: block;
	inline-size: 6px;
	block-size: 6px;
	border-block-end: 1.5px solid currentcolor;
	border-inline-end: 1.5px solid currentcolor;
	transform: translateY( -2px ) rotate( 45deg );
	transition: transform 100ms ease;
}

.shell-on-this-page-nav__chevron--expanded {
	transform: translateY( 2px ) rotate( -135deg );
}

@media ( prefers-reduced-motion: reduce ) {
	.shell-on-this-page-nav__chevron {
		transition: none;
	}
}
</style>
