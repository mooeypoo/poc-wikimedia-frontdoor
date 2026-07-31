import type { StatusType } from '@wikimedia/codex'

/**
 * One optional InfoChip shown under a NavigationCard description.
 *
 * Chip labels are **content** (per-locale Markdown), not banana-i18n interface
 * chrome — see ARCHITECTURE.md → Navigation card.
 *
 * @property label - Visible chip text (BiDi-isolated in the template).
 * @property status - Codex {@link CdxInfoChip} status (default `subtle`).
 * @property icon - Optional allowlisted Codex icon name (`config/navigationCardIcons.ts`).
 * @property variant - Optional visual variant (`award` = purple Coolest Tool chip).
 */
export type NavigationCardChip = {
	label: string
	status?: StatusType
	icon?: string
	variant?: 'award'
}

/** Codex InfoChip statuses — mirrored from `@wikimedia/codex` `StatusTypes`. */
const STATUS_TYPES: readonly StatusType[] = [
	'subtle',
	'notice',
	'progressive',
	'warning',
	'error',
	'success'
]

const STATUS_TYPE_SET = new Set<string>( STATUS_TYPES )

/**
 * Parses NavigationCard `chips` from a Vue array or an MDC string attribute.
 *
 * MDC examples:
 * - `chips="Bots and tools|Wikimedia APIs"` — labels, default status `subtle`
 * - `chips="subtle:Optional tag|success:Optional tag"` — status-prefixed labels
 * - `chips="award:Coolest Tool Award 2026"` — landing award chip (star + purple)
 *
 * Segments are split on `|`. A leading `status:` uses a Codex {@link StatusType}
 * when the prefix is valid; `award:` sets the award variant. Otherwise the whole
 * segment is the label.
 *
 * @param chipsProp - Array from Vue, pipe-separated string from MDC, or empty.
 * @returns Normalized chip list for `CdxInfoChip`.
 */
export function parseNavigationCardChips(
	chipsProp: NavigationCardChip[] | string | undefined
): NavigationCardChip[] {
	if ( chipsProp === undefined || chipsProp === null || chipsProp === '' ) {
		return []
	}
	if ( Array.isArray( chipsProp ) ) {
		return chipsProp
			.filter( ( chip ) => chip && String( chip.label ?? '' ).trim().length > 0 )
			.map( ( chip ) => ( {
				label: String( chip.label ).trim(),
				status: chip.status,
				icon: chip.icon,
				variant: chip.variant
			} ) )
	}

	return String( chipsProp )
		.split( '|' )
		.map( ( segment ) => segment.trim() )
		.filter( Boolean )
		.map( ( segment ) => {
			const separatorIndex = segment.indexOf( ':' )
			if ( separatorIndex > 0 ) {
				const prefix = segment.slice( 0, separatorIndex ).trim()
				const label = segment.slice( separatorIndex + 1 ).trim()
				if ( label && prefix === 'award' ) {
					return {
						label,
						status: 'subtle' as StatusType,
						icon: 'star',
						variant: 'award' as const
					}
				}
				if ( label && STATUS_TYPE_SET.has( prefix ) ) {
					return {
						label,
						status: prefix as StatusType
					}
				}
			}
			return { label: segment, status: 'subtle' as StatusType }
		} )
}
