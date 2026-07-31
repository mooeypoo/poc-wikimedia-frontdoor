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
 * {@link LANDING_AWARD_CHIP} (config — not hardcoded in CSS).
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
	'--fd-landing-award-chip-background-color': LANDING_AWARD_CHIP.backgroundColor,
	'--fd-landing-award-chip-color': LANDING_AWARD_CHIP.color
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
