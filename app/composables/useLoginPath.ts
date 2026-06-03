import { LOGIN_PAGE_PATH } from '../../config/auth'

/** Default locale; must match `defaultLocale` in `nuxt.config.ts` (`prefix_except_default`). */
const DEFAULT_CONTENT_LOCALE = 'en'

/**
 * Resolves the locale-aware path to the developer login page.
 *
 * Uses the same `prefix_except_default` convention as content routes so the
 * login page stays aligned with the active interface locale.
 *
 * @returns {{ loginPath: import('vue').ComputedRef<string> }} Localized login route path.
 */
export function useLoginPath() {
	const { $interfaceLocale } = useNuxtApp()

	const loginPath = computed( () => {
		const localeCode = $interfaceLocale.value

		return localeCode === DEFAULT_CONTENT_LOCALE
			? LOGIN_PAGE_PATH
			: `/${ localeCode }${ LOGIN_PAGE_PATH }`
	} )

	return {
		loginPath
	}
}
