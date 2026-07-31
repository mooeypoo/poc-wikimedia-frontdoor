<script setup lang="ts">
import {
	LANDING_ASSETS,
	LANDING_HERO_GLOBE_COLOR
} from '../../../config/landingSurfaces'

/**
 * Platform landing hero — dither gradient band, slotted title/intro/CTA, ascii globe.
 *
 * Full-bleed soft radial gradient (Figma `dither-background`) with the content
 * column constrained to the prose measure. Light and dark dither SVGs are bound
 * as CSS custom properties; `landing-page.css` swaps under `html.fd-theme--dark`
 * / `fd-theme--auto` + `prefers-color-scheme: dark` (same pattern as color-modes).
 *
 * The ascii globe is a committed **RGBA PNG** used as a CSS mask (Figma does not
 * ship an SVG for this art). Fill colours come from {@link LANDING_HERO_GLOBE_COLOR}
 * (light `#202122`, dark `#eaecf0`) so the mark stays readable on each dither.
 * Decorative — no accessible name.
 *
 * MDC: `:::landing-hero` … `:::`. Slot content is page copy — not banana-i18n.
 *
 * @see DESIGN_REQUIREMENTS.md → Platform landing / home
 * @see ARCHITECTURE.md → Platform landing / home
 * @see Figma hero light 1179:23219 / dark dither 1202:27291
 */

/**
 * Hero surface CSS variables — dither + globe mask / tints from config (not
 * hardcoded in stylesheets). Theme swaps live in `landing-page.css`.
 */
const heroSurfaceStyle = {
	'--fd-landing-hero-dither-light': `url(${ LANDING_ASSETS.heroDither })`,
	'--fd-landing-hero-dither-dark': `url(${ LANDING_ASSETS.heroDitherDark })`,
	'--fd-landing-hero-globe-mask': `url(${ LANDING_ASSETS.heroAsciiGlobe })`,
	'--fd-landing-hero-globe-color-light': LANDING_HERO_GLOBE_COLOR.light,
	'--fd-landing-hero-globe-color-dark': LANDING_HERO_GLOBE_COLOR.dark
}
</script>

<template>
	<section
		class="landing-hero"
		:style="heroSurfaceStyle"
	>
		<div
			class="landing-hero__dither"
			aria-hidden="true"
		/>
		<div class="landing-hero__inner">
			<div class="landing-hero__text">
				<slot />
			</div>
			<div
				class="landing-hero__globe"
				aria-hidden="true"
			>
				<span class="landing-hero__globe-mark" />
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
	/*
	 * Base under the dither so the dark SVG’s translucent progressive stop
	 * composites over Codex `--background-color-base` (#101418 in dark).
	 */
	background-color: var( --background-color-base );
}

.landing-hero__dither {
	position: absolute;
	inset: 0;
	z-index: 0;
	background-repeat: no-repeat;
	background-position: center;
	background-size: cover;
	pointer-events: none;
	/* Default light; dark override in landing-page.css under fd-theme--*. */
	background-image: var( --fd-landing-hero-dither-light );
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

/*
 * RGBA PNG as alpha mask + solid fill (themeable). Preserves scanline texture
 * via varying alpha; colour comes from config, not the raster pixels.
 */
.landing-hero__globe-mark {
	display: block;
	inline-size: 100%;
	block-size: 100%;
	background-color: var( --fd-landing-hero-globe-color-light );
	pointer-events: none;
	mask-image: var( --fd-landing-hero-globe-mask );
	mask-size: cover;
	/* Crop from the top so the unfinished puzzle crown stays visible. */
	mask-position: top center;
	mask-repeat: no-repeat;
	-webkit-mask-image: var( --fd-landing-hero-globe-mask );
	-webkit-mask-size: cover;
	-webkit-mask-position: top center;
	-webkit-mask-repeat: no-repeat;
}
</style>
