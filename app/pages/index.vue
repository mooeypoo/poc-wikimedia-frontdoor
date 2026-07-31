<script setup lang="ts">
import { LANDING_CONTENT_MAX_INLINE_SIZE } from '../../config/landingSurfaces'
import { useLocalizedContentPage } from '../composables/useLocalizedContentPage'

/**
 * Renders the platform home / landing page from Nuxt Content.
 *
 * Nuxt page catch-all routes do not always cover the root path in the same way
 * as nested slug routes, so the homepage gets its own page component. Wraps
 * content in `.fd-content-page.fd-landing-page` so Codex content typography and
 * landing-specific surfaces (hero, full-bleed bands) apply. Content max width
 * comes from {@link LANDING_CONTENT_MAX_INLINE_SIZE} (config — not hardcoded in CSS).
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
 * Sets `--fd-landing-content-max-inline-size` from config so section inners
 * do not hardcode the 1000px measure (AGENTS.md → All configuration in config/).
 */
const landingPageStyle = {
	'--fd-landing-content-max-inline-size': LANDING_CONTENT_MAX_INLINE_SIZE
}
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
