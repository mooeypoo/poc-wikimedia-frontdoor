<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconArrowPrevious, cdxIconArrowNext } from '@wikimedia/codex-icons'
import { useLocalizedContentPage } from '../composables/useLocalizedContentPage'

const route = useRoute()
const { locale } = useI18n()
const { $bananaI18n } = useNuxtApp()

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

type NavLink = { text: string; link: string }
const prevPage = computed( () => page.value?.prev as NavLink | undefined )
const nextPage = computed( () => page.value?.next as NavLink | undefined )
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
  />
  <nav
    v-if="prevPage || nextPage"
    class="page-nav"
    :aria-label="$bananaI18n( 'content-page-nav-label' )"
  >
    <NuxtLink
      v-if="prevPage"
      :to="prevPage.link"
      class="page-nav__link page-nav__link--prev"
    >
      <CdxIcon :icon="cdxIconArrowPrevious" :flip-for-rtl="true" />
      {{ prevPage.text }}
    </NuxtLink>
    <NuxtLink
      v-if="nextPage"
      :to="nextPage.link"
      class="page-nav__link page-nav__link--next"
    >
      {{ nextPage.text }}
      <CdxIcon :icon="cdxIconArrowNext" :flip-for-rtl="true" />
    </NuxtLink>
  </nav>
</template>

<style scoped>
.page-nav {
  display: flex;
  justify-content: space-between;
  margin-block-start: var( --spacing-200 );
  padding-block-start: var( --spacing-100 );
  border-block-start: 1px solid var( --border-color-subtle );
  gap: var( --spacing-100 );
}

.page-nav__link {
  display: inline-flex;
  align-items: center;
  gap: var( --spacing-50 );
  color: var( --color-progressive );
  text-decoration: none;
  font-weight: var( --font-weight-bold );
}

.page-nav__link:hover {
  text-decoration: underline;
}

.page-nav__link--next {
  margin-inline-start: auto;
}
</style>
