<script setup lang="ts">
/**
 * Inline Wikimedia community logo mark (monochrome).
 *
 * Geometry from Wikimedia Commons
 * [`Wikimedia-logo_black.svg`](https://upload.wikimedia.org/wikipedia/commons/8/8b/Wikimedia-logo_black.svg).
 * Hardcoded black fills/strokes are remapped to `currentColor` so the mark
 * inherits shell brand colour (`--color-base` in the header, `--color-subtle`
 * in the footer) and follows light / dark mode. Must be inlined — `<img>`
 * cannot inherit `currentColor`.
 *
 * Clip-path id is unique per instance via {@link useId} so header + footer
 * can mount together without colliding.
 */
const clipPathId = useId()
</script>

<template>
	<svg
		class="wikimedia-logo-mark"
		viewBox="-16 -16 32 32"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		focusable="false"
	>
		<clipPath :id="clipPathId">
			<path d="m1-2v12h-2v-12l-15-15v33h32v-33z" />
		</clipPath>
		<g :clip-path="`url(#${clipPathId})`">
			<circle
				r="9"
				fill="currentColor"
			/>
			<circle
				fill="none"
				r="13"
				stroke="currentColor"
				stroke-width="4"
			/>
		</g>
		<circle
			cy="-10"
			r="5"
			fill="currentColor"
		/>
	</svg>
</template>

<style scoped>
.wikimedia-logo-mark {
	display: block;
	inline-size: 100%;
	block-size: 100%;
	flex-shrink: 0;
}
</style>
