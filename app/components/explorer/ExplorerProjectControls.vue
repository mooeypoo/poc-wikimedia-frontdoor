<script setup lang="ts">
import { CdxButton, CdxCheckbox, CdxCombobox, CdxField, CdxIcon, CdxPopover } from '@wikimedia/codex'
import { cdxIconInfo } from '@wikimedia/codex-icons'
import { useExplorerOptInCheckboxGroup } from '../../composables/useExplorerOptInCheckboxGroup'
import { useWikiInstancePicker } from '../../composables/useWikiInstancePicker'

/**
 * ExplorerProjectControls — wiki project combobox and opt-in filters for the explorer.
 *
 * Presentational only; selection state is owned by the explorer page via `defineModel`.
 */
defineProps<{
	isInstanceBootstrapping: boolean
}>()

const selectedWikiInstanceId = defineModel<string>( 'selectedWikiInstanceId', {
	required: true
} )

const includeBetaEndpoints = defineModel<boolean>( 'includeBetaEndpoints', {
	required: true
} )

const includeInternalEndpoints = defineModel<boolean>( 'includeInternalEndpoints', {
	required: true
} )

const { $bananaI18n } = useNuxtApp()
const { wikiInstanceMenuItems, wikiProjectComboboxSelected } = useWikiInstancePicker( selectedWikiInstanceId )

const wikiProjectLabel = computed( () => $bananaI18n( 'explorer-wiki-project-label' ) )
const wikiProjectDescription = computed( () => $bananaI18n( 'explorer-wiki-project-help' ) )
const optInLabel = computed( () => $bananaI18n( 'explorer-opt-in-label' ) )
const optInPopoverTitle = computed( () => $bananaI18n( 'explorer-opt-in-popover-title' ) )
const optInPopoverTriggerLabel = computed( () => $bananaI18n( 'explorer-opt-in-popover-trigger-label' ) )
const optInPopoverIntro = computed( () => $bananaI18n( 'explorer-opt-in-popover-intro' ) )
const optInPopoverBetaLabel = computed( () => $bananaI18n( 'explorer-opt-in-popover-beta-label' ) )
const optInPopoverBetaBody = computed( () => $bananaI18n( 'explorer-opt-in-popover-beta-body' ) )
const optInPopoverInternalLabel = computed( () => $bananaI18n( 'explorer-opt-in-popover-internal-label' ) )
const optInPopoverInternalBody = computed( () => $bananaI18n( 'explorer-opt-in-popover-internal-body' ) )

const { optInCheckboxOptions, selectedOptInValues } = useExplorerOptInCheckboxGroup(
	includeBetaEndpoints,
	includeInternalEndpoints
)

const optInPopoverTrigger = ref<InstanceType<typeof CdxButton> | undefined>()
const isOptInPopoverOpen = ref( false )

/**
 * Toggles the opt-in help popover open state from the quiet info trigger.
 *
 * @returns Nothing.
 */
function onOptInPopoverTriggerClick(): void {
	isOptInPopoverOpen.value = !isOptInPopoverOpen.value
}

</script>

<template>
	<section
		class="explorer-project-controls"
		aria-labelledby="explorer-project-controls-wiki-label"
	>
		<CdxField class="explorer-project-controls__wiki-field">
			<template #label>
				<span id="explorer-project-controls-wiki-label">
					{{ wikiProjectLabel }}
				</span>
			</template>
			<template #description>
				{{ wikiProjectDescription }}
			</template>
			<CdxCombobox
				v-model:selected="wikiProjectComboboxSelected"
				:menu-items="wikiInstanceMenuItems"
				:disabled="isInstanceBootstrapping"
			/>
		</CdxField>

		<CdxField
			class="explorer-project-controls__opt-in"
			:is-fieldset="true"
		>
			<template #label>
				<span class="explorer-project-controls__opt-in-label">
					{{ optInLabel }}
					<CdxButton
						ref="optInPopoverTrigger"
						class="explorer-project-controls__opt-in-info-trigger"
						weight="quiet"
						type="button"
						:aria-label="optInPopoverTriggerLabel"
						:aria-expanded="isOptInPopoverOpen"
						@click="onOptInPopoverTriggerClick"
					>
						<CdxIcon :icon="cdxIconInfo" />
					</CdxButton>
					<CdxPopover
						class="explorer-project-controls__opt-in-help-popover"
						v-model:open="isOptInPopoverOpen"
						:anchor="optInPopoverTrigger"
						:title="optInPopoverTitle"
						placement="bottom-start"
						:use-close-button="true"
					>
						<div class="explorer-project-controls__opt-in-popover">
							<p class="explorer-project-controls__opt-in-popover-intro">
								{{ optInPopoverIntro }}
							</p>
							<ul class="explorer-project-controls__opt-in-popover-list">
								<li>
									<strong class="explorer-project-controls__opt-in-popover-term">
										{{ optInPopoverBetaLabel }}
									</strong>
									{{ optInPopoverBetaBody }}
								</li>
								<li>
									<strong class="explorer-project-controls__opt-in-popover-term">
										{{ optInPopoverInternalLabel }}
									</strong>
									{{ optInPopoverInternalBody }}
								</li>
							</ul>
						</div>
					</CdxPopover>
				</span>
			</template>
			<CdxCheckbox
				v-for="optInOption in optInCheckboxOptions"
				:key="optInOption.value"
				v-model="selectedOptInValues"
				:input-value="optInOption.value"
				:disabled="isInstanceBootstrapping"
			>
				{{ optInOption.label }}
			</CdxCheckbox>
		</CdxField>
	</section>
</template>

<style scoped>
.explorer-project-controls {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	gap: var( --spacing-150 );
	padding: var( --spacing-75 );
	inline-size: 100%;
	box-sizing: border-box;
	border-radius: var( --border-radius-base );
	background-color: var( --background-color-neutral-subtle );
	min-inline-size: 0;
}

.explorer-project-controls__wiki-field {
	flex: 0 1 40rem;
	min-inline-size: 0;
	max-inline-size: min( 40rem, 100% );
}

.explorer-project-controls__wiki-field :deep( .cdx-combobox ),
.explorer-project-controls__wiki-field :deep( .cdx-text-input ) {
	inline-size: 100%;
	max-inline-size: 100%;
	min-inline-size: 0;
}

.explorer-project-controls__opt-in {
	flex: 0 1 auto;
	min-inline-size: 0;
	/* Codex fields default to margin-block-start: 16px; align with the wiki field row. */
	margin-block-start: 0;
}

.explorer-project-controls__opt-in-label {
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-25 );
}

.explorer-project-controls__opt-in-info-trigger {
	flex-shrink: 0;
}

.explorer-project-controls__opt-in-popover {
	font-weight: var( --font-weight-normal );
}

.explorer-project-controls__opt-in-popover-intro {
	margin: 0;
	font-weight: var( --font-weight-normal );
}

.explorer-project-controls__opt-in-popover-list {
	margin: var( --spacing-50 ) 0 0;
	padding-inline-start: var( --spacing-125 );
	font-weight: var( --font-weight-normal );
}

.explorer-project-controls__opt-in-popover-term {
	font-weight: var( --font-weight-bold );
}
</style>
