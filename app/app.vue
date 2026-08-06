<script setup lang="ts">
import { isExplorerRoutePath, explorerModeFromPath, pathForExplorerMode } from './utils/explorerRoute'

/**
 * Resolves the {@link NuxtPage} remount key for a route.
 *
 * Non-explorer routes key on `fullPath` so the client-only explorer page is torn
 * down when navigating to content routes (see ARCHITECTURE.md → API explorer →
 * Route boundary navigation).
 *
 * Within the explorer, the key is the **mode path** (`/explorer`,
 * `/explorer/enterprise`, `/explorer/enterprise-custom`), not the full path — so a
 * single page instance survives in-app URL updates from deep-linking (quick→direct
 * canonicalization, module/instance/operation changes, fallbacks). Remounting on
 * every such URL write would reset the page's transient state and its deep-link
 * notices before the user sees them. Scalar still remounts via `scalarReferenceKey`,
 * and switching explorer mode (a different mode path) still remounts the page.
 * See docs/adr-explorer-deep-linking.md §7.
 *
 * @param route - Active normalized route from Vue Router.
 * @returns Stable key for {@link NuxtPage} to remount page components.
 */
function resolvePageKey( route: { path: string, fullPath: string } ): string {
	if ( isExplorerRoutePath( route.path ) ) {
		return pathForExplorerMode( explorerModeFromPath( route.path ) )
	}

	return route.fullPath
}
</script>

<template>
	<NuxtRouteAnnouncer />
	<NuxtLayout>
		<NuxtPage :page-key="resolvePageKey" />
	</NuxtLayout>
</template>
