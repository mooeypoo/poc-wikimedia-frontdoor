<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconLink } from '@wikimedia/codex-icons'

defineProps<{
	id?: string
	level: 2 | 3 | 4 | 5 | 6
}>()

const { $bananaI18n } = useNuxtApp()
</script>

<template>
	<component
		:is="`h${level}`"
		:id="id"
		class="prose-heading"
	>
		<slot />
		<a
			v-if="id"
			:href="`#${id}`"
			:aria-label="$bananaI18n( 'content-heading-anchor-label' )"
			class="prose-heading__anchor"
		>
			<CdxIcon
				:icon="cdxIconLink"
				size="small"
			/>
		</a>
	</component>
</template>

<style scoped>
.prose-heading {
	position: relative;
}

.prose-heading__anchor {
	display: inline-flex;
	align-items: center;
	opacity: 0;
	margin-inline-start: var( --spacing-50 );
	color: var( --color-subtle );
	text-decoration: none;
	transition: opacity 120ms;
	vertical-align: middle;
}

.prose-heading:hover .prose-heading__anchor,
.prose-heading__anchor:focus-visible {
	opacity: 1;
}
</style>
