/**
 * Stable Scalar document slug used for operation navigation ids.
 *
 * Must match the `slug` passed in {@link SCALAR_DEFAULT_CONFIGURATION}.
 */
export const SCALAR_DOCUMENT_SLUG = 'front-door-api-explorer'

/**
 * Scalar defaults shared by the explorer page.
 */
export const SCALAR_DEFAULT_CONFIGURATION = {
	slug: SCALAR_DOCUMENT_SLUG,
	hideDownloadButton: false,
	hideTestRequestButton: false,
	showDeveloperTools: 'never',
	layout: 'modern' as const,
	theme: 'default' as const,
	// The site owns color mode (useColorMode); Scalar's `darkMode` boolean is
	// driven from it in useScalarConfig. Hide Scalar's own toggle so there is a
	// single control — the shell header switch — as the source of truth.
	hideDarkModeToggle: true,
	showSidebar: false,
	searchHotKey: 'k',
	metaData: {
		title: 'Front Door API Explorer'
	}
}
