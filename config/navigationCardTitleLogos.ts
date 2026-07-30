/**
 * Allowlisted brand title logos for {@link NavigationCard} Markdown / MDC props.
 *
 * Used when a card replaces the text title with a monochrome company mark
 * (`title-logo="gerrit"`). Logos are SVG path data filled with `currentColor`
 * so they follow `--color-base` (and dark mode) like title text.
 *
 * Codex does not ship these brand marks — custom SVG is intentional. Keep this
 * list small; add names only when a content card needs them.
 *
 * Source SVGs (same geometry): `public/images/navigation-card-logos/*-logo.svg`.
 * - Gerrit: https://gerrit.wikimedia.org/r/static/wikimedia-codereview-logo.cache.svg
 * - GitHub: https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg
 * - GitLab: https://upload.wikimedia.org/wikipedia/commons/3/35/GitLab_icon.svg
 * (hardcoded brand fills remapped to `currentColor`).
 */

/**
 * SVG path(s) + viewBox for a NavigationCard title logo.
 */
export type NavigationCardTitleLogoDefinition = {
	/** SVG `viewBox` attribute. */
	viewBox: string
	/** Path `d` attributes; each rendered with `fill="currentColor"`. */
	paths: string[]
	/**
	 * Optional transform on a wrapping `<g>` (needed when the source SVG
	 * positions paths via a group matrix, e.g. Wikimedia Commons GitLab mark).
	 */
	groupTransform?: string
	/**
	 * Optional `fill-rule` / `clip-rule` for every path (e.g. GitHub Octicons
	 * `evenodd`).
	 */
	fillRule?: 'evenodd' | 'nonzero'
}

/**
 * Map of short title-logo identifiers to SVG definitions.
 */
export const NAVIGATION_CARD_TITLE_LOGOS: Record<string, NavigationCardTitleLogoDefinition> = {
	gerrit: {
		viewBox: '0 0 60 60',
		paths: [
			'M30 0C19.763 0 10.719 5.152 5.304 13.01l5.8 3.36C15.346 10.507 22.23 6.688 30 6.688c7.77 0 14.654 3.819 18.896 9.684l5.8-3.36C49.28 5.152 40.237 0 30 0z',
			'M2.146 18.908A30.062 30.062 0 0 0 0 30.092C0 45.572 11.673 58.335 26.667 60v-6.746c-11.302-1.624-20-11.378-20-23.162 0-2.735.468-5.359 1.329-7.799zM57.854 18.908l-5.85 3.385c.86 2.44 1.33 5.064 1.33 7.799 0 11.784-8.699 21.538-20 23.162V60C48.326 58.335 60 45.573 60 30.092c0-3.952-.763-7.726-2.146-11.184z',
			'M49.883 28.306L32.228 10.598a2.599 2.599 0 0 0-3.683 0l-3.666 3.677 4.65 4.665a3.085 3.085 0 0 1 3.182.744 3.11 3.11 0 0 1 .735 3.21l4.482 4.496a3.086 3.086 0 0 1 3.202.738 3.114 3.114 0 0 1 0 4.395 3.092 3.092 0 0 1-4.384 0 3.116 3.116 0 0 1-.674-3.38l-4.18-4.193v11.033a3.116 3.116 0 0 1 .82 4.984 3.092 3.092 0 0 1-4.383 0 3.116 3.116 0 0 1 1.015-5.074V24.757a3.115 3.115 0 0 1-1.682-4.076l-4.584-4.6-12.106 12.143a2.62 2.62 0 0 0 0 3.695l17.656 17.708a2.599 2.599 0 0 0 3.683 0L49.883 32a2.619 2.619 0 0 0 0-3.695'
		]
	},
	github: {
		viewBox: '0 0 16 16',
		fillRule: 'evenodd',
		paths: [
			'M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z'
		]
	},
	gitlab: {
		viewBox: '0 0 1000 963.197',
		groupTransform: 'matrix(5.2068817,0,0,5.2068817,-489.30756,-507.76085)',
		paths: [
			'm 282.83,170.73 -0.27,-0.69 -26.14,-68.22 a 6.81,6.81 0 0 0 -2.69,-3.24 7,7 0 0 0 -8,0.43 7,7 0 0 0 -2.32,3.52 l -17.65,54 h -71.47 l -17.65,-54 a 6.86,6.86 0 0 0 -2.32,-3.53 7,7 0 0 0 -8,-0.43 6.87,6.87 0 0 0 -2.69,3.24 L 97.44,170 l -0.26,0.69 a 48.54,48.54 0 0 0 16.1,56.1 l 0.09,0.07 0.24,0.17 39.82,29.82 19.7,14.91 12,9.06 a 8.07,8.07 0 0 0 9.76,0 l 12,-9.06 19.7,-14.91 40.06,-30 0.1,-0.08 a 48.56,48.56 0 0 0 16.08,-56.04 z',
			'm 282.83,170.73 -0.27,-0.69 a 88.3,88.3 0 0 0 -35.15,15.8 L 190,229.25 c 19.55,14.79 36.57,27.64 36.57,27.64 l 40.06,-30 0.1,-0.08 a 48.56,48.56 0 0 0 16.1,-56.08 z',
			'm 153.43,256.89 19.7,14.91 12,9.06 a 8.07,8.07 0 0 0 9.76,0 l 12,-9.06 19.7,-14.91 c 0,0 -17.04,-12.89 -36.59,-27.64 -19.55,14.75 -36.57,27.64 -36.57,27.64 z',
			'M 132.58,185.84 A 88.19,88.19 0 0 0 97.44,170 l -0.26,0.69 a 48.54,48.54 0 0 0 16.1,56.1 l 0.09,0.07 0.24,0.17 39.82,29.82 c 0,0 17,-12.85 36.57,-27.64 z'
		]
	}
}

/**
 * Resolves a NavigationCard `titleLogo` prop to an SVG definition.
 *
 * @param logoName - Allowlisted logo id from MDC (`gerrit`, `github`, `gitlab`).
 * @returns Logo definition, or `undefined` when empty / unknown.
 */
export function resolveNavigationCardTitleLogo(
	logoName: string | undefined
): NavigationCardTitleLogoDefinition | undefined {
	if ( logoName === undefined || logoName === null || logoName === '' ) {
		return undefined
	}
	const trimmedName = logoName.trim()
	return NAVIGATION_CARD_TITLE_LOGOS[ trimmedName ]
}
