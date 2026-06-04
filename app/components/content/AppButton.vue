<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconLinkExternal } from '@wikimedia/codex-icons'

const props = defineProps<{
	href: string
	label: string
	// MDC passes attribute values as strings; accept both for Vue prop validation.
	external?: boolean | string
}>()

const isInternal = computed( () => props.href.startsWith( '/' ) && !props.external )
</script>

<template>
	<NuxtLink v-if="isInternal" :to="href" class="app-button app-button--progressive">
		{{ label }}
	</NuxtLink>
	<a
		v-else
		:href="href"
		class="app-button app-button--progressive"
		:rel="external ? 'noopener noreferrer' : undefined"
	>
		{{ label }}
		<CdxIcon
			v-if="external"
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
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-150 );
	border-radius: var( --border-radius-base );
	font-family: inherit;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-medium );
	text-decoration: none;
	cursor: pointer;
	transition: background-color 100ms, color 100ms, border-color 100ms;
}

.app-button--progressive {
	background-color: var( --background-color-progressive );
	color: var( --color-inverted );
	border: 1px solid var( --border-color-progressive );
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

.app-button__external-icon {
	margin-inline-start: var( --spacing-50 );
}
</style>
