<script setup lang="ts">
import { CdxTab, CdxTabs } from '@wikimedia/codex'
import type { PropType, VNode } from 'vue'

interface CodeTabRegistration {
	name: string
	label: string
	content: () => VNode[]
}

const tabs = ref<CodeTabRegistration[]>( [] )

/**
 * Derives a stable, URL-safe tab `name` from a visible label.
 *
 * @param {string} label - Visible tab label from Markdown
 * @returns {string} Base tab name for {@link CdxTab}
 */
function deriveTabName( label: string ): string {
	const slug = label
		.trim()
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-+|-+$/g, '' )

	return slug.length > 0 ? slug : 'tab'
}

/**
 * Registers a code tab panel from a child {@link CodeTab}.
 *
 * @param {{ label: string, content: () => VNode[] }} registration - Tab label and panel render function
 */
function registerTab( registration: {
	label: string
	content: () => VNode[]
} ) {
	if ( tabs.value.some( ( existingTab ) => existingTab.label === registration.label ) ) {
		return
	}

	const baseName = deriveTabName( registration.label )
	let name = baseName
	let suffix = 2

	while ( tabs.value.some( ( existingTab ) => existingTab.name === name ) ) {
		name = `${ baseName }-${ suffix }`
		suffix += 1
	}

	tabs.value.push( {
		name,
		label: registration.label,
		content: registration.content
	} )
}

/**
 * Renders slot content captured from a {@link CodeTab} child inside a {@link CdxTab} panel.
 */
const CodeTabPanel = defineComponent( {
	name: 'CodeTabPanel',
	props: {
		render: {
			type: Function as PropType<() => VNode[]>,
			required: true
		}
	},
	setup( props ) {
		return () => props.render()
	}
} )

provide( 'code-tabs:register', registerTab )
</script>

<template>
	<div class="code-tabs">
		<!-- Mount CodeTab children so they register during setup (SSR-safe). -->
		<div class="code-tabs__registry" hidden>
			<slot />
		</div>
		<CdxTabs
			v-if="tabs.length > 0"
			framed
			class="code-tabs__tabs"
		>
			<CdxTab
				v-for="tab in tabs"
				:key="tab.name"
				:name="tab.name"
				:label="tab.label"
			>
				<CodeTabPanel :render="tab.content" />
			</CdxTab>
		</CdxTabs>
	</div>
</template>

<style scoped>
/*
 * Block spacing around the module matches other content components (e.g. Callout).
 * Internal spacing follows Codex framed tabs — header metrics are owned by CdxTabs.
 */
.code-tabs {
	margin-block: var( --spacing-100 );
}

/*
 * Framed tabs are meant to sit inside a bordered module (Codex Tabs docs).
 * Do not override .cdx-tabs__list__item padding/margins — those come from Codex.
 */
.code-tabs :deep( .cdx-tabs--framed ) {
	border: 1px solid var( --border-color-muted );
	/* Codex tabs use 2px corner radius on tab labels */
	border-radius: 2px;
	overflow: hidden;
	background-color: var( --background-color-base );
}

.code-tabs :deep( .cdx-tabs--framed .cdx-tabs__content ) {
	background-color: var( --background-color-base );
}

/*
 * Tab panels hold code blocks only — drop default prose block margins so the
 * white content area connects cleanly to the selected framed tab label.
 */
.code-tabs :deep( .cdx-tab > *:first-child ) {
	margin-block-start: 0;
}

.code-tabs :deep( .cdx-tab > *:last-child ) {
	margin-block-end: 0;
}

.code-tabs :deep( .cdx-tab pre ) {
	margin: 0;
	border-radius: 0;
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-75 );
}
</style>
