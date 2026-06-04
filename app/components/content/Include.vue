<script setup lang="ts">
const props = defineProps<{
	file: string
}>()

const route = useRoute()
const { locale } = useI18n()

// Resolve a relative ./path against this page's content directory.
// e.g. current route = /learn, locale = en, file = ./_partials/api-note.md
//   → content path = /en/_partials/api-note
const contentPath = computed( () => {
	let filePath = props.file.replace( /\.md$/, '' )

	if ( filePath.startsWith( './' ) ) {
		// Strip locale prefix from route (e.g. /fr/learn → /learn; /learn → /learn)
		const routeWithoutLocale = route.path.replace( new RegExp( `^/${ locale.value }(?=/|$)` ), '' )
		// Directory of the current page (e.g. /guides/page → /guides, /page → '')
		const routeDir = routeWithoutLocale.replace( /\/[^/]*$/, '' )
		filePath = `/${ locale.value }${ routeDir }/${ filePath.slice( 2 ) }`
	}

	return filePath
} )

const { data: included } = await useAsyncData(
	`include:${ contentPath.value }`,
	() => queryCollection( 'content' ).path( contentPath.value ).first()
)
</script>

<template>
	<ContentRenderer v-if="included" :value="included" />
</template>
