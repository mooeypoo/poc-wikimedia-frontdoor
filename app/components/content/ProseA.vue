<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconLinkExternal } from '@wikimedia/codex-icons'

const props = defineProps<{
	href?: string
	target?: string
	rel?: string
}>()

const isExternal = computed( () => /^https?:\/\//.test( props.href ?? '' ) )

/**
 * External prose links open in a new tab unless the author set `target`.
 * Matches NavigationCard / AppButton off-platform behaviour.
 */
const resolvedTarget = computed( () => {
	if ( props.target !== undefined && props.target !== null && props.target !== '' ) {
		return props.target
	}
	return isExternal.value ? '_blank' : undefined
} )

const resolvedRel = computed( () => {
	if ( props.rel !== undefined && props.rel !== null && props.rel !== '' ) {
		return props.rel
	}
	return isExternal.value ? 'noopener noreferrer' : undefined
} )

const { $bananaI18n } = useNuxtApp()
</script>

<template>
	<a
		:href="href"
		:target="resolvedTarget"
		:rel="resolvedRel"
		class="prose-link"
	>
		<slot />
		<CdxIcon
			v-if="isExternal"
			:icon="cdxIconLinkExternal"
			size="x-small"
			:aria-label="$bananaI18n( 'content-external-link-label' )"
			class="prose-link__external-icon"
		/>
	</a>
</template>

<style scoped>
.prose-link__external-icon {
	margin-inline-start: var( --spacing-25 );
	vertical-align: middle;
	color: inherit;
}
</style>
