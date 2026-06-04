import { SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE } from '../../config/scalarClientWriteWarnings'

/**
 * Builds a plain HTML probe banner (yellow box) for placement testing in the Scalar modal.
 *
 * @param slotKey - Placement identifier for deduplication and visible slot label.
 * @param messageText - Warning copy (banana-i18n).
 * @returns Mount root element containing the probe.
 */
function createPlainHtmlWriteWarningElement(
	slotKey: string,
	messageText: string
): HTMLElement {
	const mountElement = document.createElement( 'div' )
	mountElement.setAttribute( 'data-front-door-scalar-write-warning', slotKey )
	mountElement.className = 'scalar-client-write-endpoint-warning-mount'

	const probeElement = document.createElement( 'div' )
	probeElement.setAttribute( 'role', 'alert' )
	probeElement.className = 'scalar-client-write-endpoint-warning-probe'
	// Inline styles so the probe stays visible even if explorer CSS does not reach the modal tree.
	probeElement.style.cssText = [
		'background-color:#fdf2d5',
		'border:1px solid #ab7f2a',
		'border-radius:2px',
		'color:#202122',
		'font-size:14px',
		'line-height:1.5',
		'padding:12px',
		'position:relative',
		'z-index:9999'
	].join( ';' )

	const slotLabelElement = document.createElement( 'p' )
	slotLabelElement.className = 'scalar-client-write-endpoint-warning-probe__slot'
	slotLabelElement.textContent = `Front Door write warning — slot: ${ slotKey }`

	const messageElement = document.createElement( 'p' )
	messageElement.className = 'scalar-client-write-endpoint-warning-probe__text'
	messageElement.textContent = messageText

	probeElement.append( slotLabelElement, messageElement )
	mountElement.append( probeElement )

	return mountElement
}

/**
 * Builds a Codex-styled warning element for the Scalar API client modal.
 *
 * @param slotKey - Placement identifier for deduplication.
 * @param messageText - Translated warning copy.
 * @returns Mount root element containing the warning.
 */
function createCodexWriteWarningElement(
	slotKey: string,
	messageText: string
): HTMLElement {
	const mountElement = document.createElement( 'div' )
	mountElement.setAttribute( 'data-front-door-scalar-write-warning', slotKey )
	mountElement.className = 'scalar-client-write-endpoint-warning-mount'

	const messageElement = document.createElement( 'div' )
	messageElement.setAttribute( 'role', 'alert' )
	messageElement.className = 'cdx-message cdx-message--warning scalar-client-write-endpoint-warning'

	const iconElement = document.createElement( 'span' )
	iconElement.className = 'cdx-message__icon'
	iconElement.setAttribute( 'aria-hidden', 'true' )

	const contentElement = document.createElement( 'div' )
	contentElement.className = 'cdx-message__content'
	contentElement.textContent = messageText

	messageElement.append( iconElement, contentElement )
	mountElement.append( messageElement )

	return mountElement
}

/**
 * Builds a write-endpoint warning element for DOM injection into the Scalar modal.
 *
 * @param slotKey - Placement identifier for deduplication.
 * @param messageText - Translated warning copy.
 * @returns Mount root element containing the warning.
 */
export function createScalarWriteEndpointWarningElement(
	slotKey: string,
	messageText: string
): HTMLElement {
	if ( SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE ) {
		return createPlainHtmlWriteWarningElement( slotKey, messageText )
	}

	return createCodexWriteWarningElement( slotKey, messageText )
}
