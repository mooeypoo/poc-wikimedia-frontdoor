import { computed } from 'vue'
import { getWikiInstanceById, WIKI_INSTANCES } from '../../config/instances'

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

	const direction = computed<'ltr' | 'rtl'>( () => {
		const selectedWikiInstance = getWikiInstanceById( selectedWikiInstanceId.value )
		return selectedWikiInstance?.dir ?? 'ltr'
	} )

	return {
		selectedWikiInstanceId,
		direction
	}
}
