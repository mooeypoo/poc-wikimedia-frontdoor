<script setup lang="ts">
import type { ResolvedSectionNavSection } from '../../composables/usePageSectionNav'

/**
 * PageSectionNav — left-hand section navigation for shell content and explorer routes.
 *
 * Renders grouped section headings and placeholder links from config; routes are
 * not wired yet (prototype).
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
		class="page-section-nav"
		:aria-label="ariaLabel"
	>
		<section
			v-for="section in sections"
			:key="section.id"
			class="page-section-nav__section"
		>
			<h2 class="page-section-nav__section-title">
				{{ section.title }}
			</h2>
			<ul class="page-section-nav__list">
				<li
					v-for="item in section.items"
					:key="item.id"
					class="page-section-nav__item"
				>
					<a
						href="#"
						class="page-section-nav__link"
						:class="{ 'page-section-nav__link--active': item.isActive }"
						:aria-current="item.isActive ? 'page' : undefined"
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
.page-section-nav {
	display: grid;
	gap: var( --spacing-150 );
	/* Match .frontdoor-shell__main-nav padding-block so the first row aligns with site nav links. */
	padding-block-start: var( --spacing-100 );
	padding-block-end: var( --spacing-100 );
	min-inline-size: 0;
	font-family: var( --font-family-sans-stack );
}

.page-section-nav__section {
	display: grid;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.page-section-nav__section-title {
	margin: 0;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-small );
	color: var( --color-emphasized );
}

.page-section-nav__list {
	margin: 0;
	padding: 0;
	list-style: none;
	display: grid;
	gap: var( --spacing-25 );
}

.page-section-nav__item {
	margin: 0;
	min-inline-size: 0;
}

.page-section-nav__link {
	display: inline-block;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-small );
	color: var( --color-base );
	text-decoration: none;
}

.page-section-nav__link:hover {
	text-decoration: underline;
}

.page-section-nav__link--active {
	color: var( --color-emphasized );
}
</style>
