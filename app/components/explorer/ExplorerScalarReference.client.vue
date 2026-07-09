<script setup lang="ts">
import '@scalar/api-reference/style.css'
import '../../assets/css/explorer-codex-overrides.css'
import { ApiReference } from '@scalar/api-reference'
import { CdxInfoChip, CdxToggleSwitch } from '@wikimedia/codex'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { ScalarInterfaceHandle } from '../../composables/useExplorerScalarFocus'
import type { ScalarNavigationEntry } from '../../utils/scalarOperationNavigation'
import { useOAuthSession } from '../../composables/useOAuthSession'
import { useTryItOutWithOAuth } from '../../composables/useTryItOutWithOAuth'

/**
 * ExplorerScalarReference — client-only Scalar ApiReference wrapper.
 *
 * Nuxt loads this module only in the browser so the heavy Scalar bundle does
 * not block the explorer shell. Emits a ready event with Scalar handles needed
 * for operation navigation.
 */
const props = defineProps<{
	configuration: Record<string, unknown>
}>()

const emit = defineEmits<{
	'interface-ready': [ ScalarInterfaceHandle ]
}>()

const { $bananaI18n } = useNuxtApp()
const { isLoggedIn, username } = useOAuthSession()
const { tryItOutWithOAuth } = useTryItOutWithOAuth()

const authBadgeLabel = computed(
	() => $bananaI18n( 'explorer-auth-badge-logged-in', { $1: username.value ?? '' } )
)
const authToggleLabel = computed( () => $bananaI18n( 'explorer-auth-toggle-use-session' ) )

const apiReferenceRef = ref<{
	eventBus?: ScalarInterfaceHandle[ 'eventBus' ]
	workspaceStore?: ScalarInterfaceHandle[ 'workspaceStore' ]
	sidebarItems?: ScalarNavigationEntry[] | { value: ScalarNavigationEntry[] }
} | null>( null )

const activeSpecUrl = computed( () => {
	const spec = props.configuration.spec
	if ( spec && typeof spec === 'object' && 'url' in spec && typeof spec.url === 'string' ) {
		return spec.url
	}

	return ''
} )

/**
 * Normalizes sidebar items exposed by Scalar (plain array or computed ref).
 *
 * @param sidebarItems - Raw sidebar items from ApiReference.
 * @returns Sidebar navigation entries.
 */
function normalizeSidebarItems(
	sidebarItems: ScalarNavigationEntry[] | { value: ScalarNavigationEntry[] } | undefined
): ScalarNavigationEntry[] | undefined {
	if ( !sidebarItems ) {
		return undefined
	}

	if ( Array.isArray( sidebarItems ) ) {
		return sidebarItems
	}

	if ( 'value' in sidebarItems && Array.isArray( sidebarItems.value ) ) {
		return sidebarItems.value
	}

	return undefined
}

/**
 * Notifies the explorer page that Scalar exposes navigation handles.
 *
 * @returns Nothing.
 */
function emitInterfaceReady(): void {
	const apiReferenceInstance = apiReferenceRef.value
	if ( !apiReferenceInstance?.eventBus ) {
		return
	}

	emit( 'interface-ready', {
		eventBus: apiReferenceInstance.eventBus,
		workspaceStore: apiReferenceInstance.workspaceStore,
		sidebarItems: normalizeSidebarItems( apiReferenceInstance.sidebarItems )
	} )
}

watch( apiReferenceRef, () => {
	void nextTick( () => {
		emitInterfaceReady()
	} )
} )

watch( activeSpecUrl, () => {
	void nextTick( () => {
		emitInterfaceReady()
	} )
} )

onMounted( () => {
	void nextTick( () => {
		emitInterfaceReady()
	} )
} )
</script>

<template>
	<div
		class="explorer-scalar-reference__auth-row"
		:class="{ 'explorer-scalar-reference__auth-row--visible': isLoggedIn }"
		aria-live="polite"
	>
		<template v-if="isLoggedIn">
			<CdxInfoChip
				class="explorer-scalar-reference__auth-badge"
				status="notice"
			>
				{{ authBadgeLabel }}
			</CdxInfoChip>
			<CdxToggleSwitch
				v-model="tryItOutWithOAuth"
				class="explorer-scalar-reference__auth-toggle"
			>
				{{ authToggleLabel }}
			</CdxToggleSwitch>
		</template>
	</div>
	<ApiReference
		ref="apiReferenceRef"
		:configuration="configuration"
	/>
</template>

<style scoped>
.explorer-scalar-reference__auth-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: var( --spacing-100 );
}

.explorer-scalar-reference__auth-row--visible {
	padding: var( --spacing-50 ) var( --spacing-100 );
}
</style>
