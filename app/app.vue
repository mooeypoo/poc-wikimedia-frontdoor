<script setup lang="ts">
/**
 * Forces a fresh page instance on each route change (required when leaving `/explorer`).
 *
 * @param route - Active normalized route from Vue Router.
 * @returns Stable key for {@link NuxtPage} to remount page components.
 */
function resolvePageKey( route: { fullPath: string } ): string {
	return route.fullPath
}
</script>

<template>
	<NuxtRouteAnnouncer />
	<NuxtLayout>
		<NuxtPage :page-key="resolvePageKey" />
	</NuxtLayout>
</template>
