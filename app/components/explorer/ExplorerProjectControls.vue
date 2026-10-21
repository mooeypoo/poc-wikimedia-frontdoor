<script setup lang="ts">
import {
	CdxAccordion,
	CdxButton,
	CdxCombobox,
	CdxField,
	CdxIcon,
	CdxInfoChip,
	CdxMenuButton
} from '@wikimedia/codex'
import { cdxIconEdit, cdxIconSettings } from '@wikimedia/codex-icons'
import type { ExplorerBootstrapModule } from '../../composables/useExplorerBootstrap'
import { useExplorerModuleSelect } from '../../composables/useExplorerModuleSelect'
import { useExplorerOptInMenu } from '../../composables/useExplorerOptInMenu'
import { useExplorerProjectLanguagePicker } from '../../composables/useExplorerProjectLanguagePicker'
import { useExplorerProjectSettingsAdjustCompact } from '../../composables/useExplorerProjectSettingsAdjustCompact'
import { useExplorerProjectSettingsIncludeCompact } from '../../composables/useExplorerProjectSettingsIncludeCompact'
import ExplorerModuleSelectOptionContent from './ExplorerModuleSelectOptionContent.vue'

/**
 * ExplorerProjectControls — project, language, REST API module, and opt-in filters.
 *
 * Presentational only; selection state is owned by the explorer page via `defineModel`.
 * Project and language resolve to a wiki instance id for bootstrap.
 *
 * **Disclosure:** Codex `CdxAccordion` (expanded by default). Collapsed title shows
 * Exploring / Project / API + audience chips; **Adjust selection** only expands
 * (hidden when open — Codex Accordion’s native action is icon-only and also shows
 * when open, so Adjust is a first-party progressive quiet control in the title
 * row that matches Figma’s labeled actionAlwaysVisible affordance).
 *
 * **Expanded body:** Two Codex `CdxField` **`is-fieldset`** groups (visually
 * hidden legends via `hide-label`) — Project|Language and API+Include — not
 * plain `div` wrappers. Nested controls remain ordinary `CdxField`s; Include
 * lives in the API field control slot (Combobox baseline).
 *
 * **Codex exception #14:** API to explore uses a custom `CdxCombobox` `#menu-item`
 * slot so beta / internal audience markers render as **label-only** warning
 * `CdxInfoChip`s beside the module name (status icons hidden); version is
 * shown in parentheses. Combobox `selected` uses the human title string, not
 * discovery module names (for example `-`).
 *
 * **Codex exception #16:** Include `CdxMenuButton` menu width pinned to
 * Codex **`16rem`** so Floating UI `useAvailableWidth` cannot squeeze it to
 * **8rem** beside the Accordion inline-end.
 * See `ARCHITECTURE.md` → Codex exceptions #14 / #16.
 */
const props = defineProps<{
	isInstanceBootstrapping: boolean
	visibleModules: ExplorerBootstrapModule[]
	hasSelectableModules: boolean
	/** Display name of the loaded instance, used to label a transient non-curated option. */
	wikiDisplayName: string
	selectModule: (
		moduleName: string,
		options: { source: 'module-select' }
	) => boolean
}>()

const selectedWikiInstanceId = defineModel<string>( 'selectedWikiInstanceId', {
	required: true
} )

const isExpanded = defineModel<boolean>( 'isExpanded', {
	required: true
} )

const selectedModuleName = defineModel<string>( 'selectedModuleName', {
	required: true
} )

const includeBetaEndpoints = defineModel<boolean>( 'includeBetaEndpoints', {
	required: true
} )

const includeInternalEndpoints = defineModel<boolean>( 'includeInternalEndpoints', {
	required: true
} )

const { $bananaI18n } = useNuxtApp()
const {
	projectMenuItems,
	languageMenuItems,
	projectComboboxSelected,
	languageComboboxSelected,
	isLanguageSelectorDisabled
} = useExplorerProjectLanguagePicker( selectedWikiInstanceId, toRef( props, 'wikiDisplayName' ) )

const visibleModulesRef = toRef( props, 'visibleModules' )
const isModuleSelectDisabledRef = computed( () => {
	return props.isInstanceBootstrapping || !props.hasSelectableModules
} )

const {
	moduleMenuItems,
	moduleSelectMenuConfig,
	moduleSelectDefaultLabel,
	moduleSelectBetaChipLabel,
	moduleSelectInternalChipLabel,
	moduleSelectNoResultsLabel,
	resolveModuleSelectOptionDisplay,
	selectedModuleDisplay,
	selectedModuleValue,
	isModuleSelectDisabled,
	isModuleComboboxFiltering,
	onModuleComboboxInput,
	onModuleComboboxChange
} = useExplorerModuleSelect(
	visibleModulesRef,
	selectedModuleName,
	props.selectModule,
	isModuleSelectDisabledRef
)

const projectOrWikiLabel = computed( () => $bananaI18n( 'explorer-project-or-wiki-label' ) )
const languageLabel = computed( () => $bananaI18n( 'explorer-project-language-label' ) )
const apiLabel = computed( () => $bananaI18n( 'explorer-api-label' ) )
const projectFieldsetLabel = computed( () => {
	return $bananaI18n( 'explorer-project-settings-project-fieldset-label' )
} )
const apiFieldsetLabel = computed( () => {
	return $bananaI18n( 'explorer-project-settings-api-fieldset-label' )
} )
const settingsTitle = computed( () => $bananaI18n( 'explorer-project-settings-title' ) )
const settingsAdjustLabel = computed( () => $bananaI18n( 'explorer-project-settings-adjust' ) )
const exploringLabel = computed( () => {
	return $bananaI18n( 'explorer-project-settings-exploring-label' )
} )
const summaryProjectLabel = computed( () => {
	return $bananaI18n( 'explorer-project-settings-summary-project-label' )
} )
const summaryApiLabel = computed( () => {
	return $bananaI18n( 'explorer-project-settings-summary-api-label' )
} )
const includeTriggerLabel = computed( () => $bananaI18n( 'explorer-opt-in-label' ) )
const optInSettingsTriggerAriaLabel = computed( () => {
	return $bananaI18n( 'explorer-opt-in-settings-trigger-label' )
} )

const { optInMenuEntries, selectedOptInValues } = useExplorerOptInMenu(
	includeBetaEndpoints,
	includeInternalEndpoints
)

const isModuleComboboxFocused = ref( false )

/**
 * Whether the Combobox shows a closed rich label (value + audience chips)
 * instead of the native input text alone.
 */
const shouldShowModuleComboboxAudienceDisplay = computed( () => {
	return Boolean(
		selectedModuleDisplay.value
		&& !isModuleComboboxFiltering.value
		&& !isModuleComboboxFocused.value
		&& (
			selectedModuleDisplay.value.showBetaChip
			|| selectedModuleDisplay.value.showInternalChip
		)
	)
} )

/**
 * Selected API display string for the collapsed Accordion title (and measure).
 */
const collapsedApiDisplayValue = computed( () => {
	return selectedModuleDisplay.value?.value ?? moduleSelectDefaultLabel.value
} )

/**
 * Locale-aware fingerprint of the collapsed title used to remeasure Adjust compact.
 */
const collapsedTitleMeasureLabel = computed( () => {
	return [
		exploringLabel.value,
		summaryProjectLabel.value,
		props.wikiDisplayName,
		summaryApiLabel.value,
		collapsedApiDisplayValue.value,
		selectedModuleDisplay.value?.showBetaChip ? moduleSelectBetaChipLabel.value : '',
		selectedModuleDisplay.value?.showInternalChip ? moduleSelectInternalChipLabel.value : ''
	].join( ' ' )
} )

/**
 * Marks the API Combobox as focused so the rich closed display can hide.
 *
 * @returns Nothing.
 */
function onModuleComboboxFocus(): void {
	isModuleComboboxFocused.value = true
}

/**
 * Restores the rich closed display when the Combobox blurs.
 *
 * @returns Nothing.
 */
function onModuleComboboxBlur(): void {
	isModuleComboboxFocused.value = false
}

/**
 * Expands project settings without toggling closed (Adjust is expand-only).
 *
 * @returns Nothing.
 */
function onExpandSettings(): void {
	isExpanded.value = true
}

const accordionHostRef = useTemplateRef<HTMLElement>( 'accordionHostRef' )
const titleMeasureRef = useTemplateRef<HTMLElement>( 'titleMeasureRef' )
const adjustMeasureRef = useTemplateRef<HTMLElement>( 'adjustMeasureRef' )
const apiSettingsRef = useTemplateRef<HTMLElement>( 'apiSettingsRef' )
const includeMeasureRef = useTemplateRef<HTMLElement>( 'includeMeasureRef' )

/**
 * Accordion `<summary>` track used for Adjust compact fit (title + gap + button).
 */
const accordionSummaryRef = computed( (): HTMLElement | null => {
	return accordionHostRef.value?.querySelector<HTMLElement>(
		'.cdx-accordion > summary'
	) ?? null
} )

const { isAdjustIconOnly } = useExplorerProjectSettingsAdjustCompact(
	accordionSummaryRef,
	titleMeasureRef,
	adjustMeasureRef,
	isExpanded,
	collapsedTitleMeasureLabel,
	settingsAdjustLabel
)

const { isIncludeIconOnly } = useExplorerProjectSettingsIncludeCompact(
	apiSettingsRef,
	includeMeasureRef,
	isExpanded,
	includeTriggerLabel
)
</script>

<template>
	<section
		class="explorer-project-controls"
		:class="{ 'explorer-project-controls--expanded': isExpanded }"
	>
		<!--
			Intrinsic-width replicas for Adjust / Include compact-fit measurement.
			Hidden fixed hosts stay independent of live flex layout.
		-->
		<span
			ref="titleMeasureRef"
			class="explorer-project-controls__title-measure"
			aria-hidden="true"
		>
			<span class="explorer-project-controls__collapsed-title">
				<span class="explorer-project-controls__collapsed-title-exploring">
					{{ exploringLabel }}
				</span>
				<span
					class="explorer-project-controls__collapsed-title-segment explorer-project-controls__collapsed-title-segment--project"
				>
					<strong>{{ summaryProjectLabel }}</strong>
					<bdi>{{ wikiDisplayName }}</bdi>
				</span>
				<span
					class="explorer-project-controls__collapsed-title-segment explorer-project-controls__collapsed-title-segment--api"
				>
					<strong>{{ summaryApiLabel }}</strong>
					<bdi>{{ collapsedApiDisplayValue }}</bdi>
					<CdxInfoChip
						v-if="selectedModuleDisplay?.showBetaChip"
						class="explorer-project-controls__summary-audience-chip"
						status="warning"
					>
						{{ moduleSelectBetaChipLabel }}
					</CdxInfoChip>
					<CdxInfoChip
						v-if="selectedModuleDisplay?.showInternalChip"
						class="explorer-project-controls__summary-audience-chip"
						status="warning"
					>
						{{ moduleSelectInternalChipLabel }}
					</CdxInfoChip>
				</span>
			</span>
		</span>
		<span
			ref="adjustMeasureRef"
			class="explorer-project-controls__adjust-measure"
			aria-hidden="true"
		>
			<CdxButton
				action="progressive"
				weight="quiet"
				size="small"
				type="button"
				tabindex="-1"
			>
				<CdxIcon
					:icon="cdxIconEdit"
					size="small"
				/>
				{{ settingsAdjustLabel }}
			</CdxButton>
		</span>
		<span
			ref="includeMeasureRef"
			class="explorer-project-controls__include-measure"
			aria-hidden="true"
		>
			<CdxButton
				action="default"
				weight="quiet"
				size="medium"
				type="button"
				tabindex="-1"
			>
				<CdxIcon :icon="cdxIconSettings" />
				{{ includeTriggerLabel }}
			</CdxButton>
		</span>

		<div
			ref="accordionHostRef"
			class="explorer-project-controls__accordion-host"
		>
			<CdxAccordion
				v-model="isExpanded"
				class="explorer-project-controls__accordion"
				separation="none"
				heading-level="h2"
			>
				<template #title>
					<span class="explorer-project-controls__accordion-title">
						<span
							v-if="isExpanded"
							class="explorer-project-controls__accordion-title-text"
						>
							{{ settingsTitle }}
						</span>
						<span
							v-else
							class="explorer-project-controls__collapsed-title"
						>
							<span class="explorer-project-controls__collapsed-title-exploring">
								{{ exploringLabel }}
							</span>
							<span
								class="explorer-project-controls__collapsed-title-segment explorer-project-controls__collapsed-title-segment--project"
							>
								<strong>{{ summaryProjectLabel }}</strong>
								<bdi>{{ wikiDisplayName }}</bdi>
							</span>
							<span
								class="explorer-project-controls__collapsed-title-segment explorer-project-controls__collapsed-title-segment--api"
							>
								<strong>{{ summaryApiLabel }}</strong>
								<template v-if="selectedModuleDisplay">
									<bdi>{{ selectedModuleDisplay.value }}</bdi>
									<CdxInfoChip
										v-if="selectedModuleDisplay.showBetaChip"
										class="explorer-project-controls__summary-audience-chip"
										status="warning"
									>
										{{ moduleSelectBetaChipLabel }}
									</CdxInfoChip>
									<CdxInfoChip
										v-if="selectedModuleDisplay.showInternalChip"
										class="explorer-project-controls__summary-audience-chip"
										status="warning"
									>
										{{ moduleSelectInternalChipLabel }}
									</CdxInfoChip>
								</template>
								<bdi v-else>{{ moduleSelectDefaultLabel }}</bdi>
							</span>
						</span>
						<!--
							Codex Accordion action is icon-only and also shows when open.
							Figma needs labeled Adjust only while collapsed; expand-only
							(click does not toggle closed). Button-in-summary is valid HTML
							and does not toggle `<details>` by itself.
						-->
						<CdxButton
							v-if="!isExpanded"
							class="explorer-project-controls__adjust"
							:class="{
								'explorer-project-controls__adjust--icon-only': isAdjustIconOnly
							}"
							action="progressive"
							weight="quiet"
							:size="isAdjustIconOnly ? 'medium' : 'small'"
							type="button"
							:aria-label="isAdjustIconOnly ? settingsAdjustLabel : undefined"
							@click.stop.prevent="onExpandSettings"
						>
							<CdxIcon
								v-if="isAdjustIconOnly"
								:icon="cdxIconEdit"
							/>
							<template v-else>
								<CdxIcon
									:icon="cdxIconEdit"
									size="small"
								/>
								{{ settingsAdjustLabel }}
							</template>
						</CdxButton>
					</span>
				</template>

				<div class="explorer-project-controls__fields">
					<!--
						Codex Fieldset (`CdxField is-fieldset`) — Figma Content
						2097:51526. Legends are visually hidden (`hide-label`);
						nested fields keep their own visible labels.
					-->
					<CdxField
						class="explorer-project-controls__fieldset explorer-project-controls__fieldset--project"
						is-fieldset
						hide-label
					>
						<template #label>
							{{ projectFieldsetLabel }}
						</template>
						<div class="explorer-project-controls__fieldset-controls">
							<CdxField class="explorer-project-controls__project-field">
								<template #label>
									{{ projectOrWikiLabel }}
								</template>
								<CdxCombobox
									v-model:selected="projectComboboxSelected"
									:menu-items="projectMenuItems"
									:disabled="isInstanceBootstrapping"
								/>
							</CdxField>

							<CdxField class="explorer-project-controls__language-field">
								<template #label>
									{{ languageLabel }}
								</template>
								<CdxCombobox
									v-model:selected="languageComboboxSelected"
									:menu-items="languageMenuItems"
									:disabled="isInstanceBootstrapping || isLanguageSelectorDisabled"
								/>
							</CdxField>
						</div>
					</CdxField>

					<CdxField
						class="explorer-project-controls__fieldset explorer-project-controls__fieldset--api"
						is-fieldset
						hide-label
					>
						<template #label>
							{{ apiFieldsetLabel }}
						</template>
						<!--
							Include lives in the API field’s control slot (not as a
							fieldset sibling) so it shares the Combobox baseline —
							fieldset siblings aligned to the whole Field sit beside
							the label. Compact + wrap still treat Combobox+Include
							as one unit via apiSettingsRef.
						-->
						<CdxField class="explorer-project-controls__module-field">
							<template #label>
								{{ apiLabel }}
							</template>
							<div
								ref="apiSettingsRef"
								class="explorer-project-controls__api-settings"
							>
								<div
									class="explorer-project-controls__module-combobox-shell"
									:class="{
										'explorer-project-controls__module-combobox-shell--audience-display':
											shouldShowModuleComboboxAudienceDisplay
									}"
								>
									<CdxCombobox
										v-model:selected="selectedModuleValue"
										class="explorer-project-controls__module-combobox"
										:menu-items="moduleMenuItems"
										:menu-config="moduleSelectMenuConfig"
										:placeholder="moduleSelectDefaultLabel"
										:disabled="isModuleSelectDisabled"
										dir="auto"
										@input="onModuleComboboxInput"
										@change="onModuleComboboxChange"
										@focus="onModuleComboboxFocus"
										@blur="onModuleComboboxBlur"
									>
										<template #menu-item="{ menuItem }">
											<template
												v-for="resolvedMenuItem in [ resolveModuleSelectOptionDisplay(
													menuItem
												) ]"
												:key="resolvedMenuItem?.value ?? 'module-select-empty'"
											>
												<ExplorerModuleSelectOptionContent
													v-if="resolvedMenuItem"
													:menu-item="resolvedMenuItem"
													:beta-chip-label="moduleSelectBetaChipLabel"
													:internal-chip-label="moduleSelectInternalChipLabel"
												/>
											</template>
										</template>
										<template #no-results>
											{{ moduleSelectNoResultsLabel }}
										</template>
									</CdxCombobox>
									<div
										v-if="shouldShowModuleComboboxAudienceDisplay && selectedModuleDisplay"
										class="explorer-project-controls__module-combobox-audience"
										aria-hidden="true"
									>
										<span class="explorer-project-controls__module-combobox-audience-value">
											<bdi>{{ selectedModuleDisplay.value }}</bdi>
										</span>
										<CdxInfoChip
											v-if="selectedModuleDisplay.showBetaChip"
											class="explorer-project-controls__module-combobox-audience-chip"
											status="warning"
										>
											{{ moduleSelectBetaChipLabel }}
										</CdxInfoChip>
										<CdxInfoChip
											v-if="selectedModuleDisplay.showInternalChip"
											class="explorer-project-controls__module-combobox-audience-chip"
											status="warning"
										>
											{{ moduleSelectInternalChipLabel }}
										</CdxInfoChip>
									</div>
								</div>

								<CdxMenuButton
									v-model:selected="selectedOptInValues"
									class="explorer-project-controls__opt-in-settings-trigger"
									:class="{
										'explorer-project-controls__opt-in-settings-trigger--icon-only':
											isIncludeIconOnly
									}"
									action="default"
									weight="quiet"
									:menu-items="optInMenuEntries"
									:disabled="isInstanceBootstrapping"
									:aria-label="optInSettingsTriggerAriaLabel"
								>
									<CdxIcon :icon="cdxIconSettings" />
									<span
										v-if="!isIncludeIconOnly"
										class="explorer-project-controls__opt-in-settings-trigger-label"
									>
										{{ includeTriggerLabel }}
									</span>
								</CdxMenuButton>
							</div>
						</CdxField>
					</CdxField>
				</div>
			</CdxAccordion>
		</div>
	</section>
</template>

<style scoped>
/*
 * Surface chrome wraps the Accordion. Do not put hover styles on this section —
 * Codex Accordion owns summary hover (`summary:hover` interactive-subtle).
 * Padding lives on Accordion summary (Codex default) + content inset below so
 * the hover target is the Accordion header, not the whole card.
 */
.explorer-project-controls {
	inline-size: 100%;
	min-inline-size: 0;
	box-sizing: border-box;
	border-radius: var( --fd-explorer-controls-surface-border-radius );
	background-color: var( --fd-explorer-controls-surface-background-color );
}

.explorer-project-controls__accordion-host {
	inline-size: 100%;
	min-inline-size: 0;
}

.explorer-project-controls__accordion {
	margin: 0;
	/* Allow Include MenuButton (Floating UI) to escape Accordion’s default clip. */
	overflow: visible;
}

.explorer-project-controls__accordion :deep( .cdx-accordion__header ) {
	font-weight: var( --font-weight-normal );
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	color: var( --color-base );
	min-inline-size: 0;
}

.explorer-project-controls__accordion :deep( .cdx-accordion__header__title ) {
	display: block;
	min-inline-size: 0;
}

/*
 * Keep Codex summary padding / hover chrome. Only tighten content inset so
 * fields align with the title text inside the default summary padding.
 */
.explorer-project-controls__accordion :deep( .cdx-accordion__content ) {
	padding-block-start: var( --spacing-100 );
	padding-block-end: var( --spacing-75 );
	padding-inline: var( --spacing-75 );
}

.explorer-project-controls__accordion-title {
	display: flex;
	/* Keep Adjust on the first line when the collapsed title wraps. */
	align-items: flex-start;
	/* Keep in sync with EXPLORER_PROJECT_SETTINGS_HEADER_TITLE_BUTTON_MIN_GAP_PX. */
	gap: var( --spacing-100 );
	inline-size: 100%;
	min-inline-size: 0;
}

.explorer-project-controls__accordion-title-text {
	flex: 1 1 auto;
	min-inline-size: 0;
	font-weight: var( --font-weight-normal );
}

.explorer-project-controls__collapsed-title {
	display: flex;
	flex: 1 1 auto;
	flex-wrap: wrap;
	align-items: center;
	/* 8px between Exploring / Project / API segments (and chips). */
	column-gap: var( --spacing-50 );
	row-gap: var( --spacing-50 );
	min-inline-size: 0;
	font-weight: var( --font-weight-normal );
}

.explorer-project-controls__collapsed-title-exploring {
	flex-shrink: 0;
}

.explorer-project-controls__collapsed-title-segment {
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-25 );
	min-inline-size: 0;
}

.explorer-project-controls__collapsed-title-segment strong {
	flex-shrink: 0;
	font-weight: var( --font-weight-bold );
}

/*
 * Prefer wrapping the Project name before breaking the API value. Project
 * takes remaining space and may wrap; API stays a nowrap unit (moves to the
 * next line as a whole; ellipsis only if that line is still too narrow).
 */
.explorer-project-controls__collapsed-title-segment--project {
	flex: 1 1 auto;
	flex-wrap: wrap;
	min-inline-size: 0;
}

.explorer-project-controls__collapsed-title-segment--project bdi {
	min-inline-size: 0;
	overflow-wrap: anywhere;
}

.explorer-project-controls__collapsed-title-segment--api {
	flex: 0 0 auto;
	flex-wrap: nowrap;
	min-inline-size: 0;
	max-inline-size: 100%;
}

.explorer-project-controls__collapsed-title-segment--api bdi {
	overflow: hidden;
	max-inline-size: 100%;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.explorer-project-controls__summary-audience-chip {
	flex-shrink: 0;
}

/*
 * Codex forces warning-chip icons even when no icon is supplied. Project-setting
 * audience chips are labels only, matching the API Select audience-chip exception.
 */
.explorer-project-controls__summary-audience-chip :deep( .cdx-info-chip__icon--vue ) {
	display: none;
}

.explorer-project-controls__adjust {
	flex-shrink: 0;
	align-self: flex-start;
	margin-inline-start: auto;
}

/*
 * Labeled Adjust uses Codex’s 14px minimum small-icon token inside the native
 * 24px small Button. Icon-only Adjust uses medium Button + default icon size.
 */
.explorer-project-controls__adjust:not( .explorer-project-controls__adjust--icon-only )
	:deep( .cdx-icon--small ) {
	inline-size: var( --min-size-icon-small );
	min-inline-size: var( --min-size-icon-small );
	block-size: var( --min-size-icon-small );
	min-block-size: var( --min-size-icon-small );
}

/*
 * Intrinsic measure hosts — fixed + max-content so widths stay independent of
 * the live flex title / toggle (including after icon-only expands the title).
 */
.explorer-project-controls__title-measure,
.explorer-project-controls__adjust-measure,
.explorer-project-controls__include-measure {
	position: fixed;
	visibility: hidden;
	pointer-events: none;
	inset-block-start: 0;
	inset-inline-start: 0;
	inline-size: max-content;
	max-inline-size: none;
	white-space: nowrap;
}

.explorer-project-controls__title-measure {
	margin: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	font-weight: var( --font-weight-normal );
}

.explorer-project-controls__fields {
	display: flex;
	flex-wrap: wrap;
	column-gap: var( --spacing-100 );
	row-gap: var( --spacing-100 );
	inline-size: 100%;
	min-inline-size: 0;
}

/*
 * Two Codex `CdxField is-fieldset` groups on the outer row. Wrap the API
 * fieldset before Include overflows the Accordion — never force max-content
 * past the parent. Project min = two 256px fields + 16px gap; API min =
 * Combobox 256px + gap + icon-only Include (labeled Include compact first).
 */
.explorer-project-controls__fieldset {
	box-sizing: border-box;
	margin-block-start: 0;
	max-inline-size: 100%;
}

.explorer-project-controls__fieldset--project {
	flex: 1 1 calc( ( 2 * var( --size-1600 ) ) + var( --spacing-100 ) );
	min-inline-size: min(
		100%,
		calc( ( 2 * var( --size-1600 ) ) + var( --spacing-100 ) )
	);
}

.explorer-project-controls__fieldset--api {
	/*
	 * `min-inline-size: 0` overrides the flex item’s content-based automatic
	 * minimum so Combobox+Include cannot blow past the Accordion. Wrap basis
	 * still prefers Combobox min + gap + icon-only Include.
	 */
	flex: 1 1 calc( var( --size-1600 ) + var( --spacing-100 ) + var( --size-200 ) );
	min-inline-size: 0;
	max-inline-size: 100%;
}

.explorer-project-controls__fieldset-controls {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-end;
	column-gap: var( --spacing-100 );
	row-gap: var( --spacing-100 );
	inline-size: 100%;
	min-inline-size: 0;
}

.explorer-project-controls__project-field,
.explorer-project-controls__language-field {
	flex: 1 1 var( --size-1600 );
	min-inline-size: var( --size-1600 );
	max-inline-size: var( --size-4000 );
	margin-block-start: 0;
}

.explorer-project-controls__module-field {
	inline-size: 100%;
	max-inline-size: 100%;
	min-inline-size: 0;
	margin-block-start: 0;
}

.explorer-project-controls__project-field :deep( .cdx-combobox ),
.explorer-project-controls__project-field :deep( .cdx-text-input ),
.explorer-project-controls__language-field :deep( .cdx-combobox ),
.explorer-project-controls__language-field :deep( .cdx-text-input ),
.explorer-project-controls__module-field :deep( .cdx-combobox ),
.explorer-project-controls__module-field :deep( .cdx-text-input ),
.explorer-project-controls__module-combobox {
	inline-size: 100%;
	max-inline-size: 100%;
	min-inline-size: 0;
}

.explorer-project-controls__api-settings {
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	/* Keep in sync with EXPLORER_PROJECT_SETTINGS_HEADER_TITLE_BUTTON_MIN_GAP_PX. */
	gap: var( --spacing-100 );
	inline-size: 100%;
	min-inline-size: 0;
}

.explorer-project-controls__module-combobox-shell {
	position: relative;
	flex: 1 1 var( --size-1600 );
	/*
	 * Prefer 256px via flex-basis; allow shrink so labeled Include can compact
	 * (and icon-only Include can still fit) instead of overflowing the Accordion.
	 * Keep in sync with EXPLORER_MODULE_COMBOBOX_MIN_INLINE_SIZE_PX.
	 */
	min-inline-size: 0;
	max-inline-size: var( --size-4000 );
}

.explorer-project-controls__module-combobox {
	inline-size: 100%;
	min-inline-size: 0;
	max-inline-size: none;
}

/*
 * Closed Combobox display: mirror the selected value + audience chips inside the
 * input chrome (before the expand button). Native input text is transparent so
 * the mirror sits “next to” the value; focus / filter restores the real input.
 */
.explorer-project-controls__module-combobox-shell--audience-display :deep(
	.cdx-combobox__input .cdx-text-input__input
) {
	color: transparent;
	caret-color: var( --color-base );
}

.explorer-project-controls__module-combobox-audience {
	position: absolute;
	inset-block: 0;
	inset-inline-start: 0;
	/* Leave the Codex expand control clickable. */
	inset-inline-end: var( --size-200 );
	z-index: 1;
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	column-gap: var( --spacing-50 );
	padding-inline: var( --spacing-50 );
	overflow: hidden;
	pointer-events: none;
}

.explorer-project-controls__module-combobox-audience-value {
	overflow: hidden;
	font: inherit;
	line-height: var( --line-height-medium );
	color: var( --color-base );
	text-overflow: ellipsis;
	white-space: nowrap;
}

.explorer-project-controls__module-combobox-audience-chip {
	flex-shrink: 0;
}

.explorer-project-controls__module-combobox-audience-chip :deep( .cdx-info-chip__icon--vue ) {
	display: none;
}

.explorer-project-controls__opt-in-settings-trigger {
	display: flex;
	flex-shrink: 0;
	align-self: center;
}

.explorer-project-controls__opt-in-settings-trigger:not(
	.explorer-project-controls__opt-in-settings-trigger--icon-only
) :deep( .cdx-button ) {
	font-weight: var( --font-weight-bold );
}

.explorer-project-controls__opt-in-settings-trigger-label {
	margin-inline-start: var( --spacing-25 );
}

/*
 * Codex exception #16 — Include MenuButton menu width.
 * Codex MenuButton sets Floating UI width to available viewport space
 * (`useAvailableWidth`). Beside the Accordion inline-end that can squeeze the
 * menu to the stylesheet floor (8rem) and wrap long opt-in descriptions.
 * Pin to Codex’s own max (16rem) so the menu stays readable.
 * See ARCHITECTURE.md → Codex exception #16 / AGENTS.md rule 8.
 */
.explorer-project-controls__opt-in-settings-trigger :deep( .cdx-menu-button__menu ) {
	min-inline-size: 16rem;
	max-inline-size: 16rem;
	/* Beat Floating UI’s inline `width` when available space is narrower. */
	width: 16rem !important;
}

/*
 * Below ~528px the Project group is full-width but still under two-field min —
 * allow Project / Language to stack. Below ~304px relax API Combobox min so
 * Combobox + icon-only Include can share one row at 320px.
 */
@media screen and ( max-width: 527px ) {
	.explorer-project-controls__project-field,
	.explorer-project-controls__language-field {
		min-inline-size: 0;
		flex-basis: 100%;
	}
}

@media screen and ( max-width: 351px ) {
	.explorer-project-controls__fieldset--api,
	.explorer-project-controls__module-combobox-shell {
		min-inline-size: 0;
	}
}
</style>
