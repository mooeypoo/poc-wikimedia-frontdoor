import { useMainNavigationLinks } from './useMainNavigationLinks'
import { getMainNavigationIdFromPath } from '../utils/contentRoute'

/**
 * Resolves the active primary navigation tab for the shell header.
 *
 * Maps the current route to a main navigation id via `getMainNavigationIdFromPath`.
 * Used with `CdxTabs` quiet tabs in the header chrome row.
 *
 * Routes outside the primary IA (home `/`, `/account`, and other unmatched paths)
 * return an empty string so **no** tab appears selected.
 *
 * @returns {{
 *   mainNavigationLinks: import('vue').ComputedRef<import('./useMainNavigationLinks').MainNavigationLink[]>,
 *   activeNavigationId: import('vue').ComputedRef<string>
 * }} Primary nav links and the tab name matching the current route (or `''`).
 */
export function usePrimaryNavigationTab() {
	const route = useRoute()
	const { mainNavigationLinks } = useMainNavigationLinks()

	const activeNavigationId = computed( () =>
		getMainNavigationIdFromPath( route.path ) ?? ''
	)

	return {
		mainNavigationLinks,
		activeNavigationId
	}
}
