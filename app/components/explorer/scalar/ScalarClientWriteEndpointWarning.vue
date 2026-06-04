<script setup lang="ts">
import { CdxMessage } from '@wikimedia/codex'
import { computed, onMounted, ref, watch } from 'vue'
import { getTestWikiUrlForWikiInstance } from '../../../../config/wikiInstanceTestWikis'
import { activeExplorerWikiInstanceId } from '../../../utils/explorerWikiInstanceContext'
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

const warningMessageSegments = computed( () => {
	const messageTemplate = getInterfaceMessageTemplate( 'explorer-scalar-write-endpoint-warning' )

	return splitMessageAtFirstPositionalParameter( messageTemplate )
} )

const shouldShowWarning = computed( () => {
	return isWriteHttpMethod( resolvedHttpMethod.value )
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
			v-if="shouldShowWarning"
			class="scalar-client-write-endpoint-warning"
			:data-front-door-scalar-write-warning="slotKey"
		>
			<CdxMessage type="warning">
				{{ warningMessageSegments.beforeParameter }}<bdi dir="ltr">{{ resolvedTestWikiUrl }}</bdi>{{ warningMessageSegments.afterParameter }}
			</CdxMessage>
		</div>
	</div>
</template>

<style scoped>
.scalar-client-write-endpoint-warning {
	margin-block: var( --spacing-100 );
	margin-inline: var( --spacing-100 );
}
</style>
