import { EXPLORER_SIDE_NAV_SECTIONS } from '../../config/explorerSideNav'
import { SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID } from '../../config/sectionNavigation'
import { getMainNavigationIdFromPath, stripContentLocalePrefix } from '../utils/contentRoute'

export interface ResolvedSectionNavItem {
	id: string
	label: string
	isActive: boolean
}

export interface ResolvedSectionNavSection {
	id: string
	title: string
	items: ResolvedSectionNavItem[]
}

interface SectionNavigationSource {
	ariaLabelMessageKey: string
	sections: Array<{
		id: string
		titleMessageKey: string
		items: Array<{
			id: string
			messageKey: string
			isActive?: boolean
		}>
	}>
}

/**
 * Prototype active item per content path (section id → item id).
 * Explorer active state comes from `config/explorerSideNav.js`.
 */
const PROTOTYPE_ACTIVE_ITEM_BY_CONTENT_PATH: Record<string, Record<string, string>> = {
	'/': {
		'get-started': 'introduction'
	},
	'/learn': {},
	'/enterprise': {
		enterprise: 'overview'
	},
	'/community': {},
	'/contribute': {},
	'/get-help': {},
	'/about': {
		about: 'overview'
	}
}

/**
 * Resolves left-hand section navigation for the current route.
 *
 * Returns explorer or content section menus from config, with banana-i18n
 * labels and prototype active states for landing pages.
 *
 * @returns Reactive section navigation for the shell start column.
 */
export function usePageSectionNav() {
	const route = useRoute()
	const { $bananaI18n } = useNuxtApp()

	const mainNavigationId = computed( () => getMainNavigationIdFromPath( route.path ) )

	const navigationSource = computed<SectionNavigationSource | null>( () => {
		const navigationId = mainNavigationId.value

		if ( !navigationId ) {
			return null
		}

		if ( navigationId === 'api-explorer' ) {
			return {
				ariaLabelMessageKey: 'explorer-side-nav-label',
				sections: EXPLORER_SIDE_NAV_SECTIONS
			}
		}

		return SECTION_NAVIGATION_BY_MAIN_NAVIGATION_ID[ navigationId ] ?? null
	} )

	const navigationLabel = computed( () => {
		const source = navigationSource.value

		if ( !source ) {
			return ''
		}

		return $bananaI18n( source.ariaLabelMessageKey )
	} )

	const navigationSections = computed<ResolvedSectionNavSection[]>( () => {
		const source = navigationSource.value

		if ( !source ) {
			return []
		}

		const contentPath = mainNavigationId.value === 'api-explorer'
			? null
			: stripContentLocalePrefix( route.path )

		const activeSectionItems = contentPath
			? PROTOTYPE_ACTIVE_ITEM_BY_CONTENT_PATH[ contentPath ] ?? {}
			: {}

		return source.sections.map( ( section ) => ( {
			id: section.id,
			title: $bananaI18n( section.titleMessageKey ),
			items: section.items.map( ( item ) => ( {
				id: item.id,
				label: $bananaI18n( item.messageKey ),
				isActive: Boolean(
					item.isActive
					|| activeSectionItems[ section.id ] === item.id
				)
			} ) )
		} ) )
	} )

	const hasPageSectionNavigation = computed( () => navigationSections.value.length > 0 )

	return {
		hasPageSectionNavigation,
		navigationLabel,
		navigationSections
	}
}
