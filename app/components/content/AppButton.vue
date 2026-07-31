<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import {
	cdxIconArrowNext,
	cdxIconLinkExternal,
	type Icon
} from '@wikimedia/codex-icons'

/**
 * Progressive CTA used from Markdown (`::app-button`).
 *
 * Renders as an internal `NuxtLink` or external `<a>` with Codex progressive
 * button chrome (not a nested `CdxButton`, so the control stays a single
 * interactive element). Optional large size and `arrowNext` end icon for the
 * landing hero. Label is a content string (BiDi-isolated).
 *
 * MDC: `::app-button{href="/get-started" label="Get started" size="large" icon-end="arrowNext"}`
 */
const props = withDefaults( defineProps<{
	href: string
	label: string
	/** MDC passes attribute values as strings; accept both for Vue prop validation. */
	external?: boolean | string
	/** Visual size (`medium` default, `large` for landing hero — 44px min block size). */
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

const showExternalIcon = computed( () => {
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

const buttonClass = computed( () => {
	return [
		'app-button',
		'app-button--progressive',
		props.size === 'large' ? 'app-button--large' : null
	]
} )
</script>

<template>
	<NuxtLink
		v-if="isInternal"
		:to="href"
		:class="buttonClass"
	>
		<bdi>{{ label }}</bdi>
		<CdxIcon
			v-if="resolvedEndIcon"
			:icon="resolvedEndIcon"
			size="medium"
			:flip-for-rtl="true"
			class="app-button__end-icon"
		/>
	</NuxtLink>
	<a
		v-else
		:href="href"
		:class="buttonClass"
		:rel="showExternalIcon ? 'noopener noreferrer' : undefined"
		:target="showExternalIcon ? '_blank' : undefined"
	>
		<bdi>{{ label }}</bdi>
		<CdxIcon
			v-if="resolvedEndIcon"
			:icon="resolvedEndIcon"
			size="medium"
			:flip-for-rtl="true"
			class="app-button__end-icon"
		/>
		<CdxIcon
			v-else-if="showExternalIcon"
			:icon="cdxIconLinkExternal"
			size="x-small"
			class="app-button__external-icon"
		/>
	</a>
</template>

<style scoped>
.app-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: var( --spacing-25 );
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-100 );
	border-radius: var( --border-radius-base );
	font-family: inherit;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-small );
	text-decoration: none;
	cursor: pointer;
	transition: background-color 100ms, color 100ms, border-color 100ms;
}

.app-button--large {
	/* Figma large progressive CTA is 44px tall. */
	min-block-size: 2.75rem;
	padding-inline: var( --spacing-100 );
}

.app-button--progressive {
	background-color: var( --background-color-progressive );
	color: var( --color-inverted );
	border: var( --border-width-base ) solid var( --border-color-progressive );
}

.app-button--progressive:hover {
	background-color: var( --background-color-progressive--hover );
	border-color: var( --border-color-progressive--hover );
	color: var( --color-inverted );
	text-decoration: none;
}

.app-button--progressive:active {
	background-color: var( --background-color-progressive--active );
	border-color: var( --border-color-progressive--active );
}

.app-button__end-icon,
.app-button__external-icon {
	color: inherit;
}

.app-button__external-icon {
	margin-inline-start: 0;
}
</style>
