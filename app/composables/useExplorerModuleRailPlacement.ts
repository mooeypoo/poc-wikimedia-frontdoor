import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { getMinWidthMediaQuery } from '../utils/codexBreakpointMediaQuery'

export type ExplorerModuleRailLayoutMode = 'end-column' | 'inline'

const EXPLORER_END_PANEL_TELEPORT_TARGET = '#explorer-end-panel'
const EXPLORER_INLINE_RAIL_ANCHOR_TARGET = '#explorer-module-rail-anchor'

/**
 * Resolves where the API Explorer module rail is mounted across Codex desktop breakpoints.
 *
 * At desktop (≥ 1120px) the rail teleports to the grid end column; below that it
 * teleports inline below project controls in the main column.
 *
 * @returns Desktop end-column flag, layout mode, and Teleport target selector.
 */
export function useExplorerModuleRailPlacement(): {
	isDesktopEndColumnRail: Ref<boolean>
	layoutMode: ComputedRef<ExplorerModuleRailLayoutMode>
	moduleRailTeleportTarget: ComputedRef<string>
} {
	const isDesktopEndColumnRail = ref( false )

	let mediaQueryList: MediaQueryList | null = null

	/**
	 * Syncs the desktop end-column flag from the Codex desktop min-width media query.
	 *
	 * @returns Nothing.
	 */
	function syncDesktopEndColumnRail(): void {
		if ( typeof window === 'undefined' ) {
			isDesktopEndColumnRail.value = false
			return
		}

		isDesktopEndColumnRail.value = window.matchMedia(
			getMinWidthMediaQuery( 'desktop' )
		).matches
	}

	onMounted( () => {
		if ( typeof window === 'undefined' ) {
			return
		}

		mediaQueryList = window.matchMedia( getMinWidthMediaQuery( 'desktop' ) )
		syncDesktopEndColumnRail()
		mediaQueryList.addEventListener( 'change', syncDesktopEndColumnRail )
	} )

	onUnmounted( () => {
		mediaQueryList?.removeEventListener( 'change', syncDesktopEndColumnRail )
	} )

	const layoutMode = computed<ExplorerModuleRailLayoutMode>( () => {
		return isDesktopEndColumnRail.value ? 'end-column' : 'inline'
	} )

	const moduleRailTeleportTarget = computed( () => {
		return isDesktopEndColumnRail.value
			? EXPLORER_END_PANEL_TELEPORT_TARGET
			: EXPLORER_INLINE_RAIL_ANCHOR_TARGET
	} )

	return {
		isDesktopEndColumnRail,
		layoutMode,
		moduleRailTeleportTarget
	}
}
