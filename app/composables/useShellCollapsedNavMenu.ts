import type { Ref } from 'vue'

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
 * @returns {{
 *   isCollapsedNavMenuOpen: import('vue').Ref<boolean>,
 *   collapsedNavMenuView: import('vue').Ref<ShellCollapsedNavMenuView>,
 *   openCollapsedNavMenu: () => void,
 *   closeCollapsedNavMenu: () => void,
 *   toggleCollapsedNavMenu: () => void,
 *   showCollapsedNavMenuPrimaryView: () => void,
 *   showCollapsedNavMenuSectionView: () => void
 * }} Overlay open flag, view level, and open / close / back actions.
 */
export function useShellCollapsedNavMenu( options: {
	isNavigationCollapsed: Ref<boolean>
	hasSectionNavigation: Ref<boolean>
} ) {
	const isCollapsedNavMenuOpen = ref( false )
	const collapsedNavMenuView = ref<ShellCollapsedNavMenuView>( 'section' )

	const route = useRoute()

	/**
	 * Opens the overlay, resetting the view to section or primary as appropriate.
	 */
	function openCollapsedNavMenu(): void {
		collapsedNavMenuView.value = options.hasSectionNavigation.value ? 'section' : 'primary'
		isCollapsedNavMenuOpen.value = true
	}

	/**
	 * Closes the overlay and resets the view to section for the next open.
	 */
	function closeCollapsedNavMenu(): void {
		isCollapsedNavMenuOpen.value = false
		collapsedNavMenuView.value = 'section'
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

	/**
	 * Closes the overlay when the Escape key is pressed while it is open.
	 *
	 * @param keyboardEvent - Keydown event from the document listener.
	 */
	function handleCollapsedNavMenuKeydown( keyboardEvent: KeyboardEvent ): void {
		if ( keyboardEvent.key !== 'Escape' || !isCollapsedNavMenuOpen.value ) {
			return
		}

		keyboardEvent.preventDefault()
		closeCollapsedNavMenu()
	}

	watch( () => route.fullPath, () => {
		closeCollapsedNavMenu()
	} )

	watch( options.isNavigationCollapsed, ( isCollapsed ) => {
		if ( !isCollapsed ) {
			closeCollapsedNavMenu()
		}
	} )

	watch( isCollapsedNavMenuOpen, ( isOpen ) => {
		if ( typeof document === 'undefined' ) {
			return
		}

		document.documentElement.classList.toggle( 'shell-collapsed-nav-menu-open', isOpen )
	} )

	onMounted( () => {
		document.addEventListener( 'keydown', handleCollapsedNavMenuKeydown )
	} )

	onUnmounted( () => {
		document.removeEventListener( 'keydown', handleCollapsedNavMenuKeydown )
		document.documentElement.classList.remove( 'shell-collapsed-nav-menu-open' )
	} )

	return {
		isCollapsedNavMenuOpen,
		collapsedNavMenuView,
		openCollapsedNavMenu,
		closeCollapsedNavMenu,
		toggleCollapsedNavMenu,
		showCollapsedNavMenuPrimaryView,
		showCollapsedNavMenuSectionView
	}
}
