<script setup lang="ts">
import { CdxCheckbox, CdxCombobox, CdxField } from '@wikimedia/codex'
import {
	EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS,
	EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS
} from '../../../config/explorerOptIn'
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
const betaEndpointsLabel = computed( () => $bananaI18n( 'explorer-opt-in-beta-endpoints' ) )
const internalEndpointsLabel = computed( () => $bananaI18n( 'explorer-opt-in-internal-endpoints' ) )

const optInCheckboxOptions = computed( () => [
	{
		value: EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS,
		label: betaEndpointsLabel.value
	},
	{
		value: EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS,
		label: internalEndpointsLabel.value
	}
] )

/**
 * Bridges the explorer page’s boolean opt-in flags to Codex’s array-based checkbox group model.
 */
const selectedOptInValues = computed( {
	get(): string[] {
		const selectedValues: string[] = []

		if ( includeBetaEndpoints.value ) {
			selectedValues.push( EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS )
		}

		if ( includeInternalEndpoints.value ) {
			selectedValues.push( EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS )
		}

		return selectedValues
	},
	set( nextSelectedValues: string[] ) {
		includeBetaEndpoints.value = nextSelectedValues.includes( EXPLORER_OPT_IN_VALUE_BETA_ENDPOINTS )
		includeInternalEndpoints.value = nextSelectedValues.includes( EXPLORER_OPT_IN_VALUE_INTERNAL_ENDPOINTS )
	}
} )
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
				{{ optInLabel }}
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
</style>
