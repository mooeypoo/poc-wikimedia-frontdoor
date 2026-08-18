/**
 * Brand wordmark typography — Figma Header/Footer specify Montserrat.
 *
 * Montserrat **700** / **800** are self-hosted under `public/fonts/montserrat/`
 * (SIL Open Font License — see `OFL.txt` there). `@font-face` CSS is built by
 * {@link buildBrandWordmarkFontFaceCss} and injected from `nuxt.config.ts`
 * `app.head` (same paths as font preloads). Shell components use
 * `--font-family-brand-wordmark` for brand wordmark text only — not general UI
 * copy (Codex `--font-family-sans-stack`).
 *
 * Do **not** load Montserrat from Google Fonts (`fonts.googleapis.com` /
 * `fonts.gstatic.com`).
 */

/** Primary family name for brand wordmarks (sets `--font-family-brand-wordmark` via {@link buildBrandWordmarkFontCss}). */
export const BRAND_WORDMARK_FONT_FAMILY_NAME = 'Montserrat'

/** CSS font-family stack for header/footer brand wordmarks (quoted family name for CSS). */
export const BRAND_WORDMARK_FONT_FAMILY = `'${ BRAND_WORDMARK_FONT_FAMILY_NAME }', sans-serif`

/**
 * Same-origin public paths for self-hosted Montserrat WOFF2 files.
 *
 * Weights match Figma Header 284:11443 (700 top line, 800 bottom line) and
 * footer bold wordmark (700). Paths must stay in sync with files under
 * `public/fonts/montserrat/`.
 */
export const BRAND_WORDMARK_FONT_FILES = {
	bold: '/fonts/montserrat/Montserrat-Bold.woff2',
	extraBold: '/fonts/montserrat/Montserrat-ExtraBold.woff2'
} as const

/**
 * Builds first-party `@font-face` CSS for self-hosted Montserrat wordmark weights.
 *
 * Injected via {@link buildBrandWordmarkFontCss} / `nuxt.config.ts` `app.head.style`
 * so font URLs stay single-sourced from {@link BRAND_WORDMARK_FONT_FILES} (preloads
 * use the same object). Does not contact Google Fonts or any other third-party font host.
 *
 * @returns {string} CSS for Bold (700) and ExtraBold (800) WOFF2 faces with `font-display: swap`.
 */
export function buildBrandWordmarkFontFaceCss(): string {
	const familyName = BRAND_WORDMARK_FONT_FAMILY_NAME

	return [
		`@font-face {`,
		`\tfont-family: '${ familyName }';`,
		`\tfont-style: normal;`,
		`\tfont-weight: 700;`,
		`\tfont-display: swap;`,
		`\tsrc: url( '${ BRAND_WORDMARK_FONT_FILES.bold }' ) format( 'woff2' );`,
		`}`,
		``,
		`@font-face {`,
		`\tfont-family: '${ familyName }';`,
		`\tfont-style: normal;`,
		`\tfont-weight: 800;`,
		`\tfont-display: swap;`,
		`\tsrc: url( '${ BRAND_WORDMARK_FONT_FILES.extraBold }' ) format( 'woff2' );`,
		`}`
	].join( '\n' )
}

/**
 * Builds `@font-face` rules plus the `--font-family-brand-wordmark` custom property.
 *
 * Injected from `nuxt.config.ts` `app.head.style` so the family stack
 * ({@link BRAND_WORDMARK_FONT_FAMILY}) and file paths stay in one config module.
 * Shell brand components consume the CSS variable — not this string directly.
 *
 * @returns {string} Self-hosted Montserrat faces + `:root` brand wordmark stack.
 */
export function buildBrandWordmarkFontCss(): string {
	return [
		buildBrandWordmarkFontFaceCss(),
		``,
		`:root {`,
		`\t--font-family-brand-wordmark: ${ BRAND_WORDMARK_FONT_FAMILY };`,
		`}`
	].join( '\n' )
}
