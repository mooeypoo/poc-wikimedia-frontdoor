<script setup lang="ts">
import { CdxTab, CdxTabs, useSlotContents } from '@wikimedia/codex'
import GitHubSlugger from 'github-slugger'
import type { VNode } from 'vue'

/**
 * One framed panel, derived from a `:::code-tab` child.
 */
interface CodeTabEntry {
	name: string
	label: string
	content: () => VNode[]
}

/**
 * Markdown tabbed code module: Codex {@link CdxTabs} with `framed`, fed by
 * nested `:::code-tab` children (MDC cannot nest `CdxTab` as direct slot
 * children of `CdxTabs`).
 *
 * @see ARCHITECTURE.md → Markdown content pages → Code tabs
 * @see docs/TECH_DECISIONS.md → Framed code tabs
 */
const slots = useSlots()

/**
 * Reads the panel render function off a `:::code-tab` vnode.
 *
 * @param {VNode} vnode - A flattened slot child
 * @returns {?Function} Default-slot render function, or null for other children
 */
function readTabContent( vnode: VNode ): ( () => VNode[] ) | null {
	const content = ( vnode.children as { default?: () => VNode[] } | null )?.default

	return typeof content === 'function' ? content : null
}

/**
 * Derives one framed panel per `:::code-tab` child, in source order.
 *
 * Read off our own slot vnodes rather than letting the children register
 * themselves: a registry fills only when the children mount, which on the
 * client is after this render has run, so the server sent tabs, the client's
 * first render had none, and hydration threw the server's markup away. Matched
 * by shape (a `label` prop over a default slot) rather than by component
 * identity, because MDCRenderer re-wraps what it resolves
 * (MDCRenderer.vue:297-315) and Codex keeps `isComponentVNode` internal.
 *
 * Not a computed, which is how CdxTabs reads its own slot: MDC hands us a raw
 * object slot with no compiled-slot flag, and `updateSlots` mutates those in
 * place without a reactive trigger, so a computed would memoise whichever body
 * this instance saw first.
 *
 * @returns {CodeTabEntry[]} Framed panels for {@link CdxTabs}
 */
function codeTabs(): CodeTabEntry[] {
	const slugger = new GitHubSlugger()
	const entries: CodeTabEntry[] = []

	for ( const node of useSlotContents( slots.default ) ) {
		if ( typeof node === 'string' ) {
			continue
		}

		const label = node.props?.label
		const content = readTabContent( node )

		if ( typeof label !== 'string' || !content ) {
			continue
		}

		// An all-punctuation label slugs to '', which CdxTabs drops as a falsy name.
		entries.push( { name: slugger.slug( label ) || slugger.slug( 'tab' ), label, content } )
	}

	// Usual causes: a `:::code-tab` with no label, no body, or one colon too few.
	if ( entries.length === 0 && import.meta.dev ) {
		console.warn( '[CodeTabs] no :::code-tab children matched — nothing rendered' )
	}

	return entries
}
</script>

<template>
	<div class="code-tabs">
		<CdxTabs
			v-if="codeTabs().length > 0"
			framed
			class="code-tabs__tabs"
		>
			<CdxTab
				v-for="tab in codeTabs()"
				:key="tab.name"
				:name="tab.name"
				:label="tab.label"
			>
				<component :is="tab.content" />
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
 * Panel chrome tokens match {@link CodeBlock} (keep in sync when polishing).
 * Do not override .cdx-tabs__list__item padding/margins — those come from Codex.
 */
.code-tabs :deep( .cdx-tabs--framed ) {
	border: 1px solid var( --border-color-muted );
	/* Exploratory 4px — same token as CodeBlock / NavigationCard / explorer surfaces. */
	border-radius: var( --fd-explorer-controls-surface-border-radius );
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
	margin-block: 0;
	margin-inline: 0;
	border-radius: var( --border-radius-sharp );
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-75 );
}
</style>
