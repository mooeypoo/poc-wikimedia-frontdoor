/**
 * Resolves where to mount write-request controls immediately below the Scalar address bar.
 *
 * @param modalRoot - Open Scalar Test Request modal root.
 * @returns Parent element and sibling before which to insert, or null when the address bar is not mounted yet.
 */
export function resolveScalarClientModalAddressBarWarningPlacement(
	modalRoot: Element
): { parentElement: Element; insertBefore: Element | null } | null {
	const addressBar = modalRoot.querySelector( '.scalar-address-bar' )
	const parentElement = addressBar?.parentElement ?? null

	if ( !addressBar || !parentElement ) {
		return null
	}

	return {
		parentElement,
		insertBefore: addressBar.nextElementSibling
	}
}

/**
 * Moves an existing write-request control mount to sit directly after the address bar.
 *
 * @param modalRoot - Open Scalar Test Request modal root.
 * @param mountElement - Injected warning mount node.
 * @returns True when the mount is already placed or was repositioned.
 */
export function ensureScalarClientModalAddressBarWarningPlacement(
	modalRoot: Element,
	mountElement: Element
): boolean {
	const addressBar = modalRoot.querySelector( '.scalar-address-bar' )
	const parentElement = addressBar?.parentElement

	if ( !addressBar || !parentElement ) {
		return false
	}

	if ( addressBar.nextElementSibling === mountElement ) {
		return true
	}

	parentElement.insertBefore( mountElement, addressBar.nextElementSibling )

	return true
}

/**
 * Aligns write-request control inline-start with the Scalar address bar URL field.
 *
 * Sets `--fd-scalar-address-bar-inline-align-offset` on the mount from layout measurements
 * so checkbox and warning copy line up with the address bar at every viewport width.
 *
 * @param modalRoot - Open Scalar Test Request modal root.
 * @param mountElement - Injected warning mount node.
 * @returns Nothing.
 */
export function syncScalarClientModalAddressBarWarningInlineAlignment(
	modalRoot: Element,
	mountElement: HTMLElement
): void {
	const addressBarField = modalRoot.querySelector( '.scalar-address-bar .address-bar-bg-states' )
		?? modalRoot.querySelector( '.scalar-address-bar' )

	if ( !( addressBarField instanceof HTMLElement ) ) {
		mountElement.style.removeProperty( '--fd-scalar-address-bar-inline-align-offset' )
		return
	}

	const mountRectangle = mountElement.getBoundingClientRect()
	const addressBarFieldRectangle = addressBarField.getBoundingClientRect()
	const isRightToLeft = getComputedStyle( mountElement ).direction === 'rtl'
	const inlineStartOffsetPx = isRightToLeft
		? Math.round( mountRectangle.right - addressBarFieldRectangle.right )
		: Math.round( addressBarFieldRectangle.left - mountRectangle.left )

	mountElement.style.setProperty(
		'--fd-scalar-address-bar-inline-align-offset',
		`${ Math.max( 0, inlineStartOffsetPx ) }px`
	)
}
