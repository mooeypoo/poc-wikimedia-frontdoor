/**
 * Resolves the active primary-navigation breadcrumb without inventing a fallback.
 *
 * Routes outside the primary information architecture, including the landing
 * page and account page, intentionally return an empty label.
 *
 * @param mainNavigationLinks - Available primary-navigation links.
 * @param activeNavigationId - Active primary-navigation id, or an empty string.
 * @returns The active link label, or an empty string when no primary item is active.
 */
export function resolvePrimaryNavigationBreadcrumbLabel(
	mainNavigationLinks: readonly { id: string, label: string }[],
	activeNavigationId: string
): string {
	return mainNavigationLinks.find(
		( navigationLink ) => navigationLink.id === activeNavigationId
	)?.label ?? ''
}
