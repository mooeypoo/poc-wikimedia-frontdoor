/**
 * Allowlisted Codex icon names for {@link NavigationCard} Markdown / MDC props.
 *
 * MDC attributes are strings — authors pass `top-icon="userGroup"` (or
 * `cdxIconUserGroup`). Vue callers may still pass an {@link Icon} object.
 *
 * Keep this list small and intentional; add names only when a content card needs them.
 */
import {
	cdxIconArticle,
	cdxIconArticles,
	cdxIconBook,
	cdxIconChart,
	cdxIconCode,
	cdxIconDatabase,
	cdxIconDownload,
	cdxIconEdit,
	cdxIconImage,
	cdxIconLightbulb,
	cdxIconLinkExternal,
	cdxIconMap,
	cdxIconRobot,
	cdxIconSearch,
	cdxIconUserGroup,
	type Icon
} from '@wikimedia/codex-icons'

/**
 * Map of short and full Codex icon identifiers to icon objects.
 */
export const NAVIGATION_CARD_ICONS: Record<string, Icon> = {
	article: cdxIconArticle,
	articles: cdxIconArticles,
	book: cdxIconBook,
	chart: cdxIconChart,
	code: cdxIconCode,
	database: cdxIconDatabase,
	download: cdxIconDownload,
	edit: cdxIconEdit,
	image: cdxIconImage,
	lightbulb: cdxIconLightbulb,
	linkExternal: cdxIconLinkExternal,
	map: cdxIconMap,
	robot: cdxIconRobot,
	search: cdxIconSearch,
	userGroup: cdxIconUserGroup,
	cdxIconArticle,
	cdxIconArticles,
	cdxIconBook,
	cdxIconChart,
	cdxIconCode,
	cdxIconDatabase,
	cdxIconDownload,
	cdxIconEdit,
	cdxIconImage,
	cdxIconLightbulb,
	cdxIconLinkExternal,
	cdxIconMap,
	cdxIconRobot,
	cdxIconSearch,
	cdxIconUserGroup
}

/**
 * Resolves a NavigationCard icon prop (Codex {@link Icon} or allowlisted name) to an Icon.
 *
 * @param iconOrName - Icon object from Vue, or allowlisted name string from MDC.
 * @returns Resolved icon, or `undefined` when empty / unknown.
 */
export function resolveNavigationCardIcon(
	iconOrName: Icon | string | undefined
): Icon | undefined {
	if ( iconOrName === undefined || iconOrName === null || iconOrName === '' ) {
		return undefined
	}
	if ( typeof iconOrName !== 'string' ) {
		return iconOrName
	}
	const trimmedName = iconOrName.trim()
	return NAVIGATION_CARD_ICONS[ trimmedName ]
}
