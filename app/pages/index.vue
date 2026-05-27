<script setup lang="ts">
/**
 * Renders the homepage from Nuxt Content.
 *
 * Nuxt page catch-all routes do not always cover the root path in the same way
 * as nested slug routes, so the homepage gets its own page component.
 */
const { data: page } = await useAsyncData( 'page-home', async () => {
	const rootPage = await queryCollection( 'content' ).path( '/' ).first()
	if ( rootPage ) {
		return rootPage
	}

	return queryCollection( 'content' ).path( '/index' ).first()
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
