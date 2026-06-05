import { ref } from 'vue'

/**
 * When true, Scalar write requests are routed to the mapped test wiki for the active instance.
 *
 * Shared between the explorer Scalar config hook and UI injected into the Test Request modal.
 */
export const isTestWikiEnabledForWriteRequests = ref( true )

/**
 * Production server URL captured when a write-request modal opens.
 *
 * Used to restore the address bar when the test-wiki toggle is disabled.
 */
export const cachedProductionServerUrlForWriteRequest = ref<string | null>( null )

/**
 * Optional callback registered by {@link useScalarWriteRequestAddressBarSync}.
 */
export const scheduleScalarWriteRequestAddressBarSync = ref<(() => void) | null>( null )

/**
 * Resets the write-request test wiki preference when a new modal session opens.
 *
 * @returns Nothing.
 */
export function resetScalarWriteRequestTestWikiPreference(): void {
	isTestWikiEnabledForWriteRequests.value = true
	cachedProductionServerUrlForWriteRequest.value = null
}
