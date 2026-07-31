<script setup lang="ts">
import { LANDING_BAND_GRADIENTS } from '../../../config/landingSurfaces'

/**
 * Full-bleed landing section band.
 *
 * Gradient variants (`apis`, `join`) use stops from {@link LANDING_BAND_GRADIENTS}.
 * The `apps` variant uses Codex `--background-color-base` (no gradient).
 * Content is slotted Markdown — not banana-i18n. Use from MDC as
 * `:::landing-band{variant="apis"}` … `:::`.
 *
 * @see Figma Latest frame 1179:23177
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

const bandStyle = computed( () => {
	if ( !isGradientBand.value ) {
		return undefined
	}
	const gradientStops = LANDING_BAND_GRADIENTS[ props.variant as 'apis' | 'join' ]
	return {
		'--fd-landing-band-start': gradientStops.start,
		'--fd-landing-band-end': gradientStops.end
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
	margin-block: 0;
}

.landing-band__inner :deep( h2 + p ) {
	margin-block-start: var( --spacing-100 );
}
</style>
