<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconArrowNext } from '@wikimedia/codex-icons'
import { LANDING_API_ARTICLE_PREVIEWS } from '../../../config/landingSurfaces'
import LandingArticlePreview from './LandingArticlePreview.vue'

/**
 * Landing “Build and learn with Wikimedia APIs” two-column demo.
 *
 * Left: slotted intro subheading + code block from Markdown. Right: stacked
 * article-preview cards from {@link LANDING_API_ARTICLE_PREVIEWS}. Optional
 * explore CTA uses Codex quiet progressive styling (content label — BiDi).
 *
 * MDC: `:::landing-api-demo{explore-href="/explorer" explore-label="…"}` … `:::`.
 *
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
	margin-block-start: var( --spacing-150 );
}

.landing-api-demo__columns {
	display: grid;
	grid-template-columns: 1fr;
	gap: var( --spacing-200 );
	align-items: end;
	inline-size: 100%;
}

@media ( min-width: 1120px ) {
	.landing-api-demo__columns {
		grid-template-columns: repeat( 2, minmax( 0, 1fr ) );
	}
}

.landing-api-demo__example {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-75 );
	min-inline-size: 0;
}

.landing-api-demo__example :deep( h3 ) {
	margin-block: 0;
	font-size: var( --font-size-large );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-xx-large );
}

.landing-api-demo__example :deep( pre ) {
	margin-block: 0;
	border: var( --border-width-base ) solid var( --border-color-muted );
	border-radius: var( --fd-explorer-controls-surface-border-radius );
	background-color: var( --background-color-base );
}

.landing-api-demo__results {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: var( --spacing-75 );
	min-inline-size: 0;
}

.landing-api-demo__cta {
	display: flex;
	justify-content: flex-start;
}
</style>
