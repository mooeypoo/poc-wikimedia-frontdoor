import type { ClientPlugin } from '@scalar/oas-utils/helpers'
import ScalarClientWriteEndpointWarning from '../components/explorer/scalar/ScalarClientWriteEndpointWarning.vue'
import {
	SCALAR_CLIENT_WRITE_ENDPOINT_WARNINGS_ENABLED,
	SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE
} from '../../config/scalarClientWriteWarnings'

/**
 * ClientPlugin view slots available in the Scalar v2 Test Request modal (ApiReference 1.46.4).
 */
export const SCALAR_CLIENT_MODAL_VIEW_SLOTS = {
	requestComponent: 'components.request',
	responseComponent: 'components.response'
} as const

/**
 * Returns {@link ClientPlugin} entries that render write-endpoint warnings in each modal view slot.
 *
 * @returns Client plugins for the Test Request modal, or an empty array when warnings are disabled.
 */
export function getScalarClientWriteEndpointPlugins(): ClientPlugin[] {
	if ( !SCALAR_CLIENT_WRITE_ENDPOINT_WARNINGS_ENABLED || SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE ) {
		return []
	}

	return [
		{
			name: 'front-door-write-endpoint-warning-request',
			components: {
				request: {
					component: ScalarClientWriteEndpointWarning,
					additionalProps: {
						slotKey: SCALAR_CLIENT_MODAL_VIEW_SLOTS.requestComponent
					}
				}
			}
		},
		{
			name: 'front-door-write-endpoint-warning-response',
			components: {
				response: {
					component: ScalarClientWriteEndpointWarning,
					additionalProps: {
						slotKey: SCALAR_CLIENT_MODAL_VIEW_SLOTS.responseComponent
					}
				}
			}
		}
	]
}
