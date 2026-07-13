<script setup lang="ts">
import type { VNode } from 'vue'

/**
 * Markdown code-tab panel marker. {@link CodeTabs} collects these children and
 * renders them inside framed {@link CdxTab} panels.
 */
defineOptions( {
	name: 'CodeTab'
} )

const props = defineProps<{
	label: string
}>()

const slots = useSlots()

const registerTab = inject<( registration: {
	label: string
	content: () => VNode[]
} ) => void>( 'code-tabs:register' )

registerTab?.( {
	label: props.label,
	content: () => slots.default?.() ?? []
} )
</script>

<template>
	<!-- Content is rendered by CodeTabs inside CdxTab. -->
</template>
