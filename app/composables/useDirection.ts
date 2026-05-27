import { computed } from 'vue'
import { getWikiInstanceById, WIKI_INSTANCES } from '../../config/instances'
import { getLanguageByCode } from '../../config/languages'

/**
 * Resolves shell direction from the selected wiki instance.
 *
 * @returns Reactive direction and selected wiki instance id state.
 */
export function useDirection() {
	const selectedWikiInstanceId = useState<string>(
		'selectedWikiInstanceId',
		() => WIKI_INSTANCES[ 0 ]?.id ?? 'enwiki'
	)
	const interfaceLocale = useState<string>( 'interfaceLocale', () => 'en' )

	const direction = computed<'ltr' | 'rtl'>( () => {
		const selectedInterfaceLanguage = getLanguageByCode( interfaceLocale.value )
		if ( selectedInterfaceLanguage ) {
			return selectedInterfaceLanguage.dir
		}

		const selectedWikiInstance = getWikiInstanceById( selectedWikiInstanceId.value )
		return selectedWikiInstance?.dir ?? 'ltr'
	} )

	return {
		selectedWikiInstanceId,
		direction
	}
}
