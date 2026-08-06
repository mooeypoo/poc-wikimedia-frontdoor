import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import {
	EXPLORER_PICKER_LANGUAGE_CODES,
	EXPLORER_PICKER_LANGUAGE_MESSAGE_KEYS,
	EXPLORER_PICKER_PROJECT_IDS,
	EXPLORER_PICKER_PROJECT_MESSAGE_KEYS,
	isExplorerProjectLanguageApplicable,
	isPickerRepresentableInstance,
	parseExplorerWikiInstanceSelection,
	resolveExplorerWikiInstanceId,
	type ExplorerPickerLanguageCode,
	type ExplorerPickerProjectId
} from '../../config/explorerProjectPicker'
import { isolatePickerLabel } from '../utils/bidiLabel'

export interface ExplorerPickerMenuItem {
	label: string
	value: string
}

/**
 * Builds project + language combobox state for the explorer project controls.
 *
 * Combobox `selected` values use translated labels; the explorer continues to
 * store a single wiki instance id via {@link useDirection}.
 *
 * @param selectedWikiInstanceId - Reactive wiki instance id from {@link useDirection}.
 * @param instanceDisplayName - Reactive display name of the loaded instance (from
 *   bootstrap), used to label the injected transient option for a non-curated,
 *   deep-linked instance the project/language comboboxes cannot represent.
 * @returns Menu items, combobox bridges, and language disable state.
 */
export function useExplorerProjectLanguagePicker(
	selectedWikiInstanceId: Ref<string>,
	instanceDisplayName: Ref<string> = ref( '' )
): {
	projectMenuItems: ComputedRef<ExplorerPickerMenuItem[]>
	languageMenuItems: ComputedRef<ExplorerPickerMenuItem[]>
	projectComboboxSelected: WritableComputedRef<string>
	languageComboboxSelected: WritableComputedRef<string>
	isLanguageSelectorDisabled: ComputedRef<boolean>
} {
	const { $bananaI18n } = useNuxtApp()

	const initialSelection = parseExplorerWikiInstanceSelection( selectedWikiInstanceId.value )
	const selectedProjectId = ref<ExplorerPickerProjectId>( initialSelection.projectId )
	const selectedLanguageCode = ref<ExplorerPickerLanguageCode>( initialSelection.languageCode )

	// A deep-linked, non-curated instance the project/language comboboxes cannot
	// represent (ADR §5). It is surfaced as an injected, selected project option
	// labelled with the wiki's display name rather than the wrong Wikipedia/English
	// default. Falls back to the raw id until the display name arrives from bootstrap.
	const isTransientInstance = computed( () => !isPickerRepresentableInstance( selectedWikiInstanceId.value ) )
	const transientProjectLabel = computed( () => instanceDisplayName.value || selectedWikiInstanceId.value )

	/**
	 * Resolves the banana label for a project id.
	 *
	 * @param projectId - Explorer project id.
	 * @returns Translated project label.
	 */
	function projectLabelForId( projectId: ExplorerPickerProjectId ): string {
		return $bananaI18n( EXPLORER_PICKER_PROJECT_MESSAGE_KEYS[ projectId ] )
	}

	/**
	 * Resolves the banana label for a language code.
	 *
	 * @param languageCode - Explorer language code.
	 * @returns Translated language label.
	 */
	function languageLabelForCode( languageCode: ExplorerPickerLanguageCode ): string {
		return $bananaI18n( EXPLORER_PICKER_LANGUAGE_MESSAGE_KEYS[ languageCode ] )
	}

	const projectMenuItems = computed<ExplorerPickerMenuItem[]>( () => {
		const curatedItems = EXPLORER_PICKER_PROJECT_IDS.map( ( projectId ) => {
			const label = projectLabelForId( projectId )
			return {
				value: label,
				label: isolatePickerLabel( label )
			}
		} )

		if ( isTransientInstance.value ) {
			const transientLabel = transientProjectLabel.value
			return [
				{ value: transientLabel, label: isolatePickerLabel( transientLabel ) },
				...curatedItems
			]
		}

		return curatedItems
	} )

	const languageMenuItems = computed<ExplorerPickerMenuItem[]>( () => {
		return EXPLORER_PICKER_LANGUAGE_CODES.map( ( languageCode ) => {
			const label = languageLabelForCode( languageCode )
			return {
				value: label,
				label: isolatePickerLabel( label )
			}
		} )
	} )

	const projectComboboxSelected = computed( {
		get(): string {
			return isTransientInstance.value
				? transientProjectLabel.value
				: projectLabelForId( selectedProjectId.value )
		},
		set( nextSelectedLabel: string ) {
			// Re-selecting the injected transient option keeps the current instance.
			if ( isTransientInstance.value && nextSelectedLabel === transientProjectLabel.value ) {
				return
			}

			const matchingProjectId = EXPLORER_PICKER_PROJECT_IDS.find( ( projectId ) => {
				return projectLabelForId( projectId ) === nextSelectedLabel
			} )

			if ( !matchingProjectId ) {
				return
			}

			selectedProjectId.value = matchingProjectId
			// Apply the instance directly so leaving a transient instance switches even
			// when selectedProjectId is unchanged (the project→instance watch below only
			// fires on a change, and a transient instance parses to the Wikipedia default).
			const nextWikiInstanceId = resolveExplorerWikiInstanceId( matchingProjectId, selectedLanguageCode.value )
			if ( selectedWikiInstanceId.value !== nextWikiInstanceId ) {
				selectedWikiInstanceId.value = nextWikiInstanceId
			}
		}
	} )

	const languageComboboxSelected = computed( {
		get(): string {
			// A transient instance's language is not one of the curated codes; show
			// nothing rather than a misleading default (the selector is disabled).
			return isTransientInstance.value ? '' : languageLabelForCode( selectedLanguageCode.value )
		},
		set( nextSelectedLabel: string ) {
			const matchingLanguageCode = EXPLORER_PICKER_LANGUAGE_CODES.find( ( languageCode ) => {
				return languageLabelForCode( languageCode ) === nextSelectedLabel
			} )

			if ( matchingLanguageCode ) {
				selectedLanguageCode.value = matchingLanguageCode
			}
		}
	} )

	const isLanguageSelectorDisabled = computed( () => {
		return isTransientInstance.value || !isExplorerProjectLanguageApplicable( selectedProjectId.value )
	} )

	watch(
		[ selectedProjectId, selectedLanguageCode ],
		( [ projectId, languageCode ] ) => {
			const nextWikiInstanceId = resolveExplorerWikiInstanceId( projectId, languageCode )

			if ( selectedWikiInstanceId.value !== nextWikiInstanceId ) {
				selectedWikiInstanceId.value = nextWikiInstanceId
			}
		}
	)

	watch( selectedWikiInstanceId, ( wikiInstanceId ) => {
		// A transient (non-curated) instance has no faithful project/language mapping;
		// leave the combobox state as-is so the injected transient option stays shown.
		if ( !isPickerRepresentableInstance( wikiInstanceId ) ) {
			return
		}

		const parsedSelection = parseExplorerWikiInstanceSelection( wikiInstanceId )

		if ( selectedProjectId.value !== parsedSelection.projectId ) {
			selectedProjectId.value = parsedSelection.projectId
		}

		if ( selectedLanguageCode.value !== parsedSelection.languageCode ) {
			selectedLanguageCode.value = parsedSelection.languageCode
		}
	} )

	return {
		projectMenuItems,
		languageMenuItems,
		projectComboboxSelected,
		languageComboboxSelected,
		isLanguageSelectorDisabled
	}
}
