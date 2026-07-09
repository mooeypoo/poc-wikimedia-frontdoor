<script setup lang="ts">
import '@scalar/api-reference/style.css'
import '../../assets/css/explorer-codex-overrides.css'
import { ApiReference } from '@scalar/api-reference'
import { CdxButton, CdxInfoChip, CdxMessage, CdxToggleSwitch } from '@wikimedia/codex'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
const { isLoggedIn, username, login, logout } = useOAuthSession()
const { tryItOutWithOAuth } = useTryItOutWithOAuth()

const authBadgeLabel = computed(
	() => $bananaI18n( 'explorer-auth-badge-logged-in', { $1: username.value ?? '' } )
)
const authToggleLabel = computed( () => $bananaI18n( 'explorer-auth-toggle-use-session' ) )
const sessionExpiredLabel = computed( () => $bananaI18n( 'explorer-auth-session-expired' ) )
const sessionExpiredLoginLabel = computed( () => $bananaI18n( 'explorer-auth-session-expired-login' ) )

const isSessionExpired = ref( false )

/**
 * Flags the session as expired when a Try-it-out request comes back 401 while
 * the OAuth token is being injected (ADR §10 Step D2).
 *
 * @param eventPayload - `hooks:on:request:complete` payload from Scalar's bus.
 */
function onScalarRequestComplete( eventPayload?: unknown ): void {
	const response = ( eventPayload as { payload?: { response?: Response } } | undefined )?.payload?.response
	if ( response?.status === 401 && isLoggedIn.value && tryItOutWithOAuth.value ) {
		isSessionExpired.value = true
	}
}

/**
 * Clears the expired-session state and restarts the login flow.
 */
function onSessionExpiredLogin(): void {
	isSessionExpired.value = false
	logout()
	login()
}

watch( isLoggedIn, () => {
	isSessionExpired.value = false
} )

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

let unsubscribeRequestComplete: ( () => void ) | null = null

watch( apiReferenceRef, ( apiReferenceInstance ) => {
	unsubscribeRequestComplete?.()
	unsubscribeRequestComplete =
		apiReferenceInstance?.eventBus?.on?.( 'hooks:on:request:complete', onScalarRequestComplete ) ?? null
} )

onBeforeUnmount( () => {
	unsubscribeRequestComplete?.()
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
	<CdxMessage
		v-if="isSessionExpired"
		class="explorer-scalar-reference__session-expired"
		type="warning"
		allow-user-dismiss
		@user-dismissed="isSessionExpired = false"
	>
		{{ sessionExpiredLabel }}
		<CdxButton
			class="explorer-scalar-reference__session-expired-login"
			action="progressive"
			@click="onSessionExpiredLogin"
		>
			{{ sessionExpiredLoginLabel }}
		</CdxButton>
	</CdxMessage>
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

.explorer-scalar-reference__session-expired {
	margin: var( --spacing-50 ) var( --spacing-100 );
}

.explorer-scalar-reference__session-expired-login {
	margin-inline-start: var( --spacing-50 );
}
</style>
