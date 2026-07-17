import { useMainNavigationLinks } from './useMainNavigationLinks'
import { getMainNavigationIdFromPath, stripContentLocalePrefix } from '../utils/contentRoute'
import { isExplorerRoutePath } from '../utils/explorerRoute'

/**
 * Resolves the active primary navigation tab for the shell header.
 *
 * Maps the current route to a main navigation id via `getMainNavigationIdFromPath`.
 * Used with `CdxTabs` quiet tabs in the header chrome row.
 *
 * @returns {{
 *   mainNavigationLinks: import('vue').ComputedRef<import('./useMainNavigationLinks').MainNavigationLink[]>,
 *   activeNavigationId: import('vue').ComputedRef<string>
 * }} Primary nav links and the tab name matching the current route.
 */
export function usePrimaryNavigationTab() {
	const route = useRoute()
	const { mainNavigationLinks } = useMainNavigationLinks()

	const activeNavigationId = computed( () => {
		const navigationId = getMainNavigationIdFromPath( route.path )

		if ( navigationId ) {
			return navigationId
		}

		if ( isExplorerRoutePath( route.path ) ) {
			return ''
		}

		// Front page (`/`) is not a tab — no tab is active there.
		if ( stripContentLocalePrefix( route.path ) === '/' ) {
			return ''
		}

		return mainNavigationLinks.value[ 0 ]?.id ?? ''
	} )

	return {
		mainNavigationLinks,
		activeNavigationId
	}
}
