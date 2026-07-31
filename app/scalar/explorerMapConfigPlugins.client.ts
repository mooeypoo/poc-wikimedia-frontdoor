import { watch } from 'vue'
import type { ComputedRef } from 'vue'
import type { ApiReferenceConfigurationRaw } from '@scalar/types/api-reference'
import type { ClientPlugin } from '@scalar/oas-utils/helpers'

/**
 * Maps Scalar configuration callbacks to API client plugins (Scalar default behaviour).
 *
 * Inlined from `@scalar/api-reference` so this replacement module does not import the
 * aliased path and create a circular dependency.
 *
 * Write-endpoint warnings are DOM-injected under the address bar
 * ({@link useScalarClientWriteEndpointWarnings}), not via ClientPlugin view slots.
 *
 * @param configuration - Reactive merged Api Reference configuration.
 * @returns Client plugins passed to `createApiClientModal` (request hooks).
 */
export function mapConfigPlugins(
	configuration: ComputedRef<ApiReferenceConfigurationRaw>
): ClientPlugin[] {
	const configurationHookPlugin: ClientPlugin = { hooks: {} }

	watch(
		[
			() => configuration.value.onBeforeRequest,
			() => configuration.value.onRequestSent
		],
		( [ onBeforeRequest, onRequestSent ] ) => {
			if ( !configurationHookPlugin.hooks ) {
				configurationHookPlugin.hooks = {}
			}

			configurationHookPlugin.hooks.beforeRequest = onBeforeRequest
				? async ( payload ) => {
					const result = await onBeforeRequest( payload )
					if ( result === undefined ) {
						return payload
					}
					return result
				}
				: undefined

			configurationHookPlugin.hooks.responseReceived = onRequestSent
				? ( payload ) => {
					onRequestSent( payload.request.url )
				}
				: undefined
		},
		{ immediate: true }
	)

	return [ configurationHookPlugin ]
}
