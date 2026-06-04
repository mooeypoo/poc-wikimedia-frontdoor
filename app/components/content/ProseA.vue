<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconLinkExternal } from '@wikimedia/codex-icons'

const props = defineProps<{
	href?: string
	target?: string
	rel?: string
}>()

const isExternal = computed( () => /^https?:\/\//.test( props.href ?? '' ) )
const { $bananaI18n } = useNuxtApp()
</script>

<template>
	<a :href="href" :target="target" :rel="rel" class="prose-link">
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
