import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { computed, inject, provide } from 'vue'
import { localeFromContentPath } from './contentLocalePaths'

/**
 * Locale a content page actually resolved to after locale-chain fallback
 * (`resolveContentLocaleChain` in `contentLocalePaths.ts`), as opposed to the
 * reader's interface locale from `useI18n()`. A relative `::include` needs
 * this one: if the interface locale is `fr` but the page fell back to `en`,
 * the included partial lives under `content/en/`, not `content/fr/`.
 */
const RESOLVED_CONTENT_LOCALE_KEY: InjectionKey<ComputedRef<string>> = Symbol( 'resolved-content-locale' )

/**
 * Makes the current page's resolved content locale available to descendants
 * (`Include.vue`, reached through `ContentRenderer`'s render tree).
 *
 * @param resolvedLocale - The page's actual resolved locale.
 */
export function provideResolvedContentLocale( resolvedLocale: ComputedRef<string> ): void {
	provide( RESOLVED_CONTENT_LOCALE_KEY, resolvedLocale )
}

/**
 * Reads the resolved content locale provided by the current page, if any.
 *
 * @returns The page's resolved locale, or `undefined` outside a page that provides one.
 */
export function injectResolvedContentLocale(): ComputedRef<string> | undefined {
	return inject( RESOLVED_CONTENT_LOCALE_KEY )
}

/**
 * Reads the resolved locale off a fetched page's own `path` field and
 * provides it, falling back to the interface locale for an unresolved page or
 * one whose `path` is missing (both belong to the 404 branch each page
 * component already throws on before rendering `ContentRenderer`).
 *
 * @param page - The `useAsyncData` ref wrapping `useLocalizedContentPage`.
 * @param interfaceLocaleCode - The reader's interface locale, from `useI18n()`.
 */
export function provideResolvedContentLocaleFromPage(
	page: Ref<Record<string, unknown> | null | undefined>,
	interfaceLocaleCode: Ref<string>
): void {
	provideResolvedContentLocale( computed( () => {
		const path = page.value?.path
		return typeof path === 'string' ? localeFromContentPath( path, interfaceLocaleCode.value ) : interfaceLocaleCode.value
	} ) )
}
