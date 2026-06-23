import { onBeforeUnmount, watch } from 'vue'
import { activeExplorerWikiInstanceId } from '../utils/explorerWikiInstanceContext'
import { isTestWikiEnabledForWriteRequests } from '../utils/explorerScalarWriteRequestContext'
import { isWriteHttpMethod } from '../utils/isWriteHttpMethod'
import { rewriteProductionRequestUrlToTestWiki } from '../utils/rewriteProductionRequestUrlToTestWiki'

interface ScalarBeforeRequestPayload {
	request: Request
}

interface ScalarConfigurationShape {
	onBeforeRequest?: ( payload: ScalarBeforeRequestPayload ) => Promise<ScalarBeforeRequestPayload | void> | ScalarBeforeRequestPayload | void
}

/**
 * Rewrites Scalar write requests to the mapped test wiki when the modal checkbox is checked.
 *
 * @param payload - Scalar before-request hook payload.
 * @returns Updated payload when the request URL changes; otherwise undefined.
 */
async function onScalarWriteRequestBeforeRequest(
	payload: ScalarBeforeRequestPayload
): Promise<ScalarBeforeRequestPayload | void> {
	if ( !isTestWikiEnabledForWriteRequests.value ) {
		return
	}

	if ( !isWriteHttpMethod( payload.request.method ) ) {
		return
	}

	const rewrittenRequestUrl = rewriteProductionRequestUrlToTestWiki(
		payload.request.url,
		activeExplorerWikiInstanceId.value
	)

	if ( rewrittenRequestUrl === payload.request.url ) {
		return
	}

	return {
		request: new Request( rewrittenRequestUrl, payload.request )
	}
}

/**
 * Registers Scalar `onBeforeRequest` so write calls honor the test-wiki checkbox.
 *
 * @param scalarConfiguration - Reactive Scalar configuration from {@link useScalarConfig}.
 * @returns Nothing.
 */
export function useScalarWriteRequestTestWiki(
	scalarConfiguration: ScalarConfigurationShape
): void {
	/**
	 * Applies the before-request hook via in-place config mutation (Scalar constraint).
	 *
	 * @returns Nothing.
	 */
	function applyBeforeRequestHook(): void {
		Object.assign( scalarConfiguration, {
			onBeforeRequest: onScalarWriteRequestBeforeRequest
		} )
	}

	applyBeforeRequestHook()

	const stopPreferenceWatcher = watch( isTestWikiEnabledForWriteRequests, () => {
		applyBeforeRequestHook()
	} )

	onBeforeUnmount( () => {
		stopPreferenceWatcher()
	} )
}
