import { usePageSectionNav } from './usePageSectionNav'
import { usePrimaryNavigationTab } from './usePrimaryNavigationTab'
import { resolvePrimaryNavigationBreadcrumbLabel } from '../utils/shellNavigationBreadcrumb'

/**
 * Resolves breadcrumb labels for the collapsed shell navigation row.
 *
 * First crumb: active primary navigation tab (including **APIs** on explorer routes);
 * omitted when the route is outside the primary information architecture.
 * Second crumb: active start-column section item, or the first section title when
 * no item is marked active.
 *
 * @returns {{
 *   primaryNavigationBreadcrumbLabel: import('vue').ComputedRef<string>,
 *   sectionNavigationBreadcrumbLabel: import('vue').ComputedRef<string>,
 *   hasSectionNavigationBreadcrumb: import('vue').ComputedRef<boolean>
 * }} Breadcrumb text for `ShellCollapsedNavigation`.
 */
export function useShellNavigationBreadcrumbs() {
	const { mainNavigationLinks, activeNavigationId } = usePrimaryNavigationTab()
	const { navigationSections } = usePageSectionNav()

	const primaryNavigationBreadcrumbLabel = computed( () => {
		return resolvePrimaryNavigationBreadcrumbLabel(
			mainNavigationLinks.value,
			activeNavigationId.value
		)
	} )

	const sectionNavigationBreadcrumbLabel = computed( () => {
		for ( const section of navigationSections.value ) {
			const activeSectionItem = section.items.find( ( item ) => item.isActive )

			if ( activeSectionItem ) {
				return activeSectionItem.label
			}
		}

		return navigationSections.value[ 0 ]?.title ?? ''
	} )

	const hasSectionNavigationBreadcrumb = computed( () => {
		return navigationSections.value.length > 0
			&& sectionNavigationBreadcrumbLabel.value !== ''
	} )

	return {
		primaryNavigationBreadcrumbLabel,
		sectionNavigationBreadcrumbLabel,
		hasSectionNavigationBreadcrumb
	}
}
