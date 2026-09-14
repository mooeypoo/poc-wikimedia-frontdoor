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

/**
 * Which implementation the public Enterprise Explorer entry (`/explorer/enterprise`,
 * internal mode `enterprise-full`) renders.
 *
 * When `true` (current default):
 *  - `/explorer/enterprise` mounts `ExplorerEnterpriseCustom.vue` — the bespoke,
 *    tag-driven viewer that reads the parsed Enterprise spec from
 *    `/api/enterprise-spec-parsed` (same `server/assets/wme-api.yaml` source Scalar used).
 *  - Scalar is not mounted for Enterprise at all, so `ENTERPRISE_FULL_SCALAR_OVERRIDES`
 *    above is unused (retained for rollback only).
 *  - The custom viewer is read-only: no Test Request, no Bearer-token entry, and no
 *    parameter / response / schema sections. See docs/adr-enterprise-explorer-integration.md §7.4.
 *
 * Set to `false` to restore the Scalar-rendered Enterprise experience. Both
 * implementations stay wired; this flag is the only switch.
 */
export const ENTERPRISE_EXPLORER_USE_CUSTOM_VIEWER = true
