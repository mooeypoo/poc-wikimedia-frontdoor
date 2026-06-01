/** Matches a trailing or embedded "(Beta)" segment in discovery module titles. */
const MODULE_TITLE_BETA_PATTERN = /\s*\(\s*beta\s*\)\s*/gi

export interface ExplorerModuleRailHeading {
	headingTitle: string
	versionChipLabel?: string
	showBetaChip: boolean
}

/**
 * Normalizes an OpenAPI module version for display in a success InfoChip.
 *
 * @param moduleVersion - Raw version from discovery or the module spec.
 * @returns Version label with a leading `v`, or undefined when empty.
 */
export function formatModuleVersionChipLabel( moduleVersion?: string ): string | undefined {
	const trimmedVersion = moduleVersion?.trim()
	if ( !trimmedVersion ) {
		return undefined
	}

	return trimmedVersion.startsWith( 'v' ) ? trimmedVersion : `v${ trimmedVersion }`
}

/**
 * Derives page-navigation module heading parts from discovery metadata.
 *
 * Strips "(Beta)" from the title for chip rendering and formats the version string.
 *
 * @param moduleName - Discovery module name fallback.
 * @param moduleTitle - Optional human-readable module title from discovery.
 * @param moduleVersion - Optional module version from discovery.
 * @returns Title text and optional chip labels for the module rail heading.
 */
export function resolveExplorerModuleRailHeading(
	moduleName: string,
	moduleTitle?: string,
	moduleVersion?: string
): ExplorerModuleRailHeading {
	const rawTitle = ( moduleTitle ?? moduleName ).trim()
	const showBetaChip = MODULE_TITLE_BETA_PATTERN.test( rawTitle )
	MODULE_TITLE_BETA_PATTERN.lastIndex = 0

	const headingTitle = rawTitle
		.replace( MODULE_TITLE_BETA_PATTERN, ' ' )
		.replace( /\s+/g, ' ' )
		.trim() || moduleName.trim()

	return {
		headingTitle,
		versionChipLabel: formatModuleVersionChipLabel( moduleVersion ),
		showBetaChip
	}
}

/**
 * Builds an accessible name for a module rail heading control.
 *
 * @param railHeading - Parsed heading parts for the module.
 * @param betaChipLabel - Localized label for the beta InfoChip.
 * @returns Comma-separated phrase for screen readers.
 */
export function formatModuleRailHeadingAriaLabel(
	railHeading: ExplorerModuleRailHeading,
	betaChipLabel: string
): string {
	const segments = [ railHeading.headingTitle ]

	if ( railHeading.showBetaChip ) {
		segments.push( betaChipLabel )
	}

	if ( railHeading.versionChipLabel ) {
		segments.push( railHeading.versionChipLabel )
	}

	return segments.join( ', ' )
}
