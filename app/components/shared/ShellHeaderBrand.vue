<script setup lang="ts">
import { useMainNavigationLinks } from '../../composables/useMainNavigationLinks'

/**
 * Header brand lockup — single SVG logo (`dev-portal-logo.svg`).
 *
 * Rendered in the shell header utility row per Figma Header node 284:11443.
 * Uses the bundled SVG lockup (mark + wordmark as paths) so typography does not
 * depend on the user’s system fonts.
 */
const { getStartedPath } = useMainNavigationLinks()
const { $bananaI18n } = useNuxtApp()

const brandLogoAccessibleLabel = computed( () => $bananaI18n( 'app-title' ) )
</script>

<template>
	<NuxtLink
		:to="getStartedPath"
		class="shell-header-brand"
		:aria-label="brandLogoAccessibleLabel"
	>
		<img
			class="shell-header-brand__logo"
			src="/images/dev-portal-logo.svg"
			width="214"
			height="32"
			alt=""
			aria-hidden="true"
		>
	</NuxtLink>
</template>

<style scoped>
.shell-header-brand {
	display: inline-flex;
	align-items: center;
	flex: 0 0 auto;
	min-inline-size: 0;
	text-decoration: none;
}

/*
 * Native asset 214×32; displayed at 32px block-size (Figma header mark height).
 * Inline size scales from the SVG aspect ratio.
 */
.shell-header-brand__logo {
	display: block;
	block-size: 2rem;
	inline-size: auto;
	flex-shrink: 0;
}
</style>
