<script setup lang="ts">
import { CdxCard, type Thumbnail } from '@wikimedia/codex'

/**
 * Landscape article-preview card for the landing API demo column.
 *
 * Uses Codex {@link CdxCard} with a thumbnail ([Card demos](https://doc.wikimedia.org/codex/latest/components/demos/card.html)).
 * Non-interactive (no `url`). Title and description are content strings —
 * BiDi-isolated. Thumbnail paths come from {@link LANDING_API_ARTICLE_PREVIEWS}.
 *
 * **Codex exception:** stock `CdxCard` has no visible resting border in this
 * context; landing previews add a muted border so cards read as framed tiles
 * on the API band (Figma). Documented in ARCHITECTURE.md → Platform landing.
 *
 * @see LandingApiDemo.vue
 * @see config/landingSurfaces.ts
 * @see Figma Card instances 1181:25098–1181:25100
 */
const props = defineProps<{
	/** Article title (content string). */
	title: string
	/** Truncated snippet (content string). */
	description: string
	/** Public path to the thumbnail image. */
	thumbnailSrc: string
}>()

/**
 * Codex Thumbnail payload for {@link CdxCard}.
 *
 * @returns Thumbnail object with committed public URL and 40px box size.
 */
const thumbnail = computed( (): Thumbnail => ( {
	url: props.thumbnailSrc,
	width: 40,
	height: 40
} ) )
</script>

<template>
	<CdxCard
		class="landing-article-preview"
		:thumbnail="thumbnail"
	>
		<template #title>
			<bdi>{{ title }}</bdi>
		</template>
		<template #description>
			<span class="landing-article-preview__description">
				<bdi>{{ description }}</bdi>
			</span>
		</template>
	</CdxCard>
</template>

<style scoped>
.landing-article-preview {
	inline-size: 100%;
	box-sizing: border-box;
	/*
	 * Codex exception — stock CdxCard has no resting border here; Figma landing
	 * API previews are framed tiles. Use muted (not progressive) so they stay
	 * quiet beside the curl sample. See ARCHITECTURE.md → Platform landing.
	 */
	border: var( --border-width-base ) solid var( --border-color-muted );
	border-radius: var( --fd-explorer-controls-surface-border-radius );
}

/*
 * Clamp description to two lines so the stacked column keeps a stable height
 * while free space is distributed between cards (space-between).
 */
.landing-article-preview__description {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	overflow-wrap: anywhere;
}
</style>
