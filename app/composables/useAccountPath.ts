import { ACCOUNT_PAGE_PATH } from '../../config/auth'
import { buildLocaleAwarePath } from '../utils/localeAwarePath'

/**
 * Resolves the locale-aware path to the developer account dashboard.
 *
 * @returns {{ accountPath: import('vue').ComputedRef<string> }} Localized account route path.
 */
export function useAccountPath() {
	const { $interfaceLocale } = useNuxtApp()

	const accountPath = computed( () =>
		buildLocaleAwarePath( ACCOUNT_PAGE_PATH, $interfaceLocale.value )
	)

	return {
		accountPath
	}
}
