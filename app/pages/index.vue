<script setup lang="ts">
import {
	LANDING_API_ARTICLE_PREVIEWS,
	LANDING_AWARD_CHIP,
	LANDING_CONTENT_MAX_INLINE_SIZE
} from '../../config/landingSurfaces'
import { useLocalizedContentPage } from '../composables/useLocalizedContentPage'

/**
 * Renders the platform home / landing page from Nuxt Content.
 *
 * Nuxt page catch-all routes do not always cover the root path in the same way
 * as nested slug routes, so the homepage gets its own page component. Wraps
 * content in `.fd-content-page.fd-landing-page` so Codex content typography and
 * landing-specific surfaces (hero, full-bleed bands) apply. Content max width
 * and award-chip colours come from {@link LANDING_CONTENT_MAX_INLINE_SIZE} /
 * {@link LANDING_AWARD_CHIP} (config — not hardcoded in CSS). Award chip binds
 * separate `-light` / `-dark` custom properties; dark invert is applied in
 * `landing-page.css` (do not reassign the light inline property).
 *
 * Preloads API article-preview thumbnail URLs from
 * {@link LANDING_API_ARTICLE_PREVIEWS} so Codex `CdxThumbnail` (which only
 * fetches in `onMounted` via `new Image()`) can paint from cache after
 * hydration without bypassing Codex Card.
 *
 * @see ARCHITECTURE.md → Platform landing / home
 * @see DESIGN_REQUIREMENTS.md → Platform landing / home
 */
const { locale } = useI18n()

const localizedHomePageDataKey = computed( () => `page-home-${ locale.value }` )

const { data: page } = await useAsyncData( localizedHomePageDataKey, async () => {
	const localizedPageResult = await useLocalizedContentPage( locale.value, '' )
	return localizedPageResult?.page ?? null
}, {
	watch: [ locale ]
} )

if ( !page.value ) {
	throw createError( {
		statusCode: 404,
		statusMessage: 'Page not found',
		fatal: true
	} )
}

/**
 * Sets landing CSS custom properties from config (AGENTS.md → config/).
 */
const landingPageStyle = {
	'--fd-landing-content-max-inline-size': LANDING_CONTENT_MAX_INLINE_SIZE,
	// Separate light/dark names (same as hero globe) — inline style would beat a
	// stylesheet reassignment of the same custom property under fd-theme--dark.
	'--fd-landing-award-chip-background-color-light': LANDING_AWARD_CHIP.light.backgroundColor,
	'--fd-landing-award-chip-color-light': LANDING_AWARD_CHIP.light.color,
	'--fd-landing-award-chip-background-color-dark': LANDING_AWARD_CHIP.dark.backgroundColor,
	'--fd-landing-award-chip-color-dark': LANDING_AWARD_CHIP.dark.color
}

/**
 * Preload links for Codex Card thumbnails on the API demo column.
 *
 * Paths come from config (same URLs passed to `LandingArticlePreview`). `as:
 * image` matches Codex Thumbnail’s client-side Image fetch.
 */
useHead( {
	link: LANDING_API_ARTICLE_PREVIEWS.map( ( preview ) => ( {
		rel: 'preload',
		as: 'image',
		href: preview.thumbnailSrc
	} ) )
} )
</script>

<template>
	<div
		class="fd-content-page fd-landing-page"
		:style="landingPageStyle"
	>
		<ContentRenderer
			v-if="page"
			:value="page"
		/>
	</div>
</template>
