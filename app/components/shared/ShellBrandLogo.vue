<script setup lang="ts">
import { useMainNavigationLinks } from '../../composables/useMainNavigationLinks'

/**
 * Shell brand logo for the start column — links to Get started.
 *
 * Uses the temporary Developer Portal wordmark SVG from `public/images/`.
 * Asset and placement are prototype chrome only (see DESIGN_REQUIREMENTS.md).
 */
const { getStartedPath } = useMainNavigationLinks()
const { $bananaI18n } = useNuxtApp()

const brandLogoAccessibleLabel = computed( () => $bananaI18n( 'app-title' ) )
</script>

<template>
	<NuxtLink
		:to="getStartedPath"
		class="shell-brand-logo"
	>
		<img
			class="shell-brand-logo__image"
			src="/images/developer-portal-logo.svg"
			width="153"
			height="48"
			:alt="brandLogoAccessibleLabel"
		>
	</NuxtLink>
</template>

<style scoped>
.shell-brand-logo {
	display: inline-flex;
	align-items: center;
	padding-block: 11px 24px;
	padding-inline: var( --spacing-75 );
	text-decoration: none;
	max-inline-size: 100%;
}

.shell-brand-logo__image {
	display: block;
	inline-size: 100%;
	max-inline-size: 12.5rem;
	block-size: auto;
}
</style>
