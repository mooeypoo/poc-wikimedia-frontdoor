<script setup lang="ts">
import { LANDING_ASSETS } from '../../../config/landingSurfaces'

/**
 * Platform landing hero — dither gradient band, slotted title/intro/CTA, ascii globe.
 *
 * Full-bleed soft radial gradient (Figma `dither-background`) with the content
 * column constrained to the prose measure. The globe is a committed asset under
 * `public/images/landing/`; alt text is empty because it is decorative.
 *
 * MDC: `:::landing-hero` … `:::`. Slot content is page copy — not banana-i18n.
 *
 * @see DESIGN_REQUIREMENTS.md → Platform landing / home
 * @see ARCHITECTURE.md → Platform landing / home
 * @see Figma hero 1179:23219
 */

const heroAsciiGlobeSrc = LANDING_ASSETS.heroAsciiGlobe
const heroDitherSrc = LANDING_ASSETS.heroDither
</script>

<template>
	<section class="landing-hero">
		<div
			class="landing-hero__dither"
			aria-hidden="true"
			:style="{ backgroundImage: `url(${ heroDitherSrc })` }"
		/>
		<div class="landing-hero__inner">
			<div class="landing-hero__text">
				<slot />
			</div>
			<div
				class="landing-hero__globe"
				aria-hidden="true"
			>
				<img
					class="landing-hero__globe-image"
					:src="heroAsciiGlobeSrc"
					alt=""
					width="970"
					height="806"
					decoding="async"
				>
			</div>
		</div>
	</section>
</template>

<style scoped>
.landing-hero {
	position: relative;
	/* Full viewport width via `.frontdoor-shell--landing` (no page-grid insets). */
	inline-size: 100%;
	margin-block: 0;
	overflow: clip;
}

.landing-hero__dither {
	position: absolute;
	inset: 0;
	z-index: 0;
	background-repeat: no-repeat;
	background-position: center;
	background-size: cover;
	pointer-events: none;
}

.landing-hero__inner {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var( --spacing-150 );
	box-sizing: border-box;
	inline-size: 100%;
	max-inline-size: var( --fd-landing-content-max-inline-size );
	margin-inline: auto;
	padding-block-start: var( --spacing-300 );
	padding-block-end: 0;
	padding-inline: var( --fd-layout-page-margin );
}

.landing-hero__text {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var( --spacing-150 );
	inline-size: 100%;
	text-align: center;
}

.landing-hero__text :deep( h1 ) {
	margin-block: 0;
}

.landing-hero__text :deep( p ) {
	margin-block: 0;
	font-size: var( --font-size-xx-large );
	line-height: var( --line-height-xx-large );
	/* Intro is start-aligned in Figma (full measure), not centered. */
	text-align: start;
}

.landing-hero__text :deep( .app-button ) {
	align-self: center;
}

.landing-hero__globe {
	display: flex;
	justify-content: center;
	inline-size: 100%;
	max-inline-size: 40.6875rem; /* 651px */
	block-size: 13.9375rem; /* 223px */
	overflow: hidden;
}

.landing-hero__globe-image {
	display: block;
	inline-size: 100%;
	block-size: 100%;
	object-fit: cover;
	/* Crop from the top so the unfinished puzzle crown stays visible. */
	object-position: top center;
	pointer-events: none;
}
</style>
