import type { ExplorerMode } from './useEnterpriseExplorer'

/**
 * SSR-safe singleton for the active explorer mode.
 *
 * Shared between the layout (ExplorerSideNav) and the explorer page so that
 * a mode change in the nav is immediately reflected in the Scalar configuration.
 *
 * @returns Reactive explorerMode ref.
 */
export function useExplorerMode() {
	const explorerMode = useState<ExplorerMode>( 'explorerMode', () => 'community' )
	return { explorerMode }
}
