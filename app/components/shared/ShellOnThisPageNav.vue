<script setup lang="ts">
import type { OnThisPageHeading } from '../../utils/collectOnThisPageHeadings'

/**
 * End-column “On this page” TOC for documentation pages (Figma EndNavPanel 354:32476).
 *
 * Presentational: heading tree and active id come from {@link useOnThisPageNav}.
 * Section titles are content strings (`<bdi>`); the landmark label / heading use
 * banana-i18n. Active item uses `--color-progressive` (scrollspy).
 *
 * Mount inside `.frontdoor-shell__on-this-page-end` (CSS sticky at the end-column
 * top — not explorer `useEndPanelNavAlign`).
 *
 * @see ARCHITECTURE.md → On-this-page navigation
 * @see DESIGN_REQUIREMENTS.md → On-this-page navigation
 */
defineProps<{
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
				<a
					:href="`#${ section.id }`"
					class="shell-on-this-page-nav__link"
					:class="{
						'shell-on-this-page-nav__link--active': activeHeadingId === section.id
					}"
					@click="onHeadingClick( $event, section.id )"
				>
					<bdi>{{ section.label }}</bdi>
				</a>
				<ul
					v-if="section.children.length > 0"
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

.shell-on-this-page-nav__link {
	display: block;
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
</style>
