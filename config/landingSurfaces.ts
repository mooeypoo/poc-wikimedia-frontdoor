/**
 * Platform landing page surface tokens and committed asset paths.
 *
 * Gradient stops match Figma Latest frame (1179:23177) dither bands. They are
 * not Codex design tokens — keep them here so components do not hardcode
 * environment / brand decisions. Swap for tokenized values when design ships
 * official landing surface tokens.
 */

/**
 * Soft radial / linear band colours from Figma section backgrounds.
 * Community apps uses Codex `--background-color-base` (not a gradient) — see
 * {@link LandingBand} `apps` variant.
 */
export const LANDING_BAND_GRADIENTS = {
	hero: {
		start: '#E6E0F0',
		end: '#D9E2FF'
	},
	apis: {
		start: '#f0ecf6',
		end: '#e8eeff'
	},
	join: {
		start: '#f0ecf6',
		end: '#eef2ff'
	}
} as const

/**
 * Centered landing content measure (1000px / `62.5rem`).
 *
 * Bound onto `.fd-landing-page` as `--fd-landing-content-max-inline-size` from
 * `app/pages/index.vue` so components do not hardcode the value. Section
 * backgrounds stay full viewport width (shell class `frontdoor-shell--landing`).
 */
export const LANDING_CONTENT_MAX_INLINE_SIZE = '62.5rem'

/** Committed public paths for landing imagery (do not invent replacements). */
export const LANDING_ASSETS = {
	heroDither: '/images/landing/hero-dither.svg',
	heroAsciiGlobe: '/images/landing/hero-ascii-globe.png',
	apiPreviewBonnie: '/images/landing/api-preview-bonnie.jpg',
	apiPreviewHaaland: '/images/landing/api-preview-haaland.jpg',
	apiPreviewWorldCup: '/images/landing/api-preview-worldcup.png',
	appLexica: '/images/landing/app-lexica.png',
	appPaulina: '/images/landing/app-paulina.png',
	appListen: '/images/landing/app-listen.png'
} as const

/**
 * Coolest Tool award InfoChip colours (Codex palette purple100 / purple600).
 *
 * Not shipped as runtime CSS variables by `@wikimedia/codex-design-tokens` in
 * this project — bind onto `.fd-landing-page` from `app/pages/index.vue`.
 *
 * @see https://doc.wikimedia.org/codex/latest/style-guide/colors.html
 */
export const LANDING_AWARD_CHIP = {
	backgroundColor: '#e6e0f0',
	color: '#7a6db7'
} as const

/**
 * Placeholder article-preview cards shown beside the landing API curl example.
 *
 * Titles and snippets are content strings (BiDi-isolated in the component).
 * Thumbnails are committed Figma exports resized for the 40px Codex thumbnail.
 */
export const LANDING_API_ARTICLE_PREVIEWS = [
	{
		id: 'bonnie-tyler',
		title: 'Bonnie Tyler',
		description:
			'Gaynor Sullivan (née Hopkins; 8 June 1951 – 8 July 2026), known professionally as Bonnie Tyler, was...',
		thumbnailSrc: LANDING_ASSETS.apiPreviewBonnie
	},
	{
		id: 'erling-haaland',
		title: 'Erling Haaland',
		description:
			'Erling Braut Haaland (born 21 July 2000) is a Norwegian professional footballer and Internet per...',
		thumbnailSrc: LANDING_ASSETS.apiPreviewHaaland
	},
	{
		id: 'fifa-world-cup-2026',
		title: '2026 FIFA World Cup',
		description:
			'The 2026 FIFA World Cup was the 23rd FIFA World Cup, the quadrennial international men\'s soccer...',
		thumbnailSrc: LANDING_ASSETS.apiPreviewWorldCup
	}
] as const
