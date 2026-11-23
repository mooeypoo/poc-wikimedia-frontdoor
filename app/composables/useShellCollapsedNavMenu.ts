import type { Ref } from 'vue'
import { ref } from 'vue'
import type { OverlayDismissalRoute } from './useOverlayDismissal.ts'
import { useOverlayDismissal } from './useOverlayDismissal.ts'

/**
 * View level for the collapsed-shell navigation overlay menu.
 *
 * - `section` — start-column section navigation (default when sections exist).
 * - `primary` — top-level primary navigation options (main tabs, including APIs).
 */
export type ShellCollapsedNavMenuView = 'section' | 'primary'

/**
 * Manages open state and drill-down level for the collapsed header navigation overlay.
 *
 * Opens to the section view when the current route has start-column sections;
 * otherwise opens directly to the primary navigation list. Closes on route change,
 * viewport expand (nav uncollapsed), Escape, or explicit `closeCollapsedNavMenu`.
 *
 * @param options - Reactive inputs that affect default view and auto-close behaviour.
 * @param options.isNavigationCollapsed - When false, the overlay closes immediately.
 * @param options.hasSectionNavigation - Whether the route exposes section nav links.
 * @param options.route - Forwarded to {@link useOverlayDismissal}.
 * @returns {{
 *   isCollapsedNavMenuOpen: import('vue').Ref<boolean>,
 *   collapsedNavMenuView: import('vue').Ref<ShellCollapsedNavMenuView>,
 *   openCollapsedNavMenu: () => void,
 *   closeCollapsedNavMenu: () => void,
 *   toggleCollapsedNavMenu: () => void,
 *   showCollapsedNavMenuPrimaryView: () => void
 * }} Overlay open flag, view level, and open / close / back actions.
 */
export function useShellCollapsedNavMenu( options: {
	isNavigationCollapsed: Ref<boolean>
	hasSectionNavigation: Ref<boolean>
	route?: OverlayDismissalRoute
} ) {
	const collapsedNavMenuView = ref<ShellCollapsedNavMenuView>( 'section' )

	/**
	 * Steps back within the overlay to the primary navigation list.
	 */
	function showCollapsedNavMenuPrimaryView(): void {
		collapsedNavMenuView.value = 'primary'
	}

	/**
	 * Returns to the section navigation list within the overlay.
	 */
	function showCollapsedNavMenuSectionView(): void {
		collapsedNavMenuView.value = 'section'
	}

	const {
		isOpen: isCollapsedNavMenuOpen,
		open,
		close: closeCollapsedNavMenu
	} = useOverlayDismissal( {
		isCollapsed: options.isNavigationCollapsed,
		// Every dismissal path resets the view, as the explicit close always did:
		// nothing reads it while closed today, and this way nothing needs to.
		onClose: showCollapsedNavMenuSectionView,
		route: options.route
	} )

	/**
	 * Opens the overlay, resetting the view to section or primary as appropriate.
	 */
	function openCollapsedNavMenu(): void {
		collapsedNavMenuView.value = options.hasSectionNavigation.value ? 'section' : 'primary'
		open()
	}

	/**
	 * Toggles the overlay open or closed.
	 */
	function toggleCollapsedNavMenu(): void {
		if ( isCollapsedNavMenuOpen.value ) {
			closeCollapsedNavMenu()
			return
		}

		openCollapsedNavMenu()
	}

	return {
		isCollapsedNavMenuOpen,
		collapsedNavMenuView,
		openCollapsedNavMenu,
		closeCollapsedNavMenu,
		toggleCollapsedNavMenu,
		showCollapsedNavMenuPrimaryView
	}
}
