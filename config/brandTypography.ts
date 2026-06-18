/**
 * Brand wordmark typography — Figma Header/Footer specify Montserrat.
 *
 * The font is loaded in `nuxt.config.ts` `app.head` via {@link BRAND_WORDMARK_FONT_STYLESHEET_URL}.
 * Shell components apply {@link BRAND_WORDMARK_FONT_FAMILY} only to brand wordmark text,
 * not general UI copy (Codex `--font-family-sans-stack`).
 */

/** CSS font-family stack for header/footer brand wordmarks (must match `--font-family-brand-wordmark` in `main.css`). */
export const BRAND_WORDMARK_FONT_FAMILY = 'Montserrat, sans-serif'

/**
 * Google Fonts stylesheet for Montserrat weights used by the header wordmark
 * (700 top line, 800 bottom line per Figma Header 284:11443).
 */
export const BRAND_WORDMARK_FONT_STYLESHEET_URL =
	'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&display=swap'
