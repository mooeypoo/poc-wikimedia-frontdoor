<script setup lang="ts">
import { CdxCheckbox, CdxMessage } from '@wikimedia/codex'
import { computed, onMounted, ref, watch } from 'vue'
import { getWikiInstanceById } from '../../../../config/instances'
import {
	getTestWikiUrlForWikiInstance,
	hasTestWikiForWikiInstance
} from '../../../../config/wikiInstanceTestWikis'
import { activeExplorerWikiInstanceId } from '../../../utils/explorerWikiInstanceContext'
import { isTestWikiEnabledForWriteRequests } from '../../../utils/explorerScalarWriteRequestContext'
import { findOpenScalarClientModal } from '../../../utils/findOpenScalarClientModal'
import { getInterfaceMessageTemplate, splitMessageAtFirstPositionalParameter, splitMessageAtTwoPositionalParameters } from '../../../utils/getInterfaceMessageTemplate'
import { isWriteHttpMethod } from '../../../utils/isWriteHttpMethod'
import { resolveHttpMethodFromModalElement } from '../../../utils/scalarClientModalHttpMethod'

interface OperationShape {
	method?: string
}

const props = defineProps<{
	/** Scalar ClientPlugin slot identifier (for example `components.request`). */
	slotKey: string
	/** Test wiki URL label for the selected explorer instance (wrapped in `<bdi>`). */
	testWikiUrl?: string
	/** HTTP method when mounted via DOM injection (address bar or slot probes). */
	httpMethod?: string
	/** OpenAPI operation; Scalar does not pass `method` on this object — use DOM or `httpMethod`. */
	operation?: OperationShape
}>()

const resolvedHttpMethod = ref( props.httpMethod ?? props.operation?.method ?? '' )

const resolvedProductionWikiDisplayName = computed( () => {
	return getWikiInstanceById( activeExplorerWikiInstanceId.value )?.displayName ?? ''
} )

const resolvedTestWikiUrl = computed( () => {
	return props.testWikiUrl
		?? getTestWikiUrlForWikiInstance( activeExplorerWikiInstanceId.value )
} )

const hasMappedTestWiki = computed( () => {
	return hasTestWikiForWikiInstance( activeExplorerWikiInstanceId.value )
} )

const checkboxLabelSegments = computed( () => {
	const messageTemplate = getInterfaceMessageTemplate( 'explorer-scalar-write-test-wiki-toggle-label' )

	return splitMessageAtFirstPositionalParameter( messageTemplate )
} )

const checkboxDescription = computed( () => {
	return getInterfaceMessageTemplate( 'explorer-scalar-write-test-wiki-toggle-description' )
} )

const warningMessageSegments = computed( () => {
	const messageTemplate = getInterfaceMessageTemplate( 'explorer-scalar-write-endpoint-warning' )

	return splitMessageAtTwoPositionalParameters( messageTemplate )
} )

const shouldShowWriteControls = computed( () => {
	return isWriteHttpMethod( resolvedHttpMethod.value ) && hasMappedTestWiki.value
} )

const shouldShowTestWikiCheckbox = computed( () => {
	return shouldShowWriteControls.value && props.slotKey === 'address-bar'
} )

const shouldShowProductionWarning = computed( () => {
	return shouldShowWriteControls.value && !isTestWikiEnabledForWriteRequests.value
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
	<!-- Host always mounts so ClientPlugin can read the modal before v-if renders. -->
	<div class="scalar-client-write-endpoint-warning-host">
		<div
			v-if="shouldShowWriteControls"
			class="scalar-client-write-endpoint-controls"
			:class="{ 'scalar-client-write-endpoint-controls--address-bar': slotKey === 'address-bar' }"
			:data-front-door-scalar-write-warning="slotKey"
		>
			<CdxCheckbox
				v-if="shouldShowTestWikiCheckbox"
				v-model="isTestWikiEnabledForWriteRequests"
				class="scalar-client-write-endpoint-controls__checkbox"
			>
				<span class="scalar-client-write-endpoint-controls__checkbox-copy">
					<span class="scalar-client-write-endpoint-controls__checkbox-label">
						{{ checkboxLabelSegments.beforeParameter }}<span class="scalar-client-write-endpoint-controls__checkbox-hostname"><bdi dir="ltr">{{ resolvedTestWikiUrl }}</bdi></span>{{ checkboxLabelSegments.afterParameter }}
					</span>
					<span class="scalar-client-write-endpoint-controls__checkbox-description">
						{{ checkboxDescription }}
					</span>
				</span>
			</CdxCheckbox>

			<div
				v-if="shouldShowProductionWarning"
				class="scalar-client-write-endpoint-warning"
			>
				<CdxMessage type="warning">
					{{ warningMessageSegments.beforeFirstParameter }}<bdi>{{ resolvedProductionWikiDisplayName }}</bdi>{{ warningMessageSegments.betweenParameters }}<span class="scalar-client-write-endpoint-controls__warning-hostname"><bdi dir="ltr">{{ resolvedTestWikiUrl }}</bdi></span>{{ warningMessageSegments.afterSecondParameter }}
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

.scalar-client-write-endpoint-controls__checkbox {
	align-items: start;
	min-inline-size: 0;
}

.scalar-client-write-endpoint-controls__checkbox-copy {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-25 );
	min-inline-size: 0;
}

.scalar-client-write-endpoint-controls__checkbox-label,
.scalar-client-write-endpoint-controls__checkbox-description {
	display: block;
	line-height: var( --line-height-small );
}

.scalar-client-write-endpoint-controls__checkbox-label {
	color: var( --color-base );
	font-size: var( --font-size-medium );
}

.scalar-client-write-endpoint-controls__checkbox-hostname,
.scalar-client-write-endpoint-controls__warning-hostname {
	font-family: var( --font-family-monospace-stack );
}

.scalar-client-write-endpoint-controls__checkbox-description {
	color: var( --color-subtle );
	font-size: var( --font-size-medium );
}
</style>
