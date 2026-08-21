<script setup lang="ts">
/**
 * Static reference page for one REST API module.
 *
 * Tier 1 of docs/adr-static-module-documentation.md: module identity, where it
 * is deployed, and one heading per operation carrying the canonical anchor from
 * `buildOperationAnchor`. Tier 2 deepens these same headings with descriptions,
 * parameters and responses — same route, same anchors, same URLs (§6), so
 * nothing published here has to change.
 *
 * The projection is built server-side (`/api/reference/…`) so spec JSON never
 * reaches the client bundle and the prerendered payload carries prose rather
 * than schema structure.
 */
import { CdxInfoChip } from '@wikimedia/codex'
import { moduleNameToReferenceSlug } from '../../../config/referenceRoutes'

const route = useRoute()

const moduleSlug = computed( () => {
	const routeModule = route.params.module
	if ( Array.isArray( routeModule ) ) {
		return routeModule.filter( Boolean ).join( '/' )
	}
	return typeof routeModule === 'string' ? routeModule : ''
} )

const { data: referencePage } = await useAsyncData(
	() => `reference-${ moduleSlug.value }`,
	() => $fetch( `/api/reference/${ moduleSlug.value }` ),
	{ watch: [ moduleSlug ] }
)

if ( !referencePage.value ) {
	throw createError( {
		statusCode: 404,
		statusMessage: 'Module not found',
		fatal: true
	} )
}

const { $bananaI18n } = useNuxtApp()

/**
 * Verbatim OpenAPI spec URL for this module.
 *
 * Locale-independent — the spec is one document, not a per-locale surface.
 */
const specUrl = computed( () => {
	const moduleName = referencePage.value?.moduleName
	return moduleName ? `/openapi/${ moduleNameToReferenceSlug( moduleName ) }.json` : ''
} )

useHead( {
	title: () => referencePage.value?.title ?? ''
} )
</script>

<template>
	<article
		v-if="referencePage"
		class="fd-reference"
	>
		<header class="fd-reference__header">
			<p class="fd-reference__eyebrow">
				{{ $bananaI18n( 'reference-eyebrow' ) }}
			</p>
			<h1 class="fd-reference__title">
				<bdi>{{ referencePage.title }}</bdi>
			</h1>
			<p class="fd-reference__identity">
				<code><bdi>{{ referencePage.moduleName }}</bdi></code>
				<CdxInfoChip v-if="referencePage.specVersion">
					<bdi>{{ referencePage.specVersion }}</bdi>
				</CdxInfoChip>
			</p>
			<p
				v-if="referencePage.description"
				class="fd-reference__description"
			>
				<bdi>{{ referencePage.description }}</bdi>
			</p>
			<p class="fd-reference__machine">
				<a :href="specUrl">{{ $bananaI18n( 'reference-openapi-link' ) }}</a>
			</p>
		</header>

		<section class="fd-reference__section">
			<h2>{{ $bananaI18n( 'reference-availability-heading' ) }}</h2>
			<p>
				{{ $bananaI18n( 'reference-availability-count', {
					$1: String( referencePage.instances.total )
				} ) }}
			</p>
			<ul class="fd-reference__families">
				<li
					v-for="family in referencePage.instances.families"
					:key="family.family"
				>
					<bdi>{{ family.family }}</bdi> — {{ family.count }}
				</li>
			</ul>
			<p
				v-if="referencePage.instances.examples.length"
				class="fd-reference__examples"
			>
				{{ $bananaI18n( 'reference-availability-examples' ) }}
				<template
					v-for="( example, index ) in referencePage.instances.examples"
					:key="example.id"
				>
					<bdi>{{ example.displayName }}</bdi>{{ index < referencePage.instances.examples.length - 1 ? ', ' : '' }}
				</template>
			</p>
		</section>

		<section class="fd-reference__section">
			<h2>{{ $bananaI18n( 'reference-operations-heading' ) }}</h2>
			<p v-if="!referencePage.operations.length">
				{{ $bananaI18n( 'reference-operations-empty' ) }}
			</p>
			<!--
				Explicit heading ids in the canonical anchor format. Never let a
				slugger derive these: github-slugger deduplicates by appending
				`-1`/`-2`, which is document-order dependent and would silently
				change published anchors (ADR §4).
			-->
			<div
				v-for="operation in referencePage.operations"
				:key="operation.anchor"
				class="fd-reference__operation"
			>
				<h3
					:id="operation.anchor"
					class="fd-reference__operation-heading"
				>
					<span class="fd-reference__method">{{ operation.method }}</span>
					<code><bdi>{{ operation.path }}</bdi></code>
				</h3>
				<p
					v-if="operation.summary"
					class="fd-reference__operation-summary"
				>
					<bdi>{{ operation.summary }}</bdi>
				</p>
			</div>
		</section>
	</article>
</template>

<style scoped>
/* Logical properties only — the shell flips direction per interface locale. */
.fd-reference {
	max-inline-size: 48rem;
	padding-block: var( --spacing-150 );
}

.fd-reference__eyebrow {
	margin-block: 0 var( --spacing-25 );
	color: var( --color-subtle );
	font-size: var( --font-size-small );
	text-transform: uppercase;
	letter-spacing: 0.06em;
}

.fd-reference__title {
	margin-block: 0 var( --spacing-50 );
}

.fd-reference__identity {
	display: flex;
	flex-wrap: wrap;
	gap: var( --spacing-50 );
	align-items: center;
	margin-block: 0 var( --spacing-75 );
}

.fd-reference__description {
	margin-block: 0;
	color: var( --color-subtle );
}

.fd-reference__machine {
	margin-block: var( --spacing-50 ) 0;
	font-size: var( --font-size-small );
}

.fd-reference__section {
	margin-block-start: var( --spacing-200 );
}

.fd-reference__families {
	display: flex;
	flex-wrap: wrap;
	gap: var( --spacing-25 ) var( --spacing-100 );
	margin-block: var( --spacing-50 );
	padding-inline-start: 0;
	list-style: none;
}

.fd-reference__examples {
	color: var( --color-subtle );
}

.fd-reference__operation {
	padding-block: var( --spacing-75 );
	border-block-start: 1px solid var( --border-color-subtle );
}

.fd-reference__operation-heading {
	display: flex;
	flex-wrap: wrap;
	gap: var( --spacing-50 );
	align-items: baseline;
	margin-block: 0 var( --spacing-25 );
}

.fd-reference__method {
	font-size: var( --font-size-small );
	font-weight: bold;
	color: var( --color-progressive );
}

.fd-reference__operation-summary {
	margin-block: 0;
	color: var( --color-subtle );
}
</style>
