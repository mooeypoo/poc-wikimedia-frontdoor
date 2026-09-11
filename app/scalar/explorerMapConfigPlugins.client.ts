import { watch } from 'vue'
import type { ComputedRef } from 'vue'
import type { ApiReferenceConfigurationRaw } from '@scalar/types/api-reference'
import type { ClientPlugin } from '@scalar/oas-utils/helpers'
import type { XScalarEnvironment } from '@scalar/workspace-store/schemas/extensions/document/x-scalar-environments'
import { buildRequest, getEnvironmentVariables } from '@scalar/workspace-store/request-example'
import { buildSafeBodyRequest } from '@scalar/helpers/http/can-method-have-body'

/**
 * Maps Scalar configuration callbacks to API client plugins (Scalar default behaviour).
 *
 * Inlined from `@scalar/api-reference` so this replacement module does not import the
 * aliased path and create a circular dependency. Mirrors upstream's own
 * `beforeRequest`/`responseReceived` mapping (`onRequestBuilt` is not carried over;
 * this app never configures it).
 *
 * Write-endpoint warnings are DOM-injected under the address bar
 * ({@link useScalarClientWriteEndpointWarnings}), not via ClientPlugin view slots.
 *
 * @param configuration - Reactive merged Api Reference configuration.
 * @param environment - Reactive active Scalar environment, for variable resolution.
 * @returns Client plugins passed to `createApiClientModal` (request hooks).
 */
export function mapConfigPlugins(
	configuration: ComputedRef<ApiReferenceConfigurationRaw>,
	environment: ComputedRef<XScalarEnvironment>
): ClientPlugin[] {
	const configurationHookPlugin: ClientPlugin = { hooks: {} }

	watch(
		[
			() => configuration.value.onBeforeRequest,
			() => configuration.value.onRequestSent,
			() => environment.value
		],
		( [ onBeforeRequest, onRequestSent, activeEnvironment ] ) => {
			const envVariables = getEnvironmentVariables( activeEnvironment )

			if ( !configurationHookPlugin.hooks ) {
				configurationHookPlugin.hooks = {}
			}

			configurationHookPlugin.hooks.beforeRequest = onBeforeRequest
				? async ( payload ) => {
					const built = buildRequest( payload.requestBuilder, {
						envVariables,
						allowMissingRequestServerBase: true
					} )

					if ( !built.ok ) {
						console.error(
							'[explorerMapConfigPlugins] onBeforeRequest was not run because the request could not be built:',
							built.message ?? built.error
						)
						return
					}

					await onBeforeRequest( {
						request: buildSafeBodyRequest( ...built.data.requestPayload ),
						requestBuilder: payload.requestBuilder,
						envVariables
					} )
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
