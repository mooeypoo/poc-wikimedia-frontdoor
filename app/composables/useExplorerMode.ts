import { computed } from 'vue'
import { explorerModeFromPath } from '../utils/explorerRoute'
import type { ExplorerMode } from './useEnterpriseExplorer'

/**
 * Reactive Explorer mode derived from the current route path.
 *
 * The URL is the single source of truth — community lives at `/explorer`,
 * Enterprise modes live at `/explorer/enterprise` and
 * `/explorer/enterprise-limited`. Side-nav navigation is driven by NuxtLink
 * (see `ExplorerSideNav.vue`), so consumers only need to read this mode
 * to react to the active route.
 *
 * @returns The reactive explorer mode.
 */
export function useExplorerMode() {
	const route = useRoute()
	const explorerMode = computed<ExplorerMode>( () => explorerModeFromPath( route.path ) )
	return { explorerMode }
}
