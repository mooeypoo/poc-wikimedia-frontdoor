<script setup lang="ts">
import { CdxMessage } from '@wikimedia/codex'
import { computed, onMounted, ref, watch } from 'vue'
import { getWikiInstanceById } from '../../../../config/instances'
import {
	getTestWikiDisplayNameMessageKey,
	hasTestWikiForWikiInstance
} from '../../../../config/wikiInstanceTestWikis'
import { activeExplorerWikiInstanceId } from '../../../utils/explorerWikiInstanceContext'
import { findOpenScalarClientModal } from '../../../utils/findOpenScalarClientModal'
import { getInterfaceMessageTemplate, splitMessageAtTwoPositionalParameters } from '../../../utils/getInterfaceMessageTemplate'
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

const hasMappedTestWiki = computed( () => {
	return hasTestWikiForWikiInstance( activeExplorerWikiInstanceId.value )
} )

const warningMessageSegments = computed( () => {
	const messageTemplate = getInterfaceMessageTemplate( 'explorer-scalar-write-endpoint-warning' )

	return splitMessageAtTwoPositionalParameters( messageTemplate )
} )

const shouldShowProductionWarning = computed( () => {
	// Address-bar DOM injection only. Ignore legacy ClientPlugin request/response slots
	// (those mount under Response Headers after Send).
	return props.slotKey === 'address-bar'
		&& isWriteHttpMethod( resolvedHttpMethod.value )
		&& hasMappedTestWiki.value
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

/**
 * Placeholder handler for the test-wiki link until test instances are discoverable.
 *
 * @param clickEvent - Click event from the mocked progressive link.
 * @returns Nothing.
 */
function onTestWikiLinkClick( clickEvent: MouseEvent ): void {
	// QUESTION: Wire this to switch the explorer to the mapped test wiki instance
	// (same module + endpoint) once those wikis are available via discovery.
	clickEvent.preventDefault()
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
					{{ warningMessageSegments.beforeFirstParameter }}<bdi>{{ resolvedProductionWikiDisplayName }}</bdi>{{ warningMessageSegments.betweenParameters }}<a
						href="#"
						class="scalar-client-write-endpoint-controls__test-wiki-link"
						@click="onTestWikiLinkClick"
					><bdi>{{ resolvedTestWikiDisplayName }}</bdi></a>{{ warningMessageSegments.afterSecondParameter }}
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

.scalar-client-write-endpoint-controls__test-wiki-link {
	color: var( --color-progressive );
	text-decoration: none;
}

.scalar-client-write-endpoint-controls__test-wiki-link:hover {
	color: var( --color-progressive--hover );
	text-decoration: underline;
}

.scalar-client-write-endpoint-controls__test-wiki-link:active {
	color: var( --color-progressive--active );
}
</style>
