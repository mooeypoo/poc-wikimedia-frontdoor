<script setup lang="ts">
import { CdxIcon, CdxInfoChip } from '@wikimedia/codex'
import { cdxIconLinkExternal, type Icon } from '@wikimedia/codex-icons'
import { resolveNavigationCardIcon } from '../../../config/navigationCardIcons'
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
 * - Optional **top** icon above the title row, plus optional **leading** icon
 *   inline with the title
 * - Trailing `cdxIconLinkExternal` only for destinations outside the platform
 * - Optional Codex `CdxInfoChip` row under the description
 *
 * Whole-card `url` is the only click target (no separate “Learn more” link).
 * Title, description, and chip labels are content strings (`<bdi>`), not
 * banana-i18n — see ARCHITECTURE.md → Navigation card.
 *
 * @see DESIGN_REQUIREMENTS.md → Navigation card
 * @see https://doc.wikimedia.org/codex/latest/components/demos/card.html
 */
const props = withDefaults( defineProps<{
	/** Destination URL. Empty / omitted → non-interactive card. */
	url?: string
	/**
	 * Title text when the `#title` slot is unused. Content string — BiDi-isolated.
	 */
	title?: string
	/**
	 * Description when the `#description` slot is unused. Content string — BiDi-isolated.
	 */
	description?: string
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
 * True when the card navigates outside the Front Door platform.
 * Absolute http(s) URLs count as external even without the `external` prop.
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

/**
 * Root element: NuxtLink for internal routes, `<a>` for other URLs, `<div>` when not a link.
 * Mirrors Codex CdxCard’s `contentTag` pattern.
 */
const rootTag = computed( () => {
	if ( isInternalLink.value ) {
		return NuxtLink
	}
	if ( isLink.value ) {
		return 'a'
	}
	return 'div'
} )

const rootBind = computed( () => {
	if ( isInternalLink.value ) {
		return { to: props.url }
	}
	if ( isLink.value ) {
		return {
			href: props.url,
			...( isExternalDestination.value ?
				{ target: '_blank', rel: 'noopener noreferrer' } :
				{} )
		}
	}
	return {}
} )

const resolvedTopIcon = computed( () => resolveNavigationCardIcon( props.topIcon ) )

const resolvedLeadingIcon = computed( () => resolveNavigationCardIcon( props.leadingIcon ) )

/** Trailing icon only for off-platform destinations. */
const resolvedTrailingIcon = computed( (): Icon | undefined => {
	if ( !isExternalDestination.value ) {
		return undefined
	}
	return cdxIconLinkExternal
} )

const parsedChips = computed( () => parseNavigationCardChips( props.chips ) )

const hasTopIcon = computed( () =>
	Boolean( slots[ 'top-icon' ] ) || Boolean( resolvedTopIcon.value )
)

const hasTitle = computed( () =>
	Boolean( slots.title ) || props.title.trim().length > 0
)

const hasDescription = computed( () =>
	Boolean( slots.description ) || props.description.trim().length > 0
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
	hasChips.value
)
</script>

<template>
	<component
		:is="rootTag"
		v-bind="rootBind"
		class="navigation-card"
		:class="{ 'navigation-card--is-link': isLink }"
	>
		<div
			v-if="hasBody"
			class="navigation-card__body"
		>
			<div
				v-if="hasTopIcon || hasTitle || hasDescription"
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
								<bdi>{{ title }}</bdi>
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
						<bdi>{{ description }}</bdi>
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
	</component>
</template>

<style scoped>
.navigation-card {
	display: flex;
	flex-direction: column;
	inline-size: 100%;
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

.navigation-card__body {
	display: flex;
	flex-direction: column;
	/* Figma Content card: 24px between copy block and chips. */
	gap: var( --spacing-150 );
	inline-size: 100%;
	min-inline-size: 0;
}

.navigation-card__copy {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-25 );
	inline-size: 100%;
	min-inline-size: 0;
}

.navigation-card__intro {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-50 );
	inline-size: 100%;
	min-inline-size: 0;
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

.navigation-card__chips {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-50 );
	inline-size: 100%;
}

.navigation-card--is-link {
	cursor: pointer;
}

.navigation-card--is-link:hover {
	border-color: var( --border-color-subtle );
	text-decoration: none;
}

.navigation-card--is-link:focus {
	outline: 1px solid transparent;
}

.navigation-card--is-link:focus-visible {
	/* Progressive focus ring in addition to the 1px border box. */
	box-shadow: inset 0 0 0 2px var( --box-shadow-color-progressive--focus, var( --color-progressive ) );
}
</style>
