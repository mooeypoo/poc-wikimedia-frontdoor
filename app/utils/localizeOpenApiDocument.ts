import heOpenApiStringMap from '../../config/fixtures/openApiDocumentLocaleMap.he.json'
import { shouldLocalizeOpenApiDocumentForInterfaceLocale } from '../../config/explorerOpenApiInterfaceLocale'

type JsonValue = null | boolean | number | string | JsonValue[] | { [ key: string ]: JsonValue }

/** OpenAPI prose field names rewritten for the design-locale overlay. */
const OPENAPI_PROSE_KEYS = new Set( [ 'summary', 'description', 'title' ] )

/** Unicode FIRST STRONG ISOLATE — RTL prose inside Scalar's pinned-LTR embed. */
const FIRST_STRONG_ISOLATE = '⁨'

/** Unicode POP DIRECTIONAL ISOLATE — closes the FSI run. */
const POP_DIRECTIONAL_ISOLATE = '⁩'

/**
 * Isolates a localized OpenAPI prose string for an LTR Scalar embed.
 *
 * @param value - Localized prose.
 * @returns Value wrapped in FSI…PDI.
 */
function isolateOpenApiProse( value: string ): string {
	return `${ FIRST_STRONG_ISOLATE }${ value }${ POP_DIRECTIONAL_ISOLATE }`
}

/**
 * Builds an English→locale string map from a fixture JSON file.
 *
 * @param catalogue - Parsed fixture (may include `@metadata`).
 * @returns Map of English source strings to localized strings.
 */
function stringMapFromCatalogue( catalogue: Record<string, unknown> ): Map<string, string> {
	const map = new Map<string, string>()
	for ( const [ key, value ] of Object.entries( catalogue ) ) {
		if ( key === '@metadata' || typeof value !== 'string' ) {
			continue
		}
		map.set( key, value )
	}
	return map
}

const HEBREW_OPENAPI_STRING_MAP = stringMapFromCatalogue(
	heOpenApiStringMap as Record<string, unknown>
)

/**
 * Returns the OpenAPI prose map for an interface locale, if one exists.
 *
 * @param localeCode - Short interface locale code.
 * @returns String map, or null when the locale has no document overlay.
 */
function openApiStringMapForLocale( localeCode: string ): Map<string, string> | null {
	if ( localeCode === 'he' ) {
		return HEBREW_OPENAPI_STRING_MAP
	}
	return null
}

/**
 * Deep-clones an OpenAPI document and rewrites prose fields via a string map.
 *
 * Only `summary`, `description`, and `title` string values are candidates.
 * Unmapped English strings are left unchanged so partially covered modules still
 * render. Used on `design-scalar-mirroring` so interface-locale Hebrew can show
 * RTL document text inside Scalar's pinned-LTR layout.
 *
 * @param openApiDocument - Parsed OpenAPI document (JSON object).
 * @param localeCode - Interface locale requesting localization.
 * @returns Localized clone, or the original reference when no overlay applies.
 */
export function localizeOpenApiDocumentForInterfaceLocale(
	openApiDocument: Record<string, unknown>,
	localeCode: string
): Record<string, unknown> {
	if ( !shouldLocalizeOpenApiDocumentForInterfaceLocale( localeCode ) ) {
		return openApiDocument
	}

	const stringMap = openApiStringMapForLocale( localeCode )
	if ( !stringMap || stringMap.size === 0 ) {
		return openApiDocument
	}

	return rewriteProseFields(
		structuredClone( openApiDocument ) as JsonValue,
		stringMap
	) as Record<string, unknown>
}

/**
 * Recursively rewrites OpenAPI prose string fields using an exact-match map.
 *
 * @param value - Current JSON node.
 * @param stringMap - English→localized string map.
 * @returns Rewritten node.
 */
function rewriteProseFields( value: JsonValue, stringMap: Map<string, string> ): JsonValue {
	if ( Array.isArray( value ) ) {
		return value.map( ( entry ) => rewriteProseFields( entry, stringMap ) )
	}

	if ( value === null || typeof value !== 'object' ) {
		return value
	}

	const result: { [ key: string ]: JsonValue } = {}
	for ( const [ key, child ] of Object.entries( value ) ) {
		if (
			OPENAPI_PROSE_KEYS.has( key ) &&
			typeof child === 'string' &&
			stringMap.has( child )
		) {
			result[ key ] = isolateOpenApiProse( stringMap.get( child ) as string )
			continue
		}
		result[ key ] = rewriteProseFields( child, stringMap )
	}
	return result
}
