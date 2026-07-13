import { reactive, watch } from 'vue'
import type { Ref } from 'vue'
import { SCALAR_DEFAULT_CONFIGURATION } from '../../config/scalar'
import { useColorMode } from './useColorMode'
import { useExplorerDiagnostics } from './useExplorerDiagnostics'
import { useOAuthSession } from './useOAuthSession'
import { useTryItOutWithOAuth } from './useTryItOutWithOAuth'

interface ScalarConfigOptions {
	onLoaded?: ( slug: string ) => void
}

/**
 * Builds the Scalar `authentication` block for the current session state
 * (docs/adr-wikimedia-oauth-authentication.md §5.5, §10 Step C1).
 *
 * The "off" shape must be written explicitly rather than omitted: Scalar
 * config updates go through `Object.assign`, which merges keys but never
 * deletes them, so clearing a previously injected token requires emitting
 * empty/null values.
 *
 * @param accessToken - Current OAuth bearer token, or null when logged out.
 * @param useOAuthForRequests - Whether the user wants the token applied.
 * @returns Scalar authentication configuration.
 */
function buildAuthenticationConfig( accessToken: string | null, useOAuthForRequests: boolean ) {
	if ( accessToken && useOAuthForRequests ) {
		return {
			preferredSecurityScheme: 'bearerAuth',
			securitySchemes: {
				bearerAuth: { token: accessToken }
			}
		}
	}

	return {
		preferredSecurityScheme: null,
		securitySchemes: {}
	}
}

/**
 * Builds and updates a Scalar configuration object from a reactive spec URL.
 *
 * @param openApiSpecUrl - Reactive OpenAPI spec URL.
 * @param options - Optional callbacks used by Scalar lifecycle hooks.
 * @returns Reactive Scalar configuration.
 */
export function useScalarConfig( openApiSpecUrl: Ref<string | null>, options: ScalarConfigOptions = {} ) {
	const { logEvent } = useExplorerDiagnostics()
	const { accessToken } = useOAuthSession()
	const { tryItOutWithOAuth } = useTryItOutWithOAuth()
	const { resolvedMode } = useColorMode()

	const scalarConfiguration = reactive( {
		...SCALAR_DEFAULT_CONFIGURATION,
		darkMode: resolvedMode.value === 'dark',
		onLoaded: ( slug: string ) => {
			options.onLoaded?.( slug )
		},
		spec: {
			url: openApiSpecUrl.value ?? ''
		},
		authentication: buildAuthenticationConfig( accessToken.value, tryItOutWithOAuth.value )
	} )

	watch( openApiSpecUrl, ( nextOpenApiSpecUrl ) => {
		if ( !nextOpenApiSpecUrl ) {
			return
		}

		// Scalar currently expects in-place config mutation for reactive updates.
		// Replacing the config object reference can miss internal rerender triggers.
		Object.assign( scalarConfiguration, {
			onLoaded: ( slug: string ) => {
				options.onLoaded?.( slug )
			},
			spec: {
				url: nextOpenApiSpecUrl
			}
		} )

		logEvent( 'scalar.config_updated', {
			updateStrategy: 'object_assign',
			specUrl: nextOpenApiSpecUrl
		} )
	}, { immediate: true, flush: 'post' } )

	watch( resolvedMode, ( nextResolvedMode ) => {
		Object.assign( scalarConfiguration, {
			darkMode: nextResolvedMode === 'dark'
		} )

		logEvent( 'scalar.config_updated', {
			updateStrategy: 'object_assign',
			darkMode: nextResolvedMode
		} )
	}, { flush: 'post' } )

	watch( [ accessToken, tryItOutWithOAuth ], ( [ nextAccessToken, nextTryItOutWithOAuth ] ) => {
		Object.assign( scalarConfiguration, {
			authentication: buildAuthenticationConfig( nextAccessToken, nextTryItOutWithOAuth )
		} )

		// Never log the token itself — only whether injection is active.
		logEvent( 'scalar.config_updated', {
			updateStrategy: 'object_assign',
			authentication: nextAccessToken && nextTryItOutWithOAuth ? 'bearer' : 'none'
		} )
	}, { flush: 'post' } )

	return {
		scalarConfiguration
	}
}
