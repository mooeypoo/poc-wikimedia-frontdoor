import { ref, shallowRef } from 'vue'
import type { Ref } from 'vue'

/** URL of the server endpoint that returns the parsed outline JSON. */
const ENTERPRISE_SPEC_PARSED_ENDPOINT = '/api/enterprise-spec-parsed'

/**
 * Tag descriptor as returned by the parsed-spec endpoint.
 *
 * Mirrors the server-side EnterpriseSpecTagOutline type. The wire format is
 * JSON, so this interface is the local view of the contract; the server file
 * (`/server/api/enterprise-spec-parsed.get.ts`) is the source of truth.
 */
export interface EnterpriseSpecTagOutline {
	name: string
	displayName: string
	description?: string
}

/** Operation descriptor as returned by the parsed-spec endpoint. */
export interface EnterpriseSpecOperationOutline {
	operationId?: string
	method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'
	path: string
	summary?: string
	description?: string
}

/** Full payload shape returned by the parsed-spec endpoint. */
export interface EnterpriseSpecOutline {
	tags: EnterpriseSpecTagOutline[]
	operationsByTag: Record<string, EnterpriseSpecOperationOutline[]>
}

/** Reactive return shape of the composable. */
export interface UseEnterpriseSpecOutlineResult {
	tags: Ref<EnterpriseSpecTagOutline[]>
	operationsByTag: Ref<Record<string, EnterpriseSpecOperationOutline[]>>
	isLoading: Ref<boolean>
	hasError: Ref<boolean>
	errorMessage: Ref<string>
}

/**
 * Fetches the parsed Enterprise spec outline from the server proxy and
 * exposes it as reactive state for the custom Enterprise viewer.
 *
 * The component layer never calls `$fetch` directly (AGENTS.md §5); all
 * spec data flows through this composable. Results are not cached across
 * mounts — the endpoint itself is cache-controlled (`max-age=300`).
 *
 * @returns Tags, operations bucketed by tag, and loading/error state.
 */
export function useEnterpriseSpecOutline(): UseEnterpriseSpecOutlineResult {
	const tags = shallowRef<EnterpriseSpecTagOutline[]>( [] )
	const operationsByTag = shallowRef<Record<string, EnterpriseSpecOperationOutline[]>>( {} )
	const isLoading = ref( true )
	const hasError = ref( false )
	const errorMessage = ref( '' )

	void loadOutline()

	/**
	 * Performs the fetch and updates state. Internal; bound to the composable instance.
	 *
	 * @returns Nothing.
	 */
	async function loadOutline(): Promise<void> {
		isLoading.value = true
		hasError.value = false
		errorMessage.value = ''
		try {
			const payload = await $fetch<EnterpriseSpecOutline>( ENTERPRISE_SPEC_PARSED_ENDPOINT )
			tags.value = Array.isArray( payload?.tags ) ? payload.tags : []
			operationsByTag.value =
				payload?.operationsByTag && typeof payload.operationsByTag === 'object'
					? payload.operationsByTag
					: {}
		} catch ( error: unknown ) {
			hasError.value = true
			errorMessage.value = error instanceof Error ? error.message : String( error )
			tags.value = []
			operationsByTag.value = {}
		} finally {
			isLoading.value = false
		}
	}

	return { tags, operationsByTag, isLoading, hasError, errorMessage }
}
