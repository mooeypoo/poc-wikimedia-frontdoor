<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconArrowNext } from '@wikimedia/codex-icons'
import { LANDING_API_ARTICLE_PREVIEWS } from '../../../config/landingSurfaces'
import LandingArticlePreview from './LandingArticlePreview.vue'

/**
 * Landing “Build and learn with Wikimedia APIs” two-column demo.
 *
 * Left: slotted band intro + subheading + `:::code-block` sample from Markdown.
 * Right: Codex {@link CdxCard} article previews from
 * {@link LANDING_API_ARTICLE_PREVIEWS}. At desktop, the results column stretches
 * to the example column height; first/last cards pin to the top/bottom with
 * free space distributed between them (`justify-content: space-between`).
 *
 * MDC: `:::landing-api-demo{explore-href="/explorer" explore-label="…"}` … `:::`.
 *
 * @see CodeBlock.vue
 * @see LandingArticlePreview.vue
 * @see Figma API band 1181:25138
 */
const props = withDefaults( defineProps<{
	/** Locale-aware or absolute path for the Explore CTA. */
	exploreHref?: string
	/** Explore CTA label (content string). */
	exploreLabel?: string
}>(), {
	exploreHref: '/explorer',
	exploreLabel: ''
} )

const NuxtLink = resolveComponent( 'NuxtLink' )

const hasExploreCta = computed( () => {
	return props.exploreHref.trim().length > 0 && props.exploreLabel.trim().length > 0
} )

const isInternalExploreHref = computed( () => {
	return props.exploreHref.startsWith( '/' )
} )
</script>

<template>
	<div class="landing-api-demo">
		<div class="landing-api-demo__columns">
			<div class="landing-api-demo__example">
				<slot />
			</div>
			<div class="landing-api-demo__results">
				<LandingArticlePreview
					v-for="preview in LANDING_API_ARTICLE_PREVIEWS"
					:key="preview.id"
					:title="preview.title"
					:description="preview.description"
					:thumbnail-src="preview.thumbnailSrc"
				/>
			</div>
		</div>
		<div
			v-if="hasExploreCta"
			class="landing-api-demo__cta"
		>
			<component
				:is="isInternalExploreHref ? NuxtLink : 'a'"
				v-bind="isInternalExploreHref
					? { to: exploreHref }
					: { href: exploreHref }"
				class="fd-landing-page__section-cta"
			>
				<bdi>{{ exploreLabel }}</bdi>
				<CdxIcon
					:icon="cdxIconArrowNext"
					size="medium"
					:flip-for-rtl="true"
				/>
			</component>
		</div>
	</div>
</template>

<style scoped>
.landing-api-demo {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-150 );
	inline-size: 100%;
	/* Spacing from section h2 comes from landing-page.css (`--spacing-150`). */
	margin-block-start: 0;
}

.landing-api-demo__columns {
	display: grid;
	grid-template-columns: 1fr;
	gap: var( --spacing-200 );
	align-items: start;
	inline-size: 100%;
}

@media ( min-width: 1120px ) {
	.landing-api-demo__columns {
		grid-template-columns: repeat( 2, minmax( 0, 1fr ) );
		/* Equal column height so results can pin first/last cards to example edges. */
		align-items: stretch;
	}
}

.landing-api-demo__example {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-75 );
	min-inline-size: 0;
}

.landing-api-demo__example :deep( p ) {
	margin-block: 0;
}

.landing-api-demo__example :deep( h3 ) {
	margin-block: 0;
	font-size: var( --font-size-large );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-xx-large );
}

/* CodeBlock owns bordered chrome; flex gap supplies vertical rhythm here. */
.landing-api-demo__example :deep( .code-block ) {
	margin-block: 0;
	inline-size: 100%;
}

.landing-api-demo__results {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-75 );
	min-inline-size: 0;
}

@media ( min-width: 1120px ) {
	.landing-api-demo__results {
		/*
		 * First card top-aligns with `.landing-api-demo__example`; last card
		 * bottom-aligns; remaining space is distributed between cards.
		 */
		justify-content: space-between;
		/* Minimum rhythm when the example column is short. */
		gap: var( --spacing-75 );
		min-block-size: 100%;
	}
}

.landing-api-demo__cta {
	display: flex;
	justify-content: flex-start;
}
</style>
