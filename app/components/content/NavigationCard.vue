<script setup lang="ts">
import { CdxIcon, CdxInfoChip } from '@wikimedia/codex'
import { cdxIconLinkExternal, type Icon } from '@wikimedia/codex-icons'
import { resolveNavigationCardIcon } from '../../../config/navigationCardIcons'
import { resolveNavigationCardTitleLogo } from '../../../config/navigationCardTitleLogos'
import {
	parseNavigationCardChips,
	type NavigationCardChip
} from '../../utils/parseNavigationCardChips'

export type { NavigationCardChip }

/**
 * Front Door navigation / content card — vertical Codex-inspired card chrome.
 *
 * Based on Codex {@link CdxCard} and Figma variant A “Content card”
 * ([79:4339](https://www.figma.com/design/WT1U0UugpM7CXgc2v8LmK3/Unified-Developer-Front-Door?node-id=79-4339)).
 *
 * Differences from stock `CdxCard`:
 * - Vertical stack (no thumbnail)
 * - Neutral-subtle background; transparent border that uses
 *   `--border-color-subtle` on hover when the card is a link
 * - Exploratory **4px** radius (`--fd-explorer-controls-surface-border-radius`)
 * - Optional **top** / **leading** title icons (Codex allowlist)
 * - Optional **title-logo** — allowlisted monochrome brand SVG
 *   (`gerrit` / `github` / `gitlab`) in the title position at
 *   `--size-icon-medium`, `currentColor` / `--color-base` (dark mode via tokens).
 *   Prefer over a text `title` for logo-led cards (e.g. Browse repositories).
 * - Optional **supporting-text**: when `url` is set, rendered as a Codex Link
 *   (mixin tokens: `--color-link*`) to the same destination (external icon
 *   appended for off-platform URLs; icon inherits link colour);
 *   title trailing external icon is omitted in that case. Without supporting-text,
 *   off-platform cards still show the title trailing icon. In equal-height grids,
 *   supporting-text is bottom-aligned (`margin-block-start: auto`). When
 *   converting from prose, **keep the technical writer’s supporting-text /
 *   link labels** — do not rewrite them
 * - Optional `CdxInfoChip` row (label-only in cards — status icons hidden; Codex
 *   forces icons on warning/error/success and ignores a null `icon` for those)
 * - Markdown description via the **`description` prop**, the `#description`
 *   named slot, or the **default slot** (prefer default slot inside grids —
 *   MDC named slots do not nest under `:::navigation-card-grid`)
 *
 * **Click target:** When `url` is set, a stretched link covers the card so the
 * whole surface navigates. Description / supporting-text links may still be
 * interactive via higher `z-index` + `pointer-events` — valid HTML, no nested
 * `<a>`. ProseA external icons are suppressed inside descriptions.
 *
 * Title, description, chip labels, and supporting-text are content strings
 * (`<bdi>`), not banana-i18n — see ARCHITECTURE.md → Navigation card.
 *
 * @see DESIGN_REQUIREMENTS.md → Navigation card
 * @see https://doc.wikimedia.org/codex/latest/components/demos/card.html
 */
const props = withDefaults( defineProps<{
	/** Destination URL. Empty / omitted → non-interactive card. */
	url?: string
	/**
	 * Title text when the `#title` slot is unused. Content string — BiDi-isolated.
	 * Omit when `titleLogo` supplies the title visual instead.
	 */
	title?: string
	/**
	 * Description when the `#description` slot is unused. Content string — BiDi-isolated.
	 */
	description?: string
	/**
	 * Optional Codex Card supporting-text. When `url` is set, rendered as a
	 * Codex Link (Link mixin tokens) to the same destination (with external
	 * icon when off-platform). Content string — BiDi-isolated. Preserve
	 * technical-writer labels when converting from prose.
	 */
	supportingText?: string
	/**
	 * Optional monochrome brand logo in the title position (MDC:
	 * `title-logo="gerrit"`). Allowlisted in `config/navigationCardTitleLogos.ts`.
	 * Sized to `--size-icon-medium`; colour via `currentColor` / `--color-base`.
	 */
	titleLogo?: string
	/**
	 * Optional icon above the title row. Pass a Codex {@link Icon} from Vue, or
	 * an allowlisted name from Markdown (`top-icon="userGroup"`).
	 */
	topIcon?: Icon | string
	/**
	 * Optional icon before the title (inline). Codex {@link Icon} or allowlisted name.
	 */
	leadingIcon?: Icon | string
	/**
	 * Optional InfoChips under the description. Vue: chip objects. MDC: pipe-separated
	 * labels (`chips="A|B"`) or `status:label` segments (`chips="subtle:A|success:B"`).
	 * Ignored when the `#chips` slot is provided.
	 */
	chips?: NavigationCardChip[] | string
	/**
	 * Force external link behaviour (`target="_blank"`, trailing external icon)
	 * even for path-like URLs. Absolute `http(s):` URLs are treated as external
	 * automatically.
	 */
	external?: boolean | string
}>(), {
	url: '',
	title: '',
	description: '',
	supportingText: '',
	titleLogo: '',
	chips: () => [],
	external: false
} )

const slots = useSlots()

/** Nuxt auto-registered link component — same target as AppButton.vue. */
const NuxtLink = resolveComponent( 'NuxtLink' )

const isExternalFlag = computed( () => {
	const flag = props.external
	return flag === true || flag === '' || flag === 'true'
} )

const isLink = computed( () => props.url.trim().length > 0 )

/**
 * True when the primary `url` is off-platform (drives trailing icon + link attrs).
 */
const isExternalDestination = computed( () => {
	if ( !isLink.value ) {
		return false
	}
	if ( isExternalFlag.value ) {
		return true
	}
	const destination = props.url.trim()
	return /^https?:\/\//i.test( destination ) || destination.startsWith( '//' )
} )

const isInternalLink = computed( () => {
	if ( !isLink.value || isExternalDestination.value ) {
		return false
	}
	return props.url.startsWith( '/' )
} )

/** Stretched-link tag: NuxtLink for internal paths, `<a>` for absolute URLs. */
const stretchedLinkTag = computed( () => {
	if ( isInternalLink.value ) {
		return NuxtLink
	}
	return 'a'
} )

const stretchedLinkBind = computed( () => {
	if ( isInternalLink.value ) {
		return { to: props.url }
	}
	return {
		href: props.url,
		...( isExternalDestination.value ?
			{ target: '_blank', rel: 'noopener noreferrer' } :
			{} )
	}
} )

const resolvedTopIcon = computed( () => resolveNavigationCardIcon( props.topIcon ) )

const resolvedLeadingIcon = computed( () => resolveNavigationCardIcon( props.leadingIcon ) )

/**
 * Allowlisted brand mark for the title row (replaces text title when set alone).
 */
const resolvedTitleLogo = computed( () =>
	resolveNavigationCardTitleLogo( props.titleLogo )
)

/**
 * Render prop supporting-text as a progressive link to the same `url`.
 * Custom `#supporting-text` slots are left as authored.
 */
const showSupportingTextAsLink = computed( () =>
	isLink.value &&
	props.supportingText.trim().length > 0 &&
	!slots[ 'supporting-text' ]
)

/**
 * Trailing title icon for off-platform destinations — omitted when
 * supporting-text is present (the external affordance moves onto that link).
 */
const resolvedTrailingIcon = computed( (): Icon | undefined => {
	const hasSupportingTextContent =
		Boolean( slots[ 'supporting-text' ] ) ||
		props.supportingText.trim().length > 0
	if ( !isExternalDestination.value || hasSupportingTextContent ) {
		return undefined
	}
	return cdxIconLinkExternal
} )

const parsedChips = computed( () => parseNavigationCardChips( props.chips ) )

const hasTopIcon = computed( () =>
	Boolean( slots[ 'top-icon' ] ) || Boolean( resolvedTopIcon.value )
)

const hasTitle = computed( () =>
	Boolean( slots.title ) ||
	props.title.trim().length > 0 ||
	Boolean( resolvedTitleLogo.value )
)

const hasDescription = computed( () =>
	Boolean( slots.description ) ||
	Boolean( slots.default ) ||
	props.description.trim().length > 0
)

const hasSupportingText = computed( () =>
	Boolean( slots[ 'supporting-text' ] ) || props.supportingText.trim().length > 0
)

const hasLeadingIcon = computed( () =>
	Boolean( slots[ 'leading-icon' ] ) || Boolean( resolvedLeadingIcon.value )
)

const hasTrailingIcon = computed( () => Boolean( resolvedTrailingIcon.value ) )

const hasChips = computed( () =>
	Boolean( slots.chips ) || parsedChips.value.length > 0
)

const hasBody = computed( () =>
	hasTopIcon.value ||
	hasTitle.value ||
	hasDescription.value ||
	hasSupportingText.value ||
	hasChips.value
)
</script>

<template>
	<div
		class="navigation-card"
		:class="{ 'navigation-card--is-link': isLink }"
	>
		<!--
			Stretched link: whole-card click without wrapping body in <a>, so
			description may contain inline links (Wikidata) without nested anchors.
		-->
		<component
			:is="stretchedLinkTag"
			v-if="isLink"
			v-bind="stretchedLinkBind"
			class="navigation-card__stretched-link"
		>
			<span class="navigation-card__stretched-link-label">
				{{ title || supportingText || url }}
			</span>
		</component>
		<div
			v-if="hasBody"
			class="navigation-card__body"
		>
			<div
				v-if="hasTopIcon || hasTitle || hasDescription || hasSupportingText"
				class="navigation-card__copy"
			>
				<div
					v-if="hasTopIcon || hasTitle"
					class="navigation-card__intro"
				>
					<span
						v-if="hasTopIcon"
						class="navigation-card__top-icon"
						aria-hidden="true"
					>
						<slot name="top-icon">
							<CdxIcon
								v-if="resolvedTopIcon"
								:icon="resolvedTopIcon"
								size="medium"
							/>
						</slot>
					</span>
					<div
						v-if="hasTitle"
						class="navigation-card__title-row"
					>
						<span
							v-if="hasLeadingIcon"
							class="navigation-card__title-icon navigation-card__title-icon--leading"
							aria-hidden="true"
						>
							<slot name="leading-icon">
								<CdxIcon
									v-if="resolvedLeadingIcon"
									:icon="resolvedLeadingIcon"
									size="medium"
								/>
							</slot>
						</span>
						<div class="navigation-card__title">
							<slot name="title">
								<svg
									v-if="resolvedTitleLogo"
									class="navigation-card__title-logo"
									:viewBox="resolvedTitleLogo.viewBox"
									aria-hidden="true"
									focusable="false"
								>
									<g
										v-if="resolvedTitleLogo.groupTransform"
										:transform="resolvedTitleLogo.groupTransform"
									>
										<path
											v-for="( logoPath, logoPathIndex ) in resolvedTitleLogo.paths"
											:key="logoPathIndex"
											fill="currentColor"
											:fill-rule="resolvedTitleLogo.fillRule"
											:clip-rule="resolvedTitleLogo.fillRule"
											:d="logoPath"
										/>
									</g>
									<template v-else>
										<path
											v-for="( logoPath, logoPathIndex ) in resolvedTitleLogo.paths"
											:key="logoPathIndex"
											fill="currentColor"
											:fill-rule="resolvedTitleLogo.fillRule"
											:clip-rule="resolvedTitleLogo.fillRule"
											:d="logoPath"
										/>
									</template>
								</svg>
								<bdi v-if="title.trim().length > 0">{{ title }}</bdi>
							</slot>
						</div>
						<span
							v-if="hasTrailingIcon"
							class="navigation-card__title-icon navigation-card__title-icon--trailing"
							aria-hidden="true"
						>
							<CdxIcon
								:icon="resolvedTrailingIcon!"
								size="medium"
							/>
						</span>
					</div>
				</div>
				<div
					v-if="hasDescription"
					class="navigation-card__description"
				>
					<slot name="description">
						<!--
							Default slot: Markdown body inside ::navigation-card … ::
							(required for rich text inside :::navigation-card-grid —
							MDC cannot nest #description named slots in grids).
						-->
						<slot>
							<bdi>{{ description }}</bdi>
						</slot>
					</slot>
				</div>
				<div
					v-if="hasSupportingText"
					class="navigation-card__supporting-text"
					:class="{
						'navigation-card__supporting-text--is-link': showSupportingTextAsLink
					}"
				>
					<slot name="supporting-text">
						<component
							:is="stretchedLinkTag"
							v-if="showSupportingTextAsLink"
							v-bind="stretchedLinkBind"
							class="navigation-card__supporting-text-link"
						>
							<bdi>{{ supportingText }}</bdi>
							<CdxIcon
								v-if="isExternalDestination"
								:icon="cdxIconLinkExternal"
								size="x-small"
								aria-hidden="true"
								class="navigation-card__supporting-text-external-icon"
							/>
						</component>
						<bdi v-else>{{ supportingText }}</bdi>
					</slot>
				</div>
			</div>
			<div
				v-if="hasChips"
				class="navigation-card__chips"
			>
				<slot name="chips">
					<CdxInfoChip
						v-for="( chip, chipIndex ) in parsedChips"
						:key="`${chip.label}-${chipIndex}`"
						:status="chip.status ?? 'subtle'"
					>
						<bdi>{{ chip.label }}</bdi>
					</CdxInfoChip>
				</slot>
			</div>
		</div>
	</div>
</template>

<style scoped>
.navigation-card {
	position: relative;
	display: flex;
	flex-direction: column;
	inline-size: 100%;
	/* Fill equal-height grid cells so supporting-text can pin to the bottom. */
	min-block-size: 100%;
	margin-block-end: var( --spacing-100 );
	padding: var( --spacing-75 );
	/* Transparent border reserves space so hover colour does not shift layout. */
	border: 1px solid transparent;
	border-radius: var( --fd-explorer-controls-surface-border-radius );
	background-color: var( --fd-explorer-controls-surface-background-color );
	text-decoration: none;
	color: inherit;
	box-sizing: border-box;
}

.navigation-card__stretched-link {
	position: absolute;
	inset: 0;
	z-index: 0;
	border-radius: inherit;
}

/* Visually hidden accessible name for the stretched link. */
.navigation-card__stretched-link-label {
	position: absolute;
	inline-size: 1px;
	block-size: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect( 0, 0, 0, 0 );
	white-space: nowrap;
	border: 0;
}

.navigation-card__body {
	position: relative;
	z-index: 1;
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	/* Figma Content card: 24px between copy block and chips. */
	gap: var( --spacing-150 );
	inline-size: 100%;
	min-inline-size: 0;
	min-block-size: 0;
	/* Let clicks fall through to the stretched link except on nested anchors. */
	pointer-events: none;
}

.navigation-card__description :deep( a ),
.navigation-card__supporting-text-link {
	pointer-events: auto;
	position: relative;
	z-index: 1;
}

.navigation-card__copy {
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	/* No flex gap — description↔supporting-text min spacing is owned below. */
	gap: 0;
	inline-size: 100%;
	min-inline-size: 0;
	min-block-size: 0;
}

.navigation-card__intro {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-50 );
	inline-size: 100%;
	min-inline-size: 0;
}

/* Codex spacing-25 between title block and description when both are present. */
.navigation-card__intro + .navigation-card__description {
	margin-block-start: var( --spacing-25 );
}

.navigation-card__top-icon {
	display: inline-flex;
	flex: 0 0 auto;
	align-items: center;
	color: var( --color-progressive );
}

.navigation-card__title-row {
	display: flex;
	align-items: center;
	gap: var( --spacing-50 );
	inline-size: 100%;
	min-inline-size: 0;
}

.navigation-card__title {
	flex: 1 1 auto;
	min-inline-size: 0;
	/* Codex base (medium) size for all card copy. */
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-medium );
	color: var( --color-base );
	overflow-wrap: anywhere;
}

/*
 * Brand title logos: Codex medium icon size; inherit title `--color-base`
 * (and dark-mode token overrides) via currentColor — not progressive link colour.
 */
.navigation-card__title-logo {
	display: block;
	inline-size: var( --size-icon-medium );
	block-size: var( --size-icon-medium );
	flex-shrink: 0;
	color: inherit;
}

.navigation-card__title-icon {
	display: inline-flex;
	flex: 0 0 auto;
	align-items: center;
	color: var( --color-subtle );
}

.navigation-card__description {
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-medium );
	color: var( --color-subtle );
	overflow-wrap: anywhere;
}

.navigation-card__description :deep( p ) {
	margin-block: 0;
}

/*
 * Card already shows a trailing external icon for off-platform destinations.
 * Suppress ProseA’s inline external glyph inside description links (e.g. Wikidata).
 */
.navigation-card__description :deep( .prose-link__external-icon ) {
	display: none;
}

.navigation-card__supporting-text {
	/*
	 * Bottom-align in equal-height grids (`auto` absorbs free space). Codex
	 * **minimum** `--spacing-50` (8px) from the description via padding so the
	 * gap never collapses below 8px when free space is zero. Padding sits inside
	 * the supporting-text box so it remains immediately above the link when
	 * pinned to the card bottom.
	 */
	margin-block-start: auto;
	padding-block-start: var( --spacing-50 );
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-medium );
	color: var( --color-subtle );
	overflow-wrap: anywhere;
}

.navigation-card__supporting-text :deep( p ) {
	margin-block: 0;
}

/*
 * Codex Link mixin (`.cdx-mixin-link-base()`) expressed with design tokens —
 * https://doc.wikimedia.org/codex/latest/components/mixins/link.html
 * Project CSS is plain CSS (no Less), so tokens mirror the mixin rather than
 * importing `link.less`. External icon inherits link colour (Codex pattern).
 */
.navigation-card__supporting-text-link {
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-25 );
	color: var( --color-link );
	border-radius: var( --border-radius-base );
	text-decoration: var( --text-decoration-none );
}

.navigation-card__supporting-text-link:visited {
	color: var( --color-link--visited );
}

.navigation-card__supporting-text-link:visited:hover {
	color: var( --color-link--visited--hover );
}

.navigation-card__supporting-text-link:visited:active {
	color: var( --color-link--visited--active );
}

.navigation-card__supporting-text-link:hover {
	color: var( --color-link--hover );
	text-decoration: var( --text-decoration-underline );
}

.navigation-card__supporting-text-link:active {
	color: var( --color-link--active );
	text-decoration: var( --text-decoration-underline );
}

.navigation-card__supporting-text-link:focus-visible {
	outline: var( --border-style-base ) var( --border-width-thick ) var( --outline-color-progressive--focus );
}

@supports not selector( :focus-visible ) {
	.navigation-card__supporting-text-link:focus {
		outline: var( --border-style-base ) var( --border-width-thick ) var( --outline-color-progressive--focus );
	}
}

.navigation-card__supporting-text-external-icon {
	flex: 0 0 auto;
	color: inherit;
}

.navigation-card__chips {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-50 );
	inline-size: 100%;
}

/*
 * Codex forces status icons on warning / error / success InfoChips and ignores
 * a null `icon` prop for those statuses. Catalog chips are label-only (Figma).
 */
.navigation-card__chips :deep( .cdx-info-chip__icon--vue ) {
	display: none;
}

.navigation-card--is-link {
	cursor: pointer;
}

.navigation-card--is-link:hover,
.navigation-card--is-link:has( .navigation-card__stretched-link:focus-visible ) {
	border-color: var( --border-color-subtle );
}

.navigation-card--is-link:has( .navigation-card__stretched-link:focus-visible ) {
	box-shadow: inset 0 0 0 2px var( --box-shadow-color-progressive--focus, var( --color-progressive ) );
}

/*
 * Suppress Codex Link focus outline on the invisible stretched hit target —
 * the card surface shows focus via inset box-shadow above.
 */
.navigation-card__stretched-link:focus,
.navigation-card__stretched-link:focus-visible {
	outline: 1px solid transparent;
}
</style>
