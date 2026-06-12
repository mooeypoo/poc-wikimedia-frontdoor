import { computed } from 'vue'
import type { Ref } from 'vue'
import {
	ENTERPRISE_SPEC_URL,
	ENTERPRISE_FULL_SCALAR_OVERRIDES,
	ENTERPRISE_LIMITED_SCALAR_OVERRIDES
} from '../../config/enterpriseExplorer'

export type ExplorerMode =
	| 'community'
	| 'enterprise-full'
	| 'enterprise-limited'
	| 'enterprise-custom'

/**
 * Returns the spec URL and Scalar config overrides for the active Enterprise mode.
 *
 * @param mode - Reactive Enterprise mode (full or limited).
 * @returns Spec URL and Scalar configuration overrides.
 */
export function useEnterpriseExplorer( mode: Ref<'enterprise-full' | 'enterprise-limited'> ) {
	const specUrl = computed( () => ENTERPRISE_SPEC_URL )

	const scalarOverrides = computed( () =>
		mode.value === 'enterprise-full'
			? ENTERPRISE_FULL_SCALAR_OVERRIDES
			: ENTERPRISE_LIMITED_SCALAR_OVERRIDES
	)

	return { specUrl, scalarOverrides }
}
