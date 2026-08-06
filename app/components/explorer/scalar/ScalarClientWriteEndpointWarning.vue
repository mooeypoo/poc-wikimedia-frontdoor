<script setup lang="ts">
import { CdxMessage } from '@wikimedia/codex'
import { computed, onMounted, ref, watch } from 'vue'
import { getWikiInstanceById } from '../../../../config/instances'
import { getTestWikiDisplayNameMessageKey } from '../../../../config/wikiInstanceTestWikis'
import { activeExplorerWikiInstanceId } from '../../../utils/explorerWikiInstanceContext'
import { findOpenScalarClientModal } from '../../../utils/findOpenScalarClientModal'
import {
	getInterfaceMessageTemplate,
	splitMessageAtFirstPositionalParameter,
	splitMessageAtTwoPositionalParameters
} from '../../../utils/getInterfaceMessageTemplate'
import { isWriteHttpMethod } from '../../../utils/isWriteHttpMethod'
import { resolveHttpMethodFromModalElement } from '../../../utils/scalarClientModalHttpMethod'

interface OperationShape {
	method?: string
}

const props = defineProps<{
	/** Placement identifier for the DOM-injected mount (currently `address-bar` only). */
	slotKey: string
	/** HTTP method when mounted via DOM injection (address bar or slot probes). */
	httpMethod?: string
	/**
	 * Whether the mapped test wiki host appears among Scalar address-bar servers
	 * (OpenAPI `servers`). Drives select-vs-caution warning copy.
	 */
	isTestServerSelectable?: boolean
	/**
	 * Whether the address bar’s active server is already the mapped test wiki.
	 * When true, the production warning is hidden.
	 */
	isActiveServerTestWiki?: boolean
	/** OpenAPI operation; Scalar does not pass `method` on this object — use DOM or `httpMethod`. */
	operation?: OperationShape
}>()

const resolvedHttpMethod = ref( props.httpMethod ?? props.operation?.method ?? '' )

const resolvedProductionWikiDisplayName = computed( () => {
	return getWikiInstanceById( activeExplorerWikiInstanceId.value )?.displayName ?? ''
} )

const resolvedTestWikiDisplayName = computed( () => {
	return getInterfaceMessageTemplate(
		getTestWikiDisplayNameMessageKey( activeExplorerWikiInstanceId.value )
	)
} )

const canSelectTestServer = computed( () => Boolean( props.isTestServerSelectable ) )

const warningMessageWithTestWikiSegments = computed( () => {
	const messageTemplate = getInterfaceMessageTemplate( 'explorer-scalar-write-endpoint-warning' )

	return splitMessageAtTwoPositionalParameters( messageTemplate )
} )

const warningMessageWithoutTestWikiSegments = computed( () => {
	const messageTemplate = getInterfaceMessageTemplate(
		'explorer-scalar-write-endpoint-warning-no-test-wiki'
	)

	return splitMessageAtFirstPositionalParameter( messageTemplate )
} )

const shouldShowProductionWarning = computed( () => {
	// Address-bar DOM injection only. Ignore legacy ClientPlugin request/response slots
	// (those mount under Response Headers after Send). Hide while the active server is
	// already the mapped test wiki — warning returns if the user switches back to production.
	return props.slotKey === 'address-bar'
		&& isWriteHttpMethod( resolvedHttpMethod.value )
		&& !props.isActiveServerTestWiki
} )

/**
 * Resolves the active HTTP method from props or the open modal address bar.
 *
 * @returns Nothing.
 */
function refreshHttpMethodFromModal(): void {
	if ( props.httpMethod ) {
		resolvedHttpMethod.value = props.httpMethod
		return
	}

	const modalRoot = findOpenScalarClientModal()
	resolvedHttpMethod.value = resolveHttpMethodFromModalElement( modalRoot ) ?? ''
}

watch( () => props.httpMethod, () => {
	refreshHttpMethodFromModal()
}, { immediate: true } )

onMounted( () => {
	refreshHttpMethodFromModal()
} )
</script>

<template>
	<div class="scalar-client-write-endpoint-warning-host">
		<div
			v-if="shouldShowProductionWarning"
			class="scalar-client-write-endpoint-controls scalar-client-write-endpoint-controls--address-bar"
		>
			<div class="scalar-client-write-endpoint-warning">
				<CdxMessage type="warning">
					<template v-if="canSelectTestServer">
						{{ warningMessageWithTestWikiSegments.beforeFirstParameter }}<bdi>{{ resolvedProductionWikiDisplayName }}</bdi>{{ warningMessageWithTestWikiSegments.betweenParameters }}<bdi>{{ resolvedTestWikiDisplayName }}</bdi>{{ warningMessageWithTestWikiSegments.afterSecondParameter }}
					</template>
					<template v-else>
						{{ warningMessageWithoutTestWikiSegments.beforeParameter }}<bdi>{{ resolvedProductionWikiDisplayName }}</bdi>{{ warningMessageWithoutTestWikiSegments.afterParameter }}
					</template>
				</CdxMessage>
			</div>
		</div>
	</div>
</template>

<style scoped>
.scalar-client-write-endpoint-controls {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-100 );
	margin-block: var( --spacing-100 );
	margin-inline: var( --spacing-100 );
}

.scalar-client-write-endpoint-controls--address-bar {
	margin: 0;
}
</style>
