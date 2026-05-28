<script setup lang="ts">
import { useLocalizedContentPage } from '../composables/useLocalizedContentPage'

/**
 * Renders the homepage from Nuxt Content.
 *
 * Nuxt page catch-all routes do not always cover the root path in the same way
 * as nested slug routes, so the homepage gets its own page component.
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
</script>

<template>
	<ContentRenderer
		v-if="page"
		:value="page"
	/>
</template>
