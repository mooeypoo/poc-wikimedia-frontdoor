import { reactive, watch } from 'vue'
import type { Ref } from 'vue'
import { SCALAR_DEFAULT_CONFIGURATION } from '../../config/scalar'
import { useExplorerDiagnostics } from './useExplorerDiagnostics'

interface ScalarConfigOptions {
	onLoaded?: ( slug: string ) => void
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
	const scalarConfiguration = reactive( {
		...SCALAR_DEFAULT_CONFIGURATION,
		onLoaded: ( slug: string ) => {
			options.onLoaded?.( slug )
		},
		spec: {
			url: openApiSpecUrl.value ?? ''
		}
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
	}, { immediate: true } )

	return {
		scalarConfiguration
	}
}
