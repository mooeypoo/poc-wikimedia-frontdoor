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
	// Force light mode until the site has a full dark-mode implementation.
	// Scalar otherwise follows the OS `prefers-color-scheme`, which surfaces a
	// half-finished dark theme. This also hides Scalar's dark-mode toggle.
	forceDarkModeState: 'light' as const,
	showSidebar: false,
	searchHotKey: 'k',
	metaData: {
		title: 'Front Door API Explorer'
	}
}
