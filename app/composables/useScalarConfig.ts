import { reactive, watch } from 'vue'
import type { Ref } from 'vue'
import { SCALAR_DEFAULT_CONFIGURATION } from '../../config/scalar'
import { buildScalarLocalization } from '../scalar/scalarLocalization'
import { useColorMode } from './useColorMode'
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
	const { resolvedMode } = useColorMode()
	// The shell's interface locale, shared with app/plugins/banana-i18n.ts.
	const interfaceLocale = useState<string>( 'interfaceLocale', () => 'en' )

	const scalarConfiguration = reactive( {
		...SCALAR_DEFAULT_CONFIGURATION,
		darkMode: resolvedMode.value === 'dark',
		localization: buildScalarLocalization( interfaceLocale.value ),
		onLoaded: ( slug: string ) => {
			options.onLoaded?.( slug )
		},
		url: openApiSpecUrl.value ?? ''
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
			url: nextOpenApiSpecUrl
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

	// Scalar reads its translation table through a reactive getter, so mutating
	// the config in place re-renders the interface without remounting the
	// component or refetching the OpenAPI document. `scalarReferenceKey` on the
	// explorer page deliberately excludes the locale for the same reason.
	watch( interfaceLocale, ( nextInterfaceLocale ) => {
		Object.assign( scalarConfiguration, {
			localization: buildScalarLocalization( nextInterfaceLocale )
		} )

		logEvent( 'scalar.config_updated', {
			updateStrategy: 'object_assign',
			interfaceLocale: nextInterfaceLocale
		} )
	}, { flush: 'post' } )

	return {
		scalarConfiguration
	}
}
