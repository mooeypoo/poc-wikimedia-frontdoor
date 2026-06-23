import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import {
	EXPLORER_PICKER_LANGUAGE_CODES,
	EXPLORER_PICKER_LANGUAGE_MESSAGE_KEYS,
	EXPLORER_PICKER_PROJECT_IDS,
	EXPLORER_PICKER_PROJECT_MESSAGE_KEYS,
	isExplorerProjectLanguageApplicable,
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
 * @returns Menu items, combobox bridges, and language disable state.
 */
export function useExplorerProjectLanguagePicker( selectedWikiInstanceId: Ref<string> ): {
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
		return EXPLORER_PICKER_PROJECT_IDS.map( ( projectId ) => {
			const label = projectLabelForId( projectId )
			return {
				value: label,
				label: isolatePickerLabel( label )
			}
		} )
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
			return projectLabelForId( selectedProjectId.value )
		},
		set( nextSelectedLabel: string ) {
			const matchingProjectId = EXPLORER_PICKER_PROJECT_IDS.find( ( projectId ) => {
				return projectLabelForId( projectId ) === nextSelectedLabel
			} )

			if ( matchingProjectId ) {
				selectedProjectId.value = matchingProjectId
			}
		}
	} )

	const languageComboboxSelected = computed( {
		get(): string {
			return languageLabelForCode( selectedLanguageCode.value )
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
		return !isExplorerProjectLanguageApplicable( selectedProjectId.value )
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
