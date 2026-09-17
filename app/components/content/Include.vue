<script setup lang="ts">
import { CONTENT_LOCALES } from '#build/content-locales'
import { useContentDocument } from '../../composables/useContentDocument'
import { localeFromContentPath } from '../../utils/contentLocalePaths'
import { injectResolvedContentLocale } from '../../utils/contentLocaleContext'

const props = defineProps<{
	file: string
}>()

const route = useRoute()
const { locale } = useI18n()

// The page's actual resolved locale (which can differ from the interface
// locale after a fallback) is what a relative include needs to land next to
// its page's content, not the reader's interface locale.
const resolvedPageLocale = injectResolvedContentLocale()
const pageContentLocale = computed( () => resolvedPageLocale?.value ?? locale.value )

// Resolve a relative ./path against this page's content directory.
// e.g. current route = /learn, interface locale = fr, page resolved to en,
// file = ./_partials/api-note.md → content path = /en/_partials/api-note
const contentPath = computed( () => {
	let filePath = props.file.replace( /\.md$/, '' )

	if ( filePath.startsWith( './' ) ) {
		// Strip locale prefix from route (e.g. /fr/learn → /learn; /learn → /learn)
		const routeWithoutLocale = route.path.replace( new RegExp( `^/${ locale.value }(?=/|$)` ), '' )
		// Directory of the current page (e.g. /guides/page → /guides, /page → '')
		const routeDir = routeWithoutLocale.replace( /\/[^/]*$/, '' )
		filePath = `/${ pageContentLocale.value }${ routeDir }/${ filePath.slice( 2 ) }`
	}

	return filePath
} )

// contentPath is always locale-prefixed (built with pageContentLocale above,
// or an absolute prop authored under a specific locale's directory), so its
// own first segment names the collection content.config.ts put it in — not
// necessarily pageContentLocale, since an absolute `file` can name any locale.
const contentLocale = computed( () => localeFromContentPath( contentPath.value, pageContentLocale.value ) )

// A segment that isn't a real content locale (e.g. an absolute path into
// content/_partials/shared/, which ::partial{name} owns instead) has no
// collection to query. content-document.get.ts treats an unknown locale as a
// miss too, so this guard only saves the round trip.
const hasContentCollection = computed( () => CONTENT_LOCALES.includes( contentLocale.value ) )

if ( !hasContentCollection.value && import.meta.dev ) {
	console.warn( `[Include] "${ props.file }" does not resolve to a content locale — nothing rendered` )
}

const { data: included } = await useAsyncData(
	`include:${ contentPath.value }`,
	() => hasContentCollection.value
		? useContentDocument( contentPath.value, contentLocale.value )
		: Promise.resolve( null )
)
</script>

<template>
	<ContentRenderer
		v-if="included"
		:value="included"
	/>
</template>
