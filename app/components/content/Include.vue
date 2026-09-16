<script setup lang="ts">
import { contentCollectionForLocale } from '../../../config/contentCollections'
import { CONTENT_LOCALES } from '#build/content-locales'

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

// contentPath is always locale-prefixed (built with locale.value above, or an
// absolute prop authored under a specific locale's directory), so its own
// first segment names the collection content.config.ts put it in — not
// necessarily locale.value, since an absolute `file` can name any locale.
const contentLocale = computed( () => {
	const [ , localeSegment ] = contentPath.value.split( '/' )
	return localeSegment ?? locale.value
} )

// A segment that isn't a real content locale (e.g. an absolute path into
// content/_partials/shared/, which ::partial{name} owns instead) has no
// collection to query — queryCollection on a name that doesn't exist throws,
// so this is treated the same as "nothing at this path" rather than left to throw.
const hasContentCollection = computed( () => CONTENT_LOCALES.includes( contentLocale.value ) )

if ( !hasContentCollection.value && import.meta.dev ) {
	console.warn( `[Include] "${ props.file }" does not resolve to a content locale — nothing rendered` )
}

const { data: included } = await useAsyncData(
	`include:${ contentPath.value }`,
	() => hasContentCollection.value
		? queryCollection( contentCollectionForLocale( contentLocale.value ) ).path( contentPath.value ).first()
		: Promise.resolve( null )
)
</script>

<template>
	<ContentRenderer
		v-if="included"
		:value="included"
	/>
</template>
