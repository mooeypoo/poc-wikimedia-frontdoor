<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconLinkExternal } from '@wikimedia/codex-icons'

/**
 * External link to Wikimedia Meta-Wiki or MediaWiki documentation (opens in a new tab).
 */
const properties = defineProps<{
	href: string
	accessibleLabel: string
}>()
</script>

<template>
	<a
		class="account-external-meta-link"
		:href="properties.href"
		target="_blank"
		rel="noopener noreferrer"
		:aria-label="properties.accessibleLabel"
	>
		<slot />
		<CdxIcon
			class="account-external-meta-link__icon"
			:icon="cdxIconLinkExternal"
		/>
	</a>
</template>

<style scoped>
.account-external-meta-link {
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-25 );
	color: var( --color-progressive );
	text-decoration: none;
}

.account-external-meta-link:hover {
	text-decoration: underline;
}

.account-external-meta-link:visited {
	color: var( --color-visited );
}

.account-external-meta-link__icon {
	flex-shrink: 0;
	color: var( --color-progressive );
}

.account-external-meta-link:visited .account-external-meta-link__icon {
	color: var( --color-visited );
}
</style>
