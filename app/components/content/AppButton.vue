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
 * MDC: `::app-button{href="/get-started" label="Get started" size="large" icon-end="arrowNext"}`
 */
const props = withDefaults( defineProps<{
	href: string
	label: string
	/** MDC passes attribute values as strings; accept both for Vue prop validation. */
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

const isInternal = computed( () => {
	return props.href.startsWith( '/' ) && !(
		props.external === true || props.external === '' || props.external === 'true'
	)
} )

const isExternalHttp = computed( () => {
	return !isInternal.value && (
		props.external === true || props.external === '' || props.external === 'true' ||
		/^https?:/i.test( props.href )
	)
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
