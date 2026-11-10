<script setup lang="ts">
import { CdxInfoChip, CdxTooltip } from '@wikimedia/codex'
import { useMainNavigationLinks } from '../../composables/useMainNavigationLinks'

/**
 * Compact header brand lockup — Wikimedia mark (32px SVG) plus two-line wordmark,
 * with a label-only warning “Prototype” InfoChip after the lockup (Figma 1238:24310).
 *
 * Rendered in the shell header utility row per Figma Header node 284:11443.
 * Mark: inlined {@link WikimediaLogoMark} (Commons Wikimedia-logo_black.svg with
 * `currentColor`) so light / dark mode follow `--color-base`. Wordmark lines use
 * banana-i18n (`brand-wordmark-wikimedia`, `brand-wordmark-developer-portal`) in
 * Montserrat. Chip label: `brand-prototype-chip-label`. Gap logo → chip is
 * Codex `--spacing-50` (8px). Chip is outside the home link (InfoChip is
 * non-interactive). Status icon hidden — Codex forces icons on `warning`.
 * Hover/focus tooltip via Codex `v-tooltip` (`brand-prototype-chip-tooltip`) on a
 * host `<span>` (directive is more reliable on native elements than on InfoChip).
 *
 * **Product exception:** no `:focus` / `:focus-visible` / `:active` outline (and
 * none for router-active classes) on the home link. Keeps the lockup visually
 * quiet; `aria-label` from `app-title` remains. See `ARCHITECTURE.md` → Codex
 * exceptions (shell) #6 and `DESIGN_REQUIREMENTS.md` → Brand logo.
 */
const { homePath } = useMainNavigationLinks()
const { $bananaI18n } = useNuxtApp()

/** Codex tooltip directive (`v-tooltip`). */
const vTooltip = CdxTooltip

const brandLogoAccessibleLabel = computed( () => $bananaI18n( 'app-title' ) )
const brandWordmarkTopLabel = computed( () => $bananaI18n( 'brand-wordmark-wikimedia' ) )
const brandWordmarkBottomLabel = computed( () => $bananaI18n( 'brand-wordmark-developer-portal' ) )
const brandPrototypeChipLabel = computed( () => $bananaI18n( 'brand-prototype-chip-label' ) )
const brandPrototypeChipTooltipLabel = computed( () =>
	$bananaI18n( 'brand-prototype-chip-tooltip' )
)
</script>

<template>
	<div class="shell-header-brand-group">
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
		<!--
			Label-only warning chip (Figma 1238:24310). Codex forces a status icon
			on warning; hide `.cdx-info-chip__icon--vue` below. Tooltip on host
			<span> per Codex directive guidance (native element trigger).
		-->
		<span
			v-tooltip="brandPrototypeChipTooltipLabel"
			class="shell-header-brand-group__prototype-chip-host"
		>
			<CdxInfoChip
				status="warning"
				class="shell-header-brand-group__prototype-chip"
			>
				{{ brandPrototypeChipLabel }}
			</CdxInfoChip>
		</span>
	</div>
</template>

<style scoped>
/* Mark + wordmark + Prototype chip — gap --spacing-50 (8px) per Figma 1238:24310. */
.shell-header-brand-group {
	display: inline-flex;
	align-items: flex-end;
	gap: var( --spacing-50 );
	flex: 0 0 auto;
	min-inline-size: 0;
}

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

.shell-header-brand-group__prototype-chip-host {
	display: inline-flex;
	flex-shrink: 0;
	min-inline-size: 0;
}

/*
 * Codex forces status icons on warning InfoChips and ignores a null `icon` prop.
 * Header Prototype chip is label-only (same pattern as NavigationCard / explorer
 * audience chips).
 */
.shell-header-brand-group__prototype-chip :deep( .cdx-info-chip__icon--vue ) {
	display: none;
}
</style>
