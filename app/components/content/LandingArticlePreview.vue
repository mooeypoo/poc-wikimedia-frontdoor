<script setup lang="ts">
/**
 * Horizontal article-preview card for the landing API demo column.
 *
 * Non-interactive Codex-style landscape card (thumbnail + title + snippet).
 * Content strings are BiDi-isolated. Thumbnail URL is a committed public asset
 * rendered as a plain `<img>` (relative public paths are more reliable than
 * CdxThumbnail’s lazy load for these static mockup images).
 *
 * @see config/landingSurfaces.ts
 * @see Figma Card instances 1181:25098–1181:25100
 */
defineProps<{
	/** Article title (content string). */
	title: string
	/** Truncated snippet (content string). */
	description: string
	/** Public path to the thumbnail image. */
	thumbnailSrc: string
}>()
</script>

<template>
	<article class="landing-article-preview">
		<img
			class="landing-article-preview__thumbnail"
			:src="thumbnailSrc"
			alt=""
			width="40"
			height="40"
			decoding="async"
		>
		<div class="landing-article-preview__copy">
			<p class="landing-article-preview__title">
				<bdi>{{ title }}</bdi>
			</p>
			<p class="landing-article-preview__description">
				<bdi>{{ description }}</bdi>
			</p>
		</div>
	</article>
</template>

<style scoped>
.landing-article-preview {
	display: flex;
	align-items: flex-start;
	gap: var( --spacing-75 );
	box-sizing: border-box;
	inline-size: 100%;
	padding: var( --spacing-75 );
	border: var( --border-width-base ) solid var( --border-color-muted );
	border-radius: var( --fd-explorer-controls-surface-border-radius );
	background-color: var( --background-color-base );
}

.landing-article-preview__thumbnail {
	flex: 0 0 auto;
	/* 40px — matches Figma landscape card thumbnails. */
	inline-size: var( --size-250 );
	block-size: var( --size-250 );
	object-fit: cover;
	border: var( --border-width-base ) solid var( --border-color-subtle );
	border-radius: var( --border-radius-base );
}

.landing-article-preview__copy {
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	gap: var( --spacing-25 );
	min-inline-size: 0;
}

.landing-article-preview__title,
.landing-article-preview__description {
	margin-block: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	overflow-wrap: anywhere;
}

.landing-article-preview__title {
	font-weight: var( --font-weight-bold );
	color: var( --color-base );
}

.landing-article-preview__description {
	font-weight: var( --font-weight-normal );
	color: var( --color-subtle );
	/*
	 * Clamp to two lines so the stacked column matches Figma card height
	 * without inventing different copy.
	 */
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}
</style>
