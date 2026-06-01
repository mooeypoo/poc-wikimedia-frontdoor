import { computed } from 'vue'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import { getWikiInstanceById, WIKI_INSTANCES } from '../../config/instances'
import { isolatePickerLabel } from '../utils/bidiLabel'

export interface WikiInstancePickerMenuItem {
	label: string
	value: string
}

/**
 * Builds wiki instance picker menu items and combobox selection state for Codex controls.
 *
 * Combobox `selected` uses display names while the explorer stores wiki instance ids.
 *
 * @param selectedWikiInstanceId - Reactive wiki instance id from {@link useDirection}.
 * @returns Menu items and combobox model bridge for the project controls.
 */
export function useWikiInstancePicker( selectedWikiInstanceId: Ref<string> ): {
	wikiInstanceMenuItems: ComputedRef<WikiInstancePickerMenuItem[]>
	wikiProjectComboboxSelected: WritableComputedRef<string>
} {
	const wikiInstanceMenuItems = computed<WikiInstancePickerMenuItem[]>( () => {
		return WIKI_INSTANCES.map( ( wikiInstance ) => ( {
			value: wikiInstance.displayName,
			label: isolatePickerLabel( wikiInstance.displayName )
		} ) )
	} )

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

	return {
		wikiInstanceMenuItems,
		wikiProjectComboboxSelected
	}
}
