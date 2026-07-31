<script setup lang="ts">
/**
 * Landing content section on a full-width (viewport) band.
 *
 * Background stretches edge-to-edge via `.frontdoor-shell--landing`; slotted
 * Markdown stays centered at the platform max content width. Use for
 * “What would you like to do?” between gradient bands.
 *
 * MDC: `:::landing-section` … `:::`.
 */
</script>

<template>
	<section class="landing-section">
		<div class="landing-section__inner">
			<slot />
		</div>
	</section>
</template>

<style scoped>
.landing-section {
	inline-size: 100%;
	margin-block: 0;
	background-color: var( --background-color-base );
}

.landing-section__inner {
	box-sizing: border-box;
	inline-size: 100%;
	max-inline-size: var( --fd-landing-content-max-inline-size );
	margin-inline: auto;
	padding-block: var( --spacing-300 );
	padding-inline: var( --fd-layout-page-margin );
}

.landing-section__inner :deep( h2 ) {
	margin-block: 0;
}
</style>
