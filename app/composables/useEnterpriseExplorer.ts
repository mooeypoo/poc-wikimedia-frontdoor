import { computed } from 'vue'
import {
	ENTERPRISE_SPEC_URL,
	ENTERPRISE_FULL_SCALAR_OVERRIDES
} from '../../config/enterpriseExplorer'

export type ExplorerMode =
	| 'community'
	| 'enterprise-full'
	| 'enterprise-custom'

/**
 * Returns the spec URL and Scalar config overrides for the Scalar-bearing
 * Enterprise mode (`enterprise-full`).
 *
 * `enterprise-custom` renders a non-Scalar viewer and does not flow through
 * this composable; `community` has its own bootstrap path.
 *
 * @returns Spec URL and Scalar configuration overrides.
 */
export function useEnterpriseExplorer() {
	const specUrl = computed( () => ENTERPRISE_SPEC_URL )
	const scalarOverrides = computed( () => ENTERPRISE_FULL_SCALAR_OVERRIDES )

	return { specUrl, scalarOverrides }
}
