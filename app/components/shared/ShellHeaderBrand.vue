<script setup lang="ts">
import { useMainNavigationLinks } from '../../composables/useMainNavigationLinks'

/**
 * Compact header brand lockup — Wikimedia mark (32px SVG) plus two-line wordmark.
 *
 * Rendered in the shell header utility row per Figma Header node 284:11443.
 * Mark: `public/images/developer-portal-logo-mark.svg`. Wordmark lines use banana-i18n
 * (`brand-wordmark-wikimedia`, `brand-wordmark-developer-portal`) in Montserrat.
 */
const { getStartedPath } = useMainNavigationLinks()
const { $bananaI18n } = useNuxtApp()

const brandLogoAccessibleLabel = computed( () => $bananaI18n( 'app-title' ) )
const brandWordmarkTopLabel = computed( () => $bananaI18n( 'brand-wordmark-wikimedia' ) )
const brandWordmarkBottomLabel = computed( () => $bananaI18n( 'brand-wordmark-developer-portal' ) )
</script>

<template>
	<NuxtLink
		:to="getStartedPath"
		class="shell-header-brand"
		:aria-label="brandLogoAccessibleLabel"
	>
		<img
			class="shell-header-brand__mark"
			src="/images/developer-portal-logo-mark.svg"
			width="32"
			height="32"
			alt=""
			aria-hidden="true"
		>
		<span class="shell-header-brand__wordmark">
			<span class="shell-header-brand__wordmark-top">{{ brandWordmarkTopLabel }}</span>
			<span class="shell-header-brand__wordmark-bottom">{{ brandWordmarkBottomLabel }}</span>
		</span>
	</NuxtLink>
</template>

<style scoped>
.shell-header-brand {
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-25 );
	flex: 0 0 auto;
	min-inline-size: 0;
	color: var( --color-base );
	text-decoration: none;
}

.shell-header-brand__mark {
	display: block;
	inline-size: 2rem;
	block-size: 2rem;
	flex-shrink: 0;
}

.shell-header-brand__wordmark {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-inline-size: 0;
	white-space: nowrap;
	font-family: var( --font-family-brand-wordmark );
}

.shell-header-brand__wordmark-top {
	font-size: 0.875rem;
	font-weight: 700;
	line-height: 0.875rem;
	letter-spacing: 0.02em;
}

.shell-header-brand__wordmark-bottom {
	font-size: 1rem;
	font-weight: 800;
	line-height: 1rem;
	letter-spacing: 0.01em;
}
</style>
