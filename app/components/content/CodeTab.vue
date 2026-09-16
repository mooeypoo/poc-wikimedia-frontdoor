<script setup lang="ts">
/**
 * Markdown code-tab panel marker for `:::code-tab{label="…"}` blocks.
 *
 * Never mounted: {@link CodeTabs} reads the label and the default slot straight
 * off these vnodes and renders the content itself inside a {@link CdxTab}
 * panel. The component still has to exist so MDC can resolve `code-tab`, and
 * its empty render keeps a stray `:::code-tab` outside `::::code-tabs` from
 * printing anything.
 *
 * @see ARCHITECTURE.md → Markdown content pages → Code tabs
 */
defineOptions( {
	name: 'CodeTab'
} )

defineProps<{
	/** Visible tab label from Markdown (also used to derive the CdxTab `name`). */
	label: string
}>()
</script>

<script lang="ts">
export default {
	render: () => null
}
</script>
