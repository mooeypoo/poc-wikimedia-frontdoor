<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconLogoWikimedia } from '@wikimedia/codex-icons'

/**
 * Renders a CC BY-SA attribution footer for content adapted from a wiki page.
 * Emitted as an `::attribution` MDC block by scripts/fetch-remote-content.mjs
 * (props arrive kebab-cased from the block, mapped to camelCase here).
 *
 * @see docs/adr-remote-content-fetching.md §9.5
 */
defineProps<{
	sourceUrl: string
	sourceTitle?: string
	sourceWiki?: string
	license?: string
	revision?: string
}>()

const { $bananaI18n } = useNuxtApp()
</script>

<template>
	<aside class="wiki-attribution">
		<CdxIcon :icon="cdxIconLogoWikimedia" size="small" class="wiki-attribution__icon" />
		<span class="wiki-attribution__text">
			{{ $bananaI18n( 'content-attribution-adapted-from' ) }}
			<a
				:href="sourceUrl"
				target="_blank"
				rel="noopener noreferrer"
				class="wiki-attribution__source"
			>{{ sourceTitle || sourceUrl }}</a>
			<template v-if="sourceWiki"> · <bdi>{{ sourceWiki }}</bdi></template>
			<template v-if="license"> · {{ license }}</template>
			<template v-if="revision"> · rev {{ revision }}</template>
		</span>
	</aside>
</template>

<style scoped>
.wiki-attribution {
	display: flex;
	align-items: flex-start;
	gap: var( --spacing-50 );
	margin-block-start: var( --spacing-200 );
	padding-block-start: var( --spacing-100 );
	border-block-start: 1px solid var( --border-color-subtle );
	font-size: var( --font-size-small );
	color: var( --color-subtle );
}

.wiki-attribution__icon {
	flex: 0 0 auto;
	margin-block-start: var( --spacing-12, 2px );
	color: var( --color-subtle );
}

.wiki-attribution__source {
	color: var( --color-progressive );
	text-decoration: none;
}

.wiki-attribution__source:hover {
	text-decoration: underline;
}
</style>
