<script setup lang="ts">
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconArrowNext, cdxIconLinkExternal } from '@wikimedia/codex-icons'

/**
 * Quiet progressive section CTA with trailing arrow (landing bands).
 *
 * Content label is BiDi-isolated. Internal paths use `NuxtLink`; absolute
 * http(s) URLs open externally with the Codex external icon instead of arrow.
 *
 * MDC: `::landing-section-cta{href="/explorer" label="Explore Wikimedia APIs"}`
 */
const props = defineProps<{
	href: string
	label: string
}>()

const NuxtLink = resolveComponent( 'NuxtLink' )

const isInternal = computed( () => props.href.startsWith( '/' ) )
const isExternalHttp = computed( () => /^https?:/i.test( props.href ) )
</script>

<template>
	<p class="landing-section-cta">
		<component
			:is="isInternal ? NuxtLink : 'a'"
			v-bind="isInternal
				? { to: href }
				: {
					href,
					rel: isExternalHttp ? 'noopener noreferrer' : undefined,
					target: isExternalHttp ? '_blank' : undefined
				}"
			class="fd-landing-page__section-cta"
		>
			<bdi>{{ label }}</bdi>
			<CdxIcon
				v-if="isExternalHttp"
				:icon="cdxIconLinkExternal"
				size="medium"
			/>
			<CdxIcon
				v-else
				:icon="cdxIconArrowNext"
				size="medium"
				:flip-for-rtl="true"
			/>
		</component>
	</p>
</template>

<style scoped>
.landing-section-cta {
	margin-block: var( --spacing-150 ) 0;
}
</style>
