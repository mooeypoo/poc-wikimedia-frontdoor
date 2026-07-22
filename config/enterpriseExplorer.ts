/**
 * Spec URL served by the local server route (`server/api/enterprise-spec.get.ts`),
 * which reads the bundled spec from `server/assets/wme-api.yaml`. Scalar fetches
 * this path directly.
 */
export const ENTERPRISE_SPEC_URL = '/api/enterprise-spec'

/** Scalar overrides for the full Enterprise API Explorer experience. */
export const ENTERPRISE_FULL_SCALAR_OVERRIDES = {
	showSidebar: true
} as const
