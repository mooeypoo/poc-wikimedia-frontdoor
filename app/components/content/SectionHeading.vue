<script setup lang="ts">
import { CdxInfoChip, type StatusType } from '@wikimedia/codex'
import GitHubSlugger from 'github-slugger'
import ProseHeading from './ProseHeading.vue'

/**
 * Content-page section heading (h2) with an optional Codex InfoChip beside the title.
 *
 * Used on the API catalog for “Wikimedia APIs” + Recommended
 * ([Figma 1183:31822](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=1183-31822)).
 * Title and chip labels are **content** (per-locale Markdown) — BiDi-isolated, not
 * banana-i18n. Anchor id defaults to a slug of the title (same idea as prose `##`).
 *
 * @see ARCHITECTURE.md → Markdown content pages → Section heading
 * @see DESIGN_REQUIREMENTS.md → API catalog
 */
const props = withDefaults( defineProps<{
	/** Heading text (content string). */
	title: string
	/** Optional InfoChip label beside the title (content string). */
	chip?: string
	/**
	 * Codex InfoChip status. Catalog “Recommended” uses `notice` (Figma; no status icon).
	 */
	status?: StatusType
	/** Explicit heading id for `#` anchors; omit to slugify `title`. */
	id?: string
	/** Heading level — catalog sections are h2. */
	level?: 2 | 3
}>(), {
	chip: '',
	status: 'notice',
	id: '',
	level: 2
} )

const headingId = computed( () => {
	if ( props.id.trim() ) {
		return props.id.trim()
	}
	return new GitHubSlugger().slug( props.title )
} )

const hasChip = computed( () => props.chip.trim().length > 0 )
</script>

<template>
	<ProseHeading
		:id="headingId"
		:level="level"
		class="section-heading"
	>
		<span class="section-heading__title">
			<bdi>{{ title }}</bdi>
		</span>
		<CdxInfoChip
			v-if="hasChip"
			class="section-heading__chip"
			:status="status"
		>
			<bdi>{{ chip }}</bdi>
		</CdxInfoChip>
	</ProseHeading>
</template>

<style scoped>
.section-heading.prose-heading {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	column-gap: var( --spacing-75 );
	row-gap: var( --spacing-50 );
}

.section-heading__title {
	min-inline-size: 0;
}

.section-heading__chip {
	flex: 0 0 auto;
	/* Heading tokens must not cascade into Codex chip type. */
	font-family: var( --font-family-base );
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-small );
}

/*
 * Codex forces icons on warning / error / success. Prefer notice for catalog
 * “Recommended”; hide icons if another status is authored.
 */
.section-heading__chip :deep( .cdx-info-chip__icon--vue ) {
	display: none;
}
</style>
