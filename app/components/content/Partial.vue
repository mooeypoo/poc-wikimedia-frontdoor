<script setup lang="ts">
import { resolveSharedPartialPath } from '../../../config/sharedPartials'

/**
 * Inserts a shared, portal-authored partial by registered name (ADR §11).
 *
 * Used by authored pages and by imported wiki pages (where a placeholder is
 * converted to `::partial{name}` at fetch time). Only names registered in
 * `config/sharedPartials.ts` resolve — the security boundary for wiki-driven
 * references; an unregistered name renders nothing.
 */
const props = defineProps<{
	name: string
}>()

const path = resolveSharedPartialPath( props.name )

if ( !path && import.meta.dev ) {
	console.warn( `[Partial] unregistered shared partial "${ props.name }" — nothing rendered` )
}

const { data: partial } = await useAsyncData(
	`shared-partial:${ props.name }`,
	() => path
		? queryCollection( 'content' ).path( path ).first()
		: Promise.resolve( null )
)
</script>

<template>
	<ContentRenderer
		v-if="partial"
		:value="partial"
	/>
</template>
