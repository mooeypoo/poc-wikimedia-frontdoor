<script setup lang="ts">
import '@scalar/api-reference/style.css'
import '../../assets/css/explorer-codex-overrides.css'
import { ApiReference } from '@scalar/api-reference'
import { CdxButton, CdxCheckbox, CdxDialog, CdxInfoChip, CdxMessage, CdxToggleSwitch } from '@wikimedia/codex'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ScalarInterfaceHandle } from '../../composables/useExplorerScalarFocus'
import type { ScalarNavigationEntry } from '../../utils/scalarOperationNavigation'
import { useAdvancedAuthPanel } from '../../composables/useAdvancedAuthPanel'
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
const {
	isPanelVisible: isAuthPanelVisible,
	isDialogOpen: isAuthPanelDialogOpen,
	requestReveal: requestAuthPanelReveal,
	confirmReveal: confirmAuthPanelReveal,
	cancelReveal: cancelAuthPanelReveal,
	hidePanel: hideAuthPanel
} = useAdvancedAuthPanel()

const authBadgeLabel = computed(
	() => $bananaI18n( 'explorer-auth-badge-logged-in', { $1: username.value ?? '' } )
)
const authToggleLabel = computed( () => $bananaI18n( 'explorer-auth-toggle-use-session' ) )
const sessionExpiredLabel = computed( () => $bananaI18n( 'explorer-auth-session-expired' ) )
const sessionExpiredLoginLabel = computed( () => $bananaI18n( 'explorer-auth-session-expired-login' ) )
const authPanelToggleLabel = computed( () => $bananaI18n( 'explorer-auth-panel-toggle-label' ) )
const authPanelDialogTitle = computed( () => $bananaI18n( 'explorer-auth-panel-dialog-title' ) )
const authPanelDialogBody = computed( () => $bananaI18n( 'explorer-auth-panel-dialog-body' ) )
const authPanelDialogDontShowAgain = computed(
	() => $bananaI18n( 'explorer-auth-panel-dialog-dont-show-again' )
)
const authPanelDialogCancel = computed( () => $bananaI18n( 'explorer-auth-panel-dialog-cancel' ) )
const authPanelDialogConfirm = computed( () => $bananaI18n( 'explorer-auth-panel-dialog-confirm' ) )

const dontShowAuthPanelWarningAgain = ref( false )

/**
 * v-model target for the "Advanced authentication" toggle. Reads visibility
 * state and delegates writes through the composable — enabling opens the
 * confirmation dialog (unless previously acknowledged), disabling hides
 * immediately with no prompt.
 */
const authPanelToggleModel = computed<boolean>( {
	get: () => isAuthPanelVisible.value,
	set: ( nextValue ) => {
		if ( nextValue ) {
			requestAuthPanelReveal()
		} else {
			hideAuthPanel()
		}
	}
} )

function onAuthPanelDialogConfirm(): void {
	confirmAuthPanelReveal( dontShowAuthPanelWarningAgain.value )
	dontShowAuthPanelWarningAgain.value = false
}

function onAuthPanelDialogCancel(): void {
	cancelAuthPanelReveal()
	dontShowAuthPanelWarningAgain.value = false
}

// Scroll the newly-revealed auth section into view so keyboard/pointer users
// notice the change without hunting for it. Scalar renders the panel via its
// own component tree, so we only need to react to the visibility flip here.
watch( isAuthPanelVisible, ( nextVisible ) => {
	if ( !nextVisible ) {
		return
	}
	void nextTick( () => {
		document.querySelector( '.scalar-reference-intro-auth' )
			?.scrollIntoView( { behavior: 'smooth', block: 'nearest' } )
	} )
} )

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
		class="explorer-scalar-reference__auth-row explorer-scalar-reference__auth-row--visible"
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
		<CdxToggleSwitch
			v-model="authPanelToggleModel"
			class="explorer-scalar-reference__auth-panel-toggle"
		>
			{{ authPanelToggleLabel }}
		</CdxToggleSwitch>
	</div>
	<CdxDialog
		:open="isAuthPanelDialogOpen"
		:title="authPanelDialogTitle"
		:primary-action="{ label: authPanelDialogConfirm, actionType: 'progressive' }"
		:default-action="{ label: authPanelDialogCancel }"
		@update:open="( nextOpen ) => { if ( !nextOpen ) onAuthPanelDialogCancel() }"
		@primary="onAuthPanelDialogConfirm"
		@default="onAuthPanelDialogCancel"
	>
		<p class="explorer-scalar-reference__auth-panel-dialog-body">
			{{ authPanelDialogBody }}
		</p>
		<CdxCheckbox v-model="dontShowAuthPanelWarningAgain">
			{{ authPanelDialogDontShowAgain }}
		</CdxCheckbox>
	</CdxDialog>
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
	<div :class="{ 'explorer-scalar-reference--hide-auth-panel': !isAuthPanelVisible }">
		<ApiReference
			ref="apiReferenceRef"
			:configuration="configuration"
		/>
	</div>
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

.explorer-scalar-reference__auth-panel-toggle {
	margin-inline-start: auto;
}

.explorer-scalar-reference__auth-panel-dialog-body {
	margin-block-end: var( --spacing-100 );
}
</style>
