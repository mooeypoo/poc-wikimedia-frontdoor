<script setup lang="ts">
import {
	CdxButton,
	CdxCombobox,
	CdxField,
	CdxIcon,
	CdxInfoChip,
	CdxMenuButton
} from '@wikimedia/codex'
import { cdxIconClose, cdxIconEdit, cdxIconSettings } from '@wikimedia/codex-icons'
import type { ExplorerBootstrapModule } from '../../composables/useExplorerBootstrap'
import { useExplorerModuleSelect } from '../../composables/useExplorerModuleSelect'
import { useExplorerOptInMenu } from '../../composables/useExplorerOptInMenu'
import { useExplorerProjectLanguagePicker } from '../../composables/useExplorerProjectLanguagePicker'
import ExplorerModuleSelectOptionContent from './ExplorerModuleSelectOptionContent.vue'

/**
 * ExplorerProjectControls — project, language, REST API module, and opt-in filters.
 *
 * Presentational only; selection state is owned by the explorer page via `defineModel`.
 * Project and language resolve to a wiki instance id for bootstrap.
 *
 * **Codex exception #14:** API to explore uses a custom `CdxCombobox` `#menu-item`
 * slot so beta / internal audience markers render as **label-only** warning
 * `CdxInfoChip`s beside the module name (status icons hidden); version is
 * shown in parentheses. Combobox `selected` uses the human title string, not
 * discovery module names (for example `-`).
 * See `ARCHITECTURE.md` → Codex exceptions #14.
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
const settingsTitle = computed( () => $bananaI18n( 'explorer-project-settings-title' ) )
const settingsAdjustLabel = computed( () => $bananaI18n( 'explorer-project-settings-adjust' ) )
const settingsCloseLabel = computed( () => $bananaI18n( 'explorer-project-settings-close' ) )
const summaryProjectLabel = computed( () => {
	return $bananaI18n( 'explorer-project-settings-summary-project-label' )
} )
const summaryApiLabel = computed( () => {
	return $bananaI18n( 'explorer-project-settings-summary-api-label' )
} )
const optInSettingsTriggerLabel = computed( () => {
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
 * Expands the project settings surface.
 *
 * @returns Nothing.
 */
function onExpandSettings(): void {
	isExpanded.value = true
}

/**
 * Collapses project settings.
 *
 * @returns Nothing.
 */
function onCollapseSettings(): void {
	isExpanded.value = false
}
</script>

<template>
	<section
		class="explorer-project-controls"
		:class="{ 'explorer-project-controls--expanded': isExpanded }"
	>
		<template v-if="!isExpanded">
			<div class="explorer-project-controls__summary">
				<div class="explorer-project-controls__summary-item">
					<strong>{{ summaryProjectLabel }}</strong>
					<bdi>{{ wikiDisplayName }}</bdi>
				</div>
				<div class="explorer-project-controls__summary-item">
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
				</div>
			</div>
			<CdxButton
				class="explorer-project-controls__toggle"
				action="progressive"
				weight="quiet"
				size="small"
				type="button"
				@click="onExpandSettings"
			>
				<CdxIcon
					:icon="cdxIconEdit"
					size="small"
				/>
				{{ settingsAdjustLabel }}
			</CdxButton>
		</template>

		<template v-else>
			<div class="explorer-project-controls__header">
				<h2 class="explorer-project-controls__title">
					{{ settingsTitle }}
				</h2>
				<CdxButton
					class="explorer-project-controls__toggle"
					action="progressive"
					weight="quiet"
					size="small"
					type="button"
					@click="onCollapseSettings"
				>
					<CdxIcon
						:icon="cdxIconClose"
						size="small"
					/>
					{{ settingsCloseLabel }}
				</CdxButton>
			</div>

			<div class="explorer-project-controls__fields">
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

				<CdxField class="explorer-project-controls__module-field">
					<template #label>
						{{ apiLabel }}
					</template>
					<div class="explorer-project-controls__api-settings">
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
							action="default"
							weight="quiet"
							:menu-items="optInMenuEntries"
							:disabled="isInstanceBootstrapping"
							:aria-label="optInSettingsTriggerLabel"
						>
							<CdxIcon :icon="cdxIconSettings" />
						</CdxMenuButton>
					</div>
				</CdxField>
			</div>
		</template>
	</section>
</template>

<style scoped>
.explorer-project-controls {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-100 );
	padding: var( --spacing-75 );
	inline-size: 100%;
	box-sizing: border-box;
	border-radius: var( --fd-explorer-controls-surface-border-radius );
	background-color: var( --fd-explorer-controls-surface-background-color );
	min-inline-size: 0;
}

.explorer-project-controls:not( .explorer-project-controls--expanded ) {
	flex-wrap: nowrap;
	align-items: flex-start;
}

.explorer-project-controls--expanded {
	flex-direction: column;
	flex-wrap: nowrap;
	align-items: stretch;
}

.explorer-project-controls__summary {
	display: flex;
	flex: 1 1 30rem;
	flex-wrap: wrap;
	align-items: center;
	column-gap: var( --spacing-150 );
	row-gap: var( --spacing-50 );
	min-inline-size: 0;
}

.explorer-project-controls__summary-item {
	display: inline-flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.explorer-project-controls__summary-item strong {
	font-weight: var( --font-weight-bold );
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

.explorer-project-controls__toggle {
	flex-shrink: 0;
	margin-inline-start: auto;
}

/*
 * The compact Figma controls use Codex's 14px minimum small-icon token inside
 * the native 24px small Button.
 */
.explorer-project-controls__toggle :deep( .cdx-icon--small ) {
	inline-size: var( --min-size-icon-small );
	min-inline-size: var( --min-size-icon-small );
	block-size: var( --min-size-icon-small );
	min-block-size: var( --min-size-icon-small );
}

.explorer-project-controls__header {
	display: flex;
	align-items: center;
	gap: var( --spacing-100 );
	inline-size: 100%;
	min-inline-size: 0;
}

.explorer-project-controls__title {
	margin: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-medium );
	font-weight: var( --font-weight-bold );
}

.explorer-project-controls__fields {
	display: flex;
	flex-wrap: wrap;
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
	/*
	 * Reserve the API Combobox's 256px minimum plus its fixed 8px gap and
	 * 32px MenuButton. This keeps all three actual inputs equally flexible.
	 */
	flex: 1 1 calc( var( --size-1600 ) + var( --spacing-50 ) + var( --size-200 ) );
	min-inline-size: calc( var( --size-1600 ) + var( --spacing-50 ) + var( --size-200 ) );
	max-inline-size: calc( var( --size-4000 ) + var( --spacing-50 ) + var( --size-200 ) );
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
	align-items: flex-end;
	gap: var( --spacing-50 );
	min-inline-size: 0;
	inline-size: 100%;
}

.explorer-project-controls__module-combobox-shell {
	position: relative;
	flex: 1 1 var( --size-1600 );
	min-inline-size: var( --size-1600 );
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
	align-self: flex-end;
}

/*
 * At a 320px viewport, mobile page margins and surface padding leave 264px.
 * Let only the API Combobox relax below 256px so it can remain beside the
 * native 32px MenuButton with the fixed 8px gap.
 */
@media screen and ( max-width: 351px ) {
	.explorer-project-controls__module-field,
	.explorer-project-controls__module-combobox-shell,
	.explorer-project-controls__module-combobox {
		min-inline-size: 0;
	}
}
</style>
