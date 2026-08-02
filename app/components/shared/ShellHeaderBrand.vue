<script setup lang="ts">
import { useMainNavigationLinks } from '../../composables/useMainNavigationLinks'

/**
 * Compact header brand lockup — Wikimedia mark (32px SVG) plus two-line wordmark.
 *
 * Rendered in the shell header utility row per Figma Header node 284:11443.
 * Mark: inlined {@link WikimediaLogoMark} (Commons Wikimedia-logo_black.svg with
 * `currentColor`) so light / dark mode follow `--color-base`. Wordmark lines use
 * banana-i18n (`brand-wordmark-wikimedia`, `brand-wordmark-developer-portal`) in
 * Montserrat.
 *
 * **Product exception:** no `:focus` / `:focus-visible` / `:active` outline (and
 * none for router-active classes). Keeps the lockup visually quiet; `aria-label`
 * from `app-title` remains. See `ARCHITECTURE.md` → Codex exceptions (shell) #6
 * and `DESIGN_REQUIREMENTS.md` → Brand logo.
 */
const { homePath } = useMainNavigationLinks()
const { $bananaI18n } = useNuxtApp()

const brandLogoAccessibleLabel = computed( () => $bananaI18n( 'app-title' ) )
const brandWordmarkTopLabel = computed( () => $bananaI18n( 'brand-wordmark-wikimedia' ) )
const brandWordmarkBottomLabel = computed( () => $bananaI18n( 'brand-wordmark-developer-portal' ) )
</script>

<template>
	<NuxtLink
		:to="homePath"
		class="shell-header-brand"
		:aria-label="brandLogoAccessibleLabel"
	>
		<span class="shell-header-brand__mark">
			<SharedWikimediaLogoMark />
		</span>
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

/*
 * Brand lockup: no focus / active outline chrome (product exception — see
 * ARCHITECTURE.md → Codex exceptions (shell chrome) #6). Do not reintroduce a
 * focus ring here without updating DESIGN_REQUIREMENTS.md.
 */
.shell-header-brand:focus,
.shell-header-brand:focus-visible,
.shell-header-brand:active,
.shell-header-brand.router-link-active,
.shell-header-brand.router-link-exact-active {
	outline: none;
}

.shell-header-brand__mark {
	display: block;
	inline-size: 2rem;
	block-size: 2rem;
	flex-shrink: 0;
	color: inherit;
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
