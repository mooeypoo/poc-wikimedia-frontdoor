<script setup lang="ts">
import { CdxMessage, CdxToggleSwitch } from '@wikimedia/codex'
import { computed, onMounted, ref, watch } from 'vue'
import {
	getTestWikiUrlForWikiInstance,
	hasTestWikiForWikiInstance
} from '../../../../config/wikiInstanceTestWikis'
import { activeExplorerWikiInstanceId } from '../../../utils/explorerWikiInstanceContext'
import { isTestWikiEnabledForWriteRequests } from '../../../utils/explorerScalarWriteRequestContext'
import { findOpenScalarClientModal } from '../../../utils/findOpenScalarClientModal'
import { getInterfaceMessageTemplate, splitMessageAtFirstPositionalParameter } from '../../../utils/getInterfaceMessageTemplate'
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

const resolvedTestWikiUrl = computed( () => {
	return props.testWikiUrl
		?? getTestWikiUrlForWikiInstance( activeExplorerWikiInstanceId.value )
} )

const hasMappedTestWiki = computed( () => {
	return hasTestWikiForWikiInstance( activeExplorerWikiInstanceId.value )
} )

const toggleLabelSegments = computed( () => {
	const messageTemplate = getInterfaceMessageTemplate( 'explorer-scalar-write-test-wiki-toggle-label' )

	return splitMessageAtFirstPositionalParameter( messageTemplate )
} )

const toggleDescription = computed( () => {
	return getInterfaceMessageTemplate( 'explorer-scalar-write-test-wiki-toggle-description' )
} )

const warningMessageSegments = computed( () => {
	const messageTemplate = getInterfaceMessageTemplate( 'explorer-scalar-write-endpoint-warning' )

	return splitMessageAtFirstPositionalParameter( messageTemplate )
} )

const shouldShowWriteControls = computed( () => {
	return isWriteHttpMethod( resolvedHttpMethod.value ) && hasMappedTestWiki.value
} )

const shouldShowTestWikiToggle = computed( () => {
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
			:data-front-door-scalar-write-warning="slotKey"
		>
			<div
				v-if="shouldShowTestWikiToggle"
				class="scalar-client-write-endpoint-controls__toggle-row"
			>
				<div class="scalar-client-write-endpoint-controls__toggle-header">
					<p class="scalar-client-write-endpoint-controls__toggle-label">
						{{ toggleLabelSegments.beforeParameter }}<strong><bdi dir="ltr">{{ resolvedTestWikiUrl }}</bdi></strong>{{ toggleLabelSegments.afterParameter }}
					</p>
					<CdxToggleSwitch
						v-model="isTestWikiEnabledForWriteRequests"
						class="scalar-client-write-endpoint-controls__toggle-switch"
					/>
				</div>
				<p class="scalar-client-write-endpoint-controls__toggle-description">
					{{ toggleDescription }}
				</p>
			</div>

			<div
				v-if="shouldShowProductionWarning"
				class="scalar-client-write-endpoint-warning"
			>
				<CdxMessage type="warning">
					{{ warningMessageSegments.beforeParameter }}<bdi dir="ltr">{{ resolvedTestWikiUrl }}</bdi>{{ warningMessageSegments.afterParameter }}
				</CdxMessage>
			</div>
		</div>
	</div>
</template>

<style scoped>
.scalar-client-write-endpoint-controls {
	margin-block: var( --spacing-100 );
	margin-inline: var( --spacing-100 );
}

.scalar-client-write-endpoint-controls__toggle-row {
	display: grid;
	gap: var( --spacing-25 );
}

.scalar-client-write-endpoint-controls__toggle-header {
	display: flex;
	align-items: center;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.scalar-client-write-endpoint-controls__toggle-label,
.scalar-client-write-endpoint-controls__toggle-description {
	margin: 0;
}

.scalar-client-write-endpoint-controls__toggle-label {
	color: var( --color-base );
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	min-inline-size: 0;
}

.scalar-client-write-endpoint-controls__toggle-description {
	color: var( --color-subtle );
	font-size: var( --font-size-small );
	line-height: var( --line-height-small );
}

.scalar-client-write-endpoint-controls__toggle-switch {
	flex: 0 0 auto;
}

.scalar-client-write-endpoint-warning {
	margin-block-start: var( --spacing-100 );
}
</style>
