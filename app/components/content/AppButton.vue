<script setup lang="ts">
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import {
	cdxIconArrowNext,
	cdxIconLinkExternal,
	type Icon
} from '@wikimedia/codex-icons'

/**
 * Progressive primary CTA used from Markdown (`::app-button`).
 *
 * Renders Codex `CdxButton` (`action="progressive"` `weight="primary"`) so
 * shell prose-link colour rules cannot wash out the label (custom `<a>` chrome
 * lost to `.frontdoor-shell__main a`). Click navigates internally via
 * `navigateTo` or opens external URLs. Label is BiDi-isolated.
 *
 * **Routing:** Path-based `href` values (`/…`) always use in-app `navigateTo`,
 * even when MDC passes a boolean `external` / `external=""` attribute. Only
 * non-path destinations honour `external` or an absolute `http(s):` URL for
 * new-tab behaviour. (Same path-vs-absolute split as {@link LandingSectionCta}.)
 *
 * MDC: `::app-button{href="/get-started" label="Get started" size="large" icon-end="arrowNext"}`
 */
const props = withDefaults( defineProps<{
	href: string
	label: string
	/**
	 * Prefer absolute `http(s):` URLs for off-platform destinations. When set
	 * on a non-path `href`, forces new-tab + external icon. Ignored for `/…`
	 * paths (including MDC empty-string boolean `external=""`).
	 */
	external?: boolean | string
	/** Codex Button size (`medium` default, `large` for landing hero). */
	size?: 'medium' | 'large' | string
	/**
	 * Optional end icon. Allowlisted: `arrowNext`. Empty = no end icon
	 * (external links still show the external glyph when treated as external).
	 */
	iconEnd?: string
}>(), {
	external: false,
	size: 'medium',
	iconEnd: ''
} )

/**
 * True when MDC/Vue marks the CTA as explicitly external.
 *
 * MDC boolean attributes arrive as `""`; treat that like `true` / `"true"`.
 *
 * @returns Whether the `external` prop is set in a truthy MDC-compatible form.
 */
const isExplicitExternalFlag = computed( (): boolean => {
	const flag = props.external
	return flag === true || flag === '' || flag === 'true'
} )

/**
 * True for in-app destinations. Path shape wins over `external` so
 * `::app-button{href="/get-started" external}` still routes via `navigateTo`.
 *
 * @returns Whether `href` is a root-relative Front Door path.
 */
const isInternal = computed( (): boolean => {
	return props.href.startsWith( '/' )
} )

/**
 * True when activation should open a new tab (and show the external glyph
 * unless `iconEnd` overrides). Never true for internal paths.
 *
 * @returns Whether the destination is treated as off-platform HTTP(S).
 */
const isExternalHttp = computed( (): boolean => {
	if ( isInternal.value ) {
		return false
	}
	return isExplicitExternalFlag.value || /^https?:/i.test( props.href )
} )

const resolvedEndIcon = computed( (): Icon | undefined => {
	const iconEndName = props.iconEnd.trim()
	if ( iconEndName === 'arrowNext' || iconEndName === 'cdxIconArrowNext' ) {
		return cdxIconArrowNext
	}
	return undefined
} )

const buttonSize = computed( (): 'medium' | 'large' => {
	return props.size === 'large' ? 'large' : 'medium'
} )

/**
 * Navigates to the configured href (internal router or external window).
 *
 * @returns Promise that resolves when internal navigation finishes.
 */
async function onActivate(): Promise<void> {
	if ( isInternal.value ) {
		await navigateTo( props.href )
		return
	}
	if ( !import.meta.client ) {
		return
	}
	if ( isExternalHttp.value ) {
		window.open( props.href, '_blank', 'noopener,noreferrer' )
		return
	}
	window.location.assign( props.href )
}
</script>

<template>
	<CdxButton
		action="progressive"
		weight="primary"
		:size="buttonSize"
		class="app-button"
		@click="onActivate"
	>
		<bdi>{{ label }}</bdi>
		<CdxIcon
			v-if="resolvedEndIcon"
			:icon="resolvedEndIcon"
			size="medium"
			:flip-for-rtl="true"
		/>
		<CdxIcon
			v-else-if="isExternalHttp"
			:icon="cdxIconLinkExternal"
			size="medium"
		/>
	</CdxButton>
</template>
