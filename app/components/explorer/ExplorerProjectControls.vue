<script setup lang="ts">
import { CdxCheckbox, CdxCombobox, CdxField } from '@wikimedia/codex'
import { getWikiInstanceById, WIKI_INSTANCES } from '../../../config/instances'

interface PickerMenuItem {
	label: string
	value: string
}

/** Opt-in checkbox `input-value` for beta REST endpoints. */
const OPT_IN_VALUE_BETA_ENDPOINTS = 'beta-endpoints'

/** Opt-in checkbox `input-value` for internal REST endpoints. */
const OPT_IN_VALUE_INTERNAL_ENDPOINTS = 'internal-endpoints'

/**
 * ExplorerProjectControls — wiki project combobox and opt-in filters for the explorer.
 *
 * Sits below the page title in the main column, spanning the Scalar reference width.
 * Presentational only; the explorer page owns selection and filter state.
 */
defineProps<{
	wikiInstanceMenuItems: PickerMenuItem[]
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

const wikiProjectLabel = computed( () => $bananaI18n( 'explorer-wiki-project-label' ) )
const wikiProjectDescription = computed( () => $bananaI18n( 'explorer-wiki-project-help' ) )
const optInLabel = computed( () => $bananaI18n( 'explorer-opt-in-label' ) )
const betaEndpointsLabel = computed( () => $bananaI18n( 'explorer-opt-in-beta-endpoints' ) )
const internalEndpointsLabel = computed( () => $bananaI18n( 'explorer-opt-in-internal-endpoints' ) )

/**
 * Bridges wiki instance id state to Codex Combobox, which shows `selected` in the input.
 *
 * Menu item values are display names; the explorer page keeps the instance id.
 */
const wikiProjectComboboxSelected = computed( {
	get(): string {
		return getWikiInstanceById( selectedWikiInstanceId.value )?.displayName ?? ''
	},
	set( nextSelectedDisplayName: string ) {
		const matchingWikiInstance = WIKI_INSTANCES.find( ( wikiInstance ) => {
			return wikiInstance.displayName === nextSelectedDisplayName
		} )

		if ( matchingWikiInstance ) {
			selectedWikiInstanceId.value = matchingWikiInstance.id
		}
	}
} )

const optInCheckboxOptions = computed( () => [
	{
		value: OPT_IN_VALUE_BETA_ENDPOINTS,
		label: betaEndpointsLabel.value
	},
	{
		value: OPT_IN_VALUE_INTERNAL_ENDPOINTS,
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
			selectedValues.push( OPT_IN_VALUE_BETA_ENDPOINTS )
		}

		if ( includeInternalEndpoints.value ) {
			selectedValues.push( OPT_IN_VALUE_INTERNAL_ENDPOINTS )
		}

		return selectedValues
	},
	set( nextSelectedValues: string[] ) {
		includeBetaEndpoints.value = nextSelectedValues.includes( OPT_IN_VALUE_BETA_ENDPOINTS )
		includeInternalEndpoints.value = nextSelectedValues.includes( OPT_IN_VALUE_INTERNAL_ENDPOINTS )
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
