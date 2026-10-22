import { reactive, watch } from 'vue'
import type { Ref } from 'vue'
import { shouldLocalizeOpenApiDocumentForInterfaceLocale } from '../../config/explorerOpenApiInterfaceLocale'
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
 * When the interface locale has an OpenAPI document overlay (currently `he` on
 * `design-scalar-mirroring`), fetches the English document from `url`, rewrites
 * prose fields, and feeds Scalar `content` instead — so UI language, not the
 * project language picker, controls document language for that exploration.
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
		url: openApiSpecUrl.value ?? '',
		content: null as Record<string, unknown> | null
	} )

	let documentLoadGeneration = 0

	/**
	 * Applies the active interface locale + spec URL to Scalar config.
	 *
	 * @returns Nothing.
	 */
	async function syncScalarDocumentSource(): Promise<void> {
		const nextOpenApiSpecUrl = openApiSpecUrl.value
		const nextInterfaceLocale = interfaceLocale.value
		const onLoaded = ( slug: string ) => {
			options.onLoaded?.( slug )
		}

		if ( !nextOpenApiSpecUrl ) {
			return
		}

		if ( !shouldLocalizeOpenApiDocumentForInterfaceLocale( nextInterfaceLocale ) ) {
			Object.assign( scalarConfiguration, {
				onLoaded,
				url: nextOpenApiSpecUrl,
				content: null
			} )
			logEvent( 'scalar.config_updated', {
				updateStrategy: 'object_assign',
				specUrl: nextOpenApiSpecUrl,
				documentSource: 'url'
			} )
			return
		}

		const loadGeneration = ++documentLoadGeneration

		try {
			// Same-origin proxy: Wikimedia often rejects browser Origin on localhost
			// (see server/api/discovery.get.ts). Localization runs server-side.
			const localizedDocument = await $fetch<Record<string, unknown>>(
				'/api/explorer-openapi-localized',
				{
					query: {
						url: nextOpenApiSpecUrl,
						locale: nextInterfaceLocale
					}
				}
			)
			if ( loadGeneration !== documentLoadGeneration ) {
				return
			}

			// Prefer `content` over `url` so Scalar does not refetch English.
			Object.assign( scalarConfiguration, {
				onLoaded,
				url: '',
				content: localizedDocument
			} )

			logEvent( 'scalar.config_updated', {
				updateStrategy: 'object_assign',
				specUrl: nextOpenApiSpecUrl,
				documentSource: 'localized_content',
				interfaceLocale: nextInterfaceLocale
			} )
		} catch ( error ) {
			if ( loadGeneration !== documentLoadGeneration ) {
				return
			}

			// Fall back to the English URL so the explorer still loads.
			Object.assign( scalarConfiguration, {
				onLoaded,
				url: nextOpenApiSpecUrl,
				content: null
			} )

			logEvent( 'scalar.config_updated', {
				updateStrategy: 'object_assign',
				specUrl: nextOpenApiSpecUrl,
				documentSource: 'url_fallback',
				interfaceLocale: nextInterfaceLocale,
				error: error instanceof Error ? error.message : String( error )
			} )
		}
	}

	watch(
		[ openApiSpecUrl, interfaceLocale ],
		() => {
			void syncScalarDocumentSource()
		},
		{ immediate: true, flush: 'post' }
	)

	watch( resolvedMode, ( nextResolvedMode ) => {
		Object.assign( scalarConfiguration, {
			darkMode: nextResolvedMode === 'dark'
		} )

		logEvent( 'scalar.config_updated', {
			updateStrategy: 'object_assign',
			darkMode: nextResolvedMode
		} )
	}, { flush: 'post' } )

	// Chrome localization updates independently of the document source.
	watch( interfaceLocale, ( nextInterfaceLocale ) => {
		Object.assign( scalarConfiguration, {
			localization: buildScalarLocalization( nextInterfaceLocale )
		} )

		logEvent( 'scalar.config_updated', {
			updateStrategy: 'object_assign',
			interfaceLocale: nextInterfaceLocale,
			localizationOnly: true
		} )
	}, { flush: 'post' } )

	return {
		scalarConfiguration
	}
}
