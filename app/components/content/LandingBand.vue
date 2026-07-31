<script setup lang="ts">
import { LANDING_BAND_GRADIENTS } from '../../../config/landingSurfaces'

/**
 * Full-bleed landing section band.
 *
 * Gradient variants (`apis`, `join`) use light / dark stops from
 * {@link LANDING_BAND_GRADIENTS}. Dark stops swap under `html.fd-theme--*` in
 * `landing-page.css` (same pattern as the hero dither). The `apps` variant uses
 * Codex `--background-color-base` (no gradient). Content is slotted Markdown —
 * not banana-i18n. Use from MDC as `:::landing-band{variant="apis"}` … `:::`.
 *
 * @see Figma Latest light 1179:23177 / APIs dark 1202:27489 / join dark 1202:28482
 */
const props = withDefaults( defineProps<{
	/**
	 * Visual band variant. `apis` / `join` = soft gradient; `apps` = base surface.
	 */
	variant?: 'apis' | 'apps' | 'join'
}>(), {
	variant: 'apis'
} )

const isGradientBand = computed( () => {
	return props.variant === 'apis' || props.variant === 'join'
} )

const bandClass = computed( () => {
	return [
		'landing-band',
		`landing-band--${ props.variant }`
	]
} )

/**
 * Binds light and dark gradient stops from config for CSS theme swap.
 *
 * @returns Inline style with `--fd-landing-band-*` custom properties, or undefined for `apps`.
 */
const bandStyle = computed( () => {
	if ( !isGradientBand.value ) {
		return undefined
	}
	const gradientStops = LANDING_BAND_GRADIENTS[ props.variant as 'apis' | 'join' ]
	return {
		'--fd-landing-band-start': gradientStops.light.start,
		'--fd-landing-band-end': gradientStops.light.end,
		'--fd-landing-band-start-dark': gradientStops.dark.start,
		'--fd-landing-band-end-dark': gradientStops.dark.end
	}
} )
</script>

<template>
	<section
		:class="bandClass"
		:style="bandStyle"
	>
		<div class="landing-band__inner">
			<slot />
		</div>
	</section>
</template>

<style scoped>
.landing-band {
	position: relative;
	/* Full viewport width via `.frontdoor-shell--landing` (no page-grid insets). */
	inline-size: 100%;
	margin-block: 0;
	overflow: clip;
}

.landing-band--apis,
.landing-band--join {
	/* Default light; dark override in landing-page.css under fd-theme--*. */
	background-image: linear-gradient(
		to bottom,
		var( --fd-landing-band-start ),
		var( --fd-landing-band-end )
	);
}

.landing-band--apps {
	background-color: var( --background-color-base );
	background-image: none;
}

.landing-band__inner {
	box-sizing: border-box;
	inline-size: 100%;
	max-inline-size: var( --fd-landing-content-max-inline-size );
	margin-inline: auto;
	padding-block: var( --spacing-300 );
	padding-inline: var( --fd-layout-page-margin );
}

.landing-band__inner :deep( h2 ) {
	/* End margin owned by landing-page.css (`--spacing-150`). */
	margin-block-start: 0;
}
</style>
