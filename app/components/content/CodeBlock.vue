<script setup lang="ts">
/**
 * Single bordered code module for Markdown — same panel chrome as {@link CodeTabs}
 * without the framed tab header.
 *
 * Use for standalone fenced samples (landing API curl, docs examples). Slot a
 * normal Markdown fence (Shiki highlighting, line numbers, diffs still apply).
 * Code is intentionally `dir="ltr"` even when the interface is RTL.
 *
 * Long lines soft-wrap by default. Pass `no-soft-wrap` for horizontal scroll
 * instead (`:::code-block{no-soft-wrap}`).
 *
 * MDC: `:::code-block` … fenced code … `:::`.
 *
 * @see ARCHITECTURE.md → Markdown content pages → Code block
 * @see CodeTabs.vue — shared border / radius / `pre` padding tokens
 */
const props = withDefaults( defineProps<{
	/**
	 * When true, long lines scroll horizontally instead of soft-wrapping.
	 * MDC boolean attributes arrive as `""`; treat that like `true` / `"true"`.
	 */
	noSoftWrap?: boolean | string
}>(), {
	noSoftWrap: false
} )

/**
 * Whether the panel should use horizontal overflow instead of soft-wrap.
 *
 * @returns True when authors opted out of soft-wrap via MDC.
 */
const isNoSoftWrap = computed( () => {
	const flag = props.noSoftWrap
	return flag === true || flag === '' || flag === 'true'
} )
</script>

<template>
	<!--
		Code / shell / curl samples are inherently LTR. Pin direction so RTL
		interface languages do not reverse operators or URL punctuation.
	-->
	<div
		class="code-block"
		:class="{ 'code-block--no-soft-wrap': isNoSoftWrap }"
		dir="ltr"
	>
		<slot />
	</div>
</template>

<style scoped>
/*
 * Panel chrome mirrors `.code-tabs` framed module (border-muted, 4px radius,
 * base surface) without CdxTabs. Keep these tokens in sync when polishing
 * either component.
 */
.code-block {
	margin-block: var( --spacing-100 );
	border: 1px solid var( --border-color-muted );
	/* Exploratory 4px — same token as NavigationCard / explorer surfaces. */
	border-radius: var( --fd-explorer-controls-surface-border-radius );
	overflow: hidden;
	background-color: var( --background-color-base );
}

.code-block :deep( > *:first-child ) {
	margin-block-start: 0;
}

.code-block :deep( > *:last-child ) {
	margin-block-end: 0;
}

.code-block :deep( pre ) {
	margin-block: 0;
	margin-inline: 0;
	border-radius: var( --border-radius-sharp );
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-75 );
	/*
	 * Soft-wrap long lines (e.g. curl URLs) inside the panel — default for all
	 * code blocks. Authors still use `\` + indent for intentional breaks.
	 * Opt out with `:::code-block{no-soft-wrap}` for horizontal scroll.
	 */
	white-space: pre-wrap;
	overflow-wrap: anywhere;
}

.code-block :deep( pre code ) {
	white-space: inherit;
	overflow-wrap: inherit;
}

/*
 * Each Shiki `.line` is one source line; allow soft-wrap inside long lines
 * (URLs) without collapsing intentional newlines between lines.
 */
.code-block :deep( .shiki .line ) {
	display: block;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
}

.code-block--no-soft-wrap :deep( pre ) {
	white-space: pre;
	overflow-wrap: normal;
	/* Logical overflow — panel is dir=ltr; scroll long lines inline. */
	overflow-inline: auto;
}

.code-block--no-soft-wrap :deep( pre code ) {
	white-space: inherit;
	overflow-wrap: inherit;
}

.code-block--no-soft-wrap :deep( .shiki .line ) {
	white-space: pre;
	overflow-wrap: normal;
}
</style>
