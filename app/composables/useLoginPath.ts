import { LOGIN_PAGE_PATH } from '../../config/auth'
import { buildLocaleAwarePath } from '../utils/localeAwarePath'

/**
 * Resolves the locale-aware path to the developer login page.
 *
 * @returns {{ loginPath: import('vue').ComputedRef<string> }} Localized login route path.
 */
export function useLoginPath() {
	const { $interfaceLocale } = useNuxtApp()

	const loginPath = computed( () =>
		buildLocaleAwarePath( LOGIN_PAGE_PATH, $interfaceLocale.value )
	)

	return {
		loginPath
	}
}
