<script setup lang="ts">
import { useLocalizedContentPage } from '../composables/useLocalizedContentPage'

const route = useRoute()
const { locale } = useI18n()

const slugPath = computed( () => {
  const routeSlug = route.params.slug
  if ( Array.isArray( routeSlug ) ) {
    return routeSlug.join( '/' )
  }
  if ( typeof routeSlug === 'string' ) {
    return routeSlug
  }
  return ''
} )

const { data: page } = await useAsyncData( 'page-' + route.path, async () => {
  const localizedPageResult = await useLocalizedContentPage( locale.value, slugPath.value )
  return localizedPageResult?.page ?? null
})

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
