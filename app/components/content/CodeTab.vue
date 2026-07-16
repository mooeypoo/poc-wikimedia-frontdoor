<script setup lang="ts">
import type { VNode } from 'vue'

/**
 * Markdown code-tab panel marker for `:::code-tab{label="…"}` blocks.
 *
 * {@link CodeTabs} collects these children and renders them inside framed
 * {@link CdxTab} panels. Registration runs synchronously during `setup()`
 * (not `onMounted`) so SSR can populate the parent tab list before paint.
 *
 * Side effect: calls the injected `code-tabs:register` callback with this
 * tab's label and a function that re-renders the default slot into a
 * {@link CdxTab} panel. Renders no DOM of its own — panel markup lives in
 * {@link CodeTabs}.
 *
 * @see ARCHITECTURE.md → Markdown content pages → Code tabs
 */
defineOptions( {
	name: 'CodeTab'
} )

const props = defineProps<{
	/** Visible tab label from Markdown (also used to derive the CdxTab `name`). */
	label: string
}>()

const slots = useSlots()

const registerTab = inject<( registration: {
	label: string
	content: () => VNode[]
} ) => void>( 'code-tabs:register' )

// Synchronous registration — required for SSR; onMounted is too late (empty tabs on first paint).
registerTab?.( {
	label: props.label,
	content: () => slots.default?.() ?? []
} )
</script>

<template>
	<!-- Content is rendered by CodeTabs inside CdxTab. -->
</template>
