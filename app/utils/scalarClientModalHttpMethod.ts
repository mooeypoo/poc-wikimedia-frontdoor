import { SCALAR_WRITE_HTTP_METHODS } from '../../config/scalarWriteHttpMethods'

const KNOWN_HTTP_METHODS = new Set<string>( [
	'get',
	'head',
	'options',
	'trace',
	...SCALAR_WRITE_HTTP_METHODS
] )

/**
 * Returns whether text looks like an HTTP method verb.
 *
 * @param methodText - Raw text from the address bar badge.
 * @returns True when the text is a known HTTP method.
 */
function isKnownHttpMethodText( methodText: string ): boolean {
	return KNOWN_HTTP_METHODS.has( methodText.trim().toLowerCase() )
}

/**
 * Reads the HTTP method badge from Scalar's v2 address bar.
 *
 * @param modalRoot - Modal dialog root (`.scalar-client[role="dialog"]`) or descendant.
 * @returns Lowercase method when found, otherwise null.
 */
function resolveHttpMethodFromAddressBar( modalRoot: Element ): string | null {
	const addressBar = modalRoot.querySelector( '.scalar-address-bar' )
	if ( !addressBar ) {
		return null
	}

	const methodBadge = addressBar.querySelector(
		'.address-bar-bg-states .flex.gap-1 > div, .address-bar-bg-states .flex.gap-1 button span'
	)
	const methodText = methodBadge?.textContent?.trim().toLowerCase()

	if ( methodText && isKnownHttpMethodText( methodText ) ) {
		return methodText
	}

	return null
}

/**
 * Reads the active HTTP method from a Scalar API client modal address bar.
 *
 * @param modalRoot - Modal dialog root (`.scalar-client[role="dialog"]`) or descendant.
 * @returns Lowercase method when found, otherwise null.
 */
export function resolveHttpMethodFromModalElement( modalRoot: Element | null | undefined ): string | null {
	if ( !modalRoot ) {
		return null
	}

	const methodFromAddressBar = resolveHttpMethodFromAddressBar( modalRoot )
	if ( methodFromAddressBar ) {
		return methodFromAddressBar
	}

	// Legacy Scalar layouts used an <em> in the top container.
	const legacyMethodElement = modalRoot.querySelector( '.t-app__top-container em' )
	const legacyMethodText = legacyMethodElement?.textContent?.trim().toLowerCase()
	if ( legacyMethodText && isKnownHttpMethodText( legacyMethodText ) ) {
		return legacyMethodText
	}

	const httpMethodClassMatch = modalRoot.querySelector( '[class*="http-method"]' )
	const classMatchText = httpMethodClassMatch?.textContent?.trim().toLowerCase()
	if ( classMatchText && isKnownHttpMethodText( classMatchText ) ) {
		return classMatchText
	}

	return null
}
