/** Matches a trailing or embedded "(Beta)" segment in discovery module titles. */
const MODULE_TITLE_BETA_PATTERN = /\s*\(\s*beta\s*\)\s*/gi

export interface ExplorerModuleRailHeading {
	headingTitle: string
	versionChipLabel?: string
	showBetaChip: boolean
}

/** Trailing prerelease tag stripped from version chip labels (beta is shown separately). */
const MODULE_VERSION_BETA_SUFFIX_PATTERN = /-beta$/i

/**
 * Normalizes a raw module version string for chip display.
 *
 * @param moduleVersion - Raw version from discovery or the module spec.
 * @returns Version without a leading `v` or trailing `-beta` tag.
 */
function normalizeModuleVersionForChip( moduleVersion: string ): string {
	const withoutLeadingV = moduleVersion.trim().replace( /^v/i, '' )
	return withoutLeadingV.replace( MODULE_VERSION_BETA_SUFFIX_PATTERN, '' ).trim()
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

	const normalizedVersion = normalizeModuleVersionForChip( trimmedVersion )
	if ( !normalizedVersion ) {
		return undefined
	}

	return `v${ normalizedVersion }`
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

/**
 * Builds supporting text for REST API module select menu items.
 *
 * Mirrors beta and version chip metadata from the module rail using Codex
 * MenuItem `supportingText` (subtle text after the label).
 *
 * @param railHeading - Parsed heading parts for the module.
 * @param betaChipLabel - Localized label for the beta chip.
 * @param versionChipLabel - Optional isolated version label for display.
 * @returns Supporting text, or an empty string when no chips apply.
 */
export function formatExplorerModuleSelectSupportingText(
	railHeading: Pick<ExplorerModuleRailHeading, 'showBetaChip' | 'versionChipLabel'>,
	betaChipLabel: string,
	versionChipLabel?: string
): string {
	const segments: string[] = []

	if ( railHeading.showBetaChip ) {
		segments.push( betaChipLabel )
	}

	if ( versionChipLabel ) {
		segments.push( versionChipLabel )
	}

	return segments.join( ' · ' )
}
