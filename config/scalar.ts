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
	showSidebar: false,
	searchHotKey: 'k',
	metaData: {
		title: 'Front Door API Explorer'
	}
}
