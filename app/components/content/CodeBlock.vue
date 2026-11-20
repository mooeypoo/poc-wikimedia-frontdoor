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
 * Pass `label` to show a short caption above the code describing the sample
 * (`:::code-block{label="Fetch a page summary"}`).
 *
 * Pass `collapse-after-line` to show only that many lines initially, with a
 * "Show more" toggle underneath (`:::code-block{collapse-after-line="8"}`). The
 * limit is measured in rendered lines, so a soft-wrapped line counts once per
 * visual row. The toggle only appears when the code is actually taller than
 * the limit.
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
	/**
	 * Optional caption describing the code sample. Rendered in a header strip
	 * above the code. Omit for the original headerless panel.
	 */
	label?: string
	/**
	 * Number of lines to show before the rest is collapsed behind a toggle.
	 * MDC attributes arrive as strings (`"8"`), so numeric strings are accepted.
	 * Omit (or pass a non-positive / non-numeric value) to always show everything.
	 */
	collapseAfterLine?: number | string
}>(), {
	noSoftWrap: false,
	label: '',
	collapseAfterLine: undefined
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

/**
 * Trimmed label text, or an empty string when no usable label was provided.
 *
 * @returns The label to display, if any.
 */
const labelText = computed( () => props.label.trim() )

/**
 * Parsed collapse limit, or null when collapsing is not requested.
 *
 * @returns A positive integer line count, or null.
 */
const collapsedLineCount = computed<number | null>( () => {
	const raw = props.collapseAfterLine

	if ( raw === undefined || raw === null || raw === '' ) {
		return null
	}

	const parsed = typeof raw === 'number' ? Math.floor( raw ) : Number.parseInt( raw, 10 )

	return Number.isFinite( parsed ) && parsed > 0 ? parsed : null
} )

/** Whether the user has expanded the collapsed code. */
const isExpanded = ref( false )

/**
 * Whether the code is taller than the collapse limit. Measured on the client
 * after mount; stays true after expanding so the "Show less" toggle remains.
 */
const isOverflowing = ref( false )

/**
 * True while the height limit should be applied. This depends only on props
 * and the toggle state (not on measurement) so SSR and first paint already
 * render the collapsed height, with no flash of full-height code.
 */
const isCollapsed = computed( () => collapsedLineCount.value !== null && !isExpanded.value )

/** Inline CSS variable consumed by the collapsed `pre` height rule. */
const collapsedStyle = computed( () => (
	collapsedLineCount.value === null ?
		undefined :
		{ '--code-block-collapsed-lines': String( collapsedLineCount.value ) }
) )

const bodyRef = ref<HTMLElement | null>( null )
let resizeObserver: ResizeObserver | null = null

/**
 * Checks whether the collapsed `pre` is clipping content. Skipped while
 * expanded, since the full height would never report overflow.
 */
function measureOverflow() {
	if ( collapsedLineCount.value === null || isExpanded.value ) {
		return
	}

	const pre = bodyRef.value?.querySelector( 'pre' )

	if ( !pre ) {
		return
	}

	isOverflowing.value = pre.scrollHeight > pre.clientHeight + 1
}

/** Flips between the collapsed and fully expanded states. */
function toggleExpanded() {
	isExpanded.value = !isExpanded.value
}

onMounted( () => {
	measureOverflow()

	// Re-measure when the panel width changes, since soft-wrapping alters height.
	if ( typeof ResizeObserver !== 'undefined' && bodyRef.value ) {
		resizeObserver = new ResizeObserver( measureOverflow )
		resizeObserver.observe( bodyRef.value )
	}
} )

onBeforeUnmount( () => {
	resizeObserver?.disconnect()
	resizeObserver = null
} )

// Changing the limit (or soft-wrap mode) at runtime can change whether the code overflows.
watch( [ collapsedLineCount, isNoSoftWrap ], () => {
	nextTick( measureOverflow )
} )
</script>

<template>
	<!--
		Code / shell / curl samples are inherently LTR. Pin direction so RTL
		interface languages do not reverse operators or URL punctuation.
	-->
	<div
		class="code-block"
		:class="{
			'code-block--no-soft-wrap': isNoSoftWrap,
			'code-block--collapsed': isCollapsed
		}"
		:style="collapsedStyle"
		dir="ltr"
	>
		<div
			v-if="labelText"
			class="code-block__label"
		>
			{{ labelText }}
		</div>
		<!--
			Wrapper keeps the `:deep( > *:first-child )` margin resets working
			now that the label can be the panel's first child.
		-->
		<div
			ref="bodyRef"
			class="code-block__body"
		>
			<slot />
		</div>
		<button
			v-if="collapsedLineCount !== null && isOverflowing"
			type="button"
			class="code-block__toggle"
			:aria-expanded="isExpanded"
			@click="toggleExpanded"
		>
			{{ isExpanded ? 'Show less' : 'Show more' }}
		</button>
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

/* Caption strip: subtle surface + divider so it reads as part of the panel. */
.code-block__label {
	padding-block: var( --spacing-50 );
	padding-inline: var( --spacing-75 );
	border-block-end: 1px solid var( --border-color-muted );
	background-color: var( --background-color-interactive-subtle );
	color: var( --color-subtle );
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-semi-bold );
	line-height: var( --line-height-small );
}

.code-block__body :deep( > *:first-child ) {
	margin-block-start: 0;
}

.code-block__body :deep( > *:last-child ) {
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

/*
 * Collapsed state: clip the `pre` to exactly N rendered lines. `content-box`
 * keeps the padding outside the limit, and `1lh` is the `pre`'s own line
 * height. Needs a browser with the `lh` unit (Chrome 109+, Safari 16.4+,
 * Firefox 120+); older browsers ignore the rule and simply show the full code.
 *
 * `overflow` clips at the padding edge, so a bottom *padding* would reveal the
 * top of the next line. Swap it for a transparent bottom *border* (outside the
 * clip, still painted over by the `pre` background) to keep the same spacing
 * without showing a partial line.
 */
.code-block--collapsed :deep( pre ) {
	box-sizing: content-box;
	max-block-size: calc( var( --code-block-collapsed-lines ) * 1lh );
	overflow-y: hidden;
	padding-block-end: 0;
	border-block-end: var( --spacing-75 ) solid transparent;
}

/* Full-width toggle strip under the code, divided like the label strip. */
.code-block__toggle {
	display: block;
	inline-size: 100%;
	padding-block: var( --spacing-50 );
	padding-inline: var( --spacing-75 );
	border: 0;
	border-block-start: 1px solid var( --border-color-muted );
	background-color: var( --background-color-interactive-subtle );
	color: var( --color-progressive );
	font-family: inherit;
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-semi-bold );
	line-height: var( --line-height-small );
	text-align: center;
	cursor: pointer;
}

.code-block__toggle:hover {
	background-color: var( --background-color-interactive );
}

.code-block__toggle:focus-visible {
	outline: 2px solid var( --border-color-progressive--focus );
	outline-offset: -2px;
}
</style>
